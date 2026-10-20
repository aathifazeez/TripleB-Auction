"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, UserCircle, Loader2 } from "lucide-react";
import type { Player, PlayerRole } from "@/types";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const ROLE_OPTS: { label: string; value: PlayerRole }[] = [
  { label: "Batsman",       value: "batsman"      },
  { label: "Bowler",        value: "bowler"       },
  { label: "All-Rounder",   value: "allrounder"   },
  { label: "Wicket-Keeper", value: "wicketkeeper" },
];

interface Props {
  initialData?: Player;
}

export default function PlayerForm({ initialData }: Props) {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name,         setName]         = useState(initialData?.name          ?? "");
  const [role,         setRole]         = useState<PlayerRole>(initialData?.role ?? "batsman");
  const [basePoints,   setBasePoints]   = useState(String(initialData?.base_points  ?? ""));
  const [auctionOrder, setAuctionOrder] = useState(String(initialData?.auction_order ?? ""));
  const [photoUrl,     setPhotoUrl]     = useState<string | null>(initialData?.photo_url ?? null);
  const [uploading,    setUploading]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res  = await fetch("/api/upload", { method: "POST", body: form });
    const json = await res.json();
    setUploading(false);
    if (json.url) setPhotoUrl(json.url);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim())           errs.name       = "Name is required";
    if (!basePoints.trim())     errs.basePoints = "Base points is required";
    if (Number(basePoints) < 0) errs.basePoints = "Must be ≥ 0";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    const payload = {
      name:          name.trim(),
      role,
      base_points:   Number(basePoints),
      auction_order: auctionOrder ? Number(auctionOrder) : null,
      photo_url:     photoUrl,
    };
    const url    = initialData ? `/api/players/${initialData.id}` : "/api/players";
    const method = initialData ? "PATCH" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    router.push("/admin/players");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-lg">
      {/* Photo upload */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
          Photo
        </span>
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
            style={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)" }}
          >
            {uploading ? (
              <Loader2 size={20} className="animate-spin" style={{ color: "var(--color-gold)" }} />
            ) : photoUrl ? (
              <Image src={photoUrl} alt="Player" width={80} height={80} className="object-cover w-full h-full" />
            ) : (
              <UserCircle size={32} style={{ color: "var(--color-text-subtle)" }} />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors"
            style={{
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            <Upload size={14} />
            {photoUrl ? "Change Photo" : "Upload Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
      </div>

      <Input
        label="Player Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        placeholder="e.g. Virat Kohli"
      />

      {/* Role select */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as PlayerRole)}
          className="w-full rounded-lg px-4 py-2.5 text-sm outline-none"
          style={{
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          {ROLE_OPTS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <Input
        label="Base Points"
        type="number"
        min={0}
        value={basePoints}
        onChange={(e) => setBasePoints(e.target.value)}
        error={errors.basePoints}
        placeholder="e.g. 500"
      />

      <Input
        label="Auction Order (optional)"
        type="number"
        min={1}
        value={auctionOrder}
        onChange={(e) => setAuctionOrder(e.target.value)}
        hint="Lower numbers are auctioned first"
        placeholder="e.g. 1"
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" variant="primary" loading={saving}>
          {initialData ? "Save Changes" : "Add Player"}
        </Button>
      </div>
    </form>
  );
}
