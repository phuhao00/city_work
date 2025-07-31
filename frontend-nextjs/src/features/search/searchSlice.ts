import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchResult {
  id: string;
  type: 'job' | 'company' | 'user';
  title: string;
  subtitle: string;
  description: string;
  avatar?: string;
}

interface SearchState {
  query: string;
  results: SearchResult[];
  recentSearches: string[];
  isLoading: boolean;
  filters: {
    type: 'all' | 'job' | 'company' | 'user';
    location: string;
  };
}

const initialState: SearchState = {
  query: '',
  results: [],
  recentSearches: [],
  isLoading: false,
  filters: {
    type: 'all',
    location: '',
  },
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.results = action.payload;
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const query = action.payload;
      if (query && !state.recentSearches.includes(query)) {
        state.recentSearches.unshift(query);
        if (state.recentSearches.length > 10) {
          state.recentSearches.pop();
        }
      }
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    setFilters: (state, action: PayloadAction<Partial<SearchState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setQuery, setResults, addRecentSearch, clearRecentSearches, setFilters, setLoading } = searchSlice.actions;
export default searchSlice.reducer;