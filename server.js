require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { logger } = require("./src/utils/logger");
const requestLogger = require("./src/middlewares/requestLogger");
const {
  apiLimiter,
  authLimiter,
  heavyLimiter,
  createAccountLimiter,
} = require("./src/middlewares/rateLimiter");

const app = express();

// Trust proxy for rate limiting behind Nginx
app.set("trust proxy", 1);

// CORS configuration - MUST be before helmet
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://family-tree-frontend-cqp2.onrender.com",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Helmet with CORS-friendly settings
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const todoRoutes = require("./src/routes/todo.routes");
const familyTreeRoutes = require("./src/routes/familyTree.routes");
const personRoutes = require("./src/routes/person.routes");
const marriageRoutes = require("./src/routes/marriage.routes");
const uploadRoutes = require("./src/routes/upload.routes");
const seedRoutes = require("./src/routes/seed.routes");

app.use(express.json());
app.use(requestLogger);

// Apply general rate limit to all routes
app.use(apiLimiter);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth routes with strict rate limiting
app.use("/auth/login", authLimiter);
app.use("/auth/register", createAccountLimiter);
app.use("/auth", authRoutes);

// Other routes
app.use("/users", userRoutes);
app.use("/todos", todoRoutes);
app.use("/family-trees", familyTreeRoutes);
app.use("/persons", personRoutes);
app.use("/marriages", marriageRoutes);

// Heavy operations with stricter rate limiting
app.use("/upload", heavyLimiter, uploadRoutes);
app.use("/seed", heavyLimiter, seedRoutes);

app.use((err, req, res, next) => {
  logger.error({ err, url: req.url, method: req.method }, "Unhandled error");
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server started");
});
