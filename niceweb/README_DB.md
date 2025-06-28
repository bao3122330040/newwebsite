# Database Setup for GameZone

## 1. Cài đặt PostgreSQL

- Cài đặt PostgreSQL trên máy hoặc dùng dịch vụ cloud (Railway, Supabase, Heroku...)

## 2. Tạo database và user

```sql
CREATE DATABASE gamezone;
CREATE USER gamezone_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE gamezone TO gamezone_user;
```

## 3. Thiết lập biến môi trường

Thêm vào file `.env`:

```
DATABASE_URL=postgresql://gamezone_user:yourpassword@localhost:5432/gamezone
```

## 4. Chạy migration tạo bảng

```bash
psql "$DATABASE_URL" -f migrations/001_create_tables.sql
```

## 5. Kết nối Node.js

- Đã có sẵn file `database.js` sử dụng connection pool.
- Import pool và dùng cho các truy vấn:

```js
const pool = require("./database");
const result = await pool.query("SELECT * FROM users");
```

## 6. Tiếp tục phát triển

- Thêm các truy vấn CRUD cho users, products, chat_sessions, chat_messages.
- Tích hợp vào các service/backend route tương ứng.
