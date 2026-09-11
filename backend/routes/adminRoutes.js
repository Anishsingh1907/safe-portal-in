const express = require("express");
const { protect, requireAdmin } = require("../middleware/auth");
const { getOverview } = require("../controllers/adminController");

const router = express.Router();

router.use(protect, requireAdmin);
router.get("/overview", getOverview);

module.exports = router;
