import type { NextFunction, Request, Response } from "express";

export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const startedAt = Date.now();

	res.on("finish", () => {
		const durationMs = Date.now() - startedAt;
		const timestamp = new Date().toISOString();
		console.log(
			`[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`,
		);
	});

	next();
};
