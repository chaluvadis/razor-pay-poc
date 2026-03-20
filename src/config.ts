import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
	"RAZORPAY_KEY_ID",
	"RAZORPAY_KEY_SECRET",
	"DATABASE_URL",
];
const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
	throw new Error(
		`Missing required environment variables: ${missingEnvVars.join(", ")}`,
	);
}

interface AppConfig {
	port: number;
	nodeEnv: string;
	razorpay: {
		keyId: string;
		keySecret: string;
		webhookSecret: string;
	};
	databaseUrl: string;
}

const getRequiredEnv = (name: string): string => {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
};

export const config: AppConfig = {
	port: Number(process.env.PORT || 3000),
	nodeEnv: process.env.NODE_ENV || "development",
	razorpay: {
		keyId: getRequiredEnv("RAZORPAY_KEY_ID"),
		keySecret: getRequiredEnv("RAZORPAY_KEY_SECRET"),
		webhookSecret: process.env.WEBHOOK_SECRET || "",
	},
	databaseUrl: getRequiredEnv("DATABASE_URL"),
};
