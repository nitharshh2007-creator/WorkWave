import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, FileText, Bookmark, User, Settings, LogOut, Briefcase, Users as UsersIcon, PlusCircle, BarChart2, Calendar, Bell, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const menuItems = [
  // Candidate
  { name: 'Dashboard', to: '/dashboard', icon: Home, role: 'candidate' },
  { name: 'Jobs', to: '/jobs', icon: Search, role: 'candidate' },
  { name: 'Applications', to: '/applications', icon: FileText, role: 'candidate' },
  { name: 'Interview Calls', to: '/candidate/interviews', icon: Calendar, role: 'candidate' },
  { name: 'Saved Jobs', to: '/saved-jobs', icon: Bookmark, role: 'candidate' },
  { name: 'Notifications', to: '/notifications', icon: Bell, role: 'candidate' },
  { name: 'Learning Resources', to: '/resources', icon: BookOpen, role: 'candidate' },
  { name: 'Profile', to: '/profile', icon: User, role: 'candidate' },
  { name: 'Settings', to: '/settings', icon: Settings, role: 'candidate' },

  // Employer
  { name: 'Dashboard', to: '/employer/dashboard', icon: Home, role: 'employer' },
  { name: 'Post Job', to: '/employer/jobs/new', icon: PlusCircle, role: 'employer' },
  { name: 'Manage Jobs', to: '/employer/jobs', icon: Briefcase, role: 'employer' },
  { name: 'Applicants', to: '/employer/applicants', icon: UsersIcon, role: 'employer' },
  { name: 'Interview Schedule', to: '/employer/interviews', icon: Calendar, role: 'employer' },
  { name: 'Analytics', to: '/employer/analytics', icon: BarChart2, role: 'employer' },
  { name: 'Notifications', to: '/employer/notifications', icon: Bell, role: 'employer' },
  { name: 'Profile', to: '/employer/profile', icon: User, role: 'employer' },
  { name: 'Settings', to: '/employer/settings', icon: Settings, role: 'employer' },
];

interface SidebarProps {
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
  const userRole = user?.role || 'candidate';
  const [unreadCount, setUnreadCount] = useState(0);

  const visibleMenuItems = menuItems.filter(
    (item) => item.role === userRole || item.role === 'all'
  );

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { data } = await api.get('/notifications');
        const count = data.filter((n: any) => !n.isRead).length;
        setUnreadCount(count);
      } catch (err) {
        console.error("Error fetching unread count for sidebar", err);
      }
    };
    
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    
  <div className="flex min-h-screen bg-[#F8FAF8]">
    <motion.aside
      initial={{ x: -250, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120 }}
      className="fixed top-6 left-6 w-64 max-w-[calc(100vw-3rem)] h-[calc(100vh-3rem)] bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl flex flex-col p-4"
    >
      <div className="flex-1 space-y-2">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-[#659287] text-white shadow"
                    : "text-[#5E7C72] hover:bg-[#E6F2DD] hover:text-[#659287]"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="flex-grow">{item.name}</span>
              {item.name === 'Notifications' && unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center justify-center min-w-[20px] h-5">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-3 rounded-xl text-[#5E7C72] hover:bg-[#E6F2DD] hover:text-[#659287] transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </motion.aside>

    <main className="flex-1 min-w-0 overflow-x-hidden ml-80 p-6">
  {children}
</main>
    </div>
  );
};

export default Sidebar;