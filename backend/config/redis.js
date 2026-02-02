import { createClient } from 'redis';

// Initialize Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Redis max retries reached');
        return new Error('Redis connection failed');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

// Error handling
redisClient.on('error', (err) => {
  console.warn('⚠️ Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
  console.log('doeRedis connected');
});

redisClient.on('ready', () => {
  console.log('Redis ready');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

// Connect to Redis
export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    return true;
  } catch (error) {
    console.warn('⚠️ Redis connection failed:', error.message);
    console.warn('Caching will be disabled');
    return false;
  }
};

// Cache helper functions
export const cacheHelpers = {
  // Get cached data
  get: async (key) => {
    try {
      if (!redisClient.isOpen) return null;
      
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error.message);
      return null;
    }
  },

  // Set cached data with TTL (time to live in seconds)
  set: async (key, value, ttl = 3600) => {
    try {
      if (!redisClient.isOpen) return false;
      
      await redisClient.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis set error:', error.message);
      return false;
    }
  },

  // Delete cached data
  del: async (key) => {
    try {
      if (!redisClient.isOpen) return false;
      
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis del error:', error.message);
      return false;
    }
  },

  // Delete multiple keys by pattern
  delPattern: async (pattern) => {
    try {
      if (!redisClient.isOpen) return false;
      
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Redis delPattern error:', error.message);
      return false;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      if (!redisClient.isOpen) return false;
      
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Redis exists error:', error.message);
      return false;
    }
  },

  // Set expiration on existing key
  expire: async (key, ttl) => {
    try {
      if (!redisClient.isOpen) return false;
      
      await redisClient.expire(key, ttl);
      return true;
    } catch (error) {
      console.error('Redis expire error:', error.message);
      return false;
    }
  },

  // Increment counter
  incr: async (key) => {
    try {
      if (!redisClient.isOpen) return null;
      
      return await redisClient.incr(key);
    } catch (error) {
      console.error('Redis incr error:', error.message);
      return null;
    }
  },

  // Get TTL of a key
  ttl: async (key) => {
    try {
      if (!redisClient.isOpen) return -1;
      
      return await redisClient.ttl(key);
    } catch (error) {
      console.error('Redis ttl error:', error.message);
      return -1;
    }
  }
};

// Graceful shutdown
export const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log('✅ Redis disconnected gracefully');
    }
  } catch (error) {
    console.error('Error disconnecting Redis:', error.message);
  }
};

export { redisClient };
export default redisClient;
