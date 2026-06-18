"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { Upload, Camera, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";
import Stepper, { type Step } from "./Stepper";
import ScanAnimation from "./ScanAnimation";
import PairStep from "./PairStep";
import { METRIC_ORDER, METRIC_REFERENCE, getStatus, type MetricStatus } from "@/lib/metrics";
import Disclaimer from "@/components/Disclaimer";

interface EditableMetric {
  key: string;
  label: string;
  value: number;
  unit: string;
  refMin: number;
  refMax: number;
  status: MetricStatus;
}

const statusBadge: Record<MetricStatus, string> = {
  normal: "bg-teal/10 text-teal border-teal/40",
  borderline: "bg-amber/10 text-amber border-amber/40",
  critical: "bg-coral/10 text-coral border-coral/40",
};

export default function PatientUploadFlow() {
  const [step, setStep] = useState<Step>("upload");
  const [preview, setPreview] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>("");
  const [metrics, setMetrics] = useState<EditableMetric[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [doctorName, setDoctorName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setWarning(null);

    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Please choose a photo of your lab report.");
      return;
    }

    // Local preview.
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setStep("review"); // we move into processing visual then review
    setStep("upload"); // keep on upload until processing shows
    // Show processing animation.
    setProcessing(true);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
      });

      const form = new FormData();
      form.append("image", compressed, file.name || "report.jpg");

      const res = await fetch("/api/scans/extract", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "We couldn't process that image. Please try again.");
        setProcessing(false);
        return;
      }

      setRawText(data.rawText || "");
      if (data.warning) setWarning(data.warning);

      // Build a full editable grid: start from extracted, fill missing with blanks.
      const extracted = new Map<string, any>(
        (data.metrics || []).map((m: any) => [m.key, m])
      );
      const grid: EditableMetric[] = METRIC_ORDER.map((key) => {
        const ref = METRIC_REFERENCE[key];
        const hit = extracted.get(key);
        const value = hit ? Number(hit.value) : NaN;
        return {
          key,
          label: ref.label,
          value: Number.isFinite(value) ? value : 0,
          unit: ref.unit,
          refMin: ref.min,
          refMax: ref.max,
          status: Number.isFinite(value) ? getStatus(value, ref.min, ref.max) : "normal",
        };
      });

      // Mark which were actually detected.
      const detected = new Set(extracted.keys());
      setDetectedKeys(detected);
      setMetrics(grid);
      setProcessing(false);
      setStep("review");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while reading the image. Please try again.");
      setProcessing(false);
    }
  }

  const [processing, setProcessing] = useState(false);
  const [detectedKeys, setDetectedKeys] = useState<Set<string>>(new Set());

  function updateValue(key: string, raw: string) {
    setMetrics((prev) =>
      prev.map((m) => {
        if (m.key !== key) return m;
        const value = raw === "" ? 0 : Number(raw);
        const safe = Number.isFinite(value) ? value : 0;
        return { ...m, value: safe, status: getStatus(safe, m.refMin, m.refMax) };
      })
    );
    // Once edited, treat as included.
    setDetectedKeys((prev) => new Set(prev).add(key));
  }

  function toggleInclude(key: string) {
    setDetectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function reset() {
    setStep("upload");
    setPreview(null);
    setRawText("");
    setMetrics([]);
    setName("");
    setPhone("");
    setError(null);
    setWarning(null);
    setDetectedKeys(new Set());
    setProcessing(false);
  }

  function goToPair() {
    setError(null);
    if (!name.trim() || !phone.trim()) {
      setError("Please enter your name and phone number to continue.");
      return;
    }
    const included = metrics.filter((m) => detectedKeys.has(m.key));
    if (included.length === 0) {
      setError("Add at least one value before continuing.");
      return;
    }
    setStep("pair");
  }

  const includedMetrics = metrics.filter((m) => detectedKeys.has(m.key));

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-6">
      <header className="mb-5 text-center">
        <h1 className="font-heading text-2xl font-semibold text-ink">ContextCare AI</h1>
        <p className="mt-1 text-sm text-slate">
          Photograph your lab report — we turn it into clean digital data for your doctor.
        </p>
      </header>

      <Stepper current={processing ? "upload" : step} />

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-coral/40 bg-coral/10 px-3 py-2 text-sm text-coral"
        >
          {error}
        </div>
      )}

      {/* UPLOAD / PROCESSING */}
      {step === "upload" && (
        <section aria-labelledby="upload-h">
          {processing ? (
            <ScanAnimation preview={preview} />
          ) : (
            <div className="rounded-xl border border-slate/30 bg-white p-6 text-center shadow-sm">
              <h2 id="upload-h" className="font-heading text-lg text-ink">
                Upload your lab report
              </h2>
              <p className="mt-1 text-sm text-slate">
                Take a photo or choose an image. JPG or PNG, up to 8MB.
              </p>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />

              <div className="mt-5 flex flex-col gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal px-4 py-3 font-medium text-white transition hover:bg-teal/90"
                >
                  <Camera size={18} /> Take / choose a photo
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate/40 px-4 py-2 text-sm text-ink transition hover:border-teal"
                >
                  <Upload size={16} /> Browse files
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* REVIEW */}
      {step === "review" && !processing && (
        <section aria-labelledby="review-h">
          <h2 id="review-h" className="font-heading text-lg text-ink">
            Review your values
          </h2>
          <p className="mt-1 text-sm text-slate">
            OCR can misread digits — tap any value to correct it. Uncheck rows that
            don't apply.
          </p>

          {warning && (
            <div className="mt-3 rounded-md border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-amber">
              {warning}
            </div>
          )}

          <ul className="mt-4 space-y-2">
            {metrics.map((m) => {
              const included = detectedKeys.has(m.key);
              return (
                <li
                  key={m.key}
                  className={`torn-top rounded-lg border bg-white p-3 ${
                    included ? "border-slate/30" : "border-slate/15 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <label className="flex items-center gap-2 text-sm font-medium text-ink">
                      <input
                        type="checkbox"
                        checked={included}
                        onChange={() => toggleInclude(m.key)}
                        className="h-4 w-4 accent-teal"
                        aria-label={`Include ${m.label}`}
                      />
                      {m.label}
                    </label>
                    {included && (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusBadge[m.status]}`}
                      >
                        {m.status}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={Number.isFinite(m.value) ? m.value : ""}
                      onChange={(e) => updateValue(m.key, e.target.value)}
                      disabled={!included}
                      className="num w-28 rounded-md border border-slate/40 px-2 py-1 text-lg text-ink focus:border-teal"
                    />
                    <span className="text-sm text-slate">{m.unit}</span>
                    <span className="num ml-auto text-xs text-slate">
                      Ref {m.refMin}–{m.refMax}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 space-y-3 rounded-lg border border-slate/30 bg-white p-4">
            <h3 className="text-sm font-semibold text-ink">Your details</h3>
            <p className="text-xs text-slate">
              Used only to link your repeat visits into one trend history. No account,
              no password.
            </p>
            <div>
              <label htmlFor="p-name" className="block text-xs font-medium text-ink">
                Full name
              </label>
              <input
                id="p-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate/40 px-3 py-2 text-sm focus:border-teal"
                placeholder="e.g. Rahul Verma"
              />
            </div>
            <div>
              <label htmlFor="p-phone" className="block text-xs font-medium text-ink">
                Phone number
              </label>
              <input
                id="p-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                className="mt-1 w-full rounded-md border border-slate/40 px-3 py-2 text-sm focus:border-teal"
                placeholder="e.g. 9810012345"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg border border-slate/40 px-4 py-2 text-sm text-ink hover:border-teal"
            >
              <RotateCcw size={16} /> Start over
            </button>
            <button
              onClick={goToPair}
              className="ml-auto inline-flex items-center gap-2 rounded-lg bg-teal px-4 py-2 font-medium text-white hover:bg-teal/90"
            >
              Looks right, continue <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* PAIR */}
      {step === "pair" && (
        <PairStep
          name={name}
          phone={phone}
          rawText={rawText}
          metrics={includedMetrics.map((m) => ({ key: m.key, value: m.value }))}
          onPaired={(docName) => {
            setDoctorName(docName);
            setStep("done");
          }}
          onBack={() => setStep("review")}
        />
      )}

      {/* DONE */}
      {step === "done" && (
        <section className="rounded-xl border border-teal/40 bg-white p-6 text-center shadow-sm">
          <CheckCircle2 className="mx-auto text-teal" size={48} />
          <h2 className="mt-3 font-heading text-xl text-ink">
            Sent to Dr. {doctorName}'s dashboard.
          </h2>
          <p className="mt-1 text-sm text-slate">
            Your results are now on your doctor's screen with trends and flags.
          </p>
          <button
            onClick={reset}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal px-4 py-3 font-medium text-white hover:bg-teal/90"
          >
            <Upload size={16} /> Upload another report
          </button>
        </section>
      )}

      <Disclaimer />
    </main>
  );
}
