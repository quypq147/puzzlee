import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "bi-mat-khong-bat-mi";

// 1. Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { email, password, username, fullName } = req.body;

    // Check tồn tại
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email đã tồn tại" });

    // Hash pass
    const passwordHash = await bcrypt.hash(password, 10);

    // Transaction tạo User + Profile
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, passwordHash },
      });
      await tx.profile.create({
        data: { id: user.id, username, fullName, role: "ADMIN" },
      });
      return user;
    });

    res.status(201).json({ message: "Đăng ký thành công", userId: newUser.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi Server" });
  }
});

// 2. Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Sai email hoặc mật khẩu" });
    }

    // Tạo Token
    const token = jwt.sign(
      { userId: user.id, role: user.profile?.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Trả về token và info user
    res.json({
      message: "Đăng nhập thành công",
      token, 
      user: user.profile 
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi Server" });
  }
});

// 3. Lấy thông tin user (Me)
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Chưa đăng nhập" });

  const token = authHeader.split(" ")[1]; // Bearer <token>
  
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const profile = await prisma.profile.findUnique({
      where: { id: decoded.userId },
    });
    res.json({ user: profile });
  } catch (error) {
    res.status(401).json({ error: "Token không hợp lệ" });
  }
});

export default router;
