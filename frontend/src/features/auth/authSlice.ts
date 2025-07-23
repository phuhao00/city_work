import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiSlice } from '../../services/api';

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
  role: 'jobseeker' | 'employer' | 'admin';
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
  token: string;
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
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setCredentials, logout, setError, clearError } = authSlice.actions;

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { email: string; password: string }>(
      {
        query: (credentials) => ({
          url: '/auth/login',
          method: 'POST',
          body: credentials,
        }),
      }
    ),
    register: builder.mutation<
      LoginResponse,
      { name: string; email: string; password: string; role: 'jobseeker' | 'employer' }
    >({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getMe: builder.query<User, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetMeQuery } = authApiSlice;

export default authSlice.reducer;