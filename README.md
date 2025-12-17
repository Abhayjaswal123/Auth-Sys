# 🔐 Authentication System (MERN)

A full-stack MERN authentication system with secure login, email verification using OTP, password reset, and JWT-based authentication.

## 🚀 Features
- User registration & login
- JWT authentication with httpOnly cookies
- OTP-based email verification
- Forgot & reset password
- Secure password hashing (bcrypt)
- Protected routes
- Responsive UI

## 🛠 Tech Stack
**Frontend:** React, Vite, Tailwind CSS, Axios  
**Backend:** Node.js, Express, MongoDB, Mongoose  
**Auth & Security:** JWT, bcrypt, Cookies  
**Email:** Nodemailer (SMTP)

## 📁 Project Structure
Auth-Sys/
├── client/ # React frontend
├── server/ # Node.js backend
└── README.md

## ⚙️ Setup (Local)

### 1. Clone repo
```bash
git clone https://github.com/Abhayjaswal123/Auth-Sys
cd Auth-Sys ```

### 2. Backend
cd server
npm install
npm run server

Create .env in server:

MONGODB_URI=your_mongodb_url
JWT_SECRET=your_secret
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
SENDER_EMAIL=your_email
PORT=3000

### 3. Frontend
cd client
npm install
npm run dev

## 🔌 API Endpoints

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/send-verify-otp
POST /api/auth/reset-password
GET /api/user/data (protected)
