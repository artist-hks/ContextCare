"use client";

import { AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import type { MetricStatus } from "@/lib/metrics";

interface Props {
  label: string;
  value: number;
  unit: string;
  refMin: number;
  refMax: number;
  status: MetricStatus;
  selected?: boolean;
  onClick?: () => void;
}

const STATUS_META: Record<
  MetricStatus,
  { color: string; bg: string; border: string; label: string; Icon: typeof CheckCircle2 }
> = {
  normal: {
    color: "text-teal",
    bg: "bg-teal/10",
    border: "border-teal/40",
    label: "Normal",
    Icon: CheckCircle2,
  },
  borderline: {
    color: "text-amber",
    bg: "bg-amber/10",
    border: "border-amber/40",
    label: "Borderline",
    Icon: AlertCircle,
  },
  critical: {
    color: "text-coral",
    bg: "bg-coral/10",
    border: "border-coral/40",
    label: "Critical",
    Icon: AlertTriangle,
  },
};

export default function MetricCard({
  label,
  value,
  unit,
  refMin,
  refMax,
  status,
  selected,
  onClick,
}: Props) {
  const meta = STATUS_META[status];
  const Icon = meta.Icon;
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={`torn-top w-full text-left rounded-lg border bg-white p-4 shadow-sm transition ${
        selected ? "border-teal ring-2 ring-teal/40" : "border-slate/20 hover:border-teal/50"
      }`}
      aria-pressed={onClick ? selected : undefined}
    >
      <div className="flex items-start justify-between gap-2 pt-1">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${meta.bg} ${meta.color} ${meta.border} border`}
        >
          <Icon size={12} />
          {meta.label}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`num text-2xl font-semibold ${meta.color}`}>{value}</span>
        <span className="text-sm text-slate">{unit}</span>
      </div>
      <div className="mt-1 num text-xs text-slate">
        Ref {refMin}–{refMax} {unit}
      </div>
    </Tag>
  );
}
