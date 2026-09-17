const express = require("express");
const { protect, requireAdmin } = require("../middleware/auth");
const { getOverview } = require("../controllers/adminController");

const router = express.Router();

// Allow public overview stats for landing page banner
router.get("/overview", getOverview);

// Protect all further administrative routes
router.use(protect, requireAdmin);

module.exports = router;
