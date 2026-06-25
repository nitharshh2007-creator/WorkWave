export type Job = {
  id: string;
  _id?: string;
  title: string;
  company: string;
  logo?: string;
  location: string;
  type?: string;
  jobType?: string;
  salary: {
    min: number;
    max: number;
  };
  applicants?: number;
  skills: string[];
  postedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  experience?: string;
  deadline?: string;
  status?: string;
};

import api from "./api";

export const createJob = async (jobData: Partial<Job>) => {
  try {
    const response = await api.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateJob = async (id: string, payload: Partial<Job>) => {
  try {
    const response = await api.patch(`/jobs/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteJob = async (id: string) => {
  try {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const archiveJob = async (id: string, status: 'archived' | 'active') => {
  try {
    const response = await api.patch(`/jobs/${id}/archive`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getJobById = async (id: string) => {
  try {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMyJobs = async () => {
  try {
    const response = await api.get('/jobs/my-jobs');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getJobs = async () => {
  try {
    const response = await api.get('/jobs');
    return response.data;
  } catch (error) {
    throw error;
  }
};
