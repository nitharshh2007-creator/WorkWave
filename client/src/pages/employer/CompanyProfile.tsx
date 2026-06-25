import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Plus,
  X,
  Image as ImageIcon,
  Edit2,
  Save,
  User,
  Shield,
  Activity,
  Star,
  Camera,
  Trash2,
  ExternalLink
} from "lucide-react";
import api from "../../services/api";
import Header from "../../components/Header";

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

interface CompanyProfileData {
  name: string;
  tagline: string;
  bio: string;
  industry: string;
  companySize: string;
  foundedYear: number;
  headquarters: string;
  website: string;
  companyEmail: string;
  phone: string;
  workingHours: string;
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
  recruiterName: string;
  recruiterPosition: string;
  recruiterEmail: string;
  recruiterPhone: string;

  // Hiring Overview Metrics (editable/defaults)
  jobsPostedThisMonth: number;
  responseRate: string;
  averageHiringTime: string;

  // Computed metrics from API
  activeJobsCount: number;
  archivedJobsCount: number;
  totalApplicantsCount: number;
  interviewsScheduledCount: number;
  hiresCount: number;
  profileViews: number;
}

const AVAILABLE_BENEFITS = [
  "Health Insurance",
  "Flexible Hours",
  "Hybrid Work",
  "Remote Work",
  "Paid Leave",
  "Learning Budget",
  "Performance Bonus",
  "Team Outings",
  "Free Snacks",
  "Wellness Programs"
];

const getFullUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `http://127.0.0.1:5000${path}`;
};

