"use client";

import { Check } from "lucide-react";

export type Step = "upload" | "review" | "pair" | "done";

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "review", label: "Review" },
  { key: "pair", label: "Pair" },
  { key: "done", label: "Done" },
];

export default function Stepper({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <nav aria-label="Progress" className="mb-6">
      <ol className="flex items-center justify-between gap-1">
        {STEPS.map((s, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={s.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    done
                      ? "bg-teal text-white"
                      : active
                        ? "bg-ink text-white"
                        : "bg-slate/20 text-slate"
                  }`}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check size={14} /> : i + 1}
                </span>
                <span
                  className={`text-[11px] ${active ? "font-semibold text-ink" : "text-slate"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-1 h-px flex-1 ${i < currentIndex ? "bg-teal" : "bg-slate/30"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
