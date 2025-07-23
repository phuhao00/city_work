// User related types
export interface User {
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

export enum UserRole {
  JOBSEEKER = 'jobseeker',
  EMPLOYER = 'employer',
  ADMIN = 'admin',
}

// Company related types
export interface Company {
  _id: string;
  name: string;
  logo?: string;
  description: string;
  industry: string;
  website?: string;
  location: string;
  size: string;
  foundedYear?: number;
  createdAt: string;
  updatedAt: string;
}

// Job related types
export interface Job {
  _id: string;
  title: string;
  description: string;
  type: JobType;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  isActive: boolean;
  companyId: string;
  company?: Company;
  createdAt: string;
  updatedAt: string;
}

export enum JobType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
}

// Application related types
export interface Application {
  _id: string;
  userId: string;
  jobId: string;
  coverLetter?: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  user?: User;
  job?: Job;
  createdAt: string;
  updatedAt: string;
}

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

// Saved Job related types
export interface SavedJob {
  _id: string;
  userId: string;
  jobId: string;
  user?: User;
  job?: Job;
  createdAt: string;
  updatedAt: string;
}

// Message related types
export interface Message {
  _id: string;
  content: string;
  senderId: string;
  recipientId: string;
  isRead: boolean;
  sender?: User;
  recipient?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: Message;
  unreadCount: number;
}

// API Response types
export interface LoginResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter types
export interface JobFilters {
  location?: string;
  type?: JobType;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  isActive?: boolean;
}

export interface CompanyFilters {
  industry?: string;
  location?: string;
  size?: string;
}

export interface SearchFilters {
  location?: string;
  type?: string;
  industry?: string;
}

// Search result types
export interface SearchResult {
  jobs: Job[];
  companies: Company[];
  users: User[];
  total: {
    jobs: number;
    companies: number;
    users: number;
  };
}

// Form types
export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface JobApplicationForm {
  coverLetter?: string;
  resumeUrl?: string;
}

export interface MessageForm {
  recipientId: string;
  content: string;
}