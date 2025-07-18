import { ChatFeed } from "@/components/chat-feed";
import { StreamInfoForm } from "@/components/stream-info-form";
import { SignInButton } from "@/components/auth-buttons";
import { getServerSession } from "next-auth";
import { Navbar } from "@/components/navbar";

export default async function Home() {
  const session = await getServerSession();

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
        <h1 className="text-4xl font-bold mb-4">Stream Manager</h1>
        <p className="mb-8">Please log in to continue</p>
        <SignInButton />
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex h-screen bg-gray-900 text-white">
        <div className="w-1/3">
          <StreamInfoForm />
        </div>
        <div className="w-2/3">
          <ChatFeed />
        </div>
      </main>
    </>
  );
}
