import express from 'express';
import { isAuthenticated, login, logout, register, resetPassword, sendResetPasswordOtp, sendVerifyOtp, verifyEmail,verifyResetOtp } from '../controllers/authController.js';
import userAuth from '../middleware/userauth.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.get('/is-auth', isAuthenticated);
authRouter.post('/send-reset-otp', sendResetPasswordOtp);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/verify-reset-otp', verifyResetOtp);

export default authRouter;