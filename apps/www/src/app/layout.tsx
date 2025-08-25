import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CDP Next.js StarterKit",
  description: "The CDP Next.js StarterKit",
};

/**
 * Root layout for the Next.js app
 *
 * @param props - { object } - The props for the RootLayout component
 * @param props.children - { React.ReactNode } - The children to wrap
 * @returns The wrapped children
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="root">{children}</div>
      </body>
    </html>
  );
}
