import { Request, Response } from 'express';
// [QUAN TRỌNG] Import prisma instance đã khởi tạo chung, không new PrismaClient() lại
import { prisma } from '../../lib/prisma';

// 1. Lấy thông tin Profile (Sửa lỗi 404 GET /profile)
export const getProfile = async (req: Request, res: Response) => {
  try {
    // req.user được gán từ middleware auth
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        systemRole: true,
        createdAt: true,
        // Không select passwordHash
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 2. Cập nhật Profile (Sửa lỗi 'profile' does not exist)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { fullName, avatarUrl } = req.body;

    // [FIX] Dùng prisma.user thay vì prisma.profile
    const updatedUser = await prisma.user.update({
      where: { id: userId }, 
      data: {
        fullName,
        avatarUrl
      },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        username: true,
        email: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Lỗi cập nhật hồ sơ" });
  }
};