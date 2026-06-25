import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Building,
  Users,
  Calendar,
  MapPin,
  Globe,
  Mail,
  Phone,
  CheckCircle,
  Briefcase,
  TrendingUp,
  Clock,
  Heart,
  Image as ImageIcon,
  User,
  Shield,
  Activity,
  Star,
  ExternalLink,
  ArrowLeft,
  Layers
} from "lucide-react";
import api from "../services/api";
import Header from "../components/Header";

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface OfficeLocation {
  city: string;
  state: string;
  country: string;
  mapsLink?: string;
}

interface ActiveJob {
  _id: string;
  title: string;
  location: string;
  jobType: string;
  salary?: { min?: number; max?: number };
  experience?: string;
  createdAt: string;
}

interface CompanyData {
  name: string;
  tagline: string;
  bio: string;
  industry: string;
  companySize: string;
  foundedYear: number;
  headquarters: string;
  website: string;
  companyEmail?: string;
  phone?: string;
  workingHours?: string;
  verifiedEmployer: boolean;
  profilePicture: string;
  companyBanner: string;
  
  // Culture
  companyMission: string;
  companyVision: string;
  companyCoreValues: string;
  companyEnvironment: string;

  // Benefits & perks
  companyBenefits: string[];

  // Office locations
  officeLocations: OfficeLocation[];

  // Gallery
  companyGallery: string[];

  // Socials
  linkedinUrl: string;
  githubUrl: string;
  twitterUrl: string;
  facebookUrl: string;
  instagramUrl: string;

  // Recruiter Information
  recruiterName?: string;
  recruiterPosition?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;

  // Statistics
  activeJobs: ActiveJob[];
  activeJobsCount: number;
  totalJobsCount: number;
  totalApplicantsCount: number;
  interviewsScheduledCount: number;
  hiresCount: number;
  profileViews: number;
}

const getFullUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `http://127.0.0.1:5000${path}`;
};

