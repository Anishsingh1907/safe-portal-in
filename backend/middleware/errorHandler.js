function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err.name, err.message);

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(", ") });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(400).json({ message: `An account with that ${field} already exists.` });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid identifier supplied." });
  }

  const status = err.statusCode || 500;
  const message = status === 500 ? "Something went wrong on our end. Please try again." : err.message;
  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
