"use client";

import { useIsInitialized, useIsSignedIn } from "@coinbase/cdp-hooks";

import Loading from "@/components/loading";
import SignedInScreen from "@/components/signed-in-screen";
import SignInScreen from "@/components/sign-in-screen";

/**
 * A component that displays the client app.
 */
export default function ClientApp() {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();

  return (
    <div className="app flex-col-container flex-grow">
      {!isInitialized && <Loading />}
      {isInitialized && (
        <>
          {!isSignedIn && <SignInScreen />}
          {isSignedIn && <SignedInScreen />}
        </>
      )}
    </div>
  );
}
