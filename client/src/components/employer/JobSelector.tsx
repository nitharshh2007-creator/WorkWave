import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Users, Calendar } from 'lucide-react';
import type { Job } from '../../services/jobService';

interface JobSelectorProps {
  jobs: Job[];
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
}

export const JobSelector: React.FC<JobSelectorProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
}) => {
  const formatPostedDate = (dateStr?: string): string => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Recently';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[#2F4F46]">Selected Job Position</h4>
        <span className="text-xs text-[#4A6A60] font-semibold">{jobs.length} Active Positions</span>
      </div>

      <div className="flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-[#88BDA4]/40 scrollbar-track-[#F7FAF8]">
        {jobs.map((job) => {
          const jobId = (job._id || job.id || '').toString();
          const isSelected = selectedJobId?.toString() === jobId;
          const count = job.applicants ?? 0;

          return (
            <motion.div
              key={jobId}
              whileHover={{ y: -2 }}
              onClick={() => onSelectJob(jobId)}
              className={`flex-shrink-0 w-72 p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#659287] shadow-md shadow-[#659287]/10 ring-2 ring-[#659287]/30'
                  : 'bg-white border-[#E2ECE5] hover:border-[#88BDA4] hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h5 className="font-bold text-sm text-[#2F4F46] line-clamp-1">{job.title}</h5>
                  {job.status === 'active' && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4A6A60] font-semibold mb-3">{job.company}</p>
              </div>

              <div className="space-y-1.5 border-t border-[#E2ECE5]/60 pt-2.5">
                <div className="flex items-center gap-2 text-[11px] text-[#4A6A60]">
                  <MapPin className="w-3.5 h-3.5 text-[#659287] flex-shrink-0" />
                  <span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#4A6A60]">
                  <Briefcase className="w-3.5 h-3.5 text-[#659287] flex-shrink-0" />
                  <span>{job.jobType || job.type || 'Full Time'}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-[11px] text-[#4A6A60] pt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Posted {formatPostedDate(job.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-[#659287]">
                    <Users className="w-3.5 h-3.5" />
                    <span>{count}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default JobSelector;
