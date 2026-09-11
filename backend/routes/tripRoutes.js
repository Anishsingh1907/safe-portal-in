const express = require("express");
const { protect } = require("../middleware/auth");
const { create, getMine, getOne, update, setMonitoring, end } = require("../controllers/tripController");

const router = express.Router();

router.use(protect);
router.post("/", create);
router.get("/", getMine);
router.get("/:id", getOne);
router.put("/:id", update);
router.patch("/:id/monitoring", setMonitoring);
router.patch("/:id/end", end);

module.exports = router;
