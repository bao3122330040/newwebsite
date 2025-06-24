# GameZone Chatbot với LangChain & Gemini AI

## 🚀 Tổng quan

Đây là một chatbot agent thông minh được xây dựng với **LangChain** và **Google Gemini AI** để hỗ trợ khách hàng trên website bán đồ gaming GameZone. Chatbot có khả năng:

- Tư vấn sản phẩm gaming thông minh
- Sử dụng tools để truy xuất thông tin
- Tính toán giá cả và khuyến mãi
- Kiểm tra khả năng tương thích linh kiện
- Xây dựng setup gaming hoàn chỉnh
- Ghi nhớ ngữ cảnh hội thoại

## 🛠️ Cài đặt

### 1. Clone và cài đặt dependencies

```bash
cd niceweb
npm install
```

### 2. Cấu hình API Key

Sửa file `.env` và thêm Google API Key:

```env
GOOGLE_API_KEY=your_actual_gemini_api_key_here
PORT=5000
NODE_ENV=development

# Chatbot Configuration
MAX_TOKENS=1000
TEMPERATURE=0.7
MODEL_NAME=gemini-pro
```

**Cách lấy API Key:**

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Tạo API key mới
3. Copy và paste vào file `.env`

### 3. Khởi chạy server

```bash
npm start
# hoặc cho development
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

## 🏗️ Kiến trúc hệ thống

### Backend Components

1. **LangChain Gemini Service** (`services/langchainGeminiService.js`)

   - Tích hợp LangChain với Google Gemini
   - Quản lý conversation history
   - Streaming responses

2. **GameZone Agent** (`services/gameZoneAgent.js`)

   - Agent với tools chuyên biệt
   - Product recommendations
   - Price calculations
   - Compatibility checks

3. **Routes**
   - `/api/chatbot/*` - Basic chatbot endpoints
   - `/api/agent/*` - Advanced agent endpoints

### Frontend Components

1. **Chatbot UI** (được tạo động bằng JavaScript)

   - Floating chat button
   - Modern chat interface
   - Typing indicators
   - Tool usage indicators

2. **Integration** (trong `script.js`)
   - Async API calls
   - Real-time messaging
   - Error handling

## 🎯 Tính năng chính

### 1. Chatbot Agent Tools

#### Product Information

```javascript
// Lấy thông tin sản phẩm theo category
GET / api / agent / capabilities;
```

#### Current Deals

```javascript
// Lấy deals hiện tại
GET / api / chatbot / deals;
```

#### Product Recommendations

- Tư vấn dựa trên budget
- Recommendations theo gaming preference
- Compatibility checking

#### Price Calculator

- Tính tổng giá trị
- Áp dụng discounts
- Bundle pricing

#### Gaming Setup Builder

- Complete PC builds
- Budget-based recommendations
- Performance optimization

### 2. API Endpoints

#### Chatbot Endpoints

```javascript
POST /api/chatbot/chat
POST /api/chatbot/chat/stream
GET /api/chatbot/health
GET /api/chatbot/products
GET /api/chatbot/deals
DELETE /api/chatbot/session/:sessionId
GET /api/chatbot/sessions
GET /api/chatbot/session/:sessionId/history
```

#### Agent Endpoints

```javascript
POST / api / agent / chat;
GET / api / agent / capabilities;
GET / api / agent / health;
POST / api / agent / reinitialize;
```

### 3. Frontend Integration

#### Basic Usage

```javascript
// Send message to agent
const response = await fetch("/api/agent/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Tôi muốn build PC gaming budget 20 triệu",
    sessionId: "optional-session-id",
  }),
});
```

#### Streaming Response

```javascript
POST / api / chatbot / chat / stream;
// Returns Server-Sent Events for real-time streaming
```

## 🎨 Customization

### 1. Thay đổi System Prompt

Sửa trong `services/langchainGeminiService.js`:

```javascript
this.systemPrompt = `Your custom prompt here...`;
```

### 2. Thêm Tools mới

Trong `services/gameZoneAgent.js`:

```javascript
new DynamicTool({
  name: "your_tool_name",
  description: "Tool description",
  func: async (input) => {
    // Tool logic here
    return "Tool response";
  },
});
```

### 3. Customize UI

Sửa CSS trong `style.css` phần `/* Chatbot Styles */`

### 4. Thêm Products

Sửa data trong `script.js`:

```javascript
const products = [
  // Thêm sản phẩm mới
  {
    id: 13,
    name: "New Gaming Product",
    price: 299.99,
    category: "pc",
    icon: "fas fa-icon",
  },
];
```

## 🚦 Testing

### 1. Test API Health

```bash
# Basic chatbot health
curl http://localhost:5000/api/chatbot/health

# Agent health
curl http://localhost:5000/api/agent/health
```

### 2. Test Chat

```bash
curl -X POST http://localhost:5000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tôi muốn mua laptop gaming"}'
```

### 3. Test Tools

```bash
# Get capabilities
curl http://localhost:5000/api/agent/capabilities

# Get products
curl http://localhost:5000/api/chatbot/products

# Get deals
curl http://localhost:5000/api/chatbot/deals
```

## 🔧 Troubleshooting

### Common Issues

1. **API Key Invalid**

   - Kiểm tra API key trong file `.env`
   - Đảm bảo API key có quyền truy cập Gemini

2. **Dependencies Error**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Agent Not Initializing**

   - Kiểm tra console logs
   - Try reinitialize: `POST /api/agent/reinitialize`

4. **Frontend Not Working**
   - Kiểm tra chatbot elements được tạo
   - Check browser console for errors

### Debug Mode

Bật debug trong `server.js`:

```javascript
const app = express();
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

## 📈 Performance Tips

1. **Conversation Memory**

   - Giới hạn conversation history (20 messages)
   - Cleanup old sessions định kỳ

2. **API Optimization**

   - Use streaming cho responses dài
   - Cache product data
   - Implement rate limiting

3. **Frontend Optimization**
   - Lazy load chatbot UI
   - Debounce user input
   - Optimize CSS animations

## 🔐 Security

1. **API Key Protection**

   - Không commit API key vào git
   - Use environment variables
   - Rotate keys định kỳ

2. **Input Validation**

   - Sanitize user inputs
   - Validate message length
   - Rate limiting

3. **CORS Configuration**
   - Cấu hình CORS phù hợp
   - Whitelist domains

## 📝 Logs

Logs được lưu trong console với format:

```
🚀 Server running on http://localhost:5000
✅ GameZone Agent initialized successfully
💬 [Agent] User: "message" -> Response: "response"
```

## 🎯 Next Steps

1. **Database Integration**

   - Lưu conversation history
   - User preferences
   - Product inventory

2. **Advanced Features**

   - Voice chat support
   - Image recognition
   - Multi-language support

3. **Analytics**
   - User interaction tracking
   - Popular queries analysis
   - Performance metrics

## 📞 Support

Nếu gặp vấn đề, hãy:

1. Kiểm tra logs trong console
2. Test API endpoints riêng lẻ
3. Verify API key và dependencies
4. Check network connectivity

---

🎮 **Happy Gaming với GameZone AI Chatbot!** 🎮
