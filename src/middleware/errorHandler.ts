import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../utils/httpError.ts";
import { getRequestId } from "../utils/requestContext.ts";

export const notFoundHandler: RequestHandler = (req, res) => {
	res.status(404).json({
		message: "Route not found",
		path: req.originalUrl,
	});
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
	if (res.headersSent) {
		return next(err);
	}

	const statusCode = err instanceof HttpError ? err.statusCode : 500;
	const response: { message: string; requestId: string; stack?: string } = {
		message: err.message || "Internal server error",
		requestId: getRequestId(),
	};

	if (process.env.NODE_ENV !== "production") {
		response.stack = err.stack;
	}

	res.status(statusCode).json(response);
};
