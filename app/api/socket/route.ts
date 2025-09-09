import { Server } from "socket.io";
import type { NextRequest } from "next/server";

let io: Server | null = null;

export async function GET(request: NextRequest) {
  if (io) {
    console.log("Socket.IO server already running");
  } else {
    console.log("Initializing Socket.IO server");
    const { Server: IOServer } = await import("socket.io");
    io = new IOServer({
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "http://localhost:3000", // Adjust for production
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("Player connected:", socket.id);

      // Handle room joining (for PvP matching)
      socket.on("join-room", (roomId: string) => {
        socket.join(roomId);
        socket.to(roomId).emit("player-joined", { playerId: socket.id });
        console.log(`Player ${socket.id} joined room ${roomId}`);
      });

      // Handle card play (PvP move)
      socket.on(
        "play-card",
        ({
          roomId,
          card,
          index,
        }: {
          roomId: string;
          card: string;
          index: number;
        }) => {
          socket.to(roomId).emit("opponent-play", { card, index });
        }
      );

      // Handle result reveal (sync after both play)
      socket.on(
        "reveal-result",
        ({ roomId, result }: { roomId: string; result: string }) => {
          socket.to(roomId).emit("result-revealed", { result });
        }
      );

      socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
      });
    });
  }

  return new Response("Socket.IO server initialized", { status: 200 });
}
