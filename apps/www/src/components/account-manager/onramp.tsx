import { erc20Service } from "@/config";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const Onramp = () => {
  const { evmAddress } = useEvmAddress();
  const [onrampAmount, setOnrampAmount] = useState("");
  const [balanceBefore, setBalanceBefore] = useState<bigint>(0n);
  const [waiting, setWaiting] = useState(false);

  if (!evmAddress) return null;

  if (waiting) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-sm text-muted-foreground">
          Waiting for funds to arrive...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Amount"
        value={onrampAmount}
        onChange={(e) => setOnrampAmount(e.target.value)}
      />

      <Button
        className="w-full"
        onClick={async () => {
          setBalanceBefore(await erc20Service.getBalance(evmAddress));

          const { token } = await fetch("/api/session", {
            method: "POST",
            body: JSON.stringify({
              addresses: [{ address: evmAddress, blockchains: ["base"] }],
              assets: ["USDC"],
            }),
          }).then((res) => res.json());
          window.open(
            `${process.env.NEXT_PUBLIC_CDP_ONRAMP_BASE_URL}/buy?assets=USDC&defaultAsset=USDC&fiatCurrency=USD&presetCryptoAmount=${onrampAmount}&sessionToken=${token}`,
            "Onramp",
            "width=500,height=800,scrollbars=no,resizable=no"
          );
          setWaiting(true);
        }}
      >
        Onramp
      </Button>
    </div>
  );
};
