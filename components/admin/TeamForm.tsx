"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Team } from "@/types";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const PRESET_COLORS = [
  "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6",
  "#10b981", "#f97316", "#ec4899", "#06b6d4",
];

interface Props {
  initialData?: Team;
}

export default function TeamForm({ initialData }: Props) {
  const router = useRouter();

  const [name,     setName]     = useState(initialData?.name      ?? "");
  const [budget,   setBudget]   = useState(String(initialData?.budget ?? ""));
  const [colorHex, setColorHex] = useState(initialData?.color_hex  ?? "#f59e0b");
  const [saving,   setSaving]   = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim())         errs.name   = "Team name is required";
    if (!budget.trim())       errs.budget = "Budget is required";
    if (Number(budget) <= 0)  errs.budget = "Must be greater than 0";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    const payload = { name: name.trim(), budget: Number(budget), color_hex: colorHex };
    const url    = initialData ? `/api/teams/${initialData.id}` : "/api/teams";
    const method = initialData ? "PATCH" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    router.push("/admin/teams");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-lg">
      <Input
        label="Team Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="e.g. Chennai Super Kings"
      />

      <Input
        label="Budget (points)"
        type="number"
        min={1}
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        error={errors.budget}
        placeholder="e.g. 5000"
      />

      {/* Team color */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
          Team Color
        </span>
        <div className="flex items-center gap-2.5 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColorHex(c)}
              className="w-8 h-8 rounded-lg transition-all"
              style={{
                background: c,
                outline: colorHex === c ? "3px solid white" : "none",
                outlineOffset: "2px",
              }}
            />
          ))}
          {/* Custom color */}
          <div className="flex items-center gap-2 ml-1">
            <input
              type="color"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              title="Custom color"
            />
            <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>{colorHex}</span>
          </div>
        </div>

        {/* Live preview */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg mt-1"
          style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)" }}
        >
          <div className="w-3 h-8 rounded-sm shrink-0" style={{ background: colorHex }} />
          <span className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
            {name || "Team Preview"}
          </span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" variant="primary" loading={saving}>
          {initialData ? "Save Changes" : "Add Team"}
        </Button>
      </div>
    </form>
  );
}
