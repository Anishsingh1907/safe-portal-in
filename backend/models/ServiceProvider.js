const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["Guide", "Driver", "Photographer"], required: true },
    profileImage: { type: String, default: "" },
    location: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5, default: 4.5 },
    experienceYears: { type: Number, default: 1 },
    languages: [String],
    pricePerDay: { type: Number, required: true },
    verified: { type: Boolean, default: true },
    available: { type: Boolean, default: true },
    contactPhone: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceProvider", serviceProviderSchema);
