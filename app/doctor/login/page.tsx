"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Delete, Stethoscope, Loader2 } from "lucide-react";

export default function DoctorLogin() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function press(digit: string) {
    setError(null);
    if (pin.length >= 6) return;
    setPin((p) => p + digit);
  }
  function backspace() {
    setError(null);
    setPin((p) => p.slice(0, -1));
  }

  async function submit() {
    if (pin.length < 4) {
      setError("Enter your 4–6 digit PIN.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/doctor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setPin("");
        setLoading(false);
        return;
      }
      router.push("/doctor/dashboard");
    } catch {
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-slate/30 bg-white p-6 shadow-sm">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal/10 text-teal">
            <Stethoscope size={24} />
          </span>
          <h1 className="mt-3 font-heading text-2xl text-ink">Doctor sign in</h1>
          <p className="mt-1 text-sm text-slate">Enter your PIN to open your dashboard.</p>
        </div>

        {/* PIN dots */}
        <div className="mt-6 flex justify-center gap-3" aria-label="PIN entry">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={`h-3.5 w-3.5 rounded-full border ${
                i < pin.length ? "border-teal bg-teal" : "border-slate/40 bg-transparent"
              }`}
            />
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-4 text-center text-sm text-coral">
            {error}
          </p>
        )}

        <div className="mt-6 grid grid-cols-3 gap-3">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              className="num rounded-xl border border-slate/30 py-4 text-xl font-medium text-ink transition hover:border-teal hover:bg-teal/5"
            >
              {k}
            </button>
          ))}
          <button
            onClick={backspace}
            className="flex items-center justify-center rounded-xl border border-slate/30 py-4 text-slate transition hover:border-teal"
            aria-label="Delete last digit"
          >
            <Delete size={20} />
          </button>
          <button
            onClick={() => press("0")}
            className="num rounded-xl border border-slate/30 py-4 text-xl font-medium text-ink transition hover:border-teal hover:bg-teal/5"
          >
            0
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex items-center justify-center rounded-xl bg-teal py-4 font-medium text-white transition hover:bg-teal/90 disabled:opacity-60"
            aria-label="Sign in"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Go"}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate">
          Demo PINs — Ananya Sharma: <span className="num">1234</span> · Rohan Mehta:{" "}
          <span className="num">5678</span> · Priya Nair: <span className="num">9012</span>
        </p>
      </div>
    </main>
  );
}
