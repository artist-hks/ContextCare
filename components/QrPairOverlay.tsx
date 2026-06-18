"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  // Becomes true when a scan:created event arrives while overlay is open.
  pairedPatientName: string | null;
}

export default function QrPairOverlay({ open, onClose, pairedPatientName }: Props) {
  const [qr, setQr] = useState<{ code: string; qrDataUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setQr(null);
    setError(null);
    fetch("/api/doctor/qr")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setQr(d);
      })
      .catch(() => setError("Couldn't load your pairing code."));
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Pair a patient"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate hover:text-ink"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        {pairedPatientName ? (
          <div className="py-6 animate-develop">
            <CheckCircle2 className="mx-auto text-teal" size={56} />
            <h2 className="mt-3 font-heading text-2xl text-ink">Paired!</h2>
            <p className="mt-1 text-sm text-slate">
              {pairedPatientName}'s results are now on your dashboard.
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-lg bg-teal px-5 py-2.5 font-medium text-white hover:bg-teal/90"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-heading text-2xl text-ink">Pair a patient</h2>
            <p className="mt-1 text-sm text-slate">
              Ask the patient to scan this code, or read them the code below.
            </p>

            <div className="mt-5 flex min-h-[280px] items-center justify-center">
              {error ? (
                <p className="text-sm text-coral">{error}</p>
              ) : qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qr.qrDataUrl}
                  alt="Pairing QR code"
                  className="rounded-lg border border-slate/20"
                  width={280}
                  height={280}
                />
              ) : (
                <Loader2 className="animate-spin text-teal" size={32} />
              )}
            </div>

            {qr && (
              <div className="mt-4">
                <p className="text-xs text-slate">Pairing code</p>
                <p className="num mt-1 text-2xl font-semibold tracking-widest text-ink">
                  {qr.code}
                </p>
              </div>
            )}
            <p className="mt-4 text-xs text-slate">
              This window updates automatically the moment a patient pairs.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
