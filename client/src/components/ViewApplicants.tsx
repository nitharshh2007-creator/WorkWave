import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  ArrowLeft,
  User,
  Star,
  Calendar,
  Check,
  MoreVertical,
  FileText,
  Briefcase,
  Frown,
} from 'lucide-react';

// --- MOCK DATA ---

const mockJobs: Record<string, { title: string }> = {
  '1': { title: 'Frontend Developer' },
  '2': { title: 'UI/UX Intern' },
  '3': { title: 'Backend Developer' },
  '4': { title: 'Data Analyst' },
  '5': { title: 'Senior Product Manager' },
  '6': { title: 'DevOps Engineer' },
};

type ApplicantStatus = 'New' | 'Shortlisted' | 'Interview' | 'Rejected' | 'Hired';

interface Applicant {
  id: string;
  name: string;
  avatarUrl: string;
  currentRole: string;
  skills: string[];
  appliedDate: string;
  status: ApplicantStatus;
  matchScore: number;
}

const mockApplicants: Record<string, Applicant[]> = {
  '1': [ // Applicants for Frontend Developer
    { id: 'a1', name: 'John Doe', avatarUrl: '/avatars/john.png', currentRole: 'Frontend Developer at TechCorp', skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'], appliedDate: '2 days ago', status: 'New', matchScore: 92 },
    { id: 'a2', name: 'Jane Smith', avatarUrl: '/avatars/jane.png', currentRole: 'Full Stack Developer at Innovate LLC', skills: ['React', 'Node.js', 'GraphQL', 'TypeScript'], appliedDate: '5 days ago', status: 'Shortlisted', matchScore: 88 },
    { id: 'a3', name: 'Michael Brown', avatarUrl: '/avatars/michael.png', currentRole: 'Junior Developer at WebSolutions', skills: ['HTML', 'CSS', 'JavaScript'], appliedDate: '1 week ago', status: 'New', matchScore: 75 },
  ],
  '2': [ // Applicants for UI/UX Intern
    { id: 'b1', name: 'Sarah Wilson', avatarUrl: '/avatars/sarah.png', currentRole: 'Design Student at Art University', skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping'], appliedDate: '3 days ago', status: 'Interview', matchScore: 95 },
    { id: 'b2', name: 'Chris Lee', avatarUrl: '/avatars/chris.png', currentRole: 'Graphic Design Freelancer', skills: ['Figma', 'Illustrator', 'Wireframing'], appliedDate: '6 days ago', status: 'Rejected', matchScore: 81 },
  ],
};

// --- REUSABLE COMPONENTS ---

const getStatusBadge = (status: ApplicantStatus) => {
  const styles: Record<ApplicantStatus, string> = {
    New: 'bg-blue-100 text-blue-800',
    Shortlisted: 'bg-amber-100 text-amber-800',
    Interview: 'bg-purple-100 text-purple-800',
    Hired: 'bg-emerald-100 text-emerald-800',
    Rejected: 'bg-rose-100 text-rose-800',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
};

const ApplicantCard: React.FC<{ applicant: Applicant }> = ({ applicant }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(47, 79, 70, 0.1)' }}
      className="bg-white/70 backdrop-blur-lg border border-[#E6F2DD]/90 rounded-2xl p-6 shadow-sm flex flex-col"
    >
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <img src={`https://i.pravatar.cc/150?u=${applicant.id}`} alt={applicant.name} className="w-16 h-16 rounded-full border-2 border-white shadow-md" />
            <div>
              <h3 className="text-xl font-bold text-[#2F4F46]">{applicant.name}</h3>
              <p className="text-sm text-[#4A6A60]">{applicant.currentRole}</p>
            </div>
          </div>
          {getStatusBadge(applicant.status)}
        </div>

        <div className="flex items-center justify-between text-sm text-[#4A6A60] mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#659287]" />
            <span>Applied {applicant.appliedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-[#2F4F46]">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <span>{applicant.matchScore}% Match</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-[#4A6A60] mb-2">Top Skills</h4>
          <div className="flex flex-wrap gap-2">
            {applicant.skills.slice(0, 4).map(skill => (
              <span key={skill} className="px-2.5 py-1 text-xs font-semibold text-[#4A6A60] bg-[#E6F2DD] rounded-md">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 mt-6 pt-4 flex items-center justify-end gap-2">
        <button className="px-3 py-2 text-xs font-bold text-[#2F4F46] bg-white/80 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
          <FileText className="w-4 h-4" /> View Resume
        </button>
        <button className="px-3 py-2 text-xs font-bold text-white bg-[#88BDA4] rounded-lg hover:bg-[#659287] transition-colors flex items-center gap-1.5">
          <Check className="w-4 h-4" /> Shortlist
        </button>
        <button className="p-2.5 text-xs font-bold text-[#4A6A60] bg-white/80 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function ViewApplicants() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get('jobId');

  const [searchTerm, setSearchTerm] = useState('');

  const { jobTitle, applicants } = useMemo(() => {
    if (!jobId || !mockJobs[jobId]) {
      return { jobTitle: '', applicants: [] };
    }
    return {
      jobTitle: mockJobs[jobId].title,
      applicants: mockApplicants[jobId] || [],
    };
  }, [jobId]);

  const filteredApplicants = useMemo(() => {
    if (!applicants) return [];
    return applicants.filter(applicant =>
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [applicants, searchTerm]);

  if (!jobId) {
    return (
      <div className="text-[#2F4F46] relative flex items-center justify-center text-center">
        <div className="bg-white/60 backdrop-blur-lg border border-[#E6F2DD]/80 rounded-2xl shadow-sm p-12">
          <Frown className="w-16 h-16 mx-auto text-[#B1D3B9]" />
          <h1
  style={{
    color: "#2F4F46",
    opacity: 1,
    fontWeight: 500,
    fontSize: "1rem",
    letterSpacing: "-0.02em",
    lineHeight: "1.1",
  }}
>No Job Selected</h1>
          <p className="text-[#4A6A60] mt-2 mb-6">Please select a job from the "Manage Jobs" page to view its applicants.</p>
          <button
            onClick={() => navigate('/employer/jobs')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#659287] hover:bg-[#53786F] text-white font-semibold transition-colors shadow-lg shadow-[#659287]/30"
          >
            <Briefcase className="w-5 h-5" />
            Go to Manage Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <button onClick={() => navigate('/employer/jobs')} className="flex items-center gap-2 text-sm font-semibold text-[#4A6A60] hover:text-[#2F4F46] mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Manage Jobs
        </button>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#2F4F46]">Applicants for "{jobTitle}"</h1>
        <p className="mt-2 text-lg text-[#4A6A60]">Review and manage candidates for this role.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#88BDA4]" />
        <input
          type="text"
          placeholder="Search by name or skill..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-14 pl-12 pr-4 text-base rounded-xl border border-[#B1D3B9]/70 bg-white/70 backdrop-blur-sm text-[#2F4F46] placeholder:text-[#4A6A60]/80 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#659287]/50 focus:border-[#659287]"
        />
      </div>

      {filteredApplicants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplicants.map(applicant => (
            <ApplicantCard key={applicant.id} applicant={applicant} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/60 backdrop-blur-lg border border-[#E6F2DD]/80 rounded-2xl shadow-sm">
          <User className="w-16 h-16 mx-auto text-[#B1D3B9]" />
          <h2 className="text-xl font-bold text-[#2F4F46] mt-4">No Applicants Found</h2>
          <p className="text-[#4A6A60] mt-2">
            {searchTerm ? `Your search for "${searchTerm}" did not match any applicants.` : 'There are currently no applicants for this job.'}
          </p>
        </div>
      )}
    </div>
  );
}