"use client";

import { Onramp } from "@/components/account-manager/onramp";
import { Receive } from "@/components/account-manager/receive";
import { Withdraw } from "@/components/account-manager/withdraw";
import { Address } from "@/components/address";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { TOKEN_DECIMALS } from "@/config";
import { useBalance } from "@/hooks/balance";
import { shortenAddress } from "@/lib/utils";
import { useEvmAddress, useIsSignedIn, useSignOut } from "@coinbase/cdp-hooks";
import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  LogOutIcon,
  QrCodeIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { formatUnits } from "viem";

enum Tab {
  Account = "account",
  Withdraw = "withdraw",
  Deposit = "deposit",
  Onramp = "onramp",
  Receive = "receive",
}

export const AccountManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState(Tab.Account);
  const [onrampAmount, setOnrampAmount] = useState("");

  const { signOut } = useSignOut();
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const { data: balance } = useBalance(evmAddress);

  const tabs = useMemo(() => {
    return {
      [Tab.Account]: {
        title: "Your account",
        description: "Your account address is ready to be used.",
        content: (
          <>
            <Address
              address={evmAddress ?? ""}
              balance={balance}
              balanceLabel="USDC"
              className="mb-6"
            />

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setTab(Tab.Deposit)}
                className="w-full justify-start text-sm"
                size="lg"
                variant="outline"
              >
                <ArrowDownIcon className="w-4 h-4" />
                Add USDC
              </Button>

              <Button
                onClick={() => setTab(Tab.Withdraw)}
                className="w-full justify-start text-sm"
                size="lg"
                variant="outline"
              >
                <ArrowUpIcon className="w-4 h-4" />
                Withdraw USDC
              </Button>

              <Button
                onClick={() => {
                  signOut().then(() => {
                    setIsOpen(false);
                  });
                }}
                className="w-full text-destructive justify-start text-sm"
                size="lg"
                variant="outline"
              >
                <LogOutIcon className="w-4 h-4" />
                Sign out
              </Button>
            </div>
          </>
        ),
      },
      [Tab.Deposit]: {
        title: "Add funds to your wallet",
        description: "Add funds to your wallet to fund your challenges",
        content: (
          <>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setTab(Tab.Onramp)}
                className="w-full flex items-center justify-start gap-2"
                variant="outline"
                size="lg"
              >
                <ArrowDownIcon className="w-4 h-4" />
                Onramp USDC
              </Button>

              <Button
                onClick={() => setTab(Tab.Receive)}
                className="w-full flex items-center justify-start gap-2"
                variant="outline"
                size="lg"
              >
                <QrCodeIcon className="w-4 h-4" />
                Receive USDC
              </Button>
            </div>
          </>
        ),
      },
      [Tab.Withdraw]: {
        title: "Withdraw funds from your wallet",
        description: "Withdraw your rewards to your wallet",
        content: <Withdraw />,
      },
      [Tab.Onramp]: {
        title: "Onramp USDC",
        description: "Onramp USDC to your wallet",
        content: <Onramp />,
      },
      [Tab.Receive]: {
        title: "Receive USDC",
        description: "Receive USDC to your wallet",
        content: <Receive />,
      },
    } as const;
  }, [balance, evmAddress, onrampAmount, setOnrampAmount, signOut]);

  return (
    <>
      {isSignedIn && evmAddress ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full border h-[46px] px-4 shrink-0"
        >
          <Image
            src="/avatar.webp"
            alt="avatar"
            className="w-[18px] h-[18px] rounded-full"
          />
          <span className="text-sm">
            {shortenAddress(evmAddress ?? "")}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatUnits(balance ?? 0n, TOKEN_DECIMALS)} USDC
          </span>
        </button>
      ) : (
        <AuthButton
          className="flex items-center gap-2 rounded-full border h-[46px]  shrink-0 text-sm font-normal [&_button]:!bg-transparent [&_button]:!text-foreground [&_button]:!px-4"
          id="account-manager"
        />
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[360px] rounded-3xl p-4 gap-0 pb-10">
          <div className=" mb-4 w-full flex justify-between">
            {tab !== Tab.Account ? (
              <button
                onClick={() => setTab(Tab.Account)}
                className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 rounded-full bg-muted h-4 w-4 flex items-center justify-center"
              >
                <ArrowLeftIcon />
              </button>
            ) : (
              <div />
            )}

            <DialogClose className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 rounded-full bg-muted h-4 w-4 flex items-center justify-center">
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>

          <DialogTitle className="text-center font-medium text-base mb-6">
            {tabs[tab].title}
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground text-center mb-6">
            {tabs[tab].description}
          </DialogDescription>

          {tabs[tab].content}
        </DialogContent>
      </Dialog>
    </>
  );
};
