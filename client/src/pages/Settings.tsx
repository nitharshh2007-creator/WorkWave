import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Lock,
  Bell,
  Shield,
  FileText,
  Trash2,
  LogOut,
  AlertTriangle,
  Save,
  X,
  Loader2,
  UploadCloud,
  Download,
  Eye,
  EyeOff,
  Edit,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';

// --- TYPES ---

interface UserSettings {
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  graduationYear: number | string;
  notifications: {
    newJobAlerts: boolean;
    applicationStatusUpdates: boolean;
    interviewNotifications: boolean;
    marketingEmails: boolean;
    weeklyCareerDigest: boolean;
  };
  privacy: {
    profileVisibleToRecruiters: boolean;
    showContactInformation: boolean;
    allowResumeDownloads: boolean;
  };
  resume: {
    fileName: string;
    url: string;
    uploadedAt: string;
  };
  security: {
    lastLogin: string;
    accountCreated: string;
  };
}

// --- HELPER & REUSABLE COMPONENTS ---

const SettingsCard: React.FC<{ title: string; description: string; children: React.ReactNode; className?: string }> = ({ title, description, children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className={`bg-white border border-[#E6F2DD] rounded-3xl shadow-sm hover:shadow-md transition-shadow ${className}`}
  >
    <div className="p-6 border-b border-[#E6F2DD]">
      <h3 className="text-lg font-bold text-[#2F4F46]">{title}</h3>
      <p className="mt-1 text-sm text-[#4A6A60]">{description}</p>
    </div>
    <div className="p-6">
      {children}
    </div>
  </motion.div>
);

const InputField = ({ label, name, value, onChange, disabled = false, type = 'text', placeholder = '' }) => (
  <div>
    <label className="block text-xs font-bold text-[#4A6A60] uppercase tracking-wider mb-1.5">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-[#2F4F46] placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#659287]/20 focus:border-[#659287] disabled:cursor-not-allowed disabled:bg-gray-100/80 disabled:text-gray-500"
    />
  </div>
);

const PasswordInputField = ({ label, name, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-bold text-[#4A6A60] uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-200 bg-gray-50/50 text-[#2F4F46] placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#659287]/20 focus:border-[#659287]"
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-[#2F4F46]">
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

const SettingsToggle = ({ label, description, checked, onToggle }) => (
  <div className="flex items-start justify-between">
    <div className="pr-4">
      <p className="font-semibold text-[#2F4F46]">{label}</p>
      <p className="text-sm text-[#4A6A60]">{description}</p>
    </div>
    <motion.div
      className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-[#659287]' : 'bg-gray-200'}`}
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full shadow-md"
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        initial={false}
        animate={{ x: checked ? '100%' : '0%' }}
      />
    </motion.div>
  </div>
);

const SettingsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white/80 border border-[#E6F2DD] rounded-3xl">
        <div className="p-6 border-b border-[#E6F2DD]">
          <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded mt-2"></div>
        </div>
        <div className="p-6 space-y-4">
          <div className="h-10 bg-gray-200 rounded-xl"></div>
          <div className="h-10 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    ))}
  </div>
);

// --- SECTION COMPONENTS ---

const AccountSettings = ({ initialData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData.name,
    phone: initialData.phone,
    college: initialData.college,
    department: initialData.department,
    graduationYear: initialData.graduationYear,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      name: initialData.name,
      phone: initialData.phone,
      college: initialData.college,
      department: initialData.department,
      graduationYear: initialData.graduationYear,
    });
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch('/user/settings/profile', formData);
      toast.success('Account details updated!');
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: initialData.name,
      phone: initialData.phone,
      college: initialData.college,
      department: initialData.department,
      graduationYear: initialData.graduationYear,
    });
    setIsEditing(false);
  };

  return (
    <SettingsCard title="Account Settings" description="Manage your personal and academic information.">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} />
          <InputField label="Email Address" name="email" value={initialData.email} onChange={() => {}} disabled />
          <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} />
          <InputField label="College/University" name="college" value={formData.college} onChange={handleChange} disabled={!isEditing} />
          <InputField label="Department" name="department" value={formData.department} onChange={handleChange} disabled={!isEditing} />
          <InputField label="Graduation Year" name="graduationYear" type="number" value={String(formData.graduationYear ?? '')} onChange={handleChange} disabled={!isEditing} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          {isEditing ? (
            <>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleCancel} className="px-5 py-2.5 rounded-xl border border-[#B1D3B9] text-[#2F4F46] font-semibold hover:bg-[#E6F2DD] transition-colors">
                Cancel
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 rounded-xl bg-[#659287] text-white font-semibold hover:bg-[#53786F] transition-colors flex items-center gap-2 disabled:opacity-50">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </motion.button>
            </>
          ) : (
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsEditing(true)} className="px-5 py-2.5 rounded-xl bg-[#659287] text-white font-semibold hover:bg-[#53786F] transition-colors flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </motion.button>
          )}
        </div>
      </div>
    </SettingsCard>
  );
};

