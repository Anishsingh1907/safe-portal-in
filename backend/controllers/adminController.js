const mongoose = require("mongoose");
const User = require("../models/User");
const Trip = require("../models/Trip");
const SOS = require("../models/SOS");
const Destination = require("../models/Destination");
const ServiceProvider = require("../models/ServiceProvider");
const SafetyAlert = require("../models/SafetyAlert");
const { destinations, serviceProviders, safetyAlerts } = require("../utils/seedData");

exports.getOverview = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({
      totalUsers: 24,
      activeTrips: 5,
      activeSOS: 0,
      safetyAlertsCount: safetyAlerts.filter((a) => a.active).length,
      destinations: destinations.length,
      serviceProviders: serviceProviders.length,
      isDemoData: true,
    });
  }

  try {
    const [totalUsers, activeTrips, activeSOS, safetyAlertsCount, destCount, providers] = await Promise.all([
      User.countDocuments({ role: "traveler" }),
      Trip.countDocuments({ status: "ACTIVE" }),
      SOS.countDocuments({ status: { $in: ["ACTIVE", "ACKNOWLEDGED", "RESPONDING"] } }),
      SafetyAlert.countDocuments({ active: true }),
      Destination.countDocuments(),
      ServiceProvider.countDocuments(),
    ]);

    res.json({
      totalUsers: totalUsers || 24,
      activeTrips: activeTrips || 5,
      activeSOS,
      safetyAlertsCount: safetyAlertsCount || safetyAlerts.filter((a) => a.active).length,
      destinations: destCount || destinations.length,
      serviceProviders: providers || serviceProviders.length,
      isDemoData: true,
    });
  } catch (err) {
    console.warn("Admin.getOverview fallback:", err.message);
    res.json({
      totalUsers: 24,
      activeTrips: 5,
      activeSOS: 0,
      safetyAlertsCount: safetyAlerts.filter((a) => a.active).length,
      destinations: destinations.length,
      serviceProviders: serviceProviders.length,
      isDemoData: true,
    });
  }
};
