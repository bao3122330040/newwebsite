# 🚀 Hướng Dẫn Chạy Website GameZone

## Quick Start - Chỉ 3 Bước!

### Bước 1: Cài đặt Dependencies
```bash
cd niceweb
npm install
```

### Bước 2: Cấu hình API Key
1. Mở file `.env`
2. Thay `your_actual_gemini_api_key_here` bằng API key thật của bạn
3. Lưu file

**Lấy API Key tại:** [Google AI Studio](https://makersuite.google.com/app/apikey)

### Bước 3: Khởi chạy
```bash
npm start
```

✅ **Website sẵn sàng tại:** `http://localhost:5000`

---

## 🎮 Cách Sử Dụng Website

### 1. Truy cập Website
- Mở trình duyệt và vào `http://localhost:5000`
- Website sẽ hiển thị trang chủ GameZone

### 2. Browse Sản Phẩm
- **Categories:** Click vào các danh mục (PC Gaming, Consoles, Accessories, Mobile)
- **Filter:** Sử dụng bộ lọc để tìm sản phẩm theo loại
- **Search:** Click icon tìm kiếm để search sản phẩm

### 3. Sử dụng AI Chatbot 🤖
- **Mở Chatbot:** Click vào icon chat ở góc phải màn hình
- **Hỏi về sản phẩm:** "Tôi muốn mua laptop gaming"
- **Tư vấn setup:** "Build PC gaming budget 20 triệu"
- **Kiểm tra deal:** "Có khuyến mãi gì hôm nay không?"
- **So sánh sản phẩm:** "So sánh RTX 4060 và RTX 4070"

### 4. Mua Hàng
- Click **Add to Cart** để thêm sản phẩm
- Click icon **🛒** để xem giỏ hàng
- Điều chỉnh số lượng hoặc xóa sản phẩm
- Click **Checkout** để thanh toán

---

## 🔧 Troubleshooting - Khắc Phục Lỗi

### ❌ Lỗi: "Cannot find module"
**Nguyên nhân:** Chưa cài đặt dependencies
**Giải pháp:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Lỗi: "Invalid API Key"
**Nguyên nhân:** API key Google Gemini không đúng
**Giải pháp:**
1. Kiểm tra file `.env`
2. Đảm bảo API key không có khoảng trắng thừa
3. Tạo API key mới tại [Google AI Studio](https://makersuite.google.com/app/apikey)

### ❌ Lỗi: "Port 5000 is already in use"
**Nguyên nhân:** Port 5000 đã được sử dụng
**Giải pháp:**
```bash
# Dừng process đang chạy trên port 5000
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Hoặc thay đổi port trong file .env
PORT=3000
```

### ❌ Chatbot không hoạt động
**Nguyên nhân:** Backend chưa khởi động hoặc API lỗi
**Giải pháp:**
1. Kiểm tra console có lỗi không
2. Test API health: `http://localhost:5000/api/chatbot/health`
3. Restart server: `Ctrl+C` rồi `npm start`

### ❌ Website hiển thị trắng
**Nguyên nhân:** Lỗi JavaScript hoặc file CSS
**Giải pháp:**
1. Mở Developer Tools (F12)
2. Kiểm tra Console tab có lỗi không
3. Kiểm tra Network tab xem file nào load fail
4. Hard refresh: `Ctrl+Shift+R`

---

## 🧪 Test Nhanh Các Tính Năng

### Test Backend API
```bash
# Health check
curl http://localhost:5000/api/chatbot/health

# Test chat
curl -X POST http://localhost:5000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

### Test Frontend
- ✅ Trang chủ load đúng
- ✅ Menu navigation hoạt động
- ✅ Chatbot icon xuất hiện
- ✅ Click vào sản phẩm mở modal
- ✅ Add to cart hoạt động
- ✅ Responsive trên mobile

### Test Chatbot
- ✅ Mở chat window
- ✅ Gửi tin nhắn đơn giản
- ✅ AI phản hồi trong 5 giây
- ✅ History conversation được lưu
- ✅ Tools hoạt động (product search, price calc)

---

## 📱 Demo URLs

### Frontend Pages
- **Trang chủ:** `http://localhost:5000`
- **Sản phẩm:** `http://localhost:5000#products`
- **Deals:** `http://localhost:5000#deals`

### API Endpoints
- **Health Check:** `http://localhost:5000/api/chatbot/health`
- **Agent Chat:** `POST http://localhost:5000/api/agent/chat`
- **Products:** `http://localhost:5000/api/chatbot/products`
- **Current Deals:** `http://localhost:5000/api/chatbot/deals`

---

## 🎯 Tips Sử Dụng

### Chatbot Pro Tips
- **Cụ thể hóa yêu cầu:** Thay vì "Tư vấn PC" → "Build PC gaming budget 15 triệu chơi AAA games"
- **Hỏi so sánh:** "So sánh RTX 4060 Ti vs RTX 4070 Super"
- **Kiểm tra deals:** "Có combo nào phù hợp budget 10 triệu không?"
- **Setup advice:** "PC này có chạy được Cyberpunk 2077 max setting không?"

### Performance Tips
- **Chatbot mở nhanh hơn** sau lần đầu load
- **Refresh page** nếu chatbot response chậm
- **Clear browser cache** nếu gặp lỗi CSS/JS

### Mobile Usage
- Website responsive tốt trên mobile
- Chatbot tối ưu cho touch
- Swipe navigation trên product gallery

---

## 📞 Hỗ Trợ

### Logs Debug
Kiểm tra console logs:
```bash
# Xem logs server
# Console sẽ hiển thị:
🚀 Server running on http://localhost:5000
✅ GameZone Agent initialized successfully
💬 [Agent] User: "message" → Response: "response"
```

### Common Commands
```bash
# Dừng server
Ctrl + C

# Restart server
npm start

# Development mode (auto-reload)
npm run dev

# Clear cache và reinstall
rm -rf node_modules package-lock.json && npm install
```

### Khi Cần Hỗ Trợ
1. ✅ Kiểm tra console logs
2. ✅ Test API endpoints riêng lẻ  
3. ✅ Verify API key và internet connection
4. ✅ Thử với browser khác
5. ✅ Restart máy nếu cần

---

🎮 **Chúc bạn có trải nghiệm tuyệt vời với GameZone!** 🎮

> **Lưu ý:** File này dành cho user cuối. Developers xem thêm `SETUP_GUIDE.md` và `DEPLOYMENT_PLAN.md` để biết chi tiết kỹ thuật.
