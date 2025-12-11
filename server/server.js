import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authroutes.js';
import userRouter from './routes/userRoutes.js';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Check for required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.error('Please set these environment variables in your Render dashboard.');
    process.exit(1);
}

connectDB();

// Configure allowed origins (frontend URLs) via env, with sensible defaults
let allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
if (allowedOrigins.length === 0) {
  allowedOrigins = [
    'https://auth-sys-frontend-261e.onrender.com',
    'http://localhost:5173', // Vite default
    'http://127.0.0.1:5173'
  ];
}

console.log('Allowed CORS origins:', allowedOrigins);

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
     origin: function(origin, callback) {
    // allow tools like Postman (no origin) and allowed browser origins
    if (!origin) {
      console.log('CORS: Request with no origin (likely Postman/curl)');
      return callback(null, true);
    }
    
    console.log('CORS: Checking origin:', origin);
    
    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Origin allowed');
      return callback(null, true);
    }
    
    // Log the origin for debugging (always log for troubleshooting)
    console.log('CORS blocked origin:', origin);
    console.log('Allowed origins:', allowedOrigins);
    return callback(new Error(`CORS: Origin ${origin} is not allowed. Add it to ALLOWED_ORIGINS environment variable.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

//API end points
app.get('/', (req, res) => {
res.json({ 
    message: 'Server is working!',
    status: 'ok',
    timestamp: new Date().toISOString()
});
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to check cookies
app.get('/api/debug/cookies', (req, res) => {
  res.json({
    cookies: req.cookies,
    cookieHeader: req.headers.cookie,
    origin: req.headers.origin,
    referer: req.headers.referer,
    'user-agent': req.headers['user-agent'],
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      RENDER: process.env.RENDER,
      PORT: process.env.PORT
    }
  });
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  if (err.message.includes('CORS')) {
    return res.status(403).json({ 
      success: false, 
      message: err.message,
      hint: 'Make sure your frontend URL is in ALLOWED_ORIGINS environment variable'
    });
  }
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal server error' 
  });
});

//Server running
app.listen(PORT, '0.0.0.0', () => {
console.log(`Server is running on port ${PORT}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Render: ${process.env.RENDER || 'false'}`);
});