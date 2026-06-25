import React from 'react';
import { motion } from 'framer-motion';
import { Star, FileText, Trash2, Eye } from 'lucide-react';
import { ApplicantStatusBadge } from './ApplicantStatusBadge';
import type { ApplicantStatus } from './ApplicantStatusBadge';

export interface ApplicantType {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatarUrl: string;
  currentRole: string;
  skills: string[];
  appliedDate: string;
  status: ApplicantStatus;
  matchScore: number;
  experience: string;
  education?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  notes?: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewLink?: string;
  interviewNotes?: string;
  interviewMessage?: string;
  interviewMode?: string;
  interviewStatus?: string;
  interviewDuration?: string;
  interviewLocation?: string;
  resumeUrl?: string;
  coverLetter?: string;
}

interface ApplicantCardProps {
  applicant: ApplicantType;
  onViewDetails: (applicant: ApplicantType) => void;
  onViewResume: (applicant: ApplicantType) => void;
  onShortlist?: (applicant: ApplicantType) => void;
  onReject?: (applicant: ApplicantType) => void;
  onDelete: (applicant: ApplicantType) => void;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicant,
  onViewDetails,
  onViewResume,
  onDelete,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(47, 79, 70, 0.08)' }}
      className="bg-white border border-[#E2ECE5] rounded-2xl p-5 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-3.5">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={applicant.avatarUrl || `https://i.pravatar.cc/150?u=${applicant.id}`}
              alt={applicant.name}
              className="w-12 h-12 rounded-full object-cover border border-[#E2ECE5] flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${applicant.name}`;
              }}
            />
            <div className="min-w-0">
              <h4 className="text-base font-bold text-[#2F4F46] truncate">{applicant.name}</h4>
              <p className="text-xs text-[#4A6A60] truncate">{applicant.currentRole}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <ApplicantStatusBadge status={applicant.status} />
            <button
              onClick={() => onDelete(applicant)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Remove Application"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs text-[#4A6A60]">
            <span>Experience:</span>
            <span className="font-semibold text-[#2F4F46]">{applicant.experience}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#4A6A60]">
            <span>Match Score:</span>
            <div className="flex items-center gap-1 font-bold text-[#659287]">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{applicant.matchScore}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-[#4A6A60]">
            <span>Applied:</span>
            <span>{applicant.appliedDate}</span>
          </div>
        </div>

        {/* Skills */}
        {applicant.skills && applicant.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {applicant.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-[10px] font-semibold text-[#4A6A60] bg-[#F7FAF8] border border-[#E2ECE5] rounded-md"
              >
                {skill}
              </span>
            ))}
            {applicant.skills.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] font-bold text-[#659287]">
                +{applicant.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="border-t border-[#E2ECE5] pt-3.5 flex items-center justify-between gap-2.5">
        {applicant.resumeUrl ? (
          <button
            onClick={() => onViewResume(applicant)}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-[#659287] bg-white border border-[#E2ECE5] rounded-xl hover:bg-[#F7FAF8] transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            Resume
          </button>
        ) : (
          <div
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-gray-400 bg-gray-50 border border-gray-200 rounded-xl select-none"
            title="No resume uploaded"
          >
            <FileText className="w-3.5 h-3.5 text-gray-300" />
            No Resume
          </div>
        )}
        <button
          onClick={() => onViewDetails(applicant)}
          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-white bg-[#659287] rounded-xl hover:bg-[#7BA89C] transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
      </div>
    </motion.div>
  );
};

export default ApplicantCard;
