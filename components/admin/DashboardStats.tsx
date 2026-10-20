import { formatPoints } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import { Users, Shield, TrendingUp, XCircle, Clock, Coins } from "lucide-react";

const stats = [
  { key: "totalPlayers",  label: "Total Players",  icon: Users,      color: "var(--color-gold)"    },
  { key: "totalTeams",    label: "Teams",           icon: Shield,     color: "var(--color-batsman)" },
  { key: "playersSold",   label: "Sold",            icon: TrendingUp, color: "var(--color-success)" },
  { key: "playersUnsold", label: "Unsold",          icon: XCircle,    color: "var(--color-error)"   },
  { key: "playersPending",label: "Pending",         icon: Clock,      color: "var(--color-text-muted)"},
] as const;

export default function DashboardStatsComponent({ data }: { data: DashboardStats }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(({ key, label, icon: Icon, color }) => (
          <div
            key={key}
            className="rounded-xl border p-5 flex flex-col gap-3"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
                {label}
              </span>
              <Icon size={16} style={{ color }} />
            </div>
            <span className="font-display text-4xl leading-none" style={{ color: "var(--color-text)" }}>
              {data[key]}
            </span>
          </div>
        ))}
      </div>

      {/* Total bid value banner */}
      <div
        className="rounded-xl border p-6 flex items-center justify-between"
        style={{
          background: "linear-gradient(135deg, var(--color-surface) 0%, var(--color-gold-dim) 100%)",
          borderColor: "rgba(245,158,11,0.3)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.15)" }}
          >
            <Coins size={22} style={{ color: "var(--color-gold)" }} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
              Total Bid Value
            </p>
            <p className="font-display text-3xl mt-0.5" style={{ color: "var(--color-gold)" }}>
              {formatPoints(data.totalBidValue)} pts
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Avg per sold player</p>
          <p className="font-semibold text-lg mt-0.5" style={{ color: "var(--color-text)" }}>
            {data.playersSold > 0
              ? formatPoints(Math.round(data.totalBidValue / data.playersSold)) + " pts"
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
