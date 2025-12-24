import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Cập nhật hồ sơ (Avatar, Tên)
export const updateProfile = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { fullName, avatarUrl } = req.body;

    const updatedProfile = await prisma.profile.update({
      where: { id: userId }, // Vì User và Profile chia sẻ cùng ID (quan hệ 1-1)
      data: {
        fullName,
        avatarUrl
      }
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi cập nhật hồ sơ" });
  }
};