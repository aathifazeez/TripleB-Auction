import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuctionState } from "@/types";

const PLAYER_FIELDS    = "id, name, photo_url, role, base_points, status, team_id, sold_for, auction_order, created_at";
const PLAYER_WITH_TEAM = `${PLAYER_FIELDS}, team:teams(id, name, color_hex)`;
const BID_TEAM_FIELDS  = "id, name, color_hex, budget, budget_used";
export const STATE_SELECT = `*, current_player:players(${PLAYER_WITH_TEAM}), current_bid_team_obj:teams!auction_state_current_bid_team_fkey(${BID_TEAM_FIELDS})`;

/**
 * `auction_state` should always contain exactly one row. This helper:
 *   1. Reads all rows ordered by `updated_at DESC` (most-recent first).
 *   2. Keeps the newest row, deletes any duplicates left behind by old bugs.
 *   3. If no row exists, inserts a fresh idle row.
 *
 * Returns the canonical row's id. Never throws on "0 or many" cases.
 */
export async function ensureAuctionStateRowId(supabase: SupabaseClient): Promise<string> {
  const { data: rows, error: selErr } = await supabase
    .from("auction_state")
    .select("id, updated_at")
    .order("updated_at", { ascending: false });

  if (selErr) {
    throw new Error(`auction_state select failed: ${selErr.message}`);
  }

  // Clean up duplicates from older bug — keep the most-recently-updated row
  if (rows && rows.length > 1) {
    const dupeIds = rows.slice(1).map((r) => r.id as string);
    await supabase.from("auction_state").delete().in("id", dupeIds);
  }

  if (rows && rows.length >= 1) {
    return rows[0].id as string;
  }

  // No row → create the singleton
  const { data: created, error: insErr } = await supabase
    .from("auction_state")
    .insert({ status: "idle", current_player_id: null })
    .select("id")
    .single();

  if (insErr || !created) {
    throw new Error(`auction_state insert failed: ${insErr?.message ?? "unknown"}`);
  }
  return created.id as string;
}

/**
 * Returns the canonical auction_state row with the current_player join populated.
 */
export async function getAuctionState(supabase: SupabaseClient): Promise<AuctionState> {
  const rowId = await ensureAuctionStateRowId(supabase);
  const { data, error } = await supabase
    .from("auction_state")
    .select(STATE_SELECT)
    .eq("id", rowId)
    .single();
  if (error || !data) {
    throw new Error(`auction_state load failed: ${error?.message ?? "no data"}`);
  }
  return data as AuctionState;
}
