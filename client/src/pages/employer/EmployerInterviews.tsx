import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Search,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
  Edit2,
  User,
  SlidersHorizontal,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import HeroCard from '../../components/HeroCard';
import InterviewModal from '../../components/employer/InterviewModal';

interface InterviewApplicant {
  _id: string;
  jobTitle: string;
  company: string;
  location: string;
  status: string;
  notes: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    professionalTitle?: string;
  };
  job: {
    _id: string;
    title: string;
  };
  interviewDate: string;
  interviewTime: string;
  interviewMode: 'Google Meet' | 'Microsoft Teams' | 'Zoom' | 'Offline';
  meetingLink?: string;
  interviewLocation?: string;
  interviewDuration?: string;
  interviewMessage?: string;
  interviewNotes?: string;
  interviewStatus: 'Upcoming' | 'Completed' | 'Cancelled';
  updatedAt: string;
}

export const EmployerInterviews: React.FC = () => {
  const [interviews, setInterviews] = useState<InterviewApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter State
  const [searchCandidate, setSearchCandidate] = useState('');
  const [searchJob, setSearchJob] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [statusTab, setStatusTab] = useState<'Upcoming' | 'Completed' | 'Cancelled' | 'All'>('Upcoming');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week'>('all');

  // Rescheduling Modal State
  const [rescheduleApp, setRescheduleApp] = useState<InterviewApplicant | null>(null);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/applications/employer');
      const allApps = response.data?.applications || [];
      
      // Filter out only applications with scheduled interviews
      const scheduled = allApps.filter(
        (app: any) => app.interviewDate && app.interviewTime
      );
      setInterviews(scheduled);
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve interview schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // Action handlers
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Meeting link copied to clipboard!');
  };

  const handleCancelInterview = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) return;
    try {
      await api.patch(`/applications/${id}/interview/cancel`);
      toast.success('Interview cancelled successfully');
      fetchInterviews();
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel interview');
    }
  };

  const handleCompleteInterview = async (id: string) => {
    try {
      await api.patch(`/applications/${id}/interview/complete`);
      toast.success('Interview marked as Completed');
      fetchInterviews();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update interview status');
    }
  };

  const handleHireCandidate = async (id: string) => {
    if (!window.confirm('Are you sure you want to hire this candidate?')) return;
    try {
      await api.patch(`/applications/${id}/hire`);
      toast.success('Candidate hired successfully!');
      fetchInterviews();
    } catch (err) {
      console.error(err);
      toast.error('Failed to hire candidate');
    }
  };

  const handleRejectCandidate = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this candidate?')) return;
    try {
      await api.patch(`/applications/${id}/reject`);
      toast.success('Candidate rejected');
      fetchInterviews();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject candidate');
    }
  };

  // Filter & Search Logic
  const filteredInterviews = useMemo(() => {
    let result = [...interviews];

    // Search filters
    if (searchCandidate) {
      const q = searchCandidate.toLowerCase();
      result = result.filter(item => item.user?.name?.toLowerCase().includes(q));
    }

    if (searchJob) {
      const q = searchJob.toLowerCase();
      result = result.filter(item => item.jobTitle?.toLowerCase().includes(q));
    }

    if (searchDate) {
      result = result.filter(item => item.interviewDate === searchDate);
    }

    // Status tab filter
    if (statusTab !== 'All') {
      result = result.filter(item => item.interviewStatus === statusTab);
    }

    // Time-range filter
    if (timeFilter === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      result = result.filter(item => item.interviewDate === todayStr);
    } else if (timeFilter === 'week') {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      result = result.filter(item => {
        const itemDate = new Date(item.interviewDate);
        return itemDate >= today && itemDate <= nextWeek;
      });
    }

    // Sort by Date & Time (upcoming first)
    result.sort((a, b) => new Date(`${a.interviewDate}T${a.interviewTime}`).getTime() - new Date(`${b.interviewDate}T${b.interviewTime}`).getTime());

    return result;
  }, [interviews, searchCandidate, searchJob, searchDate, statusTab, timeFilter]);

  const getStatusBadgeStyle = (status: 'Upcoming' | 'Completed' | 'Cancelled') => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-150';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border border-rose-150';
      default:
        return 'bg-amber-50 text-amber-700 border border-amber-150';
    }
  };

  return (
    <div className="space-y-8 p-6 min-h-screen bg-[#F7FAF8]">
      <HeroCard
        badgeText="Recruitment Operations"
        title="Employer Interview Schedule"
        description="Monitor and manage all scheduled interviews across your open job positions. Launch meeting links, reschedule dates, or complete calls."
        IconComponent={CalendarDays}
      />

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E2ECE5] p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-[#2F4F46] font-bold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-[#659287]" />
          <span>Search & Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Candidate Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#659287]" />
            <input
              type="text"
              placeholder="Search Candidate..."
              value={searchCandidate}
              onChange={(e) => setSearchCandidate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2ECE5] focus:outline-none focus:border-[#659287] text-xs font-semibold text-[#2F4F46] bg-[#F8FAF8]"
            />
          </div>

          {/* Job Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#659287]" />
            <input
              type="text"
              placeholder="Search Job Title..."
              value={searchJob}
              onChange={(e) => setSearchJob(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2ECE5] focus:outline-none focus:border-[#659287] text-xs font-semibold text-[#2F4F46] bg-[#F8FAF8]"
            />
          </div>

          {/* Date Picker */}
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E2ECE5] focus:outline-none focus:border-[#659287] text-xs font-semibold text-[#2F4F46] bg-[#F8FAF8] cursor-pointer"
          />
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#E2ECE5]/60">
          <div className="flex bg-[#F7FAF8] p-1 rounded-xl border border-[#E2ECE5]">
            {(['Upcoming', 'Completed', 'Cancelled', 'All'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusTab === tab
                    ? 'bg-[#659287] text-white shadow'
                    : 'text-[#5E7C72] hover:text-[#659287]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5E7C72] font-bold">Timeframe:</span>
            <select
              value={timeFilter}
              onChange={(e: any) => setTimeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E2ECE5] text-xs font-bold text-[#2F4F46] bg-[#F7FAF8] outline-none cursor-pointer"
            >
              <option value="all">All Scheduled</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Listing */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-[#659287] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#4A6A60] font-semibold">Fetching scheduled interviews...</p>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E2ECE5] p-12 text-center rounded-3xl shadow-sm max-w-md mx-auto"
        >
          <Calendar className="w-16 h-16 text-[#659287] mx-auto mb-4 opacity-40" />
          <h3 className="font-extrabold text-[#2F4F46] text-lg mb-2">No Interviews Found</h3>
          <p className="text-[#4A6A60] text-xs leading-relaxed">
            There are no interviews scheduled matching your search filters.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredInterviews.map((item) => {
              const avatar = item.user?.profilePicture
                ? `http://localhost:5000${item.user.profilePicture}`
                : `https://api.dicebear.com/7.x/initials/svg?seed=${item.user?.name || 'Candidate'}`;

              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-[#E2ECE5] rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Candidate Info Header */}
                    <div className="flex items-start justify-between mb-4 pb-3 border-b border-[#E2ECE5]/50">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={avatar}
                          alt={item.user?.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-[#E2ECE5] flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${item.user?.name}`;
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="text-base font-extrabold text-[#2F4F46] truncate">
                            {item.user?.name || 'Candidate'}
                          </h4>
                          <p className="text-xs text-[#659287] font-semibold truncate">
                            {item.user?.professionalTitle || 'Software Professional'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${getStatusBadgeStyle(item.interviewStatus)}`}>
                        {item.interviewStatus}
                      </span>
                    </div>

                    {/* Job Details */}
                    <div className="mb-4">
                      <p className="text-xs text-[#5E7C72] font-semibold">Applying for:</p>
                      <h5 className="text-sm font-extrabold text-[#2F4F46] mt-0.5">{item.jobTitle}</h5>
                    </div>

                    {/* Interview Date/Time & Mode */}
                    <div className="bg-[#F8FAF8] border border-[#E2ECE5]/60 rounded-2xl p-3.5 space-y-2.5 text-xs font-semibold text-[#4A6A60] mb-4">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-[#659287]" />
                        <span>Date: <strong className="text-[#2F4F46]">{item.interviewDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-[#659287]" />
                        <span>Time: <strong className="text-[#2F4F46]">{item.interviewTime} ({item.interviewDuration || '30m'})</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Video className="w-4 h-4 text-[#659287]" />
                        <span>Mode: <strong className="text-[#2F4F46]">{item.interviewMode}</strong></span>
                      </div>
                      
                      {/* Link / Venue details */}
                      {item.interviewMode !== 'Offline' ? (
                        item.meetingLink && (
                          <div className="pt-2 border-t border-[#E2ECE5]/40 flex items-center justify-between gap-4">
                            <span className="truncate flex-1">Link: <a href={item.meetingLink} target="_blank" rel="noreferrer" className="text-[#659287] underline font-bold">{item.meetingLink}</a></span>
                            <button
                              onClick={() => handleCopyLink(item.meetingLink || '')}
                              className="p-1.5 text-[#659287] hover:bg-[#659287]/10 rounded-lg transition-colors cursor-pointer"
                              title="Copy Meeting Link"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      ) : (
                        item.interviewLocation && (
                          <div className="pt-2 border-t border-[#E2ECE5]/40 flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#659287] mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">Venue: <strong className="text-[#2F4F46]">{item.interviewLocation}</strong></span>
                          </div>
                        )
                      )}
                    </div>

                    {/* Employer message snippet */}
                    {item.interviewMessage && (
                      <div className="mb-5 bg-[#F0F6F2]/30 border-l-2 border-[#659287] p-2.5 rounded-r-xl text-xs text-[#5E7C72]">
                        <p className="font-bold text-[10px] uppercase text-[#659287] tracking-wider mb-0.5">Brief Message</p>
                        <p className="italic leading-relaxed">"{item.interviewMessage}"</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="border-t border-[#E2ECE5]/60 pt-4 flex flex-wrap gap-2 items-center justify-between">
                    {/* Left Actions */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => window.open(`/employer/applicants?jobId=${item.job?._id || item.job}&applicant=${item.user?._id || item.user}`, '_blank')}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E2ECE5] hover:bg-gray-50 text-xs font-bold text-[#5E7C72] transition-colors cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" /> Profile
                      </button>
                      
                      {item.interviewMode !== 'Offline' && item.meetingLink && (
                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#659287]/10 hover:bg-[#659287]/20 text-xs font-bold text-[#659287] transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Launch
                        </a>
                      )}
                    </div>

                    {/* Status/ funnel management */}
                    {item.interviewStatus === 'Upcoming' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setRescheduleApp(item)}
                          className="p-2 text-amber-600 hover:bg-amber-50 border border-amber-100 rounded-xl transition-all cursor-pointer"
                          title="Reschedule Interview"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCancelInterview(item._id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-xl transition-all cursor-pointer"
                          title="Cancel Interview"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCompleteInterview(item._id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 border border-emerald-100 rounded-xl transition-all cursor-pointer"
                          title="Mark Completed"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {item.interviewStatus === 'Completed' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleHireCandidate(item._id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 border border-emerald-100 rounded-xl transition-all cursor-pointer"
                          title="Hire Candidate"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRejectCandidate(item._id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-xl transition-all cursor-pointer"
                          title="Reject Candidate"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Reschedule Modal overlay */}
      {rescheduleApp && (
        <InterviewModal
          isOpen={!!rescheduleApp}
          onClose={() => setRescheduleApp(null)}
          applicationId={rescheduleApp._id}
          candidateName={rescheduleApp.user?.name}
          jobTitle={rescheduleApp.jobTitle}
          onScheduleSuccess={fetchInterviews}
          initialData={{
            date: rescheduleApp.interviewDate,
            time: rescheduleApp.interviewTime,
            mode: rescheduleApp.interviewMode,
            link: rescheduleApp.meetingLink || '',
            location: rescheduleApp.interviewLocation || '',
            duration: rescheduleApp.interviewDuration || '30 mins',
            message: rescheduleApp.interviewMessage || rescheduleApp.interviewNotes || '',
          }}
        />
      )}
    </div>
  );
};

export default EmployerInterviews;
