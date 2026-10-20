import { getServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getServerSupabase();
  const start    = Date.now();

  try {
    const [stateRes, playersRes, teamsRes] = await Promise.all([
      supabase.from("auction_state").select("id", { count: "exact", head: true }),
      supabase.from("players").select("id",       { count: "exact", head: true }),
      supabase.from("teams").select("id",         { count: "exact", head: true }),
    ]);

    const latencyMs = Date.now() - start;

    if (stateRes.error || playersRes.error || teamsRes.error) {
      return Response.json(
        {
          ok:        false,
          latencyMs,
          errors: {
            auction_state: stateRes.error?.message ?? null,
            players:       playersRes.error?.message ?? null,
            teams:         teamsRes.error?.message ?? null,
          },
        },
        { status: 503 }
      );
    }

    const stateCount = stateRes.count ?? 0;
    const warnings: string[] = [];
    if (stateCount > 1) warnings.push(`auction_state has ${stateCount} rows — should be exactly 1`);
    if (stateCount === 0) warnings.push("auction_state has no rows yet");

    return Response.json({
      ok:        warnings.length === 0,
      latencyMs,
      counts: {
        auction_state: stateCount,
        players:       playersRes.count ?? 0,
        teams:         teamsRes.count ?? 0,
      },
      warnings,
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
