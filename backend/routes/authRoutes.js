const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const { register, login, me } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required."),
    body("phone").trim().isLength({ min: 10, max: 15 }).withMessage("Enter a valid phone number."),
    body("email").isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
    body("state").trim().notEmpty().withMessage("State is required."),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validate,
  login
);

router.get("/me", protect, me);

module.exports = router;
