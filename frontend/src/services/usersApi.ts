import { apiSlice } from './api';
import { mockUsers } from './mockData';

// Users API endpoints
export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users (admin only)
    getUsers: builder.query<
      { users: any[]; total: number; page: number; limit: number },
      {
        page?: number;
        limit?: number;
        role?: 'JOBSEEKER' | 'EMPLOYER' | 'ADMIN';
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
          
          const response = await fetch(`http://localhost:3000/api/users?${queryParams.toString()}`, {
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
          console.log('Using mock data for users');
          // Fallback to mock data with filtering
          let filteredUsers = [...mockUsers];
          
          if (params.search) {
            filteredUsers = filteredUsers.filter(user =>
              user.name.toLowerCase().includes(params.search!.toLowerCase()) ||
              user.email.toLowerCase().includes(params.search!.toLowerCase())
            );
          }
          
          if (params.role) {
            filteredUsers = filteredUsers.filter(user => user.role === params.role);
          }
          
          const page = params.page || 1;
          const limit = params.limit || 10;
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          
          return {
            data: {
              users: filteredUsers.slice(startIndex, endIndex),
              total: filteredUsers.length,
              page,
              limit,
            }
          };
        }
      },
      providesTags: ['User'],
    }),

    // Get user by ID
    getUserById: builder.query<any, string>({
      queryFn: async (id) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/users/${id}`, {
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
          console.log('Using mock data for user by ID');
          // Fallback to mock data
          const user = mockUsers.find(u => u._id === id);
          if (!user) {
            return { error: { status: 404, data: 'User not found' } };
          }
          return { data: user };
        }
      },
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Create new user (admin only)
    createUser: builder.mutation<
      any,
      {
        name: string;
        email: string;
        password: string;
        role: 'JOBSEEKER' | 'EMPLOYER' | 'ADMIN';
        phone?: string;
        location?: string;
        bio?: string;
      }
    >({
      queryFn: async (userData) => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock_token',
            },
            body: JSON.stringify(userData),
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for create user');
          // Fallback to mock data
          const newUser = {
            _id: Date.now().toString(),
            ...userData,
            avatar: null,
            isVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { data: newUser };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Update user
    updateUser: builder.mutation<
      any,
      { id: string; data: Partial<any> }
    >({
      queryFn: async ({ id, data }) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/users/${id}`, {
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
          console.log('Using mock data for update user');
          // Fallback to mock data
          const user = mockUsers.find(u => u._id === id);
          if (!user) {
            return { error: { status: 404, data: 'User not found' } };
          }
          const updatedUser = { ...user, ...data, updatedAt: new Date().toISOString() };
          return { data: updatedUser };
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),

    // Delete user
    deleteUser: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          // Try real API first
          const response = await fetch(`http://localhost:3000/api/users/${id}`, {
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
          console.log('Using mock data for delete user');
          // Fallback to mock data
          return { data: undefined };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Update current user profile
    updateProfile: builder.mutation<any, Partial<any>>({
      queryFn: async (data) => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/users/profile', {
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
          console.log('Using mock data for update profile');
          // Fallback to mock data
          const currentUser = mockUsers[0]; // Assume first user is current user
          const updatedProfile = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
          return { data: updatedProfile };
        }
      },
      invalidatesTags: ['User'],
    }),

    // Upload user avatar
    uploadAvatar: builder.mutation<any, FormData>({
      queryFn: async (formData) => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/users/avatar', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer mock_token',
            },
            body: formData,
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for upload avatar');
          // Fallback to mock data
          return { 
            data: { 
              avatar: 'https://via.placeholder.com/150',
              message: 'Avatar uploaded successfully (mock)'
            } 
          };
        }
      },
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} = usersApi;