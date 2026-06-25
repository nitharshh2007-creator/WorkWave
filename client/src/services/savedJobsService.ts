import api from './api';
import { type Job } from '../pages/jobs';

export const getSavedJobs = async (): Promise<Job[]> => {
  try {
    const response = await api.get<Job[]>('/user/saved-jobs');
    return response.data;
  } catch (error) {
    console.error("Error fetching saved jobs from backend", error);
    return [];
  }
};

export const saveJob = async (jobId: string): Promise<boolean> => {
  try {
    await api.post('/user/saved-jobs', { jobId });
    return true;
  } catch (error) {
    console.error("Error saving job", error);
    return false;
  }
};

export const unsaveJob = async (jobId: string): Promise<void> => {
  try {
    await api.delete(`/user/saved-jobs/${jobId}`);
  } catch (error) {
    console.error("Error unsaving job", error);
  }
};

export const isJobSaved = async (jobId: string): Promise<boolean> => {
  try {
    const savedJobs = await getSavedJobs();
    return savedJobs.some(j => ((j as any)._id || (j as any).id || '').toString() === jobId.toString());
  } catch (error) {
    return false;
  }
};
