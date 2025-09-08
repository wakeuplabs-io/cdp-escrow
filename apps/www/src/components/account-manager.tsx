"use client";

import { Address } from "@/components/address";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { CDP_ONRAMP_BASE_URL, NETWORK, TOKEN_DECIMALS } from "@/config";
import { useBalance, useWithdraw } from "@/hooks/balance";
import { useOnrampUsdc } from "@/hooks/onramp";
import { formatBalance, shortenAddress } from "@/lib/utils";
import { useEvmAddress, useSignOut } from "@coinbase/cdp-hooks";
import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";
import {
  AlertCircleIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  QrCodeIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import QrCode from "react-qr-code";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";
import { isAddress, parseUnits } from "viem";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Input } from "./ui/input";

enum Tab {
  Account = "account",
  Withdraw = "withdraw",
  Deposit = "deposit",
  Onramp = "onramp",
  WaitingOnramp = "waiting-onramp",
  Receive = "receive",
}

const Account: React.FC<{
  address: string;
  balance: bigint;
  setTab: (tab: Tab) => void;
}> = ({ setTab, address, balance }) => {
  const { signOut } = useSignOut();

  return (
    <>
      <Address
        address={address}
        balance={balance}
        balanceLabel="USDC"
        className="mb-2"
      />

      {NETWORK === "base-sepolia" && (
        <Alert
          variant="default"
          className="bg-[#FFF5E6] border-none mb-6 justify-center flex"
        >
          <AlertCircleIcon color="blue" />
          <AlertTitle className="text-sm font-normal">
            Your account is on <span className="font-bold">Base Sepolia</span>
          </AlertTitle>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          onClick={() => setTab(Tab.Deposit)}
          className="flex text-sm flex-col gap-2 items-center justify-center hover:bg-muted p-2 rounded-md"
        >
          <ArrowDownIcon className="w-4 h-4" />
          <div>Deposit</div>
        </button>

        <button
          onClick={() => setTab(Tab.Withdraw)}
          className="flex justify-start text-sm flex-col gap-2 items-center hover:bg-muted p-2 rounded-md"
        >
          <ArrowUpIcon className="w-4 h-4" />
          <div>Withdraw</div>
        </button>
      </div>

      <Button
        size="lg"
        variant="outline"
        onClick={signOut}
        className="w-full text-destructive flex justify-center text-sm"
      >
        Sign out
      </Button>
    </>
  );
};

const Onramp: React.FC<{ setTab: (tab: Tab) => void }> = ({ setTab }) => {
  const { evmAddress } = useEvmAddress();
  const [onrampAmount, setOnrampAmount] = useState("");
  const { onramp, isPending } = useOnrampUsdc();

  if (!evmAddress) return null;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onramp(onrampAmount).then(() => {
          setTab(Tab.WaitingOnramp);
        });
      }}
      className="flex flex-col gap-4"
    >
      <Input
        placeholder="Amount"
        value={onrampAmount}
        onChange={(e) => setOnrampAmount(e.target.value)}
      />

      {CDP_ONRAMP_BASE_URL.includes("sandbox") && (
        <Alert variant="default" className="bg-[#FFF5E6] border-none">
          <AlertCircleIcon color="blue" />
          <AlertTitle className="text-sm font-normal">
            You&apos;re onramping USDC on{" "}
            <span className="font-bold">Base Sepolia</span>
          </AlertTitle>
          <AlertDescription className="break-words">
            <p className="break-words">
              The{" "}
              <a
                href="https://docs.cdp.coinbase.com/onramp-&-offramp/integration/sandbox-testing"
                target="_blank"
                className="font-bold inline"
              >
                Sandbox
              </a>{" "}
              wont&apos;t give you any token but it&apos;ll allow you to test
              the whole flow
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creating Order..." : "Onramp"}
      </Button>
    </form>
  );
};

const Receive: React.FC<{ setTab: (tab: Tab) => void }> = ({}) => {
  const { evmAddress } = useEvmAddress();
  const { data: balance } = useBalance(evmAddress);

  if (!evmAddress) return null;
  return (
    <div className="flex flex-col">
      <QrCode className="h-40 w-40 mx-auto mb-6" value={evmAddress} />

      <Address
        address={evmAddress}
        balance={balance}
        balanceLabel="USDC"
        className="mb-2"
      />

      {NETWORK === "base-sepolia" && (
        <Alert variant="default" className="bg-[#FFF5E6] border-none">
          <AlertCircleIcon color="blue" />
          <AlertTitle className="text-sm font-normal">
            Make sure to send USDC on{" "}
            <span className="font-bold">Base Sepolia</span>
          </AlertTitle>
        </Alert>
      )}
    </div>
  );
};

const Withdraw: React.FC<{ setTab: (tab: Tab) => void }> = ({ setTab }) => {
  const { evmAddress } = useEvmAddress();
  const { data: balance } = useBalance(evmAddress);
  const { mutateAsync: withdraw, isPending: isWithdrawing } = useWithdraw();

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const onWithdraw = useCallback(async () => {
    if (!evmAddress) return;

    withdraw({
      amount: parseUnits(amount, TOKEN_DECIMALS),
      to: to as `0x${string}`,
    })
      .then(({ userOperationHash }) => {
        toast.success(
          "Withdrawal created successfully with user operation hash: " +
            userOperationHash
        );
        setTab(Tab.Account);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to withdraw", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      });
  }, [to, amount, withdraw, evmAddress, setTab]);

  const validation = useMemo(() => {
    if (!to) {
      return { isValid: false, errors: ["To is required"] };
    }
    if (!isAddress(to)) {
      return { isValid: false, errors: ["To is not a valid address"] };
    }
    if (!amount) {
      return { isValid: false, errors: ["Amount is required"] };
    }
    if (parseUnits(amount, TOKEN_DECIMALS) > (balance ?? 0n)) {
      return { isValid: false, errors: ["Amount is greater than balance"] };
    }
    if (parseUnits(amount, TOKEN_DECIMALS) <= 0n) {
      return { isValid: false, errors: ["Amount must be greater than 0"] };
    }

    return { isValid: true, errors: [] };
  }, [to, amount, balance]);

  if (!evmAddress) return null;
  return (
    <div>
      <Address
        label="From"
        address={evmAddress}
        balance={balance}
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
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      <div className="bg-muted rounded-md px-4 py-3 flex items-center  gap-2 relative pt-6 mb-2">
        <span className="text-xs text-muted-foreground absolute left-4 top-1">
          Amount
        </span>
        <input
          className="text-sm text-muted-foreground outline-none w-full"
          placeholder="0.1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {NETWORK === "base-sepolia" && (
        <Alert
          variant="default"
          className="bg-[#FFF5E6] border-none mb-6 justify-center flex"
        >
          <AlertCircleIcon color="blue" />
          <AlertTitle className="text-sm font-normal">
            Your are withdrawing from{" "}
            <span className="font-bold">Base Sepolia</span>
          </AlertTitle>
        </Alert>
      )}

      <div data-tooltip-id="error-tooltip">
        <Button
          size="lg"
          className="w-full"
          onClick={onWithdraw}
          disabled={!validation.isValid || isWithdrawing}
        >
          {isWithdrawing ? "Withdrawing..." : "Withdraw"}
        </Button>

        {!validation.isValid && (
          <Tooltip id="error-tooltip" content={validation.errors.join(", ")} />
        )}
      </div>
    </div>
  );
};

const Deposit: React.FC<{ setTab: (tab: Tab) => void }> = ({ setTab }) => {
  return (
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
  );
};

const WaitingOnramp: React.FC<{ setTab: (tab: Tab) => void }> = ({
  setTab,
}) => {
  const { evmAddress } = useEvmAddress();
  const { data: balance, refetch } = useBalance(evmAddress);
  const [pending, setPending] = useState(false);

  const onRefresh = useCallback(() => {
    setPending(true);
    refetch().then(() => {
      setPending(false);
    });
  }, [refetch]);

  if (!evmAddress || !balance) return null;
  return (
    <div className="flex flex-col gap-4">
      <Address address={evmAddress} balance={balance} balanceLabel="USDC" />

      <div className="flex flex-col gap-2">
        <Button onClick={onRefresh} disabled={pending}>
          {pending ? "Refreshing..." : "Refresh balance"}
        </Button>
        <Button variant="secondary" onClick={() => setTab(Tab.Account)}>
          Back to account
        </Button>
      </div>
    </div>
  );
};

export const AccountManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState(Tab.Account);

  const { evmAddress } = useEvmAddress();
  const { data: balance } = useBalance(evmAddress);

  useEffect(() => {
    if (!evmAddress) {
      setIsOpen(false);
    }
  }, [evmAddress]);

  const currentTab = useMemo(() => {
    if (!evmAddress) {
      return {
        title: "",
        description: "",
        content: null,
      };
    }

    const tabs = {
      [Tab.Account]: {
        title: "Your account",
        description: "",
        content: (
          <Account
            setTab={setTab}
            address={evmAddress}
            balance={balance ?? 0n}
          />
        ),
      },
      [Tab.Deposit]: {
        title: "Add funds to your wallet",
        description: "Add funds to your wallet to fund your challenges",
        content: <Deposit setTab={setTab} />,
      },
      [Tab.Withdraw]: {
        title: "Withdraw funds from your wallet",
        description: "Withdraw your rewards to your wallet",
        content: <Withdraw setTab={setTab} />,
      },
      [Tab.Onramp]: {
        title: "Onramp USDC",
        description: "Onramp USDC to your wallet",
        content: <Onramp setTab={setTab} />,
      },
      [Tab.WaitingOnramp]: {
        title: "Waiting for Onramp",
        description: "Don’t see the onramp? Check your other browser windows.",
        content: <WaitingOnramp setTab={setTab} />,
      },
      [Tab.Receive]: {
        title: "Receive USDC",
        description: "Receive USDC to your wallet",
        content: <Receive setTab={setTab} />,
      },
    } as const;

    return tabs[tab];
  }, [balance, evmAddress, tab]);

  return (
    <>
      {evmAddress ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-4 rounded-full border h-[46px] px-4 shrink-0"
          >
            <span className="text-sm">{shortenAddress(evmAddress ?? "")}</span>
            <span className="text-sm text-muted-foreground">
              {formatBalance(balance ?? 0n)} USDC
            </span>
          </button>
          <Link
            href={`/${evmAddress}/challenges`}
            className="rounded-full border h-[46px] w-[46px] flex items-center justify-center shrink-0"
          >
            <Image
              src="/avatar.webp"
              alt="avatar"
              className="rounded-full"
              width={18}
              height={18}
            />
          </Link>
        </div>
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
            {currentTab.title}
          </DialogTitle>

          {currentTab.description !== "" && (
            <DialogDescription className="text-sm text-muted-foreground text-center mb-6">
              {currentTab.description}
            </DialogDescription>
          )}

          {currentTab.content}
        </DialogContent>
      </Dialog>
    </>
  );
};
