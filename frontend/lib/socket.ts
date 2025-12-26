import { io } from "socket.io-client";

// URL trỏ về Backend Server (ví dụ: localhost:3001)
const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const socket = io(URL, {
  autoConnect: false, // Chỉ connect khi cần thiết (trong useEffect)
  withCredentials: true,
  transports: ["websocket", "polling"], // Ưu tiên websocket
});