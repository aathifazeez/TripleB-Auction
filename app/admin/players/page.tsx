import { getServerSupabase } from "@/lib/supabase/server";
import PlayerTable from "@/components/admin/PlayerTable";

export default async function PlayersPage() {
  const supabase = getServerSupabase();
  const { data: players } = await supabase
    .from("players")
    .select("*, team:teams(id, name, color_hex)")
    .order("auction_order", { ascending: true, nullsFirst: false });

  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide" style={{ color: "var(--color-gold)" }}>
          PLAYERS
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Manage all players in the auction pool
        </p>
      </div>
      <PlayerTable players={players ?? []} />
    </div>
  );
}
