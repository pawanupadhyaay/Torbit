const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authenticateToken } = require("../middleware/authMiddleware");
const { sendOtpEmail, sendPasswordResetOtpEmail, sendCompanyRegistrationAckEmail, sendAdminCompanyApprovalAlertEmail } = require("../services/emailService");

const JWT_SECRET = process.env.JWT_SECRET || "torbit-realty-super-secret-key-2026";

// In-memory OTP Store: Map<email, { otp, expiresAt, createdAt, attempts, verified }>
const otpStore = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 0a. Send Verification OTP via Email (from torbitinsights@gmail.com)
router.post("/send-otp", async (req, res) => {
  try {
    const { email, fullName } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email is already registered
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists. Please login instead." });
    }

    // Rate limiter: 15s between OTP requests
    const existingOtp = otpStore.get(cleanEmail);
    if (existingOtp && Date.now() - existingOtp.createdAt < 15000) {
      return res.status(429).json({ error: "Please wait 15 seconds before requesting another code." });
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanEmail, {
      otp,
      expiresAt,
      createdAt: Date.now(),
      attempts: 0,
      verified: false
    });

    sendOtpEmail(cleanEmail, otp, fullName || "Candidate")
      .then(() => console.log(`✉️ [OTP SENT] Sent verification code to ${cleanEmail}`))
      .catch((mailErr) => console.error("⚠️ Error sending OTP email in background:", mailErr));

    res.json({
      success: true,
      message: `Verification code sent successfully to ${cleanEmail}`
    });
  } catch (err) {
    console.error("Error sending OTP email:", err);
    res.status(500).json({ error: "Failed to send verification code. Please check your email and try again." });
  }
});

// 0b. Verify OTP Code
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP code are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = otpStore.get(cleanEmail);

    if (!record) {
      return res.status(400).json({ error: "No active OTP found. Please request a new verification code." });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ error: "This OTP code has expired. Please request a new one." });
    }

    if (record.attempts >= 5) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ error: "Too many failed attempts. Please request a new code." });
    }

    if (record.otp.trim() !== otp.toString().trim()) {
      record.attempts += 1;
      return res.status(400).json({ error: "Invalid verification code. Please check your email." });
    }

    record.verified = true;
    console.log(`✅ [OTP VERIFIED] Email ${cleanEmail} verified successfully`);
    res.json({
      success: true,
      message: "Email address verified successfully!"
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ error: "Verification failed." });
  }
});

// 0c. Request Password Reset OTP via Email
router.post("/forgot-password-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid registered email address." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { seekerProfile: true, companyProfile: true }
    });

    if (!user) {
      return res.status(404).json({ error: "No account found registered with this email address. Please check your spelling or sign up." });
    }

    if (user.companyProfile?.status === "BLOCKED") {
      return res.status(403).json({ error: "This enterprise account has been suspended by Administrator. Please contact support." });
    }

    // Rate limiter: 15s between OTP requests
    const existingOtp = otpStore.get(cleanEmail);
    if (existingOtp && Date.now() - existingOtp.createdAt < 15000) {
      const waitSeconds = Math.ceil((15000 - (Date.now() - existingOtp.createdAt)) / 1000);
      return res.status(429).json({ error: `Please wait ${waitSeconds} seconds before requesting another code.` });
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanEmail, {
      otp,
      expiresAt,
      createdAt: Date.now(),
      attempts: 0,
      verified: false
    });

    const displayName = user.seekerProfile?.fullName || user.companyProfile?.companyName || "User";
    const roleLabel = user.role === "JOB_SEEKER" 
      ? "Job Seeker / Candidate" 
      : (user.role === "RECRUITER" ? "Enterprise Recruiter" : "Administrator");

    sendPasswordResetOtpEmail(cleanEmail, otp, displayName, roleLabel)
      .then(() => console.log(`🔐 [RESET OTP SENT] Sent password reset OTP to ${cleanEmail} (${user.role})`))
      .catch((mailErr) => {
        console.error("⚠️ Error sending reset OTP email in background, falling back to standard sendOtpEmail:", mailErr);
        sendOtpEmail(cleanEmail, otp, displayName).catch((e) => console.error("Fallback mail error:", e));
      });

    res.json({
      success: true,
      message: `A 6-digit password reset code has been dispatched to ${cleanEmail}`,
      role: user.role,
      roleLabel,
      email: cleanEmail
    });
  } catch (err) {
    console.error("Error sending reset OTP:", err);
    res.status(500).json({ error: "Failed to send reset code. Please try again." });
  }
});

