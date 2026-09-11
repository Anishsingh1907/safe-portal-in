const Destination = require("../models/Destination");

// Mock weather so the feature works out of the box without an API key.
// Swap in a real fetch() call to process.env.WEATHER_API_BASE using
// process.env.WEATHER_API_KEY once you have one — the key stays server-side.
function mockWeatherFor(destination) {
  const seed = destination.name.length + destination.lat;
  const conditions = ["Clear", "Partly Cloudy", "Cloudy", "Light Rain", "Sunny"];
  return {
    temperatureC: Math.round(18 + (seed % 15)),
    condition: conditions[Math.round(seed) % conditions.length],
    humidity: Math.round(40 + (seed % 40)),
    windKph: Math.round(5 + (seed % 20)),
    visibilityKm: Math.round(6 + (seed % 10)),
    warning: destination.safetyStatus === "High Risk" ? "Exercise increased caution" : null,
    isMockData: !process.env.WEATHER_API_KEY,
  };
}

exports.getForDestination = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.destinationId);
    if (!destination) return res.status(404).json({ message: "Destination not found." });

    if (!process.env.WEATHER_API_KEY) {
      return res.json({ weather: mockWeatherFor(destination) });
    }

    // Real integration point: fetch from process.env.WEATHER_API_BASE here.
    return res.json({ weather: mockWeatherFor(destination) });
  } catch (err) {
    next(err);
  }
};
