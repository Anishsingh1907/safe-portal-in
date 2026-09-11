const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    state: { type: String, required: true },
    category: {
      type: String,
      enum: ["Hill Station", "Beach", "Heritage", "Spiritual", "Adventure", "City", "Wildlife"],
      default: "City",
    },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    safetyScore: { type: Number, min: 0, max: 5, default: 4 },
    safetyStatus: {
      type: String,
      enum: ["Safe", "Very Safe", "Moderate", "Caution", "High Risk"],
      default: "Safe",
    },
    activeAlerts: { type: Number, default: 0 },
    emergencyContacts: [
      {
        label: String,
        phone: String,
      },
    ],
    nearbyHospitals: [{ name: String, distanceKm: Number }],
    nearbyPoliceStations: [{ name: String, distanceKm: Number }],
    travelGuidelines: [String],
    isDemoData: { type: Boolean, default: true },
  },
  { timestamps: true }
);

destinationSchema.index({ name: "text", state: "text", category: "text" });
destinationSchema.index({ lat: 1, lon: 1 });

module.exports = mongoose.model("Destination", destinationSchema);
