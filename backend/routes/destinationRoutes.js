const express = require("express");
const { protect, requireAdmin } = require("../middleware/auth");
const {
  getAll,
  getOne,
  getNearby,
  search,
  create,
  update,
  remove,
} = require("../controllers/destinationController");

const router = express.Router();

// Order matters: specific paths before /:id
router.get("/nearby", getNearby);
router.get("/search", search);
router.get("/", getAll);
router.get("/:id", getOne);

router.post("/", protect, requireAdmin, create);
router.put("/:id", protect, requireAdmin, update);
router.delete("/:id", protect, requireAdmin, remove);

module.exports = router;
