import { query } from "../db/pool.js";

/**
 * @param {{ razorpayOrderId: string, amount: number, currency: string, status?: 'created' | 'paid' | 'failed' }} params
 */
export const insertOrder = async ({ razorpayOrderId, amount, currency, status = "created" }) => {
  const sql = `
    INSERT INTO orders (razorpay_order_id, amount, currency, status)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [razorpayOrderId, amount, currency, status];
  const result = await query(sql, values);
  return result.rows[0];
};

/**
 * @param {{ razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string }} params
 */
export const markOrderPaid = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const sql = `
    UPDATE orders
    SET status = 'paid',
        razorpay_payment_id = $2,
        razorpay_signature = $3
    WHERE razorpay_order_id = $1
    RETURNING *
  `;
  const values = [razorpayOrderId, razorpayPaymentId, razorpaySignature];
  const result = await query(sql, values);
  return result.rows[0] || null;
};

/**
 * @param {{ razorpayOrderId: string, razorpayPaymentId?: string | null, razorpaySignature?: string | null }} params
 */
export const markOrderFailed = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const sql = `
    UPDATE orders
    SET status = 'failed',
        razorpay_payment_id = COALESCE($2, razorpay_payment_id),
        razorpay_signature = COALESCE($3, razorpay_signature)
    WHERE razorpay_order_id = $1
    RETURNING *
  `;
  const values = [razorpayOrderId, razorpayPaymentId, razorpaySignature];
  const result = await query(sql, values);
  return result.rows[0] || null;
};

/**
 * @param {string} razorpayOrderId
 */
export const getOrderByRazorpayOrderId = async (razorpayOrderId) => {
  const sql = `
    SELECT *
    FROM orders
    WHERE razorpay_order_id = $1
    LIMIT 1
  `;
  const result = await query(sql, [razorpayOrderId]);
  return result.rows[0] || null;
};

export const getAllOrders = async () => {
  const sql = `
    SELECT *
    FROM orders
    ORDER BY created_at DESC, id DESC
  `;
  const result = await query(sql);
  return result.rows;
};
