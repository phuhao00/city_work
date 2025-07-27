import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// 速率限制配置
export const createRateLimiter = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || {
      error: 'Too many requests',
      message: '请求过于频繁，请稍后再试',
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: '请求频率超限，请稍后再试',
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

// 不同类型的速率限制器
export const rateLimiters = {
  // 通用API限制：每15分钟100个请求
  general: createRateLimiter(15 * 60 * 1000, 100),
  
  // 认证相关：每15分钟5次尝试
  auth: createRateLimiter(15 * 60 * 1000, 5, '登录尝试过于频繁'),
  
  // 搜索API：每分钟30个请求
  search: createRateLimiter(60 * 1000, 30),
  
  // 上传文件：每小时10次
  upload: createRateLimiter(60 * 60 * 1000, 10),
  
  // 发送消息：每分钟20条
  messaging: createRateLimiter(60 * 1000, 20),
  
  // 严格限制：每小时5次（用于敏感操作）
  strict: createRateLimiter(60 * 60 * 1000, 5),
};

// 安全中间件配置
export const securityMiddleware = [
  // Helmet - 设置各种HTTP头
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", 'https://api.citywork.com'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),

  // CORS配置
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://citywork.com', 'https://app.citywork.com']
      : ['http://localhost:3000', 'http://localhost:8082'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),

  // 压缩响应
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),
];

// JWT认证中间件
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      message: '需要访问令牌',
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        error: 'Invalid token',
        message: '无效的访问令牌',
      });
    }
    req.user = user;
    next();
  });
};

// 角色权限中间件
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: '需要身份验证',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: '权限不足',
      });
    }

    next();
  };
};

// 输入验证中间件
export const validateInput = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: '输入验证失败',
        details: errors.array(),
      });
    }

    next();
  };
};

// 常用验证规则
export const validationRules = {
  email: body('email').isEmail().normalizeEmail(),
  password: body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  phone: body('phone').isMobilePhone('zh-CN'),
  name: body('name').isLength({ min: 2, max: 50 }).trim(),
  jobTitle: body('title').isLength({ min: 5, max: 100 }).trim(),
  company: body('company').isLength({ min: 2, max: 100 }).trim(),
  salary: body('salary').isNumeric().isInt({ min: 0 }),
  description: body('description').isLength({ min: 10, max: 2000 }).trim(),
};

// API密钥验证中间件
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: '需要API密钥',
    });
  }

  // 验证API密钥（这里应该从数据库或配置中获取有效的密钥）
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey as string)) {
    return res.status(403).json({
      error: 'Invalid API key',
      message: '无效的API密钥',
    });
  }

  next();
};

// 请求日志中间件
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, ip, headers } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      method,
      url,
      statusCode,
      duration,
      ip,
      userAgent: headers['user-agent'],
      userId: req.user?.id,
    }));
  });

  next();
};

// 错误处理中间件
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: '无效的令牌',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: '令牌已过期',
    });
  }

  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: '数据验证失败',
      details: err.details,
    });
  }

  // 数据库错误
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: '数据已存在',
    });
  }

  // 默认错误
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    message: '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 文件上传安全检查
export const fileUploadSecurity = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  const { mimetype, size, originalname } = req.file;
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  // 检查文件大小
  if (size > maxSize) {
    return res.status(400).json({
      error: 'File too large',
      message: '文件大小超过限制（5MB）',
    });
  }

  // 检查文件类型
  if (!allowedTypes.includes(mimetype)) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: '不支持的文件类型',
    });
  }

  // 检查文件名
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.js', '.vbs'];
  const hasExtension = dangerousExtensions.some(ext => 
    originalname.toLowerCase().endsWith(ext)
  );

  if (hasExtension) {
    return res.status(400).json({
      error: 'Dangerous file extension',
      message: '危险的文件扩展名',
    });
  }

  next();
};

// IP白名单中间件
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(clientIP as string)) {
      return res.status(403).json({
        error: 'IP not allowed',
        message: 'IP地址不在白名单中',
      });
    }

    next();
  };
};

// 数据加密工具
export const encryptionUtils = {
  // 加密敏感数据
  encrypt: (text: string, key?: string): string => {
    const secretKey = key || process.env.ENCRYPTION_KEY || 'default-key';
    const cipher = crypto.createCipher('aes-256-cbc', secretKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  },

  // 解密数据
  decrypt: (encryptedText: string, key?: string): string => {
    const secretKey = key || process.env.ENCRYPTION_KEY || 'default-key';
    const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  },

  // 生成哈希
  hash: (text: string): string => {
    return crypto.createHash('sha256').update(text).digest('hex');
  },

  // 生成随机令牌
  generateToken: (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
  },
};

// 密码工具
export const passwordUtils = {
  // 哈希密码
  hash: async (password: string): Promise<string> => {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  },

  // 验证密码
  verify: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },

  // 生成强密码
  generate: (length: number = 12): string => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  },

  // 检查密码强度
  checkStrength: (password: string): {
    score: number;
    feedback: string[];
  } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('密码长度至少8位');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('需要包含小写字母');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('需要包含大写字母');

    if (/\d/.test(password)) score += 1;
    else feedback.push('需要包含数字');

    if (/[!@#$%^&*]/.test(password)) score += 1;
    else feedback.push('需要包含特殊字符');

    return { score, feedback };
  },
};

// 安全配置导出
export const securityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: '24h',
    refreshExpiresIn: '7d',
  },
  bcrypt: {
    saltRounds: 12,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 最大请求数
  },
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://citywork.com']
      : ['http://localhost:3000', 'http://localhost:8082'],
  },
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
    ],
  },
};

export default {
  rateLimiters,
  securityMiddleware,
  authenticateToken,
  requireRole,
  validateInput,
  validationRules,
  validateApiKey,
  requestLogger,
  errorHandler,
  fileUploadSecurity,
  ipWhitelist,
  encryptionUtils,
  passwordUtils,
  securityConfig,
};