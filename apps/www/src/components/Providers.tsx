"use client";

import { type Config } from "@coinbase/cdp-hooks";
import { CDPReactProvider, type AppConfig } from "@coinbase/cdp-react/components/CDPReactProvider";

import { theme } from "@/components/theme";

interface ProvidersProps {
  children: React.ReactNode;
}

const CDP_CONFIG: Config = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? "",
  createAccountOnLogin: process.env.NEXT_PUBLIC_CDP_CREATE_ACCOUNT_TYPE === "evm-smart" ? "evm-smart" : "evm-eoa",
};

const APP_CONFIG: AppConfig = {
  name: "CDP Next.js StarterKit",
  logoUrl: "http://localhost:3000/logo.svg",
  authMethods: ["email", "sms"],
};

/**
 * Providers component that wraps the application in all requisite providers
 *
 * @param props - { object } - The props for the Providers component
 * @param props.children - { React.ReactNode } - The children to wrap
 * @returns The wrapped children
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <CDPReactProvider config={CDP_CONFIG} app={APP_CONFIG} theme={theme}>
      {children}
    </CDPReactProvider>
  );
}
