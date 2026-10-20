"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Player, PlayerRole } from "@/types";

const ROLE_LABEL: Record<PlayerRole, string> = {
  batsman:      "BATSMAN",
  bowler:       "BOWLER",
  allrounder:   "ALL-ROUNDER",
  wicketkeeper: "WICKET-KEEPER",
};

const ROLE_COLOR: Record<PlayerRole, string> = {
  batsman:      "var(--color-batsman)",
  bowler:       "var(--color-bowler)",
  allrounder:   "var(--color-allrounder)",
  wicketkeeper: "var(--color-wk)",
};

interface Props {
  player: Player;
}

export default function BiddingState({ player }: Props) {
  const roleColor = ROLE_COLOR[player.role];
  const initials  = player.name
    .split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <motion.div
      key="bidding"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 h-full w-full flex flex-col items-center justify-center overflow-hidden px-10 py-8"
    >
      {/* BIDDING OPEN pill */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-3 px-5 py-2 rounded-full border mb-6"
        style={{
          background:   "rgba(239, 68, 68, 0.10)",
          borderColor:  "rgba(239, 68, 68, 0.4)",
          boxShadow:    "0 0 30px rgba(239, 68, 68, 0.18)",
        }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{
            background: "var(--color-error)",
            boxShadow:  "0 0 14px var(--color-error)",
            animation:  "mna-pulse 1.2s ease-in-out infinite",
          }}
        />
        <span
          className="font-display tracking-[0.4em] text-base"
          style={{ color: "#fca5a5" }}
        >
          BIDDING&nbsp;OPEN
        </span>
      </motion.div>

      {/* Player photo — 4:5 portrait, height-bound so it never overflows */}
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7, type: "spring", bounce: 0.32 }}
        className="relative shrink-0"
        style={{
          height:      "min(48dvh, 520px)",
          aspectRatio: "4 / 5",
        }}
      >
        {/* Outer halo */}
        <div
          className="absolute inset-0 rounded-[2rem] -m-6 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${roleColor}40, transparent 70%)`,
            animation:  "mna-breathe 3.5s ease-in-out infinite",
          }}
        />

        <div
          className="relative w-full h-full rounded-3xl overflow-hidden"
          style={{
            border: `4px solid ${roleColor}`,
            boxShadow:
              `0 0 60px ${roleColor}66, inset 0 -30px 80px rgba(0,0,0,0.5)`,
            background: "linear-gradient(135deg, var(--color-surface-high), var(--color-surface))",
          }}
        >
          {player.photo_url ? (
            <Image
              src={player.photo_url}
              alt={player.name}
              fill
              sizes="(max-width: 1024px) 60vw, 40vh"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex w-full h-full items-center justify-center">
              <span
                className="font-display"
                style={{ fontSize: "clamp(120px, 16vh, 220px)", color: roleColor }}
              >
                {initials}
              </span>
            </div>
          )}

          {/* Bottom gradient overlay for legibility */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.6))",
            }}
          />
        </div>

        {/* Floating role pill */}
        <span
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full font-display tracking-[0.3em] whitespace-nowrap"
          style={{
            fontSize:   "clamp(13px, 1.4vh, 18px)",
            background: roleColor,
            color:      "#0a0e1a",
            boxShadow:  `0 8px 24px ${roleColor}80`,
          }}
        >
          {ROLE_LABEL[player.role]}
        </span>
      </motion.div>

      {/* Player name */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.6 }}
        className="font-display text-center tracking-wider mt-10"
        style={{
          fontSize:   "clamp(56px, 7vh, 120px)",
          lineHeight: 0.95,
          color:      "var(--color-text)",
          textShadow: "0 4px 30px rgba(0,0,0,0.6)",
        }}
      >
        {player.name}
      </motion.h1>

      {/* Base price card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="flex items-center gap-5 px-7 py-3 rounded-2xl border backdrop-blur-md mt-6"
        style={{
          background:   "rgba(245, 158, 11, 0.08)",
          borderColor:  "var(--color-gold-dim)",
          boxShadow:    "0 0 40px rgba(245,158,11,0.15)",
        }}
      >
        <span
          className="font-display tracking-[0.3em]"
          style={{ fontSize: "clamp(11px, 1.2vh, 14px)", color: "var(--color-text-muted)" }}
        >
          BASE&nbsp;PRICE
        </span>
        <span
          className="font-display tabular-nums"
          style={{
            fontSize:   "clamp(36px, 5vh, 64px)",
            lineHeight: 1,
            color:      "var(--color-gold-bright)",
            textShadow: "0 0 20px rgba(245,158,11,0.4)",
          }}
        >
          {player.base_points.toLocaleString()}
        </span>
        <span
          className="font-display tracking-[0.3em]"
          style={{ fontSize: "clamp(11px, 1.2vh, 14px)", color: "var(--color-text-muted)" }}
        >
          PTS
        </span>
      </motion.div>

      <style>{`
        @keyframes mna-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.3); }
        }
        @keyframes mna-breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 0.75; transform: scale(1.06); }
        }
      `}</style>
    </motion.div>
  );
}