// 0d. Reset Password using OTP & Auto-Authenticate to Role Dashboard
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP verification code, and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = otpStore.get(cleanEmail);

    if (!record) {
      return res.status(400).json({ error: "No active password reset request found for this email. Please request a new code." });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ error: "This verification code has expired (10 minutes limit). Please request a new one." });
    }

    if (record.attempts >= 5) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ error: "Too many failed attempts. Please request a fresh OTP code." });
    }

    if (record.otp.trim() !== otp.toString().trim()) {
      record.attempts += 1;
      return res.status(400).json({ error: "Invalid OTP code. Please check your email inbox and enter the 6-digit code." });
    }

    // 1. Hash and securely update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updatedUser = await prisma.user.update({
      where: { email: cleanEmail },
      data: { passwordHash },
      include: { seekerProfile: true, companyProfile: true }
    });

    otpStore.delete(cleanEmail);
    console.log(`✅ [PASSWORD RESET] Password successfully reset for ${cleanEmail} (${updatedUser.role})`);

    // 2. Clear temp pass flag if recruiter
    if (updatedUser.companyProfile && updatedUser.companyProfile.rejectionReason === "TEMP_PASS_ISSUED") {
      try {
        await prisma.companyProfile.update({
          where: { id: updatedUser.companyProfile.id },
          data: { rejectionReason: null }
        });
      } catch (e) {}
    }

    // 3. Issue active JWT Session for instant auto-login
    let name = updatedUser.role === "JOB_SEEKER" 
      ? updatedUser.seekerProfile?.fullName 
      : (updatedUser.companyProfile?.companyName || "User");
    if (updatedUser.role === "ADMIN") name = "Torbit Admin";

    const token = jwt.sign({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      name,
      companyStatus: updatedUser.companyProfile?.status,
      mustChangePassword: false
    }, JWT_SECRET, { expiresIn: "30d" });

    // 4. Resolve canonical dashboard redirect
    const origin = req.headers["origin"] || req.headers["referer"] || "";
    let redirectUrl = "/seeker/dashboard";
    if (updatedUser.role === "RECRUITER") {
      redirectUrl = origin.includes(":3001") ? "/dashboard" : "/recruiter/dashboard";
    } else if (updatedUser.role === "ADMIN") {
      redirectUrl = "/admin/dashboard";
    }

    res.json({
      success: true,
      message: "Password reset successfully! Logging you in...",
      token,
      redirectUrl,
      mustChangePassword: false,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        name,
        mustChangePassword: false,
        companyStatus: updatedUser.companyProfile?.status,
        seekerProfile: updatedUser.seekerProfile,
        companyProfile: updatedUser.companyProfile
      }
    });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ error: "Failed to reset password. Please try again." });
  }
});

function calculateSeekerProfileScore(p) {
  let score = 0;
  if (p.fullName && p.fullName.trim().length >= 2) score += 10;
  if (p.phone && p.phone.trim().length >= 5) score += 10;
  if (p.location && p.location.trim().length >= 2) score += 10;
  if (p.qualification && p.qualification.trim().length >= 2) score += 10;
  if (p.experience && p.experience.trim().length >= 1) score += 10;
  if (p.noticePeriod && p.noticePeriod.trim().length >= 1) score += 5;

  const curSal = Number(p.currentSalary);
  const expSal = Number(p.expectedSalary);
  if ((!isNaN(curSal) && curSal > 0) || (!isNaN(expSal) && expSal > 0)) {
    score += 5;
  }

  if (p.skills && p.skills.trim().length >= 2) score += 10;
  if (p.avatarUrl && p.avatarUrl.trim().length > 0) score += 10;
  if (p.resumeUrl && p.resumeUrl.trim().length > 0) score += 20;

  return Math.min(Math.max(score, 0), 100);
}

