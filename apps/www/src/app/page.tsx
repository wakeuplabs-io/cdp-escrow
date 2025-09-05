"use client";

import { Button } from "@/components/ui/button";
import {
  BoltIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { DM_Sans } from "next/font/google";
import Link from "next/link";
import { TypeAnimation } from "react-type-animation";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{
        background:
          "linear-gradient(135deg, #fed7aa 0%, #ffffff 30%, #ffffff 70%, #fed7aa 100%)",
      }}
    >
      {/* Fork button */}
      <div className="absolute bottom-6 right-6">
        <Button size="sm" className="rounded-full " asChild>
          <a
            href="https://github.com/wakeuplabs-io/cdp-escrow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clipRule="evenodd"
              />
            </svg>
            Fork this project on Github
          </a>
        </Button>
      </div>

      {/* Powered by */}
      <div className="absolute bottom-6 left-6">
        <p className="text-muted-foreground text-sm">
          Powered by{" "}
          <a
            href="https://wakeuplabs.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            Wakeup Labs
          </a>
          {" for "}
          <a
            href="https://developers.coinbase.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            Coinbase Developer Platform
          </a>
        </p>
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-12">
        {/* Main heading */}
        <div className="space-y-6">
          <div>
            <h1 className={`text-[4em] -mb-4 font-normal ${dmSans.className}`}>
              Create bounties for
            </h1>
            <TypeAnimation
              preRenderFirstString={true}
              sequence={[
                "designs",
                1000,
                "videos",
                1000,
                "websites",
                1000,
                "hackathons",
                1000,
              ]}
              wrapper="h1"
              speed={50}
              style={{
                fontSize: "4em",
                display: "block",
                fontWeight: "700",
                whiteSpace: "pre-line",
                fontFamily: dmSans.style.fontFamily,
              }}
              repeat={Infinity}
            />
          </div>
          <p
            className={`text-xl text-muted-foreground font-medium ${dmSans.className}`}
          >
            Create Challenge. Get Submissions. Award Winners.
          </p>
        </div>

        {/* Feature icons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-24 py-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 flex items-center justify-center bg-orange-500/20 rounded-md">
              <BoltIcon className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-foreground text-sm font-bold">Secure Escrow</p>
            <p className="text-muted-foreground text-xs max-w-[200px] text-center">
              Protect your funds and ensure fair payments to your participants.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 flex items-center justify-center bg-green-500/20 rounded-md">
              <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-foreground text-sm font-bold">USDC Payments</p>
            <p className="text-muted-foreground text-xs max-w-[200px] text-center">
              Fast global payments using the USDC stablecoin.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-500/20 rounded-md">
              <GlobeAltIcon className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-foreground text-sm font-bold">Decentralized</p>
            <p className="text-muted-foreground text-xs max-w-[200px] text-center">
              Built on robust, censorship-resistant infrastructure.
            </p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col items-center space-y-8">
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 h-12 text-lg font-medium rounded-lg shadow-xl"
            asChild
          >
            <Link href="/all/challenges">Get Started</Link>
          </Button>

          {/* TODO: add link when available */}
          <Link
            href="#"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            View Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
