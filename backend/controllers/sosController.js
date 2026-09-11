const SOS = require("../models/SOS");

exports.create = async (req, res, next) => {
  try {
    const { latitude, longitude, trip, emergencyMessage } = req.body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ message: "A valid location is required to send an SOS." });
    }

    const sos = await SOS.create({
      user: req.user._id,
      trip: trip || null,
      latitude,
      longitude,
      emergencyMessage: emergencyMessage || "",
    });

    res.status(201).json({ sos });
  } catch (err) {
    next(err);
  }
};

exports.getMine = async (req, res, next) => {
  try {
    const sosHistory = await SOS.find({ user: req.user._id }).sort("-createdAt");
    res.json({ sosHistory });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const sos = await SOS.findOne({ _id: req.params.id, user: req.user._id });
    if (!sos) return res.status(404).json({ message: "SOS record not found." });
    res.json({ sos });
  } catch (err) {
    next(err);
  }
};

// Admin
exports.getAllActive = async (req, res, next) => {
  try {
    const sosList = await SOS.find({ status: { $in: ["ACTIVE", "ACKNOWLEDGED", "RESPONDING"] } })
      .populate("user", "fullName phone email")
      .sort("-createdAt");
    res.json({ sosList });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === "RESOLVED") update.resolvedAt = new Date();

    const sos = await SOS.findByIdAndUpdate(req.params.id, update, { new: true }).populate(
      "user",
      "fullName phone email"
    );
    if (!sos) return res.status(404).json({ message: "SOS record not found." });
    res.json({ sos });
  } catch (err) {
    next(err);
  }
};
