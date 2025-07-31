import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  postedAt: string;
  isBookmarked?: boolean;
}

interface JobsState {
  jobs: Job[];
  bookmarkedJobs: Job[];
  currentJob: Job | null;
  isLoading: boolean;
  filters: {
    location: string;
    type: string;
    salary: string;
  };
}

const initialState: JobsState = {
  jobs: [],
  bookmarkedJobs: [],
  currentJob: null,
  isLoading: false,
  filters: {
    location: '',
    type: '',
    salary: '',
  },
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobs: (state, action: PayloadAction<Job[]>) => {
      state.jobs = action.payload;
    },
    setCurrentJob: (state, action: PayloadAction<Job>) => {
      state.currentJob = action.payload;
    },
    toggleBookmark: (state, action: PayloadAction<string>) => {
      const jobId = action.payload;
      const job = state.jobs.find(j => j.id === jobId);
      if (job) {
        job.isBookmarked = !job.isBookmarked;
        if (job.isBookmarked) {
          state.bookmarkedJobs.push(job);
        } else {
          state.bookmarkedJobs = state.bookmarkedJobs.filter(j => j.id !== jobId);
        }
      }
    },
    setFilters: (state, action: PayloadAction<Partial<JobsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setJobs, setCurrentJob, toggleBookmark, setFilters, setLoading } = jobsSlice.actions;
export default jobsSlice.reducer;