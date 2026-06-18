// Canonical metric reference table + status logic.
// Shared between the OCR pipeline, the API, the UI and the PDF.

export type MetricStatus = "normal" | "borderline" | "critical";

export interface MetricReference {
  label: string;
  aliases: string[];
  unit: string;
  min: number;
  max: number;
}

export interface ExtractedMetric {
  key: string;
  label: string;
  value: number;
  unit: string;
  refMin: number;
  refMax: number;
  status: MetricStatus;
}

export const METRIC_REFERENCE: Record<string, MetricReference> = {
  fbs: {
    label: "Fasting Blood Sugar",
    aliases: [
      "fasting blood sugar",
      "fbs",
      "glucose fasting",
      "blood sugar fasting",
      "blood glucose fasting",
    ],
    unit: "mg/dL",
    min: 70,
    max: 99,
  },
  total_cholesterol: {
    label: "Total Cholesterol",
    aliases: ["total cholesterol", "cholesterol total", "cholesterol"],
    unit: "mg/dL",
    min: 125,
    max: 200,
  },
  hdl: {
    label: "HDL Cholesterol",
    aliases: ["hdl cholesterol", "hdl", "high density lipoprotein"],
    unit: "mg/dL",
    min: 40,
    max: 60,
  },
  ldl: {
    label: "LDL Cholesterol",
    aliases: ["ldl cholesterol", "ldl", "low density lipoprotein"],
    unit: "mg/dL",
    min: 0,
    max: 100,
  },
  triglycerides: {
    label: "Triglycerides",
    aliases: ["triglycerides", "tg"],
    unit: "mg/dL",
    min: 0,
    max: 150,
  },
  hemoglobin: {
    label: "Hemoglobin",
    aliases: ["hemoglobin", "haemoglobin", "hb"],
    unit: "g/dL",
    min: 12.0,
    max: 17.0,
  },
};

// Stable display order for the 6-card grid.
export const METRIC_ORDER = [
  "fbs",
  "total_cholesterol",
  "hdl",
  "ldl",
  "triglycerides",
  "hemoglobin",
] as const;

export function getStatus(value: number, min: number, max: number): MetricStatus {
  if (value >= min && value <= max) return "normal";
  const tolerance = (max - min) * 0.1;
  if (value > max && value <= max + tolerance) return "borderline";
  if (value < min && value >= min - tolerance) return "borderline";
  return "critical";
}

// Aliases sorted longest-first so "hdl cholesterol" wins over "cholesterol"
// when a single line could match several aliases.
interface AliasEntry {
  key: string;
  alias: string;
}

const ALIAS_INDEX: AliasEntry[] = Object.entries(METRIC_REFERENCE)
  .flatMap(([key, ref]) => ref.aliases.map((alias) => ({ key, alias })))
  .sort((a, b) => b.alias.length - a.alias.length);

// Normalize a line: lowercase, collapse separators/extra whitespace.
function normalizeLine(line: string): string {
  return line
    .toLowerCase()
    .replace(/[|:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Pull the first plausible number from a line.
function firstNumber(line: string): number | null {
  const match = line.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const n = parseFloat(match[0]);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse raw OCR text into structured metrics.
 * Each canonical metric is captured at most once (first match wins).
 */
export function parseMetricsFromText(rawText: string): ExtractedMetric[] {
  const lines = rawText.split(/\r?\n/);
  const found: Record<string, ExtractedMetric> = {};

  for (const rawLine of lines) {
    const norm = normalizeLine(rawLine);
    if (!norm) continue;

    for (const { key, alias } of ALIAS_INDEX) {
      if (found[key]) continue; // already captured this metric
      if (!norm.includes(alias)) continue;

      // Read the number that appears *after* the alias text where possible,
      // otherwise the first number on the line.
      const afterAlias = norm.slice(norm.indexOf(alias) + alias.length);
      const value = firstNumber(afterAlias) ?? firstNumber(norm);
      if (value === null) continue;

      const ref = METRIC_REFERENCE[key];
      found[key] = {
        key,
        label: ref.label,
        value,
        unit: ref.unit,
        refMin: ref.min,
        refMax: ref.max,
        status: getStatus(value, ref.min, ref.max),
      };
      break; // a line maps to a single metric
    }
  }

  // Return in canonical order.
  return METRIC_ORDER.filter((k) => found[k]).map((k) => found[k]);
}

export function statusColor(status: MetricStatus): string {
  switch (status) {
    case "critical":
      return "#D14B3D";
    case "borderline":
      return "#D69A2D";
    default:
      return "#2F7A6F";
  }
}
