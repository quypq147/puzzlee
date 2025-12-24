import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Lấy danh sách câu hỏi của một sự kiện
export const getQuestionsByEvent = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user?.userId;

    // Lấy câu hỏi kèm thông tin người tạo và kiểm tra xem user hiện tại đã vote chưa
    const questions = await prisma.question.findMany({
      where: { 
        eventId,
        status: { not: "HIDDEN" } // Mặc định không lấy câu hỏi bị ẩn
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true
          }
        },
        votes: {
          where: { userId: userId }, // Chỉ lấy vote của user hiện tại để check trạng thái
          select: { value: true }
        }
      },
      orderBy: [
        { isPinned: 'desc' }, // Câu ghim lên đầu
        { score: 'desc' },    // Điểm cao xếp trên
        { createdAt: 'desc' } // Mới nhất
      ]
    });

    // Format lại dữ liệu để frontend dễ dùng (map vote của user ra field riêng)
    const formattedQuestions = questions.map(q => ({
      ...q,
      userVote: q.votes.length > 0 ? q.votes[0].value : 0 // 1, -1 hoặc 0
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy danh sách câu hỏi" });
  }
};

// Cập nhật trạng thái câu hỏi (Duyệt, Ẩn, Ghim, Đánh dấu đã trả lời) - Dành cho Host/Mod
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, isPinned, isAnswered } = req.body;

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        status,     // VISIBLE, HIDDEN, ANSWERED
        isPinned,
        isAnswered
      }
    });

    // Lưu ý: Sau khi update DB, bạn nên bắn socket event để các client khác cập nhật ngay lập tức
    // Ví dụ: req.app.get('io').to(eventId).emit('update-question', updatedQuestion);
    // Để làm được điều này cần export io instance hoặc truyền qua middleware.
    
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật câu hỏi" });
  }
};

// Xóa câu hỏi
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.question.delete({ where: { id } });
    res.json({ message: "Đã xóa câu hỏi" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa câu hỏi" });
  }
};