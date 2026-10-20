import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServerSupabase();

  const { error } = await supabase
    .from("players")
    .update({ status: "pending", team_id: null, sold_for: null, auction_order: null })
    .neq("id", "00000000-0000-0000-0000-000000000000"); // match all rows

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
