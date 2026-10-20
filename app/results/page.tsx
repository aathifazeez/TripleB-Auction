import { getServerSupabase } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Users, Coins, BarChart2, UserCircle } from "lucide-react";
import type { Player, Team, PlayerRole } from "@/types";
import DownloadPdfButton from "@/components/results/DownloadPdfButton";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<PlayerRole, string> = {
  batsman:      "BAT",
  bowler:       "BOWL",
  allrounder:   "AR",
  wicketkeeper: "WK",
};

const ROLE_COLOR: Record<PlayerRole, string> = {
  batsman:      "var(--color-batsman)",
  bowler:       "var(--color-bowler)",
  allrounder:   "var(--color-allrounder)",
  wicketkeeper: "var(--color-wk)",
};

type PlayerWithTeam = Player & { team: Team | null };
type TeamWithPlayers = Team & { roster: PlayerWithTeam[] };

export default async function ResultsPage() {
  const supabase = getServerSupabase();

  const [{ data: teams }, { data: players }, { data: stateData }] = await Promise.all([
    supabase.from("teams").select("*").order("budget_used", { ascending: false }),
    supabase
      .from("players")
      .select("*, team:teams(id, name, color_hex, budget, budget_used, logo_url, created_at)")
      .order("sold_for", { ascending: false }),
    supabase.from("auction_state").select("status").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const allPlayers = (players ?? []) as PlayerWithTeam[];
  const allTeams   = (teams   ?? []) as Team[];

  const sold    = allPlayers.filter((p) => p.status === "sold");
  const unsold  = allPlayers.filter((p) => p.status === "unsold");
  const pending = allPlayers.filter((p) => p.status === "pending");

  const totalSpend = sold.reduce((s, p) => s + (p.sold_for ?? 0), 0);
  const topBid     = sold[0] ?? null;

  const teamRosters: TeamWithPlayers[] = allTeams.map((t) => ({
    ...t,
    roster: sold.filter((p) => p.team_id === t.id),
  }));

  const isLive = stateData?.status && stateData.status !== "ended";

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-8 py-4 border-b flex items-center justify-between backdrop-blur-md"
        style={{ background: "rgba(10,14,26,0.9)", borderColor: "var(--color-border)" }}
      >
        <div>
          <h1 className="font-display text-3xl tracking-wider" style={{ color: "var(--color-gold)" }}>
            AUCTION&nbsp;RESULTS
          </h1>
          <p className="text-xs mt-0.5 tracking-[0.25em]" style={{ color: "var(--color-text-subtle)" }}>
            MOON NIGHT AUCTION
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isLive && (
            <span
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-display tracking-[0.3em]"
              style={{
                background:  "rgba(239,68,68,0.12)",
                border:      "1px solid rgba(239,68,68,0.35)",
                color:       "#fca5a5",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--color-error)", animation: "pulse-dot 1.2s ease-in-out infinite" }}
              />
              LIVE
            </span>
          )}
          <DownloadPdfButton
            teams={teamRosters}
            sold={sold}
            unsold={unsold}
            totalSpend={totalSpend}
          />
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 rounded-lg text-sm font-medium border"
            style={{
              background:  "var(--color-surface)",
              borderColor: "var(--color-border)",
              color:       "var(--color-text-muted)",
            }}
          >
            Admin Panel
          </Link>
        </div>
      </div>

      <div className="px-8 py-8 max-w-screen-xl mx-auto flex flex-col gap-10">
        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard icon={<Users size={18} />}      label="Players Sold"      value={sold.length}                              />
          <SummaryCard icon={<UserCircle size={18} />} label="Unsold / Pending"  value={`${unsold.length} / ${pending.length}`}   />
          <SummaryCard icon={<Coins size={18} />}      label="Total Spend"       value={`${totalSpend.toLocaleString()} pts`}     accent />
          <SummaryCard icon={<BarChart2 size={18} />}  label="Teams Competing"   value={allTeams.length}                          />
        </div>

        {/* Top bid highlight */}
        {topBid && (
          <div
            className="relative flex items-center gap-6 px-8 py-6 rounded-2xl border overflow-hidden"
            style={{
              background:  "rgba(245,158,11,0.06)",
              borderColor: "var(--color-gold-dim)",
              boxShadow:   "0 0 40px rgba(245,158,11,0.1)",
            }}
          >
            <div
              className="absolute top-0 inset-x-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)" }}
            />
            <Trophy size={40} style={{ color: "var(--color-gold-bright)", flexShrink: 0 }} />
            <div>
              <p className="font-display tracking-[0.3em] text-sm" style={{ color: "var(--color-gold)" }}>
                HIGHEST&nbsp;BID
              </p>
              <p className="font-display text-4xl mt-1" style={{ color: "var(--color-text)" }}>
                {topBid.name}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                Sold to{" "}
                <span style={{ color: topBid.team?.color_hex ?? "var(--color-text)" }}>
                  {topBid.team?.name ?? "Unknown"}
                </span>
                {" "}for{" "}
                <span style={{ color: "var(--color-gold-bright)" }}>
                  {(topBid.sold_for ?? 0).toLocaleString()} pts
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Team rosters */}
        <div>
          <h2 className="font-display text-xl tracking-[0.25em] mb-5" style={{ color: "var(--color-text-muted)" }}>
            TEAM ROSTERS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {teamRosters.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
            {teamRosters.length === 0 && (
              <p className="text-sm col-span-full" style={{ color: "var(--color-text-subtle)" }}>
                No teams found. Add teams in the admin panel first.
              </p>
            )}
          </div>
        </div>

        {/* Unsold players */}
        {unsold.length > 0 && (
          <div>
            <h2 className="font-display text-xl tracking-[0.25em] mb-4" style={{ color: "var(--color-text-muted)" }}>
              UNSOLD PLAYERS
            </h2>
            <div className="flex flex-wrap gap-2">
              {unsold.map((p) => (
                <span
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border"
                  style={{
                    background:  "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color:       "var(--color-text-muted)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_COLOR[p.role] }} />
                  {p.name}
                  <span className="text-[10px] tracking-wider" style={{ color: "var(--color-text-subtle)" }}>
                    {ROLE_LABEL[p.role]}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pending players */}
        {pending.length > 0 && (
          <div>
            <h2 className="font-display text-xl tracking-[0.25em] mb-4" style={{ color: "var(--color-text-muted)" }}>
              STILL IN POOL ({pending.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {pending.map((p) => (
                <span
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border"
                  style={{
                    background:  "rgba(245,158,11,0.06)",
                    borderColor: "var(--color-gold-dim)",
                    color:       "var(--color-text-muted)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: ROLE_COLOR[p.role] }} />
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}

function SummaryCard({
  icon, label, value, accent,
}: {
  icon:   React.ReactNode;
  label:  string;
  value:  string | number;
  accent?: boolean;
}) {
  return (
    <div
      className="relative rounded-2xl border p-5 overflow-hidden"
      style={{
        background:  accent ? "rgba(245,158,11,0.07)" : "var(--color-surface)",
        borderColor: accent ? "var(--color-gold-dim)"  : "var(--color-border)",
      }}
    >
      {accent && (
        <div
          className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, var(--color-gold), transparent)" }}
        />
      )}
      <div className="flex items-center gap-2 mb-3" style={{ color: accent ? "var(--color-gold)" : "var(--color-text-subtle)" }}>
        {icon}
        <span className="text-xs tracking-[0.2em] font-display">{label.toUpperCase()}</span>
      </div>
      <p
        className="font-display text-3xl tabular-nums"
        style={{ color: accent ? "var(--color-gold-bright)" : "var(--color-text)" }}
      >
        {value}
      </p>
    </div>
  );
}

function TeamCard({ team }: { team: TeamWithPlayers }) {
  const remaining = team.budget - team.budget_used;
  const spentPct  = team.budget > 0 ? Math.min(100, (team.budget_used / team.budget) * 100) : 0;
  const roleCounts = team.roster.reduce<Partial<Record<PlayerRole, number>>>((acc, p) => {
    acc[p.role] = (acc[p.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className="rounded-2xl border overflow-hidden flex flex-col"
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      {/* Team color top bar */}
      <div className="h-2" style={{ background: team.color_hex, boxShadow: `0 0 18px ${team.color_hex}60` }} />

      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-3">
          <span
            className="w-4 h-4 rounded-full shrink-0"
            style={{ background: team.color_hex, boxShadow: `0 0 12px ${team.color_hex}80` }}
          />
          <h3 className="font-display tracking-wider text-2xl flex-1" style={{ color: "var(--color-text)" }}>
            {team.name}
          </h3>
          <span className="font-display text-xl" style={{ color: "var(--color-gold-bright)" }}>
            {team.roster.length} players
          </span>
        </div>

        {/* Budget bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--color-text-subtle)" }}>
            <span>Spent: {team.budget_used.toLocaleString()} pts</span>
            <span style={{ color: remaining < 0 ? "var(--color-error)" : "var(--color-text-subtle)" }}>
              Left: {remaining.toLocaleString()} pts
            </span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width:      `${spentPct}%`,
                background: spentPct > 85 ? "var(--color-error)" : team.color_hex,
              }}
            />
          </div>
        </div>

        {/* Role breakdown */}
        {team.roster.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {(Object.entries(roleCounts) as [PlayerRole, number][]).map(([role, count]) => (
              <span
                key={role}
                className="px-2 py-0.5 rounded text-[11px] font-display tracking-wider"
                style={{
                  background: `${ROLE_COLOR[role]}20`,
                  color:      ROLE_COLOR[role],
                  border:     `1px solid ${ROLE_COLOR[role]}40`,
                }}
              >
                {ROLE_LABEL[role]} ×{count}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Player list */}
      <div className="flex flex-col">
        {team.roster.map((p) => (
          <PlayerRow key={p.id} player={p} teamColor={team.color_hex} />
        ))}
        {team.roster.length === 0 && (
          <p className="px-5 py-4 text-sm" style={{ color: "var(--color-text-subtle)" }}>
            No players assigned yet
          </p>
        )}
      </div>
    </div>
  );
}

function PlayerRow({ player, teamColor }: { player: PlayerWithTeam; teamColor: string }) {
  const initials  = player.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const roleColor = ROLE_COLOR[player.role];

  return (
    <div
      className="flex items-center gap-3 px-5 py-3 border-t"
      style={{ borderColor: "var(--color-border-subtle)" }}
    >
      <div
        className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0"
        style={{ background: "var(--color-surface-raised)", border: `1.5px solid ${roleColor}50` }}
      >
        {player.photo_url ? (
          <Image src={player.photo_url} alt={player.name} fill sizes="40px" className="object-cover" />
        ) : (
          <div className="flex w-full h-full items-center justify-center">
            <span className="font-display text-base" style={{ color: roleColor }}>{initials}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>
          {player.name}
        </p>
        <span className="text-[10px] tracking-wider font-display" style={{ color: roleColor }}>
          {ROLE_LABEL[player.role]}
        </span>
      </div>
      <span className="font-display text-lg tabular-nums shrink-0" style={{ color: teamColor }}>
        {(player.sold_for ?? 0).toLocaleString()}
      </span>
    </div>
  );
}
