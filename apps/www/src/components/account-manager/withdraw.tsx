import { useBalance } from "@/hooks/balance";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { useCallback, useState } from "react";
import { Address } from "../address";
import { Button } from "../ui/button";

export const Withdraw = () => {
  const { evmAddress } = useEvmAddress();
  const { data: balance } = useBalance(evmAddress);

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const onWithdraw = useCallback(async () => {
    // await withdraw(to, amount);
  }, [to, amount]);

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

      <div className="bg-muted rounded-md px-4 py-3 flex items-center  gap-2 relative pt-6 mb-6">
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

      <Button
        className="w-full"
        size="lg"
        variant="outline"
        onClick={onWithdraw}
      >
        Withdraw
      </Button>
    </div>
  );
};
