# Puzzlee Backend API

Đây là phần Server-side cho dự án **Pụng dụng Hỏi Đáp (Q&A) Thời Gian Thực**, được xây dựng để phục vụ các lớp học, diễn đàn và sự kiện trực tuyến. Hệ thống xử lý logic nghiệp vụ, xác thực người dùng, và quản lý kết nối thời gian thực (Real-time) thông qua WebSocket.

## 🚀 Tính năng chính

* **RESTful API**: Cung cấp các endpoints cho User, Event, Organization, và Question.
* **Real-time Communication**: Sử dụng WebSocket (Socket.io) để đẩy câu hỏi, câu trả lời và lượt bình chọn ngay lập tức tới client.
* **Authentication & Authorization**: Cơ chế đăng ký/đăng nhập và phân quyền (Admin, Host, Member).
* **Database**: Thiết kế cơ sở dữ liệu chuẩn hoá 3NF, sử dụng Prisma ORM để tương tác dữ liệu an toàn.

## 🛠 Công nghệ sử dụng

* **Runtime**: [Node.js](https://nodejs.org/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Framework**: [Express.js](https://expressjs.com/) (hoặc framework tương tự dựa trên cấu trúc file)
* **ORM**: [Prisma](https://www.prisma.io/)
* **Database**: PostgreSQL (hoặc MySQL - tuỳ chỉnh trong `schema.prisma`)
* **WebSocket**: [Socket.io](https://socket.io/)

## 📂 Cấu trúc dự án

```text
backend/
├── src/
│   ├── controllers/    # Xử lý logic nghiệp vụ (Auth, Event, Question, User...)
│   ├── middleware/     # Middleware xác thực (auth.ts...)
│   ├── routes/         # Định nghĩa các API routes
│   └── index.ts        # Entry point của ứng dụng
├── prisma/
│   └── schema.prisma   # Định nghĩa Schema Database
├── .env.example        # Mẫu biến môi trường
└── package.json

```

## ⚙️ Cài đặt và Chạy ứng dụng

### 1. Yêu cầu tiên quyết

* Node.js (v18 trở lên)
* Trình quản lý gói: npm hoặc yarn
* Database (PostgreSQL hoặc MySQL đã được cài đặt và chạy)

### 2. Cài đặt dependencies

Di chuyển vào thư mục backend và chạy lệnh:

```bash
cd backend
npm install

```

### 3. Cấu hình môi trường

Sao chép file `.env.example` thành `.env` và điền các thông số cần thiết:

```bash
cp .env.example .env

```

*Cập nhật `DATABASE_URL`, `JWT_SECRET`, và các cấu hình khác trong file .env*

### 4. Khởi tạo Database (Prisma)

Đồng bộ schema với cơ sở dữ liệu:

```bash
npx prisma generate
npx prisma db push
# Hoặc nếu dùng migration: npx prisma migrate dev

```

### 5. Chạy Server

* **Môi trường Development:**
```bash
npm run dev

```


* **Build và chạy Production:**
```bash
npm run build
npm start

```



## 📝 API Endpoints Chính

* `/api/auth`: Đăng ký, Đăng nhập, Refresh Token.
* `/api/users`: Quản lý thông tin người dùng.
* `/api/events`: Tạo sự kiện, tham gia phòng, lấy thông tin phòng.
* `/api/questions`: Gửi câu hỏi, bình chọn, trả lời.

---
