// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000' 
    : 'https://your-production-api.com',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'City Work',
  VERSION: '1.0.0',
  ENVIRONMENT: __DEV__ ? 'development' : 'production',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@city_work:auth_token',
  USER_DATA: '@city_work:user_data',
  THEME: '@city_work:theme',
  LANGUAGE: '@city_work:language',
  ONBOARDING_COMPLETED: '@city_work:onboarding_completed',
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  
  // Users
  USERS: '/users',
  USER_PROFILE: '/users/profile',
  
  // Jobs
  JOBS: '/jobs',
  JOB_APPLY: (jobId: string) => `/jobs/${jobId}/apply`,
  JOB_SAVE: (jobId: string) => `/jobs/${jobId}/save`,
  JOB_UNSAVE: (jobId: string) => `/jobs/${jobId}/unsave`,
  SAVED_JOBS: '/jobs/saved',
  USER_APPLICATIONS: '/jobs/applications/user',
  
  // Companies
  COMPANIES: '/companies',
  
  // Search
  SEARCH_JOBS: '/search/jobs',
  SEARCH_COMPANIES: '/search/companies',
  SEARCH_USERS: '/search/users',
  SEARCH_ALL: '/search/all',
  
  // Messaging
  SEND_MESSAGE: '/messaging/send',
  CONVERSATIONS: '/messaging/conversations',
  CONVERSATION: (userId: string) => `/messaging/conversation/${userId}`,
  MARK_READ: (messageId: string) => `/messaging/mark-read/${messageId}`,
  MARK_CONVERSATION_READ: (userId: string) => `/messaging/mark-conversation-read/${userId}`,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
};

// File Upload
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 500,
  MESSAGE_MAX_LENGTH: 1000,
};

// Theme
export const THEME = {
  COLORS: {
    PRIMARY: '#007AFF',
    SECONDARY: '#5856D6',
    SUCCESS: '#34C759',
    WARNING: '#FF9500',
    ERROR: '#FF3B30',
    BACKGROUND: '#F2F2F7',
    SURFACE: '#FFFFFF',
    TEXT_PRIMARY: '#000000',
    TEXT_SECONDARY: '#8E8E93',
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
  },
};

// Feature Flags
export const FEATURES = {
  MESSAGING_ENABLED: true,
  PUSH_NOTIFICATIONS_ENABLED: true,
  ANALYTICS_ENABLED: !__DEV__,
  CRASH_REPORTING_ENABLED: !__DEV__,
  DARK_MODE_ENABLED: true,
  BIOMETRIC_AUTH_ENABLED: true,
};