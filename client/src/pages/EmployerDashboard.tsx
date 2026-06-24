import React, { useState, useEffect, useMemo } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { QuickActions } from '../components/QuickActions';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { fetchEmployerDashboardData } from '../services/dashboardService';
import type { EmployerDashboardData, UserInfo } from '../services/dashboardService';
import toast from 'react-hot-toast';

// --- MOCK DATA (for demonstration purposes) ---
const applicationsData = [
    { name: 'Week 1', applications: 30 },
    { name: 'Week 2', applications: 45 },
    { name: 'Week 3', applications: 60 },
    { name: 'Week 4', applications: 50 },
];

const applicationsPerJobData = [
    { name: 'UX Designer', applications: 15 },
    { name: 'Frontend Dev', applications: 25 },
    { name: 'Backend Dev', applications: 20 },
    { name: 'Data Scientist', applications: 10 },
    { name: 'Project Manager', applications: 18 },
];



// --- CHART COMPONENTS (keeping them internal for now as they are specific to employer dashboard) ---

const ApplicationsChart = () => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm"
    >
        <h3 className="text-lg font-bold text-[#2F4F46] mb-4">Applications This Month</h3>
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={applicationsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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

const ApplicationsPerJobChart = () => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm"
    >
        <h3 className="text-lg font-bold text-[#2F4F46] mb-4">Applications Per Job</h3>
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={applicationsPerJobData} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                        {applicationsPerJobData.map((_entry, index) => (
                            <Rectangle key={`bar-${index}`} fill="#88BDA4" />
                        ))}
                    </Bar>
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    </motion.div>
);

// --- MAIN DASHBOARD COMPONENT ---

export default function EmployerDashboard() {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // In a real app, user data would come from a global state/context
    const user = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getMotivationalText = () => {
        const hours = currentTime.getHours();
        if (hours < 12) return "A great day to find the perfect talent for your team.";
        if (hours < 17) return "Keep the momentum going. Great candidates are out there.";
        return "Review today's progress and prepare for tomorrow's opportunities.";
    };
    
    // Mock stats for employer
    const stats = {
        totalJobs: 27,
        activeJobs: 12,
        applications: 143,
        interviews: 18,
    };

    // Recent activity data (moved inside component to ensure scope)
    const recentActivityData = [
        {
            id: '1',
            type: 'application',
            title: 'New Application for Senior Frontend Developer',
            description: 'John Doe applied.',
            time: '2 hours ago',
            icon: 'UserPlus',
        },
        {
            id: '2',
            type: 'job_posting',
            title: 'New Job Posted: UX/UI Designer',
            description: 'The job is now live.',
            time: '1 day ago',
            icon: 'PlusCircle',
        },
        {
            id: '3',
            type: 'interview',
            title: 'Interview Scheduled with Jane Smith',
            description: 'For the Backend Engineer role.',
            time: '2 days ago',
            icon: 'Calendar',
        },
    ];

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

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <ApplicationsChart />
              </div>
              <div className="lg:col-span-2">
                <ApplicationsPerJobChart />
              </div>
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
                    <ActivityTimeline activities={recentActivityData} />
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
