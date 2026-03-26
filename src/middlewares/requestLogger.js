const pinoHttp = require("pino-http");
const { logger } = require("../utils/logger");

const isDev = process.env.NODE_ENV !== "production";

const requestLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => {
      // Ignore health check endpoints
      return req.url === "/health" || req.url === "/";
    },
  },
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} - ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
  },
  customAttributeKeys: {
    req: "request",
    res: "response",
    err: "error",
    responseTime: "duration",
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      headers: isDev
        ? {
            "user-agent": req.headers["user-agent"],
            "content-type": req.headers["content-type"],
          }
        : undefined,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

module.exports = requestLogger;
