import { useBalance } from "@/hooks/balance";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { AlertCircleIcon } from "lucide-react";
import QRCode from "react-qr-code";
import { Address } from "../address";
import { Alert, AlertTitle } from "../ui/alert";

export const Receive = () => {
  const { evmAddress } = useEvmAddress();
  const { data: balance } = useBalance(evmAddress);

  if (!evmAddress) return null;
  return (
    <div className="flex flex-col gap-4">
      <QRCode className="h-40 w-40 mx-auto" value={evmAddress} />

      <Alert variant="default" className="bg-[#FFF5E6] border-none">
        <AlertCircleIcon color="blue" />
        <AlertTitle className="text-sm font-normal">
          Make sure to send USDC on Base
        </AlertTitle>
      </Alert>

      <Address address={evmAddress} balance={balance} balanceLabel="USDC" />
    </div>
  );
};
