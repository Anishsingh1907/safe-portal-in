const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"],
      default: "PLANNED",
    },
    emergencyContacts: [
      {
        name: String,
        phone: String,
        relation: String,
      },
    ],
    companions: [{ name: String, phone: String }],
    itinerary: [
      {
        day: Number,
        notes: String,
      },
    ],
    monitoringActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
