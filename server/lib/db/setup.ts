import "dotenv/config";
import { pgPool } from "../db";

async function setup() {
  await pgPool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  await pgPool.query(`
    CREATE TABLE "users" (
      "id" uuid NOT NULL DEFAULT gen_random_uuid(),
      "name" text,
      "email" text,
      "emailVerified" timestamp with time zone,
      "image" text,
      "password" text,
      CONSTRAINT "users_pkey" PRIMARY KEY ("id")
    );
  `);

  await pgPool.query(`
    CREATE TABLE "accounts" (
      "id" uuid NOT NULL DEFAULT gen_random_uuid(),
      "userId" uuid NOT NULL,
      "type" text NOT NULL,
      "provider" text NOT NULL,
      "providerAccountId" text NOT NULL,
      "refresh_token" text,
      "access_token" text,
      "expires_at" integer,
      "token_type" text,
      "scope" text,
      "id_token" text,
      "session_state" text,
      CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
    );
  `);

  await pgPool.query(`
    CREATE TABLE "sessions" (
      "id" uuid NOT NULL DEFAULT gen_random_uuid(),
      "sessionToken" text NOT NULL,
      "userId" uuid NOT NULL,
      "expires" timestamp with time zone NOT NULL,
      CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
    );
  `);

  await pgPool.query(`
    CREATE TABLE "verification_tokens" (
      "identifier" text NOT NULL,
      "token" text NOT NULL,
      "expires" timestamp with time zone NOT NULL
    );
  `);

  await pgPool.query(`
    ALTER TABLE "accounts"
      ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE cascade ON UPDATE cascade;
  `);

  await pgPool.query(`
    ALTER TABLE "sessions"
      ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE cascade ON UPDATE cascade;
  `);

  console.log("Database setup complete.");
  process.exit(0);
}

setup(); 