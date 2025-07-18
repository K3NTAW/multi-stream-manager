"use client";

import { signIn, signOut } from "next-auth/react";

export function SignIn() {
	return (
		<button
			onClick={() => signIn("twitch")}
			className="bg-purple-600 text-white p-2 rounded"
		>
			Login with Twitch
		</button>
	);
}

export function SignOut() {
	return (
		<button
			onClick={() => signOut()}
			className="bg-red-500 text-white p-2 rounded mt-2"
		>
			Log out
		</button>
	);
} 