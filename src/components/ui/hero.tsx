'use client';

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export function Hero({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { theme } = useTheme();
  return (
    <div
      className={cn(
        "py-20 sm:py-32",
        theme === "dark" ? "dark-grid" : "light-grid",
        className,
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

export function HeroTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function HeroSubtitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn("mt-6 text-lg leading-8 text-muted-foreground", className)}
    >
      {children}
    </p>
  );
} 