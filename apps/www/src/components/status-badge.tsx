import { cn } from "@/lib/utils";
import { ChallengeStatus } from "@cdp/common/src/types/challenge";
import { SubmissionStatus } from "@cdp/common/src/types/submission";
import { BanIcon, CheckIcon, RadioIcon, TrophyIcon } from "lucide-react";
import { useMemo } from "react";
import { Tooltip } from "react-tooltip";

export const ChallengeStatusIcon: React.FC<{
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

export const ChallengeStatusBadge: React.FC<{
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
      <ChallengeStatusIcon status={status} className="text-white" />
      <span className="uppercase text-xs font-medium">{statusText}</span>
    </div>
  );
};

export const SubmissionStatusBadge: React.FC<{
  status: SubmissionStatus;
  className?: string;
}> = ({ status, className }) => {

  
  if (!["awarded", "ineligible"].includes(status)) {
    return null;
  }
  
  return (
    <>
      <span
        data-tooltip-id="submission-status-tooltip"
        className={cn(
          "text-xs rounded-full px-1.5 py-0.5 text-white font-medium",
          status === "awarded" ? "bg-green-500" : "bg-red-500"
        )}
      >
        {status === "awarded" ? (
          <TrophyIcon className="w-3 h-3" />
        ) : (
          <BanIcon className="w-3 h-3" />
        )}
      </span>

      <Tooltip
        id="submission-status-tooltip"
        content={status === "awarded" ? "Winner" : "Ineligible"}
      />
    </>
  );
};
