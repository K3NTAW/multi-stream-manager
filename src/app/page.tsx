import { ChatFeed } from "@/components/chat-feed";
import { StreamInfoForm } from "@/components/stream-info-form";
import { SignInButton } from "@/components/auth-buttons";
import { getServerSession } from "next-auth";
import { Navbar } from "@/components/navbar";
import { Container } from "@/components/ui/container";
import { Hero, HeroSubtitle, HeroTitle } from "@/components/ui/hero";

export default async function Home() {
  const session = await getServerSession();

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <Hero>
          <HeroTitle>Stream Manager</HeroTitle>
          <HeroSubtitle>
            Your all-in-one tool for managing your stream.
          </HeroSubtitle>
          <SignInButton />
        </Hero>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow flex flex-col p-8 overflow-hidden">
        <div className="flex-grow rounded-xl border bg-card text-card-foreground shadow flex flex-col overflow-hidden">
          <ChatFeed />
        </div>
      </main>
    </>
  );
}
