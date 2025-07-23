import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiSlice } from '../../services/api';

interface SearchState {
  query: string;
  filters: SearchFilters;
  activeTab: 'jobs' | 'companies' | 'users';
}

interface SearchFilters {
  location?: string;
  type?: string;
  industry?: string;
}

export interface SearchResult {
  jobs: any[];
  companies: any[];
  users: any[];
  total: {
    jobs: number;
    companies: number;
    users: number;
  };
}

const initialState: SearchState = {
  query: '',
  filters: {},
  activeTab: 'jobs',
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<'jobs' | 'companies' | 'users'>) => {
      state.activeTab = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.filters = {};
    },
  },
});

export const { setQuery, setFilters, setActiveTab, clearSearch } = searchSlice.actions;

export const searchApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchJobs: builder.query<any[], { q: string; filters?: SearchFilters }>({
      query: ({ q, filters }) => {
        let queryParams = `?q=${encodeURIComponent(q)}`;
        
        if (filters?.location) {
          queryParams += `&location=${encodeURIComponent(filters.location)}`;
        }
        
        if (filters?.type) {
          queryParams += `&type=${encodeURIComponent(filters.type)}`;
        }
        
        return `/search/jobs${queryParams}`;
      },
    }),
    searchCompanies: builder.query<any[], { q: string; filters?: SearchFilters }>({
      query: ({ q, filters }) => {
        let queryParams = `?q=${encodeURIComponent(q)}`;
        
        if (filters?.location) {
          queryParams += `&location=${encodeURIComponent(filters.location)}`;
        }
        
        if (filters?.industry) {
          queryParams += `&industry=${encodeURIComponent(filters.industry)}`;
        }
        
        return `/search/companies${queryParams}`;
      },
    }),
    searchUsers: builder.query<any[], { q: string; filters?: SearchFilters }>({
      query: ({ q, filters }) => {
        let queryParams = `?q=${encodeURIComponent(q)}`;
        
        if (filters?.location) {
          queryParams += `&location=${encodeURIComponent(filters.location)}`;
        }
        
        return `/search/users${queryParams}`;
      },
    }),
    searchAll: builder.query<SearchResult, { q: string; filters?: SearchFilters }>({
      query: ({ q, filters }) => {
        let queryParams = `?q=${encodeURIComponent(q)}`;
        
        if (filters?.location) {
          queryParams += `&location=${encodeURIComponent(filters.location)}`;
        }
        
        if (filters?.type) {
          queryParams += `&type=${encodeURIComponent(filters.type)}`;
        }
        
        if (filters?.industry) {
          queryParams += `&industry=${encodeURIComponent(filters.industry)}`;
        }
        
        return `/search/all${queryParams}`;
      },
    }),
  }),
});

export const {
  useSearchJobsQuery,
  useSearchCompaniesQuery,
  useSearchUsersQuery,
  useSearchAllQuery,
} = searchApiSlice;

export default searchSlice.reducer;