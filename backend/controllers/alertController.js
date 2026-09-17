const mongoose = require("mongoose");
const SafetyAlert = require("../models/SafetyAlert");
const { safetyAlerts: fallbackAlerts } = require("../utils/seedData");

exports.getAll = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    let alerts = fallbackAlerts;
    if (req.query.destination) {
      alerts = alerts.filter((a) => a.destination === req.query.destination);
    }
    return res.json({ alerts, isDemoData: true });
  }

  try {
    const filter = { active: true };
    if (req.query.destination) filter.destination = req.query.destination;

    const alerts = await SafetyAlert.find(filter).populate("destination", "name state").sort("-createdAt");
    if (alerts.length === 0) {
      let fallback = fallbackAlerts;
      if (req.query.destination) {
        fallback = fallback.filter((a) => a.destination === req.query.destination);
      }
      return res.json({ alerts: fallback, isDemoData: true });
    }
    res.json({ alerts });
  } catch (err) {
    console.warn("SafetyAlert.getAll fallback:", err.message);
    res.json({ alerts: fallbackAlerts, isDemoData: true });
  }
};

exports.create = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "MongoDB connection required to create alerts." });
    }
    const alert = await SafetyAlert.create(req.body);
    res.status(201).json({ alert });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "MongoDB connection required to update alerts." });
    }
    const alert = await SafetyAlert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!alert) return res.status(404).json({ message: "Alert not found." });
    res.json({ alert });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "MongoDB connection required to delete alerts." });
    }
    const alert = await SafetyAlert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found." });
    res.json({ message: "Alert deleted." });
  } catch (err) {
    next(err);
  }
};
