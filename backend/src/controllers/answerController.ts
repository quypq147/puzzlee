// [MỚI] Lấy danh sách câu trả lời theo Question ID
export const getAnswersByQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const answers = await prisma.answer.findMany({
      where: { questionId },
      include: {
        author: { select: { id: true, fullName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách câu trả lời" });
  }
};
import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const createAnswer = async (req: Request, res: Response) => {
  try {
    const { questionId, content, guestName } = req.body;
    const user = (req as any).user;
    const userId = user?.userId || null;

    if (!content) return res.status(400).json({ message: "Nội dung không được để trống" });

    // Lấy thông tin Question để biết EventId (cho socket)
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { eventId: true }
    });
    if (!question) return res.status(404).json({ message: "Câu hỏi không tồn tại" });

    // Xử lý Author hoặc Guest
    let authorId = userId;
    let finalGuestName = null;

    if (!userId) {
      if (!guestName) return res.status(400).json({ message: "Vui lòng nhập tên" });
      finalGuestName = guestName;
    }

    const newAnswer = await prisma.answer.create({
      data: {
        content,
        questionId,
        authorId: authorId,      // Có thể null
        guestName: finalGuestName // Tên khách
      },
      include: {
        author: { select: { id: true, fullName: true, avatarUrl: true } }
      }
    });

    // Bắn socket realtime
    const io = req.app.get('io');
    io.to(question.eventId).emit('answer:created', newAnswer);

    res.status(201).json(newAnswer);
  } catch (error) {
    console.error("Create Answer Error:", error);
    res.status(500).json({ message: "Lỗi gửi câu trả lời" });
  }
};