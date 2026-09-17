const mongoose = require("mongoose");
const ServiceProvider = require("../models/ServiceProvider");
const { serviceProviders: fallbackProviders } = require("../utils/seedData");

exports.getAll = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    let providers = fallbackProviders;
    if (req.query.type) providers = providers.filter((p) => p.type === req.query.type);
    if (req.query.location) {
      const loc = req.query.location.toLowerCase();
      providers = providers.filter((p) => p.location.toLowerCase().includes(loc));
    }
    return res.json({ providers, isDemoData: true });
  }

  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.location) filter.location = new RegExp(req.query.location, "i");

    const providers = await ServiceProvider.find(filter).sort("-rating");
    if (providers.length === 0) {
      return res.json({ providers: fallbackProviders, isDemoData: true });
    }
    res.json({ providers });
  } catch (err) {
    console.warn("ServiceProvider.getAll fallback:", err.message);
    res.json({ providers: fallbackProviders, isDemoData: true });
  }
};

exports.create = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "MongoDB connection required to create service providers." });
    }
    const provider = await ServiceProvider.create(req.body);
    res.status(201).json({ provider });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "MongoDB connection required to update service providers." });
    }
    const provider = await ServiceProvider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!provider) return res.status(404).json({ message: "Service provider not found." });
    res.json({ provider });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "MongoDB connection required to delete service providers." });
    }
    const provider = await ServiceProvider.findByIdAndDelete(req.params.id);
    if (!provider) return res.status(404).json({ message: "Service provider not found." });
    res.json({ message: "Service provider deleted." });
  } catch (err) {
    next(err);
  }
};
