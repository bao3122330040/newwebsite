# Chatbot Backend Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

- Copy `.env.example` to `.env`
- Add your Google Gemini API key to `.env`

3. Start the server:

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### POST /api/chatbot/chat

Send a message to the chatbot.

**Request Body:**

```json
{
  "message": "Hello, how are you?",
  "sessionId": "user123" // optional
}
```

**Response:**

```json
{
  "response": "Hello! I'm doing well, thank you for asking. How can I help you today?",
  "sessionId": "user123",
  "timestamp": "2025-06-22T10:30:00.000Z"
}
```

### GET /api/chatbot/health

Check if the API is running.

### DELETE /api/chatbot/session/:sessionId

Clear a specific chat session.

### GET /api/chatbot/sessions

List all active sessions.

## Features

- ✅ Google Gemini AI integration
- ✅ Session-based chat history
- ✅ Input validation and sanitization
- ✅ Error handling
- ✅ Request logging
- ✅ CORS configuration
- ✅ Environment configuration

## Security Features

- Input sanitization
- XSS protection
- Message length limits
- Session management
- Error logging

## Configuration

See `config/config.js` for customizable settings:

- Server port and host
- API timeouts
- Chat history limits
- Security settings

---

## 🧪 Testing

- Test Gemini API: `node test-gemini.js`
- Test end-to-end chatbot: `node test-e2e-chatbot.js`

## 🔒 Security

- Không commit `.env` lên git!
- Đã bật rate limit, CORS, helmet, input validation.

## 🚀 Deployment

Xem chi tiết trong `DEPLOYMENT_PLAN.md` (Vercel, Netlify, Railway, Heroku...)

## 📞 Support

- DevOps: devops@gamezone.com
- Status: status.gamezone.com

## 🌐 Frontend API Config

- Đảm bảo script.js sử dụng biến BACKEND_URL để gọi API (cấu hình qua .env hoặc build tool khi deploy).
- Ví dụ với Vercel/Netlify: set BACKEND_URL trong dashboard hoặc vercel.json/netlify.toml.

## 🗜️ Asset Optimization

- Minify CSS: `npx cleancss -o style.min.css style.css`
- Minify JS: `npx uglify-js script.js -o script.min.js`
- Sử dụng file minified khi deploy production.

## ⚡ Performance

- Có thể lazy load chatbot bằng dynamic import trong script.js để tối ưu initial load.

---

## 🧩 Roadmap mở rộng

### Database Integration

- Sử dụng `database.js` (PostgreSQL Pool)
- Cấu hình biến môi trường `DATABASE_URL`
- Migration: dùng Prisma, Sequelize, hoặc SQL script
- Backup: xem backup.sh trong DEPLOYMENT_PLAN.md

### User Authentication

- Sử dụng `auth/authService.js` (JWT + bcrypt)
- Cấu hình biến môi trường `JWT_SECRET`
- Tích hợp vào route `/api/auth` (login, register, profile)

### Payment Gateway

- Sử dụng `paymentService.js` (Stripe/PayPal stub)
- Cấu hình key provider, test với sandbox
- Tích hợp vào route `/api/payment`

### Multi-language Support

- Sử dụng `i18n.js` cho backend/frontend
- Thêm ngôn ngữ mới vào object `translations`
- Gọi `t(key, lang)` để lấy text phù hợp

### Mobile App

- API-first: đảm bảo backend trả JSON chuẩn REST
- Có thể dùng OpenAPI/Swagger để generate client
- Gợi ý tech stack: React Native, Flutter
