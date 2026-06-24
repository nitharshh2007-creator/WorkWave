import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, UserCheck, UploadCloud, Bookmark } from "lucide-react";
import toast from "react-hot-toast";

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

  // Render same actions for all roles (can be extended later)
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Browse Jobs */}
      <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleNavigate("/jobs")}
        className="flex flex-col items-center justify-center p-4 bg-white border border-[#E6F2DD] rounded-2xl text-[#2F4F46] hover:border-[#659287] transition-all group cursor-pointer"
      >
        <div className="p-3 bg-[#E6F2DD] rounded-xl mb-2 group-hover:bg-[#659287] group-hover:text-white transition-all">
          <Search className="w-5 h-5 text-[#659287] group-hover:text-white" />
        </div>
        <span className="text-xs font-bold text-center">Browse Jobs</span>
      </motion.button>

      {/* Update Profile */}
      <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleNavigate("/profile")}
        className="flex flex-col items-center justify-center p-4 bg-white border border-[#E6F2DD] rounded-2xl text-[#2F4F46] hover:border-[#659287] transition-all group cursor-pointer"
      >
        <div className="p-3 bg-[#E6F2DD] rounded-xl mb-2 group-hover:bg-[#659287] group-hover:text-white transition-all">
          <UserCheck className="w-5 h-5 text-[#659287] group-hover:text-white" />
        </div>
        <span className="text-xs font-bold text-center">Update Profile</span>
      </motion.button>

      {/* Upload Resume */}
      <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleNavigate("/profile")}
        className="flex flex-col items-center justify-center p-4 bg-white border border-[#E6F2DD] rounded-2xl text-[#2F4F46] hover:border-[#659287] transition-all group cursor-pointer"
      >
        <div className="p-3 bg-[#E6F2DD] rounded-xl mb-2 group-hover:bg-[#659287] group-hover:text-white transition-all">
          <UploadCloud className="w-5 h-5 text-[#659287] group-hover:text-white" />
        </div>
        <span className="text-xs font-bold text-center">Upload Resume</span>
      </motion.button>

      {/* Saved Jobs */}
      <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleNavigate("/saved-jobs")}
        className="flex flex-col items-center justify-center p-4 bg-white border border-[#E6F2DD] rounded-2xl text-[#2F4F46] hover:border-[#659287] transition-all group cursor-pointer"
      >
        <div className="p-3 bg-[#E6F2DD] rounded-xl mb-2 group-hover:bg-[#659287] group-hover:text-white transition-all">
          <Bookmark className="w-5 h-5 text-[#659287] group-hover:text-white" />
        </div>
        <span className="text-xs font-bold text-center">Saved Jobs</span>
      </motion.button>
    </div>
  );
};
