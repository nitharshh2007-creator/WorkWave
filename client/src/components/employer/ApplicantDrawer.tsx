import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Video,
  Eye,
  Calendar,
} from 'lucide-react';

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);


const GithubIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

import { ApplicantStatusBadge } from './ApplicantStatusBadge';
import type { ApplicantType } from './ApplicantCard';
import NotesPanel from './NotesPanel';

interface ApplicantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: ApplicantType | null;
  onStatusChange: (status: any) => void;
  onSaveNotes: (notes: string) => void;
  onViewResume: (applicant: ApplicantType) => void;
}

export const ApplicantDrawer: React.FC<ApplicantDrawerProps> = ({
  isOpen,
  onClose,
  applicant,
  onStatusChange,
  onSaveNotes,
  onViewResume,
}) => {
  if (!isOpen || !applicant) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Drawer Panel */}
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-screen max-w-2xl bg-white flex flex-col shadow-2xl border-l border-[#E2ECE5]"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E2ECE5] bg-[#F7FAF8] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ApplicantStatusBadge status={applicant.status} />
                <span className="text-xs text-[#4A6A60] font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Applied {applicant.appliedDate}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl border border-[#E2ECE5] text-gray-400 hover:text-gray-600 hover:bg-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 bg-[#F7FAF8] border border-[#E2ECE5] rounded-3xl">
                <img
                  src={applicant.avatarUrl || `https://i.pravatar.cc/150?u=${applicant.id}`}
                  alt={applicant.name}
                  className="w-20 h-20 rounded-full border-2 border-white shadow-md object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${applicant.name}`;
                  }}
                />
                <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-[#2F4F46] leading-tight">{applicant.name}</h3>
                  <p className="text-sm font-semibold text-[#659287]">{applicant.currentRole}</p>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-[#4A6A60] pt-1">
                    {applicant.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {applicant.location}
                      </span>
                    )}
                    {applicant.email && (
                      <a href={`mailto:${applicant.email}`} className="flex items-center gap-1 hover:text-[#659287]">
                        <Mail className="w-3.5 h-3.5" /> {applicant.email}
                      </a>
                    )}
                    {applicant.phone && (
                      <a href={`tel:${applicant.phone}`} className="flex items-center gap-1 hover:text-[#659287]">
                        <Phone className="w-3.5 h-3.5" /> {applicant.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F0F6F2] p-2 rounded-2xl border border-[#88BDA4]/30">
                {applicant.resumeUrl ? (
                  <button
                    onClick={() => onViewResume(applicant)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-white text-[#2F4F46] border border-[#E2ECE5] rounded-xl hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#659287]" />
                    View Resume
                  </button>
                ) : (
                  <div
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-gray-50 text-gray-400 border border-[#E2ECE5] rounded-xl select-none"
                    title="No resume uploaded"
                  >
                    <FileText className="w-4 h-4 text-gray-300" />
                    No Resume
                  </div>
                )}
                {['Applied', 'Reviewed'].includes(applicant.status) && (
                  <button
                    onClick={() => onStatusChange('Reviewed')}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-white text-[#2F4F46] border border-[#E2ECE5] rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                    Review
                  </button>
                )}
                {['Applied', 'Reviewed', 'Shortlisted'].includes(applicant.status) && (
                  <button
                    onClick={() => onStatusChange('Shortlisted')}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-white text-[#2F4F46] border border-[#E2ECE5] rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Shortlist
                  </button>
                )}
                {['Shortlisted', 'Interview Scheduled'].includes(applicant.status) && (
                  <button
                    onClick={() => onStatusChange('Interview')}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-[#659287] text-white rounded-xl hover:bg-[#7BA89C] transition-all shadow-sm"
                  >
                    <Video className="w-4 h-4" />
                    {applicant.status === 'Interview Scheduled' ? 'Reschedule' : 'Interview'}
                  </button>
                )}
                {['Interview Scheduled', 'Interview Completed'].includes(applicant.status) && (
                  <>
                    {applicant.status === 'Interview Scheduled' && (
                      <button
                        onClick={() => onStatusChange('Interview Completed')}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => onStatusChange('Hired')}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Hire
                    </button>
                  </>
                )}
                {!['Hired', 'Rejected'].includes(applicant.status) && (
                  <button
                    onClick={() => onStatusChange('Rejected')}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-white text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-50 transition-all shadow-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                )}
              </div>

              {/* Status Selector dropdown */}
              <div className="flex items-center justify-between gap-4 p-4 border border-[#E2ECE5] rounded-2xl bg-white shadow-sm">
                <div>
                  <h4 className="text-sm font-bold text-[#2F4F46]">Application Stage</h4>
                  <p className="text-xs text-[#4A6A60]">Update candidate stage in recruitment funnel</p>
                </div>
                <select
                  value={applicant.status}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="h-10 px-3 text-sm font-semibold rounded-xl border border-[#E2ECE5] text-[#2F4F46] bg-white hover:bg-[#F7FAF8] outline-none transition-all focus:ring-2 focus:ring-[#659287]/50"
                >
                  <option value="Applied">Applied</option>
                  <option value="Reviewed">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Hired">Selected / Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Interview Details Section */}
              {applicant.interviewDate && (
                <div className="p-5 bg-amber-50/50 border border-amber-200/60 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-[#2F4F46] uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600" /> Scheduled Interview
                    </h4>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold">
                      {applicant.interviewStatus || 'Upcoming'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#4A6A60]">
                    <div>
                      <p className="font-bold text-[#2F4F46]">Date & Time</p>
                      <p className="mt-1">{applicant.interviewDate} at {applicant.interviewTime} ({applicant.interviewDuration || '30 mins'})</p>
                    </div>
                    <div>
                      <p className="font-bold text-[#2F4F46]">Mode</p>
                      <p className="mt-1">{applicant.interviewMode || 'Online'}</p>
                    </div>
                    {applicant.interviewMode !== 'Offline' && applicant.interviewLink && (
                      <div className="sm:col-span-2">
                        <p className="font-bold text-[#2F4F46]">Meeting Link</p>
                        <a
                          href={applicant.interviewLink.startsWith('http') ? applicant.interviewLink : `https://${applicant.interviewLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-blue-600 hover:underline break-all block font-semibold"
                        >
                          {applicant.interviewLink}
                        </a>
                      </div>
                    )}
                    {applicant.interviewMode === 'Offline' && applicant.interviewLocation && (
                      <div className="sm:col-span-2">
                        <p className="font-bold text-[#2F4F46]">Location / Venue</p>
                        <p className="mt-1">{applicant.interviewLocation}</p>
                      </div>
                    )}
                    {applicant.interviewMessage && (
                      <div className="sm:col-span-2">
                        <p className="font-bold text-[#2F4F46]">Message to Candidate</p>
                        <p className="mt-1 italic">"{applicant.interviewMessage}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Candidate Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Experience & Education */}
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-[#2F4F46] uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#659287]" /> Experience
                  </h4>
                  <div className="p-4 bg-white border border-[#E2ECE5] rounded-2xl space-y-2 shadow-sm">
                    <p className="text-sm font-bold text-[#2F4F46]">{applicant.currentRole}</p>
                    <p className="text-xs text-[#4A6A60]">{applicant.experience} professional history</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-[#2F4F46] uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#659287]" /> Education
                  </h4>
                  <div className="p-4 bg-white border border-[#E2ECE5] rounded-2xl space-y-2 shadow-sm">
                    <p className="text-sm font-bold text-[#2F4F46]">{applicant.education || 'B.Tech / MCA / Equivalent'}</p>
                    <p className="text-xs text-[#4A6A60]">Computer Science / Software Engineering</p>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {applicant.coverLetter && (
                <div className="space-y-3">
                  <h4 className="text-sm font-extrabold text-[#2F4F46] uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#659287]" /> Cover Letter
                  </h4>
                  <div className="p-4 bg-[#F8FAF8] border border-[#B1D3B9]/30 rounded-2xl text-xs text-[#4A6A60] leading-relaxed whitespace-pre-line shadow-sm">
                    "{applicant.coverLetter}"
                  </div>
                </div>
              )}

              {/* Skills */}
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-[#2F4F46] uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#659287]" /> Candidate Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {applicant.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3.5 py-1.5 text-xs font-bold text-[#2F4F46] bg-[#F0F6F2] border border-[#88BDA4]/40 rounded-xl"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social and Portfolios */}
              <div className="space-y-4">
                <h4 className="text-sm font-extrabold text-[#2F4F46] uppercase tracking-wider">Online Presence</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {applicant.linkedinUrl ? (
                    <a
                      href={applicant.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-3 bg-white border border-[#E2ECE5] rounded-2xl text-xs font-bold text-[#4A6A60] hover:text-[#659287] shadow-sm"
                    >
                      <LinkedinIcon className="w-4 h-4 text-blue-600" /> LinkedIn Profile
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-150 rounded-2xl text-xs font-bold text-gray-400 select-none">
                      <LinkedinIcon className="w-4 h-4 text-gray-300" /> LinkedIn: Not Provided
                    </div>
                  )}
                  {applicant.githubUrl ? (
                    <a
                      href={applicant.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-3 bg-white border border-[#E2ECE5] rounded-2xl text-xs font-bold text-[#4A6A60] hover:text-[#659287] shadow-sm"
                    >
                      <GithubIcon className="w-4 h-4 text-black" /> GitHub Profile
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-150 rounded-2xl text-xs font-bold text-gray-400 select-none">
                      <GithubIcon className="w-4 h-4 text-gray-300" /> GitHub: Not Provided
                    </div>
                  )}
                  {applicant.portfolioUrl ? (
                    <a
                      href={applicant.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-3 bg-white border border-[#E2ECE5] rounded-2xl text-xs font-bold text-[#4A6A60] hover:text-[#659287] shadow-sm"
                    >
                      <LinkIcon className="w-4 h-4 text-[#659287]" /> Personal Portfolio
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-150 rounded-2xl text-xs font-bold text-gray-400 select-none">
                      <LinkIcon className="w-4 h-4 text-gray-300" /> Portfolio: Not Provided
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Panel Component */}
              <div className="pt-2">
                <NotesPanel
                  candidateId={applicant.id}
                  initialNotes={applicant.notes}
                  onSave={onSaveNotes}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ApplicantDrawer;
