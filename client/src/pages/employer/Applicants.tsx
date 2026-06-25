import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  RefreshCw,
  SlidersHorizontal,
  Users,
  Activity,
} from 'lucide-react';
import { getMyJobs } from '../../services/jobService';
import type { Job } from '../../services/jobService';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

// Component Imports
import HeroCard from '../../components/HeroCard';
import EmptyState from '../../components/employer/EmptyState';
import InterviewModal from '../../components/employer/InterviewModal';
import ApplicantsStats from '../../components/employer/ApplicantsStats';
import JobSelector from '../../components/employer/JobSelector';
import ApplicantTable from '../../components/employer/ApplicantTable';
import ApplicantCard from '../../components/employer/ApplicantCard';
import ApplicantDrawer from '../../components/employer/ApplicantDrawer';
import ResumePreview from '../../components/employer/ResumePreview';
import HiringAnalytics from '../../components/employer/HiringAnalytics';
import DeleteConfirmationModal from '../../components/employer/DeleteConfirmationModal';
import type { ApplicantType } from '../../components/employer/ApplicantCard';

export const Applicants: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Route URL Params
  const urlJobId = searchParams.get('jobId') || searchParams.get('job') || '';

  // Core Page State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [applicationCount, setApplicationCount] = useState<number>(0);

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Detail Drawer & Resume State
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantType | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [applicantToDelete, setApplicantToDelete] = useState<ApplicantType | null>(null);
  const [previewResumeUrl, setPreviewResumeUrl] = useState<string | undefined>(undefined);
  const [previewResumeName, setPreviewResumeName] = useState('');
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  // Tabs for switching View
  const [activeViewTab, setActiveViewTab] = useState<'applicants' | 'analytics'>('applicants');
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  // Load applications from API
  const fetchApplicationsData = async (showToast = false) => {
    try {
      console.log('Fetching applications data...', new Date().toLocaleTimeString());
      const response = await api.get('/applications/employer');
      const apps = response.data?.applications ?? [];
      console.log('Received applications:', apps.length, apps.map(a => ({ id: a._id, name: a.user?.name, job: a.jobTitle, date: a.createdAt })));
      
      // Check for new applications
      const newCount = apps.length;
      if (applicationCount > 0 && newCount > applicationCount) {
        const newApps = newCount - applicationCount;
        toast.success(`${newApps} new application${newApps > 1 ? 's' : ''} received!`, {
          icon: '📩',
          duration: 4000,
        });
        console.log('New applications detected:', newApps);
      }
      
      setApplications(apps);
      setApplicationCount(newCount);
      setLastRefreshTime(new Date());
      
      if (showToast) {
        toast.success('Applications updated');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      toast.error('Failed to load applications');
    }
  };

  // Load jobs from API
  const fetchJobsData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await getMyJobs();
      const jobList = (data?.jobs ?? data) as Job[];
      setJobs(jobList);

      // Select initial job
      if (jobList.length > 0) {
        const firstJobId = (jobList[0]._id || jobList[0].id || '').toString();
        if (urlJobId && jobList.some(j => (j._id || j.id || '').toString() === urlJobId.toString())) {
          setSelectedJobId(urlJobId.toString());
        } else {
          setSelectedJobId(firstJobId);
        }
      }
      await fetchApplicationsData();
      if (isRefresh) toast.success('Dashboard data reloaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve jobs list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobsData();
  }, []);

  // Auto-refresh applications every 30 seconds
  useEffect(() => {
    console.log('Setting up auto-refresh interval (30 seconds)');
    const interval = setInterval(() => {
      console.log('Auto-refreshing applications...', new Date().toLocaleTimeString());
      fetchApplicationsData();
    }, 30000); // 30 seconds

    return () => {
      console.log('Cleaning up auto-refresh interval');
      clearInterval(interval);
    };
  }, []);

  // Update selected job if URL param changes
  useEffect(() => {
    if (urlJobId && jobs.length > 0) {
      const matchedJob = jobs.find(j => (j._id || j.id || '').toString() === urlJobId.toString());
      if (matchedJob) {
        setSelectedJobId((matchedJob._id || matchedJob.id || '').toString());
      }
    }
  }, [urlJobId, jobs]);

  // Handle select job position
  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setSearchParams({ jobId });
  };

  // Generate applicants for selected job with database applications
  const rawApplicantsList = useMemo(() => {
    if (!selectedJobId) return [];
    
    const jobApps = applications.filter(app => {
      const appJob = app.job;
      if (!appJob) return false;
      const appJobId = (typeof appJob === 'object') ? (appJob._id || appJob.id) : appJob;
      return appJobId && appJobId.toString() === selectedJobId?.toString();
    });

    const uniqueJobApps: any[] = [];
    const seenCandidates = new Set<string>();
    const sortedJobApps = [...jobApps].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    sortedJobApps.forEach(app => {
      const cand = app.candidate || app.user || {};
      const candId = (cand._id || cand.id || app.candidate || app.user || '').toString();
      if (candId && !seenCandidates.has(candId)) {
        seenCandidates.add(candId);
        uniqueJobApps.push(app);
      }
    });

    return uniqueJobApps.map(app => {
      const cand = app.candidate || app.user || {};
      return {
        id: app._id,
        name: cand.name || 'Candidate',
        email: cand.email || '',
        phone: cand.phone || 'Not Provided',
        location: cand.location || 'Not Provided',
        avatarUrl: cand.profilePicture
          ? `http://localhost:5000${cand.profilePicture}`
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        currentRole: cand.professionalTitle || 'Software Developer',
        skills: cand.skills || [],
        appliedDate: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Just now',
        matchScore: 90, // Fallback ATS score
        experience: cand.experience || 'Freshers',
        education: cand.education || (cand.college ? `${cand.college}${cand.department ? ` - ${cand.department}` : ''}${cand.graduationYear ? ` (${cand.graduationYear})` : ''}` : 'Not Provided'),
        resumeUrl: app.resumeUrl ? `http://localhost:5000${app.resumeUrl}` : cand.resumeUrl ? `http://localhost:5000${cand.resumeUrl}` : '',
        linkedinUrl: cand.linkedinUrl || '',
        githubUrl: cand.githubUrl || '',
        portfolioUrl: cand.portfolioUrl || '',
        status: app.status || 'Pending',
        notes: app.notes || '',
        coverLetter: app.coverLetter || '',
        interviewDate: app.interviewDate || '',
        interviewTime: app.interviewTime || '',
        interviewLink: app.meetingLink || '',
        interviewNotes: app.interviewNotes || '',
        interviewStatus: app.interviewStatus || 'Upcoming',
        interviewMode: app.interviewMode || 'Google Meet',
        interviewLocation: app.interviewLocation || '',
        interviewDuration: app.interviewDuration || '',
        interviewMessage: app.interviewMessage || '',
        createdAt: app.createdAt,
      } as ApplicantType & { createdAt: string };
    });
  }, [applications, selectedJobId]);

  // Count recent applications (within last 24 hours)
  const recentApplicationsCount = useMemo(() => {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    return applications.filter(app => {
      const appDate = new Date(app.createdAt);
      return appDate > oneDayAgo;
    }).length;
  }, [applications]);

  // Statistics calculation for the current selection
  const statistics = useMemo(() => {
    return {
      totalJobs: jobs.length,
      totalApplicants: rawApplicantsList.length,
      appsToday: rawApplicantsList.filter(a => a.appliedDate.includes('hour') || a.appliedDate.includes('1 day')).length,
      reviewed: rawApplicantsList.filter(a => a.status === 'Reviewed').length,
      shortlisted: rawApplicantsList.filter(a => a.status === 'Shortlisted').length,
      interviews: rawApplicantsList.filter(a => ['Interview Scheduled', 'Interview Completed'].includes(a.status)).length,
      rejected: rawApplicantsList.filter(a => a.status === 'Rejected').length,
      hired: rawApplicantsList.filter(a => a.status === 'Hired').length,
    };
  }, [jobs.length, rawApplicantsList]);

  // Filters application logic
  const filteredApplicants = useMemo(() => {
    let result = [...rawApplicantsList];

    // Live search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        a =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.currentRole.toLowerCase().includes(q) ||
          a.skills.some(s => s.toLowerCase().includes(q)) ||
          (a.location && a.location.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'New') {
        result = result.filter(a => a.status === 'Applied' || a.status === 'Pending');
      } else if (statusFilter === 'Interview') {
        result = result.filter(a => a.status === 'Interview Scheduled' || a.status === 'Interview Completed');
      } else {
        result = result.filter(a => a.status === statusFilter);
      }
    }

    // Experience filter
    if (experienceFilter !== 'All') {
      result = result.filter(a => {
        const expNum = parseInt(a.experience, 10) || 0;
        if (experienceFilter === 'entry') return expNum <= 2;
        if (experienceFilter === 'mid') return expNum > 2 && expNum <= 5;
        if (experienceFilter === 'senior') return expNum > 5;
        return true;
      });
    }

    // Sorting
    if (sortBy === 'Newest') {
      // Keep order as is or sort by applied relative date
    } else if (sortBy === 'Oldest') {
      result.reverse();
    } else if (sortBy === 'Experience') {
      result.sort((a, b) => (parseInt(b.experience, 10) || 0) - (parseInt(a.experience, 10) || 0));
    } else if (sortBy === 'Alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [rawApplicantsList, searchTerm, statusFilter, experienceFilter, sortBy]);

  // Candidate action handlers
  const handleUpdateStatus = async (applicantId: string, newStatus: any) => {
    try {
      let endpoint = `/applications/${applicantId}/status`;
      let data: any = { status: newStatus };

      // Use specific endpoints for specific actions
      if (newStatus === 'Reviewed') {
        endpoint = `/applications/${applicantId}/review`;
        data = {};
      } else if (newStatus === 'Shortlisted') {
        endpoint = `/applications/${applicantId}/shortlist`;
        data = {};
      } else if (newStatus === 'Interview Completed') {
        endpoint = `/applications/${applicantId}/interview/complete`;
        data = {};
      } else if (newStatus === 'Hired') {
        endpoint = `/applications/${applicantId}/hire`;
        data = {};
      } else if (newStatus === 'Rejected') {
        endpoint = `/applications/${applicantId}/reject`;
        data = {};
      }

      await api.patch(endpoint, data);
      toast.success(`Status updated to ${newStatus}`);
      fetchApplicationsData();
      if (selectedApplicant && selectedApplicant.id === applicantId) {
        setSelectedApplicant(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const handleSaveNotes = async (applicantId: string, notesContent: string) => {
    try {
      await api.patch(`/applications/${applicantId}/notes`, { notes: notesContent });
      fetchApplicationsData();
      if (selectedApplicant && selectedApplicant.id === applicantId) {
        setSelectedApplicant(prev => prev ? { ...prev, notes: notesContent } : null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save notes');
    }
  };

  const handleOpenResume = (applicant: ApplicantType) => {
    setPreviewResumeUrl(applicant.resumeUrl);
    setPreviewResumeName(applicant.name);
    setIsResumeOpen(true);
  };

  const handleDeleteApplication = (applicant: ApplicantType) => {
    setApplicantToDelete(applicant);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!applicantToDelete) return;
    try {
      await api.delete(`/applications/${applicantToDelete.id}`);
      toast.success('Application removed successfully');
      fetchApplicationsData();
      if (selectedApplicant && selectedApplicant.id === applicantToDelete.id) {
        setIsDrawerOpen(false);
        setSelectedApplicant(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove application');
    } finally {
      setIsDeleteModalOpen(false);
      setApplicantToDelete(null);
    }
  };

  // Rendering
  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-5 w-80 bg-gray-200 rounded mt-3 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // If employer has no jobs posted
  if (jobs.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          type="no-jobs"
          onCreateJob={() => navigate('/employer/jobs/new')}
          onRefresh={() => fetchJobsData(true)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 min-h-screen bg-[#F7FAF8]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 w-full relative">
          <HeroCard
            badgeText="Premium ATS Suite"
            title="Applicants Hub"
            description="Review incoming candidate pipelines, monitor application stages, evaluate resume profiles, and schedule live interviews."
            IconComponent={Users}
          />
          {recentApplicationsCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              {recentApplicationsCount} New
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto self-start">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-[#F0F6F2] p-1.5 rounded-xl border border-[#E2ECE5]">
            <button
              onClick={() => setActiveViewTab('applicants')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeViewTab === 'applicants'
                  ? 'bg-white text-[#2F4F46] shadow-sm'
                  : 'text-[#4A6A60] hover:text-[#2F4F46]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Candidates
            </button>
            <button
              onClick={() => setActiveViewTab('analytics')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeViewTab === 'analytics'
                  ? 'bg-white text-[#2F4F46] shadow-sm'
                  : 'text-[#4A6A60] hover:text-[#2F4F46]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Analytics
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              fetchJobsData(true);
              fetchApplicationsData(true);
            }}
            className="p-2.5 rounded-xl border border-[#E2ECE5] bg-white text-[#2F4F46] hover:bg-gray-50 transition-colors relative group"
            title={`Refresh Data - Last updated: ${lastRefreshTime.toLocaleTimeString()}`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Last: {lastRefreshTime.toLocaleTimeString()}
            </div>
          </motion.button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <ApplicantsStats stats={statistics} />

      {/* Job Selection Horizontal scroll */}
      <JobSelector
        jobs={jobs}
        selectedJobId={selectedJobId}
        onSelectJob={handleSelectJob}
      />

      {activeViewTab === 'analytics' ? (
        <HiringAnalytics applicants={rawApplicantsList} />
      ) : (
        <>
          {/* Search, Filter Bar and Sorting */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-[#E2ECE5] rounded-2xl shadow-sm">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#88BDA4]" />
              <input
                type="text"
                placeholder="Search by name, role, skill, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-[#E2ECE5] bg-[#F7FAF8] text-[#2F4F46] placeholder:text-[#4A6A60]/60 outline-none transition-all focus:ring-2 focus:ring-[#659287]/50 focus:border-[#659287]"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`flex items-center gap-1.5 h-11 px-4 text-xs font-bold rounded-xl border transition-all ${
                  showFiltersPanel
                    ? 'bg-[#E6F2DD] border-[#88BDA4] text-[#2F4F46]'
                    : 'bg-white border-[#E2ECE5] text-[#2F4F46] hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 px-3 text-xs font-bold rounded-xl border border-[#E2ECE5] text-[#2F4F46] bg-white hover:bg-gray-50 outline-none"
              >
                <option value="Newest">Newest First</option>
                <option value="Oldest">Oldest First</option>
                <option value="Experience">Highest Experience</option>
                <option value="Alphabetical">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Filters Expanded Panel */}
          <AnimatePresence>
            {showFiltersPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white border border-[#E2ECE5] rounded-2xl p-5 shadow-inner overflow-hidden grid grid-cols-1 sm:grid-cols-2 gap-5"
              >
                <div>
                  <label className="block text-[11px] font-bold text-[#4A6A60] uppercase mb-2">
                    Application Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-[#E2ECE5] text-[#2F4F46] bg-white outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="New">Applied / New</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Hired">Hired</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4A6A60] uppercase mb-2">
                    Experience Level
                  </label>
                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-[#E2ECE5] text-[#2F4F46] bg-white outline-none"
                  >
                    <option value="All">All Experiences</option>
                    <option value="entry">Entry Level (≤ 2 Years)</option>
                    <option value="mid">Mid Level (2–5 Years)</option>
                    <option value="senior">Senior Level (&gt; 5 Years)</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Applicants Lists / Tables */}
          {filteredApplicants.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <ApplicantTable
                  applicants={filteredApplicants}
                  onSelectApplicant={(app) => {
                    setSelectedApplicant(app);
                    setIsDrawerOpen(true);
                  }}
                  onViewResume={handleOpenResume}
                  onShortlist={(app) => handleUpdateStatus(app.id, 'Shortlisted')}
                  onReject={(app) => handleUpdateStatus(app.id, 'Rejected')}
                  onDelete={handleDeleteApplication}
                />
              </div>

              {/* Mobile Card Grid View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:hidden">
                {filteredApplicants.map((app) => (
                  <ApplicantCard
                    key={app.id}
                    applicant={app}
                    onViewDetails={(a) => {
                      setSelectedApplicant(a);
                      setIsDrawerOpen(true);
                    }}
                    onViewResume={handleOpenResume}
                    onShortlist={(a) => handleUpdateStatus(a.id, 'Shortlisted')}
                    onReject={(a) => handleUpdateStatus(a.id, 'Rejected')}
                    onDelete={handleDeleteApplication}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState type="no-applications" />
          )}
        </>
      )}

      {/* Candidate Profile Details Right Drawer */}
      <ApplicantDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedApplicant(null);
        }}
        applicant={selectedApplicant}
        onStatusChange={(status) => {
          if (selectedApplicant) {
            if (status === 'Interview' || status === 'Interview Scheduled') {
              setIsInterviewModalOpen(true);
            } else {
              handleUpdateStatus(selectedApplicant.id, status);
            }
          }
        }}
        onSaveNotes={(notes) => {
          if (selectedApplicant) {
            handleSaveNotes(selectedApplicant.id, notes);
          }
        }}
        onViewResume={handleOpenResume}
      />

      {/* Resume Document Viewer Modal */}
      <ResumePreview
        isOpen={isResumeOpen}
        onClose={() => {
          setIsResumeOpen(false);
          setPreviewResumeUrl(undefined);
        }}
        resumeUrl={previewResumeUrl}
        candidateName={previewResumeName}
      />

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setApplicantToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        candidateName={applicantToDelete?.name}
      />

      {/* Interview Scheduling Modal */}
      {selectedApplicant && (
        <InterviewModal
          isOpen={isInterviewModalOpen}
          onClose={() => setIsInterviewModalOpen(false)}
          applicationId={selectedApplicant.id}
          candidateName={selectedApplicant.name}
          jobTitle={selectedJobId ? jobs.find(j => (j._id || j.id) === selectedJobId)?.title || 'Selected Position' : 'Selected Position'}
          onScheduleSuccess={() => {
            fetchApplicationsData();
            setIsDrawerOpen(false);
          }}
          initialData={
            selectedApplicant.interviewDate ? {
              date: selectedApplicant.interviewDate,
              time: selectedApplicant.interviewTime,
              mode: (selectedApplicant.interviewMode || 'Google Meet') as any,
              link: selectedApplicant.interviewLink || '',
              location: selectedApplicant.interviewLocation || '',
              duration: selectedApplicant.interviewDuration || '30 mins',
              message: selectedApplicant.interviewMessage || selectedApplicant.interviewNotes || '',
            } : undefined
          }
        />
      )}
    </div>
  );
};

export default Applicants;
