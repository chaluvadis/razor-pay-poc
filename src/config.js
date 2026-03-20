import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "DATABASE_URL"];
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
}

export const config = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || "development",
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.WEBHOOK_SECRET || "",
  },
  databaseUrl: process.env.DATABASE_URL,
};
