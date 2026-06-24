import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Camera, FileText, Check, AlertCircle, Save, Loader, Compass, 
  Bookmark, Briefcase, Plus, X, Globe, Eye, Lock, Download, Trash, 
  ExternalLink, Mail, Phone, MapPin, User, ChevronRight, Sparkles, AlertTriangle
} from 'lucide-react';
import api from '../services/api';

interface ProfileState {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
  profilePicture: string;
  resumeUrl: string;
  resumeFileName: string;
  resumeFileSize: number;
  resumeUploadedAt: string;
  professionalTitle: string;
  profileVisibility: 'public' | 'recruiters' | 'private';
  applicationsCount: number;
  savedJobsCount: number;
  profileStrength: number;
  role: string;
  createdAt: string;
}

const getFullUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `http://127.0.0.1:5000${path}`;
};

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileState>({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    profilePicture: '',
    resumeUrl: '',
    resumeFileName: '',
    resumeFileSize: 0,
    resumeUploadedAt: '',
    professionalTitle: '',
    profileVisibility: 'recruiters',
    applicationsCount: 0,
    savedJobsCount: 0,
    profileStrength: 0,
    role: 'candidate',
    createdAt: '',
  });

  const [initialProfile, setInitialProfile] = useState<ProfileState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [isPictureUploading, setIsPictureUploading] = useState(false);
  const [isResumeUploading, setIsResumeUploading] = useState(false);
  const [resumeProgress, setResumeProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/user/profile');
      const loadedProfile: ProfileState = {
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        bio: data.bio || '',
        skills: data.skills || [],
        profilePicture: data.profilePicture || '',
        resumeUrl: data.resumeUrl || '',
        resumeFileName: data.resumeFileName || '',
        resumeFileSize: data.resumeFileSize || 0,
        resumeUploadedAt: data.resumeUploadedAt || '',
        professionalTitle: data.professionalTitle || '',
        profileVisibility: data.profileVisibility || 'recruiters',
        applicationsCount: data.applicationsCount || 0,
        savedJobsCount: data.savedJobsCount || 0,
        profileStrength: data.profileStrength || 0,
        role: data.role || 'candidate',
        createdAt: data.createdAt || '',
      };
      setProfile(loadedProfile);
      setInitialProfile(loadedProfile);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Check if form has unsaved modifications
  const hasChanges = initialProfile ? JSON.stringify(profile) !== JSON.stringify(initialProfile) : false;

  // Handle inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleVisibilityChange = (val: 'public' | 'recruiters' | 'private') => {
    setProfile(prev => ({ ...prev, profileVisibility: val }));
  };

  // Add Skill
  const handleSkillAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (trimmed.length < 2 || trimmed.length > 30) {
      toast.error('Skill must be between 2 and 30 characters');
      return;
    }
    if (profile.skills.includes(trimmed)) {
      toast.error('Skill already added');
      return;
    }
    if (profile.skills.length >= 15) {
      toast.error('Maximum 15 skills allowed');
      return;
    }
    setProfile(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setNewSkill('');
  };

  // Remove Skill
  const handleSkillRemove = (skill: string) => {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const currentStrength = profile.profileStrength;

  // Strength status formatting
  const getStrengthLabel = (score: number) => {
    if (score <= 40) return { label: 'Weak Profile', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
    if (score <= 70) return { label: 'Good Profile', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { label: 'Excellent Profile', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  };

  const strengthDetails = getStrengthLabel(currentStrength);

  // Save profile updates
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/user/profile', {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        skills: profile.skills,
        professionalTitle: profile.professionalTitle,
        profileVisibility: profile.profileVisibility,
      });

      const updatedProfile: ProfileState = {
        ...profile,
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location,
        bio: data.bio,
        skills: data.skills,
        professionalTitle: data.professionalTitle,
        profileVisibility: data.profileVisibility,
      };

      setProfile(updatedProfile);
      setInitialProfile(updatedProfile);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Profile Picture Upload
  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    setIsPictureUploading(true);
    try {
      const { data } = await api.post('/user/upload-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(prev => ({ ...prev, profilePicture: data.url }));
      if (initialProfile) {
        setInitialProfile(prev => prev ? { ...prev, profilePicture: data.url } : null);
      }
      toast.success('Profile picture updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsPictureUploading(false);
    }
  };

  // Resume Drag & Drop dropzone setup
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed for resume');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume must be under 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setIsResumeUploading(true);
    setResumeProgress(10);
    try {
      const response = await api.post('/user/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || file.size));
          setResumeProgress(Math.max(10, percent));
        },
      });

      const updatedUser = response.data.user;
      setProfile(prev => ({
        ...prev,
        resumeUrl: response.data.resumeUrl,
        resumeFileName: response.data.fileName,
        resumeFileSize: response.data.fileSize,
        resumeUploadedAt: response.data.uploadedAt,
      }));
      
      if (initialProfile) {
        setInitialProfile(prev => prev ? {
          ...prev,
          resumeUrl: response.data.resumeUrl,
          resumeFileName: response.data.fileName,
          resumeFileSize: response.data.fileSize,
          resumeUploadedAt: response.data.uploadedAt,
        } : null);
      }
      toast.success('Resume uploaded successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Resume upload failed');
    } finally {
      setIsResumeUploading(false);
      setResumeProgress(0);
    }
  }, [initialProfile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  // Delete Resume
  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    try {
      setIsResumeUploading(true);
      await api.delete('/user/resume');
      setProfile(prev => ({
        ...prev,
        resumeUrl: '',
        resumeFileName: '',
        resumeFileSize: 0,
        resumeUploadedAt: '',
      }));
      if (initialProfile) {
        setInitialProfile(prev => prev ? {
          ...prev,
          resumeUrl: '',
          resumeFileName: '',
          resumeFileSize: 0,
          resumeUploadedAt: '',
        } : null);
      }
      toast.success('Resume deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete resume');
    } finally {
      setIsResumeUploading(false);
    }
  };

  // Preview Resume
  const handlePreviewResume = () => {
    if (!profile.resumeUrl) return;
    window.open(getFullUrl(profile.resumeUrl), '_blank');
  };

  // Reset Changes
  const handleReset = () => {
    if (initialProfile) {
      setProfile(initialProfile);
      toast.success('Changes reverted');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex flex-col items-center justify-center p-6">
          <div className="space-y-4 w-full max-w-4xl animate-pulse">
            <div className="h-44 bg-white border border-[#E6F2DD] rounded-3xl" />
            <div className="grid grid-cols-4 gap-4 h-24">
              <div className="h-full bg-white border border-[#E6F2DD] rounded-2xl" />
              <div className="h-full bg-white border border-[#E6F2DD] rounded-2xl" />
              <div className="h-full bg-white border border-[#E6F2DD] rounded-2xl" />
              <div className="h-full bg-white border border-[#E6F2DD] rounded-2xl" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-96">
              <div className="h-full bg-white border border-[#E6F2DD] rounded-3xl" />
              <div className="h-full bg-white border border-[#E6F2DD] rounded-3xl" />
            </div>
          </div>
      </div>
    );
  }

  // Format File Size
  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <>
      <Toaster position="top-right" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-6xl mx-auto pb-24"
      >
        {/* HERO SECTION */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Decorative Background Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B1D3B9]/15 rounded-full blur-3xl pointer-events-none -translate-y-12 translate-x-12" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#659287]/5 rounded-full blur-3xl pointer-events-none translate-y-12 -translate-x-12" />

          {/* Left + Center: Avatar and Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 z-10 w-full md:w-auto">
            {/* Avatar container with Animated Border */}
            <div className="relative group">
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#659287] via-[#B1D3B9] to-[#2F4F46] opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-xy blur-[2px]" />
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-white flex items-center justify-center border-4 border-white shadow-xl">
                {profile.profilePicture ? (
                  <img 
                    src={getFullUrl(profile.profilePicture)} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#E6F2DD] to-[#B1D3B9] flex items-center justify-center text-[#2F4F46] font-extrabold text-3xl">
                    {profile.name ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : <User size={40} />}
                  </div>
                )}
                
                {/* Upload Hover Overlay */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPictureUploading}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                >
                  {isPictureUploading ? (
                    <Loader className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handlePictureChange} 
              />
            </div>

            {/* Info details */}
            <div className="text-center sm:text-left space-y-2">
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h1 style={{ color: '#2F4F46' }} className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-none">
                    {profile.name || 'Set Your Name'}
                  </h1>
                  <span className="inline-flex items-center self-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6F2DD] text-[#659287] border border-[#B1D3B9]/30">
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#659287] flex items-center justify-center sm:justify-start gap-1">
                  <Sparkles className="w-4 h-4" />
                  {profile.professionalTitle || 'No professional title set'}
                </p>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-[#5E7C72] font-medium">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#659287]" /> {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#659287]" /> {profile.email}
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#659287]" /> {profile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Dynamic Profile Strength Ring */}
          <div className="flex flex-col items-center justify-center text-center p-4 bg-white/40 border border-white/50 rounded-2xl shadow-inner min-w-[160px] z-10">
            <span className="text-xs uppercase tracking-widest text-[#5E7C72] font-bold">
              Profile Strength
            </span>
            
            {/* SVG Circular Progress */}
            <div className="relative w-20 h-20 my-3 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
                <path
                  className="text-gray-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className={`transition-colors duration-500 ${
                    currentStrength <= 40 ? 'text-rose-500' : currentStrength <= 70 ? 'text-amber-500' : 'text-emerald-500'
                  }`}
                  strokeWidth="3.5"
                  strokeDasharray={`${currentStrength}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${currentStrength}, 100` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute text-lg font-extrabold text-[#2F4F46]">
                {currentStrength}%
              </div>
            </div>

            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${strengthDetails.bg} ${strengthDetails.color} ${strengthDetails.border}`}>
              {strengthDetails.label}
            </span>
          </div>
        </div>

        {/* QUICK STATISTICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Applications */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl p-5 shadow-xl flex items-center gap-4 hover:shadow-2xl transition-all"
          >
            <div className="p-3.5 rounded-2xl bg-[#E6F2DD] text-[#659287]">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#5E7C72] uppercase tracking-wider">Applications</p>
              <h3 className="text-2xl font-extrabold text-[#2F4F46] mt-0.5">{profile.applicationsCount}</h3>
            </div>
          </motion.div>

          {/* Card 2: Saved Jobs */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl p-5 shadow-xl flex items-center gap-4 hover:shadow-2xl transition-all"
          >
            <div className="p-3.5 rounded-2xl bg-[#E6F2DD] text-[#659287]">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#5E7C72] uppercase tracking-wider">Saved Jobs</p>
              <h3 className="text-2xl font-extrabold text-[#2F4F46] mt-0.5">{profile.savedJobsCount}</h3>
            </div>
          </motion.div>

          {/* Card 3: Skills Count */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl p-5 shadow-xl flex items-center gap-4 hover:shadow-2xl transition-all"
          >
            <div className="p-3.5 rounded-2xl bg-[#E6F2DD] text-[#659287]">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#5E7C72] uppercase tracking-wider">Skills Added</p>
              <h3 className="text-2xl font-extrabold text-[#2F4F46] mt-0.5">{profile.skills.length} / 15</h3>
            </div>
          </motion.div>

          {/* Card 4: Resume Status */}
          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl p-5 shadow-xl flex items-center gap-4 hover:shadow-2xl transition-all"
          >
            <div className={`p-3.5 rounded-2xl ${profile.resumeUrl ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#5E7C72] uppercase tracking-wider">Resume Status</p>
              <h3 className={`text-sm font-extrabold mt-1 uppercase ${profile.resumeUrl ? 'text-emerald-600' : 'text-rose-600'}`}>
                {profile.resumeUrl ? 'Uploaded' : 'Missing'}
              </h3>
            </div>
          </motion.div>
        </div>

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: 7/12 Width */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Personal Information Card */}
            <motion.div 
              whileHover={{ y: -4, scale: 1.005 }}
              className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-extrabold text-[#2F4F46] flex items-center gap-2">
                  <User className="w-5 h-5 text-[#659287]" /> Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#4A6A60] uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={profile.name} 
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-[#2F4F46] placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#659287]/20 focus:border-[#659287] text-sm"
                    placeholder="Nitharshana"
                    required
                  />
                </div>

                {/* Professional Title */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#4A6A60] uppercase tracking-wider">Professional Title</label>
                  <input 
                    type="text" 
                    name="professionalTitle" 
                    value={profile.professionalTitle} 
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-[#2F4F46] placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#659287]/20 focus:border-[#659287] text-sm"
                    placeholder="Full Stack Developer"
                  />
                </div>

                {/* Email (Read Only / Non-editable username representation) */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#4A6A60] uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={profile.email} 
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-100/50 text-gray-500 cursor-not-allowed text-sm"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#4A6A60] uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={profile.phone} 
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-[#2F4F46] placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#659287]/20 focus:border-[#659287] text-sm"
                    placeholder="9856742689"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-[#4A6A60] uppercase tracking-wider">Location</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={profile.location} 
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-[#2F4F46] placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#659287]/20 focus:border-[#659287] text-sm"
                    placeholder="Coimbatore, Tamil Nadu"
                  />
                </div>
              </div>
            </motion.div>

            {/* Professional Bio Card */}
            <motion.div 
              whileHover={{ y: -4, scale: 1.005 }}
              className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-extrabold text-[#2F4F46]">
                  Professional Bio
                </h3>
                <span className="text-xs text-[#5E7C72] font-semibold bg-[#E6F2DD] px-2 py-0.5 rounded-lg">
                  {profile.bio.length} / 1000 chars
                </span>
              </div>

              <textarea 
                name="bio"
                value={profile.bio} 
                onChange={handleChange}
                maxLength={1000}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-[#2F4F46] placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#659287]/20 focus:border-[#659287] text-sm"
                placeholder="I am a passionate..."
              />
              
              <div className="flex items-center justify-between text-xs text-[#5E7C72]">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Max 1000 characters
                </span>
                {hasChanges && (
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> Unsaved changes
                  </span>
                )}
              </div>
            </motion.div>

            {/* Skills Card */}
            <motion.div 
              whileHover={{ y: -4, scale: 1.005 }}
              className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-extrabold text-[#2F4F46]">
                  Skills Management
                </h3>
                <span className="text-xs text-[#5E7C72] font-semibold bg-[#E6F2DD] px-2 py-0.5 rounded-lg">
                  {profile.skills.length} / 15 Skills
                </span>
              </div>

              {/* Add Skill Field */}
              <form onSubmit={handleSkillAdd} className="flex gap-2">
                <input 
                  type="text" 
                  value={newSkill} 
                  onChange={e => setNewSkill(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-[#2F4F46] placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#659287]/20 focus:border-[#659287] text-sm"
                  placeholder="e.g. React, Python, UI Design"
                  disabled={profile.skills.length >= 15}
                />
                <button 
                  type="submit"
                  disabled={profile.skills.length >= 15 || !newSkill.trim()}
                  className="px-4 py-2 bg-[#659287] hover:bg-[#53786F] disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl text-sm font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>

              {/* Skills Chips Container */}
              {profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  <AnimatePresence>
                    {profile.skills.map((skill) => (
                      <motion.span 
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E6F2DD] hover:bg-[#d6eacc] text-[#2F4F46] text-xs font-bold rounded-full transition-colors group"
                      >
                        {skill}
                        <button 
                          type="button" 
                          onClick={() => handleSkillRemove(skill)}
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[#659287] group-hover:text-rose-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-2xl">
                  <Compass className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                  <p className="text-xs text-gray-500 font-medium">No skills added yet. Add skills to increase profile score.</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT COLUMN: 5/12 Width */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Resume Upload Card */}
            <motion.div 
              whileHover={{ y: -4, scale: 1.005 }}
              className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-xl p-6 space-y-4"
            >
              <h3 className="text-lg font-extrabold text-[#2F4F46] border-b border-gray-100 pb-3">
                Resume Document
              </h3>

              {profile.resumeUrl ? (
                /* Resume Info Display */
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-white rounded-xl border border-emerald-100 text-emerald-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#2F4F46] truncate">
                        {profile.resumeFileName || profile.resumeUrl.split('/').pop()}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                        <span>{formatBytes(profile.resumeFileSize)}</span>
                        {profile.resumeUploadedAt && (
                          <>
                            <span>•</span>
                            <span>{new Date(profile.resumeUploadedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={handlePreviewResume}
                      className="px-3 py-2 bg-white hover:bg-gray-50 text-[#2F4F46] border border-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    
                    <a 
                      href={getFullUrl(profile.resumeUrl)} 
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-white hover:bg-gray-50 text-[#2F4F46] border border-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>

                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isResumeUploading}
                      className="px-3 py-2 bg-white hover:bg-gray-50 text-[#659287] border border-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer col-span-2 sm:col-span-1"
                    >
                      Replace Resume
                    </button>

                    <button 
                      onClick={handleDeleteResume}
                      disabled={isResumeUploading}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer col-span-2 sm:col-span-1"
                    >
                      <Trash className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ) : (
                /* Drag and Drop Zone */
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragActive 
                      ? 'border-[#659287] bg-[#E6F2DD]/30' 
                      : 'border-gray-200 hover:border-[#659287] hover:bg-gray-50/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#2F4F46]">
                    Drag & Drop PDF Resume here
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Accepts PDF only (Max 5MB)
                  </p>
                </div>
              )}

              {/* Upload Progress Bar */}
              {isResumeUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold text-[#659287]">
                    <span>Uploading resume...</span>
                    <span>{resumeProgress}%</span>
                  </div>
                  <div className="w-full bg-[#E6F2DD] h-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#659287]" 
                      initial={{ width: 0 }}
                      animate={{ width: `${resumeProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Profile Checklist Card */}
            <motion.div 
              whileHover={{ y: -4, scale: 1.005 }}
              className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-xl p-6 space-y-4"
            >
              <h3 className="text-lg font-extrabold text-[#2F4F46] border-b border-gray-100 pb-3">
                Completion Checklist
              </h3>

              <div className="space-y-3">
                {[
                  { name: 'Profile Picture', checked: !!profile.profilePicture },
                  { name: 'Name', checked: !!profile.name.trim() },
                  { name: 'Email Address', checked: !!profile.email.trim() },
                  { name: 'Phone Number', checked: !!profile.phone.trim() },
                  { name: 'Location', checked: !!profile.location.trim() },
                  { name: 'Professional Bio', checked: !!profile.bio.trim() },
                  { name: 'Resume Uploaded', checked: !!profile.resumeUrl },
                  { name: 'Skills Added', checked: profile.skills.length > 0 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className={`font-semibold ${item.checked ? 'text-[#2F4F46]' : 'text-gray-400'}`}>
                      {item.name}
                    </span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      item.checked ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-300'
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Profile Visibility settings */}
            <motion.div 
              whileHover={{ y: -4, scale: 1.005 }}
              className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-xl p-6 space-y-4"
            >
              <h3 className="text-lg font-extrabold text-[#2F4F46] border-b border-gray-100 pb-3">
                Profile Visibility
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'public', label: 'Public', icon: Globe },
                  { value: 'recruiters', label: 'Recruiters Only', icon: Eye },
                  { value: 'private', label: 'Private', icon: Lock }
                ].map((item) => {
                  const Icon = item.icon;
                  const selected = profile.profileVisibility === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleVisibilityChange(item.value as any)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        selected 
                          ? 'border-[#659287] bg-[#E6F2DD]/30 text-[#2F4F46] font-bold shadow-sm' 
                          : 'border-gray-200 bg-white/40 hover:bg-gray-50/50 text-[#5E7C72]'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs leading-none">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Account Settings Card */}
            <motion.div 
              whileHover={{ y: -4, scale: 1.005 }}
              className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-xl p-6 space-y-3 text-sm"
            >
              <h3 className="text-lg font-extrabold text-[#2F4F46] border-b border-gray-100 pb-3">
                Account Settings
              </h3>
              
              <div className="flex justify-between font-semibold">
                <span className="text-gray-400">Account Created</span>
                <span className="text-[#2F4F46]">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between font-semibold">
                <span className="text-gray-400">Account Role</span>
                <span className="text-[#2F4F46] capitalize">{profile.role}</span>
              </div>
            </motion.div>

          </div>
        </div>

        {/* STICKY UNSAVED CHANGES BANNER */}
        <AnimatePresence>
          {hasChanges && (
            <motion.div 
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-6 left-6 right-6 md:left-80 right-8 z-40 bg-[#2F4F46]/95 backdrop-blur-md text-white px-6 py-4 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-[#B1D3B9] animate-pulse" />
                <div className="text-left">
                  <p className="text-sm font-extrabold text-white">Unsaved modifications</p>
                  <p className="text-xs text-[#B1D3B9]/90 font-medium">You have unsaved changes in your professional profile profile.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button 
                  onClick={handleReset}
                  disabled={saving}
                  className="px-4 py-2 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#659287] hover:bg-[#53786F] disabled:bg-gray-400 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-[#659287]/20 hover:shadow-[#659287]/45 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {saving ? (
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save Changes
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </motion.div>
    </>
  );
};

export default Profile;
