import { apiSlice } from './api';
import { mockApiResponses, mockJobs } from './mockData';

// Job API endpoints
export const jobsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all jobs with filtering
    getJobs: builder.query<
      { jobs: any[]; total: number; page: number; limit: number },
      {
        page?: number;
        limit?: number;
        location?: string;
        type?: string;
        salaryMin?: number;
        salaryMax?: number;
        skills?: string[];
        search?: string;
      }
    >({
      queryFn: async (params = {}) => {
        try {
          // Try real API first
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                value.forEach(v => queryParams.append(key, v.toString()));
              } else {
                queryParams.append(key, value.toString());
              }
            }
          });
          
          const response = await fetch(`http://localhost:3000/api/jobs?${queryParams.toString()}`);
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for jobs');
          // Fallback to mock data with basic filtering
          let filteredJobs = [...mockJobs];
          
          if (params.search) {
            filteredJobs = filteredJobs.filter(job => 
              job.title.toLowerCase().includes(params.search!.toLowerCase()) ||
              job.description.toLowerCase().includes(params.search!.toLowerCase())
            );
          }
          
          if (params.location) {
            filteredJobs = filteredJobs.filter(job => 
              job.location.toLowerCase().includes(params.location!.toLowerCase())
            );
          }
          
          if (params.type) {
            filteredJobs = filteredJobs.filter(job => job.type === params.type);
          }
          
          return { 
            data: {
              jobs: filteredJobs,
              total: filteredJobs.length,
              page: params.page || 1,
              limit: params.limit || 10,
            }
          };
        }
      },
      providesTags: ['Job'],
    }),

    // Get job by ID
    getJobById: builder.query<any, string>({
      queryFn: async (id) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/jobs/${id}`);
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for job detail');
          // Fallback to mock data
          const job = mockJobs.find(j => j._id === id) || mockJobs[0];
          return { data: job };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Job', id }],
    }),

    // Create new job (employer/admin only)
    createJob: builder.mutation<
      any,
      {
        title: string;
        description: string;
        companyId: string;
        location: string;
        type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
        salaryMin?: number;
        salaryMax?: number;
        skills?: string[];
        requirements?: string[];
        benefits?: string[];
      }
    >({
      queryFn: async (jobData) => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/jobs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock_token',
            },
            body: JSON.stringify(jobData),
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for job creation');
          // Fallback to mock data
          const newJob = {
            ...jobData,
            _id: Date.now().toString(),
            company: mockJobs[0].company,
            postedAt: new Date().toISOString(),
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { data: newJob };
        }
      },
      invalidatesTags: ['Job'],
    }),

    // Update job
    updateJob: builder.mutation<
      any,
      { id: string; data: Partial<any> }
    >({
      queryFn: async ({ id, data }) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/jobs/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock_token',
            },
            body: JSON.stringify(data),
          });
          
          if (response.ok) {
            const result = await response.json();
            return { data: result };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for job update');
          // Fallback to mock data
          const job = mockJobs.find(j => j._id === id) || mockJobs[0];
          const updatedJob = { ...job, ...data, updatedAt: new Date().toISOString() };
          return { data: updatedJob };
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Job', id }],
    }),

    // Delete job
    deleteJob: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/jobs/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': 'Bearer mock_token',
            },
          });
          
          if (response.ok) {
            return { data: undefined };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for job deletion');
          // Fallback to mock data (just return success)
          return { data: undefined };
        }
      },
      invalidatesTags: ['Job'],
    }),

    // Apply for job
    applyForJob: builder.mutation<any, string>({
      queryFn: async (jobId) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/jobs/${jobId}/apply`, {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer mock_token',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for job application');
          // Fallback to mock data
          return { 
            data: {
              _id: Date.now().toString(),
              jobId,
              status: 'PENDING',
              appliedAt: new Date().toISOString(),
            }
          };
        }
      },
      invalidatesTags: ['Application'],
    }),

    // Save job
    saveJob: builder.mutation<any, string>({
      queryFn: async (jobId) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/jobs/${jobId}/save`, {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer mock_token',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for job save');
          // Fallback to mock data
          return { 
            data: {
              _id: Date.now().toString(),
              jobId,
              savedAt: new Date().toISOString(),
            }
          };
        }
      },
      invalidatesTags: ['SavedJob'],
    }),

    // Get saved jobs
    getSavedJobs: builder.query<any[], void>({
      queryFn: async () => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/jobs/user/saved', {
            headers: {
              'Authorization': 'Bearer mock_token',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for saved jobs');
          // Fallback to mock data
          return { data: mockJobs.slice(0, 2) };
        }
      },
      providesTags: ['SavedJob'],
    }),

    // Get applied jobs
    getAppliedJobs: builder.query<any[], void>({
      queryFn: async () => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/jobs/user/applied', {
            headers: {
              'Authorization': 'Bearer mock_token',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for applied jobs');
          // Fallback to mock data
          return { data: mockJobs.slice(1, 3) };
        }
      },
      providesTags: ['Application'],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useGetJobByIdQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useApplyForJobMutation,
  useSaveJobMutation,
  useGetSavedJobsQuery,
  useGetAppliedJobsQuery,
} = jobsApi;