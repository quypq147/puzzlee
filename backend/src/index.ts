import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRoutes"; // Import Routes
import eventRoutes from "./routes/eventRoutes";       
import questionRoutes from "./routes/questionRoutes"; 
import userRoutes from "./routes/userRoutes";

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

// CORS Configuration
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// --- ROUTES REST API ---
app.use("/api/auth", authRoutes); // Mount Auth Routes
app.use("/api/events", eventRoutes);       
app.use("/api/questions", questionRoutes); 
app.use("/api/users", userRoutes);

// --- SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-event", (eventId) => {
    socket.join(eventId);
    console.log(`Socket ${socket.id} joined event ${eventId}`);
  });

  socket.on("create-question", async (data) => {
    try {
      const newQuestion = await prisma.question.create({
        data: {
          content: data.content,
          eventId: data.eventId,
          authorId: data.userId, 
          isAnonymous: data.isAnonymous || false,
          type: "QA"
        },
        include: { author: true } 
      });
      io.to(data.eventId).emit("new-question", newQuestion);
    } catch (e) {
      console.error("Error creating question:", e);
      socket.emit("error", { message: "Failed to create question" });
    }
  });

  socket.on("vote-question", async (data) => {
    try {
       await prisma.questionVote.upsert({
        where: {
          questionId_userId: { userId: data.userId, questionId: data.questionId } // Chú ý thứ tự trong schema
        },
        update: { value: data.value },
        create: { userId: data.userId, questionId: data.questionId, value: data.value }
      });

      const aggregations = await prisma.questionVote.aggregate({
        _sum: { value: true },
        where: { questionId: data.questionId }
      });
      
      const newScore = aggregations._sum.value || 0;

      const updatedQuestion = await prisma.question.update({
        where: { id: data.questionId },
        data: { score: newScore },
        include: { author: true }
      });

      io.to(data.eventId).emit("update-vote", updatedQuestion);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("disconnect", () => {
    console.log("Nguoi dung ngat ket noi", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server dang chay tren cong ${PORT}`);
});