// 1. Register Job Seeker
router.post("/register-seeker", async (req, res) => {
  try {
    const { fullName, email, phone, password, location, dob, qualification, experience } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ error: "Please fill in all mandatory fields." });
    }

    const cleanFullName = typeof fullName === "string" ? fullName.trim() : "";
    const nameRegex = /^[a-zA-Z\s\.\']+$/;
    if (!cleanFullName || !nameRegex.test(cleanFullName) || cleanFullName.length < 2) {
      return res.status(400).json({ error: "Full Name must contain only alphabetical characters and spaces." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    const cleanPhone = phone.trim().replace(/[\s\-]/g, "").replace(/^(\+91|0)/, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone.slice(-10))) {
      return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    // 1. Check if email already exists
    const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingEmail) {
      return res.status(400).json({ error: "An account with this email address is already registered. Please proceed to login." });
    }

    // 2. Check if mobile number already exists in seeker profiles
    if (cleanPhone.length >= 10) {
      const existingPhone = await prisma.seekerProfile.findFirst({
        where: { phone: { contains: cleanPhone.slice(-10) } }
      });
      if (existingPhone) {
        return res.status(400).json({ error: "An account with this mobile number is already registered. Please login with your credentials." });
      }
    }

    const initialProfile = {
      fullName: cleanFullName,
      phone: cleanPhone,
      location: location || "India",
      dob: dob || null,
      qualification: qualification || "Graduate",
      experience: experience || "Fresher",
      noticePeriod: "30 days"
    };
    const calculatedScore = calculateSeekerProfileScore(initialProfile);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        role: "JOB_SEEKER",
        seekerProfile: {
          create: {
            ...initialProfile,
            profileCompleted: calculatedScore
          }
        }
      },
      include: { seekerProfile: true }
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: fullName }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Job seeker account created successfully",
      token,
      user: { id: user.id, email: user.email, role: user.role, fullName, seekerProfile: user.seekerProfile }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// 2. Register Recruiter / Company
router.post("/register-recruiter", async (req, res) => {
  try {
    const { companyName, industry, workEmail, phone, gstNumber, gstDocUrl, docUrl, hqLocation } = req.body;

    if (!companyName || !workEmail || !phone || !gstNumber) {
      return res.status(400).json({ error: "Please fill all mandatory company details (Company Name, Work Email, Mobile, GSTIN)" });
    }

    const certificateUrl = gstDocUrl || docUrl;
    if (!certificateUrl || typeof certificateUrl !== 'string' || !certificateUrl.trim()) {
      return res.status(400).json({ error: "Uploading your GST Certificate (PDF format under 1MB) is mandatory." });
    }

    const cleanEmail = workEmail.toLowerCase().trim();
    const cleanPhone = phone.trim().replace(/[\s\-]/g, "").replace(/^(\+91|0)/, "");
    const cleanGst = gstNumber.toUpperCase().trim();

    // 1. Email format check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Please provide a valid work email address (e.g. hr@company.com)." });
    }

    // 2. Mobile number check (10 digits)
    const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim().replace(/[\s\-]/g, ""))) {
      return res.status(400).json({ error: "Please provide a valid 10-digit mobile number." });
    }

    // 3. GSTIN format check (15 chars standard Indian GST format)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(cleanGst)) {
      return res.status(400).json({ error: "Please provide a valid 15-character GSTIN number (e.g. 06AAACD1234F1Z5)." });
    }

    // Comprehensive Duplicate Checks: Email, Phone, GSTIN
    const existingCompany = await prisma.companyProfile.findFirst({
      where: {
        OR: [
          { workEmail: cleanEmail },
          { gstNumber: cleanGst },
          ...(cleanPhone.length >= 10 ? [{ phone: { contains: cleanPhone } }] : [])
        ]
      },
      include: { user: true }
    });

    const existingUserEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (existingCompany || existingUserEmail) {
      const comp = existingCompany;
      const status = comp?.status || "PENDING";
      const refId = comp?.rejectionReason?.startsWith('REF:') ? comp.rejectionReason.replace('REF:', '') : null;

      if (status === "PENDING" || status === "UNDER_REVIEW") {
        return res.status(400).json({
          error: `An application with this email, phone number, or GSTIN is already UNDER VERIFICATION by Admin${refId ? ` (Ref ID: #${refId})` : ''}. Please check your email or wait for approval.`
        });
      }

      if (status === "APPROVED") {
        return res.status(400).json({
          error: "A verified company account already exists with this email, mobile, or GSTIN. Please log in with your credentials."
        });
      }

      return res.status(400).json({
        error: "An account with these details already exists. Please sign in or contact support at torbitinsights@gmail.com."
      });
    }

    // Generate unique Registration / Reference ID
    const referenceId = `TR-REC-${Math.floor(100000 + Math.random() * 900000)}`;

    // Generate locked placeholder hash until Admin approves and sends temporary password via email
    const placeholderSecret = crypto.randomBytes(32).toString("hex");
    const passwordHash = await bcrypt.hash(placeholderSecret, 10);
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        role: "RECRUITER",
        companyProfile: {
          create: {
            companyName: companyName.trim(),
            industry: industry ? industry.trim() : "Real Estate & Construction",
            workEmail: cleanEmail,
            phone: cleanPhone,
            gstNumber: cleanGst,
            docUrl: certificateUrl.trim(),
            hqLocation: hqLocation ? hqLocation.trim() : "India",
            status: "PENDING",
            rejectionReason: `REF:${referenceId}`
          }
        }
      },
      include: { companyProfile: true }
    });

    // Send instant branded acknowledgment email to recruiter's work email
    sendCompanyRegistrationAckEmail(cleanEmail, companyName.trim(), cleanGst, referenceId).catch((mailErr) => {
      console.error("⚠️ Error sending registration acknowledgment email:", mailErr.message);
    });

    // Send instant notification email to Admin about the new company awaiting approval
    sendAdminCompanyApprovalAlertEmail({
      companyName: companyName.trim(),
      workEmail: cleanEmail,
      phone: cleanPhone,
      gstNumber: cleanGst,
      hqLocation: hqLocation ? hqLocation.trim() : "India",
      referenceId
    }).catch((adminMailErr) => {
      console.error("⚠️ Error sending admin company approval alert email:", adminMailErr.message);
    });

    res.json({
      success: true,
      status: "PENDING",
      referenceId,
      message: "Thank you for showing your interest! Your details & GST certificate are under verification. We will get back in 24-48 hours.",
      user: { id: user.id, email: user.email, role: user.role, companyName, companyStatus: "PENDING", companyProfile: user.companyProfile }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Company registration failed" });
  }
});

