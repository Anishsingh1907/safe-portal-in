const User = require("../models/User");
const Trip = require("../models/Trip");
const SOS = require("../models/SOS");
const Destination = require("../models/Destination");
const ServiceProvider = require("../models/ServiceProvider");

exports.getOverview = async (req, res, next) => {
  try {
    const [totalUsers, activeTrips, activeSOS, safetyAlertsCount, destinations, providers] = await Promise.all([
      User.countDocuments({ role: "traveler" }),
      Trip.countDocuments({ status: "ACTIVE" }),
      SOS.countDocuments({ status: { $in: ["ACTIVE", "ACKNOWLEDGED", "RESPONDING"] } }),
      require("../models/SafetyAlert").countDocuments({ active: true }),
      Destination.countDocuments(),
      ServiceProvider.countDocuments(),
    ]);

    res.json({
      totalUsers,
      activeTrips,
      activeSOS,
      safetyAlertsCount,
      destinations,
      serviceProviders: providers,
      isDemoData: true,
    });
  } catch (err) {
    next(err);
  }
};
