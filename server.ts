import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as IOServer } from "socket.io";
import { setIo, doctorRoom } from "./lib/socket";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Never let a background worker (e.g. an OCR worker thread) take down the
// whole server. Individual requests still surface their own errors.
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new IOServer(server, {
    cors: { origin: "*" },
    path: "/socket.io",
  });

  // Make the io instance available to Next.js API routes (same process).
  setIo(io);

  io.on("connection", (socket) => {
    // A doctor dashboard joins its own room to receive scan:created events.
    socket.on("join", (doctorId: string) => {
      if (typeof doctorId === "string" && doctorId.length > 0) {
        socket.join(doctorRoom(doctorId));
      }
    });

    // Heartbeat: client pings, server ponds back.
    socket.on("ping:heartbeat", () => {
      socket.emit("pong:heartbeat");
    });
  });

  server.listen(port, hostname, () => {
    console.log(`> ContextCare AI ready on http://${hostname}:${port}`);
    console.log(`> WebSocket (Socket.IO) attached on the same port`);
  });
});
