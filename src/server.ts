import app from "./app.js";
import { config } from "./config.js";
import { initDb } from "./db/initDb.js";
import { pool } from "./db/pool.js";

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
