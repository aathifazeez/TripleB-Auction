import { getServerSupabase } from "@/lib/supabase/server";
import DashboardStats from "@/components/admin/DashboardStats";
import type { DashboardStats as Stats } from "@/types";

export default async function DashboardPage() {
  const supabase = getServerSupabase();

  const [{ data: players }, { data: teams }] = await Promise.all([
    supabase.from("players").select("status, sold_for"),
    supabase.from("teams").select("id"),
  ]);

  const sold = players?.filter((p) => p.status === "sold") ?? [];

  const stats: Stats = {
    totalPlayers:   players?.length ?? 0,
    totalTeams:     teams?.length   ?? 0,
    playersSold:    sold.length,
    playersUnsold:  players?.filter((p) => p.status === "unsold").length  ?? 0,
    playersPending: players?.filter((p) => p.status === "pending").length ?? 0,
    totalBidValue:  sold.reduce((sum, p) => sum + (p.sold_for ?? 0), 0),
  };

  return (
    <div className="p-8 flex flex-col gap-8">
      <div>
        <h1 className="font-display text-4xl tracking-wide" style={{ color: "var(--color-gold)" }}>
          DASHBOARD
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Live auction overview
        </p>
      </div>
      <DashboardStats data={stats} />
    </div>
  );
}
