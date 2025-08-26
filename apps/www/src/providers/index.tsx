"use client";
import QueryProvider from "./query";
import CdpProvider from "./cdp";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <CdpProvider>{children}</CdpProvider>
    </QueryProvider>
  );
}