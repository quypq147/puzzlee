import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

// Đăng ký
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username, fullName } = req.body;

    // Kiểm tra email tồn tại
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    // Kiểm tra username tồn tại
    const existingProfile = await prisma.profile.findUnique({ where: { username } });
    if (existingProfile) return res.status(400).json({ message: "Username already exists" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Transaction: Tạo User trước -> Tạo Profile sau
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
        },
      });

      const profile = await tx.profile.create({
        data: {
          id: user.id, // Link Profile với User ID
          username,
          fullName,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}`,
        },
      });

      return { user, profile };
    });

    res.status(201).json({ message: "User created successfully", userId: result.user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Đăng nhập
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Tạo JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.profile.username,
        fullName: user.profile.fullName,
        avatarUrl: user.profile.avatarUrl,
        role: user.profile.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Lấy thông tin user hiện tại (Dựa vào Token)
export const getMe = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user.id,
      email: user.email,
      username: user.profile.username,
      fullName: user.profile.fullName,
      avatarUrl: user.profile.avatarUrl,
      role: user.profile.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};