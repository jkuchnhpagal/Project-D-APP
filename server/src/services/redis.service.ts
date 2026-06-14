import { createClient } from "redis";

class RedisService {
  private client: ReturnType<typeof createClient> | null = null;
  private memoryCache = new Map<string, { value: string; expires: number }>();
  private isConnected = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    this.client = createClient({ url: redisUrl });

    let hasLoggedError = false;
    this.client.on("error", (err) => {
      if (!hasLoggedError) {
        console.warn("Redis Client Offline, falling back to local memory cache:", err.message);
        hasLoggedError = true;
      }
      this.isConnected = false;
    });

    this.client.on("connect", () => {
      console.log("Redis cache successfully connected");
      this.isConnected = true;
      hasLoggedError = false;
    });

    this.client.connect().catch((err) => {
      if (!hasLoggedError) {
        console.warn("Could not bootstrap Redis, using in-memory fallback:", err.message);
        hasLoggedError = true;
      }
      this.isConnected = false;
    });
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch (err) {
        console.error("Redis get failed, checking memory fallback:", err);
      }
    }
    const cached = this.memoryCache.get(key);
    if (cached) {
      if (cached.expires > Date.now()) {
        return cached.value;
      }
      this.memoryCache.delete(key);
    }
    return null;
  }

  async set(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.setEx(key, ttlSeconds, value);
        return;
      } catch (err) {
        console.error("Redis set failed, setting in memory fallback:", err);
      }
    }
    this.memoryCache.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (err) {
        console.error("Redis del failed, removing in memory fallback:", err);
      }
    }
    this.memoryCache.delete(key);
  }
}

export const cache = new RedisService();
export default cache;
