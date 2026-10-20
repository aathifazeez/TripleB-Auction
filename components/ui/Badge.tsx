import { getRoleLabel, getRoleColor, getRoleDimColor } from "@/lib/utils";
import type { PlayerRole, PlayerStatus } from "@/types";

export function RoleBadge({ role }: { role: PlayerRole }) {
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
      style={{ color: getRoleColor(role), background: getRoleDimColor(role) }}
    >
      {getRoleLabel(role)}
    </span>
  );
}

export function StatusBadge({ status }: { status: PlayerStatus }) {
  const styles: Record<PlayerStatus, React.CSSProperties> = {
    pending: { color: "var(--color-text-muted)", background: "var(--color-border)" },
    sold:    { color: "var(--color-success)",    background: "var(--color-success-dim)" },
    unsold:  { color: "var(--color-error)",      background: "var(--color-error-dim)" },
  };
  const labels: Record<PlayerStatus, string> = {
    pending: "Pending",
    sold:    "Sold",
    unsold:  "Unsold",
  };

  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
      style={styles[status]}
    >
      {labels[status]}
    </span>
  );
}

export default function Badge({ role, status }: { role?: PlayerRole; status?: PlayerStatus }) {
  if (role) return <RoleBadge role={role} />;
  if (status) return <StatusBadge status={status} />;
  return null;
}