export default function PublicCompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyData | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        if (!id) return;
        const res = await api.get(`/companies/${id}`);
        setCompany(res.data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to load company details");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [id]);

  const handleQuickApply = async (job: ActiveJob) => {
    try {
      await api.post("/applications", {
        jobTitle: job.title,
        company: company?.name,
        location: job.location,
        status: "Pending",
        job: job._id,
      });
      toast.success(`Applied to ${job.title} successfully!`);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to submit application"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] p-6 space-y-8 flex flex-col justify-between">
        <div className="h-16 w-full bg-white/50 border border-gray-100 rounded-2xl animate-pulse" />
        <div className="h-96 w-full bg-white/50 border border-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] text-[#2F4F46]">
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <Header />
        </div>
        <div className="max-w-md mx-auto mt-20 bg-white border border-[#E6F2DD] p-8 rounded-3xl text-center shadow-sm">
          <Building className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-rose-600 mb-2">Company Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">The requested company profile does not exist or has been set to private.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-[#659287] hover:bg-[#53786F] text-white rounded-xl text-xs font-bold transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#2F4F46] relative pb-16">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#B1D3B9]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-[#E6F2DD]/40 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Navbar */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Header />
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-[#2F4F46] hover:text-[#659287] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Banner and Header Panel */}
        <div className="relative bg-white border border-[#E6F2DD] rounded-3xl overflow-hidden shadow-sm">
          {/* Banner cover */}
          <div className="h-48 md:h-64 relative">
            {company.companyBanner ? (
              <img
                src={getFullUrl(company.companyBanner)}
                alt={`${company.name} Banner`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-[#659287] via-[#4A6A60] to-[#2F4F46] flex flex-col items-center justify-center text-white/20">
                <Building className="w-16 h-16 opacity-30" />
                <span className="text-[10px] font-extrabold tracking-widest uppercase mt-2 opacity-50">WorkWave Professional Company Profile</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          </div>

          {/* Header Details */}
          <div className="px-6 pb-6 pt-16 md:pt-6 relative flex flex-col md:flex-row md:items-end justify-between gap-6">
            
            {/* Logo */}
            <div className="absolute -top-16 left-6 w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
              {company.profilePicture ? (
                <img
                  src={getFullUrl(company.profilePicture)}
                  alt={`${company.name} Logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#E6F2DD] flex items-center justify-center">
                  <Building className="w-14 h-14 text-[#659287]" />
                </div>
              )}
            </div>

            <div className="md:ml-40 flex-1 space-y-2 mt-4 md:mt-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-3xl font-extrabold m-0 tracking-tight text-[#2F4F46]" style={{ color: '#2F4F46' }}>
                  {company.name}
                </h1>
                {company.verifiedEmployer && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified Employer
                  </span>
                )}
                <div className="flex items-center gap-1 text-[#D9A05B]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold">4.8 Rating</span>
                </div>
              </div>

              {company.tagline && (
                <p className="text-sm font-medium text-[#5E7C72] italic">
                  "{company.tagline}"
                </p>
              )}
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-[#659287] uppercase tracking-wider">
                {company.industry && <span>{company.industry}</span>}
                {company.companySize && <span>• {company.companySize} Employees</span>}
                {company.foundedYear && <span>• Est. {company.foundedYear}</span>}
                {company.headquarters && <span>• HQ: {company.headquarters}</span>}
              </div>
            </div>

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm text-white bg-[#659287] hover:bg-[#53786F] self-start md:self-end"
              >
                Visit Website <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { title: "Active Openings", value: company.activeJobsCount || 0, icon: Briefcase, color: "bg-emerald-500/10 text-emerald-700" },
            { title: "Total Posted", value: company.totalJobsCount || 0, icon: Layers, color: "bg-gray-100 text-gray-600" },
            { title: "Applicants Logged", value: company.totalApplicantsCount || 0, icon: Users, color: "bg-blue-500/10 text-blue-700" },
            { title: "Interviews Conducted", value: company.interviewsScheduledCount || 0, icon: Calendar, color: "bg-purple-500/10 text-purple-700" },
            { title: "Candidates Hired", value: company.hiresCount || 0, icon: CheckCircle, color: "bg-indigo-500/10 text-indigo-700" },
            { title: "Profile Views", value: company.profileViews || 0, icon: Activity, color: "bg-amber-500/10 text-amber-700" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border border-[#E6F2DD] rounded-2xl p-4 shadow-sm flex flex-col justify-between h-28">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.color} flex-shrink-0`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{stat.title}</p>
                <p className="text-xl font-extrabold mt-0.5 text-[#2F4F46]">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Headquarters details */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <Building className="w-4.5 h-4.5 text-[#659287]" /> Company Overview
              </h3>
              <div className="space-y-3.5 text-sm font-semibold">
                {company.headquarters && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4.5 h-4.5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Headquarters</p>
                      <p className="text-[#2F4F46]">{company.headquarters}</p>
                    </div>
                  </div>
                )}
                {company.companyEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4.5 h-4.5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Official Email</p>
                      <p className="text-[#2F4F46]">{company.companyEmail}</p>
                    </div>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4.5 h-4.5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Phone Contact</p>
                      <p className="text-[#2F4F46]">{company.phone}</p>
                    </div>
                  </div>
                )}
                {company.workingHours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-4.5 h-4.5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Working Hours</p>
                      <p className="text-[#2F4F46]">{company.workingHours}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social presence */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <Globe className="w-4.5 h-4.5 text-[#659287]" /> Social Links
              </h3>
              <div className="flex flex-col gap-3 font-semibold text-sm">
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#659287] hover:text-[#53786F] transition-all">
                    <Globe className="w-4.5 h-4.5 text-gray-400" />
                    <span>Website</span>
                  </a>
                )}
                {company.linkedinUrl && (
                  <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#659287] hover:text-[#53786F] transition-all">
                    <Linkedin className="text-gray-400" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {company.githubUrl && (
                  <a href={company.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#659287] hover:text-[#53786F] transition-all">
                    <Github className="text-gray-400" />
                    <span>GitHub</span>
                  </a>
                )}
                {company.twitterUrl && (
                  <a href={company.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#659287] hover:text-[#53786F] transition-all">
                    <Twitter className="text-gray-400" />
                    <span>Twitter / X</span>
                  </a>
                )}
                {company.facebookUrl && (
                  <a href={company.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#659287] hover:text-[#53786F] transition-all">
                    <Facebook className="text-gray-400" />
                    <span>Facebook</span>
                  </a>
                )}
                {company.instagramUrl && (
                  <a href={company.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#659287] hover:text-[#53786F] transition-all">
                    <Instagram className="text-gray-400" />
                    <span>Instagram</span>
                  </a>
                )}
                {!company.website && !company.linkedinUrl && !company.githubUrl && !company.twitterUrl && !company.facebookUrl && !company.instagramUrl && (
                  <p className="text-xs text-gray-400 italic">No social links added.</p>
                )}
              </div>
            </div>

            {/* Recruiter Details */}
            {company.recruiterName && (
              <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                  <User className="w-4.5 h-4.5 text-[#659287]" /> Recruiter Contact
                </h3>
                <div className="space-y-3.5 text-sm font-semibold">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Primary Recruiter</p>
                    <p className="text-[#2F4F46] font-bold text-base">{company.recruiterName}</p>
                    {company.recruiterPosition && (
                      <p className="text-xs text-[#659287] font-semibold mt-0.5">{company.recruiterPosition}</p>
                    )}
                  </div>
                  {(company.recruiterEmail || company.recruiterPhone) && (
                    <div className="space-y-2 pt-2 border-t border-gray-50">
                      {company.recruiterEmail && (
                        <p className="flex items-center gap-2 text-xs text-[#4A6A60]">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{company.recruiterEmail}</span>
                        </p>
                      )}
                      {company.recruiterPhone && (
                        <p className="flex items-center gap-2 text-xs text-[#4A6A60]">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{company.recruiterPhone}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <Building className="w-4.5 h-4.5 text-[#659287]" /> About the Company
              </h3>
              <p className="text-sm font-medium leading-relaxed text-[#4A6A60] whitespace-pre-line">
                {company.bio || "Company description not available."}
              </p>
            </div>

            {/* Culture */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <Shield className="w-4.5 h-4.5 text-[#659287]" /> Company Culture
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-[#2F4F46]">
                {company.companyMission && (
                  <div className="p-4 bg-[#F8FAF8] border border-gray-100 rounded-xl">
                    <p className="text-[10px] text-gray-400 uppercase mb-1">Mission</p>
                    <p className="font-medium leading-relaxed">{company.companyMission}</p>
                  </div>
                )}
                {company.companyVision && (
                  <div className="p-4 bg-[#F8FAF8] border border-gray-100 rounded-xl">
                    <p className="text-[10px] text-gray-400 uppercase mb-1">Vision</p>
                    <p className="font-medium leading-relaxed">{company.companyVision}</p>
                  </div>
                )}
                {company.companyCoreValues && (
                  <div className="p-4 bg-[#F8FAF8] border border-gray-100 rounded-xl">
                    <p className="text-[10px] text-gray-400 uppercase mb-1">Core Values</p>
                    <p className="font-medium leading-relaxed">{company.companyCoreValues}</p>
                  </div>
                )}
                {company.companyEnvironment && (
                  <div className="p-4 bg-[#F8FAF8] border border-gray-100 rounded-xl">
                    <p className="text-[10px] text-gray-400 uppercase mb-1">Work Environment</p>
                    <p className="font-medium leading-relaxed">{company.companyEnvironment}</p>
                  </div>
                )}
                {!company.companyMission && !company.companyVision && !company.companyCoreValues && !company.companyEnvironment && (
                  <p className="text-xs text-gray-400 italic col-span-2">Company culture details not defined.</p>
                )}
              </div>
            </div>

            {/* Benefits Perks */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <Heart className="w-4.5 h-4.5 text-[#659287]" /> Benefits & Perks
              </h3>
              {company.companyBenefits && company.companyBenefits.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {company.companyBenefits.map((benefit, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#E6F2DD] text-[#2F4F46] border border-[#B1D3B9]/30">
                      {benefit}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No benefits listed yet.</p>
              )}
            </div>

            {/* Office Branches */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-[#659287]" /> Office Branches
              </h3>
              {company.officeLocations && company.officeLocations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {company.officeLocations.map((loc, idx) => (
                    <div key={idx} className="p-4 bg-[#F8FAF8] border border-gray-100 rounded-xl flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#659287] mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-[#2F4F46]">{loc.city}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">{loc.state ? `${loc.state}, ` : ""}{loc.country}</p>
                        {loc.mapsLink && (
                          <a href={loc.mapsLink} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-[#659287] hover:underline mt-1.5 flex items-center gap-0.5">
                            View Maps <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No office locations added yet.</p>
              )}
            </div>

            {/* Gallery */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <ImageIcon className="w-4.5 h-4.5 text-[#659287]" /> Workspace & Gallery
              </h3>
              {company.companyGallery && company.companyGallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {company.companyGallery.map((url, idx) => (
                    <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-gray-150 shadow-sm hover:scale-[1.02] transition-all">
                      <img src={getFullUrl(url)} alt={`Gallery photo ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-[#F8FAF8] rounded-xl border border-dashed border-[#E6F2DD]">
                  <p className="text-xs text-gray-400 font-medium">No images uploaded.</p>
                </div>
              )}
            </div>

            {/* Open Positions */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <Briefcase className="w-4.5 h-4.5 text-[#659287]" /> Open Openings
              </h3>
              {company.activeJobs && company.activeJobs.length > 0 ? (
                <div className="space-y-4">
                  {company.activeJobs.map((job) => (
                    <div key={job._id} className="p-4 bg-[#F8FAF8] border border-gray-100 hover:border-[#659287]/40 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
                      <div>
                        <h4 className="text-sm font-bold text-[#2F4F46]">{job.title}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400 font-medium mt-1">
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.jobType}</span>
                          {job.experience && (
                            <>
                              <span>•</span>
                              <span>{job.experience}</span>
                            </>
                          )}
                          {job.salary && job.salary.min && (
                            <>
                              <span>•</span>
                              <span>₹{job.salary.min.toLocaleString()} - ₹{job.salary.max?.toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => navigate(`/jobs/${job._id}`)}
                          className="flex-1 sm:flex-initial px-3.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleQuickApply(job)}
                          className="flex-1 sm:flex-initial px-3.5 py-2 bg-[#659287] hover:bg-[#53786F] text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm shadow-[#659287]/15"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-[#F8FAF8] rounded-xl border border-dashed border-[#E6F2DD]">
                  <p className="text-xs text-gray-400 font-medium">No active openings.</p>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <Star className="w-4.5 h-4.5 text-[#659287]" /> Company Reviews
              </h3>
              <p className="text-xs text-gray-400 font-semibold italic text-center py-4">No reviews yet.</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
