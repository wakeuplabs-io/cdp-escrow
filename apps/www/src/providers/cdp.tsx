"use client";

import { type Config } from "@coinbase/cdp-hooks";
import { CDPReactProvider, type AppConfig } from "@coinbase/cdp-react/components/CDPReactProvider";
import { type Theme } from "@coinbase/cdp-react/theme";

export const theme: Partial<Theme> = {
  "colors-bg-default": "var(--color-background)",
  "colors-bg-overlay": "var(--color-background)",
  "colors-bg-skeleton": "var(--color-background)",
  "colors-bg-primary": "var(--color-primary)",
  "colors-bg-secondary": "var(--color-secondary)",
  "colors-fg-default": "var(--color-foreground)",
  "colors-fg-muted": "var(--color-muted-foreground)",
  "colors-fg-primary": "var(--color-primary)",
  "colors-fg-onPrimary": "var(--color-primary-foreground)",
  "colors-fg-onSecondary": "var(--color-secondary-foreground)",
  "colors-line-default": "var(--color-border)",
  "colors-line-heavy": "var(--color-muted-foreground)",
  "colors-line-primary": "var(--color-primary)",
  "font-family-sans": "var(--font-sans)",
  "font-size-base": "var(--font-size-base)",
};

interface ProvidersProps {
  children: React.ReactNode;
}

const CDP_CONFIG: Config = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? "",
  createAccountOnLogin: process.env.NEXT_PUBLIC_CDP_CREATE_ACCOUNT_TYPE === "evm-smart" ? "evm-smart" : "evm-eoa",
};

const APP_CONFIG: AppConfig = {
  name: "CDP Example 2",
  logoUrl: "http://localhost:3000/icon.svg",
  authMethods: ["email", "sms"],
};

/**
 * Providers component that wraps the application in all requisite providers
 *
 * @param props - { object } - The props for the Providers component
 * @param props.children - { React.ReactNode } - The children to wrap
 * @returns The wrapped children
 */
export default function CdpProvider({ children }: ProvidersProps) {
  return (
    <CDPReactProvider config={CDP_CONFIG} app={APP_CONFIG} theme={theme}>
      {children}
    </CDPReactProvider>
  );
}
