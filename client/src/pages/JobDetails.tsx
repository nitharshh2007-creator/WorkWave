import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Calendar,
  ArrowLeft,
  Bookmark,
  Share2,
  Clock,
  CheckCircle,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

import { type Job, jobs } from './jobs';

// Main Component
const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [job, setJob] = useState<Job | undefined>(undefined);

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
        const foundJob = jobs.find(j => j.id === Number(id));
        setJob(foundJob);
        setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Job unsaved!' : 'Job saved successfully!');
  };

  const handleShare = () => {
    if (job && navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this amazing job opportunity: ${job.title} at ${job.company}`,
        url: window.location.href,
      })
      .then(() => toast.success('Job shared successfully!'))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error('Could not share job.');
        }
      });
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('Job link copied to clipboard'))
        .catch(() => toast.error('Could not copy link.'));
    }
  };

  const handleApply = async () => {
      try {
        if (!job) return;

        const response = await api.post("/applications", {
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          status: "Pending",
        });

        toast.success("Application submitted successfully!");

        navigate("/applications");
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.response?.data?.message || "Failed to submit application"
        );
      }
    };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#659287]"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
          <h1 className="text-2xl font-bold text-[#2F4F46] mb-4">Job Not Found</h1>
          <p className="text-[#4A6A60] mb-8">The job you are looking for does not exist.</p>
          <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 text-sm font-semibold text-[#2F4F46] hover:text-[#53786F] transition-colors py-2 px-4 border border-[#B1D3B9] rounded-lg">
              <ArrowLeft className="w-4 h-4" />
              Back to Jobs
          </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Header and Back Button */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 text-sm font-semibold text-[#2F4F46] hover:text-[#53786F] transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Job Details */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white border border-[#E6F2DD] rounded-3xl p-6 sm:p-8 space-y-12"
          >
            {/* Job Header */}
            <div className="bg-white -m-8 mb-0 p-8 rounded-t-3xl border-b border-[#E6F2DD]">
              <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-xl bg-[#B1D3B9] flex items-center justify-center text-[#2F4F46] font-bold text-3xl border border-[#B1D3B9]/50">
                          {job.logo}
                      </div>
                      <div className="space-y-2">
                        <h1
  className="text-4xl lg:text-5xl font-bold leading-tight"
  style={{
    color: "#2F4F46"
  }}
>
  {job.title}
</h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-[#4A6A60] font-medium">
                          <span
  className="font-semibold text-lg"
  style={{ color: "#659287" }}
>{job.company}</span>
                          <span className='hidden sm:inline text-[#B1D3B9]'>&bull;</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#2F4F46]" /> {job.location}</span>
                           <span className='hidden sm:inline text-[#B1D3B9]'>&bull;</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#659287]" /> Posted {job.postedDate}</span>
                        </div>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={handleSave} className={`p-2.5 rounded-full transition-all duration-300 ${isSaved ? 'bg-rose-100 text-rose-500 scale-110' : 'bg-[#F8FAF8] text-[#88BDA4] hover:bg-[#B1D3B9]/30'}`}>
                          <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={handleShare} className="p-2.5 rounded-full bg-[#F8FAF8] text-[#88BDA4] hover:bg-[#E6F2DD] transition-colors">
                          <Share2 className="w-5 h-5" />
                      </button>
                  </div>
              </div>
            </div>

            {/* Job Information Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard icon={IndianRupee} label="Salary" value={`${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`} />
              <InfoCard icon={Briefcase} label="Job Type" value={job.type} />
              <InfoCard icon={MapPin} label="Location" value={job.location} />
              <InfoCard icon={Users} label="Applicants" value={job.applicants?.toString() || 'N/A'} />
            </div>

            {/* Company Overview */}
            <div>
                <h2
  className="text-2xl font-bold mb-4"
  style={{ color: "#2F4F46" }}
>
  About Company
</h2>
                <p className="text-base text-[#4A6A60]">{job.companyDescription}</p>
            </div>

            {/* Job Description */}
            <div>
                <h2
  className="text-2xl font-bold mb-4"
  style={{ color: "#2F4F46" }}
>
  Job Description
</h2>
                <div className="prose prose-base max-w-none text-[#4A6A60] prose-h4:text-[#2F4F46] prose-ul:text-[#4A6A60] prose-li:text-[#4A6A60]" dangerouslySetInnerHTML={{ __html: job.description }} />
            </div>

            {/* Required Skills */}
            <div className="space-y-4">
              <h2
  className="text-2xl font-bold"
  style={{ color: "#2F4F46" }}
>
  Required Skills
</h2>
              <div className="flex flex-wrap gap-3">
                {job.skills.map(skill => (
                  <span key={skill} className="px-4 py-2 text-sm font-semibold text-[#2F4F46] bg-[#E6F2DD] rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Deadline */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}>
            <div className="border-t border-[#E6F2DD] pt-6 flex items-center justify-between text-base">
                <div className="flex items-center gap-2 text-[#4A6A60]">
                    <span className='font-bold text-[#2F4F46]'>Apply Before</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-rose-600">
                    <Calendar className="w-5 h-5" />
                    <span>{job.deadline}</span>
                </div>
            </div>
          </motion.div>
          </motion.div>

          {/* Right Column: Apply Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          />
        </div>
    </div>
  );
};

const InfoCard: React.FC<{ icon: React.ElementType, label: string, value: string }> = ({ icon: Icon, label, value }) => (
  <div className="bg-white p-4 rounded-xl border border-[#B1D3B9] shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4 text-[#659287]" />
      <p className="text-sm font-bold text-[#2F4F46]">{label}</p>
    </div>
    <p className="font-semibold text-base text-[#2F4F46]">{value}</p>
  </div>
);

const ChecklistItem: React.FC<{ isChecked: boolean; label: string }> = ({ isChecked, label }) => (
  <div className="flex items-center gap-4">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${isChecked ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
        <CheckCircle strokeWidth={2.5} className="w-4 h-4" />
      </div>
      <p className="text-base font-semibold text-[#2F4F46]">{label}</p>
  </div>
);

export default JobDetails;