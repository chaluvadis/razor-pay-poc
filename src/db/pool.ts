import pg from "pg";
import type { QueryResult, QueryResultRow } from "pg";
import { config } from "../config.js";

const { Pool } = pg;

export const pool = new Pool({
	connectionString: config.databaseUrl,
});

export const query = <T extends QueryResultRow>(
	text: string,
	params?: unknown[],
): Promise<QueryResult<T>> => pool.query<T>(text, params);
