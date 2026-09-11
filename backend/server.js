require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

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

connectDB();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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

app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Safe Portal IN API running on port ${PORT}`));
