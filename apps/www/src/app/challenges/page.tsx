"use client";

import { AudioWaveformIcon, PenBoxIcon } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Tooltip } from "react-tooltip";
import { useChallenges } from "@/hooks/challenges";
import { AccountManager } from "@/components/account-manager";
import Link from "next/link";
import { useIsSignedIn } from "@coinbase/cdp-hooks";
import { ChallengeCard } from "@/components/challenge-card";

export default function ChallengesPage() {
  const { isSignedIn } = useIsSignedIn();
  const loadMoreRef = useRef(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useChallenges();

  const sortedChallenges = useMemo(() => {
    return (
      data?.pages
        .flatMap((page) => page.challenges)
        .sort((a, b) => b.id - a.id) ?? []
    );
  }, [data]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  return (
    <div>
      <div className="flex border-b items-center justify-between h-[72px] px-6">
        <Link href="/challenges" className="flex items-center gap-4 w-full">
          <AudioWaveformIcon className="w-4 h-4" />
          <h1 className="text-xl font-bold">Acme Challenges</h1>
        </Link>

        <AccountManager />
      </div>

      <div className="p-6 flex items-center justify-between">
        <div className="relative">
          <label htmlFor="filter" className="text-sm text-muted-foreground absolute left-5 top-0 bg-background -translate-y-1/2 px-1">
            Admined by
          </label>

          <select
            id="filter"
            className="rounded-full outline-none border min-w-[150px] h-[46px] px-5 shrink-0 appearance-none"
          >
            <option value="all">All</option>
            <option value="mine">Me</option>
          </select>
        </div>

        <Link
          href="/challenges/create"
          className="flex items-center gap-2 rounded-full border h-[46px] w-[46px] shrink-0 justify-center"
          data-tooltip-id="new-proposal-tooltip"
        >
          <PenBoxIcon className="h-4 w-4" />
        </Link>
        {!isSignedIn && (
          <Tooltip
            id="new-proposal-tooltip"
            content="Connect wallet to create a new proposal"
          />
        )}
      </div>

      <div>
        <div className="uppercase text-sm font-medium text-muted-foreground px-6 py-2 border-b">
          Challenges
        </div>

        <div className="divide-y mx-6">
          {sortedChallenges.map((challenge, id) => (
            <ChallengeCard key={id} challenge={challenge} />
          ))}

          <div ref={loadMoreRef} className="py-4">
            {isFetchingNextPage
              ? "Loading more..."
              : hasNextPage
              ? "Load more"
              : "No more challenges"}
          </div>
        </div>
      </div>
    </div>
  );
}
