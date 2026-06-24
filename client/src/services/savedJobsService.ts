import { type Job } from '../pages/jobs';

const SAVED_JOBS_KEY = 'savedJobs';

export const getSavedJobs = (): Job[] => {
  try {
    const savedJobsJson = localStorage.getItem(SAVED_JOBS_KEY);
    return savedJobsJson ? JSON.parse(savedJobsJson) : [];
  } catch (error) {
    console.error("Error parsing saved jobs from localStorage", error);
    return [];
  }
};

export const saveJob = (job: Job): boolean => {
  const savedJobs = getSavedJobs();
  if (savedJobs.some(j => j.id === job.id)) {
    return false; // Already saved
  }
  const newSavedJobs = [...savedJobs, job];
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(newSavedJobs));
  return true; // Successfully saved
};

export const unsaveJob = (jobId: number): void => {
  const savedJobs = getSavedJobs();
  const newSavedJobs = savedJobs.filter(j => j.id !== jobId);
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(newSavedJobs));
};

export const isJobSaved = (jobId: number): boolean => {
  const savedJobs = getSavedJobs();
  return savedJobs.some(j => j.id === jobId);
};
