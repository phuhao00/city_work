import { apiSlice } from './api';
import { mockCompanies, mockJobs } from './mockData';

// Companies API endpoints
export const companiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all companies
    getCompanies: builder.query<
      { companies: any[]; total: number; page: number; limit: number },
      {
        page?: number;
        limit?: number;
        industry?: string;
        location?: string;
        size?: string;
        search?: string;
      }
    >({
      queryFn: async (params = {}) => {
        try {
          // Try real API first
          const queryParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, value.toString());
            }
          });
          
          const response = await fetch(`http://localhost:3000/api/companies?${queryParams.toString()}`, {
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
          console.log('Using mock data for companies');
          // Fallback to mock data with filtering
          let filteredCompanies = [...mockCompanies];
          
          if (params.search) {
            filteredCompanies = filteredCompanies.filter(company =>
              company.name.toLowerCase().includes(params.search!.toLowerCase()) ||
              company.description.toLowerCase().includes(params.search!.toLowerCase())
            );
          }
          
          if (params.industry) {
            filteredCompanies = filteredCompanies.filter(company =>
              company.industry === params.industry
            );
          }
          
          if (params.location) {
            filteredCompanies = filteredCompanies.filter(company =>
              company.location.toLowerCase().includes(params.location!.toLowerCase())
            );
          }
          
          if (params.size) {
            filteredCompanies = filteredCompanies.filter(company =>
              company.size === params.size
            );
          }
          
          const page = params.page || 1;
          const limit = params.limit || 10;
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          
          return {
            data: {
              companies: filteredCompanies.slice(startIndex, endIndex),
              total: filteredCompanies.length,
              page,
              limit,
            }
          };
        }
      },
      providesTags: ['Company'],
    }),

    // Get company by ID
    getCompanyById: builder.query<any, string>({
      queryFn: async (id) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/companies/${id}`, {
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
          console.log('Using mock data for company by ID');
          // Fallback to mock data
          const company = mockCompanies.find(c => c._id === id);
          if (!company) {
            return { error: { status: 404, data: 'Company not found' } };
          }
          return { data: company };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Company', id }],
    }),

    // Create new company (admin/employer only)
    createCompany: builder.mutation<
      any,
      {
        name: string;
        description: string;
        industry: string;
        location: string;
        website?: string;
        size?: string;
        logo?: string;
        benefits?: string[];
      }
    >({
      queryFn: async (companyData) => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/companies', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock_token',
            },
            body: JSON.stringify(companyData),
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for create company');
          // Fallback to mock data
          const newCompany = {
            _id: Date.now().toString(),
            ...companyData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { data: newCompany };
        }
      },
      invalidatesTags: ['Company'],
    }),

    // Update company
    updateCompany: builder.mutation<
      any,
      { id: string; data: Partial<any> }
    >({
      queryFn: async ({ id, data }) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/companies/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock_token',
            },
            body: JSON.stringify(data),
          });
          
          if (response.ok) {
            const responseData = await response.json();
            return { data: responseData };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for update company');
          // Fallback to mock data
          const company = mockCompanies.find(c => c._id === id);
          if (!company) {
            return { error: { status: 404, data: 'Company not found' } };
          }
          const updatedCompany = { ...company, ...data, updatedAt: new Date().toISOString() };
          return { data: updatedCompany };
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Company', id }],
    }),

    // Delete company
    deleteCompany: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/companies/${id}`, {
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
          console.log('Using mock data for delete company');
          // Fallback to mock data
          return { data: undefined };
        }
      },
      invalidatesTags: ['Company'],
    }),

    // Get company jobs
    getCompanyJobs: builder.query<any[], string>({
      queryFn: async (companyId) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/companies/${companyId}/jobs`, {
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
          console.log('Using mock data for company jobs');
          // Fallback to mock data
          const companyJobs = mockJobs.filter(job => job.company._id === companyId);
          return { data: companyJobs };
        }
      },
      providesTags: ['Job'],
    }),
  }),
});

export const {
  useGetCompaniesQuery,
  useGetCompanyByIdQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useGetCompanyJobsQuery,
} = companiesApi;