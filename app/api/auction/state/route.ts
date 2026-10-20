import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import {
  STATE_SELECT,
  ensureAuctionStateRowId,
  getAuctionState,
} from "@/lib/supabase/auction-state";
import { getMinIncrement } from "@/lib/auction/bidding";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const supabase = getServerSupabase();
    const state = await getAuctionState(supabase);
    return Response.json(state);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body     = await req.json();
    const supabase = getServerSupabase();

    if (!body.status) {
      return Response.json({ error: "status is required" }, { status: 400 });
    }

    const update: Record<string, unknown> = { status: body.status };

    if (body.status === "rolling") {
      const { data: pending, error: pendErr } = await supabase
        .from("players")
        .select("id")
        .eq("status", "pending")
        .order("auction_order", { ascending: true, nullsFirst: false });

      if (pendErr) {
        return Response.json({ error: `players query failed: ${pendErr.message}` }, { status: 500 });
      }
      if (!pending?.length) {
        return Response.json({ error: "No pending players left" }, { status: 400 });
      }
      const picked = pending[Math.floor(Math.random() * pending.length)];
      update.current_player_id = picked.id;
      // Reset bid state — the new player has not received any bids yet
      update.current_bid      = 0;
      update.current_bid_team = null;
      update.next_min_bid     = 0;
    } else if (body.status === "bidding") {
      // Seed bid columns from the current player's base_points so the
      // ticker has a sensible starting floor as soon as bidding opens.
      const rowId = await ensureAuctionStateRowId(supabase);
      const { data: stateRow, error: stateErr } = await supabase
        .from("auction_state")
        .select("current_player_id")
        .eq("id", rowId)
        .single();
      if (stateErr || !stateRow?.current_player_id) {
        return Response.json(
          { error: `cannot open bidding — no current player (${stateErr?.message ?? "null"})` },
          { status: 400 },
        );
      }

      const { data: player, error: playerErr } = await supabase
        .from("players")
        .select("base_points")
        .eq("id", stateRow.current_player_id)
        .single();
      if (playerErr || !player) {
        return Response.json(
          { error: `current player not found: ${playerErr?.message ?? "null"}` },
          { status: 500 },
        );
      }

      const base = Number(player.base_points) || 0;
      update.current_bid      = base;
      update.current_bid_team = null;
      update.next_min_bid     = base + getMinIncrement(base);
    } else if (body.status === "idle" || body.status === "ended") {
      update.current_player_id = null;
      update.current_bid       = 0;
      update.current_bid_team  = null;
      update.next_min_bid      = 0;
    }

    const rowId = await ensureAuctionStateRowId(supabase);

    const { data, error } = await supabase
      .from("auction_state")
      .update(update)
      .eq("id", rowId)
      .select(STATE_SELECT)
      .single();

    if (error) {
      return Response.json({ error: `update failed: ${error.message}` }, { status: 500 });
    }
    return Response.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
