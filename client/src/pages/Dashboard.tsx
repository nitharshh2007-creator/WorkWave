import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Briefcase,
  Calendar,
  Compass,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import { fetchDashboardData } from "../services/dashboardService";
import type { DashboardData } from "../services/dashboardService";
import { StatCard } from "../components/StatCard";
import { ActivityTimeline } from "../components/ActivityTimeline";
import { QuickActions } from "../components/QuickActions";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const navigate = useNavigate();

  useEffect(() => {
    // Keep date/time updated
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchDashboardData();
      setData(res);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Failed to load dashboard data.";
      setError(msg);
      toast.error(msg);
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Successfully logged out");
    navigate("/login");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Accepted":
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Accepted
          </span>
        );
      case "Rejected":
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  const getMotivationalText = () => {
    const hours = currentTime.getHours();
    if (hours < 12) return "Rise and shine! The perfect time to secure your next career milestone.";
    if (hours < 17) return "Keep push forward! Consistency is the secret ingredient of successful careers.";
    return "Reflect on your achievements today and prepare for new opportunities tomorrow.";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] p-6 space-y-8 flex flex-col justify-between">
        {/* Floating navbar skeleton */}
        <div className="h-16 w-full bg-white/50 border border-gray-100 rounded-2xl animate-pulse" />
        
        {/* Welcome Section skeleton */}
        <div className="h-44 w-full bg-white/50 border border-gray-100 rounded-2xl animate-pulse" />

        {/* Stats Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white/50 border border-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white/50 border border-gray-100 rounded-2xl animate-pulse" />
          <div className="h-96 bg-white/50 border border-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-[#E6F2DD] p-8 rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-[#2F4F46] mb-6">{error}</p>
          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#659287] hover:bg-[#53786F] text-white font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const user = data?.user;
  const stats = data?.stats;

  return (
    <div className="text-[#2F4F46] relative">
      {/* Decorative decorative background blobs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#B1D3B9]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-[#E6F2DD]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Navbar */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <header className="sticky top-6 z-40 bg-white/80 backdrop-blur-md border border-[#E6F2DD] rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <div className="w-9 h-9 rounded-xl bg-[#659287] flex items-center justify-center text-white font-extrabold text-lg shadow-[0_4px_12px_rgba(101,146,135,0.2)]">
              W
            </div>
            <span className="text-xl font-bold tracking-tight text-[#2F4F46]">
              WorkWave
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => toast.success("No new notifications")}
              className="p-2.5 rounded-xl hover:bg-[#F8FAF8] text-[#659287] transition-all relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-[#F8FAF8] border border-transparent hover:border-[#E6F2DD] transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#659287]/10 flex items-center justify-center text-[#659287] font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold hidden sm:inline-block">
                  {user?.name}
                </span>
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
                        <p className="text-[10px] uppercase font-extrabold text-[#659287] tracking-wider mt-0.5">
                          {user?.role}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          navigate("/profile");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#F8FAF8] text-left transition-colors cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-gray-400" /> My Profile
                      </button>

                      <button
                        onClick={handleLogout}
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
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#659287] via-[#53786F] to-[#2F4F46] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-md"
        >
          {/* Decorative shapes */}
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none translate-x-20 translate-y-20" />
          <div className="absolute left-1/3 top-0 w-64 h-64 bg-[#B1D3B9]/10 rounded-full blur-3xl pointer-events-none -translate-y-20" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight m-0 text-white leading-tight">
                Welcome back, {user?.name}
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
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-xs text-white/70 font-medium mt-0.5">
                {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Applications Submitted"
              value={stats.applications}
              iconName="Briefcase"
              delay={0.1}
            />
            <StatCard
              title="Saved Jobs"
              value={stats.savedJobs}
              iconName="Bookmark"
              delay={0.2}
            />
            <StatCard
              title="Interviews Scheduled"
              value={stats.interviews}
              iconName="Calendar"
              delay={0.3}
            />
            <StatCard
              title="Profile Completion"
              value={stats.profileCompletion}
              iconName="UserCheck"
              suffix="%"
              delay={0.4}
            />
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Columns - Applications & Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Applications */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#2F4F46]">
                  Recent Applications
                </h3>
                <button
                  onClick={() => navigate("/jobs")}
                  className="text-xs font-bold text-[#659287] hover:text-[#53786F] transition-all cursor-pointer"
                >
                  View All
                </button>
              </div>

              {data?.recentApplications && data.recentApplications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {data.recentApplications.map((app) => (
                    <div key={app._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E6F2DD] flex items-center justify-center text-[#659287] font-bold">
                          {app.job?.company?.charAt(0).toUpperCase() || "W"}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#2F4F46]">
                            {app.job?.title || "Unknown Position"}
                          </h4>
                          <p className="text-xs text-gray-400 font-medium">
                            {app.job?.company || "Unknown Company"} • {app.job?.location || "Remote"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">No recent applications.</p>
                  <button
                    onClick={() => navigate("/jobs")}
                    className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#659287] rounded-lg hover:bg-[#53786F] transition-all cursor-pointer"
                  >
                    Find a Job
                  </button>
                </div>
              )}
            </motion.div>

            {/* Recommended Jobs */}
            {user?.role === "candidate" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#2F4F46]">
                    Recommended Jobs
                  </h3>
                  <button
                    onClick={() => navigate("/jobs")}
                    className="text-xs font-bold text-[#659287] hover:text-[#53786F] transition-all cursor-pointer"
                  >
                    See More
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data?.recommendedJobs && data.recommendedJobs.length > 0 ? (
                    data.recommendedJobs.map((job) => (
                      <div
                        key={job._id}
                        className="p-4 bg-[#F8FAF8] border border-[#E6F2DD] rounded-xl flex flex-col justify-between hover:shadow-md transition-all group"
                      >
                        <div>
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#659287] font-bold shadow-sm mb-3">
                            {job.company.charAt(0).toUpperCase()}
                          </div>
                          <h4 className="text-sm font-bold text-[#2F4F46] group-hover:text-[#659287] transition-all">
                            {job.title}
                          </h4>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">
                            {job.company} • {job.location}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            toast.success(`Applying to ${job.title}...`);
                          }}
                          className="mt-4 w-full py-1.5 bg-white border border-[#E6F2DD] rounded-lg text-xs font-bold text-[#659287] hover:bg-[#659287] hover:text-white transition-all cursor-pointer"
                        >
                          Quick Apply
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-6 text-sm text-gray-500 font-medium">
                      No matching job recommendations at this time.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Actions, Tracker, Activity */}
          <div className="space-y-8">
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

            {/* Profile Completion Tracker */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-[#2F4F46] mb-4">
                  Profile Completion
                </h3>
                <div className="space-y-4">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2.5 uppercase rounded-full bg-[#E6F2DD] text-[#2F4F46]">
                          Progress
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold inline-block text-[#659287]">
                          {stats.profileCompletion}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2.5 mb-4 text-xs flex rounded-full bg-[#E6F2DD]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats.profileCompletion}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#659287]"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Complete your profile details to rank higher in recruiter searches.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Activity Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-[#2F4F46] mb-6">
                Activity Timeline
              </h3>
              {data?.activities && <ActivityTimeline activities={data.activities} />}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
