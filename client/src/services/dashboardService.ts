import api from "./api";

export interface UserInfo {
  name: string;
  email: string;
  role: "candidate" | "employer" | "admin";
}

// Candidate Dashboard
export interface Stats {
  applications: number;
  savedJobs: number;
  interviews: number;
  profileCompletion: number;
}

export interface JobInfo {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  skills?: string[];
}

export interface ApplicationInfo {
  _id: string;
  job: JobInfo;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
  candidate?: {
    name: string;
    email: string;
  };
}

export interface ActivityInfo {
  id: string;
  type: string;
  detail: string;
  time: string;
  status: string;
  _id?: string;
  description?: string;
  date?: Date;
}

export interface DashboardData {
  user: UserInfo;
  stats: Stats;
  recentApplications: ApplicationInfo[];
  recommendedJobs: JobInfo[];
  activities: ActivityInfo[];
}

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await api.get<DashboardData>("/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// Employer Dashboard
export interface EmployerStats {
  totalJobs: number;
  activeJobs: number;
  applications: number;
  interviews: number;
  shortlisted?: number;
  hired?: number;
  rejected?: number;
}

export interface ApplicationsPerJob {
    name: string;
    applications: number;
}

export interface ApplicationsByDate {
    name: string;
    applications: number;
}

export interface UpcomingInterview {
  _id: string;
  interviewDate: string;
  interviewTime: string;
  meetingLink: string;
  interviewNotes?: string;
  interviewStatus: 'Upcoming' | 'Completed' | 'Cancelled';
  user: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  job: {
    _id: string;
    title: string;
  };
}

export interface EmployerDashboardData {
  stats: EmployerStats;
  recentActivity: ActivityInfo[];
  applicationsPerJob: ApplicationsPerJob[];
  applicationsByDate: ApplicationsByDate[];
  user: UserInfo;
  upcomingInterviews: UpcomingInterview[];
}

export const fetchEmployerDashboardData = async (): Promise<EmployerDashboardData> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await api.get<EmployerDashboardData>("/dashboard/employer", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
