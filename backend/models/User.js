const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    state: { type: String, required: true },
    idType: { type: String, enum: ["Aadhaar", "Passport", "Voter ID", null], default: null },
    idNumber: { type: String, default: null, select: false },
    role: { type: String, enum: ["traveler", "admin"], default: "traveler" },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other", null], default: null },
    address: { type: String },
    emergencyContacts: [
      {
        name: String,
        phone: String,
        relation: String,
      },
    ],
    savedDestinations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Destination" }],
    profileCompletion: { type: Number, default: 40 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    state: this.state,
    role: this.role,
    profileCompletion: this.profileCompletion,
  };
};

module.exports = mongoose.model("User", userSchema);
