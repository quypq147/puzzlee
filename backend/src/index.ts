console.log("Test log 1");
// backend/src/index.ts
import express from 'express';
import { createServer } from 'http'; // <--- BẮT BUỘC
import { Server } from 'socket.io';  // <--- BẮT BUỘC
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import organizationRoutes from './routes/organizationRoutes';
import eventRoutes from './routes/eventRoutes';
import questionRoutes from './routes/questionRoutes';

dotenv.config();

const app = express();
const httpServer = createServer(app); // <--- Tạo HTTP Server bọc Express

// Cấu hình Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "*", 
    methods: ["GET", "POST"]
  }
});

// Lưu biến io vào app để dùng ở Controller
app.set('io', io);

// Log để biết server đang khởi động
console.log("Starting server...");

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('join-event', ({ eventId }) => {
    socket.join(eventId);
    console.log(`Socket ${socket.id} joined event ${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/questions', questionRoutes);

app.get('/', (req, res) => {
  res.send('Puzzlee Backend is running!');
});

const PORT = process.env.PORT || 4000;

// --- QUAN TRỌNG NHẤT: PHẢI CÓ DÒNG NÀY ---
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// ------------------------------------------