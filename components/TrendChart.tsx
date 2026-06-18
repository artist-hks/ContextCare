"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

export interface TrendPoint {
  date: string;
  value: number;
}

interface Props {
  label: string;
  unit: string;
  refMin: number;
  refMax: number;
  data: TrendPoint[];
}

export default function TrendChart({ label, unit, refMin, refMax, data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-slate/20 bg-white text-sm text-slate">
        No readings yet for {label}.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate/20 bg-white p-3">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="font-heading text-base text-ink">{label} trend</h3>
        <span className="num text-xs text-slate">
          Normal {refMin}–{refMax} {unit}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2DCCD" />
          <ReferenceArea y1={refMin} y2={refMax} fill="#2F7A6F" fillOpacity={0.08} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8C97A1" }} />
          <YAxis tick={{ fontSize: 11, fill: "#8C97A1" }} width={40} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #E2DCCD",
              fontSize: 12,
            }}
            formatter={(v: number) => [`${v} ${unit}`, label]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2F7A6F"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#102A3D" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
