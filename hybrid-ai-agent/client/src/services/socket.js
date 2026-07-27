import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  socket = io("/", {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("[Socket] Connection error:", error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
