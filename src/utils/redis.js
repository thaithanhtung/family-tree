const Redis = require("ioredis");

const { logger } = require("./logger");
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});
redis.on("connect", () => {
  logger.info("Redis connected");
});
redis.on("error", (err) => {
  logger.error({ err }, "Redis connection error");
});
module.exports = redis;
