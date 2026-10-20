import { getServerSupabase } from "@/lib/supabase/server";
import { getAuctionState } from "@/lib/supabase/auction-state";
import OverlayTicker from "@/components/overlay/OverlayTicker";

export const dynamic = "force-dynamic";

export default async function OverlayPage() {
  const supabase = getServerSupabase();
  const [state, { data: teams }] = await Promise.all([
    getAuctionState(supabase),
    supabase.from("teams").select("*").order("created_at", { ascending: true }),
  ]);

  return <OverlayTicker initialState={state} initialTeams={teams ?? []} />;
}
