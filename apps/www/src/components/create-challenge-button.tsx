import { cn } from "@/lib/utils";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export const CreateChallengeButton: React.FC<{
  className?: string;
}> = ({ className }) => {
  const router = useRouter();
  const { evmAddress } = useEvmAddress();

  return (
    <Button
      disabled={!evmAddress}
      onClick={() => {
        router.push(`/${evmAddress}/challenges/create`);
      }}
      className={cn("flex items-center rounded-full shrink-0 justify-center", className)}
      tooltip={!evmAddress ? "Sign in to create a challenge" : undefined}
    >
      Create Challenge
    </Button>
  );
};
