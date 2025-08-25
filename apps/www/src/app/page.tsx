"use client";

import Loading from "@/components/loading";
import SignedInScreen from "@/components/signed-in-screen";
import SignInScreen from "@/components/sign-in-screen";
import CdpProvider from "@/providers/cdp";
import { useIsInitialized, useIsSignedIn } from "@coinbase/cdp-hooks";

/**
 * Home page for the Next.js app
 *
 * @returns The home page
 */
export default function Home() {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();
  return (
    <CdpProvider>
          <div className="app flex-col-container flex-grow">
      {!isInitialized && <Loading />}
      {isInitialized && (
        <>
          {!isSignedIn && <SignInScreen />}
          {isSignedIn && <SignedInScreen />}
        </>
      )}
    </div>
    </CdpProvider>
  );
}
