import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createOrder,
  getOrderById,
  listOrders,
  verifyPayment,
  webhookHandler,
} from "../controllers/paymentController.js";

const router = Router();

router.post("/create-order", asyncHandler(createOrder));
router.post("/verify-payment", asyncHandler(verifyPayment));
router.get("/orders", asyncHandler(listOrders));
router.get("/orders/:razorpayOrderId", asyncHandler(getOrderById));
router.post("/webhook", asyncHandler(webhookHandler));

export default router;
