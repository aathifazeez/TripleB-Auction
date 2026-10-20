import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PlayerRole, PlayerStatus, AuctionStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPoints(points: number): string {
  return points.toLocaleString("en-US");
}

export function getRoleLabel(role: PlayerRole): string {
  const labels: Record<PlayerRole, string> = {
    batsman: "Batsman",
    bowler: "Bowler",
    allrounder: "All-Rounder",
    wicketkeeper: "Wicket-Keeper",
  };
  return labels[role];
}

export function getRoleColor(role: PlayerRole): string {
  const colors: Record<PlayerRole, string> = {
    batsman: "var(--color-batsman)",
    bowler: "var(--color-bowler)",
    allrounder: "var(--color-allrounder)",
    wicketkeeper: "var(--color-wk)",
  };
  return colors[role];
}

export function getRoleDimColor(role: PlayerRole): string {
  const colors: Record<PlayerRole, string> = {
    batsman: "var(--color-batsman-dim)",
    bowler: "var(--color-bowler-dim)",
    allrounder: "var(--color-allrounder-dim)",
    wicketkeeper: "var(--color-wk-dim)",
  };
  return colors[role];
}

export function getStatusLabel(status: PlayerStatus): string {
  const labels: Record<PlayerStatus, string> = {
    pending: "Pending",
    sold: "Sold",
    unsold: "Unsold",
  };
  return labels[status];
}

export function getStatusColor(status: PlayerStatus): string {
  const colors: Record<PlayerStatus, string> = {
    pending: "var(--color-text-muted)",
    sold: "var(--color-success)",
    unsold: "var(--color-error)",
  };
  return colors[status];
}

export function getAuctionStatusLabel(status: AuctionStatus): string {
  const labels: Record<AuctionStatus, string> = {
    idle: "Idle",
    rolling: "Selecting Player",
    bidding: "Bidding Open",
    sold: "Player Sold",
    ended: "Auction Ended",
  };
  return labels[status];
}
