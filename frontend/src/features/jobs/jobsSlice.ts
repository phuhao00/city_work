import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiSlice } from '../../services/api';

interface JobsState {
  filters: JobFilters;
  searchTerm: string;
}

interface JobFilters {
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'internship';
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  isActive?: boolean;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  isActive: boolean;
  companyId: string;
  company?: {
    _id: string;
    name: string;
    logo?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const initialState: JobsState = {
  filters: {},
  searchTerm: '',
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setFilters: (state, action: PayloadAction<JobFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const { setSearchTerm, setFilters, clearFilters } = jobsSlice.actions;

export const jobsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query<{ jobs: Job[]; total: number }, { page?: number; limit?: number; filters?: JobFilters; searchTerm?: string }>(
      {
        query: ({ page = 1, limit = 10, filters, searchTerm }) => {
          let queryParams = `?page=${page}&limit=${limit}`;
          
          if (searchTerm) {
            queryParams += `&search=${searchTerm}`;
          }
          
          if (filters?.location) {
            queryParams += `&location=${filters.location}`;
          }
          
          if (filters?.type) {
            queryParams += `&type=${filters.type}`;
          }
          
          if (filters?.salaryMin) {
            queryParams += `&salaryMin=${filters.salaryMin}`;
          }
          
          if (filters?.salaryMax) {
            queryParams += `&salaryMax=${filters.salaryMax}`;
          }
          
          if (filters?.skills && filters.skills.length > 0) {
            queryParams += `&skills=${filters.skills.join(',')}`;
          }
          
          if (filters?.isActive !== undefined) {
            queryParams += `&isActive=${filters.isActive}`;
          }
          
          return `/jobs${queryParams}`;
        },
        providesTags: (result) =>
          result
            ? [
                ...result.jobs.map(({ _id }) => ({ type: 'Job' as const, id: _id })),
                { type: 'Job' as const, id: 'LIST' },
              ]
            : [{ type: 'Job' as const, id: 'LIST' }],
      }
    ),
    getJobById: builder.query<Job, string>({
      query: (id) => `/jobs/${id}`,
      providesTags: (result, error, id) => [{ type: 'Job' as const, id }],
    }),
    applyForJob: builder.mutation<{ success: boolean }, { jobId: string; coverLetter?: string; resumeUrl?: string }>(
      {
        query: ({ jobId, coverLetter, resumeUrl }) => ({
          url: `/jobs/${jobId}/apply`,
          method: 'POST',
          body: { coverLetter, resumeUrl },
        }),
        invalidatesTags: (result, error, { jobId }) => [
          { type: 'Job', id: jobId },
          { type: 'Application', id: 'LIST' },
        ],
      }
    ),
    saveJob: builder.mutation<{ success: boolean }, string>({
      query: (jobId) => ({
        url: `/jobs/${jobId}/save`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, jobId) => [
        { type: 'Job', id: jobId },
        { type: 'SavedJob', id: 'LIST' },
      ],
    }),
    unsaveJob: builder.mutation<{ success: boolean }, string>({
      query: (jobId) => ({
        url: `/jobs/${jobId}/unsave`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, jobId) => [
        { type: 'Job', id: jobId },
        { type: 'SavedJob', id: 'LIST' },
      ],
    }),
    getSavedJobs: builder.query<Job[], void>({
      query: () => '/jobs/saved',
      providesTags: [{ type: 'SavedJob', id: 'LIST' }],
    }),
    getUserApplications: builder.query<any[], void>({
      query: () => '/jobs/applications/user',
      providesTags: [{ type: 'Application', id: 'LIST' }],
    }),
  }),
});

export const { 
  useGetJobsQuery, 
  useGetJobByIdQuery, 
  useApplyForJobMutation,
  useSaveJobMutation,
  useUnsaveJobMutation,
  useGetSavedJobsQuery,
  useGetUserApplicationsQuery,
} = jobsApiSlice;

export default jobsSlice.reducer;