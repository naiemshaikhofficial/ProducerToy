"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { Sparkles, ArrowRight, Disc3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FollowerPointerCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string | React.ReactNode;
  pointerClassName?: string;
  badgeClassName?: string;
}

/**
 * FollowerPointerCard - Aceternity UI Following Pointer
 * Customized for Producer Toy / SamplesWala Dark Charcoal Studio Theme.
 */
export const FollowerPointerCard = ({
  children,
  className,
  title,
  pointerClassName,
  badgeClassName,
}: FollowerPointerCardProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);
  const [isInside, setIsInside] = useState<boolean>(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      x.set(e.clientX - rect.left);
      y.set(e.clientY - rect.top);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      x.set(e.clientX - rect.left);
      y.set(e.clientY - rect.top);
    }
    setIsInside(true);
  };

  const handleMouseLeave = () => {
    setIsInside(false);
  };

  return (
    <div
      ref={ref}
      onMouseOver={handleMouseEnter}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        cursor: "none",
      }}
      className={cn("relative", className)}
    >
      <AnimatePresence>
        {isInside && (
          <FollowPointer
            x={x}
            y={y}
            title={title}
            pointerClassName={pointerClassName}
            badgeClassName={badgeClassName}
          />
        )}
      </AnimatePresence>
      {children}
    </div>
  );
};

export interface FollowPointerProps {
  x: any;
  y: any;
  title?: string | React.ReactNode;
  pointerClassName?: string;
  badgeClassName?: string;
}

export const FollowPointer = ({
  x,
  y,
  title,
  pointerClassName,
  badgeClassName,
}: FollowPointerProps) => {
  return (
    <motion.div
      className="absolute z-[9999] h-4 w-4 rounded-full pointer-events-none select-none"
      style={{
        top: y,
        left: x,
        pointerEvents: "none",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 28,
      }}
    >
      {/* High precision directional cursor arrow */}
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="1"
        viewBox="0 0 16 16"
        className={cn(
          "h-6 w-6 -translate-x-[12px] -translate-y-[10px] transform -rotate-[70deg] text-white stroke-black/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] filter",
          pointerClassName
        )}
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
      </svg>

      {/* Floating Producer Toy dark glass pill badge */}
      {title ? (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          className={cn(
            "min-w-max whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-white tracking-wide shadow-[0_8px_24px_rgba(0,0,0,0.85)] backdrop-blur-md bg-[#18191e]/95 border border-white/20 -translate-x-2 translate-y-1 flex items-center gap-2",
            badgeClassName
          )}
        >
          {title}
        </motion.div>
      ) : null}
    </motion.div>
  );
};

export interface BlogContent {
  slug: string;
  author: string;
  date: string;
  title: string;
  description: string;
  image: string;
  authorAvatar: string;
  category?: string;
  readTime?: string;
}

export const defaultBlogContent: BlogContent = {
  slug: "analog-saturation-hybrid-mixing",
  author: "Naiem Shaikh",
  date: "28th October, 2026",
  title: "Analog Saturation & Hybrid Mixing Workflows",
  description:
    "Explore how subtle tape harmonics, transformer coloration, and digital precision sculpt punchy, broadcast-ready masters in modern production.",
  image:
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop",
  authorAvatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop",
  category: "STUDIO WORKFLOW",
  readTime: "4 min read",
};

export const blogContent = defaultBlogContent;

export const TitleComponent = ({
  title,
  avatar,
}: {
  title: string | React.ReactNode;
  avatar?: string;
}) => (
  <div className="flex items-center space-x-2">
    {avatar ? (
      <img
        src={avatar}
        height={20}
        width={20}
        alt={typeof title === "string" ? title : "Author"}
        className="h-5 w-5 rounded-full border border-white/30 object-cover shrink-0"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    ) : (
      <div className="h-5 w-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
        <Sparkles className="w-3 h-3 text-white" />
      </div>
    )}
    <p className="font-semibold text-xs text-white tracking-wide truncate max-w-[140px]">
      {title}
    </p>
  </div>
);

export interface FollowingPointerDemoProps {
  content?: Partial<BlogContent>;
  className?: string;
}

export function FollowingPointerDemo({
  content,
  className,
}: FollowingPointerDemoProps) {
  const data = { ...defaultBlogContent, ...content };

  return (
    <div className={cn("mx-auto w-full max-w-[340px] sm:max-w-sm", className)}>
      <FollowerPointerCard
        title={
          <TitleComponent
            title={data.author}
            avatar={data.authorAvatar}
          />
        }
      >
        <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#141416] transition-all duration-300 hover:border-white/25 hover:shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex flex-col">
          {/* Card Image Banner */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-2xl bg-[#0f0f12]">
            <img
              src={data.image}
              alt={data.title}
              className="h-full w-full object-cover transform transition-all duration-300 group-hover:scale-105 group-hover:brightness-105"
            />
            {/* Dark gradient overlay for text readability & studio mood */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent opacity-80" />

            {/* Studio Tag */}
            {data.category && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-bold uppercase tracking-wider text-white">
                <Disc3 className="w-3 h-3 text-zinc-300 animate-spin-slow" />
                <span>{data.category}</span>
              </div>
            )}
          </div>

          {/* Card Body */}
          <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
            <div>
              <h2 className="mb-2 text-base sm:text-lg font-bold text-white tracking-tight leading-snug group-hover:text-zinc-100 transition-colors">
                {data.title}
              </h2>
              <p className="text-xs sm:text-sm font-normal text-zinc-400 leading-relaxed line-clamp-2">
                {data.description}
              </p>
            </div>

            {/* Card Footer */}
            <div className="mt-6 flex flex-row items-center justify-between pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-400 font-medium">{data.date}</span>
                {data.readTime && (
                  <span className="text-[11px] text-zinc-500">{data.readTime}</span>
                )}
              </div>
              <div className="relative z-10 inline-flex items-center gap-1.5 rounded-xl bg-[#34363d] hover:bg-[#42454e] active:scale-95 px-4 py-2 text-xs font-bold text-white transition-all duration-200 border border-white/10 shadow-sm cursor-pointer">
                <span>Read More</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        </div>
      </FollowerPointerCard>
    </div>
  );
}

export default FollowerPointerCard;
