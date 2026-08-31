import { ICache } from "@src/domain/interfaces/ICache";
import { getRedisClient } from "@src/infrastructure/persistence/redis";
import logger from "@src/shared/logger";

export type RedisCacheCommands = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options: { EX: number }): Promise<unknown>;
  del(key: string): Promise<unknown>;
};

class RedisCacheAdapter implements ICache {
  constructor(
    private readonly getClient: () => RedisCacheCommands | null = () =>
      getRedisClient() as RedisCacheCommands | null
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const client = this.getClient();
    if (!client) {
      return null;
    }

    try {
      const raw = await client.get(key);
      if (raw === null) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch (err) {
      logger.error(`Redis cache get failed for ${key}: ${(err as Error).message}`);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    const client = this.getClient();
    if (!client) {
      return;
    }

    try {
      await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (err) {
      logger.error(`Redis cache set failed for ${key}: ${(err as Error).message}`);
    }
  }

  async del(key: string): Promise<void> {
    const client = this.getClient();
    if (!client) {
      return;
    }

    try {
      await client.del(key);
    } catch (err) {
      logger.error(`Redis cache del failed for ${key}: ${(err as Error).message}`);
    }
  }
}

export default RedisCacheAdapter;
