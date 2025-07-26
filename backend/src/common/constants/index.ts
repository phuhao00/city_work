// Backend Constants Configuration File
// This file centralizes all application constants to avoid hardcoded values

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
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
  DEFAULT_RESULTS_SIZE: 20,
  MAX_RESULTS_SIZE: 100,
  FUZZINESS: 'AUTO',
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  UPLOAD_PATH: 'uploads',
} as const;

// Cache Constants
export const CACHE = {
  DEFAULT_TTL: 3600, // 1 hour in seconds
  SHORT_TTL: 300, // 5 minutes
  LONG_TTL: 86400, // 24 hours
  SESSION_TTL: 86400, // 24 hours
} as const;

// Rate Limiting Constants
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  SKIP_SUCCESSFUL_REQUESTS: false,
  SKIP_FAILED_REQUESTS: false,
} as const;

// Validation Constants
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
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
  COMPANY_DESCRIPTION: {
    MAX_LENGTH: 2000,
  },
  JOB_DESCRIPTION: {
    MAX_LENGTH: 5000,
  },
} as const;

// Job Constants
export const JOB = {
  TYPES: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as const,
  STATUS: ['ACTIVE', 'INACTIVE', 'CLOSED'] as const,
  SALARY: {
    MIN: 0,
    MAX: 1000000,
  },
  SKILLS: {
    MAX_COUNT: 20,
  },
  APPLICATION_STATUS: ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'] as const,
} as const;

// User Constants
export const USER = {
  ROLES: ['JOBSEEKER', 'EMPLOYER', 'ADMIN'] as const,
  STATUS: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const,
  PROFILE: {
    MAX_EXPERIENCE_YEARS: 50,
    MAX_EDUCATION_ENTRIES: 10,
    MAX_WORK_EXPERIENCE_ENTRIES: 20,
    MAX_SKILLS: 50,
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
  STATUS: ['ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION'] as const,
} as const;

// Messaging Constants
export const MESSAGING = {
  MAX_MESSAGE_LENGTH: 1000,
  MAX_CONVERSATION_PARTICIPANTS: 10,
  MESSAGE_BATCH_SIZE: 50,
  MAX_ATTACHMENTS: 5,
} as const;

// Notification Constants
export const NOTIFICATIONS = {
  TYPES: ['JOB_APPLICATION', 'MESSAGE', 'JOB_MATCH', 'SYSTEM'] as const,
  MAX_UNREAD_COUNT: 99,
  RETENTION_DAYS: 30,
  BATCH_SIZE: 100,
} as const;

// Security Constants
export const SECURITY = {
  BCRYPT_SALT_ROUNDS: 12,
  JWT: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    ISSUER: 'city-work-api',
    ALGORITHM: 'HS256',
  },
  SESSION: {
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    SECURE: true,
    HTTP_ONLY: true,
    SAME_SITE: 'strict',
  },
  PASSWORD_RESET: {
    TOKEN_EXPIRY: 3600, // 1 hour in seconds
    MAX_ATTEMPTS: 5,
  },
} as const;

// Database Constants
export const DATABASE = {
  CONNECTION: {
    POOL_SIZE: 10,
    BUFFER_MAX_ENTRIES: 0,
    USE_NEW_URL_PARSER: true,
    USE_UNIFIED_TOPOLOGY: true,
    MAX_POOL_SIZE: 10,
    SERVER_SELECTION_TIMEOUT_MS: 5000,
    SOCKET_TIMEOUT_MS: 45000,
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

// Redis Constants
export const REDIS = {
  DEFAULT_TTL: 3600,
  CONNECTION: {
    RETRY_DELAY_ON_FAILOVER: 100,
    ENABLE_READY_CHECK: false,
    MAX_RETRIES_PER_REQUEST: 3,
    CONNECT_TIMEOUT: 10000,
    LAZY_CONNECT: true,
  },
} as const;

// Elasticsearch Constants
export const ELASTICSEARCH = {
  INDEXES: {
    JOBS: 'jobs',
    COMPANIES: 'companies',
    USERS: 'users',
  },
  SETTINGS: {
    REQUEST_TIMEOUT: 30000,
    PING_TIMEOUT: 3000,
    MAX_RETRIES: 3,
  },
  SEARCH: {
    DEFAULT_SIZE: 20,
    MAX_SIZE: 100,
    FUZZINESS: 'AUTO',
  },
} as const;

// API Constants
export const API = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  MAX_CONCURRENT_REQUESTS: 10,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// Email Constants
export const EMAIL = {
  TEMPLATES: {
    WELCOME: 'welcome',
    PASSWORD_RESET: 'password-reset',
    JOB_APPLICATION: 'job-application',
    JOB_MATCH: 'job-match',
  },
  SMTP: {
    DEFAULT_HOST: 'smtp.gmail.com',
    DEFAULT_PORT: 587,
    SECURE: false,
    TLS: true,
  },
} as const;

// Logging Constants
export const LOGGING = {
  LEVELS: ['error', 'warn', 'info', 'debug'] as const,
  MAX_FILE_SIZE: '20m',
  MAX_FILES: '14d',
  DATE_PATTERN: 'YYYY-MM-DD',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PASSWORD: 'Password does not meet requirements',
    INVALID_PHONE: 'Please enter a valid phone number',
    INVALID_URL: 'Please enter a valid URL',
    INVALID_DATE: 'Please enter a valid date',
    INVALID_ENUM: 'Invalid value for this field',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    USER_EXISTS: 'User already exists',
    USER_NOT_FOUND: 'User not found',
  },
  RESOURCE: {
    NOT_FOUND: 'Resource not found',
    ALREADY_EXISTS: 'Resource already exists',
    CREATION_FAILED: 'Failed to create resource',
    UPDATE_FAILED: 'Failed to update resource',
    DELETE_FAILED: 'Failed to delete resource',
  },
  DATABASE: {
    CONNECTION_ERROR: 'Database connection error',
    QUERY_ERROR: 'Database query error',
    TRANSACTION_ERROR: 'Database transaction error',
  },
  EXTERNAL_SERVICE: {
    ELASTICSEARCH_ERROR: 'Elasticsearch service error',
    REDIS_ERROR: 'Redis service error',
    EMAIL_SERVICE_ERROR: 'Email service error',
  },
  FILE: {
    UPLOAD_FAILED: 'File upload failed',
    INVALID_TYPE: 'Invalid file type',
    SIZE_EXCEEDED: 'File size exceeded',
    NOT_FOUND: 'File not found',
  },
  RATE_LIMIT: {
    EXCEEDED: 'Rate limit exceeded',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTER_SUCCESS: 'Registration successful',
    PASSWORD_RESET: 'Password reset email sent',
    PASSWORD_CHANGED: 'Password changed successfully',
  },
  RESOURCE: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    RETRIEVED: 'Resource retrieved successfully',
  },
  FILE: {
    UPLOAD_SUCCESS: 'File uploaded successfully',
    DELETE_SUCCESS: 'File deleted successfully',
  },
} as const;