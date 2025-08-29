"use client";

import { AccountManager } from "@/components/account-manager";
import { ClaimButton } from "@/components/claim-button";
import { ResolveButton } from "@/components/resolve-button";
import { StatusBadge } from "@/components/status-badge";
import { SubmissionCard } from "@/components/submission-card";
import { SubmitButton } from "@/components/submit-button";
import { useChallenge } from "@/hooks/challenges";
import { useSubmissionCount, useSubmissions } from "@/hooks/submissions";
import { cn } from "@/lib/utils";
import { Submission } from "@cdp/common/src/types/submission";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { formatDistanceToNow } from "date-fns";
import {
  AudioWaveformIcon,
  ClockIcon,
  DollarSignIcon,
  MousePointerClickIcon,
} from "lucide-react";
import Link from "next/link";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Markdown from "react-markdown";
import { formatEther } from "viem";

enum ActiveTab {
  Overview = "overview",
  Submissions = "submissions",
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  const { data: challenge, isPending: isChallengePending } = useChallenge(
    Number(id)
  );
  const { data: submissionCount } = useSubmissionCount(Number(id));
  const {
    data: submissions,
    isPending: isSubmissionsPending,
    fetchNextPage,
    hasNextPage,
  } = useSubmissions(Number(id));
  const { evmAddress } = useEvmAddress();

