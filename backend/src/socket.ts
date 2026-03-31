import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";

export let io: SocketIOServer;

/**
 * Initialize the Socket.IO server
 */
export function initSocketIO(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("Client connected:", socket.id);

    // When a user authenticates their socket connection,
    // they join a room specific to their user ID.
    // This allows us to emit events to exactly one user across multiple tabs/devices.
    socket.on("join-user-room", (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`Socket ${socket.id} joined room user:${userId}`);
      }
    });

    socket.on("leave-user-room", (userId: string) => {
      if (userId) {
        socket.leave(`user:${userId}`);
        console.log(`Socket ${socket.id} left room user:${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

/**
 * Send a notification payload to a specific user's connected sockets
 */
export function emitToUser(userId: string, event: string, payload: any) {
  if (!io) {
    console.warn("Socket.io not initialized. Cannot emit message.");
    return;
  }
  io.to(`user:${userId}`).emit(event, payload);
}
