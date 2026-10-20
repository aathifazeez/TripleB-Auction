import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function GET() {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("teams")
    .select("*, players(id, status)")
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, budget, color_hex, logo_url } = body;

  if (!name || !budget) {
    return Response.json({ error: "name and budget are required" }, { status: 400 });
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("teams")
    .insert({ name, budget: Number(budget), color_hex: color_hex ?? "#1a1a2e", logo_url })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
