import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'JOBSEEKER' | 'EMPLOYER' | 'ADMIN';
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginResponse {
  user: User;
  access_token: string;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<LoginResponse>) => {
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.isAuthenticated = true;
      state.error = null;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { 
  setCredentials, 
  logout, 
  setLoading, 
  setError, 
  clearError, 
  updateUser 
} = authSlice.actions;

export default authSlice.reducer;
export type { User, LoginResponse, AuthState };