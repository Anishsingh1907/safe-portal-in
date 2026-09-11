const express = require("express");
const { protect, requireAdmin } = require("../middleware/auth");
const SeasonalAdvisory = require("../models/SeasonalAdvisory");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.season) filter.season = req.query.season;
    const advisories = await SeasonalAdvisory.find(filter).sort("-createdAt");
    res.json({ advisories });
  } catch (err) {
    next(err);
  }
});

router.post("/", protect, requireAdmin, async (req, res, next) => {
  try {
    const advisory = await SeasonalAdvisory.create(req.body);
    res.status(201).json({ advisory });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
