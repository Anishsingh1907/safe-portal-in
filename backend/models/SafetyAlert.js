const mongoose = require("mongoose");

const safetyAlertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination", default: null },
    severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], default: "LOW" },
    category: {
      type: String,
      enum: ["Weather", "Road", "Crowd", "Crime", "Natural Disaster", "Health", "General"],
      default: "General",
    },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SafetyAlert", safetyAlertSchema);
