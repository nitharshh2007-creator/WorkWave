import React from "react";
import { motion } from "framer-motion";
import { FileText, Briefcase, User, Calendar } from "lucide-react";
import type { ActivityInfo } from "../services/dashboardService";

interface ActivityTimelineProps {
  activities: ActivityInfo[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "job_applied":
        return <Briefcase className="w-4 h-4 text-[#659287]" />;
      case "profile_updated":
        return <User className="w-4 h-4 text-[#B1D3B9]" />;
      case "resume_uploaded":
        return <FileText className="w-4 h-4 text-[#2F4F46]" />;
      case "interview_scheduled":
        return <Calendar className="w-4 h-4 text-[#659287]" />;
      default:
        return <Briefcase className="w-4 h-4 text-[#659287]" />;
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-500">
        No recent activity yet.
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-[#E6F2DD] ml-3 pl-6 space-y-6">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="relative"
        >
          {/* Node Icon Indicator */}
          <span className="absolute -left-10 top-0.5 flex items-center justify-center w-8 h-8 rounded-full bg-[#F8FAF8] border-2 border-[#E6F2DD] shadow-sm">
            {getActivityIcon(activity.type)}
          </span>

          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#2F4F46]">
                {activity.detail}
              </h4>
              <span className="text-xs text-gray-400 font-medium">
                {activity.time}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Status: <span className="text-green-600 font-medium capitalize">{activity.status}</span>
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
