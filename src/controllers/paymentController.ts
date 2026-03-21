import type { Request, Response } from "express";
import type { OrderRecord } from "../types/order.ts";
import { HttpError } from "../utils/httpError.ts";
import {
	parseAmount,
	parseCurrency,
	requireString,
} from "../utils/validation.ts";
import {
	createRazorpayOrder,
	verifyPaymentSignature,
	verifyWebhookSignature,
} from "../services/razorpayService.ts";
import {
	getAllOrders,
	getOrderByRazorpayOrderId,
	insertOrder,
	markOrderFailed,
	markOrderPaid,
} from "../services/orderService.ts";

const buildReceipt = () => `rcpt_${Date.now()}`;

interface VerifyPaymentRequestBody {
	razorpay_order_id: unknown;
	razorpay_payment_id: unknown;
	razorpay_signature: unknown;
}

interface CreateOrderBody {
	amount: unknown;
	currency: unknown;
	notes?: unknown;
}

interface RazorpayWebhookEvent {
	event?: string;
	payload?: {
		payment?: {
			entity?: {
				id?: string;
				order_id?: string;
			};
		};
	};
}

export const createOrder = async (
	req: Request<Record<string, never>, unknown, CreateOrderBody>,
	res: Response,
): Promise<void> => {
	const amount = parseAmount(req.body.amount);
	const currency = parseCurrency(req.body.currency);
	const notes =
		typeof req.body.notes === "object" && req.body.notes !== null
			? (req.body.notes as Record<string, string>)
			: undefined;

	const razorpayOrder = await createRazorpayOrder({
		amount,
		currency,
		receipt: buildReceipt(),
		notes,
	});

	const dbOrder = await insertOrder({
		razorpayOrderId: razorpayOrder.id,
		amount,
		currency,
		status: "created",
	});

	res.status(201).json({
		message: "Order created successfully",
		order: dbOrder,
		razorpay: razorpayOrder,
	});
};

export const verifyPayment = async (
	req: Request<Record<string, never>, unknown, VerifyPaymentRequestBody>,
	res: Response,
): Promise<void> => {
	const razorpayOrderId = requireString(
		req.body.razorpay_order_id,
		"razorpay_order_id",
	);
	const razorpayPaymentId = requireString(
		req.body.razorpay_payment_id,
		"razorpay_payment_id",
	);
	const razorpaySignature = requireString(
		req.body.razorpay_signature,
		"razorpay_signature",
	);

	const isValid = verifyPaymentSignature({
		orderId: razorpayOrderId,
		paymentId: razorpayPaymentId,
		signature: razorpaySignature,
	});

	if (!isValid) {
		await markOrderFailed({
			razorpayOrderId,
			razorpayPaymentId,
			razorpaySignature,
		});

		throw new HttpError(400, "Invalid payment signature");
	}

	const updatedOrder = await markOrderPaid({
		razorpayOrderId,
		razorpayPaymentId,
		razorpaySignature,
	});

	if (!updatedOrder) {
		throw new HttpError(404, "Order not found in database");
	}

	res.json({
		message: "Payment verified and order updated",
		verified: true,
		order: updatedOrder,
	});
};

export const listOrders = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	const orders = await getAllOrders();
	res.json({
		count: orders.length,
		data: orders,
	});
};

export const webhookHandler = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const signature = req.header("x-razorpay-signature") || "";
	const rawBody = Buffer.isBuffer(req.body)
		? req.body
		: Buffer.from(JSON.stringify(req.body || {}));

	if (process.env.WEBHOOK_SECRET) {
		const isWebhookValid = verifyWebhookSignature(rawBody, signature);
		if (!isWebhookValid) {
			throw new HttpError(400, "Invalid webhook signature");
		}
	}

	let event: RazorpayWebhookEvent;
	try {
		event = JSON.parse(rawBody.toString("utf8")) as RazorpayWebhookEvent;
	} catch {
		throw new HttpError(400, "Invalid webhook payload");
	}

	const paymentEntity = event?.payload?.payment?.entity;
	if (paymentEntity?.order_id) {
		if (event.event === "payment.captured" && paymentEntity.id) {
			await markOrderPaid({
				razorpayOrderId: paymentEntity.order_id,
				razorpayPaymentId: paymentEntity.id,
				razorpaySignature: signature,
			});
		}

		if (event.event === "payment.failed") {
			await markOrderFailed({
				razorpayOrderId: paymentEntity.order_id,
				razorpayPaymentId: paymentEntity.id,
				razorpaySignature: signature || null,
			});
		}
	}

	res.json({ received: true });
};

export const getOrderById = async (
	req: Request<{ razorpayOrderId: string }>,
	res: Response<OrderRecord | { message: string }>,
): Promise<void> => {
	const razorpayOrderId = requireString(
		req.params.razorpayOrderId,
		"razorpayOrderId",
	);
	const order = await getOrderByRazorpayOrderId(razorpayOrderId);

	if (!order) {
		throw new HttpError(404, "Order not found");
	}

	res.json(order);
};
