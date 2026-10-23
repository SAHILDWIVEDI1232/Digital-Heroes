export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with this value already exists",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Database validation failed",
      errors: Object.values(err.errors).map((item) => item.message),
    });
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500 && process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  });
}