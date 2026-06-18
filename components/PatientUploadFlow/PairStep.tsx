"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft, QrCode, Keyboard, Loader2 } from "lucide-react";

interface Props {
  name: string;
  phone: string;
  rawText: string;
  metrics: { key: string; value: number }[];
  onPaired: (doctorName: string) => void;
  onBack: () => void;
}

export default function PairStep({ name, phone, rawText, metrics, onPaired, onBack }: Props) {
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "qr-reader-region";
  const submittedRef = useRef(false);

  async function submitPairing(doctorToken: string) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setError(null);

    try {
      await stopScanner();
      const res = await fetch("/api/scans/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorToken,
          patient: { name, phone },
          metrics,
          rawText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Pairing failed. Please try again.");
        setSubmitting(false);
        submittedRef.current = false;
        if (mode === "scan") startScanner();
        return;
      }
      onPaired(data.doctorName || "your doctor");
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Check your connection and try again.");
      setSubmitting(false);
      submittedRef.current = false;
    }
  }

  async function startScanner() {
    setError(null);
    try {
      const el = document.getElementById(regionId);
      if (!el) return;
      const scanner = new Html5Qrcode(regionId, { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          submitPairing(decodedText.trim());
        },
        () => {
          /* ignore per-frame decode errors */
        }
      );
    } catch (err) {
      console.error("Scanner start failed:", err);
      setError(
        "Couldn't open the camera. Use the code option below to pair manually."
      );
      setMode("manual");
    }
  }

  async function stopScanner() {
    const s = scannerRef.current;
    if (s) {
      try {
        if (s.isScanning) await s.stop();
        await s.clear();
      } catch {
        /* noop */
      }
      scannerRef.current = null;
    }
  }

  useEffect(() => {
    if (mode === "scan") {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <section aria-labelledby="pair-h">
      <h2 id="pair-h" className="font-heading text-lg text-ink">
        Pair with your doctor
      </h2>
      <p className="mt-1 text-sm text-slate">
        Scan the QR code on your doctor's screen, or type their pairing code.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-md border border-coral/40 bg-coral/10 px-3 py-2 text-sm text-coral"
        >
          {error}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setMode("scan")}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm ${
            mode === "scan" ? "border-teal bg-teal/10 text-teal" : "border-slate/40 text-ink"
          }`}
        >
          <QrCode size={16} /> Scan QR
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm ${
            mode === "manual" ? "border-teal bg-teal/10 text-teal" : "border-slate/40 text-ink"
          }`}
        >
          <Keyboard size={16} /> Enter code
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-slate/30 bg-white p-4">
        {submitting ? (
          <div className="flex flex-col items-center py-8 text-teal" role="status">
            <Loader2 className="animate-spin" size={28} />
            <p className="mt-2 text-sm">Sending to your doctor…</p>
          </div>
        ) : mode === "scan" ? (
          <div>
            <div
              id={regionId}
              className="mx-auto w-full max-w-xs overflow-hidden rounded-lg"
            />
            <p className="mt-3 text-center text-xs text-slate">
              Point your camera at the QR code shown on the doctor's dashboard.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!manualCode.trim()) {
                setError("Enter the doctor's pairing code.");
                return;
              }
              submitPairing(manualCode.trim());
            }}
          >
            <label htmlFor="code" className="block text-sm font-medium text-ink">
              Pairing code
            </label>
            <input
              id="code"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              className="num mt-1 w-full rounded-md border border-slate/40 px-3 py-2 text-lg tracking-widest focus:border-teal"
              placeholder="e.g. 3F9A12C8E0"
              autoComplete="off"
            />
            <button
              type="submit"
              className="mt-3 w-full rounded-lg bg-teal px-4 py-3 font-medium text-white hover:bg-teal/90"
            >
              Send to doctor
            </button>
          </form>
        )}
      </div>

      <button
        onClick={() => {
          stopScanner();
          onBack();
        }}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate/40 px-4 py-2 text-sm text-ink hover:border-teal"
      >
        <ArrowLeft size={16} /> Back to review
      </button>
    </section>
  );
}
