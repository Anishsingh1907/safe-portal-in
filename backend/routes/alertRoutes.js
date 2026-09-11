const express = require("express");
const { protect, requireAdmin } = require("../middleware/auth");
const { getAll, create, update, remove } = require("../controllers/alertController");

const router = express.Router();

router.get("/", getAll);
router.post("/", protect, requireAdmin, create);
router.put("/:id", protect, requireAdmin, update);
router.delete("/:id", protect, requireAdmin, remove);

module.exports = router;
