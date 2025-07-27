import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  serialize?: boolean; // Whether to serialize data
}

class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100;

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // 设置缓存
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const { ttl = this.defaultTTL, serialize = true } = options;
    
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: ttl > 0 ? Date.now() + ttl : undefined,
    };

    // 内存缓存
    this.cache.set(key, item);
    
    // 清理过期缓存
    this.cleanup();
    
    // 持久化缓存
    if (serialize) {
      try {
        await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(item));
      } catch (error) {
        console.warn('Failed to persist cache item:', error);
      }
    }
  }

  // 获取缓存
  async get<T>(key: string, fallback?: T): Promise<T | undefined> {
    // 先检查内存缓存
    let item = this.cache.get(key);
    
    // 如果内存中没有，尝试从持久化存储中获取
    if (!item) {
      try {
        const stored = await AsyncStorage.getItem(`cache_${key}`);
        if (stored) {
          item = JSON.parse(stored);
          if (item) {
            this.cache.set(key, item);
          }
        }
      } catch (error) {
        console.warn('Failed to retrieve cache item:', error);
      }
    }

    if (!item) {
      return fallback;
    }

    // 检查是否过期
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.delete(key);
      return fallback;
    }

    return item.data;
  }

  // 删除缓存
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove cache item:', error);
    }
  }

  // 清空所有缓存
  async clear(): Promise<void> {
    this.cache.clear();
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  // 检查缓存是否存在且未过期
  async has(key: string): Promise<boolean> {
    const item = await this.get(key);
    return item !== undefined;
  }

  // 获取缓存大小
  size(): number {
    return this.cache.size;
  }

  // 获取所有缓存键
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // 清理过期缓存
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((item, key) => {
      if (item.expiresAt && now > item.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      AsyncStorage.removeItem(`cache_${key}`).catch(() => {});
    });

    // 如果缓存大小超过限制，删除最旧的项目
    if (this.cache.size > this.maxSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const itemsToRemove = sortedEntries.slice(0, this.cache.size - this.maxSize);
      itemsToRemove.forEach(([key]) => {
        this.cache.delete(key);
        AsyncStorage.removeItem(`cache_${key}`).catch(() => {});
      });
    }
  }

  // 获取缓存统计信息
  getStats(): {
    size: number;
    memoryUsage: number;
    oldestItem: number;
    newestItem: number;
  } {
    const items = Array.from(this.cache.values());
    const timestamps = items.map(item => item.timestamp);
    
    return {
      size: this.cache.size,
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length,
      oldestItem: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestItem: timestamps.length > 0 ? Math.max(...timestamps) : 0,
    };
  }

  // 预加载数据
  async preload<T>(key: string, dataLoader: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const data = await dataLoader();
    await this.set(key, data, options);
    return data;
  }

  // 批量设置
  async setMultiple<T>(items: Array<{ key: string; data: T; options?: CacheOptions }>): Promise<void> {
    const promises = items.map(({ key, data, options }) => this.set(key, data, options));
    await Promise.all(promises);
  }

  // 批量获取
  async getMultiple<T>(keys: string[]): Promise<Array<{ key: string; data: T | undefined }>> {
    const promises = keys.map(async key => ({
      key,
      data: await this.get<T>(key),
    }));
    return Promise.all(promises);
  }
}

// 创建单例实例
export const cacheManager = CacheManager.getInstance();

// 缓存装饰器
export function Cacheable(key: string, options: CacheOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${key}_${JSON.stringify(args)}`;
      
      // 尝试从缓存获取
      const cached = await cacheManager.get(cacheKey);
      if (cached !== undefined) {
        return cached;
      }

      // 执行原方法
      const result = await method.apply(this, args);
      
      // 缓存结果
      await cacheManager.set(cacheKey, result, options);
      
      return result;
    };
  };
}

// 缓存Hook
export function useCache<T>(key: string, dataLoader: () => Promise<T>, options: CacheOptions = {}) {
  const [data, setData] = React.useState<T | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await cacheManager.preload(key, dataLoader, options);
        
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [key]);

  const refresh = React.useCallback(async () => {
    await cacheManager.delete(key);
    setLoading(true);
    
    try {
      const result = await dataLoader();
      await cacheManager.set(key, result, options);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, dataLoader, options]);

  return { data, loading, error, refresh };
}

export default CacheManager;