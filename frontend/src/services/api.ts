import { createApi, fetchBaseQuery, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store/index';
import { API_CONFIG } from '../config/index';

// Create a custom base query that can fallback to mock data
const baseQueryWithFallback: BaseQueryFn = async (args, api, extraOptions) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    prepareHeaders: (headers, { getState }) => {
      // Get the token from the auth state
      const token = (getState() as RootState).auth.token;
      
      // If we have a token, add it to the headers
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      // Set content type
      headers.set('content-type', 'application/json');
      
      return headers;
    },
  });

  try {
    const result = await baseQuery(args, api, extraOptions);
    return result;
  } catch (error) {
    console.warn('API request failed, this is expected in development mode:', error);
    // In development, we'll handle fallbacks in individual endpoints
    throw error;
  }
};

// Define our base API configuration
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithFallback,
  tagTypes: ['User', 'Job', 'Company', 'Message', 'Application', 'SavedJob'],
  endpoints: () => ({}),
});