const ChangePassword = () => {
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error('New passwords do not match.');
      return;
    }
    setIsSaving(true);
    try {
      await api.patch('/user/settings/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      toast.success('Password changed successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsCard title="Change Password" description="For your security, we recommend choosing a strong password that you don't use elsewhere.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInputField label="Current Password" name="current" value={passwords.current} onChange={handleChange} />
        <PasswordInputField label="New Password" name="newPass" value={passwords.newPass} onChange={handleChange} />
        <PasswordInputField label="Confirm New Password" name="confirm" value={passwords.confirm} onChange={handleChange} />
        <div className="flex justify-end pt-2">
          <motion.button type="submit" whileTap={{ scale: 0.95 }} disabled={isSaving} className="px-5 py-2.5 rounded-xl bg-[#659287] text-white font-semibold hover:bg-[#53786F] transition-colors flex items-center gap-2 disabled:opacity-50">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Password
          </motion.button>
        </div>
      </form>
    </SettingsCard>
  );
};

interface ToggleSettingsItem {
  key: string;
  label: string;
  description: string;
}

interface ToggleSettingsProps {
  title: string;
  description: string;
  config: ToggleSettingsItem[];
  initialData: Record<string, boolean>;
  apiEndpoint: string;
  onUpdate: () => void;
}

