import { apiSlice } from './api';

export interface UserProfile {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
  };
  preferences: {
    skills: string[];
    preferredLocation: string;
    salaryRange: {
      min: number;
      max: number;
    };
    experienceLevel: string;
    jobTypes: string[];
    remoteWork: boolean;
    companySize: string[];
    industries: string[];
  };
  privacy: {
    profileVisibility: string;
    contactInfo: string;
    jobAlerts: boolean;
    marketingEmails: boolean;
  };
}

// User Profile API endpoints
export const userProfileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get user profile
    getUserProfile: builder.query<UserProfile, void>({
      queryFn: async () => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/user/profile', {
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
          console.log('Using mock data for user profile');
          // Fallback to mock data
          const mockProfile: UserProfile = {
            personalInfo: {
              name: 'John Doe',
              email: 'john.doe@example.com',
              phone: '+1 (555) 123-4567',
              location: 'San Francisco, CA',
              bio: 'Experienced software developer with a passion for creating innovative solutions.',
            },
            preferences: {
              skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
              preferredLocation: 'San Francisco, CA',
              salaryRange: {
                min: 80000,
                max: 120000,
              },
              experienceLevel: 'mid',
              jobTypes: ['full-time', 'contract'],
              remoteWork: true,
              companySize: ['startup', 'medium'],
              industries: ['technology', 'fintech'],
            },
            privacy: {
              profileVisibility: 'public',
              contactInfo: 'registered',
              jobAlerts: true,
              marketingEmails: false,
            },
          };
          return { data: mockProfile };
        }
      },
      providesTags: ['UserProfile'],
    }),

    // Update user profile
    updateUserProfile: builder.mutation<UserProfile, Partial<UserProfile>>({
      queryFn: async (profileData) => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/user/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock_token',
            },
            body: JSON.stringify(profileData),
          });
          
          if (response.ok) {
            const data = await response.json();
            return { data };
          }
          throw new Error('API not available');
        } catch (error) {
          console.log('Using mock data for update user profile');
          // Fallback to mock data - simulate success
          const updatedProfile: UserProfile = {
            personalInfo: {
              name: profileData.personalInfo?.name || 'John Doe',
              email: profileData.personalInfo?.email || 'john.doe@example.com',
              phone: profileData.personalInfo?.phone || '+1 (555) 123-4567',
              location: profileData.personalInfo?.location || 'San Francisco, CA',
              bio: profileData.personalInfo?.bio || 'Experienced software developer with a passion for creating innovative solutions.',
            },
            preferences: {
              skills: profileData.preferences?.skills || ['JavaScript', 'React', 'Node.js', 'TypeScript'],
              preferredLocation: profileData.preferences?.preferredLocation || 'San Francisco, CA',
              salaryRange: profileData.preferences?.salaryRange || { min: 80000, max: 120000 },
              experienceLevel: profileData.preferences?.experienceLevel || 'mid',
              jobTypes: profileData.preferences?.jobTypes || ['full-time', 'contract'],
              remoteWork: profileData.preferences?.remoteWork ?? true,
              companySize: profileData.preferences?.companySize || ['startup', 'medium'],
              industries: profileData.preferences?.industries || ['technology', 'fintech'],
            },
            privacy: {
              profileVisibility: profileData.privacy?.profileVisibility || 'public',
              contactInfo: profileData.privacy?.contactInfo || 'registered',
              jobAlerts: profileData.privacy?.jobAlerts ?? true,
              marketingEmails: profileData.privacy?.marketingEmails ?? false,
            },
          };
          return { data: updatedProfile };
        }
      },
      invalidatesTags: ['UserProfile'],
    }),

    // Upload profile picture
    uploadProfilePicture: builder.mutation<{ url: string }, FormData>({
      queryFn: async (formData) => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/user/profile/picture', {
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
          console.log('Using mock data for upload profile picture');
          // Fallback to mock data
          return { data: { url: 'https://via.placeholder.com/150' } };
        }
      },
      invalidatesTags: ['UserProfile'],
    }),

    // Delete user account
    deleteUserAccount: builder.mutation<void, void>({
      queryFn: async () => {
        try {
          // Try real API first
          const response = await fetch('http://localhost:3000/api/user/account', {
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
          console.log('Using mock data for delete user account');
          // Fallback to mock data - simulate success
          return { data: undefined };
        }
      },
      invalidatesTags: ['UserProfile'],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUploadProfilePictureMutation,
  useDeleteUserAccountMutation,
} = userProfileApi;