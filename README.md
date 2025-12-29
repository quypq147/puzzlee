# 🎉 Puzzlee - Ứng dụng Hỏi Đáp (Q&A) Thời Gian Thực

Puzzlee là hệ thống Q&A hỗ trợ lớp học, diễn đàn và sự kiện trực tuyến, cho phép người dùng tương tác, đặt câu hỏi và bình chọn theo **thời gian thực**. Hệ thống tối ưu trải nghiệm thảo luận với phân quyền chặt chẽ và cập nhật tức thì qua WebSocket.

---

## 📖 Giới thiệu Đề tài

> **Dự án:** Nền tảng Hỏi Đáp (Q&A) Thời Gian Thực Cho Lớp Học & Diễn Đàn Thảo Luận.

### 🌟 Điểm nổi bật

- **Real-time Interaction:** Sử dụng WebSocket để đẩy câu hỏi, câu trả lời và lượt vote ngay lập tức.
- **Phân quyền chi tiết:** Hỗ trợ nhiều cấp độ người dùng (Admin, Owner, Moderator, Member, Participant).
- **Cấu trúc chuẩn:** Cơ sở dữ liệu chuẩn hoá 3NF, đảm bảo toàn vẹn dữ liệu.
- **Quản lý sự kiện:** Tổ chức các phiên hỏi đáp theo sự kiện với mã tham gia riêng biệt.

---

## 🚀 Chức năng Chính

| Chức năng                | Mô tả ngắn |
|--------------------------|------------|
| **Tài khoản & Tổ chức**  | Đăng ký, đăng nhập (JWT), tạo & quản lý tổ chức, mời thành viên, phân quyền |
| **Sự kiện (Event)**      | Tạo sự kiện Q&A với mã code, thiết lập thời gian, cấu hình ẩn danh & kiểm duyệt |
| **Hỏi & Đáp (Q&A)**      | Đặt câu hỏi (ẩn danh), phân loại QA/Poll, upvote/downvote, trả lời, bình luận |
| **Kiểm duyệt**           | Duyệt, từ chối, ẩn, ghim, đánh dấu đã trả lời |

---

## 🛠 Tech Stack

**Backend:**
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma (ORM & Migration)
- Socket.io (Real-time)
- JWT, bcryptjs (Auth)

**Frontend:**
- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS, Shadcn/UI (Radix UI)
- React Hook Form, Zod, Axios
- Socket.io Client
- Chart.js, Recharts

---

## 📂 Cấu trúc Dự án

<details>
<summary><strong>Monorepo Structure</strong></summary>

```bash
puzzlee-dev/
├── backend/                # Server Application
│   ├── prisma/             # Database Schema & Migrations
│   │   └── schema.prisma   # Định nghĩa DB Models
│   ├── src/
│   │   ├── controllers/    # Xử lý logic
│   │   ├── middleware/     # Auth & Validation
│   │   ├── routes/         # API Endpoints
│   │   └── index.ts        # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/               # Client Application (Next.js)
    ├── app/                # Next.js App Router pages
    ├── components/         # UI Components (Shadcn/UI)
    ├── lib/                # Utilities & API configs
    ├── public/             # Static assets
    └── package.json
```
</details>

---

## ⚙️ Cài đặt & Chạy dự án

### **Yêu cầu tiên quyết**
- Node.js (>= v20) - [Node.js](https://nodejs.org/en/download/current)
- PostgreSQL (đã cài đặt & chạy) [PostgreSQL](https://www.youtube.com/watch?v=4qH-7w5LZsA)
- Git

### **1. Thiết lập Backend**
```bash
cd backend
npm install
cp .env.example .env
```
Cập nhật file `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/puzzlee_db?schema=public"
JWT_SECRET="bi_mat_cua_ban"
PORT=4000
```
Khởi tạo DB & Prisma Client:
```bash
npm run prisma:migrate
npm run prisma:generate
npm run dev
```
Server chạy tại: [http://localhost:4000](http://localhost:4000)

### **2. Thiết lập Frontend**
```bash
cd frontend
npm install
```
Tạo file `.env.local` (nếu cần):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```
Chạy ứng dụng Next.js:
```bash
npm run dev
```
Truy cập: [http://localhost:3000](http://localhost:3000)

---

## 🤝 Đóng góp

1. Fork dự án
2. Tạo Feature Branch: `git checkout -b feature/NewFeature`
3. Commit thay đổi: `git commit -m 'Add some NewFeature'`
4. Push lên Branch: `git push origin feature/NewFeature`
5. Mở Pull Request
Dự án được phát triển bởi [Nhom/Team].