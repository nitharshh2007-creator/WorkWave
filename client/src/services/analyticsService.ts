import api from "./api";

export interface AnalyticsStats {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  totalApplications: number;
  appsToday: number;
  appsThisWeek: number;
  appsThisMonth: number;
  shortlistedCount: number;
  interviewCount: number;
  rejectedCount: number;
  hiredCount: number;
  growthRate: number;
  profileViews?: number;
}

export interface FunnelData {
  applied: number;
  reviewed: number;
  shortlisted: number;
  interview: number;
  offer: number;
  hired: number;
}

export interface RatesData {
  hiringSuccessRate: number;
  shortlistRate: number;
  interviewRate: number;
  rejectionRate: number;
  avgHiringTime: number;
}

export interface SkillItem {
  name: string;
  count: number;
}

export interface LocationData {
  cities: Array<{ name: string; count: number }>;
  countries: Array<{ name: string; count: number }>;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
}

export interface JobPerformanceItem {
  id: string;
  title: string;
  applications: number;
  shortlisted: number;
  interview: number;
  rejected: number;
  hired: number;
  hiringRate: number;
  acceptanceRate: number;
  conversionRate: number;
  salary?: { min: number; max: number };
  experience?: string;
  createdAt?: string | Date;
}

export interface EmployerOverviewResponse {
  success: boolean;
  stats: AnalyticsStats;
  funnel: FunnelData;
  rates: RatesData;
  topSkills: SkillItem[];
  locations: LocationData;
  experienceDistribution: Array<{ name: string; value: number }>;
  educationDistribution: Array<{ name: string; value: number }>;
  recentActivity: ActivityItem[];
  popularJobs: JobPerformanceItem[];
  leastPerformingJobs: JobPerformanceItem[];
  jobsPerformance: JobPerformanceItem[];
  aiInsights: string[];
  aiRecommendations: string[];
}

export interface TrendItem {
  name: string;
  date?: string;
  applicants: number;
}

export interface EmployerTrendsResponse {
  success: boolean;
  trendData: TrendItem[];
}

export interface JobPerformanceResponse {
  success: boolean;
  performance: JobPerformanceItem[];
}

export interface EmployerReportsResponse {
  success: boolean;
  reportData: Array<Record<string, any>>;
}

export const fetchEmployerOverview = async (): Promise<EmployerOverviewResponse> => {
  const response = await api.get<EmployerOverviewResponse>("/analytics/employer/overview");
  return response.data;
};

export const fetchEmployerTrends = async (range: "daily" | "weekly" | "monthly" | "yearly"): Promise<EmployerTrendsResponse> => {
  const response = await api.get<EmployerTrendsResponse>(`/analytics/employer/trends?range=${range}`);
  return response.data;
};

export const fetchEmployerJobPerformance = async (): Promise<JobPerformanceResponse> => {
  const response = await api.get<JobPerformanceResponse>("/analytics/employer/job-performance");
  return response.data;
};

export const fetchEmployerReports = async (reportType: string): Promise<EmployerReportsResponse> => {
  const response = await api.get<EmployerReportsResponse>(`/analytics/employer/reports?reportType=${reportType}`);
  return response.data;
};
