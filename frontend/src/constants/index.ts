// Constants Configuration File
// This file centralizes all application constants to avoid hardcoded values

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Search Constants
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEBOUNCE_DELAY: 300, // milliseconds
  DEFAULT_RESULTS_SIZE: 20,
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for large file uploads
} as const;

// Cache Constants
export const CACHE = {
  DEFAULT_TTL: 3600, // 1 hour in seconds
  SHORT_TTL: 300, // 5 minutes
  LONG_TTL: 86400, // 24 hours
} as const;

// Rate Limiting Constants
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  SKIP_SUCCESSFUL_REQUESTS: false,
} as const;

// Validation Constants
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    MAX_LENGTH: 254,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
  },
  BIO: {
    MAX_LENGTH: 500,
  },
  MESSAGE: {
    MAX_LENGTH: 1000,
  },
} as const;

// Job Constants
export const JOB = {
  TYPES: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as const,
  SALARY: {
    MIN: 0,
    MAX: 1000000,
  },
  SKILLS: {
    MAX_COUNT: 20,
  },
} as const;

// User Constants
export const USER = {
  ROLES: ['JOBSEEKER', 'EMPLOYER', 'ADMIN'] as const,
  PROFILE: {
    MAX_EXPERIENCE_YEARS: 50,
    MAX_EDUCATION_ENTRIES: 10,
    MAX_WORK_EXPERIENCE_ENTRIES: 20,
  },
} as const;

// Company Constants
export const COMPANY = {
  SIZE_RANGES: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] as const,
  INDUSTRIES: [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Construction',
    'Transportation',
    'Entertainment',
    'Government',
    'Non-profit',
    'Other'
  ] as const,
} as const;

// Messaging Constants
export const MESSAGING = {
  MAX_MESSAGE_LENGTH: 1000,
  MAX_CONVERSATION_PARTICIPANTS: 10,
  TYPING_INDICATOR_TIMEOUT: 3000, // 3 seconds
  MESSAGE_BATCH_SIZE: 50,
} as const;

// Notification Constants
export const NOTIFICATIONS = {
  TYPES: ['JOB_APPLICATION', 'MESSAGE', 'JOB_MATCH', 'SYSTEM'] as const,
  MAX_UNREAD_COUNT: 99,
  RETENTION_DAYS: 30,
} as const;

// Security Constants
export const SECURITY = {
  BCRYPT_SALT_ROUNDS: 12,
  JWT: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    ISSUER: 'city-work-api',
  },
  SESSION: {
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    SECURE: true,
    HTTP_ONLY: true,
  },
} as const;

// API Constants
export const API = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  MAX_CONCURRENT_REQUESTS: 10,
} as const;

// Database Constants
export const DATABASE = {
  CONNECTION: {
    POOL_SIZE: 10,
    BUFFER_MAX_ENTRIES: 0,
    USE_NEW_URL_PARSER: true,
    USE_UNIFIED_TOPOLOGY: true,
  },
  INDEXES: {
    TEXT_SEARCH_WEIGHT: {
      title: 10,
      description: 5,
      skills: 3,
      location: 2,
    },
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PASSWORD: 'Password does not meet requirements',
    INVALID_PHONE: 'Please enter a valid phone number',
    INVALID_URL: 'Please enter a valid URL',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    ACCOUNT_LOCKED: 'Your account has been temporarily locked',
  },
  GENERAL: {
    NETWORK_ERROR: 'Network error. Please check your connection',
    SERVER_ERROR: 'Server error. Please try again later',
    NOT_FOUND: 'The requested resource was not found',
    RATE_LIMITED: 'Too many requests. Please try again later',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Successfully logged in',
    LOGOUT_SUCCESS: 'Successfully logged out',
    REGISTER_SUCCESS: 'Account created successfully',
    PASSWORD_RESET: 'Password reset email sent',
  },
  PROFILE: {
    UPDATE_SUCCESS: 'Profile updated successfully',
    PHOTO_UPLOAD_SUCCESS: 'Profile photo updated successfully',
  },
  JOB: {
    APPLICATION_SUCCESS: 'Application submitted successfully',
    SAVE_SUCCESS: 'Job saved successfully',
    CREATE_SUCCESS: 'Job posted successfully',
    UPDATE_SUCCESS: 'Job updated successfully',
  },
  MESSAGE: {
    SENT_SUCCESS: 'Message sent successfully',
    READ_SUCCESS: 'Message marked as read',
  },
} as const;