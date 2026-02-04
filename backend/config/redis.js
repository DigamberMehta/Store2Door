import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error("❌ Redis max retries reached. Stopping reconnect.");
        return new Error("Redis reconnect failed");
      }
      return Math.min(retries * 200, 3000);
    },
  },
});

/* =========================
   EVENTS
========================= */

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

redisClient.on("ready", () => {
  console.log("🚀 Redis ready");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

redisClient.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

/* =========================
   CONNECT FUNCTION
========================= */

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    return true;
  } catch (error) {
    console.error("⚠️ Redis connection failed:", error.message);
    return false;
  }
};

/* =========================
   CACHE HELPERS
========================= */

export const cacheHelpers = {
  async get(key) {
    try {
      if (!redisClient.isOpen) return null;

      const data = await redisClient.get(key);
      if (!data) return null;

      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch (error) {
      console.error("Redis GET error:", error.message);
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    try {
      if (!redisClient.isOpen) return false;

      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);

      await redisClient.setEx(key, ttl, stringValue);
      return true;
    } catch (error) {
      console.error("Redis SET error:", error.message);
      return false;
    }
  },

  async del(key) {
    try {
      if (!redisClient.isOpen) return false;
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error("Redis DEL error:", error.message);
      return false;
    }
  },

  // Production-safe pattern delete using SCAN
  async delPattern(pattern) {
    try {
      if (!redisClient.isOpen) return false;

      const iterator = redisClient.scanIterator({
        MATCH: pattern,
        COUNT: 100,
      });

      for await (const key of iterator) {
        await redisClient.del(key);
      }

      return true;
    } catch (error) {
      console.error("Redis delPattern error:", error.message);
      return false;
    }
  },

  async exists(key) {
    try {
      if (!redisClient.isOpen) return false;
      return (await redisClient.exists(key)) === 1;
    } catch (error) {
      console.error("Redis EXISTS error:", error.message);
      return false;
    }
  },

  async expire(key, ttl) {
    try {
      if (!redisClient.isOpen) return false;
      await redisClient.expire(key, ttl);
      return true;
    } catch (error) {
      console.error("Redis EXPIRE error:", error.message);
      return false;
    }
  },

  async incr(key) {
    try {
      if (!redisClient.isOpen) return null;
      return await redisClient.incr(key);
    } catch (error) {
      console.error("Redis INCR error:", error.message);
      return null;
    }
  },

  async ttl(key) {
    try {
      if (!redisClient.isOpen) return -1;
      return await redisClient.ttl(key);
    } catch (error) {
      console.error("Redis TTL error:", error.message);
      return -1;
    }
  },
};

/* =========================
   GRACEFUL SHUTDOWN
========================= */

export const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log("👋 Redis disconnected gracefully");
    }
  } catch (error) {
    console.error("Redis disconnect error:", error.message);
  }
};

// Handle app termination
process.on("SIGINT", async () => {
  await disconnectRedis();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectRedis();
  process.exit(0);
});

export { redisClient };
export default redisClient;
