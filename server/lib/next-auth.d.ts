import 'next-auth';

declare module 'next-auth' {
  interface Session {
    twitchAccessToken?: string;
    googleAccessToken?: string;
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    id?: string;
  }
} 