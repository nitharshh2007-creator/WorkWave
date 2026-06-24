import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, FileText, Bookmark, User, Settings, LogOut, Briefcase, Users as UsersIcon, PlusCircle, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  // Candidate
  { name: 'Dashboard', to: '/dashboard', icon: Home, role: 'candidate' },
  { name: 'Jobs', to: '/jobs', icon: Search, role: 'candidate' },
  { name: 'Applications', to: '/applications', icon: FileText, role: 'candidate' },
  { name: 'Saved Jobs', to: '/saved-jobs', icon: Bookmark, role: 'candidate' },
  { name: 'Profile', to: '/profile', icon: User, role: 'candidate' },
  { name: 'Settings', to: '/settings', icon: Settings, role: 'candidate' },

  // Employer
  { name: 'Dashboard', to: '/employer/dashboard', icon: Home, role: 'employer' },
  { name: 'Post Job', to: '/employer/jobs/new', icon: PlusCircle, role: 'employer' },
  { name: 'Manage Jobs', to: '/employer/jobs', icon: Briefcase, role: 'employer' },
  { name: 'Applicants', to: '/employer/applicants', icon: UsersIcon, role: 'employer' },
  { name: 'Analytics', to: '/employer/analytics', icon: BarChart2, role: 'employer' },
  { name: 'Settings', to: '/employer/settings', icon: Settings, role: 'employer' },
];

interface SidebarProps {
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const navigate = useNavigate();
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
  const userRole = user?.role || 'candidate';

  const visibleMenuItems = menuItems.filter(
    (item) => item.role === userRole || item.role === 'all'
  );

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
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-[#659287] text-white shadow"
                    : "text-[#5E7C72] hover:bg-[#E6F2DD] hover:text-[#659287]"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
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