import app from "./app.ts";
import { config } from "./config.ts";
import { initDb } from "./db/initDb.ts";
import { pool } from "./db/pool.ts";

const startServer = async (): Promise<void> => {
	try {
		await initDb();
		console.log("Database initialized");

		app.listen(config.port, () => {
			console.log(`Server listening on port ${config.port}`);
		});
	} catch (error: unknown) {
		console.error("Failed to start server", error);
		await pool.end();
		process.exit(1);
	}
};

startServer();
