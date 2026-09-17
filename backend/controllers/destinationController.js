const mongoose = require("mongoose");
const Destination = require("../models/Destination");
const { destinations: fallbackDestinations } = require("../utils/seedData");
const { seedIfNeeded } = require("../utils/autoSeeder");

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
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 12);

  if (mongoose.connection.readyState !== 1) {
    const paged = fallbackDestinations.slice((page - 1) * limit, page * limit);
    return res.json({
      destinations: paged,
      total: fallbackDestinations.length,
      page,
      pages: Math.ceil(fallbackDestinations.length / limit),
      isDemoData: true,
    });
  }

  try {
    const [destinations, total] = await Promise.all([
      Destination.find().sort("-createdAt").skip((page - 1) * limit).limit(limit),
      Destination.countDocuments(),
    ]);

    if (total === 0) {
      seedIfNeeded().catch(() => {});
      const paged = fallbackDestinations.slice((page - 1) * limit, page * limit);
      return res.json({
        destinations: paged,
        total: fallbackDestinations.length,
        page,
        pages: Math.ceil(fallbackDestinations.length / limit),
        isDemoData: true,
      });
    }

    res.json({ destinations, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.warn("Destination.getAll fallback:", err.message);
    const paged = fallbackDestinations.slice((page - 1) * limit, page * limit);
    res.json({
      destinations: paged,
      total: fallbackDestinations.length,
      page,
      pages: Math.ceil(fallbackDestinations.length / limit),
      isDemoData: true,
    });
  }
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;

  if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const destination = await Destination.findById(id);
      if (destination) return res.json({ destination });
    } catch (err) {
      console.warn("Destination.getOne DB error:", err.message);
    }
  }

  // Fallback to seed data
  const fallback = fallbackDestinations.find(
    (d) => d._id === id || d.name.toLowerCase() === id.toLowerCase()
  );
  if (fallback) {
    return res.json({ destination: fallback });
  }

  return res.status(404).json({ message: "Destination not found." });
};

exports.getNearby = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ message: "Valid lat and lng query parameters are required." });
    }

    let list = [];
    if (mongoose.connection.readyState === 1) {
      try {
        list = await Destination.find();
        if (list.length === 0) list = fallbackDestinations;
      } catch {
        list = fallbackDestinations;
      }
    } else {
      list = fallbackDestinations;
    }

    const withDistance = list
      .map((d) => {
        const item = d.toObject ? d.toObject() : { ...d };
        return { ...item, distanceKm: haversineKm(lat, lng, item.lat, item.lon) };
      })
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

    if (mongoose.connection.readyState === 1) {
      try {
        const regex = new RegExp(q, "i");
        const destinations = await Destination.find({
          $or: [{ name: regex }, { state: regex }, { category: regex }, { safetyStatus: regex }],
        }).limit(20);
        if (destinations.length > 0) {
          return res.json({ destinations });
        }
      } catch (err) {
        console.warn("Destination.search DB query failed:", err.message);
      }
    }

    // Fallback search in seed data
    const lower = q.toLowerCase();
    const matches = fallbackDestinations.filter(
      (d) =>
        d.name.toLowerCase().includes(lower) ||
        d.state.toLowerCase().includes(lower) ||
        d.category.toLowerCase().includes(lower) ||
        d.safetyStatus.toLowerCase().includes(lower)
    );

    res.json({ destinations: matches });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "MongoDB connection required to create new destinations." });
    }
    const destination = await Destination.create({ ...req.body, isDemoData: false });
    res.status(201).json({ destination });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "MongoDB connection required to update destinations." });
    }
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
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "MongoDB connection required to delete destinations." });
    }
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) return res.status(404).json({ message: "Destination not found." });
    res.json({ message: "Destination deleted." });
  } catch (err) {
    next(err);
  }
};
