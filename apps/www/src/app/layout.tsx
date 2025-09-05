import Providers from "@/providers";
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
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="root">
          <Providers>
            <div className="hidden xl:block">{children}</div>
            <div className="xl:hidden flex flex-col items-center justify-center h-screen">
              <h1 className="text-4xl font-bold">Mobile Not Available</h1>
              <p className="text-lg text-center mt-4">
                Please open this application on a desktop browser. Mobile
                version coming soon.
              </p>
            </div>
          </Providers>
        </div>
      </body>
    </html>
  );
}
