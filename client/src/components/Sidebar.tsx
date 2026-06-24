import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, FileText, Bookmark, User, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { name: 'Dashboard', to: '/dashboard', icon: Home },
  { name: 'Jobs', to: '/jobs', icon: Search },
  { name: 'Applications', to: '/applications', icon: FileText },
  { name: 'Saved Jobs', to: '/saved-jobs', icon: Bookmark },
  { name: 'Profile', to: '/profile', icon: User },
  { name: 'Settings', to: '/settings', icon: Settings },
];

interface SidebarProps {
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    
  <div className="flex min-h-screen bg-[#F8FAF8]">
    <motion.aside
      initial={{ x: -250, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120 }}
      className="fixed top-6 left-6 w-64 h-[calc(100vh-3rem)] bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl flex flex-col p-4"
    >
      <div className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
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

    <main className="flex-1 ml-80 p-6">
      {children}
    </main>
    </div>
);
}

export default Sidebar;