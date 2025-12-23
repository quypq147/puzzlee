import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import eventRoutes from "./routes/eventRoutes"; // Ví dụ route API

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

// Cấu hình CORS để Next.js (port 3000) gọi được sang đây (port 4000)
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Setup API Routes (REST)
// app.use("/api/events", eventRoutes);

// --- LOGIC SOCKET REALTIME ---
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 1. Tham gia vào phòng sự kiện (Room)
  socket.on("join-event", (eventId) => {
    socket.join(eventId);
    console.log(`Socket ${socket.id} joined event ${eventId}`);
  });

  // 2. Xử lý khi có câu hỏi mới
  socket.on("create-question", async (data) => {
    // data bao gồm: { eventId, content, userId, isAnonymous, ... }
    try {
      // B1: Lưu vào MySQL qua Prisma
      const newQuestion = await prisma.question.create({
        data: {
          content: data.content,
          eventId: data.eventId,
          authorId: data.userId, // Hoặc null nếu ẩn danh
          isAnonymous: data.isAnonymous || false,
          type: "QA"
        },
        include: { author: true } // Lấy luôn thông tin người hỏi để trả về
      });

      // B2: Phát sự kiện cho TẤT CẢ mọi người trong phòng đó
      io.to(data.eventId).emit("new-question", newQuestion);
      
    } catch (e) {
      console.error("Error creating question:", e);
      socket.emit("error", { message: "Không thể tạo câu hỏi" });
    }
  });

  // 3. Xử lý Vote (Like)
  socket.on("vote-question", async (data) => {
    // data: { questionId, userId, value, eventId }
    try {
      // Upsert: Nếu chưa vote thì tạo, vote rồi thì update
       await prisma.questionVote.upsert({
        where: {
          userId_questionId: { userId: data.userId, questionId: data.questionId }
        },
        update: { value: data.value },
        create: { userId: data.userId, questionId: data.questionId, value: data.value }
      });

      // Tính lại tổng điểm để update bảng Question
      const aggregations = await prisma.questionVote.aggregate({
        _sum: { value: true },
        where: { questionId: data.questionId }
      });
      
      const newScore = aggregations._sum.value || 0;

      const updatedQuestion = await prisma.question.update({
        where: { id: data.questionId },
        data: { score: newScore },
        include: { author: true } // Kèm info tác giả
      });

      // Bắn socket update cho client cập nhật số like realtime
      io.to(data.eventId).emit("update-vote", updatedQuestion);

    } catch (e) {
      console.error(e);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

server.listen(4000, () => {
  console.log("Server running on port 4000");
});