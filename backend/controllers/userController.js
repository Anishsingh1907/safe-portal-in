const User = require("../models/User");
const Trip = require("../models/Trip");
const SOS = require("../models/SOS");

exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ["fullName", "phone", "state", "dateOfBirth", "gender", "address", "emergencyContacts"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [trips, sosHistory, user] = await Promise.all([
      Trip.find({ user: userId }).populate("destination", "name state image safetyStatus").sort("-createdAt"),
      SOS.find({ user: userId }).sort("-createdAt").limit(10),
      User.findById(userId).populate("savedDestinations", "name state image safetyStatus"),
    ]);

    const now = new Date();
    res.json({
      profile: user.toSafeJSON(),
      trips: {
        upcoming: trips.filter((t) => t.status === "PLANNED" && t.startDate > now),
        active: trips.filter((t) => t.status === "ACTIVE"),
        completed: trips.filter((t) => t.status === "COMPLETED"),
      },
      savedDestinations: user.savedDestinations,
      sosHistory,
    });
  } catch (err) {
    next(err);
  }
};

exports.saveDestination = async (req, res, next) => {
  try {
    const { destinationId } = req.body;
    const user = await User.findById(req.user._id);

    if (user.savedDestinations.includes(destinationId)) {
      user.savedDestinations.pull(destinationId);
    } else {
      user.savedDestinations.push(destinationId);
    }

    await user.save();
    res.json({ savedDestinations: user.savedDestinations });
  } catch (err) {
    next(err);
  }
};
