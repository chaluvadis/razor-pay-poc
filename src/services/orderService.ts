import { query } from "../db/pool.js";
import type {
	CreateOrderInput,
	MarkOrderFailedInput,
	MarkOrderPaidInput,
	OrderRecord,
} from "../types/order.js";

export const insertOrder = async ({
	razorpayOrderId,
	amount,
	currency,
	status = "created",
}: CreateOrderInput): Promise<OrderRecord> => {
	const sql = `
    INSERT INTO orders (razorpay_order_id, amount, currency, status)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
	const values = [razorpayOrderId, amount, currency, status];
	const result = await query<OrderRecord>(sql, values);
	return result.rows[0];
};

export const markOrderPaid = async ({
	razorpayOrderId,
	razorpayPaymentId,
	razorpaySignature,
}: MarkOrderPaidInput): Promise<OrderRecord | null> => {
	const sql = `
    UPDATE orders
    SET status = 'paid',
        razorpay_payment_id = $2,
        razorpay_signature = $3
    WHERE razorpay_order_id = $1
    RETURNING *
  `;
	const values = [razorpayOrderId, razorpayPaymentId, razorpaySignature];
	const result = await query<OrderRecord>(sql, values);
	return result.rows[0] || null;
};

export const markOrderFailed = async ({
	razorpayOrderId,
	razorpayPaymentId,
	razorpaySignature,
}: MarkOrderFailedInput): Promise<OrderRecord | null> => {
	const sql = `
    UPDATE orders
    SET status = 'failed',
        razorpay_payment_id = COALESCE($2, razorpay_payment_id),
        razorpay_signature = COALESCE($3, razorpay_signature)
    WHERE razorpay_order_id = $1
    RETURNING *
  `;
	const values = [razorpayOrderId, razorpayPaymentId, razorpaySignature];
	const result = await query<OrderRecord>(sql, values);
	return result.rows[0] || null;
};

export const getOrderByRazorpayOrderId = async (
	razorpayOrderId: string,
): Promise<OrderRecord | null> => {
	const sql = `
    SELECT *
    FROM orders
    WHERE razorpay_order_id = $1
    LIMIT 1
  `;
	const result = await query<OrderRecord>(sql, [razorpayOrderId]);
	return result.rows[0] || null;
};

export const getAllOrders = async (): Promise<OrderRecord[]> => {
	const sql = `
    SELECT *
    FROM orders
    ORDER BY created_at DESC, id DESC
  `;
	const result = await query<OrderRecord>(sql);
	return result.rows;
};
