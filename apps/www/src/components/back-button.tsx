import { MoveLeftIcon } from "lucide-react";
import Link from "next/link";

export const BackButton: React.FC<{ to?: string }> = ({ to }) => {
  return (
    <Link
      href={to || ".."}
      className="flex items-center justify-center h-[46px] w-[46px]  border rounded-full"
    >
      <MoveLeftIcon className="w-4 h-4" />
    </Link>
  );
};