// 3. Login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: "Please provide email/phone and password." });
    }

    const cleanIdentifier = identifier.toLowerCase().trim();
    const cleanPhone = identifier.trim().replace(/[\s\-\+]/g, '').replace(/^91/, '').replace(/^0/, '');

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { companyProfile: { workEmail: cleanIdentifier } },
          ...(cleanPhone.length >= 6 ? [
            { seekerProfile: { phone: { contains: cleanPhone } } },
            { companyProfile: { phone: { contains: cleanPhone } } }
          ] : [])
        ]
      },
      include: { seekerProfile: true, companyProfile: true }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials. Please check your email or phone." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password. Please check your temporary or permanent password." });
    }

    let name = user.role === "JOB_SEEKER" ? user.seekerProfile?.fullName : user.companyProfile?.companyName;
    if (user.role === "ADMIN") name = "Torbit Admin";

    const mustChangePassword = user.role === "RECRUITER" && user.companyProfile?.rejectionReason === "TEMP_PASS_ISSUED";

    const expiresIn = req.body.rememberMe ? "30d" : "7d";
    const token = jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
      name,
      companyStatus: user.companyProfile?.status,
      mustChangePassword
    }, JWT_SECRET, { expiresIn });

    const origin = req.headers["origin"] || req.headers["referer"] || "";
    let redirectUrl = "/seeker/dashboard";
    if (user.role === "RECRUITER") {
      redirectUrl = origin.includes(":3001") ? "/dashboard" : "/recruiter/dashboard";
    }
    if (user.role === "ADMIN") redirectUrl = "/admin/dashboard";

    res.json({
      success: true,
      token,
      redirectUrl,
      mustChangePassword,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name,
        mustChangePassword,
        companyStatus: user.companyProfile?.status,
        seekerProfile: user.seekerProfile,
        companyProfile: user.companyProfile
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login process encountered an error. Please try again." });
  }
});

