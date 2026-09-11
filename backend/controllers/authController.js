const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

exports.register = async (req, res, next) => {
  try {
    const { fullName, phone, email, password, state, idType, idNumber } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "An account with that email already exists." });
    }

    const user = await User.create({
      fullName,
      phone,
      email,
      password,
      state,
      idType: idType || null,
      idNumber: idNumber || null,
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user._id);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};
