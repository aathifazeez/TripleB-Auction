import { getServerSupabase } from "@/lib/supabase/server";
import { getAuctionState } from "@/lib/supabase/auction-state";
import ScreenStage from "@/components/screen/ScreenStage";
import type { Player } from "@/types";

export const dynamic = "force-dynamic";

export default async function ScreenPage() {
  const supabase = getServerSupabase();

  const [state, { data: teams }, { data: players }] = await Promise.all([
    getAuctionState(supabase),
    supabase.from("teams").select("*").order("created_at", { ascending: true }),
    supabase
      .from("players")
      .select("id, name, photo_url, role, status, team_id, sold_for")
      .order("auction_order", { ascending: true, nullsFirst: false }),
  ]);

  const allPlayers = (players ?? []) as Pick<Player, "id" | "name" | "photo_url" | "role" | "status" | "team_id" | "sold_for">[];
  const pending    = allPlayers.filter((p) => p.status === "pending");
  const sold       = allPlayers.filter((p) => p.status === "sold");
  const unsold     = allPlayers.filter((p) => p.status === "unsold");

  const boughtByTeam: Record<string, number> = {};
  sold.forEach((p) => {
    if (p.team_id) boughtByTeam[p.team_id] = (boughtByTeam[p.team_id] ?? 0) + 1;
  });

  const initialCounts = {
    pending: pending.length,
    sold:    sold.length,
    unsold:  unsold.length,
  };
  const initialSpend = sold.reduce((s, p) => s + (p.sold_for ?? 0), 0);

  return (
    <ScreenStage
      initialState={state}
      initialTeams={teams ?? []}
      initialPending={pending.map((p) => ({
        id:        p.id,
        name:      p.name,
        photo_url: p.photo_url,
        role:      p.role,
      }))}
      initialCounts={initialCounts}
      initialSpend={initialSpend}
      initialTotalPlayers={allPlayers.length}
      initialBoughtByTeam={boughtByTeam}
    />
  );
}
