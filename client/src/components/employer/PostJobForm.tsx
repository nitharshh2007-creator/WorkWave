import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Building2,
  BriefcaseBusiness,
  MapPin,
  Award,
  FileText,
  CheckCircle2,
  Gift,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { motion } from "framer-motion";

import { createJob, updateJob } from "../../services/jobService";
import FormSection from "./FormSection";
import EmployerInput from "./EmployerInput";
import EmployerTextarea from "./EmployerTextarea";
import EmployerSelect from "./EmployerSelect";
import SkillInput from "./SkillInput";
import SalaryCard from "./SalaryCard";
import ProgressCard from "./ProgressCard";
import PostJobSidebar from "./PostJobSidebar";

import type { FormFields } from "../../types/jobForm";

const initialState: FormFields = {
  title: "",
  company: "",
  location: "",
  jobType: "Full Time",
  salaryMin: "",
  salaryMax: "",
  experience: "",
  skills: [],
  description: "",
  requirements: "",
  benefits: "",
  deadline: "",
};

export const jobTypeOptions = ["Full Time", "Part Time", "Internship", "Contract", "Remote"];

interface PostJobFormProps {
  editMode?: boolean;
  jobData?: any;
  jobId?: string;
}

const PostJobForm: React.FC<PostJobFormProps> = ({ editMode = false, jobData, jobId }) => {
  const [form, setForm] = useState<FormFields>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Pre-populate form when in edit mode
  useEffect(() => {
    if (editMode && jobData) {
      const deadlineStr = jobData.deadline
        ? new Date(jobData.deadline).toISOString().split("T")[0]
        : "";
      setForm({
        title: jobData.title || "",
        company: jobData.company || "",
        location: jobData.location || "",
        jobType: jobData.jobType || "Full Time",
        salaryMin: jobData.salary?.min?.toString() || "",
        salaryMax: jobData.salary?.max?.toString() || "",
        experience: jobData.experience || "",
        skills: jobData.skills || [],
        description: jobData.description || "",
        requirements: jobData.requirements || "",
        benefits: jobData.benefits || "",
        deadline: deadlineStr,
      });
    }
  }, [editMode, jobData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSkillsChange = (skills: string[]) => {
    setForm((prev) => ({ ...prev, skills }));
    if (errors.skills) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.skills;
        return next;
      });
    }
  };

  const handleSalaryChange = (type: "Min" | "Max", val: string) => {
    const field = type === "Min" ? "salaryMin" : "salaryMax";
    setForm((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.salaryMin;
      delete next.salaryMax;
      return next;
    });
  };

  // Checklist items & Completion tracking
  const checklistItems = useMemo(() => {
    return [
      { id: "title", label: "Job Title", filled: !!form.title.trim() },
      { id: "company", label: "Company Name", filled: !!form.company.trim() },
      { id: "location", label: "Location", filled: !!form.location.trim() },
      { id: "jobType", label: "Job Type", filled: !!form.jobType.trim() },
      { id: "experience", label: "Experience", filled: !!form.experience.trim() },
      { id: "salary", label: "Salary Range", filled: !!form.salaryMin.trim() && !!form.salaryMax.trim() },
      { id: "skills", label: "Skills Chips", filled: form.skills.length > 0 },
      { id: "description", label: "Job Description", filled: !!form.description.trim() },
      { id: "requirements", label: "Requirements", filled: !!form.requirements.trim() },
      { id: "deadline", label: "Deadline", filled: !!form.deadline.trim() },
    ];
  }, [form]);

  const progress = useMemo(() => {
    const filledCount = checklistItems.filter((item) => item.filled).length;
    return (filledCount / checklistItems.length) * 100;
  }, [checklistItems]);

  const completedCount = useMemo(() => {
    return checklistItems.filter((item) => item.filled).length;
  }, [checklistItems]);

  const validate = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Standard required fields checks
    if (!form.title.trim()) newErrors.title = "Job Title is required";
    if (!form.company.trim()) newErrors.company = "Company Name is required";
    if (!form.location.trim()) newErrors.location = "Location is required";
    if (!form.jobType.trim()) newErrors.jobType = "Job Type is required";
    if (!form.experience.trim()) newErrors.experience = "Experience is required";
    if (!form.salaryMin.trim()) newErrors.salaryMin = "Minimum Salary is required";
    if (!form.salaryMax.trim()) newErrors.salaryMax = "Maximum Salary is required";
    if (form.skills.length === 0) newErrors.skills = "At least one skill is required";
    if (!form.description.trim()) newErrors.description = "Job Description is required";
    if (!form.requirements.trim()) newErrors.requirements = "Requirements are required";
    if (!form.deadline.trim()) newErrors.deadline = "Deadline is required";

    if (form.salaryMin && Number(form.salaryMin) < 0) {
      newErrors.salaryMin = "Salary cannot be negative";
    }
    if (form.salaryMax && Number(form.salaryMax) < 0) {
      newErrors.salaryMax = "Salary cannot be negative";
    }
    // Only enforce future deadline on create
    if (!editMode && form.deadline && new Date(form.deadline) <= new Date()) {
      newErrors.deadline = "Application deadline must be a future date";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Toast errors to preserve existing behaviour
      Object.values(validationErrors).forEach((err) => toast.error(err));

      // Scroll to the first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      const targetId =
        firstErrorKey === "salaryMin" || firstErrorKey === "salaryMax"
          ? "salary-section"
          : `${firstErrorKey}-section`;
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setLoading(true);

    const payload = {
      title: form.title,
      company: form.company,
      location: form.location,
      jobType: form.jobType,
      salary: { min: Number(form.salaryMin), max: Number(form.salaryMax) },
      experience: form.experience,
      skills: form.skills,
      description: form.description,
      requirements: form.requirements,
      benefits: form.benefits,
      deadline: form.deadline,
    };

    try {
      if (editMode && jobId) {
        const res = await updateJob(jobId, payload as any);
        if (res.success) {
          toast.success("Job updated successfully");
          navigate("/employer/jobs");
        } else {
          toast.error(res.message || "Failed to update job");
        }
      } else {
        const res = await createJob(payload as any);
        if (res.success) {
          toast.success("Job created successfully");
          navigate("/employer/jobs");
        } else {
          toast.error(res.message || "Failed to create job");
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || (editMode ? "Error updating job" : "Error creating job"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/employer/jobs");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 25 } },
  } as const;

  return (
    <form onSubmit={handleSubmit} className="relative pb-24">
      {/* Top Completion Progress Card */}
      <div className="mb-8">
        <ProgressCard
          progress={progress}
          itemsCount={checklistItems.length}
          completedCount={completedCount}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="lg:col-span-2 space-y-8"
        >
          {/* Card 1: Job Information */}
          <motion.div id="title-section" variants={itemVariants}>
            <FormSection
              title="Job Information"
              subtitle="Provide core details about the role you want to advertise."
              icon={<BriefcaseBusiness size={22} />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div id="title-field">
                  <EmployerInput
                    label="Job Title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Lead React Developer"
                    error={errors.title}
                    isRequired
                  />
                </div>
                <div id="company-field">
                  <EmployerInput
                    label="Company Name"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="e.g. Acme Corp"
                    error={errors.company}
                    icon={Building2}
                    isRequired
                  />
                </div>
                <div id="location-field">
                  <EmployerInput
                    label="Location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru, India (or Remote)"
                    error={errors.location}
                    icon={MapPin}
                    isRequired
                  />
                </div>
                <div id="jobType-field">
                  <EmployerSelect
                    label="Job Type"
                    name="jobType"
                    value={form.jobType}
                    onChange={handleChange}
                    options={jobTypeOptions}
                    error={errors.jobType}
                    icon={BriefcaseBusiness}
                    isRequired
                  />
                </div>
                <div id="experience-field">
                  <EmployerInput
                    label="Experience Required"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="e.g. 2+ years"
                    error={errors.experience}
                    icon={Award}
                    isRequired
                  />
                </div>
                <div id="deadline-field">
                  <EmployerInput
                    label="Application Deadline"
                    name="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={handleChange}
                    error={errors.deadline}
                    icon={CalendarDays}
                    isRequired
                  />
                </div>
              </div>
            </FormSection>
          </motion.div>

          {/* Card 2: Salary Range */}
          <motion.div id="salary-section" variants={itemVariants}>
            <SalaryCard
              salaryMin={form.salaryMin}
              salaryMax={form.salaryMax}
              onChangeMin={(val) => handleSalaryChange("Min", val)}
              onChangeMax={(val) => handleSalaryChange("Max", val)}
              error={errors.salaryMin || errors.salaryMax}
              isRequired
            />
          </motion.div>

          {/* Card 3: Skills */}
          <motion.div id="skills-section" variants={itemVariants}>
            <FormSection
              title="Target Skills"
              subtitle="Add keyword chips for skills candidates need to have."
              icon={<Award size={22} />}
            >
              <SkillInput
                label="Required Skills"
                skills={form.skills}
                onChange={handleSkillsChange}
                error={errors.skills}
                isRequired
              />
            </FormSection>
          </motion.div>

          {/* Card 4: Description */}
          <motion.div id="description-section" variants={itemVariants}>
            <FormSection
              title="Job Description"
              subtitle="Describe the day-to-day responsibilities and tasks."
              icon={<FileText size={22} />}
            >
              <EmployerTextarea
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Write a clear summary of the role..."
                error={errors.description}
                maxLength={1000}
                isRequired
              />
            </FormSection>
          </motion.div>

          {/* Card 5: Requirements */}
          <motion.div id="requirements-section" variants={itemVariants}>
            <FormSection
              title="Hiring Requirements"
              subtitle="List educational background, certifications, or tools needed."
              icon={<CheckCircle2 size={22} />}
            >
              <EmployerTextarea
                label="Requirements"
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                placeholder="Requirements like degrees, certifications, key programming language proficiencies..."
                error={errors.requirements}
                isRequired
              />
            </FormSection>
          </motion.div>

          {/* Card 6: Benefits */}
          <motion.div id="benefits-section" variants={itemVariants}>
            <FormSection
              title="Perks & Benefits"
              subtitle="Mention wellness plans, equity, gym memberships (optional)."
              icon={<Gift size={22} />}
            >
              <EmployerTextarea
                label="Benefits"
                name="benefits"
                value={form.benefits}
                onChange={handleChange}
                placeholder="e.g. Health insurance, 401(k) matching, Remote flexibility..."
                error={errors.benefits}
              />
            </FormSection>
          </motion.div>
        </motion.div>

        {/* Right Column: Sticky Sidebar */}
        <div className="lg:col-span-1">
          <PostJobSidebar form={form} checklistItems={checklistItems} />
        </div>
      </div>

      {/* Sticky Bottom Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF]/90 backdrop-blur-md border-t border-[#E2ECE5] py-4 px-6 md:px-12 flex justify-between items-center shadow-[0_-10px_30px_rgba(47,79,70,0.05)]">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-3 rounded-xl border border-[#E2ECE5] text-[#2F4F46] font-semibold hover:bg-[#F7FAF8] transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="relative px-8 py-3 rounded-xl bg-gradient-to-r from-[#659287] to-[#88BDA4] text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-55 cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{editMode ? "Saving..." : "Publishing..."}</span>
            </>
          ) : (
            <span>{editMode ? "Save Changes" : "Publish Job"}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default PostJobForm;