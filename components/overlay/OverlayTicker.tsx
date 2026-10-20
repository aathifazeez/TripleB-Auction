"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import type { AuctionState, PlayerRole, Team } from "@/types";
import { subscribeToAuctionState } from "@/lib/supabase/realtime";

const ROLE_LABEL: Record<PlayerRole, string> = {
  batsman:      "BATSMAN",
  bowler:       "BOWLER",
  allrounder:   "ALL-ROUNDER",
  wicketkeeper: "WICKET-KEEPER",
};

const ROLE_COLOR: Record<PlayerRole, string> = {
  batsman:      "#3b82f6",
  bowler:       "#ef4444",
  allrounder:   "#8b5cf6",
  wicketkeeper: "#f59e0b",
};

interface Props {
  initialState: AuctionState;
  initialTeams: Team[];
}

export default function OverlayTicker({ initialState, initialTeams }: Props) {
  const [state, setState] = useState<AuctionState>(initialState);
  const [teams, setTeams] = useState<Team[]>(initialTeams);

  const refresh = useCallback(async () => {
    const [stateRes, teamsRes] = await Promise.all([
      fetch("/api/auction/state"),
      fetch("/api/teams"),
    ]);
    if (stateRes.ok) setState(await stateRes.json());
    if (teamsRes.ok) setTeams(await teamsRes.json());
  }, []);

  useEffect(() => {
    const channel = subscribeToAuctionState(() => { refresh(); });
    return () => { channel.unsubscribe(); };
  }, [refresh]);

  const isBidding   = state.status === "bidding";
  const player      = state.current_player;
  const leadingTeam =
    state.current_bid_team_obj ??
    teams.find((t) => t.id === state.current_bid_team) ??
    null;

  return (
    <div
      style={{
        position: "fixed",
        left:     0,
        right:    0,
        bottom:   0,
        display:  "flex",
        justifyContent: "center",
        pointerEvents:  "none",
      }}
    >
      <AnimatePresence>
        {isBidding && player && (
          <TickerBar
            key="bar"
            playerName={player.name}
            playerPhoto={player.photo_url}
            playerRole={player.role}
            currentBid={state.current_bid ?? 0}
            nextMinBid={state.next_min_bid ?? 0}
            leadingTeam={leadingTeam}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Ticker bar — three regions: player | MSL brand | bid stats
   ───────────────────────────────────────────────────────────────────── */

function TickerBar({
  playerName, playerPhoto, playerRole,
  currentBid, nextMinBid, leadingTeam,
}: {
  playerName:  string;
  playerPhoto: string | null;
  playerRole:  PlayerRole;
  currentBid:  number;
  nextMinBid:  number;
  leadingTeam: Team | null;
}) {
  const roleColor = ROLE_COLOR[playerRole];
  const initials  = playerName
    .split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0,  opacity: 1 }}
      exit={{    y: 60, opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{
        width:        "100%",
        maxWidth:     1820,
        height:       150,
        margin:       "0 24px 24px",
        display:      "grid",
        gridTemplateColumns: "1.4fr 1fr 1.4fr",
        alignItems:   "center",
        gap:          24,
        padding:      "0 32px",
        borderRadius: 20,
        border:       "1px solid rgba(245,158,11,0.45)",
        background:   "linear-gradient(180deg, rgba(10,14,26,0.92), rgba(10,14,26,0.97))",
        backdropFilter: "blur(14px)",
        boxShadow:      "0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(245,158,11,0.3)",
        color:        "#f9fafb",
        fontFamily:   '"Inter", sans-serif',
        overflow:     "hidden",
      }}
    >
      {/* Gold sheen on the top edge */}
      <div
        style={{
          position: "absolute",
          inset:    "0 0 auto 0",
          height:   1,
          background: "linear-gradient(90deg, transparent, #fbbf24, transparent)",
          pointerEvents: "none",
        }}
      />

      {/* LEFT — Player */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, minWidth: 0 }}>
        <div
          style={{
            position:    "relative",
            width:       100,
            aspectRatio: "4 / 5",
            borderRadius: 14,
            border:       `2px solid ${roleColor}`,
            boxShadow:    `0 0 22px ${roleColor}66`,
            background:   "#111827",
            overflow:     "hidden",
            flexShrink:   0,
          }}
        >
          {playerPhoto ? (
            <Image src={playerPhoto} alt={playerName} fill sizes="100px" style={{ objectFit: "cover" }} />
          ) : (
            <div style={{
              width: "100%", height: "100%", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontFamily: '"Bebas Neue", sans-serif', fontSize: 34, color: roleColor,
            }}>
              {initials}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
          <p style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize:   42,
            lineHeight: 1,
            letterSpacing: "0.04em",
            margin: 0,
            whiteSpace: "nowrap",
            overflow:   "hidden",
            textOverflow: "ellipsis",
            maxWidth:   "100%",
          }}>
            {playerName}
          </p>
          <span style={{
            alignSelf:   "flex-start",
            padding:     "5px 14px",
            borderRadius: 999,
            fontFamily:  '"Bebas Neue", sans-serif',
            fontSize:    13,
            letterSpacing: "0.28em",
            background:  `${roleColor}25`,
            color:       roleColor,
            border:      `1px solid ${roleColor}55`,
          }}>
            {ROLE_LABEL[playerRole]}
          </span>
        </div>
      </div>

      {/* CENTER — MSL brand with shimmer/pulse */}
      <MslBrand />

      {/* RIGHT — Bid stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.1fr 1fr",
        alignItems: "center",
        gap: 18,
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <span style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize:   12,
            letterSpacing: "0.35em",
            color: "#f59e0b",
          }}>
            CURRENT&nbsp;BID
          </span>
          <CountUp
            value={currentBid}
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize:   58,
              lineHeight: 1,
              color:      "#fbbf24",
              textShadow: "0 0 24px rgba(245,158,11,0.45)",
              fontVariantNumeric: "tabular-nums",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 0 }}>
          <span style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize:   12,
            letterSpacing: "0.3em",
            color: "#6b7280",
          }}>
            LEADING&nbsp;TEAM
          </span>
          <div style={{ height: 46, display: "flex", alignItems: "center" }}>
            <AnimatePresence mode="popLayout">
              {leadingTeam ? (
                <motion.div
                  key={leadingTeam.id}
                  initial={{ scale: 1.18, opacity: 0 }}
                  animate={{
                    scale:     [1.18, 0.96, 1.04, 1],
                    opacity:   1,
                    boxShadow: [
                      `0 0 36px ${leadingTeam.color_hex}aa`,
                      `0 0 18px ${leadingTeam.color_hex}80`,
                      `0 0 12px ${leadingTeam.color_hex}55`,
                    ],
                  }}
                  exit={{ scale: 0.94, opacity: 0 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  style={{
                    display:     "flex",
                    alignItems:  "center",
                    gap:         10,
                    padding:     "8px 18px",
                    borderRadius: 999,
                    background:  `${leadingTeam.color_hex}26`,
                    border:      `1px solid ${leadingTeam.color_hex}`,
                  }}
                >
                  <span style={{
                    width: 11, height: 11, borderRadius: "50%",
                    background: leadingTeam.color_hex,
                    boxShadow: `0 0 10px ${leadingTeam.color_hex}`,
                  }} />
                  <span style={{
                    fontFamily: '"Bebas Neue", sans-serif',
                    fontSize:   22,
                    letterSpacing: "0.05em",
                    color: "#f9fafb",
                    maxWidth: "20ch",
                    whiteSpace: "nowrap",
                    overflow:   "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {leadingTeam.name}
                  </span>
                </motion.div>
              ) : (
                <motion.span
                  key="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontFamily: '"Bebas Neue", sans-serif',
                    fontSize:   18,
                    letterSpacing: "0.3em",
                    color: "#6b7280",
                  }}
                >
                  AWAITING&nbsp;FIRST&nbsp;BID
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <span style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize:   12,
            letterSpacing: "0.3em",
            color: "#6b7280",
          }}>
            NEXT&nbsp;MIN&nbsp;BID
          </span>
          <CountUp
            value={nextMinBid}
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize:   32,
              lineHeight: 1,
              color: "#9ca3af",
              fontVariantNumeric: "tabular-nums",
            }}
            suffix=" pts"
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   MSL brand — animated shimmer + soft pulse + rotating ring
   ───────────────────────────────────────────────────────────────────── */

function MslBrand() {
  return (
    <div style={{
      position:   "relative",
      display:    "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap:        4,
    }}>
      {/* Rotating gold ring behind the text */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 14, ease: "linear", repeat: Infinity }}
        style={{
          position: "absolute",
          width:    160,
          height:   160,
          borderRadius: "50%",
          background: "conic-gradient(from 0deg, transparent 0deg, rgba(245,158,11,0.45) 70deg, transparent 140deg, transparent 360deg)",
          filter:   "blur(12px)",
          opacity:  0.55,
          pointerEvents: "none",
        }}
      />

      {/* Pulsing core glow */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
        style={{
          position: "absolute",
          width:    140,
          height:   80,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(251,191,36,0.45) 0%, transparent 70%)",
          filter:   "blur(10px)",
          pointerEvents: "none",
        }}
      />

      {/* The wordmark with a sweeping shimmer */}
      <div style={{ position: "relative", overflow: "hidden", padding: "4px 12px" }}>
        <motion.span
          animate={{ textShadow: [
            "0 0 14px rgba(245,158,11,0.55), 0 0 28px rgba(245,158,11,0.25)",
            "0 0 22px rgba(251,191,36,0.85), 0 0 44px rgba(245,158,11,0.55)",
            "0 0 14px rgba(245,158,11,0.55), 0 0 28px rgba(245,158,11,0.25)",
          ]}}
          transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
          style={{
            display:    "block",
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize:   72,
            lineHeight: 1,
            letterSpacing: "0.22em",
            background: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 60%, #d97706 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip: "text",
            position:   "relative",
            zIndex:     2,
          }}
        >
          MSL
        </motion.span>

        {/* Sweeping highlight stripe */}
        <motion.div
          initial={{ x: "-120%" }}
          animate={{ x: "220%" }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2 }}
          style={{
            position: "absolute",
            top:      0,
            bottom:   0,
            width:    "45%",
            background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
            mixBlendMode: "overlay",
            pointerEvents: "none",
            zIndex:    3,
          }}
        />
      </div>

      <span style={{
        fontFamily: '"Bebas Neue", sans-serif',
        fontSize:   13,
        letterSpacing: "0.42em",
        color:      "#9ca3af",
        position:   "relative",
        zIndex:     2,
      }}>
        MOONKNIGHT&nbsp;SUPER&nbsp;LEAGUE
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Animated count-up — smoothly transitions to a new numeric value
   ───────────────────────────────────────────────────────────────────── */

function CountUp({
  value, style, suffix = "",
}: {
  value:   number;
  style?:  React.CSSProperties;
  suffix?: string;
}) {
  const mv      = useMotionValue(value);
  const display = useTransform(mv, (v) => `${Math.round(v).toLocaleString()}${suffix}`);

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.65, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv]);

  return <motion.span style={style}>{display}</motion.span>;
}
