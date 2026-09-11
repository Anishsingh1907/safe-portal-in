const mongoose = require("mongoose");

const seasonalAdvisorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    season: { type: String, enum: ["Summer", "Monsoon", "Winter", "Festival Season"], required: true },
    description: { type: String, required: true },
    affectedLocations: [String],
    safetyLevel: { type: String, enum: ["Safe", "Moderate", "Caution", "High Risk"], default: "Safe" },
    precautions: [String],
    bestTravelPeriod: { type: String, default: "" },
    activeWarning: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeasonalAdvisory", seasonalAdvisorySchema);
