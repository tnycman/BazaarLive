// Cache Service - Enterprise-grade caching layer
import Redis from 'ioredis';
import { Logger } from '../middleware/Logger.js';

export interface CacheConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    retryDelayOnFailover?: number;
    maxRetriesPerRequest?: number;
  };
  defaultTTL: number;
  keyPrefix: string;
  enableCompression: boolean;
  maxKeyLength: number;
}

export class CacheService {
  private redis: Redis;
  private logger: Logger;
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
    this.logger = new Logger('CacheService');
    
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db || 0,
      retryDelayOnFailover: config.redis.retryDelayOnFailover || 100,
      maxRetriesPerRequest: config.redis.maxRetriesPerRequest || 3,
      keyPrefix: config.keyPrefix
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error', { error: error.message });
    });

    this.redis.on('connect', () => {
      this.logger.info('Connected to Redis');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      const finalTTL = ttl || this.config.defaultTTL;
      
      await this.redis.setex(key, finalTTL, serialized);
      return true;
    } catch (error) {
      this.logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      this.logger.error('Cache delete error', { key, error: error.message });
      return false;
    }
  }

  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      const result = await this.redis.del(...keys);
      this.logger.debug('Invalidated cache keys', { pattern, count: result });
      return result;
    } catch (error) {
      this.logger.error('Cache pattern invalidation error', { pattern, error: error.message });
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error('Cache exists check error', { key, error: error.message });
      return false;
    }
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, amount);
    } catch (error) {
      this.logger.error('Cache increment error', { key, amount, error: error.message });
      return 0;
    }
  }

  async setMultiple(items: Array<{ key: string; value: any; ttl?: number }>): Promise<boolean> {
    try {
      const pipeline = this.redis.pipeline();
      
      for (const item of items) {
        const serialized = JSON.stringify(item.value);
        const ttl = item.ttl || this.config.defaultTTL;
        pipeline.setex(item.key, ttl, serialized);
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      this.logger.error('Cache setMultiple error', { count: items.length, error: error.message });
      return false;
    }
  }

  async getMultiple<T>(keys: string[]): Promise<Array<T | null>> {
    try {
      const values = await this.redis.mget(...keys);
      return values.map(value => value ? JSON.parse(value) as T : null);
    } catch (error) {
      this.logger.error('Cache getMultiple error', { keys, error: error.message });
      return keys.map(() => null);
    }
  }
}

// Factory function
export function createCacheService(config?: Partial<CacheConfig>): CacheService {
  const defaultConfig: CacheConfig = {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0')
    },
    defaultTTL: 300, // 5 minutes
    keyPrefix: 'bazaar:',
    enableCompression: false,
    maxKeyLength: 250
  };

  return new CacheService({ ...defaultConfig, ...config });
}
