import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Video, MapPin, AlignLeft, Hourglass } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  onScheduleSuccess: () => void;
  initialData?: {
    date: string;
    time: string;
    mode: 'Google Meet' | 'Microsoft Teams' | 'Zoom' | 'Offline';
    link: string;
    location: string;
    duration: string;
    message: string;
  };
}

export const InterviewModal: React.FC<InterviewModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  candidateName,
  jobTitle,
  onScheduleSuccess,
  initialData,
}) => {
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [mode, setMode] = useState<'Google Meet' | 'Microsoft Teams' | 'Zoom' | 'Offline'>(
    initialData?.mode || 'Google Meet'
  );
  const [link, setLink] = useState(initialData?.link || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [duration, setDuration] = useState(initialData?.duration || '30 mins');
  const [message, setMessage] = useState(initialData?.message || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      return toast.error('Interview date is required');
    }
    if (!time) {
      return toast.error('Interview time is required');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectDate = new Date(date);
    if (selectDate < today) {
      return toast.error('Interview date cannot be in the past');
    }

    if (mode !== 'Offline') {
      if (!link) {
        return toast.error('Meeting URL is required for online interviews');
      }
      if (!link.startsWith('http')) {
        return toast.error('Please enter a valid meeting URL (must start with http:// or https://)');
      }
    } else {
      if (!location || !location.trim()) {
        return toast.error('Location/Venue is required for offline interviews');
      }
    }

    try {
      setLoading(true);
      await api.patch(`/applications/${applicationId}/interview`, {
        date,
        time,
        mode,
        link: mode !== 'Offline' ? link : '',
        location: mode === 'Offline' ? location : '',
        duration,
        message,
      });

      toast.success(initialData ? 'Interview rescheduled successfully!' : 'Interview scheduled successfully!');
      onScheduleSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 m-auto w-full max-w-lg h-fit max-h-[90vh] bg-white border border-[#E6F2DD] rounded-3xl shadow-2xl z-50 overflow-y-auto divide-y divide-gray-100 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between bg-gradient-to-r from-[#F8FAF8] to-white rounded-t-3xl">
              <div>
                <h3 className="text-lg font-extrabold text-[#2F4F46]">
                  {initialData ? 'Reschedule Interview' : 'Schedule Interview'}
                </h3>
                <p className="text-xs text-[#5E7C72] mt-0.5 font-medium">
                  Candidate: <span className="font-bold text-[#659287]">{candidateName}</span> &bull; {jobTitle}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 text-[#659287] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#2F4F46] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#659287]" /> Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E6F2DD] focus:outline-none focus:border-[#659287] focus:ring-1 focus:ring-[#659287] text-sm text-[#2F4F46] font-medium bg-[#F8FAF8]/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#2F4F46] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#659287]" /> Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E6F2DD] focus:outline-none focus:border-[#659287] focus:ring-1 focus:ring-[#659287] text-sm text-[#2F4F46] font-medium bg-[#F8FAF8]/50"
                  />
                </div>
              </div>

              {/* Mode & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#2F4F46] flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-[#659287]" /> Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e: any) => setMode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E6F2DD] focus:outline-none focus:border-[#659287] focus:ring-1 focus:ring-[#659287] text-sm text-[#2F4F46] font-semibold bg-[#F8FAF8]/50 cursor-pointer"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Offline">Offline (In-Person)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#2F4F46] flex items-center gap-1.5">
                    <Hourglass className="w-3.5 h-3.5 text-[#659287]" /> Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E6F2DD] focus:outline-none focus:border-[#659287] focus:ring-1 focus:ring-[#659287] text-sm text-[#2F4F46] font-semibold bg-[#F8FAF8]/50 cursor-pointer"
                  >
                    <option value="15 mins">15 mins</option>
                    <option value="30 mins">30 mins</option>
                    <option value="45 mins">45 mins</option>
                    <option value="1 hour">1 hour</option>
                    <option value="1.5 hours">1.5 hours</option>
                    <option value="2 hours">2 hours</option>
                  </select>
                </div>
              </div>

              {/* Conditional Location or Link */}
              {mode !== 'Offline' ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#2F4F46] flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-[#659287]" /> Meeting Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E6F2DD] focus:outline-none focus:border-[#659287] focus:ring-1 focus:ring-[#659287] text-sm text-[#2F4F46] font-medium bg-[#F8FAF8]/50 placeholder-gray-400"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#2F4F46] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#659287]" /> Location / Venue
                  </label>
                  <input
                    type="text"
                    placeholder="Office Address, Room Number..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E6F2DD] focus:outline-none focus:border-[#659287] focus:ring-1 focus:ring-[#659287] text-sm text-[#2F4F46] font-medium bg-[#F8FAF8]/50 placeholder-gray-400"
                  />
                </div>
              )}

              {/* Message to Candidate */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#2F4F46] flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-[#659287]" /> Message to Candidate (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell the candidate what to prepare, who they will meet, or other details..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6F2DD] focus:outline-none focus:border-[#659287] focus:ring-1 focus:ring-[#659287] text-sm text-[#2F4F46] font-medium bg-[#F8FAF8]/50 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#E6F2DD] hover:bg-gray-50 text-[#5E7C72] font-extrabold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#659287] hover:bg-[#53786F] text-white font-extrabold text-xs tracking-wider uppercase transition-colors shadow-md shadow-[#659287]/15 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : initialData ? (
                    'Reschedule'
                  ) : (
                    'Schedule'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InterviewModal;
