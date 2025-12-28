// backend/src/controllers/questionController.ts
import { Request, Response } from "express";
import { prisma  } from "../../lib/prisma";

// 1. Lấy danh sách câu hỏi (Mới thêm)
export const getQuestionsByEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.query.eventId as string;
    // Lấy userId để check xem user này đã vote câu nào chưa (nếu cần)
    const userId = (req as any).user?.userId;

    const questions = await prisma.question.findMany({
      where: { 
        eventId,
        // Có thể filter status nếu muốn, VD: status: { not: "HIDDEN" }
      },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatarUrl: true }
        },
        // Lấy thông tin vote của user hiện tại để hiển thị nút đã like/dislike
        votes: {
          where: { userId: userId || "" },
          select: { type: true }
        }
      },
      orderBy: [
        { isPinned: 'desc' }, // Câu ghim lên đầu
        { upvotes: 'desc' },  // Nhiều vote lên nhì
        { createdAt: 'desc' } // Mới nhất xuống dưới
      ]
    });

    // Format lại dữ liệu để Frontend dễ dùng (Map votes[] -> userVote)
    const formattedQuestions = questions.map(q => {
      let userVoteValue = 0; // 0: chưa vote, 1: upvote, -1: downvote
      if (q.votes.length > 0) {
         userVoteValue = q.votes[0].type === 'UPVOTE' ? 1 : -1;
      }
      return {
        ...q,
        userVote: userVoteValue,
        votes: undefined // Ẩn mảng votes thô đi cho gọn
      };
    });

    res.json(formattedQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi lấy danh sách câu hỏi" });
  }
};

// 2. Tạo câu hỏi mới
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { content, isAnonymous, eventId } = req.body;
    const userId = (req as any).user?.userId; 

    const newQuestion = await prisma.question.create({
      data: {
        content,
        isAnonymous,
        eventId,
        authorId: isAnonymous ? null : userId,
        status: "PENDING",
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
      }
    });

    // Realtime
    const io = req.app.get('io');
    io.to(eventId).emit('question:created', newQuestion);

    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo câu hỏi" });
  }
};

// 3. Vote câu hỏi
export const voteQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const { type } = req.body; 
    const userId = (req as any).user.userId;

    const result = await prisma.$transaction(async (tx) => {
      await tx.vote.upsert({
        where: { questionId_userId: { questionId, userId } },
        update: { type },
        create: { questionId, userId, type }
      });

      const upvotesCount = await tx.vote.count({ where: { questionId, type: 'UPVOTE' } });
      const downvotesCount = await tx.vote.count({ where: { questionId, type: 'DOWNVOTE' } });
      const newScore = upvotesCount - downvotesCount;

      const updatedQ = await tx.question.update({
        where: { id: questionId },
        data: { upvotes: newScore },
        include: { // Trả về author để frontend update state không bị mất avatar
             author: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
        }
      });

      return updatedQ;
    });

    // Realtime
    const io = req.app.get('io');
    io.to(result.eventId).emit('question:updated', result); // Dùng chung event update

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi vote câu hỏi" });
  }
};

// 4. Cập nhật câu hỏi (Ghim, Ẩn, Trả lời xong) - (Mới thêm)
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, isPinned, isAnswered } = req.body;

    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: { status, isPinned, isAnswered },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
      }
    });

    const io = req.app.get('io');
    io.to(updatedQuestion.eventId).emit('question:updated', updatedQuestion);
    
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật câu hỏi" });
  }
};

// 5. Xóa câu hỏi (Mới thêm)
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Tìm câu hỏi trước để lấy eventId bắn socket
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) return res.status(404).json({ message: "Không tìm thấy câu hỏi" });

    await prisma.question.delete({ where: { id } });

    const io = req.app.get('io');
    io.to(question.eventId).emit('question:deleted', { id });

    res.json({ message: "Đã xóa câu hỏi", id });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa câu hỏi" });
  }
};