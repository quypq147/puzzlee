import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const createComment = async (req: Request, res: Response) => {
  try {
    const { questionId, content, guestName } = req.body;
    const user = (req as any).user;
    const userId = user?.userId || null;

    if (!content) return res.status(400).json({ message: "Nội dung comment không được trống" });

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { eventId: true }
    });
    if (!question) return res.status(404).json({ message: "Câu hỏi không tồn tại" });

    let authorId = userId;
    let finalGuestName = null;

    if (!userId) {
      if (!guestName) return res.status(400).json({ message: "Vui lòng nhập tên" });
      finalGuestName = guestName;
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        questionId,
        authorId: authorId,
        guestName: finalGuestName
      },
      include: {
        author: { select: { id: true, fullName: true, avatarUrl: true } }
      }
    });

    const io = req.app.get('io');
    // Emit event comment (Frontend cần listen event này để update list comment)
    io.to(question.eventId).emit('comment:created', newComment);

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Create Comment Error:", error);
    res.status(500).json({ message: "Lỗi gửi bình luận" });
  }
};