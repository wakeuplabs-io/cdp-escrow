import { CDP_ONRAMP_BASE_URL } from "@/config";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { useCallback, useState } from "react";

export const useOnrampUsdc = () => {
  const { evmAddress } = useEvmAddress();
  const [isPending, setIsPending] = useState(false);

  const onramp = useCallback(async (amount: string) => {
    if (!evmAddress) return;

    setIsPending(true);

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        body: JSON.stringify({
          addresses: [{ address: evmAddress, blockchains: ["base"] }],
          assets: ["USDC"],
        }),
      });
      const { token } = await res.json();

      // open onramp as popup
      window.open(
        `${CDP_ONRAMP_BASE_URL}/buy?assets=USDC&defaultAsset=USDC&fiatCurrency=USD&presetCryptoAmount=${amount}&sessionToken=${token}`,
        "Onramp",
        "width=500,height=800,scrollbars=no,resizable=no"
      );
    } finally {
      setIsPending(false);
    }
  }, [evmAddress]);

  return { onramp, isPending };
};
