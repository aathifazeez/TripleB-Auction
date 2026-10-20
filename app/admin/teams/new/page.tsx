import TeamForm from "@/components/admin/TeamForm";

export default function NewTeamPage() {
  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide" style={{ color: "var(--color-gold)" }}>
          ADD TEAM
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Create a new team for the auction
        </p>
      </div>
      <TeamForm />
    </div>
  );
}
