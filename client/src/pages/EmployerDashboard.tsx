import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart as RechartsBarChart,
  Bar,
  Rectangle,
} from 'recharts';
import { Calendar, Clock, Bell } from 'lucide-react';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import { QuickActions } from '../components/QuickActions';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { fetchEmployerDashboardData } from '../services/dashboardService';
import type { EmployerDashboardData } from '../services/dashboardService';
import toast from 'react-hot-toast';
import Header from '../components/Header';

// --- CHART COMPONENTS (keeping them internal for now as they are specific to employer dashboard) ---

const ApplicationsChart = ({ data }: { data: any[] }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm"
    >
        <h3 className="text-lg font-bold text-[#2F4F46] mb-4">Applications This Month</h3>
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(101, 146, 135, 0.1)" />
                    <XAxis dataKey="name" tick={{ fill: '#4A6A60', fontSize: 12 }} tickLine={{ stroke: '#B1D3B9' }} axisLine={{ stroke: '#B1D3B9' }} />
                    <YAxis tick={{ fill: '#4A6A60', fontSize: 12 }} tickLine={{ stroke: '#B1D3B9' }} axisLine={{ stroke: '#B1D3B9' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            borderColor: '#E6F2DD',
                        }}
                        labelStyle={{ color: '#2F4F46', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="applications" stroke="#659287" strokeWidth={3} dot={{ r: 5, fill: '#659287' }} activeDot={{ r: 8, fill: '#659287', stroke: 'white', strokeWidth: 2 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </motion.div>
);

const ApplicationsPerJobChart = ({ data }: { data: any[] }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm"
    >
        <h3 className="text-lg font-bold text-[#2F4F46] mb-4">Applications Per Job</h3>
        <div className="h-72 flex items-center justify-center">
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(101, 146, 135, 0.1)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: '#4A6A60', fontSize: 12 }} tickLine={{ stroke: '#B1D3B9' }} axisLine={{ stroke: '#B1D3B9' }} />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#4A6A60', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={{ fill: 'rgba(177, 211, 185, 0.2)' }}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                borderColor: '#E6F2DD',
                            }}
                            labelStyle={{ color: '#2F4F46', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="applications" fill="#88BDA4" radius={[0, 8, 8, 0]} barSize={16}>
                            {data.map((_entry, index) => (
                                <Rectangle key={`bar-${index}`} fill="#88BDA4" />
                            ))}
                        </Bar>
                    </RechartsBarChart>
                </ResponsiveContainer>
            ) : (
                <div className="text-gray-400 text-sm font-medium text-center">
                    No applications per job data available.
                </div>
            )}
        </div>
    </motion.div>
);

// --- MAIN DASHBOARD COMPONENT ---

