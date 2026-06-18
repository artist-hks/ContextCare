"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import {
  LogOut,
  QrCode,
  Download,
  Wifi,
  WifiOff,
  Stethoscope,
  Users,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import TrendChart, { type TrendPoint } from "@/components/TrendChart";
import NotesLedger, { type NoteItem } from "@/components/NotesLedger";
import QrPairOverlay from "@/components/QrPairOverlay";
import { METRIC_ORDER, type MetricStatus } from "@/lib/metrics";

interface SidebarPatient {
  id: string;
  name: string;
  phone: string;
  scanCount: number;
  lastScanAt: string;
  hasCritical: boolean;
}

interface MetricRow {
  id: string;
  key: string;
  label: string;
  value: number;
  unit: string;
  refMin: number;
  refMax: number;
  status: MetricStatus;
}
interface ScanRow {
  id: string;
  createdAt: string;
  metrics: MetricRow[];
}
interface PatientDetail {
  id: string;
  name: string;
  phone: string;
  scans: ScanRow[];
  notes: NoteItem[];
}

export default function Dashboard() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<{ id: string; name: string; specialization?: string } | null>(
    null
  );
  const [patients, setPatients] = useState<SidebarPatient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PatientDetail | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>("fbs");
  const [connected, setConnected] = useState(false);
  const [pairOpen, setPairOpen] = useState(false);
  const [justPaired, setJustPaired] = useState<string | null>(null);
  const [newArrivals, setNewArrivals] = useState<Set<string>>(new Set());
  const [authChecked, setAuthChecked] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- data loaders ---
  const loadPatients = useCallback(async () => {
    const res = await fetch("/api/doctor/patients");
    if (res.status === 401) {
      router.push("/doctor/login");
      return;
    }
    const data = await res.json();
    setPatients(data.patients || []);
  }, [router]);

  const loadDetail = useCallback(async (id: string) => {
    const res = await fetch(`/api/doctor/patients/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setDetail(data.patient);
  }, []);

  // --- auth + initial load ---
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/doctor/me");
      if (res.status === 401) {
        router.push("/doctor/login");
        return;
      }
      const me = await res.json();
      setDoctor(me);
      setAuthChecked(true);
      await loadPatients();
    })();
  }, [router, loadPatients]);

  // --- socket setup ---
  useEffect(() => {
    if (!doctor) return;

    const socket = io({ path: "/socket.io", transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", doctor.id);
      // Stop polling fallback if it was running.
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    });

    socket.on("disconnect", () => {
      setConnected(false);
      // Polling fallback so the feature never silently breaks.
      if (!pollRef.current) {
        pollRef.current = setInterval(loadPatients, 5000);
      }
    });

    socket.on("scan:created", (payload: any) => {
      const pid = payload?.patient?.id;
      const pname = payload?.patient?.name;
      // Refresh sidebar + (if viewing this patient) detail.
      loadPatients();
      if (pid && selectedIdRef.current === pid) loadDetail(pid);
      if (pid) {
        setNewArrivals((prev) => new Set(prev).add(pid));
        setTimeout(() => {
          setNewArrivals((prev) => {
            const n = new Set(prev);
            n.delete(pid);
            return n;
          });
        }, 2200);
      }
      // If the pair overlay is open, flip it to success.
      if (pairOpenRef.current && pname) setJustPaired(pname);
    });

    // Heartbeat every 30s.
    heartbeatRef.current = setInterval(() => {
      socket.emit("ping:heartbeat");
    }, 30000);

    return () => {
      socket.disconnect();
      socketRef.current = null;
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor]);

  // Refs to read latest state inside socket handlers.
  const selectedIdRef = useRef<string | null>(null);
  const pairOpenRef = useRef(false);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);
  useEffect(() => {
    pairOpenRef.current = pairOpen;
    if (!pairOpen) setJustPaired(null);
  }, [pairOpen]);

  // --- selection ---
  function selectPatient(id: string) {
    setSelectedId(id);
    setDetail(null);
    setSelectedMetric("fbs");
    loadDetail(id);
  }

  async function logout() {
    await fetch("/api/doctor/logout", { method: "POST" });
    router.push("/doctor/login");
  }

  async function addNote(content: string) {
    if (!detail) return;
    const res = await fetch(`/api/doctor/patients/${detail.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error("note failed");
    await loadDetail(detail.id);
  }

  // --- derived: latest scan metrics + trend ---
  const latestScan = detail?.scans.length ? detail.scans[detail.scans.length - 1] : null;
  const latestByKey = useMemo(() => {
    const m = new Map<string, MetricRow>();
    latestScan?.metrics.forEach((x) => m.set(x.key, x));
    return m;
  }, [latestScan]);

  const orderedCards = useMemo(
    () => METRIC_ORDER.map((k) => latestByKey.get(k)).filter((m): m is MetricRow => Boolean(m)),
    [latestByKey]
  );

  const trendData: TrendPoint[] = useMemo(() => {
    if (!detail) return [];
    return detail.scans
      .map((s) => {
        const metric = s.metrics.find((m) => m.key === selectedMetric);
        if (!metric) return null;
        return {
          date: new Date(s.createdAt).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          }),
          value: metric.value,
        };
      })
      .filter((x): x is TrendPoint => x !== null);
  }, [detail, selectedMetric]);

  const selectedRef = latestByKey.get(selectedMetric) || orderedCards[0];

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate/20 bg-paper/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal/10 text-teal">
            <Stethoscope size={18} />
          </span>
          <div>
            <p className="font-heading text-lg leading-tight text-ink">
              Dr. {doctor?.name}
            </p>
            <p className="text-xs text-slate">{doctor?.specialization}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
              connected ? "bg-teal/10 text-teal" : "bg-amber/10 text-amber"
            }`}
            title={connected ? "Live updates connected" : "Reconnecting… using polling"}
          >
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {connected ? "Live" : "Polling"}
          </span>
          <button
            onClick={() => {
              setJustPaired(null);
              setPairOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal px-3 py-2 text-sm font-medium text-white hover:bg-teal/90"
          >
            <QrCode size={16} /> Pair a Patient
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate/40 px-3 py-2 text-sm text-ink hover:border-coral hover:text-coral"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar: patient queue */}
        <aside className="border-b border-slate/20 md:w-72 md:shrink-0 md:border-b-0 md:border-r">
          <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-ink">
            <Users size={16} /> Patient queue
            <span className="ml-auto rounded-full bg-slate/10 px-2 py-0.5 text-xs text-slate">
              {patients.length}
            </span>
          </div>
          <ul className="max-h-[40vh] overflow-y-auto md:max-h-[calc(100vh-7rem)]">
            {patients.length === 0 ? (
              <li className="px-4 py-6 text-sm text-slate">
                No patients yet. Open <strong>Pair a Patient</strong> and have them scan
                your code.
              </li>
            ) : (
              patients.map((p) => {
                const isNew = newArrivals.has(p.id);
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => selectPatient(p.id)}
                      className={`flex w-full items-center gap-2 border-l-2 px-4 py-3 text-left transition ${
                        selectedId === p.id
                          ? "border-teal bg-teal/5"
                          : "border-transparent hover:bg-slate/5"
                      } ${isNew ? "animate-arrive" : ""}`}
                    >
                      {p.hasCritical ? (
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full bg-coral"
                          title="Has a critical value"
                        />
                      ) : (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-transparent" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {p.name}
                        </span>
                        <span className="num block text-xs text-slate">
                          {p.scanCount} scan{p.scanCount === 1 ? "" : "s"} ·{" "}
                          {new Date(p.lastScanAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        {/* Detail pane */}
        <main className="flex-1 p-4">
          {!detail ? (
            <div className="flex h-[60vh] flex-col items-center justify-center text-center text-slate">
              <Users size={40} className="mb-3 opacity-50" />
              <p className="font-heading text-lg text-ink">Select a patient</p>
              <p className="mt-1 max-w-xs text-sm">
                Choose a patient from the queue to see their metrics, trends and notes.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-2xl text-ink">{detail.name}</h2>
                  <p className="num text-sm text-slate">
                    {detail.phone} · {detail.scans.length} scan
                    {detail.scans.length === 1 ? "" : "s"}
                  </p>
                </div>
                <a
                  href={`/api/doctor/patients/${detail.id}/pdf`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-teal px-3 py-2 text-sm font-medium text-teal hover:bg-teal/10"
                >
                  <Download size={16} /> Download PDF
                </a>
              </div>

              {orderedCards.length === 0 ? (
                <p className="rounded-lg border border-slate/20 bg-white p-6 text-sm text-slate">
                  This patient has no recorded scans yet.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {orderedCards.map((m) => (
                      <MetricCard
                        key={m.key}
                        label={m.label}
                        value={m.value}
                        unit={m.unit}
                        refMin={m.refMin}
                        refMax={m.refMax}
                        status={m.status}
                        selected={selectedMetric === m.key}
                        onClick={() => setSelectedMetric(m.key)}
                      />
                    ))}
                  </div>

                  {selectedRef && (
                    <TrendChart
                      label={selectedRef.label}
                      unit={selectedRef.unit}
                      refMin={selectedRef.refMin}
                      refMax={selectedRef.refMax}
                      data={trendData}
                    />
                  )}
                </>
              )}

              <NotesLedger notes={detail.notes} onAdd={addNote} />
            </div>
          )}
        </main>
      </div>

      <QrPairOverlay
        open={pairOpen}
        onClose={() => setPairOpen(false)}
        pairedPatientName={justPaired}
      />
    </div>
  );
}
