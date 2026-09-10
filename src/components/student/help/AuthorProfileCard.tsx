"use client";

import React, { useState } from "react";
import {
  BadgeCheck,
  Cpu,
  ShieldCheck,
  Code2,
  Phone,
  Send,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Terminal,
} from "lucide-react";

interface AuthorProfileCardProps {
  variant?: "sidebar" | "banner";
  className?: string;
}

export function AuthorProfileCard({
  variant = "sidebar",
  className = "",
}: AuthorProfileCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText("+998955710411");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  if (variant === "banner") {
    return (
      <div
        className={`rounded-3xl bg-gradient-to-br from-slate-900 via-[#141414] to-slate-950 border-2 border-slate-200/20 dark:border-white/10 hover:border-[#EBFF00]/50 p-6 sm:p-8 relative overflow-hidden shadow-2xl transition-all duration-300 ${className}`}
      >
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#EBFF00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-6 sm:gap-8">
          {/* Author Image with Glow Border */}
          <div className="relative shrink-0">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden ring-4 ring-[#EBFF00]/40 shadow-2xl bg-black/40">
              <img
                src="/images/author.jpg?v=2"
                alt="Diyorbek Rajabboyev"
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-slate-950 border border-[#EBFF00]/40 text-[#EBFF00] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Creator
            </div>
          </div>

          {/* Author Details */}
          <div className="flex-1 text-center lg:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EBFF00]/15 border border-[#EBFF00]/30 text-[#EBFF00] text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Platform Author & Lead Architect
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
                <Cpu className="w-3.5 h-3.5" /> AI & Cyber Security Focus
              </span>
            </div>

            <div className="flex flex-col lg:flex-row items-center lg:items-baseline gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Diyorbek Rajabboyev
                <BadgeCheck className="w-6 h-6 text-blue-400 shrink-0 inline" />
              </h2>
              <span className="text-xs sm:text-sm font-bold text-slate-300">
                Junior Full-Stack Software Developer
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed font-medium">
              Creator and developer of the SAT-ALFA platform. Passionate junior software engineer dedicated to building modern educational technologies, intelligent test simulations, and high-performance web systems. Currently specializing in full-stack architecture, Artificial Intelligence Engineering, and Cyber Security.
            </p>

            {/* Skills & Focus Chips */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-200">
                <Code2 className="w-3.5 h-3.5 text-[#EBFF00]" /> Full-Stack Development
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-200">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> Artificial Intelligence
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cyber Security
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-200">
                <Terminal className="w-3.5 h-3.5 text-blue-400" /> System Architecture
              </span>
            </div>

            {/* Contact Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3">
              <a
                href="https://t.me/ddiyor_9"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-[#229ED9] hover:bg-[#1e8cc0] text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#229ED9]/25 hover:shadow-[#229ED9]/40 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Chat via Telegram (@ddiyor_9)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <a
                href="tel:+998955710411"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>+998 95 571 04 11</span>
              </a>

              <button
                type="button"
                onClick={handleCopyPhone}
                title="Copy phone number"
                className="px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar Variant (compact, high-density)
  return (
    <div
      className={`p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#131313] border-2 border-slate-200 dark:border-white/10 hover:border-[#EBFF00]/50 dark:hover:border-[#EBFF00]/40 transition-all duration-300 shadow-xl relative overflow-hidden group ${className}`}
    >
      {/* Subtle glow orb */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#EBFF00]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#EBFF00]/15 transition-colors" />

      {/* Header Tag */}
      <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EBFF00]/15 border border-[#EBFF00]/30 text-slate-950 dark:text-[#EBFF00] text-[10px] font-black uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          Creator & Author
        </span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Lead Developer
        </span>
      </div>

      {/* Profile Info */}
      <div className="flex items-start gap-3.5 mb-3.5 relative z-10">
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden ring-2 ring-slate-900/10 dark:ring-[#EBFF00]/40 shadow-lg shrink-0 bg-slate-100 dark:bg-black/40">
          <img
            src="/images/author.jpg?v=2"
            alt="Diyorbek Rajabboyev"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight truncate">
              Diyorbek Rajabboyev
            </h4>
            <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-[#EBFF00] mt-0.5">
            Junior Software Developer
          </p>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
            <Cpu className="w-3 h-3 text-purple-500 shrink-0" />
            AI & Cyber Security Focus
          </p>
        </div>
      </div>

      {/* Bio text */}
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed relative z-10 mb-3.5 font-medium">
        Creator and lead architect of SAT-ALFA. Driven by a mission to build reliable educational technology and secure testing environments.
      </p>

      {/* Skills Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
          Full-Stack
        </span>
        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
          AI Engineering
        </span>
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          Cyber Security
        </span>
      </div>

      {/* Direct Contact Actions */}
      <div className="space-y-2 relative z-10 pt-2 border-t border-slate-200 dark:border-white/10">
        <a
          href="https://t.me/ddiyor_9"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-3.5 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 border border-[#229ED9]/30 text-[#229ED9] text-xs font-bold flex items-center justify-between transition-all group/btn"
        >
          <div className="flex items-center gap-2">
            <Send className="w-3.5 h-3.5" />
            <span>Telegram: @ddiyor_9</span>
          </div>
          <ExternalLink className="w-3 h-3 opacity-70 group-hover/btn:translate-x-0.5 transition-transform" />
        </a>

        <div className="flex items-center gap-2">
          <a
            href="tel:+998955710411"
            className="flex-1 py-2.5 px-3.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-bold flex items-center gap-2 transition-all truncate"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">+998 95 571 04 11</span>
          </a>
          <button
            type="button"
            onClick={handleCopyPhone}
            title="Copy phone number"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
