"use client";

import { io, Socket } from "socket.io-client";

// Singleton pattern để không tạo quá nhiều kết nối
let socket: Socket;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:4000", {
      transports: ["websocket"],
      autoConnect: false, // Chỉ connect khi cần
    });
  }
  return socket;
};