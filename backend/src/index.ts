import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import organizationRoutes from './routes/organizationRoutes';
import eventRoutes from './routes/eventRoutes';
// import questionRoutes from './routes/questionRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/events', eventRoutes);
// app.use('/api/questions', questionRoutes);

app.get('/', (req, res) => {
  res.send('Puzzlee Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});