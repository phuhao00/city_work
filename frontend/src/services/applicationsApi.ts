import { apiSlice } from './api';

// Mock applications data
const mockApplications = [
  {
    id: '1',
    jobId: '1',
    jobTitle: 'Frontend Developer',
    company: 'Tech Corp',
    status: 'pending',
    appliedAt: '2024-01-15T10:00:00Z',
    lastUpdated: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    jobId: '2',
    jobTitle: 'Backend Developer',
    company: 'StartupXYZ',
    status: 'interview',
    appliedAt: '2024-01-10T14:30:00Z',
    lastUpdated: '2024-01-20T09:15:00Z',
  },
];

// Applications API endpoints
export const applicationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user's applications
    getMyApplications: builder.query<any[], void>({
      queryFn: async () => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/applications/my', {
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
          console.log('Using mock data for applications');
          // Fallback to mock data
          return { data: mockApplications };
        }
      },
      providesTags: ['Application'],
    }),

    // Apply for a job
    applyForJob: builder.mutation<
      any,
      { jobId: string; coverLetter?: string; resume?: string }
    >({
      queryFn: async (applicationData) => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/applications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock_token',
            },
            body: JSON.stringify(applicationData),
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for job application');
          // Fallback to mock data
          const newApplication = {
            id: Date.now().toString(),
            jobId: applicationData.jobId,
            jobTitle: 'Mock Job Title',
            company: 'Mock Company',
            status: 'pending',
            appliedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            coverLetter: applicationData.coverLetter,
          };
          return { data: newApplication };
        }
      },
      invalidatesTags: ['Application'],
    }),

    // Withdraw application
    withdrawApplication: builder.mutation<void, string>({
      queryFn: async (applicationId) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/applications/${applicationId}`, {
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
          console.log('Using mock data for application withdrawal');
          // Fallback to mock data
          return { data: undefined };
        }
      },
      invalidatesTags: ['Application'],
    }),

    // Get application by ID
    getApplicationById: builder.query<any, string>({
      queryFn: async (id) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/applications/${id}`, {
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
          console.log('Using mock data for application detail');
          // Fallback to mock data
          const application = mockApplications.find(app => app.id === id) || mockApplications[0];
          return { data: application };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Application', id }],
    }),
  }),
});

export const {
  useGetMyApplicationsQuery,
  useApplyForJobMutation,
  useWithdrawApplicationMutation,
  useGetApplicationByIdQuery,
} = applicationsApi;