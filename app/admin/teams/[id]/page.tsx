import { notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import TeamForm from "@/components/admin/TeamForm";

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getServerSupabase();
  const { data: team } = await supabase.from("teams").select("*").eq("id", id).single();

  if (!team) notFound();

  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide" style={{ color: "var(--color-gold)" }}>
          EDIT TEAM
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          {team.name}
        </p>
      </div>
      <TeamForm initialData={team} />
    </div>
  );
}
