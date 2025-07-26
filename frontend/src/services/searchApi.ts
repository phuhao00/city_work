import { apiSlice } from './api';
import { mockJobs, mockCompanies, mockUsers } from './mockData';

// Search API endpoints
export const searchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Global search
    globalSearch: builder.query<
      {
        jobs: any[];
        companies: any[];
        users: any[];
        total: {
          jobs: number;
          companies: number;
          users: number;
        };
      },
      {
        query: string;
        filters?: {
          location?: string;
          type?: string;
          industry?: string;
        };
      }
    >({
      queryFn: async ({ query, filters = {} }) => {
        try {
          // Try real API first
          const queryParams = new URLSearchParams({ query });
          Object.entries(filters).forEach(([key, value]) => {
            if (value) {
              queryParams.append(key, value);
            }
          });
          
          const response = await fetch(`http://localhost:3000/api/search?${queryParams.toString()}`, {
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
          console.log('Using mock data for global search');
          // Fallback to mock data with filtering
          const searchTerm = query.toLowerCase();
          
          let filteredJobs = mockJobs.filter(job =>
            job.title.toLowerCase().includes(searchTerm) ||
            job.description.toLowerCase().includes(searchTerm) ||
            job.company.name.toLowerCase().includes(searchTerm)
          );
          
          let filteredCompanies = mockCompanies.filter(company =>
            company.name.toLowerCase().includes(searchTerm) ||
            company.description.toLowerCase().includes(searchTerm)
          );
          
          let filteredUsers = mockUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
          );
          
          // Apply additional filters
          if (filters.location) {
            filteredJobs = filteredJobs.filter(job =>
              job.location.toLowerCase().includes(filters.location!.toLowerCase())
            );
            filteredCompanies = filteredCompanies.filter(company =>
              company.location.toLowerCase().includes(filters.location!.toLowerCase())
            );
          }
          
          if (filters.type) {
            filteredJobs = filteredJobs.filter(job => job.type === filters.type);
          }
          
          if (filters.industry) {
            filteredJobs = filteredJobs.filter(job => job.industry === filters.industry);
            filteredCompanies = filteredCompanies.filter(company => company.industry === filters.industry);
          }
          
          return {
            data: {
              jobs: filteredJobs.slice(0, 10),
              companies: filteredCompanies.slice(0, 10),
              users: filteredUsers.slice(0, 10),
              total: {
                jobs: filteredJobs.length,
                companies: filteredCompanies.length,
                users: filteredUsers.length,
              },
            }
          };
        }
      },
    }),

    // Search jobs only
    searchJobs: builder.query<
      { jobs: any[]; total: number },
      {
        q: string;
        filters?: {
          location?: string;
          type?: string;
        };
      }
    >({
      queryFn: async ({ q, filters = {} }) => {
        try {
          // Try real API first
          const queryParams = new URLSearchParams({ q });
          Object.entries(filters).forEach(([key, value]) => {
            if (value) {
              queryParams.append(key, value);
            }
          });
          
          const response = await fetch(`http://localhost:3000/api/search/jobs?${queryParams.toString()}`, {
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
          console.log('Using mock data for job search');
          // Fallback to mock data with filtering
          const searchTerm = q.toLowerCase();
          
          let filteredJobs = mockJobs.filter(job =>
            job.title.toLowerCase().includes(searchTerm) ||
            job.description.toLowerCase().includes(searchTerm) ||
            job.company.name.toLowerCase().includes(searchTerm)
          );
          
          if (filters.location) {
            filteredJobs = filteredJobs.filter(job =>
              job.location.toLowerCase().includes(filters.location!.toLowerCase())
            );
          }
          
          if (filters.type) {
            filteredJobs = filteredJobs.filter(job => job.type === filters.type);
          }
          
          return {
            data: {
              jobs: filteredJobs,
              total: filteredJobs.length,
            }
          };
        }
      },
    }),

    // Search companies only
    searchCompanies: builder.query<
      { companies: any[]; total: number },
      {
        q: string;
        filters?: {
          location?: string;
          industry?: string;
        };
      }
    >({
      queryFn: async ({ q, filters = {} }) => {
        try {
          // Try real API first
          const queryParams = new URLSearchParams({ q });
          Object.entries(filters).forEach(([key, value]) => {
            if (value) {
              queryParams.append(key, value);
            }
          });
          
          const response = await fetch(`http://localhost:3000/api/search/companies?${queryParams.toString()}`, {
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
          console.log('Using mock data for company search');
          // Fallback to mock data with filtering
          const searchTerm = q.toLowerCase();
          
          let filteredCompanies = mockCompanies.filter(company =>
            company.name.toLowerCase().includes(searchTerm) ||
            company.description.toLowerCase().includes(searchTerm)
          );
          
          if (filters.location) {
            filteredCompanies = filteredCompanies.filter(company =>
              company.location.toLowerCase().includes(filters.location!.toLowerCase())
            );
          }
          
          if (filters.industry) {
            filteredCompanies = filteredCompanies.filter(company => company.industry === filters.industry);
          }
          
          return {
            data: {
              companies: filteredCompanies,
              total: filteredCompanies.length,
            }
          };
        }
      },
    }),

    // Search users only
    searchUsers: builder.query<
      { users: any[]; total: number },
      {
        q: string;
        filters?: {
          location?: string;
        };
      }
    >({
      queryFn: async ({ q, filters = {} }) => {
        try {
          // Try real API first
          const queryParams = new URLSearchParams({ q });
          Object.entries(filters).forEach(([key, value]) => {
            if (value) {
              queryParams.append(key, value);
            }
          });
          
          const response = await fetch(`http://localhost:3000/api/search/users?${queryParams.toString()}`, {
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
          console.log('Using mock data for user search');
          // Fallback to mock data with filtering
          const searchTerm = q.toLowerCase();
          
          let filteredUsers = mockUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
          );
          
          if (filters.location) {
            filteredUsers = filteredUsers.filter(user =>
              user.location && user.location.toLowerCase().includes(filters.location!.toLowerCase())
            );
          }
          
          return {
            data: {
              users: filteredUsers,
              total: filteredUsers.length,
            }
          };
        }
      },
    }),
  }),
});

export const {
  useGlobalSearchQuery,
  useSearchJobsQuery,
  useSearchCompaniesQuery,
  useSearchUsersQuery,
} = searchApi;