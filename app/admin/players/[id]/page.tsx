import { notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import PlayerForm from "@/components/admin/PlayerForm";

export default async function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getServerSupabase();
  const { data: player } = await supabase.from("players").select("*").eq("id", id).single();

  if (!player) notFound();

  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide" style={{ color: "var(--color-gold)" }}>
          EDIT PLAYER
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          {player.name}
        </p>
      </div>
      <PlayerForm initialData={player} />
    </div>
  );
}
