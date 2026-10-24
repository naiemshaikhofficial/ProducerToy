"use client";

/**
 * @author: @kokonut-labs
 * @description: Slide Text Button with animated vertical text transition
 * @version: 1.0.0
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SlideTextButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  text?: string;
  hoverText?: string;
  primaryText?: string;
  slideText?: string;
  href?: string;
  className?: string;
  variant?: "default" | "ghost" | "primary" | "secondary" | "outline";
  showIcon?: boolean;
  icon?: React.ReactNode;
  animateIn?: boolean;
}

export default function SlideTextButton({
  text,
  hoverText,
  primaryText = "Browse Now",
  slideText = "Click here to explore toys",
  href = "/store",
  className,
  variant = "default",
  showIcon = true,
  icon,
  animateIn = false,
  ...props
}: SlideTextButtonProps) {
  const initialLabel = text ?? primaryText;
  const hoverLabel = hoverText ?? slideText ?? initialLabel;

  const variantStyles =
    variant === "ghost" || variant === "outline"
      ? "border border-black/10 text-black hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
      : variant === "secondary"
      ? "bg-[#181818] text-white hover:bg-[#222222] border border-[#2a2a2a] hover:border-zinc-500"
      : "bg-black text-white hover:bg-zinc-900 border border-black shadow-[0_6px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.35)]";

  const renderIcon = icon ?? (showIcon ? <ArrowRight className="w-4 h-4 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" /> : null);

  const innerContent = (
    <span className="grid justify-items-center transition-transform duration-300 ease-[cubic-bezier(0.77,0,0.175,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full group-active:-translate-y-full motion-reduce:transition-none">
      {/* Default Label (Row 1) */}
      <span className="col-start-1 row-start-1 flex items-center gap-2 opacity-100 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0 group-active:opacity-0">
        <span className="font-extrabold tracking-wider uppercase text-center">{initialLabel}</span>
        {renderIcon}
      </span>

      {/* Hover/Active Slide Label (Row 1, waiting underneath until shifted) */}
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1 flex translate-y-full items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
      >
        <span className="font-extrabold tracking-wider uppercase text-center">{hoverLabel}</span>
        {renderIcon}
      </span>
    </span>
  );

  const sharedClasses = cn(
    "group relative inline-flex h-[46px] sm:h-[48px] items-center justify-center overflow-hidden rounded-xl px-7 sm:px-9 font-extrabold text-[13px] sm:text-[14px] tracking-wider transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 active:scale-[0.97] motion-reduce:active:scale-100 select-none cursor-pointer",
    animateIn && "starting:translate-x-2 starting:opacity-0 motion-reduce:starting:translate-x-0",
    variantStyles,
    className
  );

  if (href) {
    return (
      <Link href={href} className={sharedClasses} {...props}>
        {innerContent}
      </Link>
    );
  }

  return (
    <button type="button" className={sharedClasses} onClick={props.onClick as any}>
      {innerContent}
    </button>
  );
}

export { SlideTextButton };
