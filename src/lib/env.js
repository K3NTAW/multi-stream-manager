const { z } = require('zod');

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  TWITCH_CLIENT_ID: z.string().optional().default("your-twitch-client-id"),
  TWITCH_CLIENT_SECRET: z.string().optional().default("your-twitch-client-secret"),
  GOOGLE_CLIENT_ID: z.string().optional().default("your-google-client-id"),
  GOOGLE_CLIENT_SECRET: z.string().optional().default("your-google-client-secret"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  NEXTAUTH_URL: z.string().url().optional().default("http://localhost:3000"),
  NEXTAUTH_SECRET: z.string().optional().default("your-nextauth-secret"),
  AUTH_SECRET: z.string().optional().default("your-nextauth-secret"),
});

const env = envSchema.parse({
  ...process.env,
  DATABASE_URL: process.env.SUPABASE_URL,
});

module.exports = { env }; 