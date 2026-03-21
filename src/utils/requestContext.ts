import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

interface RequestContext {
	requestId: string;
}

const requestContext = new AsyncLocalStorage<RequestContext>();

export const runWithRequestContext = <T>(callback: () => T): T => {
	return requestContext.run({ requestId: randomUUID() }, callback);
};

export const getRequestId = (): string => {
	return requestContext.getStore()?.requestId || "no-request-id";
};
