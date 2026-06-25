import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Users,
  Clock,
  CheckCircle,
  Archive,
  Trash2,
  RotateCcw,
  AlertTriangle,
  X,
  Briefcase,
  MapPin,
  IndianRupee,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMyJobs, deleteJob, archiveJob } from '../services/jobService';
import { toast } from 'react-hot-toast';
import type { Job } from '../services/jobService';
import HeroCard from '../components/HeroCard';

/* ───────────────────── Helpers ───────────────────── */

/** Formats a date string/ISO into a human-friendly relative or absolute string */
const formatPostedDate = (dateStr?: string): string => {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Recently';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffDays < 1) {
    if (diffHr >= 1) return `${diffHr}h ago`;
    if (diffMin >= 1) return `${diffMin}m ago`;
    return 'Just now';
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w ago`;
  }
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** Resolves the job type value from DB fields */
const resolveJobType = (job: Job): string => {
  return job.jobType || job.type || 'N/A';
};

/** Status badge colours */
const getStatusBadge = (status?: string) => {
  const s = status?.toLowerCase();
  switch (s) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-3 h-3" /> Active
        </span>
      );
    case 'archived':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <Archive className="w-3 h-3" /> Archived
        </span>
      );
    default:
      return null;
  }
};

/* ───────────────── Delete Confirmation Modal ─────────────── */

interface DeleteModalProps {
  jobTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ jobTitle, onConfirm, onCancel }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-[#2F4F46] mb-2">Delete Job Posting</h3>
          <p className="text-[#4A6A60] text-sm leading-relaxed mb-6">
            Are you sure you want to permanently delete <strong className="text-[#2F4F46]">"{jobTitle}"</strong>? This action cannot be undone and all associated data will be lost.
          </p>
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-5 py-2.5 rounded-xl border border-[#E2ECE5] text-[#2F4F46] font-semibold hover:bg-[#F7FAF8] transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* ───────────────── Employer Job Card ─────────────── */

interface EmployerJobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
  onArchive: (job: Job) => void;
  isArchived?: boolean;
}

const EmployerJobCard: React.FC<EmployerJobCardProps> = ({
  job,
  onEdit,
  onDelete,
  onArchive,
  isArchived = false,
}) => {
  const navigate = useNavigate();
  const applicants = job.applicants ?? 0;
  const postedDate = formatPostedDate((job as any).createdAt || job.createdAt);
  const jobType = resolveJobType(job);
  const status = (job as any).status as string | undefined;
  const jobId = (job as any)._id || job.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
      whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(47, 79, 70, 0.08)' }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 backdrop-blur-lg border border-[#E6F2DD]/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between group"
    >
      {/* Top section */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[#2F4F46] truncate">{job.title}</h3>
            <p className="text-sm text-[#4A6A60] font-medium mt-0.5">{job.company}</p>
          </div>
          {status && getStatusBadge(status)}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-[#4A6A60]">
            <MapPin className="w-3.5 h-3.5 text-[#88BDA4] flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#4A6A60]">
            <Briefcase className="w-3.5 h-3.5 text-[#88BDA4] flex-shrink-0" />
            <span className="truncate">{jobType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#4A6A60]">
            <IndianRupee className="w-3.5 h-3.5 text-[#88BDA4] flex-shrink-0" />
            <span className="truncate">
              {job.salary?.min?.toLocaleString('en-IN')} – {job.salary?.max?.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#4A6A60]">
            <Users className="w-3.5 h-3.5 text-[#88BDA4] flex-shrink-0" />
            <span>{applicants} Applicants</span>
          </div>
        </div>

        {/* Skills chips */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-[11px] font-semibold text-[#4A6A60] bg-[#E6F2DD] rounded-md"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-2 py-0.5 text-[11px] font-semibold text-[#2F4F46] bg-gray-100 rounded-md">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Posted date */}
        <div className="flex items-center gap-1.5 text-xs text-[#4A6A60]/80 mb-4">
          <Clock className="w-3.5 h-3.5" />
          <span>Posted {postedDate}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="border-t border-[#E6F2DD] pt-4 space-y-2">
        {/* Row 1: View Applicants (full width) */}
        <button
          onClick={() => navigate(`/employer/applicants?jobId=${jobId}`)}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#659287] rounded-lg hover:bg-[#53786F] hover:shadow-md hover:shadow-[#659287]/20 transition-all duration-200 active:scale-[0.98]"
        >
          <Eye className="w-3.5 h-3.5" />
          View Applicants
        </button>

        {/* Row 2: Edit, Archive/Restore, Delete */}
        <div className="grid grid-cols-3 gap-2">
          {/* Edit */}
          <button
            onClick={() => onEdit(job)}
            className="inline-flex items-center justify-center gap-1 px-2 py-2 text-xs font-bold text-[#659287] bg-white border border-[#B1D3B9] rounded-lg hover:bg-[#E6F2DD] hover:border-[#659287] hover:shadow-sm transition-all duration-200 active:scale-[0.97]"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>

          {/* Archive / Restore */}
          {isArchived ? (
            <button
              onClick={() => onArchive(job)}
              className="inline-flex items-center justify-center gap-1 px-2 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm transition-all duration-200 active:scale-[0.97]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore
            </button>
          ) : (
            <button
              onClick={() => onArchive(job)}
              className="inline-flex items-center justify-center gap-1 px-2 py-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 hover:border-amber-300 hover:shadow-sm transition-all duration-200 active:scale-[0.97]"
            >
              <Archive className="w-3.5 h-3.5" />
              Archive
            </button>
          )}

          {/* Delete */}
          <button
            onClick={() => onDelete(job)}
            className="inline-flex items-center justify-center gap-1 px-2 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 hover:shadow-sm transition-all duration-200 active:scale-[0.97]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ───────────────── Skeleton Card ─────────────── */

const SkeletonCard = () => (
  <div className="bg-white/60 border border-[#E6F2DD]/50 rounded-2xl p-6 shadow-sm animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
      <div className="h-6 w-20 bg-gray-200 rounded-full" />
    </div>
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="h-4 w-20 bg-gray-200 rounded" />
      <div className="h-4 w-28 bg-gray-200 rounded" />
      <div className="h-4 w-24 bg-gray-200 rounded" />
    </div>
    <div className="flex gap-2 mb-4">
      <div className="h-5 w-14 bg-gray-200 rounded-md" />
      <div className="h-5 w-16 bg-gray-200 rounded-md" />
      <div className="h-5 w-12 bg-gray-200 rounded-md" />
    </div>
    <div className="border-t border-gray-100 pt-4 flex gap-2">
      <div className="h-9 flex-1 bg-gray-200 rounded-lg" />
      <div className="h-9 w-16 bg-gray-200 rounded-lg" />
      <div className="h-9 w-20 bg-gray-200 rounded-lg" />
      <div className="h-9 w-18 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

/* ───────────────── Main Page ─────────────── */

type TabType = 'active' | 'archived';

export default function ManageJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const navigate = useNavigate();

  /* ---------- Data fetching ---------- */
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getMyJobs();
        const jobList: Job[] = (data?.jobs ?? data) as Job[];
        setJobs(jobList);
      } catch (err) {
        setError('Failed to load jobs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  /* ---------- Handlers ---------- */
  const handleEdit = (job: Job) => {
    const jobId = (job as any)._id || job.id;
    navigate(`/employer/jobs/edit/${jobId}`, { state: { job } });
  };

  const handleDeleteClick = (job: Job) => {
    setDeleteTarget(job);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const jobId = (deleteTarget as any)._id || deleteTarget.id;
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => ((j as any)._id || j.id) !== jobId));
      toast.success('Job deleted successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete job');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleArchiveToggle = async (job: Job) => {
    const jobId = (job as any)._id || job.id;
    const currentStatus = ((job as any).status || '').toLowerCase();
    const newStatus = currentStatus === 'archived' ? 'active' : 'archived';
    try {
      await archiveJob(jobId, newStatus as 'archived' | 'active');
      setJobs((prev) =>
        prev.map((j) =>
          ((j as any)._id || j.id) === jobId ? { ...j, status: newStatus } : j
        )
      );
      toast.success(newStatus === 'archived' ? 'Job archived successfully' : 'Job restored successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update job status');
    }
  };

  /* ---------- Filtered lists ---------- */
  const activeJobs = useMemo(
    () =>
      jobs.filter((j) => {
        const s = ((j as any).status || 'active').toLowerCase();
        return s !== 'archived';
      }),
    [jobs]
  );

  const archivedJobs = useMemo(
    () =>
      jobs.filter((j) => {
        const s = ((j as any).status || '').toLowerCase();
        return s === 'archived';
      }),
    [jobs]
  );

  const displayedJobs = activeTab === 'active' ? activeJobs : archivedJobs;
  const filteredJobs = displayedJobs.filter((job) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ---------- Render ---------- */
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-5 w-80 bg-gray-200 rounded mt-3 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-[#2F4F46] mb-2">Something went wrong</h2>
        <p className="text-[#4A6A60]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex-1 w-full">
          <HeroCard
            badgeText="Premium Recruiter Console"
            title="Manage Jobs"
            description="Review active job postings, check application tallies, archive positions, and edit roles."
            IconComponent={Briefcase}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/employer/jobs/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#659287] hover:bg-[#53786F] text-white font-semibold transition-colors shadow-lg shadow-[#659287]/30 self-start mt-0 md:mt-12"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#F0F6F2] rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            activeTab === 'active'
              ? 'bg-white text-[#2F4F46] shadow-sm'
              : 'text-[#4A6A60] hover:text-[#2F4F46]'
          }`}
        >
          Active Jobs
          {activeJobs.length > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'active'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {activeJobs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            activeTab === 'archived'
              ? 'bg-white text-[#2F4F46] shadow-sm'
              : 'text-[#4A6A60] hover:text-[#2F4F46]'
          }`}
        >
          Archived
          {archivedJobs.length > 0 && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'archived'
                ? 'bg-slate-200 text-slate-700'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {archivedJobs.length}
            </span>
          )}
        </button>
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
      <AnimatePresence mode="popLayout">
        {filteredJobs.length > 0 ? (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredJobs.map((job) => (
              <EmployerJobCard
                key={(job as any)._id || job.id}
                job={job}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onArchive={handleArchiveToggle}
                isArchived={activeTab === 'archived'}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white/60 backdrop-blur-lg border border-[#E6F2DD]/80 rounded-2xl shadow-sm"
          >
            {activeTab === 'archived' ? (
              <>
                <Archive className="w-12 h-12 text-[#B1D3B9] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#2F4F46]">No archived jobs</h2>
                <p className="text-[#4A6A60] mt-2">
                  Jobs you archive will appear here for future restoration.
                </p>
              </>
            ) : searchTerm ? (
              <>
                <Search className="w-12 h-12 text-[#B1D3B9] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#2F4F46]">No jobs found</h2>
                <p className="text-[#4A6A60] mt-2">
                  Your search for "{searchTerm}" did not match any jobs.
                </p>
              </>
            ) : (
              <>
                <Briefcase className="w-12 h-12 text-[#B1D3B9] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#2F4F46]">No active jobs</h2>
                <p className="text-[#4A6A60] mt-2 mb-6">
                  Start by posting your first job to attract talent.
                </p>
                <button
                  onClick={() => navigate('/employer/jobs/new')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#659287] hover:bg-[#53786F] text-white font-semibold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Post New Job
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteModal
          jobTitle={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}