const ToggleSettings: React.FC<ToggleSettingsProps> = ({ title, description, config, initialData, apiEndpoint, onUpdate }) => {
    const [settings, setSettings] = useState<Record<string, boolean>>(initialData || {});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Sync state when initialData prop changes from undefined to a real value
        setSettings(initialData || {});
    }, [initialData]);

    const handleToggle = (key: string) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.patch(`/user/settings${apiEndpoint.substring(5)}`, settings);
            toast.success('Preferences saved!');
            onUpdate();
        } catch (error) {
            toast.error('Failed to save preferences.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SettingsCard title={title} description={description}>
            <div className="space-y-6">
                {config.map(item => (
                    <SettingsToggle
                        key={item.key}
                        label={item.label}
                        description={item.description}
                        checked={settings[item.key]}
                        onToggle={() => handleToggle(item.key)}
                    />
                ))}
            </div>
            <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 rounded-xl bg-[#659287] text-white font-semibold hover:bg-[#53786F] transition-colors flex items-center gap-2 disabled:opacity-50">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Preferences
                </motion.button>
            </div>
        </SettingsCard>
    );
};

const notificationConfig = [
    { key: 'newJobAlerts', label: 'New Job Alerts', description: 'Get notified when new jobs match your profile.' },
    { key: 'applicationStatusUpdates', label: 'Application Status Updates', description: 'Receive updates on your job applications.' },
    { key: 'interviewNotifications', label: 'Interview Notifications', description: 'Get reminders for your scheduled interviews.' },
    { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive promotional content and special offers.' },
    { key: 'weeklyCareerDigest', label: 'Weekly Career Digest', description: 'A weekly roundup of top jobs and career advice.' },
];

const privacyConfig = [
    { key: 'profileVisibleToRecruiters', label: 'Profile Visible To Recruiters', description: 'Allow recruiters to find and view your profile.' },
    { key: 'showContactInformation', label: 'Show Contact Information', description: 'Allow recruiters to see your email and phone number.' },
    { key: 'allowResumeDownloads', label: 'Allow Resume Downloads', description: 'Let recruiters download your resume directly.' },
];

const NotificationSettings = ({ initialData, onUpdate }) => (
    <ToggleSettings
        title="Notification Preferences"
        description="Choose how you want to be notified."
        config={notificationConfig}
        initialData={initialData}
        apiEndpoint="/settings/notifications"
        onUpdate={onUpdate}
    />
);

const PrivacySettings = ({ initialData, onUpdate }) => (
    <ToggleSettings
        title="Privacy Settings"
        description="Control how your information is shared on WorkWave."
        config={privacyConfig}
        initialData={initialData}
        apiEndpoint="/settings/privacy"
        onUpdate={onUpdate}
    />
);

const ResumeManagement = ({ initialData, onUpdate }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append('resume', file);

        setIsUploading(true);
        const toastId = toast.loading('Uploading resume...');
        try {
            await api.post('/user/settings/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Resume uploaded successfully!', { id: toastId });
            onUpdate();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Resume upload failed.', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    }, [onUpdate]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: false,
    });

    const handleRemove = async () => {
        setIsRemoving(true);
        setShowRemoveModal(false);
        try {
            await api.delete('/user/settings/resume');
            toast.success('Resume removed.');
            onUpdate();
        } catch (error) {
            toast.error('Failed to remove resume.');
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <>
            <SettingsCard title="Resume Management" description="Keep your resume up-to-date to impress recruiters.">
                <div className="space-y-4">
                    <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors ${isDragActive ? 'border-[#659287] bg-[#E6F2DD]/50' : 'border-gray-300 hover:border-[#659287]'}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                        {isUploading ? (
                            <p className="text-[#4A6A60]">Uploading...</p>
                        ) : isDragActive ? (
                            <p className="text-[#2F4F46] font-semibold">Drop the file here ...</p>
                        ) : (
                            <p className="text-[#4A6A60]">Drag & drop a new PDF resume here, or click to select file (Max 5MB)</p>
                        )}
                    </div>
                    {initialData && initialData.fileName && (
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-[#659287]" />
                                <div>
                                    <p className="font-bold text-[#2F4F46]">{initialData.fileName}</p>
                                    <p className="text-xs text-gray-500">Uploaded on {new Date(initialData.uploadedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a href={initialData.url} target="_blank" rel="noopener noreferrer" download className="p-2 text-gray-500 hover:text-[#2F4F46] transition-colors">
                                    <Download className="w-5 h-5" />
                                </a>
                                <button onClick={() => setShowRemoveModal(true)} className="p-2 text-red-500 hover:text-red-700 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </SettingsCard>
            <ConfirmationModal
                isOpen={showRemoveModal}
                onConfirm={handleRemove}
                onCancel={() => setShowRemoveModal(false)}
                title="Remove Resume"
                message="Are you sure you want to remove your resume? This action cannot be undone."
            />
        </>
    );
};

const AccountSecurity = ({ securityData }) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    if (!securityData) {
        return null;
    }

    const handleLogoutAll = async () => {
        setIsLoggingOut(true);
        setShowLogoutModal(false);
        try {
            await api.post('/user/settings/logout-all');
            toast.success('Successfully logged out from all other devices.');
        } catch (error) {
            toast.error('Failed to log out from other devices.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <>
            <SettingsCard title="Account Security" description="Review your account's security settings and recent activity.">
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-[#4A6A60]">Last Login</span>
                        <span className="font-bold text-[#2F4F46]">{new Date(securityData.lastLogin).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-[#4A6A60]">Account Created</span>
                        <span className="font-bold text-[#2F4F46]">{new Date(securityData.accountCreated).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowLogoutModal(true)} disabled={isLoggingOut} className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50">
                        {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                        Logout All Other Devices
                    </motion.button>
                </div>
            </SettingsCard>
            <ConfirmationModal
                isOpen={showLogoutModal}
                onConfirm={handleLogoutAll}
                onCancel={() => setShowLogoutModal(false)}
                title="Logout All Devices"
                message="This will log you out from all other active sessions on other browsers and devices."
            />
        </>
    );
};

const DangerZone = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const navigate = useNavigate();
    const CONFIRMATION_STRING = 'DELETE MY ACCOUNT';

    const handleDelete = async () => {
        if (confirmText !== CONFIRMATION_STRING) return;
        try {
            await api.delete('/user/settings/account');
            toast.success('Account deleted successfully. Redirecting...');
            localStorage.clear();
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            toast.error('Failed to delete account.');
        } finally {
            setIsModalOpen(false);
        }
    };

    return (
        <>
            <SettingsCard title="Danger Zone" description="These actions are permanent and cannot be undone." className="border-red-500/50">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold text-red-700">Delete Your Account</p>
                        <p className="text-sm text-red-600/80">Permanently delete your account and all associated data.</p>
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                    </motion.button>
                </div>
            </SettingsCard>
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-auto space-y-6 border border-red-200"
                        >
                            <div className="text-center">
                                <AlertTriangle className="w-12 h-12 mx-auto text-red-500" />
                                <h3 className="mt-4 text-2xl font-bold text-red-800">Delete Account</h3>
                                <p className="mt-2 text-[#4A6A60]">This action is irreversible. All your data including profile, applications, and saved jobs will be permanently deleted.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#4A6A60]">To confirm, please type "<strong className="text-red-600">{CONFIRMATION_STRING}</strong>" below:</label>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-50/50 text-[#2F4F46] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                />
                            </div>
                            <div className="flex justify-center gap-4">
                                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-[#B1D3B9] bg-white text-[#2F4F46] font-semibold hover:bg-[#E6F2DD] transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={confirmText !== CONFIRMATION_STRING}
                                    className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
                                >
                                    Delete My Account
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

interface ConfirmationModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
}
  
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onConfirm, onCancel, title, message }) => {
    if (!isOpen) return null;
  
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-[420px] w-full mx-auto space-y-6 border border-[#E6F2DD]"
        >
          <h3 className="text-2xl font-bold text-[#2F4F46] text-center">{title}</h3>
          <p className="text-[#4A6A60] text-center">{message}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-xl border border-[#B1D3B9] bg-white text-[#2F4F46] font-semibold hover:bg-[#E6F2DD] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
};

// --- MAIN SETTINGS PAGE ---

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Account');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { name: 'Account', icon: User },
    { name: 'Security', icon: Lock },
    { name: 'Notifications', icon: Bell },
    { name: 'Privacy', icon: Shield },
    { name: 'Resume', icon: FileText },
    { name: 'Danger Zone', icon: AlertTriangle },
  ];

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/user/settings');
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const renderContent = () => {
    if (loading || !settings) {
      return <SettingsSkeleton />;
    }
    switch (activeTab) {
      case 'Account':
        return <AccountSettings initialData={settings} onUpdate={fetchSettings} />;
      case 'Security':
        return (
            <div className="space-y-6">
                <ChangePassword />
                <AccountSecurity securityData={settings.security} />
            </div>
        );
      case 'Notifications':
        return <NotificationSettings initialData={settings.notifications} onUpdate={fetchSettings} />;
      case 'Privacy':
        return <PrivacySettings initialData={settings.privacy} onUpdate={fetchSettings} />;
      case 'Resume':
        return <ResumeManagement initialData={settings.resume} onUpdate={fetchSettings} />;
      case 'Danger Zone':
        return <DangerZone />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 lg:px-8 space-y-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8"
        >
          <h1
  style={{
    color: "#2F4F46",
    opacity: 1,
    fontWeight: 800,
    fontSize: "3rem",
    letterSpacing: "-0.02em",
    lineHeight: "1.1",
  }}
>
  Settings
</h1>
          <p className="mt-2 text-lg text-[#4A6A60]">
            Manage your WorkWave account, security and preferences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tabs Navigation */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24">
            <nav className="space-y-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === tab.name
                      ? 'bg-[#659287] text-white shadow-md'
                      : 'text-[#4A6A60] hover:bg-[#E6F2DD] hover:text-[#2F4F46]'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.name && tab.name === 'Danger Zone' ? 'text-white' : tab.name === 'Danger Zone' ? 'text-red-500' : ''}`} />
                  <span className="font-semibold">{tab.name}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
    </div>
  );
};

export default Settings;