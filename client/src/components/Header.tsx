import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, LogOut, ChevronDown, User as UserIcon, Calendar, CheckCircle, Info } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

interface NotificationItem {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'info' | 'interview' | 'status_update';
  isRead: boolean;
  createdAt: string;
}

export default function Header() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  const user = useMemo(() => JSON.parse(localStorage.getItem("user") || "{}"), []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (user?.role) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // poll every 10 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/${notif._id}/read`);
        setNotifications(prev =>
          prev.map(n => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    if (notif.type === 'interview' && user.role === 'candidate') {
      navigate('/candidate/interviews');
      setShowNotifications(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  return (
    <header className="sticky top-6 z-40 bg-white/80 backdrop-blur-md border border-[#E6F2DD] rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm mb-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate(user.role === 'employer' ? '/employer/dashboard' : '/dashboard')}> 
        <div className="w-9 h-9 rounded-xl bg-[#659287] flex items-center justify-center text-white font-extrabold text-lg shadow-[0_4px_12px_rgba(101,146,135,0.2)]">
          W
        </div>
        <span className="text-xl font-bold tracking-tight text-[#2F4F46]">WorkWave</span>
      </div>

      {/* Icons */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl hover:bg-[#F8FAF8] text-[#659287] transition-all relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center h-4 min-w-[16px] px-1 text-[9px] font-extrabold text-white bg-rose-500 rounded-full border-2 border-white shadow-sm pointer-events-none">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-[#E6F2DD] rounded-2xl shadow-xl py-3 z-50 overflow-hidden"
                >
                  <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#2F4F46] uppercase tracking-wider">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] font-bold text-[#659287] hover:text-[#2F4F46] transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-400 italic">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => {
                        const Icon = notif.type === 'interview' ? Calendar : notif.type === 'status_update' ? CheckCircle : Info;
                        const iconColor = notif.type === 'interview' ? 'text-amber-500 bg-amber-50' : notif.type === 'status_update' ? 'text-emerald-500 bg-emerald-50' : 'text-blue-500 bg-blue-50';

                        return (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3 text-left transition-colors cursor-pointer flex gap-3 items-start ${
                              notif.isRead ? 'hover:bg-gray-50' : 'bg-[#F0F6F2]/30 hover:bg-[#F0F6F2]/50'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs ${notif.isRead ? 'font-medium text-[#2F4F46]' : 'font-bold text-[#2F4F46]'}`}>
                                {notif.title}
                              </p>
                              <p className="text-[10px] text-[#4A6A60] mt-0.5 leading-relaxed break-words whitespace-pre-line">
                                {notif.message}
                              </p>
                              {notif.type === 'interview' && user.role === 'candidate' && (
                                <button className="mt-2 px-3 py-1 rounded-lg bg-[#659287] hover:bg-[#7BA89C] text-white text-[9px] font-bold transition-all shadow-sm shadow-[#659287]/15">
                                  View Interview
                                </button>
                              )}
                            </div>
                            {!notif.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-1" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="border-t border-gray-100 p-2 bg-gray-50/50 flex justify-center">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate(user.role === 'employer' ? '/employer/notifications' : '/notifications');
                      }}
                      className="w-full py-2 rounded-xl text-center text-[11px] font-extrabold text-[#659287] hover:bg-[#E6F2DD] hover:text-[#53786F] transition-all cursor-pointer border border-[#E6F2DD] bg-white"
                    >
                      View All Notifications
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-[#F8FAF8] border border-transparent hover:border-[#E6F2DD] transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#659287]/10 flex items-center justify-center text-[#659287] font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-bold hidden sm:inline-block">{user?.name}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-52 bg-white border border-[#E6F2DD] rounded-xl shadow-lg py-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                    <p className="text-sm font-bold truncate">{user?.email}</p>
                    <p className="text-[10px] uppercase font-extrabold text-[#659287] tracking-wider mt-0.5">{user?.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate(user?.role === "employer" ? "/employer/profile" : "/profile");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#F8FAF8] text-left transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-gray-400" /> My Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      localStorage.clear();
                      toast.success("Successfully logged out");
                      navigate("/login");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-rose-50 text-rose-600 text-left transition-colors border-t border-gray-100 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" /> Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
