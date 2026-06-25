import React from 'react';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Briefcase, Sparkles, BookOpen, UserPlus, Target } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-jobs' | 'no-applications';
  onCreateJob?: () => void;
  onRefresh?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onCreateJob, onRefresh }) => {
  const isNoJobs = type === 'no-jobs';

  const tips = [
    { icon: Sparkles, text: "Write clear, role-specific titles to stand out in candidates' searches." },
    { icon: BookOpen, text: "Detail daily responsibilities and growth paths to attract serious talent." },
    { icon: Target, text: "List must-have skills separately from nice-to-have capabilities." },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center p-8 md:p-16 bg-white border border-[#E2ECE5] rounded-3xl shadow-sm max-w-2xl mx-auto my-8"
    >
      {/* Illustration / Icon Container */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[#88BDA4]/10 rounded-full blur-2xl transform scale-150 animate-pulse" />
        <div className="relative w-24 h-24 bg-[#F7FAF8] border-2 border-[#E2ECE5] rounded-2xl flex items-center justify-center shadow-inner">
          {isNoJobs ? (
            <Briefcase className="w-12 h-12 text-[#659287]" />
          ) : (
            <UserPlus className="w-12 h-12 text-[#659287]" />
          )}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-[#2F4F46] mb-3">
        {isNoJobs ? 'No Jobs Available' : 'No Applications Yet'}
      </h3>
      <p className="text-base text-[#4A6A60] max-w-md mb-8 leading-relaxed">
        {isNoJobs
          ? 'Create your first job posting to begin receiving applications and build your dream team.'
          : 'Once candidates begin applying to your job postings, they will appear here automatically.'}
      </p>

      {isNoJobs ? (
        <div className="flex items-center gap-4">
          {onCreateJob && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateJob}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#659287] hover:bg-[#7BA89C] text-white font-bold transition-all shadow-md shadow-[#659287]/20"
            >
              <Plus className="w-5 h-5" />
              Create Job
            </motion.button>
          )}
          {onRefresh && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRefresh}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#E2ECE5] text-[#2F4F46] bg-white font-semibold hover:bg-[#F7FAF8] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
          )}
        </div>
      ) : (
        <div className="w-full border-t border-[#E2ECE5] pt-6 mt-2 text-left">
          <h4 className="text-sm font-bold text-[#2F4F46] mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#88BDA4]" />
            Hiring Tips to Attract Candidates
          </h4>
          <div className="space-y-3">
            {tips.map((tip, idx) => {
              const Icon = tip.icon;
              return (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#F7FAF8] border border-[#E2ECE5]/50">
                  <Icon className="w-5 h-5 text-[#659287] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[#4A6A60] leading-relaxed">{tip.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
