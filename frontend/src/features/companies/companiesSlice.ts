import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiSlice } from '../../services/api';

interface CompaniesState {
  searchTerm: string;
  filters: CompanyFilters;
}

interface CompanyFilters {
  industry?: string;
  location?: string;
  size?: string;
}

export interface Company {
  _id: string;
  name: string;
  logo?: string;
  description: string;
  industry: string;
  website?: string;
  location: string;
  size: string;
  foundedYear?: number;
  createdAt: string;
  updatedAt: string;
}

const initialState: CompaniesState = {
  searchTerm: '',
  filters: {},
};

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setFilters: (state, action: PayloadAction<CompanyFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const { setSearchTerm, setFilters, clearFilters } = companiesSlice.actions;

export const companiesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCompanies: builder.query<{ companies: Company[]; total: number }, { page?: number; limit?: number; filters?: CompanyFilters; searchTerm?: string }>(
      {
        query: ({ page = 1, limit = 10, filters, searchTerm }) => {
          let queryParams = `?page=${page}&limit=${limit}`;
          
          if (searchTerm) {
            queryParams += `&search=${searchTerm}`;
          }
          
          if (filters?.industry) {
            queryParams += `&industry=${filters.industry}`;
          }
          
          if (filters?.location) {
            queryParams += `&location=${filters.location}`;
          }
          
          if (filters?.size) {
            queryParams += `&size=${filters.size}`;
          }
          
          return `/companies${queryParams}`;
        },
        providesTags: ['Company'],
      }
    ),
    getCompany: builder.query<Company, string>({
      query: (id) => `/companies/${id}`,
      providesTags: (result, error, id) => [{ type: 'Company', id }],
    }),
    createCompany: builder.mutation<Company, Partial<Company>>({
      query: (company) => ({
        url: '/companies',
        method: 'POST',
        body: company,
      }),
      invalidatesTags: ['Company'],
    }),
    updateCompany: builder.mutation<Company, { id: string; company: Partial<Company> }>({
      query: ({ id, company }) => ({
        url: `/companies/${id}`,
        method: 'PUT',
        body: company,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Company', id }],
    }),
    deleteCompany: builder.mutation<void, string>({
      query: (id) => ({
        url: `/companies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Company'],
    }),
  }),
});

export const {
  useGetCompaniesQuery,
  useGetCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} = companiesApiSlice;

export default companiesSlice.reducer;