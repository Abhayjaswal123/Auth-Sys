import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authroutes.js';
import userRouter from './routes/userRoutes.js';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000
connectDB();

// Configure allowed origins (frontend URLs) via env, with sensible defaults
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
if (allowedOrigins.length === 0) {
  allowedOrigins.push(
    'https://auth-sys-frontend-261e.onrender.com',
    'http://localhost:5173', // Vite default
    'http://127.0.0.1:5173'
  );
}

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
     origin: function(origin, callback) {
    // allow tools like Postman (no origin) and allowed browser origins
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));


//API end points
app.get('/', (req, res) => {
res.send(' Working!');
});
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

//Server running
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});