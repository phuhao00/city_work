import { ConfigService } from '@nestjs/config';

export class AppConfig {
  constructor(private configService: ConfigService) {}

  // Application Configuration
  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get apiPrefix(): string {
    return this.configService.get<string>('API_PREFIX', 'api');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  // Database Configuration
  get mongodbUri(): string {
    return this.configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/city_work');
  }

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL', this.mongodbUri);
  }

  // Redis Configuration
  get redisConfig() {
    return {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      retryDelayOnFailover: this.configService.get<number>('REDIS_RETRY_DELAY', 100),
      enableReadyCheck: this.configService.get<boolean>('REDIS_READY_CHECK', false),
      maxRetriesPerRequest: this.configService.get<number>('REDIS_MAX_RETRIES') || null,
      connectTimeout: this.configService.get<number>('REDIS_CONNECT_TIMEOUT', 10000),
      lazyConnect: this.configService.get<boolean>('REDIS_LAZY_CONNECT', true),
    };
  }

  // Elasticsearch Configuration
  get elasticsearchConfig() {
    const config: any = {
      node: this.configService.get<string>('ELASTICSEARCH_NODE', 'http://localhost:9200'),
      requestTimeout: this.configService.get<number>('ELASTICSEARCH_REQUEST_TIMEOUT', 30000),
      pingTimeout: this.configService.get<number>('ELASTICSEARCH_PING_TIMEOUT', 3000),
      maxRetries: this.configService.get<number>('ELASTICSEARCH_MAX_RETRIES', 3),
    };

    const username = this.configService.get<string>('ELASTICSEARCH_USERNAME');
    const password = this.configService.get<string>('ELASTICSEARCH_PASSWORD');
    
    if (username && password) {
      config.auth = { username, password };
    }

    const sslEnabled = this.configService.get<boolean>('ELASTICSEARCH_SSL_ENABLED', false);
    if (sslEnabled) {
      config.ssl = {
        rejectUnauthorized: this.configService.get<boolean>('ELASTICSEARCH_SSL_VERIFY', true),
      };
    }

    return config;
  }

  // JWT Configuration
  get jwtConfig() {
    return {
      secret: this.configService.get<string>('JWT_SECRET', 'default-secret-change-in-production'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
    };
  }

  // File Upload Configuration
  get fileUploadConfig() {
    return {
      uploadDir: this.configService.get<string>('UPLOAD_DIR', 'uploads'),
      maxFileSize: this.configService.get<number>('MAX_FILE_SIZE', 5242880), // 5MB
    };
  }

  // CORS Configuration
  get corsConfig() {
    return {
      origin: this.configService.get<string>('CORS_ORIGIN', '*'),
      credentials: this.configService.get<boolean>('CORS_CREDENTIALS', true),
    };
  }

  // Rate Limiting Configuration
  get rateLimitConfig() {
    return {
      ttl: this.configService.get<number>('RATE_LIMIT_TTL', 60),
      limit: this.configService.get<number>('RATE_LIMIT_LIMIT', 100),
    };
  }

  // Email Configuration
  get emailConfig() {
    return {
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      user: this.configService.get<string>('SMTP_USER'),
      pass: this.configService.get<string>('SMTP_PASS'),
    };
  }

  // Pagination Configuration
  get paginationConfig() {
    return {
      defaultPageSize: this.configService.get<number>('DEFAULT_PAGE_SIZE', 10),
      maxPageSize: this.configService.get<number>('MAX_PAGE_SIZE', 50),
    };
  }

  // Cache Configuration
  get cacheConfig() {
    return {
      ttl: this.configService.get<number>('CACHE_TTL', 3600), // 1 hour
      sessionTtl: this.configService.get<number>('SESSION_TTL', 86400), // 24 hours
    };
  }

  // Search Configuration
  get searchConfig() {
    return {
      resultsSize: this.configService.get<number>('SEARCH_RESULTS_SIZE', 20),
    };
  }

  // Security Configuration
  get securityConfig() {
    return {
      bcryptSaltRounds: this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10),
    };
  }
}