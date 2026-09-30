const nodemailer = require("nodemailer");

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "false" ? false : true,
  auth: {
    user: process.env.SMTP_USER || "torbitinsights@gmail.com",
    pass: process.env.SMTP_PASS || "svntwuvhadctqnzc"
  }
});

/**
 * Send 6-Digit Email Verification OTP
 * @param {string} toEmail 
 * @param {string} otp 
 * @param {string} candidateName 
 */
async function sendOtpEmail(toEmail, otp, candidateName = "Job Seeker") {
  const fromAddress = process.env.EMAIL_FROM || "Torbit Realty <torbitinsights@gmail.com>";

  const mailOptions = {
    from: fromAddress,
    to: toEmail,
    subject: `🔐 Your Verification Code: ${otp} - Torbit Realty`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f8; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
                
                <!-- Brand Header -->
                <tr>
                  <td style="background-color: #080809; padding: 24px 32px; text-align: center;">
                    <div style="display: inline-block;">
                      <span style="color: #94C322; font-weight: 900; font-size: 20px; letter-spacing: 1px;">TORBIT</span>
                      <span style="color: #ffffff; font-weight: 700; font-size: 20px; letter-spacing: 1px;"> REALTY</span>
                    </div>
                    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; font-weight: 500; letter-spacing: 0.5px;">
                      Dedicated Real Estate Job Portal Platform
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px 32px 24px 32px;">
                    <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                      Verify Your Email Address
                    </h1>
                    <p style="margin: 0 0 20px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                      Hello <strong>${candidateName || 'Job Seeker'}</strong>,
                    </p>
                    <p style="margin: 0 0 24px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                      Thank you for registering on Torbit Realty. Please use the following One-Time Password (OTP) to verify your email address and complete your registration:
                    </p>

                    <!-- OTP Display Box -->
                    <div style="background-color: #f8fafc; border: 2px dashed #94C322; border-radius: 12px; padding: 18px 24px; text-align: center; margin: 0 0 24px 0;">
                      <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #080809; display: inline-block;">
                        ${otp}
                      </span>
                    </div>

                    <!-- Security Alert -->
                    <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 12px 16px; border-radius: 6px; margin: 0 0 20px 0;">
                      <p style="margin: 0; font-size: 11px; color: #854d0e; font-weight: 600; line-height: 1.5;">
                        ⏱️ This verification code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
                      </p>
                    </div>

                    <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                      If you did not request this registration, please safely ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #f1f5f9;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; color: #94a3b8; font-weight: 600;">
                      © ${new Date().getFullYear()} Torbit Realty. All rights reserved.
                    </p>
                    <p style="margin: 0; font-size: 10px; color: #cbd5e1;">
                      Sent automatically from <a href="mailto:torbitinsights@gmail.com" style="color: #94C322; text-decoration: none;">torbitinsights@gmail.com</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Send Official Recruiter / Company Approval Email with Temporary Password
 * @param {string} toEmail 
 * @param {string} companyName 
 * @param {string} temporaryPassword 
 * @param {string} loginUrl 
 */
async function sendCompanyApprovalEmail(toEmail, companyName, temporaryPassword, loginUrl = "http://localhost:3000") {
  const fromAddress = process.env.EMAIL_FROM || "Torbit Realty <torbitinsights@gmail.com>";

  const mailOptions = {
    from: fromAddress,
    to: toEmail,
    subject: `🎉 Account Approved: Your Recruiter Login Credentials - Torbit Realty`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Approved</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f8; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
                
                <!-- Brand Header -->
                <tr>
                  <td style="background-color: #080809; padding: 24px 32px; text-align: center;">
                    <div style="display: inline-block;">
                      <span style="color: #94C322; font-weight: 900; font-size: 20px; letter-spacing: 1px;">TORBIT</span>
                      <span style="color: #ffffff; font-weight: 700; font-size: 20px; letter-spacing: 1px;"> RECRUITER</span>
                    </div>
                    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; font-weight: 500; letter-spacing: 0.5px;">
                      Employer & Builder Hiring Portal • Torbit Realty
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px 32px 24px 32px;">
                    <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 4px 12px; margin-bottom: 16px;">
                      <span style="color: #047857; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                        ✓ Account Verified & Approved
                      </span>
                    </div>

                    <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                      Welcome to Torbit Realty Hiring Portal!
                    </h1>
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                      Dear <strong>${companyName || "Employer"}</strong> Team,
                    </p>
                    <p style="margin: 0 0 20px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                      We are pleased to inform you that your company credentials and GSTIN have been reviewed and <strong>APPROVED</strong> by the Torbit Realty Administration Team. Your corporate account is now active.
                    </p>

                    <!-- Credentials Card -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
                      <h3 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                        🔑 Your Initial Login Credentials
                      </h3>
                      
                      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 600;">Work Email:</td>
                          <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${toEmail}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Temporary Password:</td>
                          <td style="padding: 6px 0;">
                            <span style="font-family: 'Courier New', monospace; font-size: 15px; font-weight: 900; background-color: #fef08a; color: #854d0e; padding: 2px 8px; border-radius: 6px; border: 1px solid #fde047; letter-spacing: 1px;">
                              ${temporaryPassword}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Portal URL:</td>
                          <td style="padding: 6px 0;">
                            <a href="${loginUrl}" style="color: #0284c7; font-weight: 700; text-decoration: underline;">
                              ${loginUrl}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Security Alert -->
                    <div style="background-color: #f0fdf4; border-left: 4px solid #94C322; padding: 14px 16px; border-radius: 6px; margin: 0 0 24px 0;">
                      <p style="margin: 0; font-size: 12px; color: #166534; font-weight: 600; line-height: 1.5;">
                        🔒 <strong>Mandatory First-Time Security Step:</strong> When you log in with this temporary password, the system will prompt you to set your own secure, permanent password immediately before entering your dashboard.
                      </p>
                    </div>

                    <!-- Login CTA Button -->
                    <div style="text-align: center; margin: 28px 0 16px 0;">
                      <a href="${loginUrl}" style="display: inline-block; background-color: #94C322; color: #080809; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 14px 32px; border-radius: 10px; text-decoration: none; box-shadow: 0 2px 8px rgba(148, 195, 34, 0.4);">
                        Log In to Recruiter Portal →
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #f1f5f9;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; color: #94a3b8; font-weight: 600;">
                      © ${new Date().getFullYear()} Torbit Realty. All rights reserved.
                    </p>
                    <p style="margin: 0; font-size: 10px; color: #cbd5e1;">
                      Official communication from Torbit Realty Admin Team (<a href="mailto:torbitinsights@gmail.com" style="color: #94C322; text-decoration: none;">torbitinsights@gmail.com</a>)
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Send Recruiter / Company Rejection Email
 * @param {string} toEmail 
 * @param {string} companyName 
 * @param {string} reason 
 */
async function sendCompanyRejectionEmail(toEmail, companyName, reason = "Information verification mismatch.") {
  const fromAddress = process.env.EMAIL_FROM || "Torbit Realty <torbitinsights@gmail.com>";

  const mailOptions = {
    from: fromAddress,
    to: toEmail,
    subject: `Update Regarding Your Company Registration - Torbit Realty`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Status Update</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f8; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
                
                <!-- Brand Header -->
                <tr>
                  <td style="background-color: #080809; padding: 24px 32px; text-align: center;">
                    <div style="display: inline-block;">
                      <span style="color: #94C322; font-weight: 900; font-size: 20px; letter-spacing: 1px;">TORBIT</span>
                      <span style="color: #ffffff; font-weight: 700; font-size: 20px; letter-spacing: 1px;"> REALTY</span>
                    </div>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px 32px 24px 32px;">
                    <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #991b1b; line-height: 1.3;">
                      Company Registration Status Update
                    </h1>
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                      Dear <strong>${companyName || "Applicant"}</strong> Team,
                    </p>
                    <p style="margin: 0 0 20px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                      Thank you for your interest in hiring on Torbit Realty. Following our admin verification process, we regret to inform you that your company registration could not be approved at this time.
                    </p>

                    <!-- Reason Box -->
                    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 16px; border-radius: 6px; margin: 0 0 24px 0;">
                      <p style="margin: 0 0 4px 0; font-size: 11px; color: #991b1b; font-weight: 700; text-transform: uppercase;">
                        Reason Provided by Admin:
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #7f1d1d; font-weight: 500;">
                        ${reason}
                      </p>
                    </div>

                    <p style="margin: 0 0 20px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                      If you believe this was in error or wish to provide updated GSTIN / registration details, please feel free to reach out to our team at <a href="mailto:torbitinsights@gmail.com" style="color: #0284c7; font-weight: 600;">torbitinsights@gmail.com</a>.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #f1f5f9;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; color: #94a3b8; font-weight: 600;">
                      © ${new Date().getFullYear()} Torbit Realty. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Send Company Registration Acknowledgment Email with Reference / Registration ID
 * @param {string} toEmail 
 * @param {string} companyName 
 * @param {string} gstNumber 
 * @param {string} referenceId 
 */
async function sendCompanyRegistrationAckEmail(toEmail, companyName, gstNumber, referenceId) {
  const fromAddress = process.env.EMAIL_FROM || "Torbit Realty <torbitinsights@gmail.com>";

  const mailOptions = {
    from: fromAddress,
    to: toEmail,
    subject: `📋 Registration Received: Application Ref #${referenceId} - Torbit Realty`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Received</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f8; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
                
                <!-- Brand Header -->
                <tr>
                  <td style="background-color: #080809; padding: 24px 32px; text-align: center;">
                    <div style="display: inline-block;">
                      <span style="color: #94C322; font-weight: 900; font-size: 20px; letter-spacing: 1px;">TORBIT</span>
                      <span style="color: #ffffff; font-weight: 700; font-size: 20px; letter-spacing: 1px;"> REALTY</span>
                    </div>
                    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; font-weight: 500; letter-spacing: 0.5px;">
                      Corporate Recruiter & Employer Onboarding
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px 32px 24px 32px;">
                    <div style="display: inline-block; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 20px; padding: 4px 12px; margin-bottom: 16px;">
                      <span style="color: #854d0e; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                        ⏳ Application Under Verification
                      </span>
                    </div>

                    <h1 style="margin: 0 0 12px 0; font-size: 21px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                      Thank You for Registering with Torbit Realty!
                    </h1>
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                      Dear <strong>${companyName || "Employer"}</strong> Team,
                    </p>
                    <p style="margin: 0 0 20px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                      We have successfully received your company registration request along with your GST certificate and verification documents.
                    </p>

                    <!-- Reference / Details Card -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
                      <h3 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                        📄 Application Summary
                      </h3>
                      
                      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: 600;">Reference ID:</td>
                          <td style="padding: 6px 0; color: #080809; font-weight: 800; font-family: 'Courier New', monospace; font-size: 14px;">
                            ${referenceId}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Company Name:</td>
                          <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${companyName}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Registered Email:</td>
                          <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${toEmail}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">GSTIN Number:</td>
                          <td style="padding: 6px 0; color: #0f172a; font-weight: 700; font-family: monospace;">${gstNumber}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Current Status:</td>
                          <td style="padding: 6px 0;">
                            <span style="background-color: #fef08a; color: #854d0e; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 6px; border: 1px solid #fde047;">
                              PENDING ADMIN APPROVAL
                            </span>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Next Steps -->
                    <div style="background-color: #f0fdf4; border-left: 4px solid #94C322; padding: 14px 16px; border-radius: 6px; margin: 0 0 20px 0;">
                      <h4 style="margin: 0 0 4px 0; font-size: 12px; font-weight: 800; color: #166534; text-transform: uppercase;">
                        🔍 What happens next?
                      </h4>
                      <p style="margin: 0; font-size: 12px; color: #166534; line-height: 1.5;">
                        Our compliance team is currently reviewing your GST certificate and details. This typically takes <strong>24–48 business hours</strong>. Once approved, you will receive an official email containing your <strong>Temporary Login Password</strong> and direct access to the recruiter dashboard.
                      </p>
                    </div>

                    <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                      Please save your Reference ID (<strong>${referenceId}</strong>) for any future correspondence with our support desk at <a href="mailto:torbitinsights@gmail.com" style="color: #0284c7; text-decoration: none;">torbitinsights@gmail.com</a>.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #f1f5f9;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; color: #94a3b8; font-weight: 600;">
                      © ${new Date().getFullYear()} Torbit Realty. All rights reserved.
                    </p>
                    <p style="margin: 0; font-size: 10px; color: #cbd5e1;">
                      Automatic acknowledgement sent from <a href="mailto:torbitinsights@gmail.com" style="color: #94C322; text-decoration: none;">torbitinsights@gmail.com</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Send Job Alert Subscription Confirmation Email
 */
async function sendJobAlertConfirmationEmail(toEmail, seekerName, alertData, matchedJobsCount = 0) {
  const fromAddress = process.env.EMAIL_FROM || "Torbit Realty <torbitinsights@gmail.com>";

  const mailOptions = {
    from: fromAddress,
    to: toEmail,
    subject: `🔔 Job Alert Active: "${alertData.title}" - Torbit Realty`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Alert Activated</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f8; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
                
                <!-- Brand Header -->
                <tr>
                  <td style="background-color: #080809; padding: 24px 32px; text-align: center;">
                    <div style="display: inline-block;">
                      <span style="color: #94C322; font-weight: 900; font-size: 20px; letter-spacing: 1px;">TORBIT</span>
                      <span style="color: #ffffff; font-weight: 700; font-size: 20px; letter-spacing: 1px;"> REALTY</span>
                    </div>
                    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; font-weight: 500; letter-spacing: 0.5px;">
                      Enterprise Real Estate Job Matching Network
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px 32px 24px 32px;">
                    <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 4px 12px; margin-bottom: 12px;">
                      <span style="color: #059669; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                        ✓ Alert Subscription Active
                      </span>
                    </div>

                    <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                      Your Job Alert is Now Live!
                    </h1>
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                      Hello <strong>${seekerName || "Candidate"}</strong>,
                    </p>
                    <p style="margin: 0 0 20px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                      We have configured your personalized career alert. As soon as leading real estate developers &amp; consultancies post relevant openings, you'll receive notification instantly.
                    </p>

                    <!-- Alert Details Card -->
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 0 0 24px 0;">
                      <h3 style="margin: 0 0 14px 0; font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                        🎯 Alert Parameters
                      </h3>
                      
                      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; width: 130px; font-weight: 600;">Role / Keyword:</td>
                          <td style="padding: 6px 0; color: #080809; font-weight: 800;">${alertData.title}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Location:</td>
                          <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${alertData.location}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Department:</td>
                          <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${alertData.category || "All Departments"}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Frequency:</td>
                          <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${alertData.frequency || "Daily Instant Alert"}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Matching Openings:</td>
                          <td style="padding: 6px 0;">
                            <span style="background-color: #94C322; color: #080809; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 6px;">
                              ${matchedJobsCount} Active Matching Jobs
                            </span>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 28px 0 20px 0;">
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/seeker/dashboard" 
                         style="background-color: #94C322; color: #080809; font-size: 13px; font-weight: 800; padding: 12px 28px; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 2px 8px rgba(148, 195, 34, 0.3);">
                        View Matching Jobs &amp; Apply →
                      </a>
                    </div>

                    <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;">
                      You can modify or pause this alert anytime in your <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/seeker/dashboard" style="color: #94C322; text-decoration: underline;">Job Seeker Dashboard</a>.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #f1f5f9;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; color: #94a3b8; font-weight: 600;">
                      © ${new Date().getFullYear()} Torbit Realty. All rights reserved.
                    </p>
                    <p style="margin: 0; font-size: 10px; color: #cbd5e1;">
                      Sent automatically from <a href="mailto:torbitinsights@gmail.com" style="color: #94C322; text-decoration: none;">torbitinsights@gmail.com</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Send Matching Jobs Digest Email
 */
async function sendMatchedJobsAlertEmail(toEmail, seekerName, alertTitle, matchingJobs = []) {
  const fromAddress = process.env.EMAIL_FROM || "Torbit Realty <torbitinsights@gmail.com>";

  const jobsListHtml = matchingJobs.map((j) => `
    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 12px;">
      <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
        ${j.title}
      </div>
      <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
        🏢 ${j.company?.companyName || "Torbit Partner"} • 📍 ${j.location} • 💼 ${j.jobType || "Full-Time"}
      </div>
      <div style="font-size: 12px; color: #059669; font-weight: 700;">
        💰 ${j.hideSalary ? "Salary: Best in Industry" : (j.salaryMin ? `₹${j.salaryMin} - ₹${j.salaryMax || j.salaryMin} LPA` : "Competitive")}
      </div>
    </div>
  `).join('');

  const mailOptions = {
    from: fromAddress,
    to: toEmail,
    subject: `⚡ ${matchingJobs.length} New Matching Jobs Found for "${alertTitle}" - Torbit Realty`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Matching Jobs Alert</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f4f6f8; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
                
                <!-- Brand Header -->
                <tr>
                  <td style="background-color: #080809; padding: 24px 32px; text-align: center;">
                    <div style="display: inline-block;">
                      <span style="color: #94C322; font-weight: 900; font-size: 20px; letter-spacing: 1px;">TORBIT</span>
                      <span style="color: #ffffff; font-weight: 700; font-size: 20px; letter-spacing: 1px;"> REALTY</span>
                    </div>
                    <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; font-weight: 500; letter-spacing: 0.5px;">
                      Real-time Job Alert Notification
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px 32px 24px 32px;">
                    <h1 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                      New Openings Matching "${alertTitle}"
                    </h1>
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                      Hello <strong>${seekerName || "Candidate"}</strong>, here are latest openings posted by top real estate firms:
                    </p>

                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                      ${jobsListHtml || "<p style='color:#64748b; font-size:13px; margin:0;'>No active openings found at the moment.</p>"}
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 24px 0 16px 0;">
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/seeker/dashboard" 
                         style="background-color: #94C322; color: #080809; font-size: 13px; font-weight: 800; padding: 12px 28px; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 2px 8px rgba(148, 195, 34, 0.3);">
                        View &amp; Quick Apply Now →
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #f1f5f9;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; color: #94a3b8; font-weight: 600;">
                      © ${new Date().getFullYear()} Torbit Realty. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  transporter,
  sendOtpEmail,
  sendCompanyApprovalEmail,
  sendCompanyRejectionEmail,
  sendCompanyRegistrationAckEmail,
  sendJobAlertConfirmationEmail,
  sendMatchedJobsAlertEmail
};

