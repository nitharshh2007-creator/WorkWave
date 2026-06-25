import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Briefcase,
  CheckCircle,
  XCircle,
  FileText,
  Hourglass,
  Calendar,
  Frown,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import HeroCard from '../components/HeroCard';

// --- TYPE DEFINITIONS ---
interface Application {
  _id: string;
  jobTitle: string;
  company: string;
  location: string;
  status: string;
  createdAt: string;
  resumeUrl?: string;
  resumeFileName?: string;
  coverLetter?: string;
  job?: {
    salary?: {
      min: number;
      max: number;
    };
  };
  interviewDate?: string;
  interviewTime?: string;
  meetingLink?: string;
  interviewNotes?: string;
  interviewStatus?: 'Upcoming' | 'Completed' | 'Cancelled';
  interviewMode?: string;
  interviewLocation?: string;
  interviewDuration?: string;
}

const statusLevels = ['Applied', 'Reviewed', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Hired'];

// --- STATUS HELPERS ---
const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'Pending':
    case 'Applied':
      return 'bg-[#E6F2DD] text-[#4A6A60]';
    case 'Reviewed':
    case 'Under Review':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'Shortlisted':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    case 'Interview Scheduled':
    case 'Interview':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'Interview Completed':
      return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
    case 'Accepted':
    case 'Hired':
      return 'bg-[#DCFCE7] text-[#166534]';
    case 'Rejected':
      return 'bg-[#FEE2E2] text-[#991B1B]';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getProgressLevel = (status: string) => {
  switch (status) {
    case 'Pending':
    case 'Applied':
      return 1;
    case 'Reviewed':
    case 'Under Review':
      return 2;
    case 'Shortlisted':
      return 3;
    case 'Interview Scheduled':
    case 'Interview':
      return 4;
    case 'Interview Completed':
      return 5;
    case 'Accepted':
    case 'Hired':
      return 6;
    default:
      return 1;
  }
};

// --- STAT CARD COMPONENT ---
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: '0 8px 15px rgba(0,0,0,0.05)' }}
    className="bg-white border border-[#B1D3B9]/50 rounded-2xl p-6 flex items-center gap-5 shadow-sm transition-shadow"
  >
    <div className="bg-[#E6F2DD] text-[#659287] p-4 rounded-xl">{icon}</div>
    <div>
      <p className="text-3xl font-extrabold text-[#2F4F46]">{value}</p>
      <p className="text-base text-[#4A6A60] font-medium">{title}</p>
    </div>
  </motion.div>
);


