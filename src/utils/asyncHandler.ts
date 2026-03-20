import type { NextFunction, Request, Response, RequestHandler } from "express";

type AsyncRouteHandler<
	TReq extends Request = Request,
	TRes extends Response = Response,
> = (req: TReq, res: TRes, next: NextFunction) => Promise<unknown>;

export const asyncHandler =
	<TReq extends Request = Request, TRes extends Response = Response>(
		fn: AsyncRouteHandler<TReq, TRes>,
	): RequestHandler =>
	(req, res, next) => {
		Promise.resolve(fn(req as TReq, res as TRes, next)).catch(next);
	};
