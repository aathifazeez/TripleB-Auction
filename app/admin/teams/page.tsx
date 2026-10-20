import { getServerSupabase } from "@/lib/supabase/server";
import TeamTable from "@/components/admin/TeamTable";

export default async function TeamsPage() {
  const supabase = getServerSupabase();
  const { data: teams } = await supabase
    .from("teams")
    .select("*, players(id, status)")
    .order("created_at", { ascending: true });

  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide" style={{ color: "var(--color-gold)" }}>
          TEAMS
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Manage auction teams and budgets
        </p>
      </div>
      <TeamTable teams={teams ?? []} />
    </div>
  );
}
