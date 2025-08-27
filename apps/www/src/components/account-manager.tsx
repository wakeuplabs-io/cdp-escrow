"use client";

import { useEvmAddress, useIsSignedIn, useSignOut } from "@coinbase/cdp-hooks";
import { shortenAddress } from "@/lib/utils";
import { useMemo, useState } from "react";
import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "./ui/dialog";
import { Alert, AlertTitle } from "./ui/alert";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  AlertCircleIcon,
  QrCodeIcon,
  XIcon,
  ArrowUpIcon,
  LogOutIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import QRCode from "react-qr-code";
import { Address } from "./address";

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

  const { signOut } = useSignOut();
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();

  const tabs = useMemo(() => {
    return {
      [Tab.Account]: {
        title: "Your account",
        description: "Your account address is ready to be used.",
        content: (
          <>
            <Address
              address={
                evmAddress ?? "0xA1D3ba06878B6B7EC54781A5BaCBF5068BCaa1d0"
              }
              balance={0}
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
                <span>Add USDC</span>
              </Button>

              <Button
                onClick={() => setTab(Tab.Withdraw)}
                className="w-full justify-start text-sm"
                size="lg"
                variant="outline"
              >
                <ArrowUpIcon className="w-4 h-4" />
                <span>Withdraw USDC</span>
              </Button>

              <Button
                onClick={() => signOut()}
                className="w-full text-destructive justify-start text-sm"
                size="lg"
                variant="outline"
              >
                <LogOutIcon className="w-4 h-4" />
                <span>Sign out</span>
              </Button>
            </div>
          </>
        ),
      },
      [Tab.Withdraw]: {
        title: "Withdraw funds from your wallet",
        description: "Withdraw your rewards to your wallet",
        content: (
          <>
            <Address
              label="From"
              address={
                evmAddress ?? "0xA1D3ba06878B6B7EC54781A5BaCBF5068BCaa1d0"
              }
              balance={0}
              balanceLabel="USDC"
              className="mb-2"
            />

            <div className="bg-muted rounded-md px-4 py-3 flex items-center  gap-2 relative pt-6 mb-2">
              <span className="text-xs text-muted-foreground absolute left-4 top-1">
                To
              </span>
              <input
                className="text-sm text-muted-foreground outline-none w-full"
                placeholder="0x..."
              />
            </div>

            <div className="bg-muted rounded-md px-4 py-3 flex items-center  gap-2 relative pt-6 mb-6">
              <span className="text-xs text-muted-foreground absolute left-4 top-1">
                Amount
              </span>
              <input
                className="text-sm text-muted-foreground outline-none w-full"
                placeholder="0.1"
              />
            </div>

            <Button className="w-full" size="lg" variant="outline">
              Withdraw
            </Button>
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
                <span>Onramp USDC</span>
              </Button>

              <Button
                onClick={() => setTab(Tab.Receive)}
                className="w-full flex items-center justify-start gap-2"
                variant="outline"
                size="lg"
              >
                <QrCodeIcon className="w-4 h-4" />
                <span>Receive USDC</span>
              </Button>
            </div>
          </>
        ),
      },
      [Tab.Onramp]: {
        title: "Onramp USDC",
        description: "Onramp USDC to your wallet",
        content: <></>,
      },
      [Tab.Receive]: {
        title: "Receive USDC",
        description: "Receive USDC to your wallet",
        content: (
          <div className="flex flex-col gap-4">
            <QRCode
              className="h-40 w-40 mx-auto"
              value="0xA1D3ba06878B6B7EC54781A5BaCBF5068BCaa1d0"
            />

            <Alert variant="default" className="bg-[#FFF5E6] border-none">
              <AlertCircleIcon color="blue" />
              <AlertTitle className="text-sm font-normal">
                Make sure to send USDC on Base
              </AlertTitle>
            </Alert>

            <Address
              address={
                evmAddress ?? "0xA1D3ba06878B6B7EC54781A5BaCBF5068BCaa1d0"
              }
              balance={0}
              balanceLabel="USDC"
            />
          </div>
        ),
      },
    } as const;
  }, []);

  return (
    <>
      {isSignedIn && evmAddress ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full border h-[46px] px-4 shrink-0"
        >
          <img
            src="/avatar.webp"
            alt="avatar"
            className="w-[18px] h-[18px] rounded-full"
          />
          <span className="text-sm">
            {shortenAddress(evmAddress ?? "0x123456789")}
          </span>
          <span className="text-xs text-muted-foreground">0 USDC</span>
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
