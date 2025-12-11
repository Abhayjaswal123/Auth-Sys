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

// CORS configuration - must be before routes
const corsOptions = {
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error(`CORS: Origin ${origin} is not allowed. Add it to ALLOWED_ORIGINS environment variable.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

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

// Error handling middleware - must be after routes
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Handle CORS errors - but don't interfere with preflight requests
  if (err.message.includes('CORS')) {
    // For preflight OPTIONS requests, send proper CORS error response
    if (req.method === 'OPTIONS') {
      return res.status(403).json({ 
        success: false, 
        message: err.message,
        hint: 'Make sure your frontend URL is in ALLOWED_ORIGINS environment variable'
      });
    }
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