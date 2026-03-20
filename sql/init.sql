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

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders (razorpay_order_id);
