import { NextAuthOptions } from "next-auth";
import TwitchProvider from "next-auth/providers/twitch";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/lib/env";
import { pgPool } from "./db";
import PostgresAdapter from "@auth/pg-adapter";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
	adapter: PostgresAdapter(pgPool),
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" }
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials.password) {
					return null;
				}

				const userQuery = await pgPool.query('SELECT * FROM users WHERE email = $1', [credentials.email]);
				const user = userQuery.rows[0];

				if (user && user.password && await bcrypt.compare(credentials.password, user.password)) {
					return { id: user.id, name: user.name, email: user.email, image: user.image };
				} else {
					return null;
				}
			}
		}),
		TwitchProvider({
			clientId: env.TWITCH_CLIENT_ID,
			clientSecret: env.TWITCH_CLIENT_SECRET,
			authorization: {
				params: {
					scope:
						'openid user:read:email channel:manage:broadcast user:read:broadcast channel:read:subscriptions moderator:read:followers user:read:follows',
				},
			},
		}),
		GoogleProvider({
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			authorization: {
				params: {
					scope:
						'openid https://www.googleapis.com/auth/youtube.readonly',
				},
			},
		}),
		// KickProvider({
		// 	clientId: process.env.KICK_CLIENT_ID,
		// 	clientSecret: process.env.KICK_CLIENT_SECRET,
		// }),
	],
	secret: env.AUTH_SECRET,
	callbacks: {
		async jwt({ token, account, profile }) {
			if (account) {
				if (account.provider === 'twitch') {
					token.twitchAccessToken = account.access_token;
				}
				if (account.provider === 'google') {
					token.googleAccessToken = account.access_token;
				}
			}
			if (profile) {
				token.id = profile.sub;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user && token.sub) {
				session.user.id = token.sub;
			}
			if (token.twitchAccessToken) {
				session.twitchAccessToken = token.twitchAccessToken as string;
			}
			if (token.googleAccessToken) {
				session.googleAccessToken = token.googleAccessToken as string;
			}
			return session;
		},
	},
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: '/login',
	},
}; 