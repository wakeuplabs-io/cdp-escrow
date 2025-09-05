"use client";
import { Toaster } from "sonner";
import CdpProvider from "./cdp";
import QueryProvider from "./query";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <CdpProvider>{children}
      <Toaster />
      </CdpProvider>
    </QueryProvider>
  );
}