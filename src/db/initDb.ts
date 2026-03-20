import { query } from "./pool.js";

const createOrdersTableSQL = `
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('created', 'paid', 'failed')),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export const initDb = async (): Promise<void> => {
	await query(createOrdersTableSQL);
};