// --- APPLICATION CARD COMPONENT ---
const ApplicationCard: React.FC<{ application: Application; onWithdraw: (id: string) => void; }> = ({ application, onWithdraw }) => {
  const progressLevel = getProgressLevel(application.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.07)' }}
      className="bg-white border border-[#B1D3B9]/50 rounded-3xl p-6 shadow-sm flex flex-col"
    >
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#2F4F46]">{application.jobTitle}</h3>
            <p 
              onClick={() => {
                const companyId = (application as any).employer?._id || (application as any).employer;
                if (companyId) navigate(`/companies/${companyId}`);
              }}
              className="text-sm font-medium text-[#659287] cursor-pointer hover:underline"
            >
              {application.company}
            </p>
            <p className="text-xs text-[#4A6A60]/80 mt-1">{application.location}</p>
            {application.job?.salary && (
              <p className="text-xs font-semibold text-[#659287] mt-1.5">
                Salary: ₹{application.job.salary.min.toLocaleString()} - ₹{application.job.salary.max.toLocaleString()}
              </p>
            )}
          </div>
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusBadgeStyle(application.status)}`}>
            {application.status}
          </span>
        </div>

        <div className="text-xs text-[#4A6A60] mb-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#88BDA4]" />
            <span>Applied {new Date(application.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#88BDA4]" />
            <span>
              Resume: {application.resumeFileName || 'Submitted Resume'}
              {application.resumeUrl && (
                <a
                  href={`http://localhost:5000${application.resumeUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#659287] hover:underline font-bold ml-2"
                >
                  View / Download
                </a>
              )}
            </span>
          </div>
        </div>

        {application.coverLetter && (
          <div className="mb-4 p-3 bg-[#F8FAF8] border border-[#B1D3B9]/30 rounded-2xl text-xs text-[#4A6A60]">
            <p className="font-bold text-[#2F4F46] mb-1">Cover Letter Submitted:</p>
            <p className="italic">"{application.coverLetter}"</p>
          </div>
        )}
        
        {/* Application Progress Bar / Status Handling */}
        {application.status === 'Rejected' ? (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-150 rounded-2xl flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-rose-700">Application Rejected</p>
              <p className="text-[11px] text-rose-600 mt-0.5">We appreciate your interest and wish you the best in your job search.</p>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h4 className="text-xs font-bold text-[#2F4F46] mb-3">Application Progress</h4>
            <div className="flex items-center">
              {statusLevels.map((level, index) => (
                <React.Fragment key={level}>
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                        index < progressLevel ? 'bg-[#659287] border-[#659287]' : 'bg-white border-gray-300'
                      }`}>
                      {index < progressLevel && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <p className={`mt-2 text-xs font-semibold ${ index < progressLevel ? 'text-[#2F4F46]' : 'text-gray-400' }`}>
                      {level}
                    </p>
                  </div>
                  {index < statusLevels.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 ${ index < progressLevel - 1 ? 'bg-[#659287]' : 'bg-gray-300' }`}/>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Interview Section */}
        {application.status === 'Interview Scheduled' && application.interviewDate && (
          <div className="mb-6 p-4 bg-[#F4F9F4] border border-[#B1D3B9]/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2F4F46]">
                <Calendar className="w-4 h-4 text-[#659287]" />
                <span>Interview Scheduled ({application.interviewStatus || 'Upcoming'})</span>
              </div>
              {application.interviewStatus !== 'Completed' && application.interviewStatus !== 'Cancelled' && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <div className="text-xs text-[#4A6A60] space-y-1">
              <p><strong>Date & Time:</strong> {application.interviewDate} at {application.interviewTime} ({application.interviewDuration || '30 mins'})</p>
              <p><strong>Mode:</strong> {application.interviewMode || 'Online'}</p>
              {application.interviewMode === 'Offline' && application.interviewLocation && (
                <p><strong>Location / Venue:</strong> {application.interviewLocation}</p>
              )}
              {application.interviewNotes && (
                <p><strong>Message / Notes:</strong> {application.interviewNotes}</p>
              )}
            </div>
            {application.interviewStatus !== 'Completed' && application.interviewStatus !== 'Cancelled' && application.interviewMode !== 'Offline' && application.meetingLink && (
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={application.meetingLink.startsWith('http') ? application.meetingLink : `https://${application.meetingLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-2 bg-[#659287] hover:bg-[#53786F] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  Join Meeting
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-2">
        <button
          onClick={() => onWithdraw(application._id)}
          className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Withdraw
        </button>
      </div>
    </motion.div>
  );
};

// --- SKELETON CARD ---
const SkeletonCard = () => (
    <div className="bg-white/80 border border-[#B1D3B9]/30 rounded-3xl p-6 shadow-sm animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
                <div className="h-5 w-48 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-4 w-40 bg-gray-200 rounded mb-6"></div>
        <div className="mb-6">
            <div className="h-3 w-32 bg-gray-200 rounded mb-3"></div>
            <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                <div className="h-1 flex-1 bg-gray-200 mx-2"></div>
                <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                <div className="h-1 flex-1 bg-gray-200 mx-2"></div>
                <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                <div className="h-1 flex-1 bg-gray-200 mx-2"></div>
                <div className="w-6 h-6 rounded-full bg-gray-200"></div>
            </div>
        </div>
        <div className="border-t border-gray-100 pt-4 flex justify-end gap-2">
            <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
            <div className="h-8 w-28 bg-gray-200 rounded-lg"></div>
        </div>
    </div>
);

// --- MAIN MY APPLICATIONS PAGE ---
const MyApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<string | null>(null);

  const filterOptions: (Application['status'] | 'All')[] = ['All', 'Pending', 'Accepted', 'Rejected'];

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/applications/my');
      
      // Filter out duplicate applications for the same job, keeping the earliest one (based on createdAt)
      const uniqueAppsMap: { [jobId: string]: any } = {};
      const sortedData = [...data].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      sortedData.forEach((app: any) => {
        const jobId = app.job?._id || app.job?.id || app.job || '';
        const key = jobId.toString();
        if (!uniqueAppsMap[key]) {
          uniqueAppsMap[key] = app;
        }
      });
      
      const filtered = data.filter((app: any) => {
        const jobId = app.job?._id || app.job?.id || app.job || '';
        return uniqueAppsMap[jobId.toString()]?._id === app._id;
      });

      setApplications(filtered);
    } catch (error) {
      toast.error('Failed to fetch applications.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdrawClick = (id: string) => {
    setApplicationToWithdraw(id);
    setShowWithdrawDialog(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!applicationToWithdraw) return;

    try {
      await api.delete(`/applications/${applicationToWithdraw}`);
      setApplications(prev => prev.filter(app => app._id !== applicationToWithdraw));
      toast.success('Application withdrawn successfully.');
    } catch (error) {
      toast.error('Failed to withdraw application.');
      console.error(error);
    } finally {
      setShowWithdrawDialog(false);
      setApplicationToWithdraw(null);
    }
  };

  const handleCancelWithdraw = () => {
    setShowWithdrawDialog(false);
    setApplicationToWithdraw(null);
  };

  const filteredApplications = useMemo(() => {
    return applications
      .filter(app => {
        if (activeFilter === 'All') return true;
        return app.status === activeFilter;
      })
      .filter(app => {
        const term = searchTerm.toLowerCase();
        return (
          app.jobTitle.toLowerCase().includes(term) ||
          app.company.toLowerCase().includes(term)
        );
      });
  }, [applications, searchTerm, activeFilter]);

  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(a => a.status === 'Pending').length,
    accepted: applications.filter(a => a.status === 'Accepted').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  }), [applications]);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 space-y-8 pb-12">
        {/* 1. Header Section */}
        <HeroCard
          badgeText="Candidate Application Console"
          title="My Applications"
          description="Track status updates, follow interview requests, and manage your active applications."
          IconComponent={FileText}
        />

        {/* 2. Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Applications" value={stats.total} icon={<Briefcase className="w-7 h-7" />} />
          <StatCard title="Pending" value={stats.pending} icon={<Hourglass className="w-7 h-7" />} />
          <StatCard title="Accepted" value={stats.accepted} icon={<CheckCircle className="w-7 h-7" />} />
          <StatCard title="Rejected" value={stats.rejected} icon={<XCircle className="w-7 h-7" />} />
        </div>

        {/* 3. Search and Filter Section */}
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#88BDA4]" />
                <input
                    type="text"
                    placeholder="Search by job title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 text-base rounded-xl border border-[#B1D3B9]/70 bg-white text-[#2F4F46] placeholder:text-[#4A6A60]/80 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#659287]/50 focus:border-[#659287]"
                />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {filterOptions.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 flex-shrink-0 ${
                            activeFilter === filter
                            ? 'bg-[#659287] text-white shadow-md'
                            : 'bg-white text-[#4A6A60] border border-[#B1D3B9]/80 hover:bg-[#E6F2DD] hover:border-[#659287]'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>

        {/* 4. Applications Grid */}
        {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        ) : filteredApplications.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredApplications.map(app => (
                    <ApplicationCard key={app._id} application={app} onWithdraw={handleWithdrawClick} />
                ))}
            </div>
        ) : (
            // 5. Empty State
            <div className="text-center py-20 bg-white border border-[#E6F2DD] rounded-3xl col-span-full">
                <Frown className="w-16 h-16 text-[#B1D3B9] mx-auto mb-4" />
                <h2
  style={{
    color: "#2F4F46",
    opacity: 1,
    fontWeight: 500,
    fontSize: "1rem"
  }}
>No Applications Yet</h2>
                <center>
                    <p className="text-[#4A6A60] mt-2 mb-6 max-w-sm mx-auto">
                        Start applying to jobs to track them here. Your journey to a new career begins with a single application!
                    </p>
                </center>
                <button
                    onClick={() => navigate('/jobs')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#659287] hover:bg-[#53786F] text-white font-semibold transition-colors shadow-lg shadow-[#659287]/20"
                >
                  
                    <Search className="w-5 h-5" />
                    Browse Jobs
                </button>
            </div>
        )}
      </div>

      {showWithdrawDialog && (
        <ConfirmationDialog
          isOpen={showWithdrawDialog}
          onConfirm={handleConfirmWithdraw}
          onCancel={handleCancelWithdraw}
          title="Withdraw Application"
          message="Are you sure you want to withdraw this application? This action cannot be undone."
        />
      )}
    </>
  );
};

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="bg-white rounded-3xl shadow-xl p-8 max-w-sm mx-auto space-y-6 border border-[#B1D3B9]"
      >
        <h3 className="text-2xl font-bold text-[#2F4F46] text-center">{title}</h3>
        <p className="text-[#4A6A60] text-center">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-xl border border-[#B1D3B9] text-[#4A6A60] font-semibold hover:bg-[#E6F2DD] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/30"
          >
            Withdraw
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MyApplications;
