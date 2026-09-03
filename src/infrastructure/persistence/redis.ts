import { createClient, type RedisClientType } from "redis";
import logger from "@src/shared/logger";

let client: RedisClientType | null = null;

export function getRedisClient(): RedisClientType | null {
  return client;
}

export async function connectRedis(): Promise<void> {
  if (client?.isOpen) {
    return;
  }

  const url = process.env.REDIS_URL;
  if (!url) {
    logger.warn("REDIS_URL is not defined — cache disabled");
    return;
  }

  try {
    const nextClient = createClient({ url });
    nextClient.on("error", (err: Error) => {
      logger.error(`Redis client error: ${err.message}`);
    });
    await nextClient.connect();
    client = nextClient;
    logger.info("Redis connected");
  } catch (err) {
    client = null;
    logger.error(`Redis connection error: ${(err as Error).message}`);
  }
}

export async function disconnectRedis(): Promise<void> {
  if (!client) {
    return;
  }

  try {
    await client.quit();
  } catch (err) {
    logger.error(`Redis disconnect error: ${(err as Error).message}`);
  } finally {
    client = null;
  }
}
