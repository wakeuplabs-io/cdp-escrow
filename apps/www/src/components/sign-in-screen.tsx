"use client";

import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";

/**
 * Sign in screen
 */
export default function SignInScreen() {
  return (
    <main className="card card--login">
      <h1 className="sr-only">Sign in</h1>
      <p className="card-title">Welcome!</p>
      <p>Please sign in to continue.</p>
      <AuthButton />
    </main>
  );
}
