'use client';
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  ListPlus, 
  AlignLeft, 
  Hash, 
  CheckSquare, 
  ListFilter, 
  Sparkles, 
  Briefcase, 
  Building2, 
  MapPin, 
  IndianRupee, 
  Users, 
  Calendar, 
  FileText,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

export interface CustomQuestion {
  id: string;
  question: string;
  type: 'TEXT' | 'NUMBER' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'DROPDOWN';
  options?: string[];
  required: boolean;
}

interface CreateJobViewProps {
  isApproved: boolean;
  companyStatus?: string;
  initialJob?: any;
  onJobCreated: () => void;
  onCancel?: () => void;
}

export default function CreateJobView({
  isApproved,
  companyStatus = 'APPROVED',
  initialJob,
  onJobCreated,
  onCancel
}: CreateJobViewProps) {
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

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Sales & Business Development');
  const [customDepartment, setCustomDepartment] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [workMode, setWorkMode] = useState('On-site');
  const [location, setLocation] = useState('');
  const [experienceText, setExperienceText] = useState('3 – 5 years');
  const [salaryText, setSalaryText] = useState('₹8 – 12 LPA');
  const [hideSalary, setHideSalary] = useState(false);
  const [openings, setOpenings] = useState<number | string>(2);
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>(['Negotiation', 'Client Relations', 'CRM Tools']);
  const [skillInput, setSkillInput] = useState('');
  const [deadline, setDeadline] = useState('');

  // Dynamic Custom Questions State
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [publishedJobData, setPublishedJobData] = useState<any>(null);

  // Pre-fill form if editing an existing job
  useEffect(() => {
    if (initialJob) {
      setTitle(initialJob.title || '');
      setDepartment(initialJob.department || 'Sales & Business Development');
      setCustomDepartment(initialJob.customDepartment || '');
      setJobType(initialJob.jobType || 'Full-time');
      setWorkMode(initialJob.workMode || 'On-site');
      setLocation(initialJob.location || '');
      if (initialJob.expMin !== undefined) {
        setExperienceText(`${initialJob.expMin} – ${initialJob.expMax || initialJob.expMin + 2} years`);
      }
      if (initialJob.salaryMin) {
        const minL = initialJob.salaryMin >= 100000 ? initialJob.salaryMin / 100000 : initialJob.salaryMin;
        const maxL = initialJob.salaryMax ? (initialJob.salaryMax >= 100000 ? initialJob.salaryMax / 100000 : initialJob.salaryMax) : minL;
        setSalaryText(`₹${minL} – ${maxL} LPA`);
      } else {
        setSalaryText('');
      }
      setHideSalary(Boolean(initialJob.hideSalary));
      setOpenings(initialJob.openings || 1);
      setDescription(initialJob.description || '');
      if (Array.isArray(initialJob.skills)) {
        setSkills(initialJob.skills);
      } else if (typeof initialJob.skills === 'string') {
        try {
          const parsed = JSON.parse(initialJob.skills);
          if (Array.isArray(parsed)) setSkills(parsed);
          else setSkills(initialJob.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
        } catch {
          setSkills(initialJob.skills.split(',').map((s: string) => s.trim()).filter(Boolean));
        }
      }
      setDeadline(initialJob.deadline ? initialJob.deadline.slice(0, 10) : '');
      if (Array.isArray(initialJob.customQuestions)) {
        setCustomQuestions(initialJob.customQuestions);
      } else if (typeof initialJob.customQuestions === 'string') {
        try {
          setCustomQuestions(JSON.parse(initialJob.customQuestions));
        } catch {}
      }
    } else {
      resetForm();
    }
  }, [initialJob]);

  const resetForm = () => {
    setTitle('');
    setDepartment('Sales & Business Development');
    setCustomDepartment('');
    setJobType('Full-time');
    setWorkMode('On-site');
    setLocation('');
    setExperienceText('3 – 5 years');
    setSalaryText('₹8 – 12 LPA');
    setHideSalary(false);
    setOpenings(2);
    setDescription('');
    setSkills(['Negotiation', 'Client Relations', 'CRM Tools']);
    setSkillInput('');
    setDeadline('');
    setCustomQuestions([]);
    setError('');
    setSuccessMessage('');
  };

  // Custom Question Handlers
  const handleAddQuestion = (type: CustomQuestion['type'] = 'TEXT', customPrompt?: string, presetOptions?: string[]) => {
    const newQ: CustomQuestion = {
      id: `cq_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      question: customPrompt || '',
      type,
      options: presetOptions || (type === 'SINGLE_CHOICE' ? ['Yes', 'No'] : type === 'MULTIPLE_CHOICE' || type === 'DROPDOWN' ? ['Option 1', 'Option 2'] : []),
      required: false
    };
    setCustomQuestions(prev => [...prev, newQ]);
  };

  const handleUpdateQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    setCustomQuestions(prev => prev.map(q => {
      if (q.id === id) {
        const updated = { ...q, ...updates };
        if (updates.type && (updates.type === 'SINGLE_CHOICE' || updates.type === 'MULTIPLE_CHOICE' || updates.type === 'DROPDOWN')) {
          if (!updated.options || updated.options.length === 0) {
            updated.options = updates.type === 'SINGLE_CHOICE' ? ['Yes', 'No'] : ['Option 1', 'Option 2'];
          }
        }
        return updated;
      }
      return q;
    }));
  };

  const handleRemoveQuestion = (id: string) => {
    setCustomQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleAddOption = (questionId: string) => {
    setCustomQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const currentOpts = q.options || [];
        return { ...q, options: [...currentOpts, `Option ${currentOpts.length + 1}`] };
      }
      return q;
    }));
  };

  const handleUpdateOption = (questionId: string, optIndex: number, value: string) => {
    setCustomQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const currentOpts = [...(q.options || [])];
        currentOpts[optIndex] = value;
        return { ...q, options: currentOpts };
      }
      return q;
    }));
  };

  const handleRemoveOption = (questionId: string, optIndex: number) => {
    setCustomQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const currentOpts = [...(q.options || [])];
        currentOpts.splice(optIndex, 1);
        return { ...q, options: currentOpts };
      }
      return q;
    }));
  };

  // Handle adding skill tags
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const clean = skillInput.trim().replace(/^,|,$/g, '');
      if (clean && !skills.includes(clean)) {
        setSkills([...skills, clean]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Parse experience min/max from text or numbers
  const parseExperience = (text: string) => {
    const nums = text.match(/\d+/g);
    if (nums && nums.length >= 2) {
      return { min: parseInt(nums[0], 10), max: parseInt(nums[1], 10) };
    }
    if (nums && nums.length === 1) {
      return { min: parseInt(nums[0], 10), max: parseInt(nums[0], 10) + 2 };
    }
    return { min: 2, max: 5 };
  };

  // Parse salary min/max from text
  const parseSalary = (text: string) => {
    const nums = text.match(/\d+/g);
    if (nums && nums.length >= 2) {
      return { min: parseInt(nums[0], 10) * 100000, max: parseInt(nums[1], 10) * 100000 };
    }
    if (nums && nums.length === 1) {
      return { min: parseInt(nums[0], 10) * 100000, max: (parseInt(nums[0], 10) + 4) * 100000 };
    }
    return { min: 600000, max: 1200000 };
  };

  const handlePublish = async (isDraft = false) => {
    if (!title.trim()) {
      setError('Job Title is required.');
      return;
    }
    if (!location.trim()) {
      setError('Location is required.');
      return;
    }
    if (!description.trim()) {
      setError('Job Description is required.');
      return;
    }

    // Validate any custom question that has empty question text
    for (let i = 0; i < customQuestions.length; i++) {
      if (!customQuestions[i].question.trim()) {
        setError(`Please provide a question title for custom field #${i + 1} or remove it.`);
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const exp = parseExperience(experienceText);
      const sal = parseSalary(salaryText);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const validCustomQuestions = customQuestions
        .filter(q => q.question.trim().length > 0)
        .map(q => ({
          id: q.id,
          question: q.question.trim(),
          type: q.type,
          options: q.options?.filter(o => o.trim().length > 0) || [],
          required: Boolean(q.required)
        }));

      const payload = {
        title: title.trim(),
        department: department === 'Others' && customDepartment ? customDepartment.trim() : department,
        jobType,
        workMode,
        location: location.trim(),
        expMin: exp.min,
        expMax: exp.max,
        salaryMin: sal.min,
        salaryMax: sal.max,
        hideSalary,
        description: description.trim(),
        skills: skills.join(', '),
        openings: typeof openings === 'number' ? openings : parseInt(openings, 10) || 1,
        deadline: deadline || null,
        customQuestions: validCustomQuestions.length > 0 ? validCustomQuestions : null,
        isDraft
      };

      const endpoint = initialJob?.id ? `${apiBase}/jobs/${initialJob.id}` : `${apiBase}/jobs`;
      const method = initialJob?.id ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (initialJob?.id ? 'Failed to update job.' : 'Failed to post job listing.'));
      }

      if (isDraft) {
        setSuccessMessage(initialJob?.id ? 'Job updated as draft!' : 'Job saved as draft successfully!');
        setTimeout(() => {
          onJobCreated();
        }, 800);
      } else {
        setPublishedJobData({
          title: payload.title,
          department: payload.department,
          location: payload.location,
          jobType: payload.jobType,
          openings: payload.openings,
          customQuestionsCount: validCustomQuestions.length
        });
        setShowThankYouModal(true);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-12 sm:pb-8 animate-in fade-in duration-200 font-sans">
      {/* 1. Account Status Banner */}
      {isApproved ? (
        <div className="bg-[#EBF7EE] border border-[#C3E8CC] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center gap-2.5 sm:gap-3 text-xs text-[#1E7E34] font-medium shadow-2xs">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#28A745] shrink-0" />
          <span className="leading-snug">
            <strong>Account Status: Approved</strong> — you have full permissions to publish job listings.
          </span>
        </div>
      ) : companyStatus === 'REJECTED' || companyStatus === 'BLOCKED' ? (
        <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center gap-2.5 sm:gap-3 text-xs text-red-800 font-medium shadow-2xs">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0" />
          <span className="leading-snug">
            <strong>Account Status: Suspended / Rejected</strong> — job creation is locked. Please contact Torbit Admin.
          </span>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex items-center gap-2.5 sm:gap-3 text-xs text-amber-800 font-medium shadow-2xs">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
          <span className="leading-snug">
            <strong>Account Status: Pending Approval</strong> — job creation is locked until verified by Torbit Admin (24–48h SLA).
          </span>
        </div>
      )}

      {/* 2. Heading and Subtitle */}
      <div className="px-0.5 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {initialJob ? 'Edit Job Posting' : 'Create a New Job Posting'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {initialJob
            ? `Editing opening: ${initialJob.title || 'Selected Job'}. Fields marked with * are required.`
            : 'Fill in the details below. Fields marked with * are required to publish.'}
        </p>
      </div>

      {error && (
        <div className="p-3.5 sm:p-4 bg-red-50 text-red-700 text-xs sm:text-sm rounded-xl border border-red-200 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 sm:p-4 bg-emerald-50 text-emerald-800 text-xs sm:text-sm rounded-xl border border-emerald-200 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* 3. Main Form Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-6">
        
        {/* SECTION 1: ROLE OVERVIEW & CATEGORY */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-[#b2c359]/20 flex items-center justify-center text-[#415410]">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Role &amp; Category</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
            {/* Job Title */}
            <div className="lg:col-span-7">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Job Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Project Manager / Business Development Lead"
                  className="w-full h-11 sm:h-10 px-3.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b2c359] focus:ring-2 focus:ring-[#b2c359]/20 bg-white transition font-medium"
                />
              </div>
            </div>

            {/* Department / Category */}
            <div className="lg:col-span-5">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Department / Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full h-11 sm:h-10 px-3.5 pr-9 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b2c359] focus:ring-2 focus:ring-[#b2c359]/20 bg-white cursor-pointer transition font-medium appearance-none"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Conditional Custom Department */}
          {department === 'Others' && (
            <div className="animate-in fade-in pt-1">
              <label className="block text-xs font-bold text-[#85b21c] mb-1.5">
                Specify Custom Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customDepartment}
                onChange={(e) => setCustomDepartment(e.target.value)}
                placeholder="e.g. Fractional Ownership / Specialized Consulting"
                className="w-full h-11 sm:h-10 px-3.5 border-2 border-[#b2c359] rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none bg-white font-medium shadow-2xs"
              />
            </div>
          )}
        </div>

        {/* SECTION 2: WORK MODEL & LOCATION */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-[#b2c359]/20 flex items-center justify-center text-[#415410]">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Work Model &amp; Location</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Job Type */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Job Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full h-11 sm:h-10 px-3.5 pr-9 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b2c359] focus:ring-2 focus:ring-[#b2c359]/20 bg-white cursor-pointer transition font-medium appearance-none"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Work Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Work Mode <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="w-full h-11 sm:h-10 px-3.5 pr-9 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#b2c359] focus:ring-2 focus:ring-[#b2c359]/20 bg-white cursor-pointer transition font-medium appearance-none"
                >
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Noida, Uttar Pradesh"
                  className="w-full h-11 sm:h-10 pl-9 pr-3.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b2c359] focus:ring-2 focus:ring-[#b2c359]/20 bg-white transition font-medium"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: COMPENSATION & OPENINGS */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-[#b2c359]/20 flex items-center justify-center text-[#415410]">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Compensation &amp; Openings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            {/* Experience Required */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Experience Required
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={experienceText}
                  onChange={(e) => setExperienceText(e.target.value)}
                  placeholder="e.g. 3 – 5 years"
                  className="w-full h-11 sm:h-10 pl-9 pr-3.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b2c359] focus:ring-2 focus:ring-[#b2c359]/20 bg-white transition font-medium"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Salary Range
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-[11px] text-slate-500 hover:text-slate-800">
                  <input
                    type="checkbox"
                    checked={hideSalary}
                    onChange={(e) => setHideSalary(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#b2c359] focus:ring-[#b2c359] rounded cursor-pointer accent-[#85b21c]"
                  />
                  <span>Hide from candidates</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={salaryText}
                  onChange={(e) => setSalaryText(e.target.value)}
                  placeholder="e.g. ₹8 – 12 LPA"
                  className="w-full h-11 sm:h-10 pl-9 pr-3.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b2c359] focus:ring-2 focus:ring-[#b2c359]/20 bg-white transition font-medium"
                />
                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Number of Openings */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Number of Openings
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  value={openings}
                  onChange={(e) => setOpenings(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full h-11 sm:h-10 pl-9 pr-3.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b2c359] focus:ring-2 focus:ring-[#b2c359]/20 bg-white transition font-medium"
                />
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: JOB DESCRIPTION & SKILLS */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-[#b2c359]/20 flex items-center justify-center text-[#415410]">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Description &amp; Skills</h2>
          </div>

          {/* Job Description Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Roles & responsibilities, day-to-day expectations, team requirements..."
              className="w-full min-h-[120px] p-3.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b2c359] focus:ring-2 focus:ring-[#b2c359]/20 bg-white transition font-medium resize-y"
            />
          </div>

          {/* Skills & Deadline Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
            <div className="lg:col-span-8">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Required Skills <span className="text-slate-400 font-normal">(Press Enter or Comma)</span>
              </label>
              <div className="min-h-[44px] sm:min-h-[40px] px-3 py-2 border border-slate-200 rounded-xl bg-white flex flex-wrap items-center gap-1.5 sm:gap-2 focus-within:border-[#b2c359] focus-within:ring-2 focus-within:ring-[#b2c359]/20 transition">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold transition"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-slate-700 p-0.5 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder={skills.length === 0 ? 'Type skill and press Enter...' : '+ add skill...'}
                  className="flex-1 min-w-[120px] text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent py-0.5"
                />
              </div>
            </div>

            <div className="lg:col-span-4">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Application Deadline <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full h-11 sm:h-10 pl-9 pr-3.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b2c359] focus:ring-2 focus:ring-[#b2c359]/20 bg-white cursor-pointer transition font-medium"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: DYNAMIC LINKEDIN-STYLE SCREENING QUESTIONS */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#b2c359]/20 flex items-center justify-center text-[#415410]">
                  <ListPlus className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                  Screening Questions &amp; Custom Fields
                </h2>
                {customQuestions.length > 0 && (
                  <span className="bg-[#b2c359]/20 text-[#2c3e06] font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                    {customQuestions.length} {customQuestions.length === 1 ? 'Field' : 'Fields'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Candidates will be asked these tailored screening questions when applying to this job.
              </p>
            </div>

            {/* Quick Preset Buttons - Smooth horizontal scroll on mobile */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
              <button
                type="button"
                onClick={() => handleAddQuestion('SINGLE_CHOICE', 'Are you willing to relocate for this position?', ['Yes', 'No'])}
                className="shrink-0 px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-[#85b21c]" />
                <span>+ Relocation</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddQuestion('NUMBER', 'How many years of relevant experience do you have in this domain?')}
                className="shrink-0 px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-[#85b21c]" />
                <span>+ Experience</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddQuestion('SINGLE_CHOICE', 'What is your official notice period?', ['Immediate (0 - 15 days)', '30 Days', '60 Days', '90 Days'])}
                className="shrink-0 px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-[#85b21c]" />
                <span>+ Notice Period</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddQuestion('TEXT', 'Which relevant industry certifications or proficiencies do you hold?')}
                className="shrink-0 px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-[#85b21c]" />
                <span>+ Certifications</span>
              </button>
            </div>
          </div>

          {/* List of Added Custom Questions */}
          {customQuestions.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 sm:p-7 text-center bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
                <ListFilter className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-700 font-bold">
                  No custom screening questions added yet
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select a question type below to create dynamic screening criteria just like LinkedIn Jobs.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleAddQuestion('TEXT')}
                  className="px-3 py-2 bg-white border border-slate-200 hover:border-[#b2c359] text-slate-800 text-xs font-bold rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <AlignLeft className="w-3.5 h-3.5 text-[#85b21c]" />
                  <span>Short Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('SINGLE_CHOICE')}
                  className="px-3 py-2 bg-white border border-slate-200 hover:border-[#b2c359] text-slate-800 text-xs font-bold rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-[#85b21c]" />
                  <span>Single Choice</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('MULTIPLE_CHOICE')}
                  className="px-3 py-2 bg-white border border-slate-200 hover:border-[#b2c359] text-slate-800 text-xs font-bold rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ListPlus className="w-3.5 h-3.5 text-[#85b21c]" />
                  <span>Multiple Choice</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddQuestion('NUMBER')}
                  className="px-3 py-2 bg-white border border-slate-200 hover:border-[#b2c359] text-slate-800 text-xs font-bold rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Hash className="w-3.5 h-3.5 text-[#85b21c]" />
                  <span>Number Input</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {customQuestions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="bg-slate-50/90 border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 sm:p-5 transition shadow-2xs space-y-3.5 relative animate-in fade-in duration-200"
                >
                  {/* Top Bar: Question Index & Type Selector & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/70">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center shadow-2xs">
                        #{qIndex + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Screening Question
                      </span>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                      {/* Type Selector */}
                      <select
                        value={q.type}
                        onChange={(e) => handleUpdateQuestion(q.id, { type: e.target.value as any })}
                        className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#b2c359] text-slate-800 cursor-pointer shadow-2xs"
                      >
                        <option value="TEXT">Short Text Answer</option>
                        <option value="NUMBER">Numerical Value</option>
                        <option value="SINGLE_CHOICE">Single Choice (Radio)</option>
                        <option value="MULTIPLE_CHOICE">Multiple Choice (Boxes)</option>
                        <option value="DROPDOWN">Dropdown List</option>
                      </select>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Mandatory Checkbox Toggle */}
                        <label className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 cursor-pointer select-none shadow-2xs hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) => handleUpdateQuestion(q.id, { required: e.target.checked })}
                            className="w-3.5 h-3.5 text-[#b2c359] focus:ring-[#b2c359] rounded cursor-pointer accent-[#85b21c]"
                          />
                          <span className={q.required ? 'text-red-600 font-extrabold' : 'text-slate-600'}>
                            Required <span className="text-red-500 font-black">*</span>
                          </span>
                        </label>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Question Title Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Question / Field Title {q.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      required
                      value={q.question}
                      onChange={(e) => handleUpdateQuestion(q.id, { question: e.target.value })}
                      placeholder="e.g. Do you have prior hands-on experience in this role?"
                      className="w-full h-11 sm:h-10 px-3.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b2c359] focus:ring-2 focus:ring-[#b2c359]/20 transition font-medium"
                    />
                  </div>

                  {/* Options Builder for Choices & Dropdowns */}
                  {(q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE' || q.type === 'DROPDOWN') && (
                    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          {q.type === 'SINGLE_CHOICE' ? 'Single Choice Options:' : q.type === 'MULTIPLE_CHOICE' ? 'Multiple Choice Checkboxes:' : 'Dropdown Options:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddOption(q.id)}
                          className="text-xs font-bold text-[#85b21c] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Option</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(q.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-mono w-4 shrink-0">
                              {optIdx + 1}.
                            </span>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleUpdateOption(q.id, optIdx, e.target.value)}
                              placeholder={`Option ${optIdx + 1}`}
                              className="flex-1 h-9 px-3 bg-slate-50/50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#b2c359] transition"
                            />
                            {(q.options || []).length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(q.id, optIdx)}
                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg"
                                title="Remove Option"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add More Button */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleAddQuestion('TEXT')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#b2c359]" />
                  <span>Add Another Screening Question</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: BOTTOM ACTION BUTTONS */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer text-center"
            >
              ← Back to Jobs
            </button>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:ml-auto">
            <button
              type="button"
              onClick={() => handlePublish(true)}
              disabled={loading}
              className="w-full sm:w-auto h-11 sm:h-10 px-5 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handlePublish(false)}
              disabled={loading}
              className="w-full sm:w-auto h-11 sm:h-10 px-6 bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>{loading ? (initialJob ? 'Saving Changes...' : 'Publishing...') : (initialJob ? 'Save Changes →' : 'Publish Job Listing →')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* LinkedIn-styled Thank You / Success Modal */}
      {showThankYouModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-200 relative">
            {/* Top Celebration Icon */}
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-[#EBF7EE] border border-[#C3E8CC] flex items-center justify-center text-[#28A745] shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
              <span className="absolute -top-1.5 -right-1.5 text-lg">🎉</span>
            </div>

            {/* Heading & Thank You Message */}
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {initialJob ? 'Thank You! Job Updated' : 'Thank You! Job Published'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {initialJob 
                  ? 'Your job listing changes have been updated and are active for candidates.'
                  : 'Your job opening is now live and actively reaching verified talent on Torbit Job Portal.'}
              </p>
            </div>

            {/* Summary Box */}
            {publishedJobData && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {publishedJobData.title}
                  </h4>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md shrink-0">
                    ACTIVE
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span>📍 {publishedJobData.location}</span>
                  <span>•</span>
                  <span>💼 {publishedJobData.department}</span>
                  <span>•</span>
                  <span>👥 {publishedJobData.openings} {publishedJobData.openings === 1 ? 'Opening' : 'Openings'}</span>
                </div>

                {publishedJobData.customQuestionsCount > 0 && (
                  <div className="pt-1.5 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-[#415410]">
                    <Sparkles className="w-3.5 h-3.5 text-[#85b21c]" />
                    <span>{publishedJobData.customQuestionsCount} custom screening questions attached</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowThankYouModal(false);
                  onJobCreated();
                }}
                className="w-full h-11 sm:h-12 bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xs transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View in My Job Listings →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowThankYouModal(false);
                  resetForm();
                }}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                + Post Another Opening
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
