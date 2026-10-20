import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  STATE_SELECT,
  ensureAuctionStateRowId,
} from "@/lib/supabase/auction-state";
import { getNextMinBid, isValidBid } from "@/lib/auction/bidding";
import { NextRequest } from "next/server";

/**
 * Records a single bid increment.
 *
 * Body: { team_id: string, amount: number }
 *
 * Validates:
 *  - auction is in the "bidding" status
 *  - amount >= next_min_bid (per increment table)
 *  - team has enough remaining budget (budget - budget_used >= amount)
 *
 * Updates auction_state: current_bid, current_bid_team, next_min_bid
 * (next_min_bid is auto-calculated from the new current_bid).
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body     = await req.json();
    const supabase = getServerSupabase();

    const { team_id, amount } = body ?? {};
    if (!team_id) {
      return Response.json({ error: "team_id is required" }, { status: 400 });
    }
    const proposed = Number(amount);
    if (!Number.isFinite(proposed) || proposed <= 0) {
      return Response.json({ error: "amount must be a positive number" }, { status: 400 });
    }

    const rowId = await ensureAuctionStateRowId(supabase);

    // Load current state — we need status + current bid to validate against
    const { data: stateRow, error: stateErr } = await supabase
      .from("auction_state")
      .select("status, current_bid, current_player_id")
      .eq("id", rowId)
      .single();

    if (stateErr || !stateRow) {
      return Response.json(
        { error: `state read failed: ${stateErr?.message ?? "no data"}` },
        { status: 500 },
      );
    }
    if (stateRow.status !== "bidding") {
      return Response.json(
        { error: `cannot bid — auction status is "${stateRow.status}"` },
        { status: 400 },
      );
    }
    if (!stateRow.current_player_id) {
      return Response.json({ error: "no player currently up for auction" }, { status: 400 });
    }

    const currentBid = Number(stateRow.current_bid) || 0;
    if (!isValidBid(currentBid, proposed)) {
      const required = getNextMinBid(currentBid);
      return Response.json(
        { error: `bid too low — minimum is ${required}` },
        { status: 400 },
      );
    }

    // Confirm the bidding team has enough remaining budget
    const { data: team, error: teamErr } = await supabase
      .from("teams")
      .select("id, budget, budget_used")
      .eq("id", team_id)
      .single();

    if (teamErr || !team) {
      return Response.json(
        { error: `team not found: ${teamErr?.message ?? team_id}` },
        { status: 400 },
      );
    }
    const remaining = (team.budget ?? 0) - (team.budget_used ?? 0);
    if (proposed > remaining) {
      return Response.json(
        { error: `team only has ${remaining} pts remaining` },
        { status: 400 },
      );
    }

    // Apply the bid
    const { data, error } = await supabase
      .from("auction_state")
      .update({
        current_bid:      proposed,
        current_bid_team: team_id,
        next_min_bid:     getNextMinBid(proposed),
      })
      .eq("id", rowId)
      .select(STATE_SELECT)
      .single();

    if (error || !data) {
      return Response.json(
        { error: `bid update failed: ${error?.message ?? "no data"}` },
        { status: 500 },
      );
    }
    return Response.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
