import pg from "pg";

const { Client } = pg;
export const psqlClient = new Client({
	user: process.env.PG_USER,
	password: process.env.PG_PASSWORD,
	host: process.env.PG_HOSTNAME || "127.0.0.1",
	port: parseInt(process.env.PG_PORT || "5432"),
	database: process.env.PG_DATABASE || "td"
});

export const db = psqlClient.query;