// 3c. Google OAuth Authentication (Sign-in & Sign-up)
router.post("/google", async (req, res) => {
  try {
    const { credential, accessToken, userInfo, role, companyDetails } = req.body;
    if (!credential && !accessToken && !userInfo) {
      return res.status(400).json({ error: "Google authentication token or credentials required." });
    }

    // 1. Verify credential token with Google tokeninfo endpoint or userinfo
    let googlePayload = null;
    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (verifyRes.ok) {
          googlePayload = await verifyRes.json();
        }
      } catch (netErr) {
        console.warn("Tokeninfo check error:", netErr);
      }
    }

    if (!googlePayload && accessToken) {
      try {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (userRes.ok) {
          googlePayload = await userRes.json();
        }
      } catch (netErr) {
        console.warn("Userinfo check error:", netErr);
      }
    }

    if (!googlePayload && userInfo && userInfo.email) {
      googlePayload = userInfo;
    }

    if (!googlePayload || !googlePayload.email) {
      return res.status(401).json({ error: "Google authentication could not be verified. Please try again." });
    }

    const cleanEmail = googlePayload.email.toLowerCase().trim();
    const fullName = googlePayload.name || [googlePayload.given_name, googlePayload.family_name].filter(Boolean).join(" ") || "User";
    const avatarUrl = googlePayload.picture || null;

    // 2. Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { companyProfile: { workEmail: cleanEmail } }
        ]
      },
      include: { seekerProfile: true, companyProfile: true }
    });

    if (user) {
      // Existing User Sign In
      // Respect existing user's profile settings (never overwrite removed/custom avatar or profile name with Google data)
      let name = user.role === "JOB_SEEKER" 
        ? (user.seekerProfile?.fullName || fullName) 
        : (user.companyProfile?.companyName || fullName);
      if (user.role === "ADMIN") name = "Torbit Admin";

      const token = jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        name,
        companyStatus: user.companyProfile?.status
      }, JWT_SECRET, { expiresIn: "30d" });

      const origin = req.headers["origin"] || req.headers["referer"] || "";
      let redirectUrl = "/seeker/dashboard";
      if (user.role === "RECRUITER") {
        redirectUrl = origin.includes(":3001") ? "/dashboard" : "/recruiter/dashboard";
      } else if (user.role === "ADMIN") {
        redirectUrl = "/admin/dashboard";
      }

      return res.json({
        success: true,
        isNewUser: false,
        token,
        redirectUrl,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name,
          companyStatus: user.companyProfile?.status,
          seekerProfile: user.seekerProfile,
          companyProfile: user.companyProfile
        }
      });
    }

    // 3. New User Registration Flow
    // If no role was specified, prompt frontend to show role selection modal
    if (!role) {
      return res.json({
        success: true,
        isNewUser: true,
        needsRoleSelection: true,
        email: cleanEmail,
        fullName,
        avatarUrl
      });
    }

    // New User as JOB_SEEKER
    if (role === "JOB_SEEKER") {
      const placeholderSecret = crypto.randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(placeholderSecret, 10);

      const newUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role: "JOB_SEEKER",
          seekerProfile: {
            create: {
              fullName,
              phone: "",
              avatarUrl,
              profileCompleted: 70
            }
          }
        },
        include: { seekerProfile: true }
      });

      const token = jwt.sign({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: fullName
      }, JWT_SECRET, { expiresIn: "30d" });

      return res.json({
        success: true,
        isNewUser: true,
        token,
        redirectUrl: "/seeker/dashboard",
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          name: fullName,
          seekerProfile: newUser.seekerProfile
        }
      });
    }

    // New User as RECRUITER
    if (role === "RECRUITER") {
      const { companyName, gstNumber, phone, hqLocation, industry, docUrl } = companyDetails || {};

      if (!companyName || !gstNumber) {
        return res.json({
          success: true,
          isNewUser: true,
          needsCompanyDetails: true,
          email: cleanEmail,
          fullName,
          avatarUrl
        });
      }

      const cleanGst = gstNumber.toUpperCase().trim();
      const cleanPhone = (phone || "").trim().replace(/[\s\-\+]/g, '').replace(/^91/, '').replace(/^0/, '');

      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(cleanGst)) {
        return res.status(400).json({ error: "Please provide a valid 15-character GSTIN number (e.g. 06AAACD1234F1Z5)." });
      }

      // Check duplicate GST
      const existingGst = await prisma.companyProfile.findFirst({
        where: { gstNumber: cleanGst }
      });
      if (existingGst) {
        return res.status(400).json({ error: "A company account with this GSTIN already exists." });
      }

      const referenceId = `TR-REC-${Math.floor(100000 + Math.random() * 900000)}`;
      const placeholderSecret = crypto.randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(placeholderSecret, 10);

      const newUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role: "RECRUITER",
          companyProfile: {
            create: {
              companyName: companyName.trim(),
              industry: industry ? industry.trim() : "Real Estate & Construction",
              workEmail: cleanEmail,
              phone: cleanPhone || "9800000000",
              gstNumber: cleanGst,
              docUrl: docUrl ? docUrl.trim() : null,
              hqLocation: hqLocation ? hqLocation.trim() : "India",
              logoUrl: avatarUrl,
              status: "PENDING",
              rejectionReason: `REF:${referenceId}`
            }
          }
        },
        include: { companyProfile: true }
      });

      sendCompanyRegistrationAckEmail(cleanEmail, companyName.trim(), cleanGst, referenceId).catch(() => {});

      const token = jwt.sign({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: companyName.trim(),
        companyStatus: "PENDING"
      }, JWT_SECRET, { expiresIn: "30d" });

      const origin = req.headers["origin"] || req.headers["referer"] || "";
      const redirectUrl = origin.includes(":3001") ? "/dashboard" : "/recruiter/dashboard";

      return res.json({
        success: true,
        isNewUser: true,
        status: "PENDING",
        referenceId,
        token,
        redirectUrl,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          name: companyName.trim(),
          companyStatus: "PENDING",
          companyProfile: newUser.companyProfile
        }
      });
    }

    return res.status(400).json({ error: "Invalid role specified." });
  } catch (err) {
    console.error("Google authentication error:", err);
    res.status(500).json({ error: "Google authentication failed. Please try again." });
  }
});

