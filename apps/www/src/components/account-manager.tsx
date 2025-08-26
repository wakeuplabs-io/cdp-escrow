"use client";
import { useEvmAddress, useIsSignedIn, useSignOut } from "@coinbase/cdp-hooks";
import { shortenAddress } from "@/lib/utils";
import { useState } from "react";
import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";

export const AccountManager = () => {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useSignOut();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-full border h-[46px] px-4 shrink-0"
      >
        {isSignedIn && evmAddress ? (
          <>
            <img
              src="/avatar.webp"
              alt="avatar"
              className="w-[18px] h-[18px] rounded-full"
            />
            <span className="text-sm">{shortenAddress(evmAddress)}</span>
          </>
        ) : (
          <span className="text-sm">Sign in</span>
        )}
      </button>

      {/* <AuthButton
        className="flex items-center gap-2 rounded-full border h-[46px] px-4 shrink-0 text-sm font-normal"
        id="account-manager"
      /> */}

    </>
  );
};
