"use client";

import { signIn, signOut } from "next-auth/react";
import { Button } from './ui/button';

export function SignInButton({ provider }: { provider?: string }) {
	if (provider) {
		return (
			<Button onClick={() => signIn(provider)}>
				Connect
			</Button>
		);
	}

	return (
		<div className="flex space-x-2">
			<Button onClick={() => signIn('twitch')}>Login with Twitch</Button>
			<Button onClick={() => signIn('google')}>Login with YouTube</Button>
			<Button disabled>Login with Kick</Button>
		</div>
	);
}

export function SignOutButton() {
	return (
		<Button variant="destructive" onClick={() => signOut()}>
			Logout
		</Button>
	);
} 