// 3b. Set New Password (For First-time Recruiter / Password Reset)
router.post("/set-new-password", async (req, res) => {
  try {
    const { identifier, temporaryPassword, newPassword } = req.body;
    if (!identifier || !newPassword) {
      return res.status(400).json({ error: "Email/Phone and New Password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New Password must be at least 6 characters long." });
    }

    const cleanIdentifier = identifier.toLowerCase().trim();
    const cleanPhone = identifier.trim().replace(/[\s\-\+]/g, '').replace(/^91/, '').replace(/^0/, '');

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { companyProfile: { workEmail: cleanIdentifier } },
          ...(cleanPhone.length >= 6 ? [
            { companyProfile: { phone: { contains: cleanPhone } } },
            { seekerProfile: { phone: { contains: cleanPhone } } }
          ] : [])
        ]
      },
      include: { companyProfile: true, seekerProfile: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    if (temporaryPassword) {
      const match = await bcrypt.compare(temporaryPassword, user.passwordHash);
      if (!match) {
        return res.status(400).json({ error: "Invalid temporary password." });
      }
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });

    if (user.companyProfile) {
      await prisma.companyProfile.update({
        where: { id: user.companyProfile.id },
        data: { rejectionReason: null }
      });
    }

    const token = jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.companyProfile?.companyName || user.email,
      companyStatus: "APPROVED",
      mustChangePassword: false
    }, JWT_SECRET, { expiresIn: "7d" });

    const origin = req.headers["origin"] || req.headers["referer"] || "";
    const passRedirectUrl = user.role === "RECRUITER" 
      ? (origin.includes(":3001") ? "/dashboard" : "/recruiter/dashboard")
      : "/seeker/dashboard";

    res.json({
      success: true,
      message: "New password set successfully! Redirecting to dashboard...",
      token,
      redirectUrl: passRedirectUrl,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        mustChangePassword: false,
        companyName: user.companyProfile?.companyName,
        companyStatus: "APPROVED",
        companyProfile: { ...user.companyProfile, rejectionReason: null, status: "APPROVED" }
      }
    });
  } catch (err) {
    console.error("Error setting new password:", err);
    res.status(500).json({ error: "Failed to set new password." });
  }
});

// 4. Me
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ user: null });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { seekerProfile: true, companyProfile: true }
    });

    res.json({ user });
  } catch (e) {
    res.json({ user: null });
  }
});

