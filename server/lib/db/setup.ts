import { sql } from "../db";

async function setup() {
	await sql`
        CREATE TABLE auth_user (
            id TEXT NOT NULL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        );
    `;

	await sql`
        CREATE TABLE auth_session (
            id TEXT NOT NULL PRIMARY KEY,
            expires_at TIMESTAMPTZ NOT NULL,
            user_id TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES auth_user(id)
        );
    `;

	await sql`
		CREATE TABLE auth_key (
			id TEXT NOT NULL PRIMARY KEY,
			user_id TEXT NOT NULL,
			primary_key BOOLEAN NOT NULL,
			hashed_password TEXT,
			expires BIGINT,
			FOREIGN KEY (user_id) REFERENCES auth_user(id)
		);
	`;

	console.log("Database setup complete.");
	process.exit(0);
}

setup(); 