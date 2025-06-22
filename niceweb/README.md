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
