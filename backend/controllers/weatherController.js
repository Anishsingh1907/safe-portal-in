const mongoose = require("mongoose");
const Destination = require("../models/Destination");
const { destinations: fallbackDestinations } = require("../utils/seedData");

function mockWeatherFor(destination) {
  const seed = (destination.name || "Default").length + (destination.lat || 20);
  const conditions = ["Clear", "Partly Cloudy", "Cloudy", "Light Rain", "Sunny"];
  return {
    temperatureC: Math.round(18 + (seed % 15)),
    condition: conditions[Math.round(seed) % conditions.length],
    humidity: Math.round(40 + (seed % 40)),
    windKph: Math.round(5 + (seed % 20)),
    visibilityKm: Math.round(6 + (seed % 10)),
    warning: destination.safetyStatus === "High Risk" ? "Exercise increased caution" : null,
    isMockData: true,
  };
}

exports.getForDestination = async (req, res, next) => {
  try {
    const { destinationId } = req.params;
    let destination = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(destinationId)) {
      try {
        destination = await Destination.findById(destinationId);
      } catch (err) {
        console.warn("Weather destination lookup failed:", err.message);
      }
    }

    if (!destination) {
      destination = fallbackDestinations.find((d) => d._id === destinationId || d.name.toLowerCase() === destinationId.toLowerCase());
    }

    if (!destination) {
      destination = { name: "Destination", lat: 25, safetyStatus: "Safe" };
    }

    return res.json({ weather: mockWeatherFor(destination) });
  } catch (err) {
    next(err);
  }
};
