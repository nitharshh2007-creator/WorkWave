import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  MapPin,
  IndianRupee,
  Sparkles,
  FileText,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import type { FormFields } from "../../types/jobForm"; // Shared type

interface ChecklistItem {
  id: string;
  label: string;
  filled: boolean;
}

interface PostJobSidebarProps {
  form: FormFields;
  checklistItems: ChecklistItem[];
}

export const PostJobSidebar: React.FC<PostJobSidebarProps> = ({ form, checklistItems }) => {
  const isFormEmpty =
    !form.title &&
    !form.company &&
    !form.location &&
    !form.description &&
    form.skills.length === 0 &&
    !form.salaryMin &&
    !form.salaryMax &&
    !form.deadline;

  const filledCount = checklistItems.filter((i) => i.filled).length;

  // Format currency
  const formatRupee = (val: string) => {
    const num = Number(val);
    if (isNaN(num) || !val) return "—";
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // Estimated reading/completion time estimate
  const estimatedCompletion = `${Math.max(1, 10 - completedCountMinutes(form))} min`;

  function completedCountMinutes(fields: FormFields) {
    let count = 0;
    if (fields.title) count += 1;
    if (fields.company) count += 1;
    if (fields.location) count += 1;
    if (fields.description) count += 2;
    if (fields.requirements) count += 2;
    if (fields.skills.length > 0) count += 1;
    if (fields.salaryMin && fields.salaryMax) count += 1;
    if (fields.deadline) count += 1;
    return count;
  }

  return (
    <div className="lg:sticky lg:top-8 space-y-8 pb-10">
      {/* 1. Form Completion Tracker Card */}
      <div className="rounded-[24px] border border-[#E2ECE5] bg-white p-6 shadow-[0_8px_30px_rgba(101,146,135,0.04)]">
        <h3 className="text-sm font-bold text-[#2F4F46] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers size={16} className="text-[#659287]" />
          Required Checklist
        </h3>

        <ul className="space-y-3">
          {checklistItems.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              {item.filled ? (
                <CheckCircle2 className="w-5 h-5 text-[#659287] shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-[#88BDA4]/30 shrink-0" />
              )}
              <span
                className={`text-sm transition-colors duration-200 ${
                  item.filled ? "text-[#2F4F46] font-semibold" : "text-[#2F4F46]/50"
                }`}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 pt-4 border-t border-[#E2ECE5] flex justify-between items-center text-xs text-[#2F4F46]/70">
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-[#2F4F46]/50 uppercase">Time to Complete</span>
            <span className="font-bold text-[#2F4F46] mt-0.5">{estimatedCompletion}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-semibold text-xs text-[#2F4F46]/50 uppercase">Required Fields</span>
            <span className="font-bold text-[#2F4F46] mt-0.5">
              {filledCount}/{checklistItems.length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Live Job Post Preview */}
      <div className="rounded-[24px] border border-[#E2ECE5] bg-white p-6 shadow-[0_8px_30px_rgba(101,146,135,0.04)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-[#2F4F46] uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-[#659287]" />
            Live Preview
          </h3>
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#88BDA4] animate-ping" />
        </div>

        <AnimatePresence mode="wait">
          {isFormEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-[#E2ECE5] rounded-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-[#F7FAF8] flex items-center justify-center text-[#88BDA4] mb-3">
                <FileText size={20} />
              </div>
              <p className="text-xs text-[#2F4F46]/50 font-medium max-w-[180px]">
                Your premium job card will dynamically render here as you fill in details.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-[#E2ECE5] bg-[#F7FAF8] p-5 space-y-4"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#659287] bg-[#659287]/10 px-2 py-0.5 rounded">
                  {form.jobType || "Full Time"}
                </span>
                <h4 className="text-base font-extrabold text-[#2F4F46] mt-2 leading-tight">
                  {form.title || "Untitled Job Opening"}
                </h4>
                <p className="text-xs text-[#2F4F46]/60 font-semibold mt-1">
                  {form.company || "Your Company Name"}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#E2ECE5]">
                {form.location && (
                  <div className="flex items-center gap-2 text-xs text-[#2F4F46]/70 font-medium">
                    <MapPin size={14} className="text-[#88BDA4]" />
                    <span>{form.location}</span>
                  </div>
                )}
                {(form.salaryMin || form.salaryMax) && (
                  <div className="flex items-center gap-2 text-xs text-[#2F4F46]/80 font-bold">
                    <IndianRupee size={14} className="text-[#659287]" />
                    <span>
                      {formatRupee(form.salaryMin)} – {formatRupee(form.salaryMax)}
                    </span>
                  </div>
                )}
                {form.deadline && (
                  <div className="flex items-center gap-2 text-xs text-[#2F4F46]/70 font-medium">
                    <Calendar size={14} className="text-[#88BDA4]" />
                    <span>Apply by: {form.deadline}</span>
                  </div>
                )}
              </div>

              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#E2ECE5]">
                  {form.skills.slice(0, 5).map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E2ECE5] text-[#2F4F46]"
                    >
                      {skill}
                    </span>
                  ))}
                  {form.skills.length > 5 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#659287]/10 text-[#659287]">
                      +{form.skills.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Small Info banner */}
      <div className="rounded-[24px] bg-[#2F4F46] p-6 text-white space-y-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-[#88BDA4]" size={20} />
          <h4 className="font-bold text-sm">Targeted Reach</h4>
        </div>
        <p className="text-xs text-white/80 leading-relaxed">
          Job posts on WorkWave are index-mapped to relevant candidate filters, delivering up to
          <strong> 3.5x higher application match rates</strong>.
        </p>
        <div className="flex items-center gap-1 text-xs font-semibold text-[#88BDA4] cursor-pointer hover:underline">
          <span>Learn about ATS matching</span>
          <ArrowRight size={12} />
        </div>
      </div>
    </div>
  );
};

export default PostJobSidebar;
