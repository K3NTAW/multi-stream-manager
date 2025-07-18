import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Navbar } from "@/components/navbar";
import { SignInButton } from "@/components/auth-buttons";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    // This should not happen if the page is protected, but it's good practice
    return (
      <div>
        <p>You must be logged in to view this page.</p>
        <SignInButton />
      </div>
    );
  }

  const { user } = session;

  return (
    <>
      <Navbar />
      <main className="container mx-auto p-4 md:p-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and connected services.
            </p>
          </div>
          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Name</span>
                <span>{user.name}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{user.email}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connected Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Twitch Connection */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Twitch</span>
                {session.user.image?.includes('twitch') ? (
                  <span className="text-sm text-green-500">Connected</span>
                ) : (
                  <SignInButton provider="twitch" />
                )}
              </div>
              <Separator />
              {/* YouTube Connection */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">YouTube</span>
                {session.user.image?.includes('google') ? (
                  <span className="text-sm text-green-500">Connected</span>
                ) : (
                  <SignInButton provider="google" />
                )}
              </div>
              <Separator />
              {/* Kick Connection */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Kick</span>
                <span className="text-sm text-muted-foreground">Not available</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
} 