export default function EmployerDashboard() {
    const [data, setData] = useState<EmployerDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [dashboardNotifications, setDashboardNotifications] = useState<any[]>([]);

    const navigate = useNavigate();
    const user = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);

    const recentActivityData = useMemo(() => {
        if (!data?.recentActivity) return [];
        return data.recentActivity.map((act: any) => ({
            id: act.id || act._id,
            type: act.type,
            detail: act.title,
            time: new Date(act.time).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
            status: act.description || 'Completed',
        }));
    }, [data]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetchEmployerDashboardData();
            setData(res);
            
            // Fetch real notifications
            const notifRes = await api.get('/notifications');
            setDashboardNotifications(notifRes.data || []);
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || "Failed to load employer dashboard.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        loadDashboard();
        return () => clearInterval(timer);
    }, []);

    const getMotivationalText = () => {
        const hours = currentTime.getHours();
        if (hours < 12) return "A great day to find the perfect talent for your team.";
        if (hours < 17) return "Keep the momentum going. Great candidates are out there.";
        return "Review today's progress and prepare for tomorrow's opportunities.";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAF8] p-6 space-y-8 flex flex-col justify-between animate-pulse">
                <div className="h-44 w-full bg-white/50 border border-gray-100 rounded-3xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 bg-white/50 border border-gray-100 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 h-72 bg-white/50 border border-gray-100 rounded-2xl" />
                    <div className="lg:col-span-2 h-72 bg-white/50 border border-gray-100 rounded-2xl" />
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
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const stats = data?.stats || {
        totalJobs: 0,
        activeJobs: 0,
        applications: 0,
        interviews: 0
    };

    return (
        <>
          <Header />
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
                            Welcome back, {data?.user?.name || user?.name || "Employer"}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Jobs" value={stats.totalJobs} iconName="Briefcase" delay={0.1} />
                <StatCard title="Active Jobs" value={stats.activeJobs} iconName="CheckCircle" delay={0.2} />
                <StatCard title="Total Applicants" value={stats.applications} iconName="Users" delay={0.3} />
                <StatCard title="Interviews" value={stats.interviews} iconName="Calendar" delay={0.4} />
            </div>

            {/* Hiring Funnel Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard title="Shortlisted" value={stats.shortlisted} iconName="Star" delay={0.5} />
                <StatCard title="Hired" value={stats.hired} iconName="Trophy" delay={0.6} />
                <StatCard title="Rejected" value={stats.rejected} iconName="XCircle" delay={0.7} />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <ApplicationsChart data={data?.applicationsByDate || []} />
              </div>
              <div className="lg:col-span-2">
                <ApplicationsPerJobChart data={data?.applicationsPerJob || []} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm"
                >
                    <h3 className="text-lg font-bold text-[#2F4F46] mb-6">
                        Recent Activity
                    </h3>
                    {recentActivityData.length > 0 ? (
                        <ActivityTimeline activities={recentActivityData} />
                    ) : (
                        <div className="text-center py-10 text-gray-400 text-sm font-medium">
                            No recent activity found.
                        </div>
                    )}
                </motion.div>

                {/* Upcoming Interviews */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.45 }}
                    className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm"
                >
                    <h3 className="text-lg font-bold text-[#2F4F46] mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#659287]" /> Upcoming Interviews
                    </h3>
                    {data?.upcomingInterviews && data.upcomingInterviews.length > 0 ? (
                        <div className="space-y-4">
                            {data.upcomingInterviews.map((interview) => (
                                <div key={interview._id} className="p-4 bg-[#F8FAF8] border border-[#E6F2DD] rounded-2xl flex flex-col justify-between gap-3 hover:border-[#659287] transition-colors">
                                    <div>
                                        <h4 className="text-sm font-bold text-[#2F4F46]">{interview.job?.title}</h4>
                                        <p className="text-xs text-[#4A6A60] font-medium mt-0.5">
                                            Candidate: <strong className="text-[#2F4F46]">{interview.user?.name}</strong>
                                        </p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-[#4A6A60]">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-[#659287]" />
                                                {interview.interviewDate}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-[#659287]" />
                                                {interview.interviewTime}
                                            </span>
                                        </div>
                                    </div>
                                    {interview.meetingLink && (
                                        <a
                                            href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full text-center py-2 bg-[#659287] hover:bg-[#53786F] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                                        >
                                            Join Meeting
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-400 text-sm font-medium">
                            No upcoming interviews.
                        </div>
                    )}
                </motion.div>
                
                {/* Recent Notifications */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[#2F4F46] flex items-center gap-2">
                            <Bell className="w-5 h-5 text-[#659287]" /> Recent Notifications
                        </h3>
                        <button
                            onClick={() => navigate('/employer/notifications')}
                            className="text-xs font-bold text-[#659287] hover:text-[#53786F] transition-all cursor-pointer"
                        >
                            View All
                        </button>
                    </div>
                    
                    <div className="divide-y divide-gray-50 max-h-[220px] overflow-y-auto pr-1">
                        {dashboardNotifications.length === 0 ? (
                            <p className="text-xs text-gray-400 italic py-4 text-center">No notifications yet.</p>
                        ) : (
                            dashboardNotifications.slice(0, 3).map((notif: any) => (
                                <div key={notif._id} className="py-3 first:pt-0 last:pb-0 flex gap-3">
                                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.isRead ? 'bg-gray-200' : 'bg-rose-500'}`} />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-[#2F4F46] truncate">{notif.title}</h4>
                                        <p className="text-[10px] text-gray-500 leading-normal mt-0.5 line-clamp-2">{notif.message}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm"
                >
                    <h3 className="text-lg font-bold text-[#2F4F46] mb-4">
                        Quick Actions
                    </h3>
                    {user && <QuickActions role={user.role} />}
                </motion.div>
            </div>
        </div>
        </>
    );
}
