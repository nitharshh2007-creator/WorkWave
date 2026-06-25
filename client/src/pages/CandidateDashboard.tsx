import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { StatCard } from "../components/StatCard";
import { QuickActions } from "../components/QuickActions";
import { ActivityTimeline } from "../components/ActivityTimeline";
import { fetchDashboardData, type DashboardData } from "../services/dashboardService";
import toast from "react-hot-toast";

// Component to render candidate dashboard details
export default function CandidateDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "{}"),
    []
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await fetchDashboardData();
        setData(dashboardData);
      } catch (error) {
        toast.error("Could not load dashboard data.");
      }
    };
    loadData();
  }, []);

  const getMotivationalText = () => {
    const hours = currentTime.getHours();
    if (hours < 12) return "A great day to find your dream job.";
    if (hours < 17)
      return "Keep the momentum going. Your next big opportunity is out there.";
    return "Review today's progress and prepare for tomorrow's opportunities.";
  };

  const stats = data?.stats || {
    applications: 0,
    savedJobs: 0,
    interviews: 0,
    profileCompletion: 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#659287] via-[#53786F] to-[#2F4F46] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-md"
      >
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none translate-x-20 translate-y-20" />
        <div className="absolute left-1/3 top-0 w-64 h-64 bg-[#B1D3B9]/10 rounded-full blur-3xl pointer-events-none -translate-y-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight m-0 text-white leading-tight">
              Welcome, {user?.name}
            </h1>
            <p className="text-base sm:text-lg text-[#E6F2DD]/90 font-medium">
              {getMotivationalText()}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[180px]">
            <span className="text-xs uppercase tracking-widest text-[#B1D3B9] font-bold">
              Current Time
            </span>
            <span className="text-2xl font-extrabold tracking-tight mt-1">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-xs text-white/70 font-medium mt-0.5">
              {currentTime.toLocaleDateString([], {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Applications"
          value={stats.applications}
          iconName="FileText"
          delay={0.1}
        />
        <StatCard
          title="Saved Jobs"
          value={stats.savedJobs}
          iconName="Bookmark"
          delay={0.2}
        />
        <StatCard
          title="Interviews"
          value={stats.interviews}
          iconName="Calendar"
          delay={0.3}
        />
        <StatCard
          title="Profile Completion"
          value={stats.profileCompletion}
          suffix="%"
          iconName="UserCheck"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-[#2F4F46] mb-6">
            Recent Activity
          </h3>
          <ActivityTimeline activities={data?.activities || []} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-bold text-[#2F4F46] mb-4">
            Quick Actions
          </h3>
          {user && <QuickActions role={user.role} />}
        </motion.div>
      </div>
    </div>
  );
}
