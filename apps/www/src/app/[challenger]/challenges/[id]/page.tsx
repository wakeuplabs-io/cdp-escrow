"use client";

import { AccountManager } from "@/components/account-manager";
import { ClaimButton } from "@/components/claim-button";
import { Logo } from "@/components/logo";
import { ResolveButton } from "@/components/resolve-button";
import { ChallengeStatusBadge } from "@/components/status-badge";
import { SubmissionCard } from "@/components/submission-card";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
  useChallenge,
  useChallengerProfile
} from "@/hooks/challenges";
import { useCopyToClipboard } from "@/hooks/copy";
import { useInfiniteScroll } from "@/hooks/infinite-scroll";
import { useSubmissionCount, useSubmissions } from "@/hooks/submissions";
import { cn, shortenAddress } from "@/lib/utils";
import { Submission } from "@cdp/common/src/types/submission";
import { useEvmAddress } from "@coinbase/cdp-hooks";
import { formatDistanceToNow } from "date-fns";
import { CheckIcon, ClockIcon, DollarSignIcon, LinkIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useMemo, useState } from "react";
import Markdown from "react-markdown";
import { Address, formatEther } from "viem";

enum ActiveTab {
  Overview = "overview",
  Submissions = "submissions",
}

export default function Page({
  params,
}: {
  params: Promise<{ id: string; challenger: Address }>;
}) {
  const { id, challenger } = React.use(params);
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.Overview);

  const { evmAddress } = useEvmAddress();
  const { data: profile } = useChallengerProfile(challenger);
  const { copyToClipboard, copied } = useCopyToClipboard();
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
  const loadMoreRef = useInfiniteScroll<HTMLDivElement>(
    fetchNextPage,
    hasNextPage
  );

  // what the admin has selected
  const [selectedWinners, setSelectedWinners] = useState<Submission[]>([]);
  const [selectedIneligible, setSelectedIneligible] = useState<Submission[]>(
    []
  );

  const onMarkAsWinner = useCallback(
    (submission: Submission) => {
      setSelectedWinners([...selectedWinners, submission]);
      setSelectedIneligible(
        selectedIneligible.filter(
          (ineligible) => ineligible.id !== submission.id
        )
      );
    },
    [selectedWinners, selectedIneligible]
  );

  const onMarkAsIneligible = useCallback(
    (submission: Submission) => {
      setSelectedIneligible([...selectedIneligible, submission]);
      setSelectedWinners(
        selectedWinners.filter((winner) => winner.id !== submission.id)
      );
    },
    [selectedWinners, selectedIneligible]
  );

  const onMarkAsAcceptable = useCallback(
    (submission: Submission) => {
      setSelectedIneligible(
        selectedIneligible.filter(
          (ineligible) => ineligible.id !== submission.id
        )
      );
      setSelectedWinners(
        selectedWinners.filter((winner) => winner.id !== submission.id)
      );
    },
    [selectedIneligible, selectedWinners]
  );

  const timeString = useMemo(() => {
    if (!challenge) return "";

    if (challenge.status === "active") {
      return formatDistanceToNow(new Date(challenge.endsAt)) + " left";
    }
    return formatDistanceToNow(challenge.endsAt) + " ago";
  }, [challenge]);

  const sortedSubmissions = useMemo(() => {
    if (!submissions) return [];
    return submissions?.pages
      .flatMap((page) => page.submissions)
      .sort((a, b) => b.id - a.id);
  }, [submissions]);

  const canResolve = useMemo(() => {
    return (
      challenge?.status === "pending" &&
      evmAddress === challenge.admin
    );
  }, [challenge, evmAddress]);

  if (isChallengePending || !challenge) {
    return (
      <div className="flex items-center justify-center h-full w-full p-10">
        Loading...
      </div>
    );
  }
  return (
    <div>
      <nav className="border-b">
        <div className="flex items-center justify-between h-[72px] max-w-7xl mx-auto">
          <Logo width={150} height={46} />

          <AccountManager />
        </div>
      </nav>

      {/* Tabs navigation */}
      <div className="border-b w-full h-9">
        <div className="flex flex-1 items-center gap-2 max-w-7xl mx-auto -mb-1">
          <button
            className={cn(
              "px-3 h-9 uppercase text-muted-foreground text-xs font-bold",
              activeTab === ActiveTab.Overview &&
                "border-b border-b-foreground text-foreground"
            )}
            onClick={() => setActiveTab(ActiveTab.Overview)}
          >
            Overview
          </button>
          <button
            className={cn(
              "px-3 h-9 uppercase text-muted-foreground text-xs font-bold",
              activeTab === ActiveTab.Submissions &&
                "border-b border-b-foreground text-foreground"
            )}
            onClick={() => setActiveTab(ActiveTab.Submissions)}
          >
            Submissions
          </button>
        </div>
      </div>

      <div className="flex divide-x max-w-7xl mx-auto">
        {/* Main content */}
        <div className="min-h-screen flex-1">
          <div className="pr-10 pt-12 pb-20 w-full">
            {activeTab === ActiveTab.Overview ? (
              <div className="">
                <h1 className="text-4xl break-words font-bold mb-4 capitalize">
                  {challenge.metadata.title}
                </h1>

                <ChallengeStatusBadge status={challenge.status} />

                <div className="flex items-center justify-between py-8">
                  <Link
                    href={`/${challenge.admin}/challenges`}
                    className="flex items-center gap-2"
                  >
                    <Image
                      src={"/avatar.webp"}
                      alt="avatar"
                      className="rounded-full border-2 border-gray-200"
                      width={32}
                      height={32}
                    />
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {!profile || profile?.name == ""
                          ? shortenAddress(challenge.admin)
                          : profile?.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(challenge.createdAt)} ago
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2">
                    {challenge.status === "completed" ? (
                      <ClaimButton challenge={challenge} />
                    ) : canResolve ? (
                      <Button
                        className="rounded-full"
                        onClick={() => setActiveTab(ActiveTab.Submissions)}
                      >
                        Go to submissions to resolve challenge
                      </Button>
                    ) : (
                      <SubmitButton challenge={challenge} />
                    )}

                    <Button
                      tooltip="Copy link"
                      variant="outline"
                      className="rounded-full h-9 w-9"
                      onClick={() => copyToClipboard(window.location.href)}
                    >
                      {copied ? <CheckIcon /> : <LinkIcon />}
                    </Button>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <Markdown>{challenge.metadata.description}</Markdown>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
                  <span>{submissionCount} submissions</span>
                  <span>·</span>
                  <span>{timeString}</span>
                </div>
              </div>
            ) : (
              <div className="pb-8 -pt-6">
                {canResolve && (
                  <div className="space-y-2 mb-6">
                    <h1 className="text-2xl font-bold">Resolve Challenge</h1>
                    <p className="text-sm text-muted-foreground">
                      Pick winners and ineligible submissions. Winners (🏆) will
                      split 70% of the prize pool. Acceptable (👍🏼) submissions
                      will split 30% of the prize pool. Ineligible (👎🏼) will
                      receive nothing.
                    </p>
                  </div>
                )}

                <div className="divide-y">
                  {sortedSubmissions.map((submission) => (
                    <SubmissionCard
                      key={submission.id}
                      submission={submission}
                      isResolving={canResolve}
                      isWinner={selectedWinners.some((winner) => winner.id === submission.id)}
                      isIneligible={selectedIneligible.some((ineligible) => ineligible.id === submission.id)}
                      onMarkAsWinner={() => onMarkAsWinner(submission)}
                      onMarkAsIneligible={() => onMarkAsIneligible(submission)}
                      onMarkAsAcceptable={() => onMarkAsAcceptable(submission)}
                    />
                  ))}
                </div>

                <div
                  ref={loadMoreRef}
                  className={cn(
                    "pt-8 text-muted-foreground text-sm",
                    sortedSubmissions.length === 0 && "py-0"
                  )}
                >
                  {isSubmissionsPending && <div>Loading more...</div>}
                  {!isSubmissionsPending && sortedSubmissions.length === 0 && (
                    <div>No submissions yet.</div>
                  )}
                </div>

                {canResolve && (
                  <div className="fixed bottom-0 left-0 right-0 py-6 flex justify-center">
                    <div className="max-w-7xl mx-auto pr-[250px]">
                      <ResolveButton
                        challenge={challenge}
                        winners={selectedWinners}
                        ineligible={selectedIneligible}
                        submissionsCount={submissionCount ?? 0}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="pl-6 py-6 pb-20 w-[250px]">
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
                  <div className="absolute size-[15px] inline-block rounded-full left-[-7px] border-4 border-white bg-zinc-900"></div>
                  <div
                    className={cn("border-l pr-4 mt-3", {
                      "border-zinc-300": challenge.status === "active",
                      "border-zinc-900": challenge.status !== "active",
                    })}
                  ></div>
                </div>

                <div className="flex relative h-[60px] last:h-0">
                  <div
                    className={cn(
                      "absolute size-[15px] inline-block rounded-full left-[-7px] border-4 border-white",
                      {
                        "bg-zinc-300": challenge.status === "active",
                        "bg-zinc-900": challenge.status !== "active",
                      }
                    )}
                  ></div>
                </div>
              </div>
              <div className="flex-auto leading-6">
                <div className="mb-3 last:mb-0 h-[44px]">
                  <h4 className="font-medium text-sm">Created</h4>
                  <div className="flex gap-2 items-center text-sm text-muted-foreground">
                    <div>
                      {challenge.createdAt.toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                </div>

                <div className="mb-3 last:mb-0 h-[44px]">
                  <h4 className=" font-medium text-sm">End</h4>
                  <div className="flex gap-2 items-center text-sm text-muted-foreground">
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
        </div>
      </div>
    </div>
  );
}
