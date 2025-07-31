import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Company {
  id: string;
  name: string;
  logo?: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
  isFollowing?: boolean;
}

interface CompaniesState {
  companies: Company[];
  followedCompanies: Company[];
  currentCompany: Company | null;
  isLoading: boolean;
}

const initialState: CompaniesState = {
  companies: [],
  followedCompanies: [],
  currentCompany: null,
  isLoading: false,
};

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    setCompanies: (state, action: PayloadAction<Company[]>) => {
      state.companies = action.payload;
    },
    setCurrentCompany: (state, action: PayloadAction<Company>) => {
      state.currentCompany = action.payload;
    },
    toggleFollow: (state, action: PayloadAction<string>) => {
      const companyId = action.payload;
      const company = state.companies.find(c => c.id === companyId);
      if (company) {
        company.isFollowing = !company.isFollowing;
        if (company.isFollowing) {
          state.followedCompanies.push(company);
        } else {
          state.followedCompanies = state.followedCompanies.filter(c => c.id !== companyId);
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCompanies, setCurrentCompany, toggleFollow, setLoading } = companiesSlice.actions;
export default companiesSlice.reducer;