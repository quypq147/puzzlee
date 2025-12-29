This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:
# Puzzlee Frontend Client

Đây là giao diện người dùng (Client-side) cho ứng dụng **Puzzlee**, được xây dựng bằng Next.js. Ứng dụng cung cấp trải nghiệm mượt mà cho việc tham gia sự kiện, đặt câu hỏi và tương tác thời gian thực trong lớp học hoặc hội thảo.

## ✨ Tính năng nổi bật

* **Interactive UI**: Giao diện hiện đại, thân thiện với người dùng (sử dụng Shadcn UI & Tailwind CSS).
* **Real-time Updates**: Hiển thị câu hỏi mới, lượt vote và trạng thái sự kiện ngay lập tức mà không cần tải lại trang.
* **Role-based View**: Giao diện khác nhau cho Người tổ chức (Host) và Người tham gia (Participant).
* **Moderation Panel**: Công cụ duyệt câu hỏi dành cho quản trị viên.
* **Dashboard**: Thống kê và quản lý các sự kiện đã tạo.

## 🛠 Công nghệ sử dụng

* **Core**: [Next.js 14+](https://nextjs.org/) (App Router)
* **Language**: TypeScript
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **UI Components**: [Shadcn/ui](https://ui.shadcn.com/)
* **State Management**: React Hooks & Context API
* **Real-time Client**: `socket.io-client`
* **Form Handling**: React Hook Form + Zod

## 📂 Cấu trúc dự án

```text
frontend/
├── app/                # Next.js App Router (Pages & Layouts)
│   ├── (auth)/         # Các trang xác thực (Login, Register...)
│   ├── (event)/        # Trang tham gia sự kiện trực tiếp
│   └── dashboard/      # Trang quản lý cho Host
├── components/         # Các React Components tái sử dụng
│   ├── ui/             # Các component cơ bản (Button, Input, Dialog...)
│   └── ...             # Các component phức tạp (QuestionCard, EventSidebar...)
├── hooks/              # Custom Hooks (use-event-realtime, use-auth...)
├── lib/                # Các hàm tiện ích và cấu hình (api-client, socket...)
└── public/             # Static assets

```

## 🚀 Hướng dẫn Cài đặt

### 1. Yêu cầu

* Node.js (v18 trở lên)
* Backend Server đang chạy (để kết nối API và Socket)

### 2. Cài đặt dependencies

Tại thư mục frontend:

```bash
cd frontend
npm install

```

### 3. Cấu hình môi trường

Tạo file `.env.local` tại thư mục gốc của frontend và cấu hình URL của Backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

```

*(Thay thế port 3000 bằng port thực tế của backend)*

### 4. Chạy ứng dụng

* **Môi trường Development:**
```bash
npm run dev

```


Truy cập [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) (hoặc port mặc định của Next.js).
* **Build Production:**
```bash
npm run build
npm start

```



## 🤝 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

---
