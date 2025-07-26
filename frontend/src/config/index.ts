// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || (__DEV__ 
    ? 'http://localhost:3000/api' 
    : 'https://your-production-api.com/api'),
  TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000'),
  RETRY_ATTEMPTS: 3,
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'City Work',
  VERSION: '1.0.0',
  ENVIRONMENT: __DEV__ ? 'development' : 'production',
};

// Storage Keys
const STORAGE_PREFIX = process.env.EXPO_PUBLIC_STORAGE_PREFIX || '@city_work:';
export const STORAGE_KEYS = {
  AUTH_TOKEN: `${STORAGE_PREFIX}auth_token`,
  USER_DATA: `${STORAGE_PREFIX}user_data`,
  THEME: `${STORAGE_PREFIX}theme`,
  LANGUAGE: `${STORAGE_PREFIX}language`,
  ONBOARDING_COMPLETED: `${STORAGE_PREFIX}onboarding_completed`,
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
  MAX_FILE_SIZE: parseInt(process.env.EXPO_PUBLIC_MAX_FILE_SIZE || '5242880'), // 5MB default
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_FILE_TYPES: process.env.EXPO_PUBLIC_ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'application/pdf'],
};

// Validation Configuration
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_REGEX: /^[a-zA-Z\s]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: parseInt(process.env.EXPO_PUBLIC_NAME_MAX_LENGTH || '50'),
  BIO_MAX_LENGTH: parseInt(process.env.EXPO_PUBLIC_BIO_MAX_LENGTH || '500'),
  MESSAGE_MAX_LENGTH: parseInt(process.env.EXPO_PUBLIC_MESSAGE_MAX_LENGTH || '1000'),
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
  PUSH_NOTIFICATIONS_ENABLED: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true',
  ANALYTICS_ENABLED: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true' || !__DEV__,
  CRASH_REPORTING_ENABLED: !__DEV__,
  DARK_MODE_ENABLED: true,
  BIOMETRIC_AUTH_ENABLED: true,
  DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG === 'true' || __DEV__,
};