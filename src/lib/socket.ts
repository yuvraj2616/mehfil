"use client";

import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false, // Wait until we're sure we want to connect
    });
  }
  return socket;
}

export function connectSocket(userId?: string) {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  if (userId) {
    s.emit("join-user-room", userId);
  }
  return s;
}

export function disconnectSocket(userId?: string) {
  if (socket) {
    if (userId) {
      socket.emit("leave-user-room", userId);
    }
    socket.disconnect();
    socket = null;
  }
}
