const SafetyAlert = require("../models/SafetyAlert");

exports.getAll = async (req, res, next) => {
  try {
    const filter = { active: true };
    if (req.query.destination) filter.destination = req.query.destination;

    const alerts = await SafetyAlert.find(filter).populate("destination", "name state").sort("-createdAt");
    res.json({ alerts });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const alert = await SafetyAlert.create(req.body);
    res.status(201).json({ alert });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
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
    const alert = await SafetyAlert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found." });
    res.json({ message: "Alert deleted." });
  } catch (err) {
    next(err);
  }
};
