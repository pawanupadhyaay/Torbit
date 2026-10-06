'use client';
import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, AlertCircle, Clock, ShieldCheck, User, Building2, ArrowRight, ArrowLeft, CheckCircle2, Mail, RefreshCw, Lock, KeyRound, FileText, Upload, Check, Copy, Loader2 } from 'lucide-react';
import { QUALIFICATIONS, QUALIFICATION_CATEGORIES, EXPERIENCE_RANGES } from '@/lib/constants';
import GoogleAuthButton from '@/common/GoogleAuthButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'JOB_SEEKER' | 'RECRUITER' | null;
  defaultTab?: 'LOGIN' | 'REGISTER';
  onSuccess?: (user: any) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultRole = null,
  defaultTab = 'REGISTER',
  onSuccess
}: AuthModalProps) {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>(defaultTab);
  const [role, setRole] = useState<'JOB_SEEKER' | 'RECRUITER' | null>(defaultRole);

  // Seeker Form State
  const [seekerName, setSeekerName] = useState('');
  const [seekerDob, setSeekerDob] = useState('');
  const [seekerEmail, setSeekerEmail] = useState('');
  const [seekerPhone, setSeekerPhone] = useState('');
  const [seekerLocation, setSeekerLocation] = useState('');
  const [seekerPassword, setSeekerPassword] = useState('');
  const [seekerConfirmPassword, setSeekerConfirmPassword] = useState('');
  const [seekerQualification, setSeekerQualification] = useState('Graduate (B.Tech / B.E / B.Sc / B.Com / BBA)');
  const [seekerCustomQualification, setSeekerCustomQualification] = useState('');
  const [seekerExperience, setSeekerExperience] = useState('1–3 years');
  const [seekerAgree, setSeekerAgree] = useState(true);
  const [showSeekerPass, setShowSeekerPass] = useState(false);
  const [showSeekerConfirmPass, setShowSeekerConfirmPass] = useState(false);
  const [seekerLoading, setSeekerLoading] = useState(false);

  // Seeker OTP Verification States
  const [isSeekerOtpSent, setIsSeekerOtpSent] = useState(false);
  const [seekerOtpInput, setSeekerOtpInput] = useState('');
  const [isSeekerEmailVerified, setIsSeekerEmailVerified] = useState(false);
  const [seekerOtpSending, setSeekerOtpSending] = useState(false);
  const [seekerOtpVerifying, setSeekerOtpVerifying] = useState(false);
  const [seekerOtpNotice, setSeekerOtpNotice] = useState<string | null>(null);
  const [seekerResendCooldown, setSeekerResendCooldown] = useState(0);

  // Recruiter Form State
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Real Estate');
  const [workEmail, setWorkEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [hqLocation, setHqLocation] = useState('');
  const [recruiterAgree, setRecruiterAgree] = useState(true);
  const [recruiterLoading, setRecruiterLoading] = useState(false);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);

  // GST Certificate Upload State (< 1MB PDF)
  const [gstDocUrl, setGstDocUrl] = useState('');
  const [gstDocName, setGstDocName] = useState('');
  const [gstDocSize, setGstDocSize] = useState<number | null>(null);
  const [gstDocUploading, setGstDocUploading] = useState(false);
  const [gstDocError, setGstDocError] = useState<string | null>(null);
  const [registrationRefId, setRegistrationRefId] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Login Form State
  const [loginRole, setLoginRole] = useState<'JOB_SEEKER' | 'RECRUITER'>('JOB_SEEKER');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  // Forgot Password Flow States
  const [forgotStep, setForgotStep] = useState<'CLOSED' | 'SEND_EMAIL' | 'VERIFY_OTP' | 'SUCCESS'>('CLOSED');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPass, setShowForgotNewPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotNotice, setForgotNotice] = useState<string | null>(null);
  const [forgotResendCooldown, setForgotResendCooldown] = useState(0);
  const [forgotRoleLabel, setForgotRoleLabel] = useState<string | null>(null);

  // Force Password Reset State (First-time Recruiter login with temporary password)
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [newPasswordLoading, setNewPasswordLoading] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Seeker OTP Resend Cooldown Timer
  useEffect(() => {
    let timer: any;
    if (seekerResendCooldown > 0) {
      timer = setInterval(() => {
        setSeekerResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [seekerResendCooldown]);

  // Forgot Password Resend Cooldown Timer
  useEffect(() => {
    let timer: any;
    if (forgotResendCooldown > 0) {
      timer = setInterval(() => {
        setForgotResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [forgotResendCooldown]);

  // Sync props & Lock Body Scroll
  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setRole(defaultRole ?? null);
      if (defaultRole === 'RECRUITER') {
        setLoginRole('RECRUITER');
      } else if (defaultRole === 'JOB_SEEKER') {
        setLoginRole('JOB_SEEKER');
      }
      setForgotStep('CLOSED');
      setShowVerificationPopup(false);
      setRegistrationRefId(null);
      setShowPasswordChangeModal(false);
      setError(null);
      setSeekerOtpNotice(null);
      document.body.style.overflow = 'hidden';
    } else {
      setShowVerificationPopup(false);
      setRegistrationRefId(null);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, defaultTab, defaultRole]);

  const getApiEndpoint = (path: string) => {
    const base = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
      : '/api';
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  };

  if (!isOpen) return null;

  // Handle Send Seeker OTP
  const handleSendSeekerOtp = async () => {
    if (!seekerEmail || !seekerEmail.includes('@')) {
      setError('Please enter a valid email address to receive OTP.');
      return;
    }
    setError(null);
    setSeekerOtpNotice(null);
    setSeekerOtpSending(true);
    try {
      const res = await fetch(getApiEndpoint('/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: seekerEmail.trim(), fullName: seekerName.trim() })
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: 'Server response error. Please try again in a moment.' };
      }
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setIsSeekerOtpSent(true);
      setSeekerResendCooldown(30);
      setSeekerOtpNotice(`OTP code has been sent to ${seekerEmail}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSeekerOtpSending(false);
    }
  };

  // Handle Verify Seeker OTP
  const handleVerifySeekerOtp = async () => {
    if (!seekerOtpInput || seekerOtpInput.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code received on your email.');
      return;
    }
    setError(null);
    setSeekerOtpVerifying(true);
    try {
      const res = await fetch(getApiEndpoint('/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: seekerEmail.trim(), otp: seekerOtpInput.trim() })
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: 'Server response error. Please try again in a moment.' };
      }
      if (!res.ok) throw new Error(data.error || 'Invalid OTP code');

      setIsSeekerEmailVerified(true);
      setSeekerOtpNotice('Email address verified successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSeekerOtpVerifying(false);
    }
  };

  // 1. Handle Seeker Submit
  const handleSeekerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = seekerName.trim();
    if (!cleanName || !seekerEmail || !seekerPhone || !seekerPassword) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    // Strict alphabet and space validation for Full Name
    const nameRegex = /^[a-zA-Z\s\.\']+$/;
    if (!nameRegex.test(cleanName)) {
      setError('Full Name must only contain alphabetical characters (letters and spaces only).');
      return;
    }
    if (cleanName.length < 2) {
      setError('Full Name must be at least 2 characters long.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(seekerEmail.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    const cleanPhone = seekerPhone.trim().replace(/[\s\-]/g, '');
    const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number (e.g. 9811002233).');
      return;
    }

    if (!isSeekerEmailVerified) {
      setError('Please verify your email address via OTP before creating your account.');
      return;
    }

    if (seekerPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (seekerPassword !== seekerConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!seekerAgree) {
      setError('Please agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    if (seekerQualification === 'Others' && !seekerCustomQualification.trim()) {
      setError('Please specify your qualification.');
      return;
    }

    const finalQualification = seekerQualification === 'Others'
      ? seekerCustomQualification.trim()
      : seekerQualification;

    setSeekerLoading(true);
    try {
      const res = await fetch(getApiEndpoint('/auth/register-seeker'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cleanName,
          email: seekerEmail.trim().toLowerCase(),
          phone: cleanPhone,
          location: seekerLocation ? seekerLocation.trim() : 'India',
          dob: seekerDob || null,
          qualification: finalQualification,
          experience: seekerExperience,
          password: seekerPassword
        })
      });
      const data = await res.json().catch(() => ({ error: 'Registration request failed. Please try again.' }));
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      if (onSuccess) onSuccess(data.user);
      const pendingJobId = typeof window !== 'undefined' ? (sessionStorage.getItem('torbit_pending_apply_job_id') || localStorage.getItem('torbit_pending_apply_job_id')) : null;
      const seekerId = data.user?.seekerProfile?.id || (data.user?.id ? `TOR-JS-${data.user.id.slice(-6).toUpperCase()}` : 'TOR-JS-ME');
      if (pendingJobId) {
        window.location.href = `/seeker/dashboard/${seekerId}?applyJobId=${encodeURIComponent(pendingJobId)}`;
      } else {
        window.location.href = `/seeker/dashboard/${seekerId}`;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSeekerLoading(false);
    }
  };

  // Handle GST Certificate Upload (< 1MB, PDF only)
  const handleGstFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGstDocError(null);

    // 1. Validate format: PDF only
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setGstDocError('Invalid format. GST Certificate must be a PDF file (.pdf).');
      return;
    }

    // 2. Validate size: Strict < 1MB
    if (file.size > 1024 * 1024) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setGstDocError(`File size exceeds 1 MB limit (${sizeMb} MB). Please compress or choose a PDF under 1 MB.`);
      return;
    }

    setGstDocUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'company-docs');

      const res = await fetch(getApiEndpoint('/upload'), {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload GST certificate');

      setGstDocUrl(data.fileUrl);
      setGstDocName(file.name);
      setGstDocSize(file.size);
    } catch (err: any) {
      setGstDocError(err.message || 'Error uploading GST certificate.');
    } finally {
      setGstDocUploading(false);
    }
  };

  // 2. Handle Recruiter Submit
  const handleRecruiterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGstDocError(null);

    if (!companyName || !workEmail || !companyPhone || !gstNumber) {
      setError('Please fill all mandatory company details.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(workEmail.trim())) {
      setError('Please enter a valid work email address (e.g. hr@company.com).');
      return;
    }

    const cleanPhone = companyPhone.trim().replace(/[\s\-]/g, '');
    const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number (e.g. 9811002233).');
      return;
    }

    const cleanGst = gstNumber.trim().toUpperCase();
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(cleanGst)) {
      setError('Please enter a valid 15-character GSTIN number (e.g. 06AAACD1234F1Z5).');
      return;
    }

    if (!gstDocUrl) {
      setGstDocError('Please upload your valid GST Certificate in PDF format (< 1MB).');
      setError('GST Certificate upload (PDF < 1MB) is mandatory for company registration.');
      return;
    }

    if (!recruiterAgree) {
      setError('Please agree to the Terms & Conditions and confirm details.');
      return;
    }

    setRecruiterLoading(true);
    try {
      const res = await fetch(getApiEndpoint('/auth/register-recruiter'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          industry: industry ? industry.trim() : 'Real Estate',
          workEmail: workEmail.trim().toLowerCase(),
          phone: cleanPhone,
          gstNumber: cleanGst,
          gstDocUrl: gstDocUrl,
          hqLocation: hqLocation ? hqLocation.trim() : ''
        })
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (e) {
          data = {};
        }
      } else {
        const text = await res.text().catch(() => '');
        data = { error: text || `Server error (${res.status})` };
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      // Note: Recruiter is in PENDING state awaiting Admin approval.
      // Do NOT set active session token so they are not auto-redirected to recruiter dashboard.
      if (data.referenceId) {
        setRegistrationRefId(data.referenceId);
      }

      setShowVerificationPopup(true);
      // Clean up form inputs for clean subsequent forms
      setCompanyName('');
      setWorkEmail('');
      setCompanyPhone('');
      setGstNumber('');
      setGstDocUrl('');
      setGstDocName('');
      setHqLocation('');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setRecruiterLoading(false);
    }
  };

  // 3. Handle Common Login
  const handleCommonLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setError('Please enter your email or phone number and password.');
      return;
    }

    setLoginLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiEndpoint('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword,
          rememberMe
        })
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (e) {
          data = {};
        }
      } else {
        const text = await res.text().catch(() => '');
        data = { error: text || `Server returned error (${res.status})` };
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid email/phone or password. Please try again.');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('torbit_remember_me', rememberMe ? 'true' : 'false');
        localStorage.setItem('torbit_last_active_role', data.user?.role || '');
        localStorage.setItem('torbit_session_saved_at', Date.now().toString());

        if (data.user?.role === 'JOB_SEEKER') {
          try {
            sessionStorage.setItem('torbitSeekerSnapshot', JSON.stringify({
              user: data.user,
              applications: [],
              recommendedJobs: []
            }));
          } catch (e) {}
        }
        if (data.user?.role === 'RECRUITER' || data.user?.role === 'COMPANY') {
          try {
            sessionStorage.setItem('torbitRecruiterSnapshot', JSON.stringify({
              user: data.user,
              applications: [],
              jobs: []
            }));
          } catch (e) {}
        }
        if (data.user?.role === 'ADMIN') {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
        }
      }

      // Check if this is a first-time recruiter login with a temporary password
      if (data.mustChangePassword) {
        setShowPasswordChangeModal(true);
        return;
      }

      if (onSuccess) onSuccess(data.user);
      let destination = data.redirectUrl;
      if (!destination) {
        if (data.user?.role === 'ADMIN') {
          destination = '/admin/dashboard';
        } else if (data.user?.role === 'RECRUITER' || data.user?.role === 'COMPANY') {
          const recId = data.user?.companyProfile?.gstNumber || data.user?.companyProfile?.id || data.user?.id;
          const basePath = typeof window !== 'undefined' && window.location.port === '3001' ? '/dashboard' : '/recruiter/dashboard';
          destination = recId ? `${basePath}/${recId}` : basePath;
        } else {
          const pendingJobId = typeof window !== 'undefined' ? (sessionStorage.getItem('torbit_pending_apply_job_id') || localStorage.getItem('torbit_pending_apply_job_id')) : null;
          const seekerId = data.user?.seekerProfile?.id || (data.user?.id ? `TOR-JS-${data.user.id.slice(-6).toUpperCase()}` : 'TOR-JS-ME');
          if (pendingJobId) {
            destination = `/seeker/dashboard/${seekerId}?applyJobId=${encodeURIComponent(pendingJobId)}`;
          } else {
            destination = `/seeker/dashboard/${seekerId}`;
          }
        }
      }
      if ((data.user?.role === 'RECRUITER' || data.user?.role === 'COMPANY') && typeof window !== 'undefined' && window.location.port === '3001' && destination.startsWith('/recruiter')) {
        destination = destination.replace('/recruiter', '') || '/dashboard';
      }
      window.location.href = destination;
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  // 4. Handle First-Time Temporary Password Change
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewPasswordError(null);

    if (!newPasswordInput || !confirmNewPasswordInput) {
      setNewPasswordError('Please enter and confirm your new permanent password.');
      return;
    }

    if (newPasswordInput.length < 6) {
      setNewPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPasswordInput !== confirmNewPasswordInput) {
      setNewPasswordError('Passwords do not match. Please re-enter.');
      return;
    }

    setNewPasswordLoading(true);
    try {
      const res = await fetch(getApiEndpoint('/auth/set-new-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          temporaryPassword: loginPassword,
          newPassword: newPasswordInput
        })
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (e) {
          data = {};
        }
      } else {
        const text = await res.text().catch(() => '');
        data = { error: text || `Server error (${res.status})` };
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to set new password.');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      if (onSuccess) onSuccess(data.user);
      let destination = data.redirectUrl || '/dashboard';
      if (typeof window !== 'undefined' && window.location.port === '3001' && destination.startsWith('/recruiter')) {
        destination = destination.replace('/recruiter', '') || '/dashboard';
      }
      window.location.href = destination;
    } catch (err: any) {
      setNewPasswordError(err.message || 'Error updating password.');
    } finally {
      setNewPasswordLoading(false);
    }
  };

  // 5. Handle Forgot Password - Send OTP
  const handleSendForgotOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid registered email address.');
      return;
    }

    setForgotLoading(true);
    setForgotError(null);
    setForgotNotice(null);

    try {
      const res = await fetch(getApiEndpoint('/auth/forgot-password-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() })
      });
      const data = await res.json().catch(() => ({ error: 'Failed to request reset OTP.' }));
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to dispatch reset code.');
      }

      setForgotRoleLabel(data.roleLabel || (data.role === 'JOB_SEEKER' ? 'Job Seeker' : (data.role === 'RECRUITER' ? 'Recruiter / Employer' : 'Administrator')));
      setForgotStep('VERIFY_OTP');
      setForgotResendCooldown(30);
      setForgotNotice(`A 6-digit password reset OTP has been emailed to ${forgotEmail.trim().toLowerCase()}.`);
    } catch (err: any) {
      setForgotError(err.message || 'Error sending reset OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  // 6. Handle Forgot Password - Verify OTP & Set New Password & Direct Auto-Login
  const handleResetPasswordWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setForgotError('Please enter the 6-digit OTP code received on your email.');
      return;
    }

    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(getApiEndpoint('/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword
        })
      });
      const data = await res.json().catch(() => ({ error: 'Failed to reset password.' }));
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      // Automatically store session and direct redirect to role panel
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('torbit_remember_me', 'true');
        localStorage.setItem('torbit_last_active_role', data.user?.role || '');
        localStorage.setItem('torbit_session_saved_at', Date.now().toString());

        if (data.user?.role === 'JOB_SEEKER') {
          try {
            sessionStorage.setItem('torbitSeekerSnapshot', JSON.stringify({
              user: data.user,
              applications: [],
              recommendedJobs: []
            }));
          } catch (e) {}
        }
        if (data.user?.role === 'RECRUITER' || data.user?.role === 'COMPANY') {
          try {
            sessionStorage.setItem('torbitRecruiterSnapshot', JSON.stringify({
              user: data.user,
              applications: [],
              jobs: []
            }));
          } catch (e) {}
        }
        if (data.user?.role === 'ADMIN') {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
        }

        let destination = data.redirectUrl;
        if (!destination) {
          if (data.user?.role === 'ADMIN') {
            destination = '/admin/dashboard';
          } else if (data.user?.role === 'RECRUITER') {
            destination = typeof window !== 'undefined' && window.location.port === '3001' ? '/dashboard' : '/recruiter/dashboard';
          } else {
            const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
            const pendingJobId = urlParams.get('jobId') || 
              (typeof window !== 'undefined' ? (sessionStorage.getItem('torbit_pending_apply_job_id') || localStorage.getItem('torbit_pending_apply_job_id')) : null);
            const seekerId = data.user?.seekerProfile?.id || (data.user?.id ? `TOR-JS-${data.user.id.slice(-6).toUpperCase()}` : 'TOR-JS-ME');
            if (pendingJobId) {
              destination = `/seeker/dashboard/${seekerId}?applyJobId=${encodeURIComponent(pendingJobId)}`;
            } else {
              destination = `/seeker/dashboard/${seekerId}`;
            }
          }
        }

        if (data.user?.role === 'RECRUITER' && typeof window !== 'undefined' && window.location.port === '3001' && destination.startsWith('/recruiter')) {
          destination = destination.replace('/recruiter', '') || '/dashboard';
        }

        setForgotNotice('Password reset successful! Logging you in...');
        setTimeout(() => {
          window.location.href = destination;
        }, 500);
        return;
      }

      setForgotStep('SUCCESS');
    } catch (err: any) {
      setForgotError(err.message || 'Error updating password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      
      {/* 0. Forgot Password Modal Screen (OTP Reset Flow) */}
      {forgotStep !== 'CLOSED' ? (
        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 font-['Helvetica',Arial,sans-serif]">
          <div className="bg-[#181C20] px-6 py-6 text-white text-center relative">
            <button
              onClick={() => { setForgotStep('CLOSED'); setForgotError(null); setForgotNotice(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-[#b2c359] text-[#080809] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
              <KeyRound className="w-6 h-6 text-[#080809]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#b2c359] block mb-1">
              ACCOUNT SECURITY
            </span>
            <h3 className="text-xl font-black text-white tracking-tight">
              {forgotStep === 'SUCCESS' ? 'Password Reset Complete' : 'Reset Your Password'}
            </h3>
            <p className="text-xs text-gray-300 mt-1">
              {forgotStep === 'SEND_EMAIL' && 'Enter your registered work email or login email to receive an OTP reset code.'}
              {forgotStep === 'VERIFY_OTP' && 'Enter the 6-digit OTP and choose your new password.'}
              {forgotStep === 'SUCCESS' && 'Your password has been updated securely. You can now log in.'}
            </p>
          </div>

          <div className="p-6 sm:p-7 space-y-4 text-xs text-gray-800">
            {forgotError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotNotice && (
              <div className="p-3 bg-lime-50 text-lime-900 border border-lime-200 rounded-xl flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{forgotNotice}</span>
              </div>
            )}

            {forgotStep === 'SEND_EMAIL' && (
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <div>
                  <label className="font-bold text-gray-800 block mb-1.5">Registered Email Address *</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. hr@company.com or candidate@gmail.com"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail}
                  className="w-full bg-[#b2c359] hover:bg-[#85b21c] text-[#080809] font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{forgotLoading ? 'Sending Reset OTP...' : 'Send OTP Reset Code →'}</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setForgotStep('CLOSED'); setForgotError(null); }}
                    className="text-xs text-gray-500 hover:text-gray-900 underline font-medium"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 'VERIFY_OTP' && (
              <form onSubmit={handleResetPasswordWithOtp} className="space-y-3.5">
                {forgotRoleLabel && (
                  <div className="flex items-center justify-between bg-lime-50/70 border border-lime-200/80 px-3 py-2 rounded-xl text-[11px]">
                    <span className="text-gray-600 font-medium">Account: <strong className="text-gray-950 font-bold">{forgotEmail}</strong></span>
                    <span className="bg-[#b2c359] text-[#080809] font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                      {forgotRoleLabel}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-gray-800">6-Digit Verification OTP *</label>
                    <button
                      type="button"
                      disabled={forgotResendCooldown > 0 || forgotLoading}
                      onClick={() => handleSendForgotOtp()}
                      className="text-[11px] text-[#b2c359] font-bold hover:underline disabled:opacity-50"
                    >
                      {forgotResendCooldown > 0 ? `Resend in ${forgotResendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-center text-sm font-mono tracking-widest font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-[#b2c359] bg-white transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">New Password *</label>
                  <div className="relative">
                    <input
                      type={showForgotNewPass ? 'text' : 'password'}
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white pr-9 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPass(!showForgotNewPass)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showForgotNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Confirm New Password *</label>
                  <div className="relative">
                    <input
                      type={showForgotConfirmPass ? 'text' : 'password'}
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white pr-9 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showForgotConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-[#b2c359] hover:bg-[#85b21c] text-[#080809] font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{forgotLoading ? 'Verifying & Logging In...' : 'Save Password & Sign In →'}</span>
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 'SUCCESS' && (
              <div className="text-center space-y-4 pt-2">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your password has been reset successfully. Please proceed to sign in with your new credentials.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep('CLOSED');
                    setLoginIdentifier(forgotEmail);
                    setLoginPassword('');
                  }}
                  className="w-full bg-[#b2c359] hover:bg-[#85b21c] text-[#080809] font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Proceed to Sign In →
                </button>
              </div>
            )}
          </div>
        </div>
      ) : showPasswordChangeModal ? (
        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200 font-['Helvetica',Arial,sans-serif]">
          {/* Header Banner */}
          <div className="bg-[#181C20] px-6 py-6 text-white text-center relative">
            <div className="w-12 h-12 bg-[#b2c359] text-[#080809] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
              <KeyRound className="w-6 h-6 text-[#080809]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#b2c359] block mb-1">
              FIRST TIME RECRUITER LOGIN
            </span>
            <h3 className="text-xl font-black text-white tracking-tight">
              Create Permanent Password
            </h3>
            <p className="text-xs text-gray-300 mt-1">
              Set your personal permanent password to unlock your recruiter dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSetNewPassword} className="p-6 space-y-4 text-xs">
            {newPasswordError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{newPasswordError}</span>
              </div>
            )}

            <div className="bg-lime-50/70 border border-lime-200 p-3.5 rounded-xl text-xs text-lime-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-gray-950">
                <ShieldCheck className="w-4 h-4 text-[#b2c359]" />
                <span>Account Verified via Admin</span>
              </p>
              <p className="text-gray-700 text-[11px] leading-relaxed">
                You signed in with your temporary credentials for <strong>{loginIdentifier}</strong>. Please choose a secure password with at least 6 characters.
              </p>
            </div>

            {/* New Password */}
            <div>
              <label className="font-bold text-gray-800 block mb-1.5 text-xs">New Permanent Password *</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white pr-9 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="font-bold text-gray-800 block mb-1.5 text-xs">Confirm New Password *</label>
              <div className="relative">
                <input
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  required
                  value={confirmNewPasswordInput}
                  onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                  placeholder="Re-enter permanent password"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white pr-9 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={newPasswordLoading}
                className="w-full bg-[#b2c359] hover:bg-[#85b21c] text-[#080809] font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{newPasswordLoading ? 'Updating Password...' : 'Save Password & Open Dashboard →'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : showVerificationPopup ? (
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 text-center shadow-2xl border border-lime-200 animate-in fade-in zoom-in-95 duration-200 font-['Helvetica',Arial,sans-serif]">
          <div className="w-14 h-14 bg-lime-100 text-[#b2c359] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Clock className="w-7 h-7 text-[#b2c359]" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#b2c359] block mb-1">
            APPLICATION SUBMITTED SUCCESSFULLY
          </span>
          <h3 className="text-xl font-black text-gray-900 mb-2">Account Under Verification</h3>

          {/* Reference ID Card */}
          {registrationRefId && (
            <div className="bg-[#181C20] text-white p-3.5 rounded-2xl mb-4 text-left flex items-center justify-between border border-slate-700 shadow-xs">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Application Reference ID</span>
                <span className="font-mono text-sm sm:text-base font-black text-[#b2c359] tracking-wider">{registrationRefId}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(registrationRefId);
                    setCopiedRef(true);
                    setTimeout(() => setCopiedRef(false), 2500);
                  }
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedRef ? <Check className="w-3.5 h-3.5 text-[#b2c359]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedRef ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>
          )}

          <div className="bg-lime-50/80 text-lime-950 border border-lime-200/80 p-4 rounded-2xl text-xs mb-5 text-left space-y-2">
            <p className="font-bold text-gray-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#b2c359]" />
              <span>Thank you for showing your interest!</span>
            </p>
            <p className="text-gray-700 leading-relaxed text-[11px]">
              Your company details, GSTIN (<strong>{gstNumber}</strong>), and GST certificate have been submitted to the Torbit Realty Admin compliance desk.
            </p>
            <div className="pt-2 border-t border-lime-200/60 text-[11px] text-gray-600 space-y-1">
              <p>✉️ An acknowledgment email with Application Ref <strong>#{registrationRefId || gstNumber}</strong> has been dispatched to <strong>{workEmail}</strong>.</p>
              <p>⏱️ Verification is typically completed within <strong>24–48 business hours</strong>. Upon approval, temporary login credentials will be emailed to you.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowVerificationPopup(false);
              setRegistrationRefId(null);
              onClose();
            }}
            className="w-full bg-[#b2c359] hover:bg-[#9eb047] text-[#111827] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Done / Back to Home</span>
          </button>
        </div>
      ) : (

        /* ======================================================== */
        /* MAIN MODAL WRAPPER */
        /* ======================================================== */
        <div className="w-full max-w-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
          
          {/* -------------------------------------------------------- */}
          {/* 0. ROLE SELECTION STEP: 2 CLEAR QUESTIONS */}
          {/* -------------------------------------------------------- */}
          {tab === 'REGISTER' && !role && (
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden relative max-w-lg mx-auto font-['Helvetica',Arial,sans-serif]">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white transition p-1.5 rounded-full hover:bg-white/10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Banner */}
              <div className="bg-[#181C20] px-6 py-6 sm:px-8 sm:py-7 text-white text-center pr-12 sm:pr-8">
                <div className="w-10 h-10 rounded-xl bg-[#b2c359] text-[#080809] flex items-center justify-center font-black mx-auto mb-3 shadow-xs">
                  <User className="w-6 h-6 text-[#080809]" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#b2c359] block mb-1">
                  TORBIT REALTY REGISTRATION
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  Choose Your Account Type
                </h2>
                <p className="text-xs text-gray-300 mt-1.5 max-w-sm mx-auto">
                  Select how you want to use Torbit Realty to proceed with registration:
                </p>
              </div>

              {/* Selection Options Body */}
              <div className="p-6 sm:p-7 space-y-3.5">
                {/* Option 1: Are you a Job seeker? */}
                <button
                  type="button"
                  onClick={() => { setRole('JOB_SEEKER'); setError(null); }}
                  className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-gray-200 hover:border-[#b2c359] bg-gray-50/70 hover:bg-lime-50/50 transition-all duration-200 group cursor-pointer flex items-center gap-4 shadow-2xs hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-lime-100 group-hover:bg-[#b2c359] text-[#080809] flex items-center justify-center flex-shrink-0 transition">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-extrabold text-gray-950 group-hover:text-black">
                        Are you a Job Seeker?
                      </h3>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#b2c359] group-hover:translate-x-1 transition flex-shrink-0 ml-2" />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      Find &amp; apply directly for top real estate, construction, architectural &amp; sales jobs.
                    </p>
                  </div>
                </button>

                {/* Option 2: Are you a Company or a Recruiter? */}
                <button
                  type="button"
                  onClick={() => { setRole('RECRUITER'); setError(null); }}
                  className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-gray-200 hover:border-slate-800 bg-gray-50/70 hover:bg-slate-50 transition-all duration-200 group cursor-pointer flex items-center gap-4 shadow-2xs hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-900 group-hover:bg-black text-[#b2c359] flex items-center justify-center flex-shrink-0 transition">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-extrabold text-gray-950 group-hover:text-black">
                        Are you a Company or a Recruiter?
                      </h3>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-slate-900 group-hover:translate-x-1 transition flex-shrink-0 ml-2" />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      Post vacancies, verify company GSTIN, and recruit verified talent across 32 disciplines.
                    </p>
                  </div>
                </button>

                {/* Google Quick Sign Up */}
                <div className="pt-2">
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2.5 text-gray-400 font-bold text-[10px] tracking-wider">Or sign up with Google</span>
                    </div>
                  </div>
                  <GoogleAuthButton
                    text="signup"
                    onSwitchToLogin={(email) => {
                      setTab('LOGIN');
                      setLoginIdentifier(email);
                      setLoginPassword('');
                      setError(null);
                    }}
                  />
                </div>

                {/* Footer login link */}
                <div className="text-center pt-3 border-t border-gray-100 text-xs text-gray-600 font-medium">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => { setTab('LOGIN'); setError(null); }}
                    className="text-[#b2c359] font-bold hover:underline cursor-pointer ml-1"
                  >
                    Sign In here →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* 1. JOB SEEKER SIGN UP */}
          {/* -------------------------------------------------------- */}
          {tab === 'REGISTER' && role === 'JOB_SEEKER' && (
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative">
              
              {/* Close Button on Top-Right */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white transition p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Dark Top Banner with Change Account Type */}
              <div className="bg-[#181C20] px-6 py-4 sm:px-7 sm:py-4.5 text-white pr-14">
                <button
                  type="button"
                  onClick={() => { setRole(null); setError(null); }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b2c359] hover:text-white mb-1 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Account Type</span>
                </button>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#b2c359] block mb-0.5">
                  JOB SEEKER SIGN UP
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  Build your profile &amp; get hired
                </h2>
              </div>

              {/* Google Quick Sign Up */}
              <div className="px-6 sm:px-7 pt-4 pb-0">
                <GoogleAuthButton
                  role="JOB_SEEKER"
                  text="signup"
                  onSwitchToLogin={(email) => {
                    setTab('LOGIN');
                    setLoginIdentifier(email);
                    setLoginPassword('');
                    setError(null);
                  }}
                />
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2.5 text-gray-400 font-bold text-[10px] tracking-wider">Or register with email &amp; OTP</span>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSeekerSubmit} className="p-6 sm:p-7 pt-2 space-y-4 text-xs text-gray-800">
                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 border border-red-200 text-xs animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {seekerOtpNotice && (
                  <div className="bg-lime-50 text-lime-900 p-3 rounded-lg flex items-center gap-2 border border-lime-200 text-xs animate-in fade-in duration-200">
                    <ShieldCheck className="w-4 h-4 text-[#b2c359] flex-shrink-0" />
                    <span>{seekerOtpNotice}</span>
                  </div>
                )}

                {/* Row 1: Full Name & Date of Birth */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-800 block mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={seekerName}
                      onChange={(e) => setSeekerName(e.target.value.replace(/[^a-zA-Z\s\.\']/g, ''))}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-800 block mb-1.5">Date of Birth</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={seekerDob}
                        onChange={(e) => setSeekerDob(e.target.value)}
                        onClick={(e) => (e.target as any).showPicker?.()}
                        min="1950-01-01"
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#b2c359] bg-white transition cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Email Address with Live OTP Verification */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-gray-800">Email Address</label>
                    {isSeekerEmailVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Successfully</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-medium">
                        Email OTP Verification Required
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="email"
                        required
                        disabled={isSeekerEmailVerified}
                        value={seekerEmail}
                        onChange={(e) => {
                          setSeekerEmail(e.target.value);
                          if (isSeekerEmailVerified) setIsSeekerEmailVerified(false);
                          if (isSeekerOtpSent) setIsSeekerOtpSent(false);
                        }}
                        placeholder="you@example.com"
                        className={`w-full px-3.5 py-2.5 border rounded-lg text-xs transition placeholder:text-gray-400 focus:outline-none ${
                          isSeekerEmailVerified
                            ? 'border-emerald-300 bg-emerald-50/40 text-gray-900 font-medium cursor-not-allowed'
                            : 'border-gray-200 bg-white text-gray-800 focus:border-[#b2c359]'
                        }`}
                      />
                    </div>

                    {!isSeekerEmailVerified && (
                      <button
                        type="button"
                        onClick={handleSendSeekerOtp}
                        disabled={seekerOtpSending || seekerResendCooldown > 0 || !seekerEmail}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
                      >
                        {seekerOtpSending ? (
                          <span>Sending...</span>
                        ) : seekerResendCooldown > 0 ? (
                          <span>Resend ({seekerResendCooldown}s)</span>
                        ) : isSeekerOtpSent ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Resend OTP</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5 text-[#b2c359]" />
                            <span>Verify OTP</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* OTP Input Sub-Card when OTP is dispatched */}
                  {isSeekerOtpSent && !isSeekerEmailVerified && (
                    <div className="mt-2.5 p-3.5 bg-slate-50 border border-lime-200/90 rounded-xl space-y-2 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#b2c359]" />
                          <span>Enter 6-Digit OTP received on {seekerEmail}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Valid for 10 mins</span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={seekerOtpInput}
                          onChange={(e) => setSeekerOtpInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="• • • • • •"
                          className="w-36 tracking-[6px] text-center font-mono font-bold text-sm px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#b2c359] shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={handleVerifySeekerOtp}
                          disabled={seekerOtpVerifying || seekerOtpInput.length !== 6}
                          className="flex-1 bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 font-bold text-xs py-2.5 px-4 rounded-lg transition disabled:opacity-50 shadow-2xs cursor-pointer flex items-center justify-center gap-1"
                        >
                          {seekerOtpVerifying ? 'Verifying...' : 'Confirm OTP ✓'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 3: Phone Number & Current Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-800 block mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={seekerPhone}
                      onChange={(e) => setSeekerPhone(e.target.value)}
                      placeholder="+91 98XXXXXXXX"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-800 block mb-1.5">Current Location</label>
                    <input
                      type="text"
                      value={seekerLocation}
                      onChange={(e) => setSeekerLocation(e.target.value)}
                      placeholder="City, State"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
                    />
                  </div>
                </div>

                {/* Row 4: Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-800 block mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showSeekerPass ? 'text' : 'password'}
                        required
                        value={seekerPassword}
                        onChange={(e) => setSeekerPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white pr-8 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSeekerPass(!showSeekerPass)}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showSeekerPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-gray-800 block mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showSeekerConfirmPass ? 'text' : 'password'}
                        required
                        value={seekerConfirmPassword}
                        onChange={(e) => setSeekerConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white pr-8 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSeekerConfirmPass(!showSeekerConfirmPass)}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showSeekerConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 5: Highest Qualification Dropdown */}
                <div>
                  <label className="font-bold text-gray-800 block mb-1.5">Highest Qualification</label>
                  <div className="relative">
                    <select
                      value={seekerQualification}
                      onChange={(e) => {
                        setSeekerQualification(e.target.value);
                        if (e.target.value !== 'Others') setSeekerCustomQualification('');
                      }}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#b2c359] bg-white cursor-pointer appearance-none transition"
                    >
                      {QUALIFICATION_CATEGORIES.map((group) => (
                        <optgroup key={group.category} label={group.category} className="font-bold text-gray-900">
                          {group.options.map((opt) => (
                            <option key={opt} value={opt} className="font-normal text-gray-800">
                              {opt}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>

                  {/* Custom Qualification input when Others is selected */}
                  {seekerQualification === 'Others' && (
                    <div className="mt-2.5 animate-in fade-in duration-200">
                      <label className="font-bold text-gray-800 block mb-1 text-[11px]">
                        Specify Qualification <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={seekerCustomQualification}
                        onChange={(e) => setSeekerCustomQualification(e.target.value)}
                        placeholder="e.g. Diploma in Interior Architecture"
                        className="w-full px-3.5 py-2.5 border border-lime-300 bg-lime-50/30 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] transition shadow-2xs"
                      />
                    </div>
                  )}
                </div>

                {/* Row 6: Total Experience Dropdown */}
                <div>
                  <label className="font-bold text-gray-800 block mb-1.5">Total Experience</label>
                  <div className="relative">
                    <select
                      value={seekerExperience}
                      onChange={(e) => setSeekerExperience(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#b2c359] bg-white cursor-pointer appearance-none transition"
                    >
                      {EXPERIENCE_RANGES.map((exp) => (
                        <option key={exp} value={exp}>{exp}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Row 7: Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="seeker-modal-agree"
                    checked={seekerAgree}
                    onChange={(e) => setSeekerAgree(e.target.checked)}
                    className="rounded border-gray-300 text-[#b2c359] focus:ring-[#b2c359] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="seeker-modal-agree" className="text-gray-600 text-xs font-medium cursor-pointer">
                    I agree to the <a href="#terms" className="text-[#b2c359] underline font-semibold">Terms &amp; Conditions</a> and <a href="#privacy" className="text-[#b2c359] underline font-semibold">Privacy Policy</a>
                  </label>
                </div>

                {/* Row 8: Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={seekerLoading}
                    className="w-full bg-[#b2c359] hover:bg-[#85b21c] text-[#111827] font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase py-3.5 px-6 rounded-lg transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {seekerLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span>Creating Job Seeker Account...</span>
                      </>
                    ) : (
                      <span>Create Job Seeker Account →</span>
                    )}
                  </button>
                </div>

                {/* Row 9: Footer link + Role switch */}
                <div className="flex items-center justify-between pt-1 text-xs text-gray-600 font-medium">
                  <div>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('LOGIN'); setError(null); }}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Login
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setRole('RECRUITER'); setError(null); }}
                    className="text-gray-500 hover:text-gray-900 underline"
                  >
                    Recruiter sign up?
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* 2. RECRUITER / COMPANY SIGN UP */}
          {/* -------------------------------------------------------- */}
          {tab === 'REGISTER' && role === 'RECRUITER' && (
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative">
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white transition p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Dark Top Banner with Change Account Type */}
              <div className="bg-[#181C20] px-6 py-4 sm:px-7 sm:py-4.5 text-white pr-14">
                <button
                  type="button"
                  onClick={() => { setRole(null); setError(null); }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b2c359] hover:text-white mb-1 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Account Type</span>
                </button>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#b2c359] block mb-0.5">
                  COMPANY SIGN UP
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  Hire verified, quality candidates
                </h2>
              </div>

              {/* Google Quick Recruiter Sign Up */}
              <div className="px-6 sm:px-7 pt-4 pb-0">
                <GoogleAuthButton
                  role="RECRUITER"
                  text="signup"
                  onSwitchToLogin={(email) => {
                    setTab('LOGIN');
                    setLoginIdentifier(email);
                    setLoginPassword('');
                    setError(null);
                  }}
                />
                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2.5 text-gray-400 font-bold text-[10px] tracking-wider">Or register company with GST Certificate</span>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleRecruiterSubmit} className="p-6 sm:p-7 pt-2 space-y-4 text-xs text-gray-800">
                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 border border-red-200 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Company Name & Industry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-800 block mb-1.5">Company Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. DLF Limited"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-800 block mb-1.5">Industry / Sector</label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. Real Estate"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
                    />
                  </div>
                </div>

                {/* Work Email Address */}
                <div>
                  <label className="font-bold text-gray-800 block mb-1.5">Work Email Address *</label>
                  <input
                    type="email"
                    required
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder="e.g. hr@dlf.in or careers@company.com"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
                  />
                  <span className="text-[11px] text-gray-400 font-medium mt-1 block">
                    Must be a valid corporate/work email address
                  </span>
                </div>

                {/* Phone & GST */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-800 block mb-1.5">Company Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      maxLength={14}
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="e.g. 9811002233 (10 digits)"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-800 block mb-1.5">Company GST Number / GSTIN *</label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. 06AAACD1234F1Z5 (15 digits)"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 uppercase focus:outline-none focus:border-[#b2c359] bg-white font-mono transition"
                    />
                  </div>
                </div>

                {/* GST Registration Certificate (Mandatory, PDF only, < 1MB) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#b2c359]" />
                      <span>GST Registration Certificate (PDF, Max 1 MB) *</span>
                    </label>
                    {gstDocUrl ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Uploaded ({((gstDocSize || 0) / 1024).toFixed(0)} KB)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                        Mandatory PDF
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      id="recruiter-gst-cert-upload"
                      accept=".pdf,application/pdf"
                      onChange={handleGstFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="recruiter-gst-cert-upload"
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition ${
                        gstDocUrl
                          ? 'border-emerald-300 bg-emerald-50/40 text-gray-900'
                          : gstDocError
                          ? 'border-red-300 bg-red-50/40 text-red-900'
                          : 'border-gray-200 hover:border-[#b2c359] bg-gray-50/60 hover:bg-lime-50/30 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          gstDocUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-gray-500 shadow-2xs'
                        }`}>
                          <Upload className="w-4 h-4" />
                        </div>
                        <div className="truncate text-left">
                          <span className="block font-bold text-xs truncate text-gray-900">
                            {gstDocUploading
                              ? 'Uploading PDF Certificate...'
                              : gstDocName
                              ? gstDocName
                              : 'Click to Choose GST Certificate (PDF)'}
                          </span>
                          <span className="block text-[10px] text-gray-400">
                            {gstDocUrl ? 'Click to replace document' : 'Only .pdf format, Maximum file size 1 MB'}
                          </span>
                        </div>
                      </div>

                      <span className={`px-3 py-1 rounded-lg font-bold text-[11px] shrink-0 transition ${
                        gstDocUrl
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 text-white hover:bg-black'
                      }`}>
                        {gstDocUploading ? '...' : gstDocUrl ? 'Replace' : 'Browse'}
                      </span>
                    </label>
                  </div>

                  {gstDocError && (
                    <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{gstDocError}</span>
                    </p>
                  )}
                </div>

                {/* Credentials Notice: Admin will issue temporary password upon approval */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-[#b2c359] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold text-gray-900 block text-[11px]">Admin Approval &amp; Password Setup</span>
                    <span className="text-[11px] text-gray-500">
                      No password required now. Upon KYC &amp; GST verification by Torbit Realty Admin, a secure temporary login password will be emailed to your work email (<strong>{workEmail || 'your email'}</strong>).
                    </span>
                  </div>
                </div>

                {/* HQ Location */}
                <div>
                  <label className="font-bold text-gray-800 block mb-1.5">HQ Location</label>
                  <input
                    type="text"
                    value={hqLocation}
                    onChange={(e) => setHqLocation(e.target.value)}
                    placeholder="City, State, Country"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
                  />
                </div>

                {/* Terms */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="recruiter-modal-agree"
                    checked={recruiterAgree}
                    onChange={(e) => setRecruiterAgree(e.target.checked)}
                    className="rounded border-gray-300 text-[#b2c359] focus:ring-[#b2c359] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="recruiter-modal-agree" className="text-gray-600 text-xs font-medium cursor-pointer">
                    I agree to the <a href="#terms" className="text-[#b2c359] underline font-semibold">Terms &amp; Conditions</a> and confirm the details are accurate
                  </label>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={recruiterLoading}
                    className="w-full bg-[#b2c359] hover:bg-[#85b21c] text-[#111827] font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase py-3.5 px-6 rounded-lg transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {recruiterLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span>Submitting for Verification...</span>
                      </>
                    ) : (
                      <span>Submit for Admin Approval →</span>
                    )}
                  </button>
                </div>

                {/* Footer link + Role switch */}
                <div className="flex items-center justify-between pt-1 text-xs text-gray-600 font-medium">
                  <div>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('LOGIN'); setError(null); }}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Login
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setRole('JOB_SEEKER'); setError(null); }}
                    className="text-gray-500 hover:text-gray-900 underline"
                  >
                    Job Seeker sign up?
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* 3. LOGIN VIEW (SECTION 3.2 SPECIFICATIONS) */}
          {/* -------------------------------------------------------- */}
          {tab === 'LOGIN' && (
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden relative font-['Helvetica',Arial,sans-serif]">
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white transition p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Dark Top Banner */}
              <div className="bg-[#181C20] px-6 sm:px-7 py-4.5 text-white pr-14">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-[#b2c359] text-[#080809] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Universal Secure Sign In
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  Sign In to Torbit Realty
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Single portal for Candidates, Recruiters &amp; Administrators
                </p>
              </div>

              {/* Google Sign In */}
              <div className="px-6 sm:px-7 pt-5 pb-0">
                <GoogleAuthButton text="continue" />
                <div className="relative my-3.5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2.5 text-gray-400 font-bold text-[10px] tracking-wider">Or continue with credentials</span>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCommonLogin} className="p-6 sm:p-7 pt-2 space-y-4 text-xs text-gray-800">
                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 border border-red-200 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="font-bold text-gray-800 block mb-1">
                    Email Address / Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter email or registered mobile number"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white transition"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-bold text-gray-800">Password *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginIdentifier);
                        setForgotStep('SEND_EMAIL');
                        setForgotError(null);
                        setForgotNotice(null);
                      }}
                      className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPass ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] bg-white pr-8 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showLoginPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="login-remember-me-spec"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-[#b2c359] focus:ring-[#b2c359] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="login-remember-me-spec" className="text-gray-600 text-xs font-medium cursor-pointer">
                    Remember Me (Optional, keeps session active on trusted devices)
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-[#b2c359] hover:bg-[#85b21c] text-[#111827] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase py-3.5 px-6 rounded-lg transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loginLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating Session...</span>
                      </>
                    ) : (
                      <span>Sign In to Account</span>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2 text-xs text-gray-600 font-medium">
                  <div>
                    <span>Don&apos;t have an account? </span>
                    <button
                      type="button"
                      onClick={() => { setTab('REGISTER'); setRole('JOB_SEEKER'); setError(null); }}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Register as Job Seeker
                    </button>
                    <span className="mx-1.5 text-gray-400">|</span>
                    <button
                      type="button"
                      onClick={() => { setTab('REGISTER'); setRole('RECRUITER'); setError(null); }}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Register your company
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

        </div>
      )}
    </div>
  );
}