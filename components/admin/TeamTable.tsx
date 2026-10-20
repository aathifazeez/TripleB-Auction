"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import type { Team } from "@/types";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { formatPoints } from "@/lib/utils";

interface TeamWithPlayers extends Team {
  players?: { id: string; status: string }[];
}

export default function TeamTable({ teams }: { teams: TeamWithPlayers[] }) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);
  const [resetTarget,  setResetTarget]  = useState<Team | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [resetting, setResetting]       = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/teams/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    router.refresh();
  };

  const handleResetBudget = async () => {
    if (!resetTarget) return;
    setResetting(true);
    await fetch(`/api/teams/${resetTarget.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ budget_used: 0 }),
    });
    setResetting(false);
    setResetTarget(null);
    router.refresh();
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <Link href="/admin/teams/new">
          <Button variant="primary"><Plus size={16} /> Add Team</Button>
        </Link>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--color-surface-raised)", borderBottom: "1px solid var(--color-border)" }}>
              {["Team", "Budget", "Used", "Remaining", "Players", ""].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                  No teams yet. Add your first team.
                </td>
              </tr>
            ) : (
              teams.map((team, i) => {
                const playerCount = team.players?.length ?? 0;
                const soldCount   = team.players?.filter((p) => p.status === "sold").length ?? 0;
                const remaining   = team.budget - team.budget_used;
                const pct         = team.budget > 0 ? (team.budget_used / team.budget) * 100 : 0;

                return (
                  <tr
                    key={team.id}
                    style={{
                      borderBottom: i < teams.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
                      background: "var(--color-surface)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-raised)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-surface)")}
                  >
                    {/* Team name + color */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-8 rounded-sm shrink-0" style={{ background: team.color_hex }} />
                        <span className="font-semibold" style={{ color: "var(--color-text)" }}>{team.name}</span>
                      </div>
                    </td>
                    {/* Budget */}
                    <td className="px-5 py-4 tabular-nums" style={{ color: "var(--color-text-muted)" }}>
                      {formatPoints(team.budget)}
                    </td>
                    {/* Used + bar */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs tabular-nums" style={{ color: "var(--color-text-muted)" }}>
                          {formatPoints(team.budget_used)}
                        </span>
                        <div className="w-24 h-1 rounded-full" style={{ background: "var(--color-border)" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(pct, 100)}%`, background: pct > 80 ? "var(--color-error)" : "var(--color-gold)" }}
                          />
                        </div>
                      </div>
                    </td>
                    {/* Remaining */}
                    <td className="px-5 py-4 tabular-nums font-semibold" style={{ color: remaining < 0 ? "var(--color-error)" : "var(--color-success)" }}>
                      {formatPoints(remaining)}
                    </td>
                    {/* Players */}
                    <td className="px-5 py-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {soldCount} sold / {playerCount} total
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setResetTarget(team)}
                          title="Reset budget"
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "var(--color-text-muted)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-gold)"; e.currentTarget.style.background = "rgba(245,158,11,0.1)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.background = "transparent"; }}
                        >
                          <RotateCcw size={14} />
                        </button>
                        <Link href={`/admin/teams/${team.id}`}>
                          <button
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: "var(--color-text-muted)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-gold)"; e.currentTarget.style.background = "rgba(245,158,11,0.1)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.background = "transparent"; }}
                          >
                            <Pencil size={14} />
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(team)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "var(--color-text-muted)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-error)"; e.currentTarget.style.background = "var(--color-error-dim)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-muted)"; e.currentTarget.style.background = "transparent"; }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Team" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Delete{" "}
            <span className="font-semibold" style={{ color: "var(--color-text)" }}>{deleteTarget?.name}</span>?
            This will unassign all players from this team.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!resetTarget} onClose={() => setResetTarget(null)} title="Reset Budget" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Reset <span className="font-semibold" style={{ color: "var(--color-text)" }}>{resetTarget?.name}</span>'s
            budget used back to <span style={{ color: "var(--color-gold)" }}>0</span>?
            This only resets the spend counter — it does not change player statuses.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setResetTarget(null)}>Cancel</Button>
            <Button variant="primary" loading={resetting} onClick={handleResetBudget}>Reset Budget</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
