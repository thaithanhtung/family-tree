const redis = require("../utils/redis");
const { createChildLogger } = require("../utils/logger");
const log = createChildLogger("cache-service");
const cacheService = {
  async get(key) {
    try {
      const data = await redis.get(key);
      if (data) {
        log.debug({ key }, "Cache HIT");
        return JSON.parse(data);
      }
      log.debug({ key }, "Cache MISS");
      return null;
    } catch (err) {
      log.error({ err, key }, "Cache get error");
      return null;
    }
  },
  async set(key, value, ttlSeconds = 300) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
      log.debug({ key, ttl: ttlSeconds }, "Cache SET");
    } catch (err) {
      log.error({ err, key }, "Cache set error");
    }
  },
  async del(key) {
    try {
      await redis.del(key);
      log.debug({ key }, "Cache DEL");
    } catch (err) {
      log.error({ err, key }, "Cache del error");
    }
  },
  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        log.debug({ pattern, count: keys.length }, "Cache DEL pattern");
      }
    } catch (err) {
      log.error({ err, pattern }, "Cache del pattern error");
    }
  },
  // Helper để tạo cache key
  keys: {
    familyTreePersons: (treeId) => `familyTree:${treeId}:persons`,
    familyTreeMarriages: (treeId) => `familyTree:${treeId}:marriages`,
    familyTree: (treeId) => `familyTree:${treeId}`,
  },
};
module.exports = cacheService;
