import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Calendar,
  Info,
  Trash2,
  Check,
  Eye,
  BellRing,
  UserCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import HeroCard from '../../components/HeroCard';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'info' | 'interview' | 'status_update';
  isRead: boolean;
  relatedApplication?: string;
  createdAt: string;
}

export const EmployerNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Notification marked as read');
    } catch (err) {
      console.error(err);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error(err);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationStyles = (title: string, type: string) => {
    const isSuccess = title.toLowerCase().includes('hired') || title.toLowerCase().includes('accept');
    const isAlert = title.toLowerCase().includes('withdraw') || title.toLowerCase().includes('cancel');

    if (type === 'interview') {
      return {
        icon: Calendar,
        iconColor: 'text-amber-500 bg-amber-50 border-amber-100',
      };
    } else if (isSuccess) {
      return {
        icon: UserCheck,
        iconColor: 'text-emerald-500 bg-emerald-50 border-emerald-100',
      };
    } else if (isAlert) {
      return {
        icon: Info,
        iconColor: 'text-rose-500 bg-rose-50 border-rose-100',
      };
    } else {
      return {
        icon: Bell,
        iconColor: 'text-[#659287] bg-[#F0F6F2] border-[#E6F2DD]',
      };
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-8 p-6 min-h-screen bg-[#F7FAF8]">
      <HeroCard
        badgeText="Updates & Alerts"
        title="Employer Notifications"
        description="Review incoming applicants, interview scheduling logs, candidate activities, and application updates."
        IconComponent={BellRing}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#E2ECE5] px-6 py-4 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell className="w-5 h-5 text-[#659287]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </div>
            <span className="text-sm font-extrabold text-[#2F4F46]">
              {unreadCount} Unread Notification{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-xl border border-[#659287] text-[#659287] hover:bg-[#659287] hover:text-white transition-all text-xs font-bold shadow-sm shadow-[#659287]/5 cursor-pointer"
            >
              Mark All Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-[#659287] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#4A6A60] font-semibold">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#E2ECE5] p-12 text-center rounded-3xl shadow-sm max-w-md mx-auto"
          >
            <Bell className="w-16 h-16 text-[#659287] mx-auto mb-4 opacity-50" />
            <h3 className="font-extrabold text-[#2F4F46] text-xl mb-2">Inbox is Empty</h3>
            <p className="text-[#4A6A60] text-sm leading-relaxed">
              No updates yet. We will notify you here as soon as a candidate applies or changes status.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {notifications.map((notif) => {
                const { icon: Icon, iconColor } = getNotificationStyles(notif.title, notif.type);
                const formattedDate = new Date(notif.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <motion.div
                    key={notif._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`border rounded-3xl p-5 shadow-sm transition-all flex flex-col sm:flex-row gap-4 items-start justify-between ${
                      notif.isRead
                        ? 'bg-white border-[#E2ECE5]/70 opacity-90'
                        : 'bg-[#F0F6F2]/30 border-[#659287]/35 shadow-md shadow-[#659287]/5'
                    }`}
                  >
                    <div className="flex gap-3.5 items-start flex-1 min-w-0">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border ${iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <h4 className={`text-sm ${notif.isRead ? 'font-bold text-[#2F4F46]' : 'font-extrabold text-[#2F4F46]'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-semibold">{formattedDate}</span>
                        </div>
                        <p className="text-xs text-[#4A6A60] leading-relaxed break-words whitespace-pre-line">
                          {notif.message}
                        </p>

                        {/* Action buttons */}
                        {notif.relatedApplication && (
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => navigate(`/employer/applicants`)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#659287] hover:bg-[#53786F] text-[10px] font-extrabold text-white transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Applicant Funnel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions (Mark Read & Delete) */}
                    <div className="flex items-center gap-1 self-end sm:self-center flex-shrink-0">
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif._id)}
                          className="p-2 text-[#659287] hover:bg-[#659287]/15 rounded-xl transition-all cursor-pointer"
                          title="Mark as Read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notif._id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                        title="Delete Notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerNotifications;
