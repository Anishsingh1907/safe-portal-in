const mongoose = require("mongoose");

const sosSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", default: null },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "ACKNOWLEDGED", "RESPONDING", "RESOLVED", "CANCELLED"],
      default: "ACTIVE",
    },
    emergencyMessage: { type: String, default: "" },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SOS", sosSchema);
