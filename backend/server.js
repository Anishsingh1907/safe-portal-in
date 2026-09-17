require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const tripRoutes = require("./routes/tripRoutes");
const sosRoutes = require("./routes/sosRoutes");
const alertRoutes = require("./routes/alertRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const seasonalRoutes = require("./routes/seasonalRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Connect to database on startup for standalone servers
if (require.main === module && !process.env.VERCEL) {
  connectDB().catch((err) => console.error("Initial DB connection error:", err.message));
}

// URL prefix normalization (ensures /api compatibility under Vercel rewrites)
app.use((req, res, next) => {
  if (!req.url.startsWith("/api")) {
    req.url = `/api${req.url}`;
  }
  next();
});

app.use(helmet());

// Dynamic CORS handling for local dev, Vercel deployments, and production URLs
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server, same-origin)
      if (!origin) return callback(null, true);
      if (
        configuredOrigins.includes("*") ||
        configuredOrigins.includes(origin) ||
        defaultOrigins.includes(origin) ||
        /\.vercel\.app$/.test(new URL(origin).hostname) ||
        /\.github\.io$/.test(new URL(origin).hostname)
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(mongoSanitize());
app.use(xss());
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again shortly." },
});
app.use("/api", apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again shortly." },
});
app.use("/api/auth", authLimiter);

// Health check endpoint (reports status and DB connectivity)
app.get("/api/health", (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: "ok",
    database: dbStates[mongoose.connection.readyState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

// Middleware to ensure DB connection is ready before handling DB-backed routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    return res.status(500).json({
      message: "Database connection unavailable. Please ensure MONGODB_URI is set in environment variables.",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/seasonal", seasonalRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

if (require.main === module && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Safe Portal IN API running on port ${PORT}`));
}

module.exports = app;
