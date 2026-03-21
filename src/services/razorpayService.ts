import crypto from "node:crypto";
import Razorpay from "razorpay";
import { config } from "../config.ts";

const razorpay = new Razorpay({
	key_id: config.razorpay.keyId,
	key_secret: config.razorpay.keySecret,
});

interface CreateRazorpayOrderInput {
	amount: number;
	currency: string;
	receipt: string;
	notes?: Record<string, string>;
}

interface VerifyPaymentInput {
	orderId: string;
	paymentId: string;
	signature: string;
}

export const createRazorpayOrder = async ({
	amount,
	currency,
	receipt,
	notes,
}: CreateRazorpayOrderInput) => {
	return razorpay.orders.create({
		amount,
		currency,
		receipt,
		notes,
	});
};

export const verifyPaymentSignature = ({
	orderId,
	paymentId,
	signature,
}: VerifyPaymentInput): boolean => {
	const payload = `${orderId}|${paymentId}`;
	const expectedSignature = crypto
		.createHmac("sha256", config.razorpay.keySecret || "")
		.update(payload)
		.digest("hex");

	const provided = Buffer.from(signature);
	const expected = Buffer.from(expectedSignature);

	if (provided.length !== expected.length) {
		return false;
	}

	return crypto.timingSafeEqual(provided, expected);
};

export const verifyWebhookSignature = (
	rawBody: Buffer,
	signature: string,
): boolean => {
	if (!config.razorpay.webhookSecret) {
		return false;
	}

	const expectedSignature = crypto
		.createHmac("sha256", config.razorpay.webhookSecret)
		.update(rawBody)
		.digest("hex");

	const provided = Buffer.from(signature || "");
	const expected = Buffer.from(expectedSignature);

	if (provided.length !== expected.length) {
		return false;
	}

	return crypto.timingSafeEqual(provided, expected);
};
