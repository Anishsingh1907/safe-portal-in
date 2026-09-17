const mongoose = require("mongoose");

let cachedPromise = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const errorMsg = "MONGODB_URI is not set. Check your environment variables or .env file.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // If already connected, reuse existing connection
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  // Cache connection promise across invocations
  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 5000,
      })
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((err) => {
        console.error("MongoDB connection failed:", err.message);
        cachedPromise = null;
        throw err;
      });
  }

  return cachedPromise;
}

module.exports = connectDB;
