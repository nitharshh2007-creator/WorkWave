import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Bell,
  Bookmark,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  MapPin,
  IndianRupee,
  ShieldAlert,
  UserCheck,
  Check,
  ExternalLink,
  Eye,
  FileText,
  Sparkles,
  ArrowUpRight,
  Compass,
  FileSignature,
  Users,
  Video,
  X
} from "lucide-react";
import toast from "react-hot-toast";

import { fetchDashboardData } from "../services/dashboardService";
import type { DashboardData, JobInfo } from "../services/dashboardService";
import { ActivityTimeline } from "../components/ActivityTimeline";
import api from "../services/api";
import Header from "../components/Header";

// Static premium learning resources contents
const resourcesData = [
  {
    id: "resume-tips",
    title: "Resume Tips",
    desc: "Build a highly professional, parse-friendly developer resume.",
    gradient: "from-emerald-500/10 via-white to-white",
    icon: FileText,
    subtitle: "How to pass developer ATS filters and stand out",
    content: `
      <h4>1. Use a Clean, Single-Column Layout</h4>
      <p>Applicant Tracking Systems (ATS) read single-column formats best. Avoid complex sidebars, tables, or non-standard fonts that make parsing your information difficult.</p>
      
      <h4>2. Highlight Action-Oriented Impact</h4>
      <p>Instead of listing your duties, frame your accomplishments using action verbs and concrete metrics. Use the formula: <strong>Accomplished [X] as measured by [Y], by doing [Z]</strong>.</p>
      <p><em>Example:</em> "Optimized API load times by 40% (X) through implementing Redis caching (Z), leading to a smoother checkout workflow for 50,000 monthly users (Y)."</p>
      
      <h4>3. Key Developer Sections to Include</h4>
      <ul>
        <li><strong>Professional Summary:</strong> 2-3 sentences outlining your stack specialization and core achievements.</li>
        <li><strong>Technical Skills:</strong> Grouped clearly by languages, frameworks, databases, and developer tools.</li>
        <li><strong>Projects:</strong> Mention repository links, technical stack used, and the problem you solved.</li>
        <li><strong>Work History & Education:</strong> Standard reverse-chronological order.</li>
      </ul>
      
      <h4>4. Tailor to the Job Description</h4>
      <p>Review the job requirements and incorporate keywords naturally into your resume. Match skills like "TypeScript", "REST APIs", or "Agile Methodologies" if they appear in the posting.</p>
    `
  },
  {
    id: "interview-prep",
    title: "Interview Prep",
    desc: "Key questions, structure guidelines, and interview practice guides.",
    gradient: "from-amber-500/10 via-white to-white",
    icon: Video,
    subtitle: "Mastering coding interviews and behavioral rounds",
    content: `
      <h4>1. Master the STAR Method for Behaviorals</h4>
      <p>Answer behavioral questions by structuring your response into four components:</p>
      <ul>
        <li><strong>Situation:</strong> Provide the background context.</li>
        <li><strong>Task:</strong> Explain the challenge or goal you needed to address.</li>
        <li><strong>Action:</strong> Detail the specific actions you took (focus on your individual contribution).</li>
        <li><strong>Result:</strong> State the outcome, metrics, and what you learned.</li>
      </ul>
      
      <h4>2. Technical Preparation Checklist</h4>
      <ul>
        <li><strong>Data Structures:</strong> Understand Arrays, Hash Maps, Trees, Stacks, Queues, and Graphs inside out.</li>
        <li><strong>Algorithms:</strong> Practice Sorting, Binary Search, Recursion, Breadth-First Search (BFS), and Depth-First Search (DFS).</li>
        <li><strong>System Design:</strong> Brush up on horizontal scaling, load balancers, caching, database indexing, and message queues.</li>
      </ul>
      
      <h4>3. Think Out Loud During Coding Rounds</h4>
      <p>Interviewers value your thought process over a quiet perfect solution. Talk through your approach, discuss trade-offs (Time & Space complexity), and clarify assumptions before writing code.</p>
    `
  },
  {
    id: "career-strategy",
    title: "Career Strategy",
    desc: "Articles on finding, choosing, and planning your next career milestone.",
    gradient: "from-blue-500/10 via-white to-white",
    icon: Compass,
    subtitle: "Long-term planning and stack specialization",
    content: `
      <h4>1. Define Your Stack Specialization</h4>
      <p>While being a generalist is helpful early on, specialization builds high market value. Choose a deep focus area: Full Stack JS (React/Node), Cloud Infrastructure (DevOps/Kubernetes), Backend Systems (Go/Rust), or Mobile (Flutter/Swift).</p>
      
      <h4>2. Build a Living Portfolio</h4>
      <p>A GitHub profile with clean, documented code speaks louder than any resume. Maintain 1-2 pinning projects with detailed READMEs, architecture diagrams, and live demonstration links.</p>
      
      <h4>3. Contribute to Open Source</h4>
      <p>Contributing to public repositories demonstrates your ability to read existing codebases, write unit tests, and collaborate via Pull Requests. Start with "good first issue" tags on projects you use daily.</p>
      
      <h4>4. Continuous Upskilling</h4>
      <p>Dedicate 2-3 hours weekly to learning new architectures, security patterns, or system designs. Stay ahead by reading engineering blogs from companies like Netflix, Uber, and Figma.</p>
    `
  }
];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardNotifications, setDashboardNotifications] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [appsCount, setAppsCount] = useState({
    applied: 0,
    review: 0,
    shortlisted: 0,
    interview: 0,
    hired: 0,
  });
  const [myApplications, setMyApplications] = useState<any[]>([]);

  const navigate = useNavigate();

  const handleQuickApply = async (job: any) => {
    const jobId = job._id || job.id;
    const hasApplied = myApplications.some((app: any) => {
      const appJobId = app.job?._id || app.job?.id || app.job || '';
      return appJobId.toString() === jobId.toString();
    });
    if (hasApplied) {
      toast.error("You have already applied for this job.");
      return;
    }
    try {
      await api.post("/applications", {
        job: jobId,
        coverLetter: "Quick application submitted from Dashboard.",
      });
      toast.success(`Applied to ${job.title} successfully!`);
      loadDashboard();
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 409) {
        toast.error("You have already applied for this job.");
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to submit application"
        );
      }
      loadDashboard();
    }
  };

  const handleSaveToggle = async (job: any, isSaved: boolean) => {
    const jobId = job._id || job.id;
    try {
      if (isSaved) {
        await api.delete(`/user/saved-jobs/${jobId}`);
        toast.success("Job removed from saved list");
      } else {
        await api.post("/user/saved-jobs", { jobId });
        toast.success("Job saved successfully!");
      }
      loadDashboard();
    } catch (error: any) {
      toast.error("Failed to update saved job status");
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchDashboardData();
      setData(res);
      
      const notifRes = await api.get('/notifications');
      setDashboardNotifications(notifRes.data || []);

      const appsRes = await api.get('/applications/my');
      const apps = appsRes.data || [];
      setMyApplications(apps);
      const scheduled = apps.filter((app: any) => 
        (app.status === 'Interview Scheduled' || app.status === 'Interview') && 
        app.interviewStatus === 'Upcoming' &&
        app.interviewDate
      );
      scheduled.sort((a: any, b: any) => new Date(`${a.interviewDate}T${a.interviewTime}`).getTime() - new Date(`${b.interviewDate}T${b.interviewTime}`).getTime());
      setUpcomingInterviews(scheduled);

      try {
        const savedRes = await api.get('/user/saved-jobs');
        setSavedJobs(savedRes.data || []);
      } catch (err) {
        console.error("Failed to load saved jobs", err);
      }

      try {
        const viewed = JSON.parse(localStorage.getItem("recentlyViewedJobs") || "[]");
        setRecentlyViewed(viewed.slice(0, 3));
      } catch (err) {
        console.error("Failed to load recently viewed jobs", err);
      }

      const counts = {
        applied: apps.filter((app: any) => app.status === 'Applied' || app.status === 'Pending').length,
        review: apps.filter((app: any) => app.status === 'Reviewed' || app.status === 'Under Review').length,
        shortlisted: apps.filter((app: any) => app.status === 'Shortlisted').length,
        interview: apps.filter((app: any) => app.status === 'Interview Scheduled' || app.status === 'Interview').length,
        hired: apps.filter((app: any) => app.status === 'Hired' || app.status === 'Accepted' || app.status === 'Selected / Hired').length,
      };
      setAppsCount(counts);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Failed to load dashboard data.";
      setError(msg);
      toast.error(msg);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Accepted":
      case "Hired":
      case "Selected / Hired":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E6F2DD] text-[#2F4F46] border border-[#B1D3B9]/30">
            <CheckCircle className="w-3.5 h-3.5 text-[#659287]" /> Hired
          </span>
        );
      case "Rejected":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case "Shortlisted":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-150">
            <Award className="w-3.5 h-3.5" /> Shortlisted
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8FAF8]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-[#659287]"></div>
      </div>
    );
  }

  const user = data?.user;
  const stats = data?.stats;

  const isResumeUploaded = !!(user as any)?.resumeUrl;
  const isSkillsAdded = Array.isArray((user as any)?.skills) && (user as any).skills.length > 0;
  const isPortfolioAdded = !!(user as any)?.portfolioUrl;
  const isEmailVerified = true;

  const strengthTips = [
    { text: "Upload Resume", completed: isResumeUploaded, action: () => navigate("/profile"), icon: FileText, color: "from-[#F0F6F2] to-white" },
    { text: "Add Skills", completed: isSkillsAdded, action: () => navigate("/profile"), icon: Compass, color: "from-[#F0F6F2] to-white" },
    { text: "Add Portfolio URL", completed: isPortfolioAdded, action: () => navigate("/profile"), icon: FileSignature, color: "from-[#F0F6F2] to-white" },
    { text: "Verify Email", completed: isEmailVerified, action: null, icon: CheckCircle, color: "from-[#F0F6F2] to-white" },
  ];

  return (
    <div className="text-[#2F4F46] relative bg-[#F8FAF8] min-h-screen pb-16">
      {/* Premium ambient light spots */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#B1D3B9]/15 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-[#659287]/5 to-transparent rounded-full blur-[80px] pointer-events-none" />

      {/* Floating Navbar */}
      <div className="max-w-[1600px] mx-auto px-6 pt-6">
        <Header />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 mt-8 space-y-8">
        
        {/* Welcome Section - Glassmorphic Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-r from-[#2F4F46] via-[#3D6459] to-[#659287] text-white rounded-[2rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(47,79,70,0.15)] border border-[#2F4F46]/10"
        >
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none translate-x-12 -translate-y-12" />
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-semibold text-[#E6F2DD]">
                <Sparkles className="w-3.5 h-3.5 text-[#B1D3B9]" /> Candidate Dashboard
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight m-0 text-white leading-tight">
                Welcome back, {user?.name}
              </h1>
              <p className="text-sm sm:text-base text-[#E6F2DD]/90 font-medium max-w-xl">
                Track your active interviews, explore curated vacancies, and optimize your developer profile strength.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 flex flex-col items-center justify-center min-w-[200px] shadow-lg">
              <span className="text-[10px] uppercase tracking-widest text-[#B1D3B9] font-bold">Current Time</span>
              <span className="text-2xl font-black tracking-tight mt-1">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-xs text-white/70 font-semibold mt-1">
                {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          
          {/* LEFT COLUMN: Main Dashboard Content */}
          <div className="space-y-8 min-w-0">

            {/* 1. Upcoming Interview Widget */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-shadow"
            >
              <h3 className="text-lg font-bold text-[#2F4F46] flex items-center gap-2 border-b border-gray-100 pb-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#659287]" /> Upcoming Interview
              </h3>
              
              {upcomingInterviews.length > 0 ? (
                <div className="p-6 bg-gradient-to-br from-[#F0F6F2] to-white border border-[#E6F2DD] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-[#B1D3B9]/50 flex items-center justify-center font-black text-2xl text-[#659287] shadow-sm flex-shrink-0">
                      {upcomingInterviews[0].company?.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-[#2F4F46]">{upcomingInterviews[0].jobTitle || upcomingInterviews[0].job?.title}</h4>
                      <p className="text-sm font-semibold text-[#659287] hover:underline cursor-pointer flex items-center gap-1" onClick={() => {
                        const companyId = upcomingInterviews[0].employer?._id || upcomingInterviews[0].employer;
                        if (companyId) navigate(`/companies/${companyId}`);
                      }}>
                        {upcomingInterviews[0].company} <ArrowUpRight className="w-3.5 h-3.5" />
                      </p>
                      <div className="text-xs text-gray-500 font-semibold flex flex-wrap gap-x-3 gap-y-1 pt-1">
                        <span className="bg-[#E6F2DD]/40 text-[#2F4F46] px-2.5 py-0.5 rounded-lg border border-[#B1D3B9]/30">Date: {upcomingInterviews[0].interviewDate}</span>
                        <span className="bg-[#E6F2DD]/40 text-[#2F4F46] px-2.5 py-0.5 rounded-lg border border-[#B1D3B9]/30">Time: {upcomingInterviews[0].interviewTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {upcomingInterviews[0].meetingLink && (
                      <a
                        href={upcomingInterviews[0].meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4.5 py-2.5 bg-[#659287] hover:bg-[#53786F] text-white transition-all text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm shadow-[#659287]/15"
                      >
                        <Video className="w-4 h-4" /> Join Call
                      </a>
                    )}
                    <button
                      onClick={() => navigate('/candidate/interviews')}
                      className="px-4.5 py-2.5 bg-white border border-[#B1D3B9] text-[#659287] hover:bg-[#E6F2DD]/40 transition-all text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-4 h-4" /> Details
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-[#F8FAF8]/50 rounded-2xl border border-dashed border-gray-200">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-400">No interviews scheduled yet</p>
                  <p className="text-xs text-gray-400 mt-1">Interviews scheduled by employers will appear here.</p>
                </div>
              )}
            </motion.div>

            {/* 2. Recent Applications Widget */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-shadow"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
                <h3 className="text-lg font-bold text-[#2F4F46] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#659287]" /> Recent Applications
                </h3>
                <button
                  onClick={() => navigate("/applications")}
                  className="text-xs font-bold text-[#659287] hover:text-[#53786F] transition-all flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {data?.recentApplications && data.recentApplications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {data.recentApplications.slice(0, 5).map((app) => {
                    const jobId = app.job?._id || app.job;
                    return (
                      <div key={app._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => {
                              const companyId = app.employer?._id || app.employer || app.job?.createdBy?._id || app.job?.createdBy;
                              if (companyId) navigate(`/companies/${companyId}`);
                            }}
                            className="w-10 h-10 rounded-xl bg-[#E6F2DD] flex items-center justify-center font-bold text-[#659287] cursor-pointer hover:scale-105 transition-all flex-shrink-0 border border-[#B1D3B9]/20"
                          >
                            {app.job?.company?.charAt(0).toUpperCase() || "W"}
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-[#2F4F46] hover:text-[#659287] cursor-pointer" onClick={() => jobId && navigate(`/jobs/${jobId}`)}>
                              {app.job?.title || "Unknown Position"}
                            </h4>
                            <p className="text-xs text-gray-400 font-semibold mt-0.5">
                              <span
                                onClick={() => {
                                  const companyId = app.employer?._id || app.employer || app.job?.createdBy?._id || app.job?.createdBy;
                                  if (companyId) navigate(`/companies/${companyId}`);
                                }}
                                className="hover:underline hover:text-[#659287] cursor-pointer font-bold text-[#659287]/90"
                              >
                                {app.job?.company || "Unknown Company"}
                              </span>
                              {" • "}{app.job?.location || "Remote"} • Applied: {new Date(app.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 justify-between sm:justify-start">
                          {getStatusBadge(app.status)}
                          <button
                            onClick={() => navigate('/applications')}
                            className="px-3.5 py-1.5 bg-white border border-gray-200 text-gray-600 hover:bg-[#E6F2DD]/40 text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-400">No applications yet</p>
                  <button onClick={() => navigate("/jobs")} className="mt-3 px-4 py-2 bg-[#659287] hover:bg-[#53786F] text-white font-bold text-xs rounded-xl shadow-sm">
                    Browse Jobs
                  </button>
                </div>
              )}
            </motion.div>

            {/* 3. Recommended Jobs Widget */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-shadow"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
                <h3 className="text-lg font-bold text-[#2F4F46] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#659287]" /> Recommended Jobs
                </h3>
                <button
                  onClick={() => navigate("/jobs")}
                  className="text-xs font-bold text-[#659287] hover:text-[#53786F] transition-all flex items-center gap-1"
                >
                  See More <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {data?.recommendedJobs && data.recommendedJobs.length > 0 ? (
                  data.recommendedJobs.map((job) => {
                    const isSaved = savedJobs.some(sj => sj._id === job._id || sj.id === job._id);
                    const hasApplied = myApplications.some((app: any) => {
                      const appJobId = app.job?._id || app.job?.id || app.job || '';
                      return appJobId.toString() === job._id.toString();
                    });
                    return (
                      <motion.div 
                        whileHover={{ y: -6, boxShadow: "0 12px 25px rgba(0,0,0,0.05)" }}
                        key={job._id} 
                        className="p-5 bg-gradient-to-b from-white to-[#F8FAF8]/30 border border-[#E6F2DD] rounded-2xl flex flex-col justify-between transition-all duration-300 group relative shadow-[0_4px_15px_rgba(0,0,0,0.01)]"
                      >
                        <button
                          onClick={() => handleSaveToggle(job, isSaved)}
                          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                            isSaved
                              ? "bg-rose-100 text-rose-500"
                              : "bg-[#F8FAF8] text-gray-400 hover:text-rose-500 border border-gray-100 shadow-sm"
                          }`}
                        >
                          <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
                        </button>
                        
                        <div className="space-y-3">
                          <div 
                            onClick={() => {
                              const companyId = job.createdBy?._id || job.createdBy;
                              if (companyId) navigate(`/companies/${companyId}`);
                            }}
                            className="w-11 h-11 rounded-2xl bg-white border border-[#B1D3B9]/40 flex items-center justify-center text-[#659287] font-bold shadow-sm cursor-pointer hover:scale-105 transition-all"
                          >
                            {job.company.charAt(0).toUpperCase()}
                          </div>
                          
                          <div>
                            <h4 onClick={() => navigate(`/jobs/${job._id}`)} className="text-sm font-extrabold text-[#2F4F46] group-hover:text-[#659287] transition-all cursor-pointer truncate">
                              {job.title}
                            </h4>
                            <p 
                              onClick={() => {
                                const companyId = job.createdBy?._id || job.createdBy;
                                if (companyId) navigate(`/companies/${companyId}`);
                              }}
                              className="text-xs text-gray-400 hover:underline cursor-pointer mt-0.5 font-bold flex items-center gap-1"
                            >
                              {job.company} <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#659287] transition-all" />
                            </p>
                          </div>

                          <div className="space-y-1.5 text-xs text-gray-500 font-semibold pt-2 border-t border-gray-100 mt-2">
                            <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#88BDA4]" /> {job.location}</p>
                            <p className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5 text-[#88BDA4]" /> {job.salary?.min ? `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}` : "Confidential"}</p>
                            <span className="inline-block px-2.5 py-0.5 bg-[#E6F2DD] text-[#2F4F46] rounded-md text-[10px] uppercase font-bold mt-1">
                              {job.jobType || job.type || "Full Time"}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 flex gap-2">
                          <button
                            onClick={() => navigate(`/jobs/${job._id}`)}
                            className="flex-1 py-2 bg-white border border-[#B1D3B9] rounded-xl text-xs font-bold text-[#659287] hover:bg-[#E6F2DD]/40 transition-all text-center"
                          >
                            Details
                          </button>
                          {hasApplied ? (
                            <button
                              disabled
                              className="flex-grow py-2 bg-gray-100 border border-gray-200 text-gray-400 rounded-xl text-xs font-bold transition-all text-center cursor-not-allowed flex items-center justify-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Applied
                            </button>
                          ) : (
                            <button
                              onClick={() => handleQuickApply(job)}
                              className="flex-grow py-2 bg-[#659287] rounded-xl text-xs font-bold text-white hover:bg-[#53786F] transition-all text-center shadow-sm shadow-[#659287]/15"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-6 text-sm text-gray-500 font-medium">
                    No recommended jobs available right now.
                  </div>
                )}
              </div>
            </motion.div>

            {/* 4. Career Insights Widget */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-shadow"
            >
              <h3 className="text-lg font-bold text-[#2F4F46] flex items-center gap-2 border-b border-gray-100 pb-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#659287]" /> Career Insights
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { label: "Total Applications", value: stats?.applications || 0, color: "text-[#659287] bg-gradient-to-br from-[#E6F2DD] to-white border-[#B1D3B9]/40" },
                  { label: "Interviews Scheduled", value: stats?.interviews || 0, color: "text-amber-700 bg-gradient-to-br from-amber-50 to-white border-amber-100" },
                  { label: "Shortlisted", value: appsCount.shortlisted, color: "text-indigo-700 bg-gradient-to-br from-indigo-50 to-white border-indigo-150" },
                  { label: "Hires Secured", value: appsCount.hired, color: "text-emerald-700 bg-gradient-to-br from-emerald-50 to-white border-emerald-150" },
                  { label: "Response Rate", value: "94%", color: "text-blue-700 bg-gradient-to-br from-blue-50 to-white border-blue-150" },
                ].map((insight, idx) => (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    key={idx} 
                    className="p-4 rounded-2xl bg-white border border-gray-100 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow"
                  >
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-snug">{insight.label}</span>
                    <span className={`text-xl font-black mt-4 px-3.5 py-1.5 rounded-xl self-start border ${insight.color}`}>{insight.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 5. Profile Strength Tips Widget */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-shadow"
            >
              <h3 className="text-lg font-bold text-[#2F4F46] flex items-center gap-2 border-b border-gray-100 pb-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#659287]" /> Profile Strength Tips
              </h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                Complete these suggestions to boost your resume strength and get noticed by top employers.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {strengthTips.map((tip, idx) => {
                  const TipIcon = tip.icon;
                  return (
                    <motion.div 
                      whileHover={{ scale: 1.01, borderLeftColor: tip.completed ? "#659287" : "#E2ECE5" }}
                      key={idx} 
                      className={`p-4 bg-gradient-to-r ${
                        tip.completed 
                          ? "from-[#F0F6F2] to-white border-l-4 border-l-[#659287]" 
                          : "from-white to-[#F8FAF8] border-l-4 border-l-gray-300"
                      } border border-gray-150 rounded-2xl flex items-center justify-between gap-4 shadow-sm transition-all`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-xl ${
                          tip.completed ? "bg-white text-[#659287] shadow-sm" : "bg-gray-100 text-gray-400"
                        }`}>
                          <TipIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-sm font-extrabold ${tip.completed ? "text-[#2F4F46] line-through opacity-50" : "text-[#2F4F46]"}`}>{tip.text}</span>
                          <p className="text-[10px] text-gray-400 font-semibold">{tip.completed ? "Completed" : "Action Pending"}</p>
                        </div>
                      </div>
                      
                      {tip.completed ? (
                        <div className="w-6 h-6 rounded-full bg-[#E6F2DD] border border-[#B1D3B9] flex items-center justify-center text-[#2F4F46] shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        tip.action && (
                          <button
                            onClick={tip.action}
                            className="px-3 py-1 bg-white border border-[#B1D3B9] hover:bg-[#E6F2DD]/40 text-[10px] font-extrabold text-[#659287] rounded-lg shadow-sm flex items-center gap-0.5 transition-colors"
                          >
                            Add <ArrowRight className="w-3 h-3" />
                          </button>
                        )
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* 6. Recently Viewed Jobs Widget */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-shadow"
            >
              <h3 className="text-lg font-bold text-[#2F4F46] flex items-center gap-2 border-b border-gray-100 pb-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#659287]" /> Recently Viewed Jobs
              </h3>
              
              {recentlyViewed.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recentlyViewed.map((job) => (
                    <motion.div 
                      whileHover={{ y: -4, boxShadow: "0 8px 20px rgba(0,0,0,0.03)" }}
                      key={job.id || job._id} 
                      onClick={() => navigate(`/jobs/${job.id || job._id}`)} 
                      className="p-4 bg-gradient-to-b from-white to-[#F8FAF8]/40 border border-gray-150 rounded-2xl hover:border-[#B1D3B9] cursor-pointer transition-all group shadow-sm"
                    >
                      <h4 className="text-xs font-extrabold text-[#2F4F46] truncate group-hover:text-[#659287]">{job.title}</h4>
                      <p className="text-[10px] text-gray-400 font-extrabold truncate mt-0.5">{job.company}</p>
                      <div className="flex items-center justify-between mt-3 text-[10px] text-gray-500 font-bold pt-2 border-t border-gray-50">
                        <span>{job.location}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#659287] transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-10 bg-gradient-to-br from-white to-[#F8FAF8] rounded-2xl border border-dashed border-[#B1D3B9]/60 flex flex-col items-center justify-center">
                  <Eye className="w-8 h-8 text-[#B1D3B9] mb-2 opacity-60 animate-pulse" />
                  <p className="text-xs text-gray-400 font-bold">No recently viewed jobs yet</p>
                  <p className="text-[10px] text-gray-400/80 mt-0.5">Jobs you browse in details will appear here.</p>
                </div>
              )}
            </motion.div>

            {/* 7. Learning Resources Widget */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-shadow"
            >
              <h3 className="text-lg font-bold text-[#2F4F46] flex items-center gap-2 border-b border-gray-100 pb-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#659287]" /> Learning Resources
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {resourcesData.map((item) => (
                  <motion.div
                    onClick={() => navigate(`/resources/${item.id}`)}
                    whileHover={{ y: -6, boxShadow: "0 12px 25px rgba(0,0,0,0.04)", borderColor: "#B1D3B9" }}
                    key={item.id}
                    className={`p-5 bg-gradient-to-br ${item.gradient} border border-gray-150 rounded-2xl transition-all flex flex-col justify-between group shadow-sm cursor-pointer`}
                  >
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#659287] mb-3">
                        <item.icon className="w-4.5 h-4.5" />
                      </div>
                      <h4 className="text-sm font-extrabold text-[#2F4F46] group-hover:text-[#659287] transition-all">{item.title}</h4>
                      <p className="text-xs text-gray-500 font-semibold mt-2 leading-relaxed">{item.desc}</p>
                    </div>
                    <span className="text-xs font-bold text-[#659287] group-hover:text-[#53786F] mt-5 flex items-center gap-0.5">
                      Read Guide <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Sidebar (360px Fixed Width) */}
          <div className="space-y-8">
            
            {/* Profile Completion SVG Progress Ring Card */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-shadow"
              >
                <h3 className="text-lg font-bold text-[#2F4F46] w-full text-left mb-6 border-b border-gray-100 pb-3">
                  Profile Completion
                </h3>
                
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      className="text-gray-50"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="none"
                    />
                    <motion.circle
                      cx="72"
                      cy="72"
                      r="60"
                      className="text-[#659287]"
                      strokeWidth="10"
                      strokeDasharray="377"
                      initial={{ strokeDashoffset: 377 }}
                      animate={{ strokeDashoffset: 377 - (377 * stats.profileCompletion) / 100 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute text-3xl font-black text-[#2F4F46]">
                    {stats.profileCompletion}%
                  </div>
                </div>

                <div className="text-center mt-6 space-y-1 w-full">
                  <span className="inline-block px-3.5 py-1 bg-[#E6F2DD] text-[#2F4F46] rounded-full text-xs font-bold uppercase tracking-wider border border-[#B1D3B9]/30">
                    {stats.profileCompletion === 100 ? "Verified Profile" : "Incomplete Profile"}
                  </span>
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed pt-3">
                    Completing your details improves search visibility for recruiters.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Notifications Widget Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-shadow"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
                <h3 className="text-sm font-extrabold text-[#2F4F46] uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4.5 h-4.5 text-[#659287]" /> Notifications
                </h3>
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-xs font-bold text-[#659287] hover:text-[#53786F] transition-all cursor-pointer flex items-center gap-0.5"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              
              <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto pr-1">
                {dashboardNotifications.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4 text-center">No notifications yet.</p>
                ) : (
                  dashboardNotifications.slice(0, 4).map((notif: any) => (
                    <div key={notif._id} className="py-3.5 first:pt-0 last:pb-0 flex gap-3">
                      <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notif.isRead ? 'bg-gray-250' : 'bg-rose-500'}`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#2F4F46] truncate">{notif.title}</h4>
                        <p className="text-[11px] text-gray-500 leading-normal mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Activity Timeline Widget Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] transition-shadow"
            >
              <h3 className="text-lg font-bold text-[#2F4F46] border-b border-gray-100 pb-3">
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
