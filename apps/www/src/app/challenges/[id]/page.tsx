"use client";

import { AccountManager } from "@/components/account-manager";
import { BackButton } from "@/components/back-button";
import { cn, shortenAddress } from "@/lib/utils";
import {
  AudioWaveformIcon,
  ClockIcon,
  MousePointerClickIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  EllipsisVerticalIcon,
  ShareIcon,
} from "lucide-react";
import Markdown from "react-markdown";
import { StatusBadge } from "@/components/status-badge";
import { useEffect, useMemo, useState } from "react";
import { Tooltip } from "react-tooltip";
import { useChallenge } from "@/hooks/challenges";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Index() {
  const { data: challenge, isPending } = useChallenge(1);
  const [activeTab, setActiveTab] = useState<"overview" | "submissions">(
    "overview"
  );

  if (isPending || !challenge)
    return (
      <div className="flex items-center justify-center h-full w-full p-10">
        Loading...
      </div>
    );

  return (
    <div>
      <div className="flex border-b items-center justify-between h-[72px] px-6">
        <div className="flex items-center gap-4 w-full">
          <AudioWaveformIcon className="w-4 h-4" />
          <h1 className="text-xl font-bold">Acme Challenges</h1>
        </div>

        <AccountManager />
      </div>

      <div className="flex divide-x">
        <div className="min-h-screen flex-1">
          <div className="border-b w-full px-5 flex ">
            <button
              className={cn(
                "px-3 py-2 uppercase text-muted-foreground text-xs font-bold",
                activeTab === "overview" &&
                  "border-b border-b-foreground text-foreground"
              )}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={cn(
                "px-3 py-2 uppercase text-muted-foreground text-xs font-bold flex items-center gap-2",
                activeTab === "submissions" &&
                  "border-b border-b-foreground text-foreground"
              )}
              onClick={() => setActiveTab("submissions")}
            >
              <span>Submissions</span>
              <span className="bg-muted rounded-full px-2 py-1 text-xs">2</span>
            </button>
          </div>

          <div className="p-6 pt-8 pb-20 w-full">
            <div className="max-w-[600px] mx-auto">
              {activeTab === "overview" ? (
                <div>
                  <h1 className="text-4xl break-words font-bold mb-4">
                    {challenge.metadata.title}
                  </h1>

                  <StatusBadge status={challenge.status} />

                  <div className="prose prose-sm">
                    <Markdown>{challenge.metadata.body}</Markdown>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
                    <span>22 submissions</span>
                    <span>·</span>
                    <span>3d left</span>
                  </div>
                </div>
              ) : (
                <div className="divide-y py-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src="/avatar.webp"
                          alt="avatar"
                          className="w-[32px] h-[32px] rounded-full"
                        />
                        <div>
                          <div className="text-sm">
                            {shortenAddress(challenge.author)}
                          </div>
                          <div className="text-xs text-muted-foreground space-x-2">
                            {challenge.createdAt.toLocaleDateString()} · #
                            {challenge.id}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <ShareIcon className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-56"
                            align="start"
                            side="left"
                          >
                            <DropdownMenuItem>Copy link</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <EllipsisVerticalIcon className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-56"
                            align="start"
                            side="left"
                          >
                            <DropdownMenuItem>Mark as Invalid</DropdownMenuItem>
                            <DropdownMenuItem>Mark as Winner</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="prose prose-sm mt-4">
                      <Markdown>{challenge.metadata.body}</Markdown>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full border-t flex justify-center items-center">
              <Link
                href={`/challenges/${challenge.id}/submit`}
                className="py-3 px-6 uppercase text-sm font-bold w-full max-w-[600px] mt-8 rounded-full border flex items-center justify-center gap-2 hover:bg-muted cursor-pointer"
              >
                <span>Submit your solution</span>
                <ArrowUpRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="w-[400px] p-6 pb-20">
          {/* Prize pool */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-gray-600">
              <MousePointerClickIcon className="h-4 w-4" />

              <span className="uppercase font-semibold text-sm">
                Prize pool
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span>1000</span>
                <span>USDC</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
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
                      {challenge.deadline.toLocaleString(undefined, {
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
