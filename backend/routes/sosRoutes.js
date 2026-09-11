const express = require("express");
const { protect, requireAdmin } = require("../middleware/auth");
const { create, getMine, getOne, getAllActive, updateStatus } = require("../controllers/sosController");

const router = express.Router();

router.use(protect);
router.post("/", create);
router.get("/my", getMine);
router.get("/admin/active", requireAdmin, getAllActive);
router.patch("/:id/status", requireAdmin, updateStatus);
router.get("/:id", getOne);

module.exports = router;
