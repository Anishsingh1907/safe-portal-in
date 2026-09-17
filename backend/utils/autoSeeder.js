const mongoose = require("mongoose");
const Destination = require("../models/Destination");
const ServiceProvider = require("../models/ServiceProvider");
const SeasonalAdvisory = require("../models/SeasonalAdvisory");
const SafetyAlert = require("../models/SafetyAlert");
const User = require("../models/User");
const { destinations, serviceProviders, seasonalAdvisories, safetyAlerts } = require("./seedData");

let isSeeding = false;

async function seedDatabase(force = false) {
  if (mongoose.connection.readyState !== 1) {
    return { success: false, message: "Database not connected" };
  }

  if (isSeeding) {
    return { success: false, message: "Seeding already in progress" };
  }

  try {
    isSeeding = true;
    const destCount = await Destination.countDocuments();
    if (destCount > 0 && !force) {
      return { success: true, message: `Database already has ${destCount} destinations`, count: destCount };
    }

    if (force) {
      await Promise.all([
        Destination.deleteMany({}),
        ServiceProvider.deleteMany({}),
        SeasonalAdvisory.deleteMany({}),
        SafetyAlert.deleteMany({}),
        User.deleteMany({ email: { $in: ["traveler@example.com", "admin@example.com"] } }),
      ]);
    }

    // Insert destinations
    const destDocs = await Destination.insertMany(
      destinations.map((d) => ({
        ...d,
        _id: new mongoose.Types.ObjectId(d._id),
      }))
    );

    // Insert service providers
    await ServiceProvider.insertMany(
      serviceProviders.map((s) => ({
        ...s,
        _id: new mongoose.Types.ObjectId(s._id),
      }))
    );

    // Insert seasonal advisories
    await SeasonalAdvisory.insertMany(
      seasonalAdvisories.map((a) => ({
        ...a,
        _id: new mongoose.Types.ObjectId(a._id),
      }))
    );

    // Insert alerts linked to destinations
    await SafetyAlert.insertMany(
      safetyAlerts.map((a) => ({
        ...a,
        _id: new mongoose.Types.ObjectId(a._id),
        destination: a.destination ? new mongoose.Types.ObjectId(a.destination) : null,
      }))
    );

    // Insert demo users if they don't exist
    const travelerExists = await User.findOne({ email: "traveler@example.com" });
    if (!travelerExists) {
      await User.create({
        fullName: "Demo Traveler",
        phone: "9876543210",
        email: "traveler@example.com",
        password: "Traveler@123",
        state: "Rajasthan",
        role: "traveler",
      });
    }

    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (!adminExists) {
      await User.create({
        fullName: "Demo Admin",
        phone: "9876500000",
        email: "admin@example.com",
        password: "Admin@12345",
        state: "Rajasthan",
        role: "admin",
      });
    }

    console.log(`Database successfully seeded with ${destDocs.length} destinations.`);
    return {
      success: true,
      message: `Database populated with ${destDocs.length} destinations, 6 service providers, 4 advisories, and demo accounts.`,
      destinationsCount: destDocs.length,
    };
  } catch (err) {
    console.error("Auto-seeder failed:", err.message);
    return { success: false, error: err.message };
  } finally {
    isSeeding = false;
  }
}

async function seedIfNeeded() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const count = await Destination.countDocuments();
    if (count === 0) {
      console.log("Empty database detected — initiating automatic initial seed...");
      await seedDatabase(false);
    }
  } catch (err) {
    console.warn("Auto-seed check warning:", err.message);
  }
}

module.exports = {
  seedDatabase,
  seedIfNeeded,
};
