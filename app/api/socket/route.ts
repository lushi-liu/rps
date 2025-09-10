import { Server } from "socket.io";
import { NextRequest } from "next/server";

let io: Server | null = null;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Record<string, never>> }
) {
  // Ensure params is resolved (though empty for this route)
  await params;

  if (!io) {
    console.log("Initializing Socket.IO server");
    const { Server: IOServer } = await import("socket.io");
    io = new IOServer({
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("Player connected:", socket.id);

      // Handle room joining
      socket.on("join-room", (roomId: string) => {
        console.log(
          `Received join-room for roomId: ${roomId}, player: ${socket.id}`
        );
        const clientsInRoom = io?.sockets.adapter.rooms.get(roomId)?.size || 0;
        if (clientsInRoom >= 2) {
          console.log(`Room ${roomId} is full`);
          socket.emit("room-full", {
            message: "Room is full. Try another room.",
          });
          return;
        }
        socket.join(roomId);
        console.log(
          `Player ${socket.id} joined room ${roomId}, players in room: ${
            clientsInRoom + 1
          }`
        );
        io?.to(roomId).emit("player-joined", {
          playerId: socket.id,
          players: clientsInRoom + 1,
        });
      });

      // Handle card play
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
          console.log(
            `Player ${socket.id} played card ${card} in room ${roomId}`
          );
          socket.to(roomId).emit("opponent-play", { card, index });
        }
      );

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
        socket.broadcast.emit("opponent-disconnected", { playerId: socket.id });
      });
    });
  } else {
    console.log("Socket.IO server already running");
  }

  return new Response("Socket.IO server initialized", { status: 200 });
}
