import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Calendar,
  ArrowLeft,
  Bookmark,
  Share2,
  Clock,
  Users,
  FileText,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

import type { Job } from './jobs';
import { getJobById } from '../services/jobService';

// Main Component
const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [job, setJob] = useState<Job | undefined>(undefined);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        if (!id) return;
        const res = await getJobById(id);
        const jobData = res?.job || res;
        if (jobData) {
          setJob({
            ...jobData,
            id: jobData._id || jobData.id,
            type: jobData.jobType || jobData.type || 'Full Time'
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    fetchJobData();
  }, [id]);

  useEffect(() => {
    const checkAppliedStatus = async () => {
      try {
        if (!id) return;
        const { data } = await api.get('/applications/my');
        const applied = data.some((app: any) => {
          const appJobId = app.job?._id || app.job?.id || app.job || '';
          return appJobId.toString() === id.toString();
        });
        setHasApplied(applied);
      } catch (err) {
        console.error('Error checking application status:', err);
      }
    };
    if (id && !loading) {
      checkAppliedStatus();
    }
  }, [id, loading]);

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
    if (hasApplied) {
      toast.error("You have already applied for this job.");
      return;
    }
    try {
      if (!job) return;
      setApplying(true);

      await api.post("/applications", {
        job: job.id || (job as any)._id,
        coverLetter: coverLetter,
      });

      toast.success("Application submitted successfully!");
      setHasApplied(true);
      setShowApplyModal(false);
      navigate("/applications");
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 409) {
        toast.error("You have already applied for this job.");
        setHasApplied(true);
        setShowApplyModal(false);
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to submit application"
        );
      }
    } finally {
      setApplying(false);
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
                      <div 
                        onClick={() => {
                          const companyId = (job as any).createdBy?._id || (job as any).createdBy;
                          if (companyId) navigate(`/companies/${companyId}`);
                        }}
                        className="w-20 h-20 rounded-xl bg-[#B1D3B9] flex items-center justify-center text-[#2F4F46] font-bold text-3xl border border-[#B1D3B9]/50 cursor-pointer hover:opacity-90 transition-opacity"
                      >
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
                            onClick={() => {
                              const companyId = (job as any).createdBy?._id || (job as any).createdBy;
                              if (companyId) navigate(`/companies/${companyId}`);
                            }}
                            className="font-semibold text-lg cursor-pointer hover:underline"
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
          >
            <div className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-[#2F4F46]">Apply for this Position</h3>
              <p className="text-xs text-[#4A6A60] leading-relaxed">
                Submit your application for the <strong>{job.title}</strong> role at <strong>{job.company}</strong>.
              </p>
              <button
                onClick={() => {
                  if (hasApplied) return;
                  setShowApplyModal(true);
                }}
                disabled={hasApplied}
                className={`w-full py-3 text-xs font-bold rounded-xl transition-all shadow-sm ${
                  hasApplied
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    : 'bg-[#659287] hover:bg-[#2F4F46] text-white cursor-pointer'
                }`}
              >
                {hasApplied ? 'Applied' : 'Apply Now'}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Cover Letter Modal */}
        <AnimatePresence>
          {showApplyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-6 border border-[#B1D3B9] shadow-xl relative"
              >
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-xl border border-[#E2ECE5] text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div>
                  <h3 className="text-xl font-bold text-[#2F4F46]">Apply to {job.company}</h3>
                  <p className="text-xs text-[#4A6A60] mt-1">Role: {job.title} &bull; {job.location}</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-[#F4F9F4] rounded-2xl border border-[#B1D3B9]/30 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-[#659287]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#2F4F46]">Resume from Profile</p>
                      <p className="text-[11px] text-[#4A6A60] truncate">Will be submitted automatically with your profile details.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2F4F46] mb-2">Cover Letter (Optional)</label>
                    <textarea
                      placeholder="Introduce yourself and explain why you're a great fit for this role..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={5}
                      className="w-full p-4 text-sm rounded-xl border border-[#B1D3B9]/70 bg-[#F8FAF8] text-[#2F4F46] placeholder:text-[#4A6A60]/50 outline-none resize-none transition-all focus:ring-2 focus:ring-[#659287]/50 focus:border-[#659287]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="px-5 py-2.5 rounded-xl bg-[#659287] hover:bg-[#2F4F46] text-white font-semibold text-xs transition-colors shadow-md shadow-[#659287]/20 flex items-center gap-1.5"
                  >
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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

export default JobDetails;