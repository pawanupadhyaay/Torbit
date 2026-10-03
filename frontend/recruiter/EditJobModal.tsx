'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Save, 
  Building2, 
  MapPin, 
  IndianRupee, 
  Layers,
  Sparkles
} from 'lucide-react';

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  onJobUpdated: () => void;
}

export default function EditJobModal({
  isOpen,
  onClose,
  job,
  onJobUpdated
}: EditJobModalProps) {
  const [mounted, setMounted] = useState(false);

  const REAL_ESTATE_32 = [
    'Sales & Business Development',
    'Pre-Sales / Inside Sales',
    'Marketing',
    'Digital Marketing',
    'Content & Creative',
    'CRM / Customer Relations',
    'Leasing',
    'Property Management',
    'Facility Management',
    'Projects & Construction',
    'Architecture & Design',
    'Land Acquisition & Development',
    'Real Estate Advisory & Consulting',
    'Research & Analytics',
    'Investment & Asset Management',
    'Legal',
    'Finance & Accounts',
    'Human Resources',
    'Procurement & Contracts',
    'Administration',
    'Operations',
    'Information Technology / IT',
    'PropTech / Product',
    'Valuation',
    'Government Liaison / Approvals',
    'Quality Assurance / Quality Control',
    'Health, Safety & Environment (HSE)',
    'Corporate Strategy',
    'Customer Experience',
    'Senior Management / Leadership',
    'Video Anchor',
    'Video Editor / Videographer',
    'Others'
  ];

  const [categoriesList, setCategoriesList] = useState<string[]>(REAL_ESTATE_32);

  const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
    : '/api';

  useEffect(() => {
    fetch(`${apiBase}/categories`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.categories && data.categories.length > 0) {
          const catNames = data.categories.map((c: any) => c.name || c).filter(Boolean);
          setCategoriesList(Array.from(new Set([...REAL_ESTATE_32, ...catNames])));
        }
      })
      .catch(() => {});
  }, [apiBase]);

  const [formData, setFormData] = useState({
    title: '',
    department: 'Sales & Business Development',
    customDepartment: '',
    jobType: 'Full-time',
    workMode: 'On-site',
    location: '',
    expMin: 0,
    expMax: 5,
    salaryMin: '',
    salaryMax: '',
    hideSalary: false,
    openings: 1,
    status: 'ACTIVE',
    description: '',
    skills: ''
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        department: categoriesList.includes(job.department) ? job.department : 'Others',
        customDepartment: !categoriesList.includes(job.department) ? job.department : (job.customDepartment || ''),
        jobType: job.jobType || 'Full-time',
        workMode: job.workMode || 'On-site',
        location: job.location || '',
        expMin: job.expMin ?? 0,
        expMax: job.expMax ?? 5,
        salaryMin: job.salaryMin ? String(job.salaryMin) : '',
        salaryMax: job.salaryMax ? String(job.salaryMax) : '',
        hideSalary: Boolean(job.hideSalary),
        openings: job.openings || 1,
        status: job.status || 'ACTIVE',
        description: job.description || '',
        skills: typeof job.skills === 'string' ? job.skills : Array.isArray(job.skills) ? job.skills.join(', ') : ''
      });
      setError('');
      setSuccess(false);
    }
  }, [job]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
        openings: parseInt(String(formData.openings), 10) || 1,
        department: formData.department === 'Others' && formData.customDepartment ? formData.customDepartment.trim() : formData.department
      };

      const res = await fetch(`${apiBase}/jobs/${job.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update job');

      setSuccess(true);
      setTimeout(() => {
        onJobUpdated();
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Error updating job');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this job listing?')) return;

    setDeleting(true);
    setError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/jobs/${job.id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete job');

      onJobUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error deleting job');
    } finally {
      setDeleting(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] w-screen h-screen min-h-screen flex items-center justify-center bg-black/80 backdrop-blur-md p-3.5 sm:p-5 overflow-y-auto font-sans antialiased"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden max-h-[92vh] flex flex-col my-auto border border-neutral-800/20 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark Top Header */}
        <div className="bg-[#080809] text-white p-4 sm:p-6 sm:pb-5 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3.5 top-3.5 sm:right-5 sm:top-5 p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#b2c359]/20 text-[#b2c359] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border border-[#b2c359]/40">
              Edit Job Listing
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              formData.status === 'ACTIVE'
                ? 'bg-emerald-500/20 text-emerald-300'
                : formData.status === 'PAUSED'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-red-500/20 text-red-300'
            }`}>
              {formData.status}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white leading-snug tracking-tight pr-8 truncate">
            {formData.title || 'Untitled Job'}
          </h2>
        </div>

        {/* Modal Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-white [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 border border-red-200 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl flex items-center gap-2 border border-emerald-200 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-medium">Job details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-[13px]">
            {/* 1. Job Title */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Sales Manager"
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-[13px] text-neutral-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition"
              />
            </div>

            {/* 2. Department & Job Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                  Department / Sector <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-[13px] text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition cursor-pointer"
                >
                  {categoriesList.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                  Listing Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-[13px] text-neutral-800 font-bold focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] transition cursor-pointer"
                >
                  <option value="ACTIVE">🟢 ACTIVE (Published &amp; Accepting Applications)</option>
                  <option value="PAUSED">🟡 PAUSED (Temporarily on hold)</option>
                  <option value="CLOSED">🔴 CLOSED (Archived / Hiring Concluded)</option>
                </select>
              </div>
            </div>

            {/* 3. Location, Work Mode & Job Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                  Location (City, State) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Gurugram, Delhi NCR"
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                  Work Mode
                </label>
                <select
                  value={formData.workMode}
                  onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition cursor-pointer"
                >
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                  Job Type
                </label>
                <select
                  value={formData.jobType}
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition cursor-pointer"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            {/* 4. Salary Range & Openings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                  Min Salary (₹ / yr)
                </label>
                <input
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  placeholder="e.g. 600000"
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                  Max Salary (₹ / yr)
                </label>
                <input
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  placeholder="e.g. 1200000"
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                  Openings
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.openings}
                  onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
                />
              </div>
            </div>

            {/* 5. Required Skills */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                Required Skills (Comma-separated)
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. Client Relations, Negotiation, Sales Management"
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition"
              />
            </div>

            {/* 6. Job Description */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-neutral-800 mb-1">
                Job Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe role responsibilities, deliverables and qualification..."
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#b2c359] transition resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 font-bold px-3.5 py-2.5 rounded-xl text-xs transition border border-red-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'Deleting...' : 'Delete Job'}</span>
              </button>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 sm:w-auto px-4 py-2.5 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-xs font-bold text-neutral-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || deleting}
                  className="w-1/2 sm:w-auto bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
