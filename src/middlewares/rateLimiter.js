const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default;
const redis = require("../utils/redis");
const { createChildLogger } = require("../utils/logger");

const log = createChildLogger("rate-limiter");

/**
 * General API Rate Limiter
 * 100 requests per minute
 */
const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  windowMs: 60 * 1000, // 1 phút
  max: 100, // 100 requests per window
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    log.warn({ ip: req.ip, url: req.url }, "Rate limit exceeded");
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * Strict Rate Limiter for Auth endpoints
 * 5 requests per 15 minutes
 */
const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "rl:auth:",
  }),
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // 5 attempts
  message: {
    status: 429,
    message: "Too many login attempts, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Không đếm request thành công
  handler: (req, res, next, options) => {
    log.warn(
      { ip: req.ip, email: req.body?.email },
      "Auth rate limit exceeded"
    );
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * Heavy Operations Rate Limiter
 * 10 requests per minute (for upload, seed, etc.)
 */
const heavyLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "rl:heavy:",
  }),
  windowMs: 60 * 1000, // 1 phút
  max: 10, // 10 requests
  message: {
    status: 429,
    message: "This operation is rate limited. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    log.warn(
      { ip: req.ip, url: req.url },
      "Heavy operation rate limit exceeded"
    );
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * Create Account Rate Limiter
 * 3 requests per hour
 */
const createAccountLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: "rl:register:",
  }),
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // 3 accounts per hour
  message: {
    status: 429,
    message: "Too many accounts created. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    log.warn({ ip: req.ip }, "Create account rate limit exceeded");
    res.status(options.statusCode).json(options.message);
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  heavyLimiter,
  createAccountLimiter,
};
