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

const allowedOrigins = ["https://auth-sys-frontend-261e.onrender.com"];
//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
     origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
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