import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, UserCheck, UploadCloud, Bookmark, PlusCircle, Briefcase, Users, BarChart2 } from "lucide-react";
import toast from "react-hot-toast";

interface QuickActionItemProps {
    label: string;
    icon: React.ElementType;
    onClick: () => void;
}

const QuickActionItem: React.FC<QuickActionItemProps> = ({ label, icon: Icon, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex flex-col items-center justify-center p-4 bg-white border border-[#E6F2DD] rounded-2xl text-[#2F4F46] hover:border-[#659287] transition-all group cursor-pointer"
    >
        <div className="p-3 bg-[#E6F2DD] rounded-xl mb-2 group-hover:bg-[#659287] group-hover:text-white transition-all">
            <Icon className="w-5 h-5 text-[#659287] group-hover:text-white" />
        </div>
        <span className="text-xs font-bold text-center">{label}</span>
    </motion.button>
);

interface QuickActionsProps {
  role: "candidate" | "employer" | "admin";
}

export const QuickActions: React.FC<QuickActionsProps> = ({ role }) => {
  const navigate = useNavigate();

  const handleNavigate = (path: string, message?: string) => {
    if (path) {
      navigate(path);
    } else if (message) {
      toast.success(message);
    }
  };

  const candidateActions = [
    { label: "Browse Jobs", icon: Search, onClick: () => handleNavigate("/jobs") },
    { label: "Update Profile", icon: UserCheck, onClick: () => handleNavigate("/profile") },
    { label: "Upload Resume", icon: UploadCloud, onClick: () => handleNavigate("/profile") },
    { label: "Saved Jobs", icon: Bookmark, onClick: () => handleNavigate("/saved-jobs") },
  ];

  const employerActions = [
    { label: "Post Job", icon: PlusCircle, onClick: () => handleNavigate("/employer/jobs/new") },
    { label: "Manage Jobs", icon: Briefcase, onClick: () => handleNavigate("/employer/jobs") },
    { label: "View Applicants", icon: Users, onClick: () => handleNavigate("/employer/applicants") },
    { label: "Analytics", icon: BarChart2, onClick: () => handleNavigate("/employer/analytics") },
  ];

  const actions = role === 'employer' ? employerActions : candidateActions;

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <QuickActionItem key={action.label} {...action} />
      ))}
    </div>
  );
};
