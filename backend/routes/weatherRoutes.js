const express = require("express");
const { getForDestination } = require("../controllers/weatherController");

const router = express.Router();

router.get("/:destinationId", getForDestination);

module.exports = router;
