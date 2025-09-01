import { cn } from "@/lib/utils";
import { ChallengeStatus } from "@cdp/common/src/types/challenge";
import { CheckIcon, RadioIcon } from "lucide-react";
import { useMemo } from "react";

export const StatusIcon: React.FC<{
  status: ChallengeStatus;
  className?: string;
}> = ({ status, className }) => {
  if (status === "active") {
    return (
      <RadioIcon
        className={cn("w-[18px] h-[18px] text-green-500", className)}
      />
    );
  }
  if (status === "pending") {
    return (
      <div
        className={cn(
          "w-[14px] h-[14px] rounded-full bg-yellow-500 flex items-center justify-center",
          className
        )}
      >
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
    );
  }
  if (status === "completed") {
    return (
      <div
        className={cn(
          "w-[14px] h-[14px] rounded-full bg-gray-900 flex items-center justify-center",
          className
        )}
      >
        <CheckIcon className="w-2 h-2 text-white" />
      </div>
    );
  }

  return null;
};

export const StatusBadge: React.FC<{
  status: ChallengeStatus;
  className?: string;
}> = ({ status, className }) => {
  const statusText = useMemo(() => {
    if (status === "active") return "Active";
    if (status === "completed") return "Completed";
    if (status === "pending") return "Pending Resolution";
    return "";
  }, [status]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full mb-6 text-white px-2 pr-3 py-1 w-min text-nowrap",
        status === "active"
          ? "bg-green-500"
          : status === "pending"
          ? "bg-yellow-500"
          : "bg-gray-900",
        className
      )}
    >
      <StatusIcon status={status} className="text-white" />
      <span className="uppercase text-xs font-medium">{statusText}</span>
    </div>
  );
};
