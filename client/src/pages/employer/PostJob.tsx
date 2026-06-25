import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { BriefcaseBusiness, Star, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import PostJobForm from "../../components/employer/PostJobForm";
import { getJobById } from "../../services/jobService";

const PostJob: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = !!id;

  const [jobData, setJobData] = useState<any>(null);
  const [loading, setLoading] = useState(isEditMode);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    // Try to use job data passed via router state first
    const stateJob = (location.state as any)?.job;
    if (stateJob) {
      setJobData(stateJob);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    const fetchJob = async () => {
      try {
        const res = await getJobById(id!);
        if (res.success && res.job) {
          setJobData(res.job);
        } else {
          setFetchError(true);
        }
      } catch (err) {
        console.error("Failed to load job for editing:", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, isEditMode, location.state]);

  return (
    <div className="bg-[#F7FAF8] min-h-full">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#2F4F46] via-[#659287] to-[#88BDA4] p-8 md:p-12 text-white shadow-[0_12px_40px_rgba(47,79,70,0.1)]"
        >
          {/* Decorative shapes */}
          <div className="absolute right-[-5%] top-[-20%] h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute right-[15%] bottom-[-30%] h-60 w-60 rounded-full bg-[#88BDA4]/10 blur-2xl" />

          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-white/10 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#88BDA4] flex items-center gap-1.5 backdrop-blur-md">
                  <Star size={12} className="fill-current" />
                  Premium Recruiter Portal
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
                {isEditMode ? "Edit Job" : "Post New Job"}
              </h1>
              <p className="max-w-xl text-sm md:text-base text-white/80 font-medium leading-relaxed">
                {isEditMode
                  ? "Update the details of your job posting. All changes will be reflected immediately."
                  : "Create premium opportunities, configure automated applicant screening, and reach talented developers and designers in the WorkWave community."}
              </p>
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="hidden lg:flex h-24 w-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 items-center justify-center text-white shadow-inner"
            >
              <BriefcaseBusiness size={40} className="text-[#88BDA4]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Form Area */}
        <div className="mt-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#659287]" />
              <span className="ml-3 text-[#4A6A60] font-medium">Loading job data...</span>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-[#2F4F46] mb-2">Failed to load job</h2>
              <p className="text-[#4A6A60]">Could not fetch the job data. Please go back and try again.</p>
            </div>
          ) : (
            <PostJobForm
              editMode={isEditMode}
              jobData={isEditMode ? jobData : undefined}
              jobId={isEditMode ? id : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PostJob;