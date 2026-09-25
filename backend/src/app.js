import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import learningRoutes from './routes/learningRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import placementRoutes from './routes/placementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';
import { sendSuccess } from './utils/response.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  return sendSuccess(res, 200, 'NextStep AI backend is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);


export default app;
