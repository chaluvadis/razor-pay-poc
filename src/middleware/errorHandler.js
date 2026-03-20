import { HttpError } from "../utils/httpError.js";

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
};

export const errorHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const response = {
    message: err.message || "Internal server error",
  };

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