  // state
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.Overview);
  const [winners, setWinners] = useState<string[]>([]);
  const [ineligible, setIneligible] = useState<string[]>([]);

  const onMarkAsWinner = useCallback(
    (submission: Submission) => {
      setWinners([...winners, submission.creator]);
      setIneligible(
        ineligible.filter((ineligible) => ineligible !== submission.creator)
      );
    },
    [winners, ineligible]
  );

  const onMarkAsIneligible = useCallback(
    (submission: Submission) => {
      setIneligible([...ineligible, submission.creator]);
      setWinners(winners.filter((winner) => winner !== submission.creator));
    },
    [winners, ineligible]
  );

  const onMarkAsAcceptable = useCallback(
    (submission: Submission) => {
      setIneligible(
        ineligible.filter((ineligible) => ineligible !== submission.creator)
      );
      setWinners(winners.filter((winner) => winner !== submission.creator));
    },
    [ineligible]
  );

  // infinite scroll
  const loadMoreRef = useRef(null);
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

  const timeString = useMemo(() => {
    if (!challenge) return "";

    if (challenge.status === "active") {
      return formatDistanceToNow(new Date(challenge.endsAt)) + " left";
    }
    return formatDistanceToNow(challenge.endsAt) + " ago";
  }, [challenge?.endsAt, challenge?.status]);

  const sortedSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions?.pages
      .flatMap((page) => page.submissions)
      .sort((a, b) => b.id - a.id);
  }, [submissions]);

  const isAdmin = useMemo(
    () => challenge?.admin === evmAddress,
    [challenge?.admin, evmAddress]
  );

  if (isChallengePending || !challenge)
    return (
      <div className="flex items-center justify-center h-full w-full p-10">
        Loading...
      </div>
    );

  return (
    <div>
      <div className="flex border-b items-center justify-between h-[72px] px-6">
        <Link href="/challenges" className="flex items-center gap-4 w-full">
          <AudioWaveformIcon className="w-4 h-4" />
          <h1 className="text-xl font-bold">Acme Challenges</h1>
        </Link>

        <AccountManager />
      </div>

      <div className="flex divide-x">
        {/* Main content */}
        <div className="min-h-screen flex-1">
          {/* Tabs navigation */}
          <div className="border-b w-full px-5 flex ">
            <button
              className={cn(
                "px-3 py-2 uppercase text-muted-foreground text-xs font-bold",
                activeTab === ActiveTab.Overview &&
                  "border-b border-b-foreground text-foreground"
              )}
              onClick={() => setActiveTab(ActiveTab.Overview)}
            >
              Overview
            </button>
            <button
              className={cn(
                "px-3 py-2 uppercase text-muted-foreground text-xs font-bold flex items-center gap-2",
                activeTab === ActiveTab.Submissions &&
                  "border-b border-b-foreground text-foreground"
              )}
              onClick={() => setActiveTab(ActiveTab.Submissions)}
            >
              <span>Submissions</span>
              <span className="bg-muted rounded-full px-2 py-1 text-xs">
                {submissionCount}
              </span>
            </button>
          </div>

          <div className="p-6 pt-8 pb-20 w-full">
            <div className="max-w-[600px] mx-auto">
              {activeTab === ActiveTab.Overview ? (
                <div>
                  <h1 className="text-4xl break-words font-bold mb-4">
                    {challenge.metadata.title}
                  </h1>

                  <StatusBadge status={challenge.status} />

                  <div className="prose prose-sm">
                    <Markdown>{challenge.metadata.description}</Markdown>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
                    <span>{submissionCount} submissions</span>
                    <span>·</span>
                    <span>{timeString}</span>
                  </div>
                </div>
              ) : (
                <div className="divide-y py-6 pb-8 pt-0">
                  {sortedSubmissions.map((submission) => (
                    <SubmissionCard
                      key={submission.id}
                      submission={submission}
                      isAdmin={isAdmin}
                      isWinner={winners.includes(submission.creator)}
                      isIneligible={ineligible.includes(submission.creator)}
                      onMarkAsWinner={() => onMarkAsWinner(submission)}
                      onMarkAsIneligible={() => onMarkAsIneligible(submission)}
                      onMarkAsAcceptable={() => onMarkAsAcceptable(submission)}
                    />
                  ))}

                  <div
                    ref={loadMoreRef}
                    className={cn(
                      "pt-8",
                      sortedSubmissions.length === 0 && "py-0"
                    )}
                  >
                    {isSubmissionsPending
                      ? "Loading more..."
                      : hasNextPage
                      ? "Load more."
                      : sortedSubmissions.length === 0
                      ? "No submissions yet."
                      : "No more submissions."}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-[400px] p-6 pb-20">
          {/* Prize pool */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-gray-600">
              <DollarSignIcon className="h-4 w-4" />

              <span className="uppercase font-semibold text-sm">
                Prize pool
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">
                  {formatEther(challenge.poolSize)}
                </span>
                <span className="text-sm text-muted-foreground mb-0.5">
                  USDC
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-gray-600">
              <ClockIcon className="h-4 w-4" />

              <span className="uppercase font-semibold text-sm">Timeline</span>
            </div>

            <div className="flex">
              <div className="mt-1 ml-2">
                <div className="flex relative h-[60px] last:h-0">
                  <div className="absolute size-[15px] inline-block rounded-full left-[-7px] border-4 border-white bg-gray-900"></div>
                  <div className="border-l pr-4 mt-3 border-gray-900"></div>
                </div>

                <div className="flex relative h-[60px] last:h-0">
                  <div className="absolute size-[15px] inline-block rounded-full left-[-7px] border-4 border-white bg-gray-900"></div>
                </div>
              </div>
              <div className="flex-auto leading-6">
                <div className="mb-3 last:mb-0 h-[44px]">
                  <h4 className="font-medium">Created</h4>
                  <div className="flex gap-2 items-center text-muted-foreground">
                    <div>
                      {challenge.createdAt.toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                </div>

                <div className="mb-3 last:mb-0 h-[44px]">
                  <h4 className=" font-medium">End</h4>
                  <div className="flex gap-2 items-center text-muted-foreground">
                    <div>
                      {challenge.endsAt.toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-gray-600">
              <MousePointerClickIcon className="h-4 w-4" />

              <span className="uppercase font-semibold text-sm">Actions</span>
            </div>
            <div className="w-full flex justify-center items-center">
              {challenge.status === "active" ? (
                <SubmitButton challengeId={Number(id)} />
              ) : challenge.status === "pending" && isAdmin ? (
                <ResolveButton
                  challengeId={Number(id)}
                  winners={winners}
                  ineligible={ineligible}
                />
              ) : challenge.status === "pending" && !isAdmin ? (
                <div>Awaiting for Admin resolution</div>
              ) : (
                <ClaimButton challengeId={Number(id)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
