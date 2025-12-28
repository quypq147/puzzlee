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
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    
    // Tạo filter tìm kiếm nếu có
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { fullName: { contains: String(search), mode: 'insensitive' } },
        { username: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        systemRole: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách người dùng" });
  }
};
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // "ADMIN" hoặc "USER"

    // Không cho phép tự hạ quyền của chính mình để tránh mất quyền quản trị
    const currentUserId = (req as any).user.userId;
    if (id === currentUserId) {
      return res.status(400).json({ message: "Không thể tự thay đổi quyền của chính mình" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { systemRole: role },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật quyền" });
  }
};
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = (req as any).user.userId;

    if (id === currentUserId) {
      return res.status(400).json({ message: "Không thể tự xóa tài khoản đang đăng nhập" });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: "Đã xóa người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa người dùng" });
  }
};
export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    // 1. Tìm tất cả Event mà User này làm chủ (Creator)
    // Hoặc có thể mở rộng logic là Admin của Organization
    const userEvents = await prisma.event.findMany({
      where: { creatorId: userId },
      select: { id: true }
    });

    const eventIds = userEvents.map(e => e.id);

    if (eventIds.length === 0) {
      return res.json({
        stats: { totalQuestions: 0, totalVotes: 0, answeredRate: 0, activeEvents: 0 },
        topQuestions: []
      });
    }

    // 2. Tính toán Stats dùng Aggregation của Prisma
    const [totalQuestions, answeredCount, voteStats] = await Promise.all([
      // Đếm tổng câu hỏi
      prisma.question.count({
        where: { eventId: { in: eventIds } }
      }),
      // Đếm câu đã trả lời
      prisma.question.count({
        where: { eventId: { in: eventIds }, isAnswered: true }
      }),
      // Tổng số upvotes (dựa vào trường cache upvotes trong bảng Question)
      prisma.question.aggregate({
        _sum: { upvotes: true },
        where: { eventId: { in: eventIds } }
      })
    ]);

    // 3. Lấy Top 5 câu hỏi nhiều vote nhất
    const topQuestions = await prisma.question.findMany({
      where: { eventId: { in: eventIds } },
      orderBy: { upvotes: 'desc' },
      take: 5,
      include: {
        event: { select: { title: true, code: true } },
        author: { select: { fullName: true, avatarUrl: true } }
      }
    });

    // 4. Format dữ liệu trả về
    const stats = {
      totalQuestions,
      totalVotes: voteStats._sum.upvotes || 0,
      answeredRate: totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0,
      activeEvents: userEvents.length
    };

    res.json({ stats, topQuestions });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Lỗi lấy dữ liệu thống kê" });
  }
};