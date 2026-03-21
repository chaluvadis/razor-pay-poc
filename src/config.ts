import { env } from "node:process";

const requiredEnvVars = [
	"RAZORPAY_KEY_ID",
	"RAZORPAY_KEY_SECRET",
	"DATABASE_URL",
];
const missingEnvVars = requiredEnvVars.filter((name) => !env[name]);

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
	const value = env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
};

export const config: AppConfig = {
	port: Number(env.PORT || 3000),
	nodeEnv: env.NODE_ENV || "development",
	razorpay: {
		keyId: getRequiredEnv("RAZORPAY_KEY_ID"),
		keySecret: getRequiredEnv("RAZORPAY_KEY_SECRET"),
		webhookSecret: env.WEBHOOK_SECRET || "",
	},
	databaseUrl: getRequiredEnv("DATABASE_URL"),
};
