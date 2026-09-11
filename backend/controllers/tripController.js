const Trip = require("../models/Trip");

exports.create = async (req, res, next) => {
  try {
    const trip = await Trip.create({ ...req.body, user: req.user._id });
    res.status(201).json({ trip });
  } catch (err) {
    next(err);
  }
};

exports.getMine = async (req, res, next) => {
  try {
    const trips = await Trip.find({ user: req.user._id })
      .populate("destination", "name state image safetyStatus lat lon")
      .sort("-createdAt");
    res.json({ trips });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id }).populate("destination");
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    res.json({ trip });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    res.json({ trip });
  } catch (err) {
    next(err);
  }
};

exports.setMonitoring = async (req, res, next) => {
  try {
    const { active } = req.body;
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { monitoringActive: !!active, status: active ? "ACTIVE" : "PLANNED" },
      { new: true }
    );
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    res.json({ trip });
  } catch (err) {
    next(err);
  }
};

exports.end = async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: "COMPLETED", monitoringActive: false },
      { new: true }
    );
    if (!trip) return res.status(404).json({ message: "Trip not found." });
    res.json({ trip });
  } catch (err) {
    next(err);
  }
};
