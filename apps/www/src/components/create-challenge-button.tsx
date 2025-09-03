import { useEvmAddress } from "@coinbase/cdp-hooks";
import { PenBoxIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tooltip } from "react-tooltip";
import { Button } from "./ui/button";

export const CreateChallengeButton: React.FC = () => {
  const router = useRouter();
  const { evmAddress } = useEvmAddress();

  return (
    <>
      <div data-tooltip-id="create-challenge-button-tooltip">
        <Button
          variant="ghost"
          disabled={!evmAddress}
          onClick={() => {
            router.push(`/${evmAddress}/challenges/create`);
          }}
          className="flex items-center gap-2 rounded-full border h-[46px] w-[46px] shrink-0 justify-center"
        >
          <PenBoxIcon className="h-4 w-4" />
        </Button>
      </div>

      {!evmAddress && (
        <Tooltip
          id="create-challenge-button-tooltip"
          content="Sign in to create a challenge"
        />
      )}
    </>
  );
};
