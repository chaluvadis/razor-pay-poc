import type { NextFunction, Request, Response } from "express";
import {
	getRequestId,
	runWithRequestContext,
} from "../utils/requestContext.ts";

export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	runWithRequestContext(() => {
		const startedAt = Date.now();

		res.on("finish", () => {
			const durationMs = Date.now() - startedAt;
			const timestamp = new Date().toISOString();
			const requestId = getRequestId();
			console.log(
				`[${timestamp}] [${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`,
			);
		});

		next();
	});
};
