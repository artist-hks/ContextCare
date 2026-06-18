"use client";

// Shows the uploaded photo faintly with a teal scan-line sweeping down,
// visualizing the OCR step actually happening.
export default function ScanAnimation({ preview }: { preview: string | null }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-xs overflow-hidden rounded-lg border border-slate/30 bg-white">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Your lab report being read"
            className="w-full opacity-40"
          />
        ) : (
          <div className="h-64 w-full bg-slate/10" />
        )}
        <div
          className="pointer-events-none absolute left-0 right-0 h-1 bg-teal shadow-[0_0_12px_2px_rgba(47,122,111,0.6)] animate-scanline"
          style={{ top: 0 }}
          aria-hidden
        />
      </div>
      <p className="mt-4 text-sm font-medium text-ink" role="status">
        Reading your report…
      </p>
      <p className="mt-1 text-xs text-slate">Extracting diagnostic values</p>
    </div>
  );
}
