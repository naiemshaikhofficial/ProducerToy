import React from "react";
import { Metadata } from "next";
import { FollowingPointerDemo } from "@/components/ui/following-pointer";

export const metadata: Metadata = {
  title: "Following Pointer Demo | Producer Toy",
  description: "Interactive Following Pointer Component in Producer Toy Theme",
};

export default function FollowingPointerPage() {
  return (
    <main className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl text-center mb-8 sm:mb-12">
        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 border border-white/10 px-3 py-1 rounded-full bg-white/[0.04]">
          Aceternity UI • Producer Toy Theme
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-4 mb-2">
          Following Pointer
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          Hover over the card below to see the custom animated pointer and author badge track your mouse trajectory smoothly.
        </p>
      </div>

      <div className="relative z-10 w-full flex justify-center">
        <FollowingPointerDemo />
      </div>
    </main>
  );
}
