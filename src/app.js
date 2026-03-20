import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import paymentRoutes from "./routes/paymentRoutes.js";
import { requestLogger } from "./middleware/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { config } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(requestLogger);
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", env: config.nodeEnv });
});

app.get("/api/config", (_req, res) => {
  res.json({
    razorpayKeyId: config.razorpay.keyId,
  });
});

app.use("/api/payments", paymentRoutes);
app.use(express.static(path.join(__dirname, "..", "public")));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
