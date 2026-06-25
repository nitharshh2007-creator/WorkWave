import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Users, 
  Bookmark, 
  Clock,
  Sparkles,
  FilterX,
  Globe,
  Zap,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Job } from './jobs';
import { getJobs } from '../services/jobService';
import HeroCard from '../components/HeroCard';
import api from '../services/api';

const filterChips = ['All', 'Internship', 'Full Time', 'Part Time', 'Remote', 'Frontend', 'Backend', 'UI/UX'];

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
const isJobSaved = (jobId: string | number) => {
  const savedJobs = JSON.parse(
    localStorage.getItem("savedJobs") || "[]"
  );

  return savedJobs.some(
    (job: any) => job.id === jobId
  );
};
// --- JOB CARD COMPONENT ---
const JobCard: React.FC<{ job: Job; hasApplied: boolean }> = ({ job, hasApplied }) => {
  const [isSaved, setIsSaved] = useState(() => isJobSaved(job.id));
  const navigate = useNavigate();
const saveJob = (job: Job) => {
  const savedJobs = JSON.parse(
    localStorage.getItem("savedJobs") || "[]"
  );

  const exists = savedJobs.some(
    (savedJob: Job) => savedJob.id === job.id
  );

  if (exists) return false;

  savedJobs.push(job);

  localStorage.setItem(
    "savedJobs",
    JSON.stringify(savedJobs)
  );

  return true;
};

const unsaveJob = (jobId: string | number) => {
  const savedJobs = JSON.parse(
    localStorage.getItem("savedJobs") || "[]"
  );

  const updatedJobs = savedJobs.filter(
    (job: Job) => job.id !== jobId
  );

  localStorage.setItem(
    "savedJobs",
    JSON.stringify(updatedJobs)
  );
};
  const handleSave = () => {
    if (isSaved) {
      unsaveJob(job.id);
      setIsSaved(false);
      toast.success('Job unsaved!');
    } else {
      const success = saveJob(job);
      if (success) {
        setIsSaved(true);
        toast.success('Job saved successfully!');
      } else {
        toast.error('Job already saved!');
      }
    }
  };

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
            <div 
              onClick={(e) => {
                e.stopPropagation();
                const companyId = (job as any).createdBy?._id || (job as any).createdBy;
                if (companyId) navigate(`/companies/${companyId}`);
              }}
              className="w-12 h-12 rounded-xl bg-[#E6F2DD] flex items-center justify-center text-[#659287] font-bold text-xl cursor-pointer hover:opacity-80 transition-opacity"
            >
              {job.logo}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2F4F46]">{job.title}</h3>
              <p 
                onClick={(e) => {
                  e.stopPropagation();
                  const companyId = (job as any).createdBy?._id || (job as any).createdBy;
                  if (companyId) navigate(`/companies/${companyId}`);
                }}
                className="text-sm font-medium text-[#4A6A60] cursor-pointer hover:underline hover:text-[#659287]"
              >
                {job.company}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className={`p-2 rounded-full transition-colors ${
              isSaved
                ? 'bg-rose-100 text-rose-500'
                : 'bg-gray-100 text-[#88BDA4] hover:bg-[#E6F2DD] hover:text-[#659287]'
            }`}
          >
            <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
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
        <div className="flex items-center gap-1.5 text-xs text-[#4A6A60]/90 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>Posted {job.postedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/jobs/${job.id}`)}
            className="px-4 py-2 bg-white border border-[#B1D3B9] text-[#659287] text-xs font-bold rounded-lg hover:bg-[#E6F2DD] transition-colors"
          >
            View Details
          </button>
          {hasApplied ? (
            <button
              disabled
              className="px-4 py-2 bg-gray-100 border border-gray-200 text-gray-400 text-xs font-bold rounded-lg cursor-not-allowed flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Applied
            </button>
          ) : (
            <button
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="px-4 py-2 bg-[#659287] text-white text-xs font-bold rounded-lg hover:bg-[#53786F] transition-colors"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- SKELETON CARD ---
const SkeletonCard = () => (
  <div className="bg-white/80 border border-[#B1D3B9]/30 rounded-3xl p-6 shadow-sm animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
        <div>
          <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="w-9 h-9 rounded-full bg-gray-200"></div>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-5">
      <div className="h-4 w-24 bg-gray-200 rounded"></div>
      <div className="h-4 w-20 bg-gray-200 rounded"></div>
      <div className="h-4 w-32 bg-gray-200 rounded"></div>
      <div className="h-4 w-28 bg-gray-200 rounded"></div>
    </div>
    <div className="mb-5">
      <div className="h-3 w-12 bg-gray-200 rounded mb-2"></div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-16 bg-gray-200 rounded-md"></div>
        <div className="h-6 w-20 bg-gray-200 rounded-md"></div>
        <div className="h-6 w-24 bg-gray-200 rounded-md"></div>
      </div>
    </div>
    <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
      <div className="h-4 w-20 bg-gray-200 rounded"></div>
      <div className="h-8 w-28 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

// --- MAIN JOBS PAGE ---
function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [myApplications, setMyApplications] = useState<any[]>([]);

  const fetchMyApplications = async () => {
    try {
      const { data } = await api.get('/applications/my');
      setMyApplications(data || []);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      const jobList = data?.jobs || data || [];
      const mappedJobs = jobList.map((j: any) => ({
        ...j,
        id: j._id || j.id,
        logo: j.company ? j.company.charAt(0) : 'J',
        type: j.jobType || j.type || 'Full Time',
        postedDate: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : 'Just now'
      }));
      setJobs(mappedJobs);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  const availableJobs = jobs.length;
  const newThisWeek = useMemo(() => {
    return jobs.filter(job => {
      if (!(job as any).createdAt) return false;
      const diffTime = Math.abs(new Date().getTime() - new Date((job as any).createdAt).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;
  }, [jobs]);

  const remoteJobs = useMemo(() => jobs.filter(job => job.location === 'Remote').length, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesFilter = activeFilter === 'All' || job.type === activeFilter || (activeFilter === 'Remote' && job.location === 'Remote') || job.skills.includes(activeFilter);
      
      const matchesSearch = searchTerm === '' ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [jobs, searchTerm, activeFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setActiveFilter('All');
    toast.success('Filters reset!');
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 lg:px-8 space-y-8 pb-12">
        {/* 1. Header Section */}
        <HeroCard
          badgeText="Candidate Opportunity Center"
          title="Find Your Next Opportunity"
          description="Discover internships, part-time roles, and full-time opportunities tailored for your skills in the WorkWave community."
          IconComponent={Briefcase}
        />

        {/* 2. Search Section */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#88BDA4]" />
          <input
            type="text"
            placeholder="Search jobs, companies, skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-4 text-base rounded-xl border border-[#B1D3B9]/70 bg-white text-[#2F4F46] placeholder:text-[#4A6A60]/80 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#659287]/50 focus:border-[#659287]"
          />
        </div>

        {/* 8. Statistics Section */}
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
          <StatCard title="Available Jobs" value={availableJobs} icon={<Briefcase className="w-7 h-7" />} />
          <StatCard title="New This Week" value={newThisWeek} icon={<Zap className="w-7 h-7" />} />
          <StatCard title="Remote Opportunities" value={remoteJobs} icon={<Globe className="w-7 h-7" />} />
        </div>

        {/* 3. Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {filterChips.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 ${
                activeFilter === filter
                  ? 'bg-[#659287] text-white shadow-md'
                  : 'bg-white text-[#4A6A60] border border-[#B1D3B9]/80 hover:bg-[#E6F2DD] hover:border-[#659287]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* 4. Jobs Grid */}
        {loading ? (
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            {filteredJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                hasApplied={myApplications.some((app: any) => {
                  const appJobId = app.job?._id || app.job?.id || app.job || '';
                  return appJobId.toString() === job.id.toString();
                })}
              />
            ))}
          </div>
        ) : (
          // 7. Empty State
          <div className="text-center py-20 bg-white border border-[#E6F2DD] rounded-3xl">
            <Sparkles className="w-12 h-12 text-[#B1D3B9] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#2F4F46]">No matching jobs found</h2>
            <p className="text-[#4A6A60] mt-2 mb-6">Try adjusting your search or filters.</p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#659287] hover:bg-[#53786F] text-white font-semibold transition-colors"
            >
              <FilterX className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        )}
    </div>
  );
}

export default Jobs;
