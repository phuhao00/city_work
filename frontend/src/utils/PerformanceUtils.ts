import { InteractionManager, Platform } from 'react-native';
import { cacheManager } from './CacheManager';

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 延迟执行直到交互完成
export function runAfterInteractions<T>(callback: () => T): Promise<T> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      resolve(callback());
    });
  });
}

// 批量处理函数
export function batchProcessor<T, R>(
  processor: (items: T[]) => Promise<R[]>,
  batchSize: number = 10,
  delay: number = 0
) {
  const queue: T[] = [];
  const results: R[] = [];
  let processing = false;

  const processQueue = async () => {
    if (processing || queue.length === 0) return;
    
    processing = true;
    
    while (queue.length > 0) {
      const batch = queue.splice(0, batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
      
      if (delay > 0 && queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    processing = false;
  };

  return {
    add: (item: T) => {
      queue.push(item);
      processQueue();
    },
    addBatch: (items: T[]) => {
      queue.push(...items);
      processQueue();
    },
    getResults: () => [...results],
    clear: () => {
      queue.length = 0;
      results.length = 0;
    },
    isProcessing: () => processing,
  };
}

// 内存优化工具
export class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private memoryWarningThreshold = 0.8; // 80%
  private cleanupCallbacks: Array<() => void> = [];

  private constructor() {
    this.setupMemoryWarning();
  }

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer();
    }
    return MemoryOptimizer.instance;
  }

  // 设置内存警告监听
  private setupMemoryWarning() {
    if (Platform.OS === 'ios') {
      // iOS 内存警告处理
      // 在实际项目中可以使用 react-native-device-info
    } else if (Platform.OS === 'android') {
      // Android 内存警告处理
    }
  }

  // 注册清理回调
  registerCleanupCallback(callback: () => void) {
    this.cleanupCallbacks.push(callback);
  }

  // 执行内存清理
  cleanup() {
    console.log('Performing memory cleanup...');
    
    // 执行注册的清理回调
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Cleanup callback error:', error);
      }
    });

    // 清理缓存
    this.cleanupCache();
    
    // 强制垃圾回收（如果可用）
    if (global.gc) {
      global.gc();
    }
  }

  // 清理缓存
  private async cleanupCache() {
    try {
      const stats = cacheManager.getStats();
      if (stats.size > 50) { // 如果缓存项目超过50个
        await cacheManager.clear();
        console.log('Cache cleared due to memory pressure');
      }
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }

  // 监控内存使用
  monitorMemoryUsage() {
    // 在实际项目中可以使用 react-native-device-info 获取内存信息
    const mockMemoryUsage = Math.random() * 100;
    
    if (mockMemoryUsage > this.memoryWarningThreshold * 100) {
      console.warn('High memory usage detected:', mockMemoryUsage + '%');
      this.cleanup();
    }
    
    return mockMemoryUsage;
  }
}

// 图片优化工具
export class ImageOptimizer {
  // 计算最优图片尺寸
  static calculateOptimalSize(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;
    
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  // 生成响应式图片URL
  static generateResponsiveUrl(
    baseUrl: string,
    width: number,
    quality: number = 80
  ): string {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}w=${width}&q=${quality}&auto=format`;
  }

  // 预加载关键图片
  static async preloadCriticalImages(urls: string[]): Promise<void> {
    const preloadPromises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => reject(new Error(`Failed to load ${url}`));
        image.src = url;
      });
    });

    try {
      await Promise.all(preloadPromises);
      console.log('Critical images preloaded successfully');
    } catch (error) {
      console.warn('Failed to preload some critical images:', error);
    }
  }
}

// 网络请求优化工具
export class NetworkOptimizer {
  private static requestQueue: Map<string, Promise<any>> = new Map();
  private static retryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  };

  // 请求去重
  static async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }

    const promise = requestFn().finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  // 带重试的请求
  static async requestWithRetry<T>(
    requestFn: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      shouldRetry?: (error: any) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = this.retryConfig.maxRetries,
      baseDelay = this.retryConfig.baseDelay,
      maxDelay = this.retryConfig.maxDelay,
      shouldRetry = () => true,
    } = options;

    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries || !shouldRetry(error)) {
          throw error;
        }

        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // 并发请求控制
  static async concurrentRequests<T>(
    requests: Array<() => Promise<T>>,
    concurrency: number = 3
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<any>[] = [];

    for (const request of requests) {
      const promise = request().then(result => {
        results.push(result);
        executing.splice(executing.indexOf(promise), 1);
      });

      executing.push(promise);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
    return results;
  }
}

// 性能监控工具
export class PerformanceTracker {
  private static marks: Map<string, number> = new Map();
  private static measures: Array<{ name: string; duration: number; timestamp: number }> = [];

  // 开始性能标记
  static mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  // 结束性能标记并测量
  static measure(name: string, startMark?: string): number {
    const endTime = performance.now();
    const startTime = startMark ? this.marks.get(startMark) : this.marks.get(name);
    
    if (startTime === undefined) {
      console.warn(`Performance mark "${startMark || name}" not found`);
      return 0;
    }

    const duration = endTime - startTime;
    
    this.measures.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    // 清理标记
    if (!startMark) {
      this.marks.delete(name);
    }

    return duration;
  }

  // 获取性能报告
  static getReport(): {
    averageDuration: number;
    totalMeasures: number;
    slowestOperation: { name: string; duration: number } | null;
    recentMeasures: Array<{ name: string; duration: number; timestamp: number }>;
  } {
    if (this.measures.length === 0) {
      return {
        averageDuration: 0,
        totalMeasures: 0,
        slowestOperation: null,
        recentMeasures: [],
      };
    }

    const totalDuration = this.measures.reduce((sum, measure) => sum + measure.duration, 0);
    const averageDuration = totalDuration / this.measures.length;
    
    const slowestOperation = this.measures.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest
    );

    const recentMeasures = this.measures.slice(-10); // 最近10次测量

    return {
      averageDuration,
      totalMeasures: this.measures.length,
      slowestOperation,
      recentMeasures,
    };
  }

  // 清理性能数据
  static clear(): void {
    this.marks.clear();
    this.measures.length = 0;
  }
}

// 导出单例实例
export const memoryOptimizer = MemoryOptimizer.getInstance();

// 性能优化装饰器
export function performanceTrack(name?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const trackName = name || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      PerformanceTracker.mark(trackName);
      
      try {
        const result = await method.apply(this, args);
        const duration = PerformanceTracker.measure(trackName);
        
        if (duration > 1000) { // 如果执行时间超过1秒，记录警告
          console.warn(`Slow operation detected: ${trackName} took ${duration.toFixed(2)}ms`);
        }
        
        return result;
      } catch (error) {
        PerformanceTracker.measure(trackName);
        throw error;
      }
    };
  };
}

export default {
  debounce,
  throttle,
  runAfterInteractions,
  batchProcessor,
  MemoryOptimizer,
  ImageOptimizer,
  NetworkOptimizer,
  PerformanceTracker,
  memoryOptimizer,
  performanceTrack,
};