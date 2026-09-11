require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Destination = require("../models/Destination");
const SafetyAlert = require("../models/SafetyAlert");
const ServiceProvider = require("../models/ServiceProvider");
const SeasonalAdvisory = require("../models/SeasonalAdvisory");
const Trip = require("../models/Trip");
const SOS = require("../models/SOS");

const destinations = [
  { name: "Shimla", state: "Himachal Pradesh", category: "Hill Station", lat: 31.1048, lon: 77.1734, safetyScore: 4.5, safetyStatus: "Very Safe", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=60", description: "A colonial-era hill station in the Himalayan foothills, popular for its cool climate and mountain views." },
  { name: "Manali", state: "Himachal Pradesh", category: "Adventure", lat: 32.2432, lon: 77.1892, safetyScore: 4.2, safetyStatus: "Safe", image: "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?auto=format&fit=crop&w=800&q=60", description: "Gateway to the Himalayas, known for trekking, river rafting and snow-capped peaks." },
  { name: "Leh", state: "Ladakh", category: "Adventure", lat: 34.1526, lon: 77.5770, safetyScore: 3.0, safetyStatus: "Moderate", image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c0?auto=format&fit=crop&w=800&q=60", description: "High-altitude desert region with monasteries, mountain passes and remote terrain — plan for altitude acclimatization." },
  { name: "Goa", state: "Goa", category: "Beach", lat: 15.2993, lon: 74.1240, safetyScore: 4.4, safetyStatus: "Very Safe", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=60", description: "India's beach capital, with a mix of Portuguese heritage, nightlife and coastline." },
  { name: "Rishikesh", state: "Uttarakhand", category: "Spiritual", lat: 30.0869, lon: 78.2676, safetyScore: 4.3, safetyStatus: "Safe", image: "https://images.unsplash.com/photo-1591017683403-c9ba3b100a5f?auto=format&fit=crop&w=800&q=60", description: "Yoga capital of the world on the banks of the Ganges, also known for white-water rafting." },
  { name: "Jaipur", state: "Rajasthan", category: "Heritage", lat: 26.9124, lon: 75.7873, safetyScore: 4.3, safetyStatus: "Safe", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=60", description: "The Pink City — forts, palaces and bazaars at the heart of Rajasthan's tourist circuit." },
  { name: "Udaipur", state: "Rajasthan", category: "Heritage", lat: 24.5854, lon: 73.7125, safetyScore: 4.5, safetyStatus: "Very Safe", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=60", description: "The City of Lakes, known for palaces, lake views and a relaxed old-city atmosphere." },
  { name: "Mumbai", state: "Maharashtra", category: "City", lat: 19.0760, lon: 72.8777, safetyScore: 3.8, safetyStatus: "Safe", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=60", description: "India's financial capital — dense, fast-paced, and generally safe with standard city-travel precautions." },
  { name: "Delhi", state: "Delhi", category: "City", lat: 28.6139, lon: 77.2090, safetyScore: 3.5, safetyStatus: "Moderate", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=60", description: "The capital region, rich in monuments and markets; use registered transport, especially at night." },
  { name: "Munnar", state: "Kerala", category: "Hill Station", lat: 10.0889, lon: 77.0595, safetyScore: 4.6, safetyStatus: "Very Safe", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=60", description: "Tea-plantation hill station in Kerala's Western Ghats, calm and tourist-friendly." },
];

const serviceProviders = [
  { name: "Ravi Thakur", type: "Guide", location: "Shimla, Himachal Pradesh", rating: 4.8, experienceYears: 9, languages: ["Hindi", "English"], pricePerDay: 1800, contactPhone: "+91-90000-00001" },
  { name: "Priya Nair", type: "Guide", location: "Munnar, Kerala", rating: 4.7, experienceYears: 6, languages: ["Malayalam", "English", "Hindi"], pricePerDay: 1500, contactPhone: "+91-90000-00002" },
  { name: "Suresh Meena", type: "Driver", location: "Jaipur, Rajasthan", rating: 4.6, experienceYears: 12, languages: ["Hindi", "English"], pricePerDay: 2200, contactPhone: "+91-90000-00003" },
  { name: "Tashi Dorjee", type: "Driver", location: "Leh, Ladakh", rating: 4.9, experienceYears: 10, languages: ["Ladakhi", "Hindi", "English"], pricePerDay: 3000, contactPhone: "+91-90000-00004" },
  { name: "Ananya Roy", type: "Photographer", location: "Udaipur, Rajasthan", rating: 4.7, experienceYears: 5, languages: ["Bengali", "Hindi", "English"], pricePerDay: 2500, contactPhone: "+91-90000-00005" },
  { name: "Karan Bhatt", type: "Photographer", location: "Goa", rating: 4.5, experienceYears: 4, languages: ["Hindi", "English"], pricePerDay: 2000, contactPhone: "+91-90000-00006" },
];

const seasonalAdvisories = [
  { title: "Monsoon Travel Advisory", season: "Monsoon", description: "Avoid low-lying flood-prone regions and follow alerts for hill-station travel during heavy rainfall.", affectedLocations: ["Mumbai", "Goa", "Munnar"], safetyLevel: "Moderate", precautions: ["Check road closures before departure", "Avoid river-adjacent camping", "Carry waterproof gear"], bestTravelPeriod: "July–September (with caution)", activeWarning: true },
  { title: "Winter Snow Routes", season: "Winter", description: "Recommended snow-safe highways and emergency preparedness guidelines for high-altitude routes.", affectedLocations: ["Manali", "Leh", "Shimla"], safetyLevel: "Caution", precautions: ["Carry snow chains", "Check pass-opening status", "Travel with a full tank and emergency supplies"], bestTravelPeriod: "December–February", activeWarning: false },
  { title: "Festival Crowd Guidelines", season: "Festival Season", description: "Safe travel advice for festival months with high tourist footfall at heritage and religious sites.", affectedLocations: ["Jaipur", "Rishikesh", "Udaipur"], safetyLevel: "Moderate", precautions: ["Book accommodation in advance", "Keep valuables secure in crowds", "Use registered transport only"], bestTravelPeriod: "October–November", activeWarning: false },
  { title: "Summer Heat Advisory", season: "Summer", description: "High daytime temperatures across northern plains; plan travel for early morning and evening hours.", affectedLocations: ["Jaipur", "Delhi"], safetyLevel: "Caution", precautions: ["Stay hydrated", "Avoid midday outdoor sightseeing", "Watch for heat-exhaustion symptoms"], bestTravelPeriod: "Avoid April–June", activeWarning: true },
];

async function seed() {
  await connectDB();

  console.log("Clearing existing demo collections...");
  await Promise.all([
    Destination.deleteMany({}),
    SafetyAlert.deleteMany({}),
    ServiceProvider.deleteMany({}),
    SeasonalAdvisory.deleteMany({}),
    Trip.deleteMany({}),
    SOS.deleteMany({}),
  ]);
  await User.deleteMany({ email: { $in: ["traveler@example.com", "admin@example.com"] } });

  console.log("Seeding destinations...");
  const createdDestinations = await Destination.insertMany(destinations);

  console.log("Seeding service providers...");
  await ServiceProvider.insertMany(serviceProviders);

  console.log("Seeding seasonal advisories...");
  await SeasonalAdvisory.insertMany(seasonalAdvisories);

  console.log("Seeding safety alerts...");
  const shimla = createdDestinations.find((d) => d.name === "Shimla");
  const leh = createdDestinations.find((d) => d.name === "Leh");
  await SafetyAlert.insertMany([
    { title: "Landslide risk on NH-5", description: "Recent rainfall has increased landslide risk on sections of NH-5 near Shimla. Drive with caution.", destination: shimla._id, severity: "MEDIUM", category: "Road", active: true },
    { title: "High-altitude sickness advisory", description: "Travelers to Leh should acclimatize for 24–48 hours before strenuous activity.", destination: leh._id, severity: "HIGH", category: "Health", active: true },
    { title: "General travel advisory", description: "Carry a copy of your ID at all times and share your itinerary with a trusted contact.", destination: null, severity: "LOW", category: "General", active: true },
  ]);

  console.log("Seeding demo accounts (traveler@example.com / admin@example.com)...");
  const traveler = await User.create({
    fullName: "Demo Traveler",
    phone: "9876543210",
    email: "traveler@example.com",
    password: "Traveler@123",
    state: "Rajasthan",
    role: "traveler",
  });

  const admin = await User.create({
    fullName: "Demo Admin",
    phone: "9876500000",
    email: "admin@example.com",
    password: "Admin@12345",
    state: "Rajasthan",
    role: "admin",
  });

  console.log("Seeding a sample trip and SOS record for the demo traveler...");
  const jaipur = createdDestinations.find((d) => d.name === "Jaipur");
  await Trip.create({
    user: traveler._id,
    destination: jaipur._id,
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    status: "PLANNED",
    emergencyContacts: [{ name: "Family Contact", phone: "9999999999", relation: "Parent" }],
  });

  await SOS.create({
    user: traveler._id,
    latitude: jaipur.lat,
    longitude: jaipur.lon,
    status: "RESOLVED",
    emergencyMessage: "Demo resolved SOS record.",
    resolvedAt: new Date(),
  });

  console.log("\nSeed complete.");
  console.log("Demo traveler: traveler@example.com / Traveler@123");
  console.log("Demo admin:    admin@example.com / Admin@12345");
  console.log("(Change or remove these before any real deployment.)\n");

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
