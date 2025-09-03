import { cn } from "@/lib/utils";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { PenBoxIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export const CreateChallengeButton: React.FC<{
  className?: string;
}> = ({ className }) => {
  const router = useRouter();
  const { evmAddress } = useEvmAddress();

  return (
    <Button
      variant="outline"
      disabled={!evmAddress}
      onClick={() => {
        router.push(`/${evmAddress}/challenges/create`);
      }}
      className={cn("flex items-center gap-2 rounded-full border h-[46px] w-[46px] shrink-0 justify-center", className)}
      tooltip={!evmAddress ? "Sign in to create a challenge" : undefined}
    >
      <PenBoxIcon className="h-4 w-4" />
    </Button>
  );
};
