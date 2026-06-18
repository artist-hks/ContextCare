import type { Server as IOServer } from "socket.io";

// The custom server (server.ts) creates the Socket.IO instance and stashes
// it on globalThis so Next.js API routes (running in the same process) can
// emit events into doctor rooms.
const globalForIo = globalThis as unknown as { io?: IOServer };

export function setIo(io: IOServer) {
  globalForIo.io = io;
}

export function getIo(): IOServer | undefined {
  return globalForIo.io;
}

export function doctorRoom(doctorId: string): string {
  return `doctor:${doctorId}`;
}

// Emit a freshly created scan to the doctor's room.
export function emitScanCreated(doctorId: string, payload: unknown) {
  const io = getIo();
  if (io) {
    io.to(doctorRoom(doctorId)).emit("scan:created", payload);
  }
}
