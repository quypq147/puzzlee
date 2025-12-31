import express from 'express';
import { createServer } from 'http'; // <--- BẮT BUỘC
import { Server } from 'socket.io';  // <--- BẮT BUỘC
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import organizationRoutes from './routes/organizationRoutes';
import eventRoutes from './routes/eventRoutes';
import questionRoutes from './routes/questionRoutes';
import userRoutes from './routes/userRoutes';
import answerRoutes from './routes/answerRoutes'; 
import commentRoutes from './routes/commentRoutes';

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
console.log("Server bat dau chay...");

io.on('connection', (socket) => {
  console.log(`User conn  ected: ${socket.id}`);
  
  socket.on('join-event', ({ eventId }) => {
    socket.join(eventId);
    console.log(`Socket ${socket.id} joined event ${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log('Nguoi dung ngat ket noi: ' + socket.id);
  });
});

app.use(cors());
app.use((req, res, next) => {
  if (req.method === 'POST') {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      console.log('Raw body received:', data);
    });
  }
  next();
});
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/answers', answerRoutes); // <--- BẮT BUỘC PHẢI CÓ DÒNG NÀY
app.use('/api/organizations', organizationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/comments', commentRoutes);

app.get('/', (req, res) => {
  res.send('Puzzlee Backend dang chay!');
});

const PORT = process.env.PORT || 4000;


httpServer.listen(PORT, () => {
  console.log(`Server dang chay tren cong ${PORT}`);
});
