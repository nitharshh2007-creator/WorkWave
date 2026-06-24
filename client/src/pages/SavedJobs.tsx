import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  IndianRupee,
  Users,
  Bookmark,
  Trash2,
  Globe,
  Code
} from 'lucide-react';
import toast from 'react-hot-toast';
import { type Job } from './jobs';
//import { getSavedJobs, unsaveJob } from '../services/savedJobsService';

// --- STAT CARD COMPONENT ---
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white border border-[#E6F2DD] rounded-2xl p-6 flex items-center gap-5"
  >
    <div className="bg-[#E6F2DD] text-[#659287] p-4 rounded-xl">{icon}</div>
    <div>
      <p className="text-3xl font-extrabold text-[#2F4F46]">{value}</p>
      <p className="text-base text-[#4A6A60] font-medium">{title}</p>
    </div>
  </motion.div>
);

// --- SAVED JOB CARD COMPONENT ---
const SavedJobCard: React.FC<{ job: Job; onRemove: (id: number) => void }> = ({ job, onRemove }) => {
  const navigate = useNavigate();
  const displayedSkills = job.skills.slice(0, 4);
  const remainingSkills = job.skills.length - 4;
  

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.07)' }}
      className="bg-white border border-[#B1D3B9]/50 rounded-3xl p-6 shadow-sm flex flex-col min-w-0"
    >
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E6F2DD] flex items-center justify-center text-[#659287] font-bold text-xl">
              {job.logo}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2F4F46]">{job.title}</h3>
              <p className="text-sm font-medium text-[#4A6A60]">{job.company}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5 text-sm text-[#4A6A60]">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#88BDA4]" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#88BDA4]" />
            <span>{job.type}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-[#88BDA4]" />
            <span>{job.salary.min.toLocaleString()}-{job.salary.max.toLocaleString()} / month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#88BDA4]" />
            <span>{job.applicants} applicants</span>
          </div>
        </div>

        <div className="mb-5">
          <h4 className="text-xs font-bold text-[#2F4F46] mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {displayedSkills.map(skill => (
              <span key={skill} className="px-2.5 py-1 text-xs font-semibold text-[#4A6A60] bg-[#E6F2DD] rounded-md">
                {skill}
              </span>
            ))}
            {remainingSkills > 0 && (
              <span className="px-2.5 py-1 text-xs font-semibold text-[#2F4F46] bg-gray-100 rounded-md">
                +{remainingSkills} More
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-2">
        <button
  onClick={() => onRemove(job.id)}
  className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-500 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1.5"
>
          <Trash2 className="w-3.5 h-3.5" />
          Remove
        </button>
        <button
          onClick={() => navigate(`/jobs/${job.id}`)}
          className="px-4 py-2 bg-white border border-[#B1D3B9] text-[#659287] text-xs font-bold rounded-lg hover:bg-[#E6F2DD] transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => navigate(`/jobs/${job.id}`)}
          className="px-4 py-2 bg-[#659287] text-white text-xs font-bold rounded-lg hover:bg-[#53786F] transition-colors"
        >
          Apply Now
        </button>
      </div>
    </motion.div>
  );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-[420px] w-full mx-auto space-y-6 border border-[#E6F2DD]"
      >
        <h3 className="text-2xl font-bold text-[#2F4F46] text-center">{title}</h3>
        <p className="text-[#4A6A60] text-center">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-xl border border-[#B1D3B9] bg-white text-[#2F4F46] font-semibold hover:bg-[#E6F2DD] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
          >
            Remove
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- MAIN SAVED JOBS PAGE ---
function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    setSavedJobs(saved);
  }, []);
  
  const handleRemoveClick = (id: number) => {
    setSelectedJobId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmRemove = () => {
    if (selectedJobId === null) return;
    const updatedJobs = savedJobs.filter(job => job.id !== selectedJobId);
    localStorage.setItem("savedJobs", JSON.stringify(updatedJobs));
    setSavedJobs(updatedJobs);
    toast.success("Job removed from saved jobs");
    setShowDeleteModal(false);
    setSelectedJobId(null);
  };

  const remoteJobsCount = useMemo(() => savedJobs.filter(job => job.location === 'Remote').length, [savedJobs]);
  const internshipCount = useMemo(() => savedJobs.filter(job => job.type === 'Internship').length, [savedJobs]);

  const filteredJobs = useMemo(() => {
    return savedJobs.filter(job => {
      const matchesSearch = searchTerm === '' ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [searchTerm, savedJobs]);

  return (
    <>
      <div className="w-full max-w-full overflow-x-hidden px-4 lg:px-8 space-y-8 pb-12">
        {/* 1. Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-left pt-8 space-y-2"
        >
          <h1
  style={{
    color: "#2F4F46",
    opacity: 1,
    fontWeight: 800,
    fontSize: "3rem",
    letterSpacing: "-0.02em",
    lineHeight: "1.1",
  }}
>Saved Jobs</h1>
          <p className="text-lg text-[#4A6A60]">
            Track opportunities you are interested in and apply when ready.
          </p>
        </motion.div>

        {/* 2. Top Statistics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Saved Jobs" value={savedJobs.length} icon={<Bookmark className="w-7 h-7" />} />
          <StatCard title="Remote Jobs" value={remoteJobsCount} icon={<Globe className="w-7 h-7" />} />
          <StatCard title="Internships" value={internshipCount} icon={<Code className="w-7 h-7" />} />
        </div>

        {/* 3. Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#88BDA4]" />
          <input
            type="text"
            placeholder="Search by Job Title, Company, Skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-4 text-base rounded-xl border border-[#B1D3B9]/70 bg-white text-[#2F4F46] placeholder:text-[#4A6A60]/80 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#659287]/50 focus:border-[#659287]"
          />
        </div>

        {/* 4. Saved Jobs Grid */}
        {savedJobs.length > 0 ? (
          filteredJobs.length > 0 ? (
           <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
              {filteredJobs.map(job => (
                <SavedJobCard key={job.id} job={job} onRemove={handleRemoveClick} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-[#E6F2DD] rounded-3xl">
              <h2 className="text-xl font-bold text-[#2F4F46]">No matching jobs found</h2>
              <p className="text-[#4A6A60] mt-2">Try a different search term.</p>
            </div>
          )
        ) : (
          // 5. Empty State
          <div className="text-center py-20 bg-white border border-[#E6F2DD] rounded-3xl">
            <Bookmark className="w-12 h-12 text-[#B1D3B9] mx-auto mb-4" />
            <h2
  style={{
    color: "#2F4F46",
    opacity: 1,
    fontWeight: 500,
    fontSize: "1rem",
    letterSpacing: "-0.02em",
    lineHeight: "1.1",
  }}
>No Saved Jobs Yet</h2>
            <p className="text-[#4A6A60] mt-2 mb-6">Jobs you bookmark will appear here.</p>
            <button
              onClick={() => navigate('/jobs')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#659287] hover:bg-[#53786F] text-white font-semibold transition-colors"
            >
              Browse Jobs
            </button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {showDeleteModal && (
          <ConfirmationModal
            isOpen={showDeleteModal}
            onConfirm={handleConfirmRemove}
            onCancel={() => setShowDeleteModal(false)}
            title="Remove Saved Job"
            message="Are you sure you want to remove this job from your saved jobs list?"
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default SavedJobs;