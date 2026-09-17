const express = require("express");
const mongoose = require("mongoose");
const { protect, requireAdmin } = require("../middleware/auth");
const SeasonalAdvisory = require("../models/SeasonalAdvisory");
const { seasonalAdvisories: fallbackAdvisories } = require("../utils/seedData");

const router = express.Router();

router.get("/", async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    let advisories = fallbackAdvisories;
    if (req.query.season) advisories = advisories.filter((a) => a.season === req.query.season);
    return res.json({ advisories, isDemoData: true });
  }

  try {
    const filter = {};
    if (req.query.season) filter.season = req.query.season;
    const advisories = await SeasonalAdvisory.find(filter).sort("-createdAt");
    if (advisories.length === 0) {
      let fallback = fallbackAdvisories;
      if (req.query.season) fallback = fallback.filter((a) => a.season === req.query.season);
      return res.json({ advisories: fallback, isDemoData: true });
    }
    res.json({ advisories });
  } catch (err) {
    console.warn("SeasonalAdvisory.getAll fallback:", err.message);
    res.json({ advisories: fallbackAdvisories, isDemoData: true });
  }
});

router.post("/", protect, requireAdmin, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "MongoDB connection required to create seasonal advisories." });
    }
    const advisory = await SeasonalAdvisory.create(req.body);
    res.status(201).json({ advisory });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
