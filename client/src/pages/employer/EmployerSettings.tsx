import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Building,
  Shield,
  Bell,
  Sliders,
  Eye,
  Laptop,
  Calendar,
  Layers,
  Trash2,
  Lock,
  Globe,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  RefreshCw,
  LogOut,
  Download,
  AlertTriangle,
  Settings,
  HelpCircle,
  Save
} from "lucide-react";
import api from "../../services/api";
import HeroCard from "../../components/HeroCard";

interface NotificationPrefs {
  newApplications: boolean;
  interviewResponses: boolean;
  candidateMessages: boolean;
  jobExpiringSoon: boolean;
  weeklyHiringReport: boolean;
  marketingEmails: boolean;
}

interface PrivacySettingsData {
  profileVisibility: string;
  showRecruiterContact: boolean;
  allowPublicPage: boolean;
  showCompanyWebsite: boolean;
  allowSearchIndexing: boolean;
}

interface HiringPrefs {
  defaultJobType: string;
  defaultWorkMode: string;
  defaultHiringLocation: string;
  defaultSalaryCurrency: string;
  autoArchiveAfterDeadline: boolean;
  autoCloseFilled: boolean;
  requireResume: boolean;
  requireCoverLetter: boolean;
  enableQuickApply: boolean;
}

interface AppearanceSettings {
  theme: string;
  accentColor: string;
}

interface IntegrationSettings {
  googleCalendar: boolean;
  outlookCalendar: boolean;
  zoom: boolean;
  teams: boolean;
}

interface UserSession {
  id: string;
  device: string;
  browser: string;
  loginTime: string;
  lastActive: string;
  current: boolean;
  ip: string;
}

