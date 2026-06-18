"use client";

import { useState } from "react";
import { Send, Lock, Loader2 } from "lucide-react";

export interface NoteItem {
  id: string;
  content: string;
  createdAt: string;
}

interface Props {
  notes: NoteItem[];
  onAdd: (content: string) => Promise<void>;
}

function fmt(d: string) {
  return new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function NotesLedger({ notes, onAdd }: Props) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const content = text.trim();
    if (!content) return;
    setSaving(true);
    setError(null);
    try {
      await onAdd(content);
      setText("");
    } catch {
      setError("Couldn't save the note. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate/20 bg-white p-4" aria-labelledby="notes-h">
      <div className="flex items-center gap-2">
        <h3 id="notes-h" className="font-heading text-base text-ink">
          Clinical notes
        </h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate/10 px-2 py-0.5 text-[11px] text-slate">
          <Lock size={11} /> Append-only
        </span>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          placeholder="Add a note… (Enter to save)"
          className="flex-1 resize-none rounded-md border border-slate/40 px-3 py-2 text-sm focus:border-teal"
        />
        <button
          onClick={submit}
          disabled={saving || !text.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal px-3 py-2 text-sm font-medium text-white hover:bg-teal/90 disabled:opacity-50"
          aria-label="Add note"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-coral">{error}</p>}

      <ol className="mt-4 space-y-3">
        {notes.length === 0 ? (
          <li className="text-sm text-slate">
            No notes yet. Add the first observation for this patient above.
          </li>
        ) : (
          notes.map((n) => (
            <li key={n.id} className="border-l-2 border-teal/40 pl-3">
              <p className="text-xs text-slate">{fmt(n.createdAt)}</p>
              <p className="mt-0.5 text-sm text-ink">{n.content}</p>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
