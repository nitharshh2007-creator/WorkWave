import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, FileText, Clipboard, ExternalLink, CalendarDays, AlertCircle, MapPin } from 'lucide-react';
import api from '../services/api';
import HeroCard from '../components/HeroCard';
import { toast } from 'react-hot-toast';

interface InterviewApplication {
  _id: string;
  jobTitle: string;
  company: string;
  location: string;
  status: string;
  notes: string;
  interviewDate: string;
  interviewTime: string;
  interviewMode?: 'Google Meet' | 'Microsoft Teams' | 'Zoom' | 'Offline';
  interviewLocation?: string;
  interviewDuration?: string;
  interviewMessage?: string;
  interviewNotes?: string;
  meetingLink: string;
  interviewStatus: 'Upcoming' | 'Completed' | 'Cancelled';
  updatedAt: string;
}

export const CandidateInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<InterviewApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/applications/my');
      // Filter applications that have interview scheduled/completed with details
      const interviewApps = (response.data || []).filter(
        (app: any) =>
          (app.status === 'Interview Scheduled' || app.status === 'Interview Completed' || app.status === 'Interview') &&
          app.interviewDate &&
          app.interviewTime
      );
      setInterviews(interviewApps);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load interview schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Meeting link copied to clipboard!');
  };

  const getStatusStyle = (status: 'Upcoming' | 'Completed' | 'Cancelled') => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-150';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-150';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-150';
    }
  };

  return (
    <div className="space-y-8 p-6 min-h-screen bg-[#F7FAF8]">
      <HeroCard
        badgeText="Interviews Hub"
        title="Scheduled Interview Calls"
        description="Check your upcoming and past interview calls, join digital meetings, and review interviewer briefs."
        IconComponent={CalendarDays}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-[#659287] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#4A6A60] font-semibold">Loading your interview schedule...</p>
        </div>
      ) : interviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E2ECE5] p-12 text-center rounded-3xl shadow-sm max-w-md mx-auto"
        >
          <Calendar className="w-16 h-16 text-[#659287] mx-auto mb-4 opacity-50" />
          <h3 className="font-extrabold text-[#2F4F46] text-xl mb-2">No Interviews Scheduled</h3>
          <p className="text-[#4A6A60] text-sm leading-relaxed">
            Your upcoming interviews will appear here after an employer schedules one.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interviews.map((app) => {
            const scheduledDate = app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : 'N/A';
            const mode = app.interviewMode || 'Google Meet';

            return (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(47, 79, 70, 0.06)' }}
                className="bg-white border border-[#E2ECE5] rounded-3xl p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Company Logo, Name, Job Title & Status */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#659287]/10 text-[#659287] flex items-center justify-center font-extrabold text-lg border border-[#E2ECE5] flex-shrink-0">
                        {app.company.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-extrabold text-[#2F4F46] truncate leading-tight">
                          {app.jobTitle}
                        </h4>
                        <p className="text-xs font-bold text-[#659287] mt-0.5">{app.company}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${getStatusStyle(app.interviewStatus)}`}>
                      {app.interviewStatus}
                    </span>
                  </div>

                  {/* Interview Time and Details */}
                  <div className="grid grid-cols-2 gap-3.5 bg-[#F7FAF8] border border-[#E2ECE5] p-3.5 rounded-2xl mb-4 text-xs font-semibold text-[#4A6A60]">
                    <div className="space-y-1">
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#659287]" /> Date
                      </p>
                      <p className="font-bold text-[#2F4F46]">{app.interviewDate || 'To be decided'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#659287]" /> Time
                      </p>
                      <p className="font-bold text-[#2F4F46]">
                        {app.interviewTime || 'To be decided'}{' '}
                        {app.interviewDuration ? `(${app.interviewDuration})` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Mode, Platform, and Link/Venue */}
                  <div className="bg-[#F8FAF8] border border-[#E2ECE5]/60 rounded-2xl p-3.5 space-y-2.5 text-xs font-semibold text-[#4A6A60] mb-4">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#659287]" />
                      <span>
                        Mode: <strong className="text-[#2F4F46]">{mode}</strong>
                      </span>
                    </div>

                    {mode === 'Offline' ? (
                      app.interviewLocation && (
                        <div className="pt-2 border-t border-[#E2ECE5]/40 flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#659287] mt-0.5 flex-shrink-0" />
                          <span className="leading-relaxed">
                            Venue: <strong className="text-[#2F4F46]">{app.interviewLocation}</strong>
                          </span>
                        </div>
                      )
                    ) : (
                      app.meetingLink && (
                        <div className="pt-2 border-t border-[#E2ECE5]/40 flex items-center justify-between gap-4">
                          <span className="truncate flex-1">
                            Link:{' '}
                            <a
                              href={app.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#659287] underline font-bold"
                            >
                              {app.meetingLink}
                            </a>
                          </span>
                          <button
                            onClick={() => handleCopyLink(app.meetingLink)}
                            className="p-1.5 text-[#659287] hover:bg-[#659287]/10 rounded-lg transition-colors cursor-pointer"
                            title="Copy Meeting Link"
                          >
                            <Clipboard className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  {/* Employer Notes / message */}
                  {(app.interviewMessage || app.interviewNotes) && (
                    <div className="p-3.5 border border-[#E2ECE5] bg-[#F0F6F2]/30 rounded-2xl mb-4 text-xs">
                      <p className="font-bold text-[10px] uppercase text-[#659287] tracking-wider mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-[#659287]" /> Employer Message
                      </p>
                      <p className="text-[#5E7C72] leading-relaxed italic">
                        "{app.interviewMessage || app.interviewNotes}"
                      </p>
                    </div>
                  )}

                  <div className="text-[10px] text-gray-400 font-semibold mb-4">
                    Scheduled on: {scheduledDate}
                  </div>
                </div>

                {/* Bottom Button Toolbar */}
                <div className="border-t border-[#E2ECE5] pt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2 w-full sm:w-auto">
                    {mode === 'Offline' ? (
                      <div className="inline-flex items-center gap-1.5 px-4 h-10 text-xs font-extrabold text-[#659287] bg-[#659287]/10 rounded-xl select-none">
                        <MapPin className="w-4 h-4" />
                        In-Person Venue
                      </div>
                    ) : (
                      app.meetingLink && app.interviewStatus === 'Upcoming' && (
                        <>
                          <a
                            href={app.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 h-10 text-xs font-bold text-white bg-[#659287] hover:bg-[#7BA89C] rounded-xl transition-all shadow-md shadow-[#659287]/15"
                          >
                            Join Meeting
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )
                    )}
                  </div>
                  <a
                    href="/applications"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 h-10 text-xs font-bold text-[#2F4F46] border border-[#E2ECE5] hover:bg-gray-50 rounded-xl transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Application
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CandidateInterviews;
