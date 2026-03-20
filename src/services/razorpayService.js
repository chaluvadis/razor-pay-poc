import crypto from "crypto";
import Razorpay from "razorpay";
import { config } from "../config.js";

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

/**
 * @param {{ amount: number, currency: string, receipt: string, notes?: Record<string, string> }} params
 */
export const createRazorpayOrder = async ({ amount, currency, receipt, notes }) => {
  return razorpay.orders.create({
    amount,
    currency,
    receipt,
    notes,
  });
};

/**
 * @param {{ orderId: string, paymentId: string, signature: string }} params
 */
export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
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

/**
 * @param {Buffer} rawBody
 * @param {string} signature
 */
export const verifyWebhookSignature = (rawBody, signature) => {
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
