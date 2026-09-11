const ServiceProvider = require("../models/ServiceProvider");

exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.location) filter.location = new RegExp(req.query.location, "i");

    const providers = await ServiceProvider.find(filter).sort("-rating");
    res.json({ providers });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const provider = await ServiceProvider.create(req.body);
    res.status(201).json({ provider });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
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
    const provider = await ServiceProvider.findByIdAndDelete(req.params.id);
    if (!provider) return res.status(404).json({ message: "Service provider not found." });
    res.json({ message: "Service provider deleted." });
  } catch (err) {
    next(err);
  }
};
