import { apiSlice } from './api';
import { mockApiResponses, mockUsers } from './mockData';

// Auth API endpoints
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Login user
    login: builder.mutation<
      { access_token: string; user: any },
      { email: string; password: string }
    >({
      queryFn: async (credentials) => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for login');
          // Fallback to mock data
          return { data: mockApiResponses.login };
        }
      },
    }),

    // Register user
    register: builder.mutation<
      { access_token: string; user: any },
      {
        name: string;
        email: string;
        password: string;
        role?: 'JOBSEEKER' | 'EMPLOYER' | 'ADMIN';
        phone?: string;
        location?: string;
        bio?: string;
      }
    >({
      queryFn: async (userData) => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for register');
          // Fallback to mock data
          const newUser = {
            ...mockUsers[0],
            ...userData,
            _id: Date.now().toString(),
          };
          return { 
            data: {
              access_token: 'mock_jwt_token_' + Date.now(),
              user: newUser,
            }
          };
        }
      },
    }),

    // Get current user profile
    getProfile: builder.query<any, void>({
      queryFn: async () => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/auth/me', {
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
          console.log('Using mock data for profile');
          // Fallback to mock data
          return { data: mockUsers[0] };
        }
      },
      providesTags: ['User'],
    }),

    // Logout (client-side only, no API call needed)
    logout: builder.mutation<void, void>({
      queryFn: () => ({ data: undefined }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useLogoutMutation,
} = authApi;