export default function EmployerSettings() {
  const [activeTab, setActiveTab] = useState<"account" | "security" | "preferences" | "integrations" | "danger">("account");
  const [loading, setLoading] = useState(true);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    recruiterName: "",
    companyEmail: "",
    phone: "",
    website: "",
    headquarters: "",
    recruiterPosition: "",
    recruiterEmail: "",
    recruiterPhone: ""
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [notifications, setNotifications] = useState<NotificationPrefs>({
    newApplications: true,
    interviewResponses: true,
    candidateMessages: true,
    jobExpiringSoon: true,
    weeklyHiringReport: true,
    marketingEmails: false
  });

  const [privacy, setPrivacy] = useState<PrivacySettingsData>({
    profileVisibility: "public",
    showRecruiterContact: true,
    allowPublicPage: true,
    showCompanyWebsite: true,
    allowSearchIndexing: true
  });

  const [hiringPrefs, setHiringPrefs] = useState<HiringPrefs>({
    defaultJobType: "Full-time",
    defaultWorkMode: "On-site",
    defaultHiringLocation: "",
    defaultSalaryCurrency: "USD",
    autoArchiveAfterDeadline: true,
    autoCloseFilled: true,
    requireResume: true,
    requireCoverLetter: false,
    enableQuickApply: true
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: "light",
    accentColor: "#659287"
  });

  const [integrations, setIntegrations] = useState<IntegrationSettings>({
    googleCalendar: false,
    outlookCalendar: false,
    zoom: false,
    teams: false
  });

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Danger Zone Confirmation Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/settings");
      const data = res.data;

      setProfileForm({
        name: data.name || "",
        recruiterName: data.recruiterName || "",
        companyEmail: data.companyEmail || data.email || "",
        phone: data.phone || "",
        website: data.website || "",
        headquarters: data.headquarters || data.location || "",
        recruiterPosition: data.recruiterPosition || "",
        recruiterEmail: data.recruiterEmail || "",
        recruiterPhone: data.recruiterPhone || ""
      });

      if (data.notifications) setNotifications(data.notifications);
      if (data.privacy) setPrivacy(data.privacy);
      if (data.hiringPreferences) setHiringPrefs(data.hiringPreferences);
      if (data.appearance) setAppearance(data.appearance);
      if (data.integrations) setIntegrations(data.integrations);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setSessionLoading(true);
      const res = await api.get("/user/settings/sessions");
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "integrations") {
      fetchSessions();
    }
  }, [activeTab]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast.error("Company Name is required");
    if (profileForm.companyEmail && !/\S+@\S+\.\S+/.test(profileForm.companyEmail)) {
      return toast.error("Invalid Company Email");
    }
    if (profileForm.website && !/^https?:\/\/\S+/.test(profileForm.website)) {
      return toast.error("Website must start with http:// or https://");
    }

    const loadId = toast.loading("Saving changes...");
    try {
      await api.patch("/user/settings/profile", profileForm);
      toast.success("Profile settings updated successfully!", { id: loadId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save profile settings", { id: loadId });
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityForm.currentPassword) return toast.error("Current password is required");
    if (securityForm.newPassword.length < 8) return toast.error("New password must be at least 8 characters");
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const loadId = toast.loading("Updating password...");
    try {
      await api.patch("/user/settings/change-password", {
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword
      });
      setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully!", { id: loadId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password", { id: loadId });
    }
  };

  const handleNotificationToggle = async (key: keyof NotificationPrefs) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      await api.patch("/user/settings/notifications", updated);
      toast.success("Notification preferences updated");
    } catch (err) {
      toast.error("Failed to save notification preferences");
    }
  };

  const handlePrivacyToggle = async (key: keyof PrivacySettingsData, val?: any) => {
    const updated = {
      ...privacy,
      [key]: val !== undefined ? val : !privacy[key as keyof PrivacySettingsData]
    };
    setPrivacy(updated as PrivacySettingsData);
    try {
      await api.patch("/user/settings/privacy", updated);
      toast.success("Privacy settings updated");
    } catch (err) {
      toast.error("Failed to save privacy settings");
    }
  };

  const handleHiringPrefsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadId = toast.loading("Saving preferences...");
    try {
      await api.patch("/user/settings/hiring-preferences", hiringPrefs);
      toast.success("Hiring preferences updated successfully!", { id: loadId });
    } catch (err) {
      toast.error("Failed to update preferences", { id: loadId });
    }
  };

  const handleThemeChange = async (themeName: string) => {
    const updated = { ...appearance, theme: themeName };
    setAppearance(updated);
    
    // Apply immediate local style changes
    if (themeName === "dark") {
      document.documentElement.classList.add("dark");
    } else if (themeName === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    }

    try {
      await api.patch("/user/settings/appearance", updated);
      toast.success(`Theme set to ${themeName}`);
    } catch (err) {
      toast.error("Failed to save theme settings");
    }
  };

  const handleIntegrationToggle = async (key: keyof IntegrationSettings) => {
    const updated = { ...integrations, [key]: !integrations[key] };
    setIntegrations(updated);
    try {
      await api.patch("/user/settings/integrations", updated);
      toast.success(updated[key] ? "Integration connected!" : "Integration disconnected");
    } catch (err) {
      toast.error("Failed to update integration state");
    }
  };

  const handleLogoutOtherDevices = async () => {
    const loadId = toast.loading("Invalidating sessions...");
    try {
      await api.post("/user/settings/logout-all");
      toast.success("Successfully logged out from all other devices!", { id: loadId });
      fetchSessions();
    } catch (err) {
      toast.error("Failed to invalidate sessions", { id: loadId });
    }
  };

  const handleExport = async (type: "profile" | "jobs" | "applicants") => {
    const loadId = toast.loading(`Generating ${type} report...`);
    try {
      const response = await api.get(`/user/settings/export/${type}`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `workwave_${type}_export.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Download started!", { id: loadId });
    } catch (err) {
      toast.error("Failed to export data", { id: loadId });
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmPassword) return toast.error("Please enter your password to confirm deletion");
    setIsDeleting(true);
    const loadId = toast.loading("Deleting account...");
    try {
      // For verification, we can send confirmation password to delete endpoint if required,
      // here we do request verification
      await api.delete("/user/settings/account", {
        data: { password: deleteConfirmPassword }
      });
      toast.success("Account deleted permanently.", { id: loadId });
      localStorage.clear();
      window.location.href = "/login";
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Incorrect confirmation password", { id: loadId });
      setIsDeleting(false);
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

  return (
    <div className="space-y-6 pb-12">
      <HeroCard
        badgeText="Recruiter Panel"
        title="Settings & Configurations"
        description="Configure your recruiter details, defaults for job postings, integrations, data reports, and account policies."
        IconComponent={Settings}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: "account", label: "Account Info", icon: Building },
            { id: "security", label: "Security & Login", icon: Shield },
            { id: "preferences", label: "Preferences & Privacy", icon: Sliders },
            { id: "integrations", label: "Integrations & Reports", icon: Globe },
            { id: "danger", label: "Danger Zone", icon: Trash2, danger: true }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left cursor-pointer border ${
                  isActive
                    ? tab.danger
                      ? "bg-rose-50 border-rose-100 text-rose-700 shadow-sm"
                      : "bg-[#659287] border-[#659287] text-white shadow-sm"
                    : tab.danger
                    ? "bg-white border-transparent text-rose-600 hover:bg-rose-50"
                    : "bg-white border-transparent text-[#5E7C72] hover:bg-[#E6F2DD]/60 hover:text-[#659287]"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Area */}
        <div className="lg:col-span-3">
          
          <AnimatePresence mode="wait">
            {activeTab === "account" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-sm space-y-6"
              >
                <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2 text-[#2F4F46]">
                  <Building className="w-5 h-5 text-[#659287]" /> Account & Company Settings
                </h3>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold">
                    <div>
                      <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Company Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Company Website</label>
                      <input
                        type="text"
                        value={profileForm.website}
                        onChange={(e) => setProfileForm(p => ({ ...p, website: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                        placeholder="e.g. https://company.com"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Official Company Email</label>
                      <input
                        type="email"
                        value={profileForm.companyEmail}
                        onChange={(e) => setProfileForm(p => ({ ...p, companyEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                        placeholder="contact@company.com"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                        placeholder="Office phone"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Company Address / Headquarters</label>
                      <input
                        type="text"
                        value={profileForm.headquarters}
                        onChange={(e) => setProfileForm(p => ({ ...p, headquarters: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                        placeholder="Full company address"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-[#2F4F46] mb-3">Primary Recruiter Contact Info</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold">
                      <div>
                        <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Recruiter Name</label>
                        <input
                          type="text"
                          value={profileForm.recruiterName}
                          onChange={(e) => setProfileForm(p => ({ ...p, recruiterName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                          placeholder="Recruiter name"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Designation</label>
                        <input
                          type="text"
                          value={profileForm.recruiterPosition}
                          onChange={(e) => setProfileForm(p => ({ ...p, recruiterPosition: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                          placeholder="Position e.g. HR Manager"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Recruiter Email</label>
                        <input
                          type="email"
                          value={profileForm.recruiterEmail}
                          onChange={(e) => setProfileForm(p => ({ ...p, recruiterEmail: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                          placeholder="recruiter@company.com"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Recruiter Phone</label>
                        <input
                          type="text"
                          value={profileForm.recruiterPhone}
                          onChange={(e) => setProfileForm(p => ({ ...p, recruiterPhone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                          placeholder="Recruiter phone"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#659287] hover:bg-[#53786F] text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Save className="w-4.5 h-4.5" /> Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-sm space-y-6"
              >
                <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2 text-[#2F4F46]">
                  <Shield className="w-5 h-5 text-[#659287]" /> Security & Change Password
                </h3>

                <form onSubmit={handleSecuritySubmit} className="space-y-4 max-w-lg text-sm font-semibold">
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Current Password</label>
                    <input
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm(s => ({ ...s, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                      placeholder="Verify old password"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">New Password</label>
                    <input
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(e) => setSecurityForm(s => ({ ...s, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                      placeholder="Must be at least 8 characters"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(e) => setSecurityForm(s => ({ ...s, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#659287] hover:bg-[#53786F] text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Lock className="w-4.5 h-4.5" /> Change Password
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "preferences" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* 1. Notification Preferences */}
                <div className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2 text-[#2F4F46]">
                    <Bell className="w-5 h-5 text-[#659287]" /> Notification Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: "newApplications", label: "New Applications", desc: "Receive immediate emails for new job submissions" },
                      { key: "interviewResponses", label: "Interview Responses", desc: "Notify when candidates accept or reschedule interview slots" },
                      { key: "candidateMessages", label: "Candidate Messages", desc: "Get notifications for direct messages from candidates" },
                      { key: "jobExpiringSoon", label: "Job Expiring Soon", desc: "Warning when active job postings approach their deadlines" },
                      { key: "weeklyHiringReport", label: "Weekly Hiring Report", desc: "Receive a compiled summary analytics report on Mondays" },
                      { key: "marketingEmails", label: "Marketing & Updates", desc: "Receive newsletters and system platform update details" }
                    ].map((pref) => (
                      <div key={pref.key} className="flex items-start justify-between p-3.5 bg-[#F8FAF8] border border-gray-100 rounded-2xl">
                        <div className="max-w-[80%]">
                          <p className="text-xs font-extrabold text-[#2F4F46]">{pref.label}</p>
                          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{pref.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications[pref.key as keyof NotificationPrefs]}
                          onChange={() => handleNotificationToggle(pref.key as keyof NotificationPrefs)}
                          className="w-4 h-4 rounded text-[#659287] focus:ring-[#659287] cursor-pointer mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Hiring Preferences */}
                <div className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2 text-[#2F4F46]">
                    <Sliders className="w-5 h-5 text-[#659287]" /> Default Posting Preferences
                  </h3>
                  
                  <form onSubmit={handleHiringPrefsSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-semibold">
                      <div>
                        <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Default Job Type</label>
                        <select
                          value={hiringPrefs.defaultJobType}
                          onChange={(e) => setHiringPrefs(h => ({ ...h, defaultJobType: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                        >
                          <option>Full-time</option>
                          <option>Part-time</option>
                          <option>Contract</option>
                          <option>Internship</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Default Work Mode</label>
                        <select
                          value={hiringPrefs.defaultWorkMode}
                          onChange={(e) => setHiringPrefs(h => ({ ...h, defaultWorkMode: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                        >
                          <option>On-site</option>
                          <option>Hybrid</option>
                          <option>Remote</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Default Location</label>
                        <input
                          type="text"
                          value={hiringPrefs.defaultHiringLocation}
                          onChange={(e) => setHiringPrefs(h => ({ ...h, defaultHiringLocation: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                          placeholder="e.g. San Francisco, CA"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Default Salary Currency</label>
                        <input
                          type="text"
                          value={hiringPrefs.defaultSalaryCurrency}
                          onChange={(e) => setHiringPrefs(h => ({ ...h, defaultSalaryCurrency: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20"
                          placeholder="e.g. USD, EUR"
                        />
                      </div>
                    </div>

                    <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold text-[#2F4F46]">
                      {[
                        { key: "autoArchiveAfterDeadline", label: "Auto Archive Jobs After Deadline" },
                        { key: "autoCloseFilled", label: "Automatically Close Filled Positions" },
                        { key: "requireResume", label: "Require Resume (Candidate Application)" },
                        { key: "requireCoverLetter", label: "Require Cover Letter Option" },
                        { key: "enableQuickApply", label: "Enable Quick Apply Mode" }
                      ].map((pref) => (
                        <label key={pref.key} className="flex items-center gap-2 p-2.5 bg-[#F8FAF8] border border-gray-50 rounded-xl cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hiringPrefs[pref.key as keyof HiringPrefs] as boolean}
                            onChange={(e) => setHiringPrefs(h => ({ ...h, [pref.key]: e.target.checked }))}
                            className="rounded text-[#659287] focus:ring-[#659287] cursor-pointer"
                          />
                          <span>{pref.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#659287] hover:bg-[#53786F] text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Save className="w-4.5 h-4.5" /> Save Hiring Defaults
                      </button>
                    </div>
                  </form>
                </div>

                {/* 3. Privacy Settings */}
                <div className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2 text-[#2F4F46]">
                    <Eye className="w-5 h-5 text-[#659287]" /> Privacy & Visibility Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-xs text-gray-500 uppercase mb-1">Company Profile Visibility</label>
                      <select
                        value={privacy.profileVisibility}
                        onChange={(e) => handlePrivacyToggle("profileVisibility", e.target.value)}
                        className="max-w-xs w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659287]/20 text-sm font-semibold"
                      >
                        <option value="public">Public (Visible to everyone)</option>
                        <option value="recruiters">Candidates & Recruiters only</option>
                        <option value="private">Private (Hidden from directory)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold text-[#2F4F46]">
                      {[
                        { key: "showRecruiterContact", label: "Show Recruiter Contact Details on Job Postings" },
                        { key: "allowPublicPage", label: "Allow Public Company Page Access" },
                        { key: "showCompanyWebsite", label: "Show Company Website Publicly" },
                        { key: "allowSearchIndexing", label: "Allow Search Engines to Index Company Page" }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 p-2.5 bg-[#F8FAF8] border border-gray-50 rounded-xl cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacy[item.key as keyof PrivacySettingsData] as boolean}
                            onChange={() => handlePrivacyToggle(item.key as keyof PrivacySettingsData)}
                            className="rounded text-[#659287] focus:ring-[#659287] cursor-pointer"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "integrations" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Integrations Grid */}
                <div className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2 text-[#2F4F46]">
                    <Calendar className="w-5 h-5 text-[#659287]" /> Recruiter & Calendar Integrations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: "googleCalendar", name: "Google Calendar", desc: "Sync scheduled interviews to Google Calendar" },
                      { key: "outlookCalendar", name: "Microsoft Outlook", desc: "Sync recruiter deadlines to Outlook Calendar" },
                      { key: "zoom", name: "Zoom Meetings", desc: "Generate automatic Zoom interview meeting links" },
                      { key: "teams", name: "Microsoft Teams", desc: "Enable remote video interviews via Microsoft Teams" }
                    ].map((integ) => {
                      const isConnected = integrations[integ.key as keyof IntegrationSettings];
                      return (
                        <div key={integ.key} className="p-4 bg-[#F8FAF8] border border-gray-100 rounded-2xl flex items-center justify-between">
                          <div>
                            <p className="text-sm font-extrabold text-[#2F4F46]">{integ.name}</p>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{integ.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleIntegrationToggle(integ.key as keyof IntegrationSettings)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isConnected
                                ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                : "bg-white border border-gray-250 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {isConnected ? "Connected" : "Connect"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Session Management */}
                <div className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-[#2F4F46]">
                      <Laptop className="w-5 h-5 text-[#659287]" /> Session Management
                    </h3>
                    <button
                      onClick={handleLogoutOtherDevices}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout Other Devices
                    </button>
                  </div>

                  {sessionLoading ? (
                    <div className="flex items-center justify-center py-6 text-gray-400 text-xs font-bold gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Loading active sessions...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((sess) => (
                        <div key={sess.id} className="p-3.5 bg-[#F8FAF8] border border-gray-100 rounded-2xl flex items-center justify-between text-xs font-semibold">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[#2F4F46]">{sess.device}</span>
                              {sess.current && (
                                <span className="px-2 py-0.25 rounded-full text-[9px] font-bold bg-[#E6F2DD] text-[#2F4F46] border border-[#B1D3B9]">
                                  Current Session
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                              {sess.browser} • IP: {sess.ip} • Active: {new Date(sess.lastActive).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Data Exports */}
                <div className="bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold border-b border-gray-100 pb-3 flex items-center gap-2 text-[#2F4F46]">
                    <Layers className="w-5 h-5 text-[#659287]" /> Data Management & Reports
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { type: "profile", label: "Export Profile", desc: "Download company details JSON record" },
                      { type: "jobs", label: "Export Listings", desc: "Download job posts history database" },
                      { type: "applicants", label: "Export Applicants", desc: "Download application log record details" }
                    ].map((exp) => (
                      <button
                        key={exp.type}
                        type="button"
                        onClick={() => handleExport(exp.type as any)}
                        className="p-4 bg-[#F8FAF8] border border-gray-100 hover:border-[#659287] rounded-2xl text-left transition-all cursor-pointer group"
                      >
                        <Download className="w-5 h-5 text-[#659287] group-hover:scale-110 transition-all mb-2" />
                        <p className="text-xs font-extrabold text-[#2F4F46]">{exp.label}</p>
                        <p className="text-[9px] text-gray-400 font-medium mt-0.5 leading-normal">{exp.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "danger" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-rose-50/40 border border-rose-100 rounded-3xl p-6 shadow-sm space-y-6"
              >
                <h3 className="text-lg font-bold border-b border-rose-100 pb-3 flex items-center gap-2 text-rose-800">
                  <AlertTriangle className="w-5 h-5 text-rose-600" /> Account Danger Zone
                </h3>

                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm font-semibold text-rose-900 flex gap-3 items-start">
                  <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-rose-800">Warning: Destructive Actions</h4>
                    <p className="text-xs leading-normal mt-1 opacity-90">
                      Archiving or deleting your company account will permanently remove all active job listings, recruiter configurations, and applicant history. There is no undo.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                    }}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-rose-600/10"
                  >
                    <Trash2 className="w-4.5 h-4.5" /> Permanently Delete Account
                  </button>
                </div>

                {/* Account Deletion Confirmation Modal */}
                {showDeleteModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md bg-white border border-[#E6F2DD] rounded-3xl p-6 shadow-2xl space-y-6">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-bold text-rose-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-5 h-5 text-rose-600" /> Confirm Deletion
                        </h4>
                        <button
                          onClick={() => setShowDeleteModal(false)}
                          className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="text-xs font-semibold text-[#4A6A60] leading-normal space-y-2">
                        <p>Are you absolutely sure you want to delete your company profile account?</p>
                        <p className="text-rose-700 font-extrabold">All company data, database records, and jobs created will be deleted permanently.</p>
                        <p>To confirm, please type your account password below:</p>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Confirm Password</label>
                        <input
                          type="password"
                          value={deleteConfirmPassword}
                          onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-sm font-semibold"
                          placeholder="Enter account password"
                        />
                      </div>

                      <div className="flex gap-3 justify-end pt-2">
                        <button
                          onClick={() => setShowDeleteModal(false)}
                          className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
