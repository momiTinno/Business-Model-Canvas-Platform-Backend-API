import IORedis from "ioredis";

import { queueConfig } from "../config/queue.config.js";

export class RedisConnection {
  constructor() {
    this.connection = new IORedis({
      ...queueConfig.redis,
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
  }

  duplicate = () => this.connection.duplicate();

  close = async () => this.connection.quit();
}

export const redisConnection = new RedisConnection();
