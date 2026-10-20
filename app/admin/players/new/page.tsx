import PlayerForm from "@/components/admin/PlayerForm";

export default function NewPlayerPage() {
  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide" style={{ color: "var(--color-gold)" }}>
          ADD PLAYER
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Add a new player to the auction pool
        </p>
      </div>
      <PlayerForm />
    </div>
  );
}
