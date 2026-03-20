export type OrderStatus = "created" | "paid" | "failed";

export interface OrderRecord {
	id: number;
	razorpay_order_id: string;
	amount: number;
	currency: string;
	status: OrderStatus;
	razorpay_payment_id: string | null;
	razorpay_signature: string | null;
	created_at: string;
}

export interface CreateOrderInput {
	razorpayOrderId: string;
	amount: number;
	currency: string;
	status?: OrderStatus;
}

export interface MarkOrderPaidInput {
	razorpayOrderId: string;
	razorpayPaymentId: string;
	razorpaySignature: string;
}

export interface MarkOrderFailedInput {
	razorpayOrderId: string;
	razorpayPaymentId?: string | null;
	razorpaySignature?: string | null;
}