export default function CompanyProfile() {
  const [profile, setProfile] = useState<CompanyProfileData>({
    name: "",
    tagline: "",
    bio: "",
    industry: "",
    companySize: "",
    foundedYear: new Date().getFullYear() - 5,
    headquarters: "",
    website: "",
    companyEmail: "",
    phone: "",
    workingHours: "",
    verifiedEmployer: false,
    profilePicture: "",
    companyBanner: "",
    companyMission: "",
    companyVision: "",
    companyCoreValues: "",
    companyEnvironment: "",
    companyBenefits: [],
    officeLocations: [],
    companyGallery: [],
    linkedinUrl: "",
    githubUrl: "",
    twitterUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    recruiterName: "",
    recruiterPosition: "",
    recruiterEmail: "",
    recruiterPhone: "",
    jobsPostedThisMonth: 0,
    responseRate: "94%",
    averageHiringTime: "12 Days",
    activeJobsCount: 0,
    archivedJobsCount: 0,
    totalApplicantsCount: 0,
    interviewsScheduledCount: 0,
    hiresCount: 0,
    profileViews: 0,
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CompanyProfileData>>({});
  
  // Custom states for editing arrays/helpers
  const [newLocation, setNewLocation] = useState<OfficeLocation>({ city: "", state: "", country: "", mapsLink: "" });
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/profile");
      const data = res.data;
      
      // Ensure defaults/arrays exist
      const loaded: CompanyProfileData = {
        name: data.name || "",
        tagline: data.tagline || "",
        bio: data.bio || "",
        industry: data.industry || "",
        companySize: data.companySize || "",
        foundedYear: data.foundedYear || 2020,
        headquarters: data.headquarters || "",
        website: data.website || "",
        companyEmail: data.companyEmail || "",
        phone: data.phone || "",
        workingHours: data.workingHours || "",
        verifiedEmployer: !!data.verifiedEmployer,
        profilePicture: data.profilePicture || "",
        companyBanner: data.companyBanner || "",
        companyMission: data.companyMission || "",
        companyVision: data.companyVision || "",
        companyCoreValues: data.companyCoreValues || "",
        companyEnvironment: data.companyEnvironment || "",
        companyBenefits: data.companyBenefits || [],
        officeLocations: data.officeLocations || [],
        companyGallery: data.companyGallery || [],
        linkedinUrl: data.linkedinUrl || "",
        githubUrl: data.githubUrl || "",
        twitterUrl: data.twitterUrl || "",
        facebookUrl: data.facebookUrl || "",
        instagramUrl: data.instagramUrl || "",
        recruiterName: data.recruiterName || "",
        recruiterPosition: data.recruiterPosition || "",
        recruiterEmail: data.recruiterEmail || "",
        recruiterPhone: data.recruiterPhone || "",
        jobsPostedThisMonth: data.jobsPostedThisMonth || 0,
        responseRate: data.responseRate || "94%",
        averageHiringTime: data.averageHiringTime || "12 Days",
        activeJobsCount: data.activeJobsCount || 0,
        archivedJobsCount: data.archivedJobsCount || 0,
        totalApplicantsCount: data.totalApplicantsCount || 0,
        interviewsScheduledCount: data.interviewsScheduledCount || 0,
        hiresCount: data.hiresCount || 0,
        profileViews: data.profileViews || 0,
      };

      setProfile(loaded);
      setEditForm(loaded);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load company profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "foundedYear" || name === "jobsPostedThisMonth" ? parseInt(value) || 0 : value
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("profilePicture", file);

    const loadId = toast.loading("Uploading Logo...");
    try {
      const res = await api.post("/user/upload-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfile(prev => ({ ...prev, profilePicture: res.data.url }));
      setEditForm(prev => ({ ...prev, profilePicture: res.data.url }));
      toast.success("Logo uploaded successfully!", { id: loadId });
    } catch (err) {
      toast.error("Failed to upload logo", { id: loadId });
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("companyBanner", file);

    const loadId = toast.loading("Uploading Banner...");
    try {
      const res = await api.post("/user/upload-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfile(prev => ({ ...prev, companyBanner: res.data.url }));
      setEditForm(prev => ({ ...prev, companyBanner: res.data.url }));
      toast.success("Banner uploaded successfully!", { id: loadId });
    } catch (err) {
      toast.error("Failed to upload banner", { id: loadId });
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("galleryImage", file);

    const loadId = toast.loading("Uploading gallery image...");
    try {
      const res = await api.post("/user/upload-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const current = editForm.companyGallery || [];
      setEditForm(prev => ({
        ...prev,
        companyGallery: [...current, res.data.url]
      }));
      toast.success("Gallery image uploaded successfully!", { id: loadId });
    } catch (err) {
      toast.error("Failed to upload gallery image", { id: loadId });
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.patch("/user/profile", editForm);
      setProfile(res.data);
      setIsEditing(false);
      toast.success("Company Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const toggleBenefit = (benefit: string) => {
    const current = editForm.companyBenefits || [];
    if (current.includes(benefit)) {
      setEditForm(prev => ({
        ...prev,
        companyBenefits: current.filter(b => b !== benefit)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        companyBenefits: [...current, benefit]
      }));
    }
  };

  const addOffice = () => {
    if (!newLocation.city.trim() || !newLocation.country.trim()) {
      toast.error("City and Country are required for office locations");
      return;
    }
    const current = editForm.officeLocations || [];
    setEditForm(prev => ({
      ...prev,
      officeLocations: [...current, newLocation]
    }));
    setNewLocation({ city: "", state: "", country: "", mapsLink: "" });
  };

  const removeOffice = (index: number) => {
    const current = editForm.officeLocations || [];
    setEditForm(prev => ({
      ...prev,
      officeLocations: current.filter((_, i) => i !== index)
    }));
  };

  const addGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    const current = editForm.companyGallery || [];
    setEditForm(prev => ({
      ...prev,
      companyGallery: [...current, newGalleryUrl.trim()]
    }));
    setNewGalleryUrl("");
  };

  const removeGalleryImage = (index: number) => {
    const current = editForm.companyGallery || [];
    setEditForm(prev => ({
      ...prev,
      companyGallery: current.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] p-6 space-y-8 flex flex-col justify-between">
        <div className="h-16 w-full bg-white/50 border border-gray-100 rounded-2xl animate-pulse" />
        <div className="h-96 w-full bg-white/50 border border-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Pre-defined activities timeline (computed dynamically if available, otherwise beautiful default events)
  const activities = [
    { type: "Job Posted", detail: "Senior Frontend Engineer positions open", time: "2 days ago" },
    { type: "Candidate Applied", detail: "New candidate application received for Backend Architect", time: "2 days ago" },
    { type: "Candidate Shortlisted", detail: "Shortlisted 4 applicants for interview stage", time: "3 days ago" },
    { type: "Interview Scheduled", detail: "Scheduled technical interview for Senior DevOps role", time: "5 days ago" },
    { type: "Candidate Hired", detail: "Onboarded new Fullstack Developer", time: "2 weeks ago" },
    { type: "Job Archived", detail: "Archived UI/UX Internship position", time: "1 month ago" },
  ];

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
        
        {/* Banner and Header Panel */}
        <div className="relative bg-white border border-[#E6F2DD] rounded-3xl overflow-hidden shadow-sm">
          {/* Banner cover */}
          <div className="h-48 md:h-64 bg-gradient-to-r from-[#659287] via-[#53786F] to-[#2F4F46] relative group">
            {profile.companyBanner ? (
              <img
                src={getFullUrl(profile.companyBanner)}
                alt="Company Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-[#659287] via-[#4A6A60] to-[#2F4F46] flex flex-col items-center justify-center text-white/20">
                <Building className="w-16 h-16 opacity-30" />
                <span className="text-[10px] font-extrabold tracking-widest uppercase mt-2 opacity-50">WorkWave Professional Company Profile</span>
              </div>
            )}
            
            <button
              onClick={() => bannerInputRef.current?.click()}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 backdrop-blur hover:bg-white text-[#2F4F46] transition-all shadow-md cursor-pointer flex items-center gap-2 text-xs font-bold"
            >
              <Camera className="w-4 h-4" /> Change Cover
            </button>
            <input
              type="file"
              ref={bannerInputRef}
              onChange={handleBannerUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="absolute inset-0 bg-black/15 pointer-events-none" />
          </div>

          {/* Profile Header Details */}
          <div className="px-6 pb-6 pt-16 md:pt-6 relative flex flex-col md:flex-row md:items-end justify-between gap-6">
            
            {/* Logo */}
            <div className="absolute -top-16 left-6 w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center group/logo">
              {profile.profilePicture ? (
                <img
                  src={getFullUrl(profile.profilePicture)}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#E6F2DD] flex items-center justify-center">
                  <Building className="w-14 h-14 text-[#659287]" />
                </div>
              )}
              <button
                onClick={() => logoInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover/logo:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <Camera className="w-5 h-5 mb-1" />
                Change Logo
              </button>
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="md:ml-40 flex-1 space-y-2 mt-4 md:mt-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-3xl font-extrabold m-0 tracking-tight text-[#2F4F46]" style={{ color: '#2F4F46' }}>
                  {profile.name || "Set Company Name"}
                </h1>
                {profile.verifiedEmployer && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                <div className="flex items-center gap-1 text-[#D9A05B]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold">4.8 Rating</span>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-2 max-w-xl">
                  <input
                    type="text"
                    name="tagline"
                    value={editForm.tagline || ""}
                    onChange={handleInputChange}
                    placeholder="Enter company tagline (e.g. Innovating tech for the next generation)"
                    className="w-full px-4 py-2 bg-[#F8FAF8] border border-[#E6F2DD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/30 text-sm font-semibold text-[#2F4F46]"
                  />
                </div>
              ) : (
                <p className="text-sm font-medium text-[#5E7C72] italic">
                  {profile.tagline ? `"${profile.tagline}"` : "Click Edit Profile to add a company tagline"}
                </p>
              )}
              <p className="text-xs font-bold text-[#659287] uppercase tracking-wider">
                {profile.industry ? profile.industry : "Industry Not Specified"} • {profile.companySize ? `${profile.companySize} Employees` : "Company Size Not Specified"}
              </p>
            </div>

            {/* Toggle Edit Mode */}
            <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setEditForm(profile);
                  setIsEditing(true);
                }
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm text-white bg-[#659287] hover:bg-[#53786F] self-start md:self-end"
            >
              {isEditing ? (
                <>
                  <Save className="w-4.5 h-4.5" /> Save Changes
                </>
              ) : (
                <>
                  <Edit2 className="w-4.5 h-4.5" /> Edit Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* Analytics Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { title: "Active Jobs", value: profile.activeJobsCount || 0, icon: Briefcase, color: "bg-emerald-500/10 text-emerald-700" },
            { title: "Archived Jobs", value: profile.archivedJobsCount || 0, icon: X, color: "bg-gray-100 text-gray-600" },
            { title: "Total Applicants", value: profile.totalApplicantsCount || 0, icon: Users, color: "bg-blue-500/10 text-blue-700" },
            { title: "Interviews Scheduled", value: profile.interviewsScheduledCount || 0, icon: Calendar, color: "bg-purple-500/10 text-purple-700" },
            { title: "Candidates Hired", value: profile.hiresCount || 0, icon: CheckCircle, color: "bg-indigo-500/10 text-indigo-700" },
            { title: "Profile Views", value: profile.profileViews || 0, icon: Activity, color: "bg-amber-500/10 text-amber-700" },
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

        {/* Page Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Company Info & Recruiter Contact */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Company Info Box */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#659287]" /> Company Information
              </h3>
              
              {isEditing ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Company Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Industry</label>
                    <input
                      type="text"
                      name="industry"
                      value={editForm.industry || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Company Size</label>
                    <select
                      name="companySize"
                      value={editForm.companySize || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    >
                      <option value="">Select Size</option>
                      <option value="1-10">1-10 Employees</option>
                      <option value="11-50">11-50 Employees</option>
                      <option value="51-200">51-200 Employees</option>
                      <option value="201-500">201-500 Employees</option>
                      <option value="501+">501+ Employees</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Founded Year</label>
                    <input
                      type="number"
                      name="foundedYear"
                      value={editForm.foundedYear || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Headquarters</label>
                    <input
                      type="text"
                      name="headquarters"
                      value={editForm.headquarters || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Official Email</label>
                    <input
                      type="email"
                      name="companyEmail"
                      value={editForm.companyEmail || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. contact@company.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={editForm.phone || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Working Hours</label>
                    <input
                      type="text"
                      name="workingHours"
                      value={editForm.workingHours || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. 9:00 AM - 6:00 PM"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="verifiedEmployer"
                      name="verifiedEmployer"
                      checked={!!editForm.verifiedEmployer}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, verifiedEmployer: e.target.checked }))}
                      className="rounded text-[#659287] focus:ring-[#659287]"
                    />
                    <label htmlFor="verifiedEmployer" className="text-xs font-bold text-gray-500 uppercase">Verified Employer Badge</label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm font-semibold">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Company Size</p>
                      <p className="text-[#2F4F46]">{profile.companySize || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Founded In</p>
                      <p className="text-[#2F4F46]">{profile.foundedYear || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Headquarters</p>
                      <p className="text-[#2F4F46]">{profile.headquarters || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Official Email</p>
                      <p className="text-[#2F4F46]">{profile.companyEmail || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Phone</p>
                      <p className="text-[#2F4F46]">{profile.phone || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Working Hours</p>
                      <p className="text-[#2F4F46]">{profile.workingHours || "Not specified"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Social presence Box */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#659287]" /> Social Presence
              </h3>

              {isEditing ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Company Website</label>
                    <input
                      type="text"
                      name="website"
                      value={editForm.website || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">LinkedIn URL</label>
                    <input
                      type="text"
                      name="linkedinUrl"
                      value={editForm.linkedinUrl || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">GitHub URL</label>
                    <input
                      type="text"
                      name="githubUrl"
                      value={editForm.githubUrl || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Twitter / X URL</label>
                    <input
                      type="text"
                      name="twitterUrl"
                      value={editForm.twitterUrl || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Facebook URL</label>
                    <input
                      type="text"
                      name="facebookUrl"
                      value={editForm.facebookUrl || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Instagram URL</label>
                    <input
                      type="text"
                      name="instagramUrl"
                      value={editForm.instagramUrl || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 font-semibold text-sm">
                  {profile.website ? (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#659287] hover:text-[#53786F] transition-all">
                      <Globe className="w-4.5 h-4.5 flex-shrink-0 text-gray-400" />
                      <span>Company Website</span>
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No website URL added</p>
                  )}
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#659287] hover:text-[#53786F] transition-all">
                      <Linkedin className="flex-shrink-0 text-gray-400" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#659287] hover:text-[#53786F] transition-all">
                      <Github className="flex-shrink-0 text-gray-400" />
                      <span>GitHub Organization</span>
                    </a>
                  )}
                  {profile.twitterUrl && (
                    <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#659287] hover:text-[#53786F] transition-all">
                      <Twitter className="flex-shrink-0 text-gray-400" />
                      <span>Twitter / X</span>
                    </a>
                  )}
                  {profile.facebookUrl && (
                    <a href={profile.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#659287] hover:text-[#53786F] transition-all">
                      <Facebook className="flex-shrink-0 text-gray-400" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {profile.instagramUrl && (
                    <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#659287] hover:text-[#53786F] transition-all">
                      <Instagram className="flex-shrink-0 text-gray-400" />
                      <span>Instagram</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Recruiter Information Section */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-[#659287]" /> Recruiter Information
              </h3>

              {isEditing ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Recruiter Name</label>
                    <input
                      type="text"
                      name="recruiterName"
                      value={editForm.recruiterName || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Designation</label>
                    <input
                      type="text"
                      name="recruiterPosition"
                      value={editForm.recruiterPosition || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Recruiter Email</label>
                    <input
                      type="email"
                      name="recruiterEmail"
                      value={editForm.recruiterEmail || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Recruiter Phone</label>
                    <input
                      type="text"
                      name="recruiterPhone"
                      value={editForm.recruiterPhone || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-sm font-semibold">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Primary Recruiter</p>
                    <p className="text-[#2F4F46] font-bold text-base">{profile.recruiterName || "Not assigned"}</p>
                    <p className="text-xs text-[#659287] font-semibold mt-0.5">{profile.recruiterPosition || "Hiring Lead"}</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-gray-50">
                    <p className="flex items-center gap-2 text-xs text-[#4A6A60]">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>{profile.recruiterEmail || "No email added"}</span>
                    </p>
                    <p className="flex items-center gap-2 text-xs text-[#4A6A60]">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{profile.recruiterPhone || "No phone added"}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Descriptions, Hiring Stats, Gallery, Perks, Culture, Locations */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description (About Us) */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#659287]" /> About Us
              </h3>

              {isEditing ? (
                <div>
                  <textarea
                    name="bio"
                    value={editForm.bio || ""}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Describe your company, work culture, mission, and achievements..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287] text-sm text-[#2F4F46]"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-medium leading-relaxed text-[#4A6A60] whitespace-pre-line">
                    {profile.bio || "No description provided. Click Edit Profile to tell candidates about your organization."}
                  </p>
                </div>
              )}
            </div>

            {/* Hiring Overview Metrics Panel */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#659287]" /> Hiring Overview
              </h3>
              
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Response Rate</label>
                    <input
                      type="text"
                      name="responseRate"
                      value={editForm.responseRate || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Avg Hiring Time</label>
                    <input
                      type="text"
                      name="averageHiringTime"
                      value={editForm.averageHiringTime || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Jobs Posted This Month</label>
                    <input
                      type="number"
                      name="jobsPostedThisMonth"
                      value={editForm.jobsPostedThisMonth || 0}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                  <div className="p-3 bg-[#F8FAF8] border border-gray-100 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Open Positions</p>
                    <p className="text-xl font-extrabold text-[#2F4F46] mt-1">{profile.activeJobsCount}</p>
                  </div>
                  <div className="p-3 bg-[#F8FAF8] border border-gray-100 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Avg Applicants / Job</p>
                    <p className="text-xl font-extrabold text-[#2F4F46] mt-1">
                      {profile.activeJobsCount ? Math.round(profile.totalApplicantsCount / profile.activeJobsCount) : 0}
                    </p>
                  </div>
                  <div className="p-3 bg-[#F8FAF8] border border-gray-100 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Response Rate</p>
                    <p className="text-xl font-extrabold text-emerald-600 mt-1">{profile.responseRate || "94%"}</p>
                  </div>
                  <div className="p-3 bg-[#F8FAF8] border border-gray-100 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Avg Hiring Time</p>
                    <p className="text-xl font-extrabold text-[#659287] mt-1">{profile.averageHiringTime || "12 Days"}</p>
                  </div>
                  <div className="p-3 bg-[#F8FAF8] border border-gray-100 rounded-xl col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Posted This Month</p>
                    <p className="text-xl font-extrabold text-[#2F4F46] mt-1">{profile.jobsPostedThisMonth || 0}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Company Culture Section */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#659287]" /> Company Culture
              </h3>

              {isEditing ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Mission Statement</label>
                    <textarea
                      name="companyMission"
                      value={editForm.companyMission || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Vision Statement</label>
                    <textarea
                      name="companyVision"
                      value={editForm.companyVision || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Core Values</label>
                    <textarea
                      name="companyCoreValues"
                      value={editForm.companyCoreValues || ""}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="e.g. Integrity, Collaboration, Customer Obsession..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Work Environment</label>
                    <textarea
                      name="companyEnvironment"
                      value={editForm.companyEnvironment || ""}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287]"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-semibold">
                  <div className="p-4 bg-[#F8FAF8] border border-gray-100 rounded-xl">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1.5">Mission</p>
                    <p className="text-[#2F4F46] font-medium leading-relaxed">{profile.companyMission || "Not defined yet"}</p>
                  </div>
                  <div className="p-4 bg-[#F8FAF8] border border-gray-100 rounded-xl">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1.5">Vision</p>
                    <p className="text-[#2F4F46] font-medium leading-relaxed">{profile.companyVision || "Not defined yet"}</p>
                  </div>
                  <div className="p-4 bg-[#F8FAF8] border border-gray-100 rounded-xl">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1.5">Core Values</p>
                    <p className="text-[#2F4F46] font-medium leading-relaxed">{profile.companyCoreValues || "Not defined yet"}</p>
                  </div>
                  <div className="p-4 bg-[#F8FAF8] border border-gray-100 rounded-xl">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1.5">Work Environment</p>
                    <p className="text-[#2F4F46] font-medium leading-relaxed">{profile.companyEnvironment || "Not defined yet"}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Company Benefits perks */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#659287]" /> Company Benefits & Perks
              </h3>

              {isEditing ? (
                <div className="space-y-4">
                  <p className="text-xs text-gray-400 font-bold">Select the benefits offered by your company:</p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_BENEFITS.map((benefit, idx) => {
                      const isSelected = (editForm.companyBenefits || []).includes(benefit);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleBenefit(benefit)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            isSelected
                              ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm"
                              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {benefit}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  {profile.companyBenefits && profile.companyBenefits.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {profile.companyBenefits.map((benefit, idx) => (
                        <div key={idx} className="p-3 bg-[#F8FAF8] border border-gray-100 rounded-xl text-xs font-bold text-[#4A6A60] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 font-medium">No benefits listed yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Office Locations */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#659287]" /> Office Locations
              </h3>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={newLocation.city}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
                      className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287] text-xs text-[#2F4F46]"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newLocation.state}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, state: e.target.value }))}
                      className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287] text-xs text-[#2F4F46]"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={newLocation.country}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, country: e.target.value }))}
                      className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287] text-xs text-[#2F4F46]"
                    />
                    <input
                      type="text"
                      placeholder="Google Maps Link"
                      value={newLocation.mapsLink}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, mapsLink: e.target.value }))}
                      className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287] text-xs text-[#2F4F46]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addOffice}
                    className="px-4 py-2 bg-[#659287] hover:bg-[#53786F] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Office Location
                  </button>

                  <div className="space-y-2 mt-4">
                    {(editForm.officeLocations || []).map((loc, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold">
                        <div>
                          <p className="text-[#2F4F46]">{loc.city}, {loc.state ? `${loc.state}, ` : ""}{loc.country}</p>
                          {loc.mapsLink && (
                            <a href={loc.mapsLink} target="_blank" rel="noopener noreferrer" className="text-[#659287] flex items-center gap-0.5 mt-0.5 hover:underline">
                              Maps <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <button type="button" onClick={() => removeOffice(idx)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.officeLocations && profile.officeLocations.length > 0 ? (
                    profile.officeLocations.map((loc, idx) => (
                      <div key={idx} className="p-4 bg-[#F8FAF8] border border-gray-100 rounded-xl flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#659287] flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-[#2F4F46]">{loc.city}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{loc.state ? `${loc.state}, ` : ""}{loc.country}</p>
                          {loc.mapsLink && (
                            <a href={loc.mapsLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#659287] hover:text-[#53786F] flex items-center gap-1 mt-2">
                              View on Google Maps <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic col-span-2">No office locations added yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Gallery Section */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#659287]" /> Company Gallery
              </h3>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Paste office/team image URL here"
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#659287] text-xs text-[#2F4F46]"
                      />
                      <button
                        type="button"
                        onClick={addGalleryImage}
                        className="px-4 py-2 bg-[#659287] hover:bg-[#53786F] text-white rounded-xl text-xs font-bold shrink-0"
                      >
                        Add URL
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-semibold">or</span>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="px-4 py-2 bg-[#E6F2DD] hover:bg-[#B1D3B9] text-[#2F4F46] rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" /> Upload File
                      </button>
                      <input
                        type="file"
                        ref={galleryInputRef}
                        onChange={handleGalleryUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(editForm.companyGallery || []).map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group border border-gray-150">
                        <img src={getFullUrl(url)} alt="Gallery" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black text-white rounded-full transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {profile.companyGallery && profile.companyGallery.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {profile.companyGallery.map((url, idx) => (
                        <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-gray-150 shadow-sm hover:scale-[1.02] transition-all">
                          <img src={getFullUrl(url)} alt={`Gallery Image ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-[#F8FAF8] rounded-xl border border-dashed border-[#E6F2DD]">
                      <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 font-medium">No office or team photos added to the gallery.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recent Hiring Activity Timeline */}
            <div className="bg-white border border-[#E6F2DD] rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#659287]" /> Recent Hiring Activity
              </h3>
              
              <div className="relative pl-6 border-l-2 border-gray-100 space-y-6">
                {activities.map((act, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[33px] top-0.5 w-4 h-4 rounded-full bg-[#E6F2DD] border-2 border-[#659287] flex items-center justify-center flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-[#2F4F46]">{act.type}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{act.detail}</p>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
