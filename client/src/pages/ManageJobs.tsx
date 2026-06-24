import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Eye, Edit, MoreVertical, Users, Clock, CheckCircle, XCircle, PauseCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- MOCK DATA ---
type JobStatus = 'Active' | 'Paused' | 'Closed';

interface EmployerJob {
  id: string;
  title: string;
  applicantsCount: number;
  postedDate: string;
  status: JobStatus;
}

const mockJobs: EmployerJob[] = [
  { id: '1', title: 'Frontend Developer', applicantsCount: 35, postedDate: '2 weeks ago', status: 'Active' },
  { id: '2', title: 'UI/UX Intern', applicantsCount: 18, postedDate: '1 week ago', status: 'Active' },
  { id: '3', title: 'Backend Developer', applicantsCount: 29, postedDate: '3 weeks ago', status: 'Paused' },
  { id: '4', title: 'Data Analyst', applicantsCount: 24, postedDate: '1 month ago', status: 'Closed' },
  { id: '5', title: 'Senior Product Manager', applicantsCount: 12, postedDate: '5 days ago', status: 'Active' },
  { id: '6', title: 'DevOps Engineer', applicantsCount: 22, postedDate: '2 months ago', status: 'Closed' },
];

// --- REUSABLE COMPONENTS ---

const getStatusBadge = (status: JobStatus) => {
  switch (status) {
    case 'Active':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <CheckCircle className="w-3.5 h-3.5" /> Active
        </span>
      );
    case 'Paused':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          <PauseCircle className="w-3.5 h-3.5" /> Paused
        </span>
      );
    case 'Closed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
          <XCircle className="w-3.5 h-3.5" /> Closed
        </span>
      );
  }
};

const EmployerJobCard: React.FC<{ job: EmployerJob }> = ({ job }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(47, 79, 70, 0.1)' }}
      className="bg-white/70 backdrop-blur-lg border border-[#E6F2DD]/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-[#2F4F46]">{job.title}</h3>
          {getStatusBadge(job.status)}
        </div>
        <div className="flex items-center text-sm text-[#4A6A60] mb-2">
          <Users className="w-4 h-4 mr-2 text-[#659287]" />
          <span>{job.applicantsCount} Applicants</span>
        </div>
        <div className="flex items-center text-sm text-[#4A6A60]">
          <Clock className="w-4 h-4 mr-2 text-[#659287]" />
          <span>Posted {job.postedDate}</span>
        </div>
      </div>
      <div className="border-t border-gray-100 mt-6 pt-4 flex items-center justify-end gap-2">
        <button 
          onClick={() => navigate(`/employer/applicants?jobId=${job.id}`)}
          className="px-3 py-2 text-xs font-bold text-white bg-[#659287] rounded-lg hover:bg-[#53786F] transition-colors flex items-center gap-1.5"
        >
          <Eye className="w-4 h-4" /> View Applicants
        </button>
        <button className="px-3 py-2 text-xs font-bold text-[#2F4F46] bg-white/80 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
          <Edit className="w-4 h-4" /> Edit
        </button>
        <button className="p-2.5 text-xs font-bold text-[#4A6A60] bg-white/80 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function ManageJobs() {
  const [jobs, setJobs] = useState<EmployerJob[]>(mockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#2F4F46]">Manage Jobs</h1>
          <p className="mt-2 text-lg text-[#4A6A60]">Review, edit, and manage your job postings.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/employer/jobs/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#659287] hover:bg-[#53786F] text-white font-semibold transition-colors shadow-lg shadow-[#659287]/30"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#88BDA4]" />
        <input
          type="text"
          placeholder="Search by job title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-14 pl-12 pr-4 text-base rounded-xl border border-[#B1D3B9]/70 bg-white/70 backdrop-blur-sm text-[#2F4F46] placeholder:text-[#4A6A60]/80 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#659287]/50 focus:border-[#659287]"
        />
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map(job => (
          <EmployerJobCard key={job.id} job={job} />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-20 bg-white/60 backdrop-blur-lg border border-[#E6F2DD]/80 rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold text-[#2F4F46]">No jobs found</h2>
          <p className="text-[#4A6A60] mt-2">Your search for "{searchTerm}" did not match any jobs.</p>
        </div>
      )}
    </div>
  );
}