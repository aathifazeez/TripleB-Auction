import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = getServerSupabase();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const role = searchParams.get("role");

  let query = supabase
    .from("players")
    .select("*, team:teams(id, name, color_hex)")
    .order("auction_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (status) query = query.eq("status", status);
  if (role)   query = query.eq("role", role);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, role, base_points, photo_url, auction_order } = body;

  if (!name || !role || !base_points) {
    return Response.json({ error: "name, role, base_points are required" }, { status: 400 });
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("players")
    .insert({ name, role, base_points: Number(base_points), photo_url, auction_order })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
