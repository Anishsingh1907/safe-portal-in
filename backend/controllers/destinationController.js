const Destination = require("../models/Destination");

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

exports.getAll = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);

    const [destinations, total] = await Promise.all([
      Destination.find().sort("-createdAt").skip((page - 1) * limit).limit(limit),
      Destination.countDocuments(),
    ]);

    res.json({ destinations, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ message: "Destination not found." });
    res.json({ destination });
  } catch (err) {
    next(err);
  }
};

exports.getNearby = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ message: "Valid lat and lng query parameters are required." });
    }

    const destinations = await Destination.find();
    const withDistance = destinations
      .map((d) => ({ ...d.toObject(), distanceKm: haversineKm(lat, lng, d.lat, d.lon) }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({ destinations: withDistance });
  } catch (err) {
    next(err);
  }
};

exports.search = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ destinations: [] });

    const regex = new RegExp(q, "i");
    const destinations = await Destination.find({
      $or: [{ name: regex }, { state: regex }, { category: regex }, { safetyStatus: regex }],
    }).limit(20);

    res.json({ destinations });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const destination = await Destination.create({ ...req.body, isDemoData: false });
    res.status(201).json({ destination });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!destination) return res.status(404).json({ message: "Destination not found." });
    res.json({ destination });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) return res.status(404).json({ message: "Destination not found." });
    res.json({ message: "Destination deleted." });
  } catch (err) {
    next(err);
  }
};
