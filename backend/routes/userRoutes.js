const express = require("express");
const { protect } = require("../middleware/auth");
const { updateProfile, getDashboard, saveDestination } = require("../controllers/userController");

const router = express.Router();

router.use(protect);
router.get("/dashboard", getDashboard);
router.put("/profile", updateProfile);
router.post("/saved-destinations", saveDestination);

module.exports = router;
