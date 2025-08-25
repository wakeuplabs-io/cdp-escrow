"use client";
import ClientApp from "@/components/client-app";
import Providers from "@/components/providers";

/**
 * Home page for the Next.js app
 *
 * @returns The home page
 */
export default function Home() {
  return (
    <Providers>
      <ClientApp />
    </Providers>
  );
}
