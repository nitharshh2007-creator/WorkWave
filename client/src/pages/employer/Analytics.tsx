import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Award,
  RefreshCw,
  FileText,
  Download,
  Briefcase,
  CheckCircle,
  MapPin,
  Clock,
  Search,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Funnel,
  FunnelChart,
  LabelList
} from 'recharts';
import HeroCard from '../../components/HeroCard';
import { toast } from 'react-hot-toast';
import {
  fetchEmployerOverview,
  fetchEmployerTrends
} from '../../services/analyticsService';
import type {
  EmployerOverviewResponse,
  TrendItem
} from '../../services/analyticsService';
import api from '../../services/api';
import { exportPdfReport } from '../../utils/pdfUtils';

const COLORS = ['#2F4F46', '#4A6A60', '#659287', '#88BDA4', '#B1D3B9', '#D5E6DC'];

const getFullUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
};

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<EmployerOverviewResponse | null>(null);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [trendRange, setTrendRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [reportType, setReportType] = useState<string>('overall');
  const [exportLoading, setExportLoading] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [profile, setProfile] = useState<any>(null);

  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
  const employerName = user.name || 'Employer';

  // Load dashboard data
  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const overviewRes = await fetchEmployerOverview();
      setOverview(overviewRes);

      const trendRes = await fetchEmployerTrends(trendRange);
      setTrends(trendRes.trendData || []);

      try {
        const profileRes = await api.get('/user/profile');
        setProfile(profileRes.data);
      } catch (profileErr) {
        console.error('Failed to load profile details for analytics', profileErr);
      }

      if (isRefresh) {
        toast.success('Analytics data reloaded successfully');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reload trends when trendRange changes
  useEffect(() => {
    const loadTrends = async () => {
      try {
        const trendRes = await fetchEmployerTrends(trendRange);
        setTrends(trendRes.trendData || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to update trend range data');
      }
    };
    if (!loading) {
      loadTrends();
    }
  }, [trendRange]);

  // Export report to CSV / PDF
  const handleExportReport = async (format: 'csv' | 'excel' | 'pdf') => {
    setExportLoading(true);
    try {
      // Always fetch fresh data before generating reports
      const overviewRes = await fetchEmployerOverview();
      setOverview(overviewRes);

      const trendRes = await fetchEmployerTrends(trendRange);
      setTrends(trendRes.trendData || []);

      let profileData = profile;
      try {
        const profileRes = await api.get('/user/profile');
        profileData = profileRes.data;
        setProfile(profileData);
      } catch (profileErr) {
        console.error('Failed to refresh profile details before export', profileErr);
      }

      if (format === 'pdf') {
        // Use the new PDF generation utility
        await exportPdfReport(overviewRes, trendRes.trendData || [], profileData);
        setExportLoading(false);
        return;
      }

      const performanceData = overviewRes?.jobsPerformance || [];
      if (performanceData.length === 0) {
        toast.error('No performance metrics available to export');
        setExportLoading(false);
        return;
      }

      // Generate CSV content
      const headers = ['Job Title', 'Applications', 'Shortlisted', 'Interview', 'Hired', 'Rejected', 'Created Date'];
      const csvRows = [
        headers.join(','),
        ...performanceData.map((job) => {
          const rowData = [
            job.title,
            job.applications,
            job.shortlisted,
            job.interview,
            job.hired,
            job.rejected,
            job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'
          ];
          return rowData
            .map((val) => {
              const stringVal = val === null || val === undefined ? '' : String(val);
              return `"${stringVal.replace(/"/g, '""')}"`;
            })
            .join(',');
        })
      ];
      
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvRows.join('\n'));
      const link = document.createElement('a');
      link.setAttribute('href', csvContent);
      link.setAttribute(
        'download',
        `WorkWave_Job_Performance_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Report exported as CSV');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export report');
    } finally {
      setExportLoading(false);
    }
  };

  // Filtered Job performance list
  const filteredJobsPerformance = useMemo(() => {
    if (!overview?.jobsPerformance) return [];
    return overview.jobsPerformance.filter((job) =>
      job.title.toLowerCase().includes(jobSearch.toLowerCase())
    );
  }, [overview, jobSearch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <RefreshCw className="w-10 h-10 text-[#659287] animate-spin" />
        <p className="text-[#4A6A60] font-medium text-sm">Loading Hiring Analytics...</p>
      </div>
    );
  }

  // Handle empty state (No jobs posted)
  if (!overview || overview.stats.totalJobs === 0) {
    return (
      <div className="space-y-6 p-6">
        <HeroCard
          badgeText="Employer Analytics"
          title="Hiring Performance"
          description="Monitor application volumes, tracking hiring funnel conversion statistics, and see candidate experience distribution metrics."
          IconComponent={TrendingUp}
        />
        <div className="bg-white border border-[#E2ECE5] rounded-3xl p-16 text-center shadow-sm">
          <Briefcase className="w-16 h-16 text-[#659287] mx-auto mb-4 opacity-50" />
          <h3 className="font-extrabold text-[#2F4F46] text-2xl mb-2">No Jobs Posted</h3>
          <p className="text-[#4A6A60] max-w-md mx-auto text-sm leading-relaxed mb-6">
            Create your first job posting to begin collecting rich, real-time insights and analytics on incoming candidates.
          </p>
          <a
            href="/employer/jobs/new"
            className="inline-flex items-center gap-2 px-6 h-12 bg-[#2F4F46] hover:bg-[#4A6A60] text-white text-sm font-bold rounded-xl transition-all"
          >
            Post Your First Job
          </a>
        </div>
      </div>
    );
  }

  const { stats, funnel, rates, topSkills, locations, experienceDistribution, educationDistribution, recentActivity, popularJobs, leastPerformingJobs } = overview;

  // Process data for the status pie chart
  const statusPieData = [
    { name: 'Applied', value: stats.totalApplications - stats.shortlistedCount - stats.interviewCount - stats.rejectedCount - stats.hiredCount },
    { name: 'Shortlisted', value: stats.shortlistedCount },
    { name: 'Interview', value: stats.interviewCount },
    { name: 'Rejected', value: stats.rejectedCount },
    { name: 'Hired', value: stats.hiredCount }
  ].filter(item => item.value > 0);

  // If no candidates applied
  if (stats.totalApplications === 0) {
    return (
      <div className="space-y-6 p-6">
        <HeroCard
          badgeText="Employer Analytics"
          title="Hiring Performance"
          description="Monitor application volumes, tracking hiring funnel conversion statistics, and see candidate experience distribution metrics."
          IconComponent={TrendingUp}
        />
        <div className="bg-white border border-[#E2ECE5] rounded-3xl p-16 text-center shadow-sm">
          <Users className="w-16 h-16 text-[#88BDA4] mx-auto mb-4 opacity-50" />
          <h3 className="font-extrabold text-[#2F4F46] text-2xl mb-2">No Candidates Yet</h3>
          <p className="text-[#4A6A60] max-w-md mx-auto text-sm leading-relaxed mb-6">
            Analytics will become available after candidates begin applying to your job postings.
          </p>
          <button
            onClick={() => loadData(true)}
            className="inline-flex items-center gap-2 px-6 h-12 border border-[#E2ECE5] hover:bg-[#F7FAF8] text-[#2F4F46] text-sm font-bold rounded-xl transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  // Funnel chart data mapping for Recharts Funnel
  const rechartsFunnelData = [
    { value: funnel.applied, name: 'Applied', fill: '#2F4F46' },
    { value: funnel.reviewed, name: 'Reviewed', fill: '#4A6A60' },
    { value: funnel.shortlisted, name: 'Shortlisted', fill: '#659287' },
    { value: funnel.interview, name: 'Interview', fill: '#88BDA4' },
    { value: funnel.offer, name: 'Offer', fill: '#B1D3B9' },
    { value: funnel.hired, name: 'Hired', fill: '#D5E6DC' }
  ];

  // Calculated KPI fields
  const avgApplicationsPerJob = stats.totalJobs > 0 ? (stats.totalApplications / stats.totalJobs).toFixed(1) : '0';
  const jobFillRate = stats.totalJobs > 0 ? Math.round((stats.hiredCount / stats.totalJobs) * 100) : 0;

  // Sorting top performing jobs by hired count or conversion success
  const topPerformingJobsList = [...overview.jobsPerformance]
    .sort((a, b) => b.hired - a.hired || b.applications - a.applications)
    .slice(0, 5);

  return (
    <div className="space-y-8 p-6 min-h-screen bg-[#F7FAF8] print:bg-white print:p-0">
      <div className="print:hidden space-y-8">
        <HeroCard
          badgeText="Recruitment Analytics"
          title="Hiring Insights"
          description="Monitor application volumes, tracking hiring funnel conversion statistics, and see candidate experience distribution metrics."
          IconComponent={TrendingUp}
        />
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <p className="text-sm text-[#4A6A60] font-medium mt-1">
            Track recruitment performance using real hiring data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Date Range Select */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="h-11 px-4 text-xs font-bold rounded-xl border border-[#E2ECE5] bg-white text-[#2F4F46] hover:bg-[#F7FAF8] outline-none shadow-sm transition-all"
          >
            <option value="all">All-time Data</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* Refresh Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => loadData(true)}
            className="h-11 w-11 flex items-center justify-center rounded-xl border border-[#E2ECE5] bg-white text-[#2F4F46] hover:bg-[#F7FAF8] shadow-sm transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>

          {/* Quick Export Trigger */}
          <div className="relative group">
            <button
              className="h-11 px-4 flex items-center gap-2 rounded-xl bg-[#2F4F46] hover:bg-[#4A6A60] text-white text-xs font-bold shadow-sm transition-all"
            >
              <Download size={14} />
              Export
            </button>
            <div className="absolute right-0 top-12 w-40 bg-white border border-[#E2ECE5] rounded-xl shadow-lg hidden group-hover:block z-50 overflow-hidden">
              <button
                onClick={() => handleExportReport('csv')}
                className="w-full text-left px-4 py-2.5 text-xs text-[#2F4F46] hover:bg-[#F7FAF8] font-bold"
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExportReport('excel')}
                className="w-full text-left px-4 py-2.5 text-xs text-[#2F4F46] hover:bg-[#F7FAF8] font-bold"
              >
                Export Excel
              </button>
              <button
                onClick={() => handleExportReport('pdf')}
                className="w-full text-left px-4 py-2.5 text-xs text-[#2F4F46] hover:bg-[#F7FAF8] font-bold"
              >
                Export PDF (Print)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          {
            title: 'Total Jobs',
            value: stats.totalJobs,
            subtitle: `${stats.activeJobs} Active`,
            icon: Briefcase,
            color: '#2F4F46',
            bg: 'bg-[#2F4F46]/5'
          },
          {
            title: 'Total Apps',
            value: stats.totalApplications,
            subtitle: `${stats.appsThisMonth} This Month`,
            icon: Users,
            color: '#659287',
            bg: 'bg-[#659287]/5',
            growth: stats.growthRate
          },
          {
            title: 'Shortlisted',
            value: stats.shortlistedCount,
            subtitle: `${rates.shortlistRate}% Shortlist Rate`,
            icon: Award,
            color: '#88BDA4',
            bg: 'bg-[#88BDA4]/5'
          },
          {
            title: 'Interviews',
            value: stats.interviewCount,
            subtitle: `${rates.interviewRate}% Interview Rate`,
            icon: Clock,
            color: '#B1D3B9',
            bg: 'bg-[#B1D3B9]/5'
          },
          {
            title: 'Hires',
            value: stats.hiredCount,
            subtitle: `${rates.hiringSuccessRate}% Success Rate`,
            icon: CheckCircle,
            color: '#2F4F46',
            bg: 'bg-[#2F4F46]/10'
          }
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-white border border-[#E2ECE5] rounded-2xl p-5 shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-[#4A6A60] uppercase tracking-wider">{card.title}</p>
                <h3 className="text-3xl font-extrabold text-[#2F4F46] mt-1">{card.value}</h3>
              </div>
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`} style={{ color: card.color }}>
                <card.icon size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-[#4A6A60] font-semibold">{card.subtitle}</span>
              {card.growth !== undefined && card.growth !== 0 && (
                <span className={`flex items-center gap-0.5 font-bold ${card.growth > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {card.growth > 0 ? <ChevronRight className="rotate-[-90deg] w-3 h-3" /> : <ChevronRight className="rotate-90 w-3 h-3" />}
                  {Math.abs(card.growth)}%
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* CORE CHARTS: TREND & FUNNEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Trend Chart */}
        <div className="bg-white border border-[#E2ECE5] p-6 rounded-3xl shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h4 className="text-base font-extrabold text-[#2F4F46] flex items-center gap-2">
                <TrendingUp size={18} className="text-[#659287]" />
                Application Trend
              </h4>
              <p className="text-xs text-[#4A6A60]">Real timeline submission tracking</p>
            </div>
            {/* Trend switches */}
            <div className="flex items-center bg-[#F7FAF8] p-1 border border-[#E2ECE5] rounded-xl">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTrendRange(r)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize ${
                    trendRange === r
                      ? 'bg-[#2F4F46] text-white shadow-sm'
                      : 'text-[#4A6A60] hover:text-[#2F4F46]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            {trends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#4A6A60]">No analytics available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#88BDA4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#88BDA4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#A3BCA9" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#A3BCA9" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2ECE5',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#2F4F46',
                    }}
                  />
                  <Area type="monotone" dataKey="applicants" stroke="#659287" strokeWidth={2.5} fillOpacity={1} fill="url(#trendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Hiring Funnel Stage Conversions */}
        <div className="bg-white border border-[#E2ECE5] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-base font-extrabold text-[#2F4F46]">Hiring Funnel</h4>
            <p className="text-xs text-[#4A6A60] mb-4">Pipeline stage count conversion rates</p>
          </div>
          <div className="h-72 flex flex-col justify-between">
            <ResponsiveContainer width="100%" height="90%">
              <FunnelChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2ECE5',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Funnel dataKey="value" data={rechartsFunnelData} isAnimationActive>
                  <LabelList position="right" fill="#2F4F46" stroke="none" dataKey="name" fontSize={11} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
            <div className="text-[10px] text-center font-bold text-[#4A6A60] mt-2">
              Conversion rate (Applied → Hired): {rates.hiringSuccessRate}%
            </div>
          </div>
        </div>
      </div>

      {/* COHORT BREAKDOWNS (PIE / RADIAL CHARTS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white border border-[#E2ECE5] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-[#2F4F46] mb-1">Status Distribution</h4>
            <p className="text-xs text-[#4A6A60] mb-4">Active state comparison</p>
          </div>
          <div className="h-56 flex flex-col justify-center items-center">
            {statusPieData.length === 0 ? (
              <p className="text-xs text-[#4A6A60]">No analytics available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Custom mini legend */}
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {statusPieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[9px] font-bold text-[#4A6A60]">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Experience Level */}
        <div className="bg-white border border-[#E2ECE5] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-[#2F4F46] mb-1">Experience Distribution</h4>
            <p className="text-xs text-[#4A6A60] mb-4">Applicant career levels</p>
          </div>
          <div className="h-56 flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={experienceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {experienceDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom mini legend */}
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {experienceDistribution.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[(i + 2) % COLORS.length] }} />
                  <span className="text-[9px] font-bold text-[#4A6A60]">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Education Breakdown */}
        <div className="bg-white border border-[#E2ECE5] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-[#2F4F46] mb-1">Education Breakdown</h4>
            <p className="text-xs text-[#4A6A60] mb-4">Degrees and qualifications</p>
          </div>
          <div className="h-56 flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={educationDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {educationDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom mini legend */}
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {educationDistribution.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[(i + 3) % COLORS.length] }} />
                  <span className="text-[9px] font-bold text-[#4A6A60]">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TOP SKILLS & LOCATION ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Skills Chart */}
        <div className="bg-white border border-[#E2ECE5] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-base font-extrabold text-[#2F4F46] flex items-center gap-2">
              <Award size={18} className="text-[#659287]" />
              Top Applicant Skills
            </h4>
            <p className="text-xs text-[#4A6A60] mb-4">Counted skill frequencies across candidates</p>
          </div>
          <div className="h-60">
            {topSkills.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#4A6A60]">No skill analytics available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSkills} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <XAxis type="number" stroke="#A3BCA9" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#2F4F46" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#88BDA4" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Location Analytics */}
        <div className="bg-white border border-[#E2ECE5] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-base font-extrabold text-[#2F4F46] flex items-center gap-2">
              <MapPin size={18} className="text-[#659287]" />
              Location Analytics
            </h4>
            <p className="text-xs text-[#4A6A60] mb-4">Distribution of candidates by city and country</p>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold text-[#4A6A60] uppercase tracking-wider mb-2">Cities</p>
              {locations.cities.length === 0 ? (
                <p className="text-xs text-[#4A6A60] italic">No cities available.</p>
              ) : (
                <div className="space-y-2">
                  {locations.cities.map((city) => (
                    <div key={city.name} className="flex justify-between items-center bg-[#F7FAF8] p-2 rounded-xl border border-[#E2ECE5]">
                      <span className="text-xs font-semibold text-[#2F4F46] truncate max-w-[100px]">{city.name}</span>
                      <span className="text-xs font-bold text-[#659287]">{city.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#4A6A60] uppercase tracking-wider mb-2">Countries</p>
              {locations.countries.length === 0 ? (
                <p className="text-xs text-[#4A6A60] italic">No countries available.</p>
              ) : (
                <div className="space-y-2">
                  {locations.countries.map((country) => (
                    <div key={country.name} className="flex justify-between items-center bg-[#F7FAF8] p-2 rounded-xl border border-[#E2ECE5]">
                      <span className="text-xs font-semibold text-[#2F4F46] truncate max-w-[100px]">{country.name}</span>
                      <span className="text-xs font-bold text-[#659287]">{country.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* JOB RANKINGS: POPULAR VS LEAST PERFORMING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Popular Jobs */}
        <div className="bg-white border border-[#E2ECE5] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-base font-extrabold text-[#2F4F46] mb-1">Most Popular Positions</h4>
            <p className="text-xs text-[#4A6A60] mb-4">Top 5 job postings by application count</p>
          </div>
          <div className="space-y-3">
            {popularJobs.map((job, idx) => (
              <div key={job.id} className="flex items-center justify-between p-3.5 bg-[#F7FAF8] border border-[#E2ECE5] rounded-2xl hover:border-[#659287] transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#2F4F46]/5 flex items-center justify-center text-xs font-black text-[#2F4F46]">
                    {idx + 1}
                  </span>
                  <p className="text-xs font-bold text-[#2F4F46]">{job.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-[#659287]">{job.applications} Apps</p>
                  <p className="text-[10px] text-[#4A6A60]">Hiring Rate: {job.hiringRate}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Least Performing Jobs & Recommendations */}
        <div className="bg-white border border-[#E2ECE5] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-base font-extrabold text-[#2F4F46] mb-1">Positions Requiring Attention</h4>
            <p className="text-xs text-[#4A6A60] mb-4">Postings with lowest candidate interaction</p>
          </div>
          <div className="space-y-3">
            {leastPerformingJobs.map((job, idx) => (
              <div key={job.id} className="flex items-center justify-between p-3.5 bg-[#F7FAF8] border border-[#E2ECE5] rounded-2xl hover:border-[#E6F2DD] transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#2F4F46]/5 flex items-center justify-center text-xs font-black text-[#2F4F46]">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#2F4F46]">{job.title}</p>
                    <p className="text-[9px] text-[#659287]">Actionable adjustment advice recommended</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-orange-600">{job.applications} Apps</p>
                  <p className="text-[10px] text-[#4A6A60]">Rate: {job.conversionRate}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* JOB PERFORMANCE TABLE */}
      <div className="bg-white border border-[#E2ECE5] p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h4 className="text-base font-extrabold text-[#2F4F46]">Job Performance Tracker</h4>
            <p className="text-xs text-[#4A6A60]">Complete list metrics calculation for active positions</p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#88BDA4]" />
            <input
              type="text"
              placeholder="Search positions..."
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-xs rounded-xl border border-[#E2ECE5] bg-[#F7FAF8] text-[#2F4F46] placeholder:text-[#4A6A60]/60 outline-none transition-all focus:ring-2 focus:ring-[#659287]/50"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2ECE5]">
                <th className="pb-3 text-[10px] font-bold text-[#4A6A60] uppercase">Job Title</th>
                <th className="pb-3 text-[10px] font-bold text-[#4A6A60] uppercase text-center">Applications</th>
                <th className="pb-3 text-[10px] font-bold text-[#4A6A60] uppercase text-center">Shortlisted</th>
                <th className="pb-3 text-[10px] font-bold text-[#4A6A60] uppercase text-center">Interview</th>
                <th className="pb-3 text-[10px] font-bold text-[#4A6A60] uppercase text-center">Rejected</th>
                <th className="pb-3 text-[10px] font-bold text-[#4A6A60] uppercase text-center">Hired</th>
                <th className="pb-3 text-[10px] font-bold text-[#4A6A60] uppercase text-center">Hiring Rate</th>
                <th className="pb-3 text-[10px] font-bold text-[#4A6A60] uppercase text-center">Acceptance Rate</th>
                <th className="pb-3 text-[10px] font-bold text-[#4A6A60] uppercase text-center">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobsPerformance.map((job) => (
                <tr key={job.id} className="border-b border-[#E2ECE5]/50 hover:bg-[#F7FAF8]/50 transition-colors">
                  <td className="py-4 text-xs font-bold text-[#2F4F46]">{job.title}</td>
                  <td className="py-4 text-xs text-[#2F4F46] text-center font-semibold">{job.applications}</td>
                  <td className="py-4 text-xs text-[#2F4F46] text-center font-semibold">{job.shortlisted}</td>
                  <td className="py-4 text-xs text-[#2F4F46] text-center font-semibold">{job.interview}</td>
                  <td className="py-4 text-xs text-[#2F4F46] text-center font-semibold">{job.rejected}</td>
                  <td className="py-4 text-xs text-[#2F4F46] text-center font-semibold">{job.hired}</td>
                  <td className="py-4 text-xs text-[#659287] text-center font-bold">{job.hiringRate}%</td>
                  <td className="py-4 text-xs text-[#659287] text-center font-bold">{job.acceptanceRate}%</td>
                  <td className="py-4 text-xs text-[#2F4F46] text-center font-extrabold">{job.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED REPORT GENERATION FORM */}
      <div className="bg-white border border-[#E2ECE5] p-6 rounded-3xl shadow-sm">
        <h4 className="text-base font-extrabold text-[#2F4F46] mb-1">Generate Export Reports</h4>
        <p className="text-xs text-[#4A6A60] mb-6">Select report type to extract live backend statistics</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-[10px] font-bold text-[#4A6A60] uppercase tracking-wider mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full h-11 px-3 text-xs font-bold rounded-xl border border-[#E2ECE5] text-[#2F4F46] bg-white outline-none shadow-sm"
            >
              <option value="overall">Overall Hiring Report</option>
              <option value="job-wise">Job-wise Performance Report</option>
              <option value="candidate">Candidate Demographics Report</option>
              <option value="application">Detailed Applications Report</option>
              <option value="interview">Interview Schedule Report</option>
              <option value="monthly">Monthly Snapshot Report</option>
              <option value="weekly">Weekly Pipelines Report</option>
              <option value="status">Status Distribution Report</option>
            </select>
          </div>
          <div className="sm:pt-6 flex gap-3">
            <button
              onClick={() => handleExportReport('csv')}
              disabled={exportLoading}
              className="h-11 px-5 flex items-center gap-2 rounded-xl bg-[#2F4F46] hover:bg-[#4A6A60] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 pointer-events-auto cursor-pointer"
            >
              <Download size={14} />
              Export CSV
            </button>
            <button
              onClick={() => handleExportReport('excel')}
              disabled={exportLoading}
              className="h-11 px-5 flex items-center gap-2 rounded-xl border border-[#E2ECE5] hover:bg-[#F7FAF8] text-[#2F4F46] text-xs font-bold shadow-sm transition-all disabled:opacity-50 pointer-events-auto cursor-pointer"
            >
              <FileText size={14} />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY FEED */}
      <div className="bg-white border border-[#E2ECE5] p-6 rounded-3xl shadow-sm">
        <h4 className="text-base font-extrabold text-[#2F4F46] mb-1">Recent Activity Feed</h4>
        <p className="text-xs text-[#4A6A60] mb-6">Real-time candidate and dashboard updates</p>
        <div className="space-y-4 max-h-[300px] overflow-y-auto">
          {recentActivity.length === 0 ? (
            <p className="text-xs text-[#4A6A60] italic">No recent activity detected.</p>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4 items-start p-3 bg-[#F7FAF8] border border-[#E2ECE5] rounded-2xl hover:border-[#659287] transition-all">
                <div className="w-8 h-8 rounded-full bg-[#659287]/10 flex items-center justify-center text-[#659287] flex-shrink-0 font-bold text-xs uppercase">
                  {activity.type.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#2F4F46]">{activity.title}</p>
                  <p className="text-[10px] text-[#4A6A60] mt-0.5">{activity.description}</p>
                </div>
                <span className="text-[10px] font-bold text-[#4A6A60] whitespace-nowrap">
                  {new Date(activity.time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      </div>

      {/* PDF PRINT ONLY CONTAINER */}
      <div className="absolute left-[-9999px] top-[-9999px] w-[900px] print:static print:left-0 print:top-0 print:w-full print:block print-report-container bg-white">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body, html {
              background: white !important;
              color: #1a2e26 !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
            }

            body > div:not(.print-report-container),
            #root > div > div:not(.print-report-container),
            .print-hidden,
            aside, nav, .sidebar, .navbar, .no-print, button, select, .react-hot-toast {
              display: none !important;
            }
            
            main {
              margin-left: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
            }

            .print-report-container {
              display: block !important;
              width: 100% !important;
              padding: 40px !important;
              color: #1a2e26 !important;
              background: white !important;
              font-family: 'Inter', system-ui, sans-serif !important;
            }

            @page {
              margin: 1.5cm;
              size: portrait;
            }

            tr {
              page-break-inside: avoid !important;
            }
            
            thead {
              display: table-header-group !important;
            }

            .print-card {
              page-break-inside: avoid !important;
            }
          }
        `}} />

        {/* Report Header */}
        <div className="border-b-4 border-[#2F4F46] pb-5 mb-8 flex justify-between items-end">
          <div className="flex items-center gap-4">
            {profile?.profilePicture ? (
              <img src={getFullUrl(profile.profilePicture)} alt="Company Logo" className="w-12 h-12 rounded-xl border border-gray-250 object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#2F4F46] flex items-center justify-center text-white font-black text-xl">W</div>
            )}
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xl font-black text-[#2F4F46] tracking-tight">{profile?.name || employerName}</span>
              </div>
              <h1 className="text-2xl font-black text-[#2F4F46] tracking-tight">Employer Analytics Report</h1>
              <p className="text-xs text-[#4A6A60] font-semibold mt-0.5">WorkWave recruitment workspace telemetric review</p>
            </div>
          </div>
          <div className="text-right text-xs text-[#4A6A60] space-y-1">
            <p><span className="font-bold text-[#2F4F46]">Employer Name:</span> {employerName}</p>
            <p><span className="font-bold text-[#2F4F46]">Generated Date:</span> {new Date().toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</p>
            <p><span className="font-bold text-[#2F4F46]">Reporting Period:</span> {dateRange === 'all' ? 'All-Time Pipeline' : dateRange === 'today' ? 'Today' : dateRange === 'week' ? 'Past 7 Days' : 'Current Month'}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="print-card bg-[#F7FAF8] border border-[#E2ECE5] p-5 rounded-2xl mb-8">
          <h2 className="text-xs font-extrabold text-[#2F4F46] uppercase tracking-wider mb-2">Executive Summary</h2>
          <p className="text-xs text-[#4A6A60] leading-relaxed">
            {`As of ${new Date().toLocaleDateString()}, this recruitment audit reports aggregate metrics across ${stats.totalJobs} posted roles (${stats.activeJobs} active, ${stats.closedJobs} archived) and a cumulative pipeline of ${stats.totalApplications} candidate applications. Currently, ${stats.shortlistedCount} candidate profiles have been shortlisted for vetting, leading to ${stats.interviewCount} scheduled interviews. Thus far, ${stats.hiredCount} positions have been successfully filled, reflecting an overall hiring conversion success rate of ${stats.totalApplications > 0 ? Math.round((stats.hiredCount / stats.totalApplications) * 100) : 0}%.`}
          </p>
        </div>

        {/* Overview summary cards */}
        <h2 className="text-xs font-extrabold text-[#2F4F46] mb-3 uppercase tracking-wider pl-1">Overview Summary</h2>
        <div className="print-card grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Jobs Posted', val: stats.totalJobs },
            { label: 'Active Jobs', val: stats.activeJobs },
            { label: 'Archived Jobs', val: stats.closedJobs },
            { label: 'Total Applications', val: stats.totalApplications },
            { label: 'Candidates Shortlisted', val: stats.shortlistedCount },
            { label: 'Interviews Scheduled', val: stats.interviewCount },
            { label: 'Candidates Hired', val: stats.hiredCount },
            { label: 'Rejected Candidates', val: stats.rejectedCount },
            { label: 'Total Profile Views', val: stats.profileViews || 0 }
          ].map(s => (
            <div key={s.label} className="border border-[#E2ECE5] p-4 rounded-2xl text-center bg-white shadow-sm flex flex-col justify-between">
              <p className="text-[9px] font-bold text-[#4A6A60] uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-black text-[#2F4F46] mt-2">{s.val}</p>
            </div>
          ))}
        </div>

        {/* Hiring Performance metrics */}
        <h2 className="text-xs font-extrabold text-[#2F4F46] mb-3 uppercase tracking-wider pl-1">Hiring Performance</h2>
        <div className="print-card grid grid-cols-5 gap-3 mb-8 text-[10px]">
          <div className="p-3.5 border border-[#E2ECE5] rounded-xl text-center bg-[#F7FAF8]">
            <p className="text-[#4A6A60] font-bold">Average Apps per Job</p>
            <p className="text-lg font-black text-[#2F4F46] mt-1">{avgApplicationsPerJob}</p>
          </div>
          <div className="p-3.5 border border-[#E2ECE5] rounded-xl text-center bg-[#F7FAF8]">
            <p className="text-[#4A6A60] font-bold">Hiring Rate</p>
            <p className="text-lg font-black text-[#2F4F46] mt-1">{rates.hiringSuccessRate}%</p>
          </div>
          <div className="p-3.5 border border-[#E2ECE5] rounded-xl text-center bg-[#F7FAF8]">
            <p className="text-[#4A6A60] font-bold">Interview Conv. Rate</p>
            <p className="text-lg font-black text-[#2F4F46] mt-1">{rates.interviewRate}%</p>
          </div>
          <div className="p-3.5 border border-[#E2ECE5] rounded-xl text-center bg-[#F7FAF8]">
            <p className="text-[#4A6A60] font-bold">Avg Time to Hire</p>
            <p className="text-lg font-black text-[#2F4F46] mt-1">{rates.avgHiringTime} Days</p>
          </div>
          <div className="p-3.5 border border-[#E2ECE5] rounded-xl text-center bg-[#F7FAF8]">
            <p className="text-[#4A6A60] font-bold">Job Fill Rate</p>
            <p className="text-lg font-black text-[#2F4F46] mt-1">{jobFillRate}%</p>
          </div>
        </div>

        {/* Core Charts Section */}
        <h2 className="text-xs font-extrabold text-[#2F4F46] mb-3 uppercase tracking-wider pl-1">Visual Recruitment Charts</h2>
        <div className="grid grid-cols-2 gap-6 my-4 print-card mb-8">
          {/* Applications Over Time */}
          <div className="border border-[#E2ECE5] p-4 rounded-xl bg-white shadow-sm">
            <h3 className="text-[10px] font-extrabold text-[#2F4F46] uppercase tracking-wider mb-2">Applications Over Time</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#A3BCA9" fontSize={8} />
                  <YAxis stroke="#A3BCA9" fontSize={8} />
                  <Area type="monotone" dataKey="applicants" stroke="#659287" strokeWidth={1.5} fill="#B1D3B9" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hiring Funnel */}
          <div className="border border-[#E2ECE5] p-4 rounded-xl bg-white shadow-sm">
            <h3 className="text-[10px] font-extrabold text-[#2F4F46] uppercase tracking-wider mb-2">Hiring Funnel</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Funnel dataKey="value" data={rechartsFunnelData}>
                    <LabelList position="right" fill="#2F4F46" stroke="none" dataKey="name" fontSize={8} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Job Performance */}
          <div className="border border-[#E2ECE5] p-4 rounded-xl bg-white shadow-sm">
            <h3 className="text-[10px] font-extrabold text-[#2F4F46] uppercase tracking-wider mb-2">Job Performance</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.jobsPerformance.slice(0, 5)} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="title" stroke="#A3BCA9" fontSize={7} />
                  <YAxis stroke="#A3BCA9" fontSize={8} />
                  <Bar dataKey="applications" fill="#659287" name="Applicants" />
                  <Bar dataKey="hired" fill="#2F4F46" name="Hired" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Applicant Status Distribution */}
          <div className="border border-[#E2ECE5] p-4 rounded-xl bg-white shadow-sm">
            <h3 className="text-[10px] font-extrabold text-[#2F4F46] uppercase tracking-wider mb-2">Applicant Status Distribution</h3>
            <div className="h-40 w-full flex flex-col justify-between">
              <ResponsiveContainer width="100%" height="75%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={22}
                    outerRadius={32}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-2 gap-y-1 justify-center mt-1">
                {statusPieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[7px] font-bold text-[#4A6A60]">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Job Performance Tracker Table */}
        <div className="print-card mb-8">
          <h2 className="text-xs font-extrabold text-[#2F4F46] mb-3 uppercase tracking-wider border-b border-[#E2ECE5] pb-2">Job Performance Tracking</h2>
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-[#2F4F46]/30 text-[#4A6A60] font-bold uppercase tracking-wider bg-[#F7FAF8]">
                <th className="py-2 px-3">Job Title</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-3 text-center font-bold">Applicants</th>
                <th className="py-2 px-3 text-center">Shortlisted</th>
                <th className="py-2 px-3 text-center">Interviewed</th>
                <th className="py-2 px-3 text-center">Hired</th>
                <th className="py-2 px-3 text-center">Posted Date</th>
              </tr>
            </thead>
            <tbody>
              {overview.jobsPerformance.map((job) => (
                <tr key={job.id} className="border-b border-[#E2ECE5] hover:bg-[#F7FAF8]/30">
                  <td className="py-2 px-3 font-bold text-[#2F4F46]">{job.title}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${job.applications > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-500'}`}>
                      {job.applications > 0 ? 'Active' : 'Draft/Pending'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center font-extrabold text-[#2F4F46]">{job.applications}</td>
                  <td className="py-2 px-3 text-center text-[#4A6A60]">{job.shortlisted}</td>
                  <td className="py-2 px-3 text-center text-[#4A6A60]">{job.interview}</td>
                  <td className="py-2 px-3 text-center font-bold text-emerald-600">{job.hired}</td>
                  <td className="py-2 px-3 text-center text-[#4A6A60]">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Applicant Analytics Status Splits */}
        <div className="print-card mb-8">
          <h2 className="text-xs font-extrabold text-[#2F4F46] mb-3 uppercase tracking-wider border-b border-[#E2ECE5] pb-2">Applicant Analytics Status Splits</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] font-bold text-[#4A6A60] uppercase tracking-wider mb-2">Hiring pipeline totals</p>
              <div className="space-y-1.5 text-[10px] text-gray-650">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Total Applicants Pool</span>
                  <span className="font-bold text-[#2F4F46]">{stats.totalApplications}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>New Applicants This Week</span>
                  <span className="font-bold text-[#2F4F46]">{stats.appsThisWeek}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Shortlisted Candidates</span>
                  <span className="font-bold text-[#2F4F46]">{stats.shortlistedCount}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#4A6A60] uppercase tracking-wider mb-2">Vetting Pipelines</p>
              <div className="space-y-1.5 text-[10px] text-gray-650">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Interviews Scheduled</span>
                  <span className="font-bold text-amber-700">{stats.interviewCount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Rejected Candidates</span>
                  <span className="font-bold text-rose-600">{stats.rejectedCount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Hired Profiles</span>
                  <span className="font-bold text-emerald-600">{stats.hiredCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Jobs */}
        <div className="print-card mb-8">
          <h2 className="text-xs font-extrabold text-[#2F4F46] mb-3 uppercase tracking-wider border-b border-[#E2ECE5] pb-2">Top Performing Jobs</h2>
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-[#2F4F46]/30 text-[#4A6A60] font-bold uppercase tracking-wider bg-[#F7FAF8]">
                <th className="py-2 px-3">Job Title</th>
                <th className="py-2 px-3 text-center">Applicants</th>
                <th className="py-2 px-3 text-center">Hired</th>
                <th className="py-2 px-3 text-center font-bold">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {topPerformingJobsList.map((job) => (
                <tr key={job.id} className="border-b border-[#E2ECE5]">
                  <td className="py-2 px-3 font-semibold text-[#2F4F46]">{job.title}</td>
                  <td className="py-2 px-3 text-center text-[#4A6A60]">{job.applications}</td>
                  <td className="py-2 px-3 text-center text-[#4A6A60]">{job.hired}</td>
                  <td className="py-2 px-3 text-center font-bold text-[#659287]">{job.hiringRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Hiring Activity Feed */}
        <div className="print-card mb-8">
          <h2 className="text-xs font-extrabold text-[#2F4F46] mb-3 uppercase tracking-wider border-b border-[#E2ECE5] pb-2">Recent Hiring Activity Log</h2>
          <div className="space-y-2 text-[10px] text-gray-650">
            {recentActivity.slice(0, 8).map((activity) => (
              <div key={activity.id} className="flex justify-between items-center py-1.5 border-b border-gray-150">
                <div>
                  <span className="font-bold text-[#2F4F46] mr-2">[{activity.type.toUpperCase()}]</span>
                  <span>{activity.title} — {activity.description}</span>
                </div>
                <span className="text-[9px] text-[#4A6A60]">
                {new Date(activity.time).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-[#E2ECE5] text-[8px] text-[#4A6A60] flex justify-between items-center print-footer">
          <span>Generated automatically by WorkWave Employer Analytics &copy; {new Date().getFullYear()}</span>
          <span>Printed: {new Date().toLocaleString()}</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