// 5. Update Seeker Profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "JOB_SEEKER" && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Only job seekers can update seeker profile" });
    }

    const {
      fullName,
      phone,
      location,
      dob,
      qualification,
      experience,
      currentSalary,
      expectedSalary,
      noticePeriod,
      skills,
      portfolioUrl,
      resumeUrl,
      resumeOriginalName,
      avatarUrl
    } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { seekerProfile: true }
    });

    if (!existingUser) {
      return res.status(401).json({ error: "User session expired or account not found. Please log in again." });
    }

    const data = {};
    if (fullName !== undefined) data.fullName = fullName;
    if (phone !== undefined) data.phone = phone;
    if (location !== undefined) data.location = location;
    if (dob !== undefined) data.dob = dob;
    if (qualification !== undefined) data.qualification = qualification;
    if (experience !== undefined) data.experience = experience;
    if (currentSalary !== undefined) data.currentSalary = currentSalary ? Number(currentSalary) : null;
    if (expectedSalary !== undefined) data.expectedSalary = expectedSalary ? Number(expectedSalary) : null;
    if (noticePeriod !== undefined) data.noticePeriod = noticePeriod;
    if (skills !== undefined) data.skills = skills;
    if (portfolioUrl !== undefined) data.portfolioUrl = portfolioUrl;
    if (resumeUrl !== undefined) data.resumeUrl = resumeUrl ? resumeUrl : null;
    if (resumeOriginalName !== undefined) data.resumeOriginalName = resumeOriginalName ? resumeOriginalName : null;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl ? avatarUrl : null;

    // Merge existing profile with incoming changes for comprehensive, 100% accurate score calculation
    const existingProfile = existingUser.seekerProfile || {};
    const mergedProfile = {
      fullName: data.fullName !== undefined ? data.fullName : existingProfile.fullName,
      phone: data.phone !== undefined ? data.phone : existingProfile.phone,
      location: data.location !== undefined ? data.location : existingProfile.location,
      qualification: data.qualification !== undefined ? data.qualification : existingProfile.qualification,
      experience: data.experience !== undefined ? data.experience : existingProfile.experience,
      noticePeriod: data.noticePeriod !== undefined ? data.noticePeriod : existingProfile.noticePeriod,
      currentSalary: data.currentSalary !== undefined ? data.currentSalary : existingProfile.currentSalary,
      expectedSalary: data.expectedSalary !== undefined ? data.expectedSalary : existingProfile.expectedSalary,
      skills: data.skills !== undefined ? data.skills : existingProfile.skills,
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : existingProfile.avatarUrl,
      resumeUrl: data.resumeUrl !== undefined ? data.resumeUrl : existingProfile.resumeUrl,
    };

    data.profileCompleted = calculateSeekerProfileScore(mergedProfile);

    const updated = await prisma.seekerProfile.upsert({
      where: { userId: req.user.id },
      update: data,
      create: {
        userId: req.user.id,
        fullName: fullName || existingUser.email.split("@")[0] || "Registered Candidate",
        phone: phone || "Not Provided",
        ...data
      }
    });

    res.json({ success: true, profile: updated });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: err.message || "Failed to update profile" });
  }
});

// 6. Update Company / Recruiter Profile
const handleCompanyProfileUpdate = async (req, res) => {
  try {
    if (req.user.role !== "RECRUITER" && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Only recruiters or admins can update company profile" });
    }

    const { companyName, industry, phone, hqLocation, logoUrl } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { companyProfile: true }
    });

    if (!user) {
      return res.status(404).json({ error: "Recruiter account not found." });
    }

    const data = {};
    if (companyName !== undefined && companyName !== null) data.companyName = companyName.trim();
    if (industry !== undefined && industry !== null) data.industry = industry.trim();
    if (phone !== undefined && phone !== null) data.phone = phone.trim();
    if (hqLocation !== undefined && hqLocation !== null) data.hqLocation = hqLocation.trim();
    if (logoUrl !== undefined) {
      data.logoUrl = logoUrl && typeof logoUrl === 'string' ? (logoUrl.trim() || null) : (logoUrl || null);
    }

    const updated = await prisma.companyProfile.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        companyName: companyName ? companyName.trim() : user.email.split("@")[0] || "My Company",
        workEmail: user.email,
        phone: phone ? phone.trim() : "Not Provided",
        gstNumber: "GST-PENDING",
        hqLocation: hqLocation ? hqLocation.trim() : "India",
        industry: industry || "Real Estate",
        status: "APPROVED",
        ...data
      }
    });

    res.json({ success: true, company: updated });
  } catch (err) {
    console.error("Company profile update error:", err);
    res.status(500).json({ error: err.message || "Failed to update company profile" });
  }
};

router.put("/company-profile", authenticateToken, handleCompanyProfileUpdate);
router.patch("/company-profile", authenticateToken, handleCompanyProfileUpdate);

module.exports = router;