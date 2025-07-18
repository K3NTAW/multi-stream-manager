import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import TwitchProvider from "next-auth/providers/twitch";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/lib/env";

export const authOptions: NextAuthOptions = {
	providers: [
		TwitchProvider({
			clientId: env.TWITCH_CLIENT_ID,
			clientSecret: env.TWITCH_CLIENT_SECRET,
			authorization: {
				params: {
					scope: 'openid user:read:email channel:manage:broadcast',
				},
			},
		}),
		GoogleProvider({
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		}),
		// KickProvider({
		// 	clientId: process.env.KICK_CLIENT_ID,
		// 	clientSecret: process.env.KICK_CLIENT_SECRET,
		// }),
	],
	secret: env.AUTH_SECRET,
	callbacks: {
		async jwt({ token, account, profile }) {
			if (account && profile) {
				token.accessToken = account.access_token;
				token.id = profile.sub;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user && token.id) {
				session.user.id = token.id;
			}
			if (token.accessToken) {
				session.accessToken = token.accessToken;
			}
			return session;
		},
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 