'use client';
import React, { useState } from 'react';
import { X, Briefcase, PlusCircle, AlertCircle, Calendar, Users, IndianRupee, MapPin, CheckCircle2 } from 'lucide-react';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: () => void;
}

export default function CreateJobModal({ isOpen, onClose, onJobCreated }: CreateJobModalProps) {
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

  React.useEffect(() => {
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
    location: 'Gurugram, Haryana',
    expMin: 2,
    expMax: 5,
    salaryMin: 600000,
    salaryMax: 1000000,
    hideSalary: false,
    description: '',
    skills: 'Sales Management, Channel Partners, CRM, Negotiation',
    openings: 1,
    deadline: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/jobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post job');
      }
      setShowThankYou(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setShowThankYou(false);
    onJobCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-gray-200 relative my-6 max-h-[92vh] overflow-y-auto font-sans">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {showThankYou ? (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-[#EBF7EE] border border-[#C3E8CC] flex items-center justify-center text-[#28A745] shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
              <span className="absolute -top-1.5 -right-1.5 text-lg">🎉</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Thank You! Job Published
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                Your opening for <strong>{formData.title}</strong> is now live on Torbit Portal.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinish}
                className="w-full sm:w-auto px-8 py-3 bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer"
              >
                View in My Job Listings →
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#b2c359] text-slate-950 flex items-center justify-center font-bold shrink-0">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Create a New Job Posting</h3>
                <p className="text-[11px] text-gray-500">Fill in the details below. Fields marked mandatory are required to publish.</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Job Title & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Project Manager / Business Development Lead"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Department / Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium bg-white focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] cursor-pointer transition"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Custom Department */}
          {formData.department === 'Others' && (
            <div className="animate-in fade-in">
              <label className="block text-xs font-bold text-[#b2c359] mb-1">
                Specify Custom Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customDepartment}
                onChange={(e) => setFormData({ ...formData, customDepartment: e.target.value })}
                placeholder="e.g. Fractional Ownership / REITs Management"
                className="w-full px-3.5 py-2.5 border-2 border-[#b2c359] rounded-xl font-medium focus:outline-none bg-white"
              />
            </div>
          )}

          {/* Row 2: Job Type, Work Mode, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium bg-white cursor-pointer"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Work Mode <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium bg-white cursor-pointer"
              >
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State, Country"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium bg-white"
              />
            </div>
          </div>

          {/* Row 3: Experience, Salary, Openings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Experience Required</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={formData.expMin}
                  onChange={(e) => setFormData({ ...formData, expMin: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-center"
                  placeholder="Min Yrs"
                />
                <span className="text-slate-400">–</span>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={formData.expMax}
                  onChange={(e) => setFormData({ ...formData, expMax: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-center"
                  placeholder="Max Yrs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">Salary Range (₹/yr)</label>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-xs"
                  placeholder="Min CTC"
                />
                <span className="text-slate-400">–</span>
                <input
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium text-xs"
                  placeholder="Max CTC"
                />
              </div>
              <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.hideSalary}
                  onChange={(e) => setFormData({ ...formData, hideSalary: e.target.checked })}
                  className="rounded text-[#b2c359] focus:ring-[#b2c359] w-3.5 h-3.5"
                />
                <span className="text-[10px] text-slate-500 font-medium">Hide salary from candidates</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Number of Openings</label>
              <input
                type="number"
                min={1}
                value={formData.openings}
                onChange={(e) => setFormData({ ...formData, openings: Number(e.target.value) })}
                placeholder="e.g. 2"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Row 4: Job Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Roles & responsibilities, day-to-day..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#b2c359] focus:border-[#b2c359] resize-none font-normal"
            />
          </div>

          {/* Row 5: Required Skills & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Required Skills (Comma separated) *</label>
              <input
                type="text"
                required
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. Negotiation, Client Relations, CRM Tools"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#b2c359]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Application Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium bg-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 font-bold rounded-xl text-xs shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>}
              <span>{loading ? 'Publishing Opening...' : 'Publish Job Listing →'}</span>
            </button>
          </div>
        </form>
        </>
      )}
      </div>
    </div>
  );
}
