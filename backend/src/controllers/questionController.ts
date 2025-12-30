import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { QuestionType } from "../../generated/prisma"; // Import Enum từ Prisma

// Helper: Lấy Event ID từ ID hoặc Code
async function resolveEventId(idOrCode: string): Promise<string | null> {
  // Check nếu là UUID hợp lệ (đơn giản)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrCode);
  
  if (isUUID) return idOrCode;

  // Nếu không phải UUID, tìm theo Code
  const event = await prisma.event.findUnique({
    where: { code: idOrCode },
    select: { id: true }
  });
  return event ? event.id : null;
}

// 1. Lấy danh sách câu hỏi
export const getQuestionsByEvent = async (req: Request, res: Response) => {
  try {
    let { eventId } = req.query;
    if (!eventId) return res.status(400).json({ message: "Thiếu eventId" });

    const realEventId = await resolveEventId(eventId as string);
    if (!realEventId) return res.status(404).json({ message: "Sự kiện không tồn tại" });

    const user = (req as any).user;
    const userId = user?.userId || "";
    
    const questions = await prisma.question.findMany({
      where: { 
        eventId: realEventId,
        status: { not: "HIDDEN" }
      },
      include: {
        author: {
          select: { id: true, username: true, fullName: true, avatarUrl: true }
        },
        votes: {
          where: { userId: userId || "" },
          select: { type: true }
        },
        pollOptions: {
          include: {
             _count: { select: { votes: true } },
             votes: { where: { userId: userId || "" }, select: { userId: true } }
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { upvotes: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // [FIX] Lấy Role của Author trong Event này
    // Cách tối ưu hơn là dùng include lồng nhau, nhưng để đơn giản ta map lại:
    const authorIds = questions
        .map(q => q.authorId)
        .filter((id): id is string => id !== null);
    
    // Tìm danh sách member tương ứng với các author trên
    const members = await prisma.eventMember.findMany({
        where: {
            eventId: realEventId,
            userId: { in: authorIds }
        },
        select: { userId: true, role: true }
    });

    // Tạo Map để tra cứu nhanh: userId -> role
    const roleMap = new Map(members.map(m => [m.userId, m.role]));

    const formattedQuestions = questions.map(q => {
      let userVoteValue = 0;
      if (q.votes.length > 0) userVoteValue = q.votes[0].type === 'UPVOTE' ? 1 : -1;

      const formattedOptions = q.pollOptions.map(opt => ({
        id: opt.id,
        content: opt.content,
        voteCount: opt._count.votes,
        isVoted: opt.votes.length > 0
      }));

      // [FIX] Gán role vào response
      const authorRole = q.authorId ? roleMap.get(q.authorId) : null;

      return {
        ...q,
        userVote: userVoteValue,
        votes: undefined,
        pollOptions: formattedOptions,
        authorRole: authorRole // Trả về role (HOST, MODERATOR, MEMBER)
      };
    });

    res.json(formattedQuestions);
  } catch (error) {
    console.error("Get Questions Error:", error);
    res.status(500).json({ message: "Lỗi lấy danh sách câu hỏi" });
  }
};

// 2. Tạo câu hỏi mới (Hỗ trợ Q&A, Poll, Quiz)
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { content, isAnonymous, eventId, type, pollOptions } = req.body;
    const user = (req as any).user;
    const userId = user?.userId || null; 


    // [FIX] Convert Code -> UUID
    const realEventId = await resolveEventId(eventId);
    if (!realEventId) return res.status(404).json({ message: "Sự kiện không tồn tại" });

    let finalAuthorId = userId;
    if (isAnonymous) finalAuthorId = null;
    // Validate loại câu hỏi
    const questionType = (type && ['QA', 'POLL', 'QUIZ'].includes(type)) 
      ? type as QuestionType 
      : QuestionType.QA;

    const newQuestion = await prisma.question.create({
      data: {
        content,
        isAnonymous : isAnonymous || false,
        eventId: realEventId,
        authorId: finalAuthorId,
        status: "PENDING", // Hoặc APPROVED tuỳ setting
        type: questionType,
        
        // [MỚI] Tạo options nếu là Poll/Quiz
        pollOptions: (questionType !== 'QA' && Array.isArray(pollOptions)) ? {
            create: pollOptions.map((opt: any) => ({
                content: opt.content
                // Lưu ý: Database hiện tại chưa có trường isCorrect cho Quiz trong PollOption
                // Nếu muốn làm Quiz, cần thêm field `isCorrect Boolean @default(false)` vào model PollOption
            }))
        } : undefined
      },
      include: {
        author: { select: { id: true, username: true, fullName: true, avatarUrl: true } },
        pollOptions: true
      }
    });

    // Realtime: Emit đúng room (dùng Code hay ID tuỳ frontend join room nào, thống nhất dùng Event ID cho an toàn)
    const io = req.app.get('io');
    io.to(realEventId).emit('question:created', newQuestion);
    // Emit thêm vào room code để chắc chắn (nếu frontend join bằng code)
    io.to(eventId).emit('question:created', newQuestion);

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error("Create Question Error:", error);
    res.status(500).json({ message: "Lỗi tạo câu hỏi" });
  }
};

// 3. Vote câu hỏi (Upvote/Downvote Q&A)
export const voteQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const { type } = req.body; 
    const userId = (req as any).user.userId;

    const result = await prisma.$transaction(async (tx) => {
      // Upsert vote
      await tx.vote.upsert({
        where: { questionId_userId: { questionId, userId } },
        update: { type },
        create: { questionId, userId, type }
      });

      // Recalculate score
      const upvotesCount = await tx.vote.count({ where: { questionId, type: 'UPVOTE' } });
      const downvotesCount = await tx.vote.count({ where: { questionId, type: 'DOWNVOTE' } });
      const newScore = upvotesCount - downvotesCount;

      // Update Question
      const updatedQ = await tx.question.update({
        where: { id: questionId },
        data: { upvotes: newScore },
        include: { 
             author: { select: { id: true, username: true, fullName: true, avatarUrl: true } }
        }
      });
      return updatedQ;
    });

    const io = req.app.get('io');
    io.to(result.eventId).emit('question:updated', result);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi vote câu hỏi" });
  }
};

// 4. Update (Ghim, Ẩn...)
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

// 5. Delete
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const question = await prisma.question.findUnique({ where: { id } });
    if (!question) return res.status(404).json({ message: "Không tìm thấy" });

    await prisma.question.delete({ where: { id } });

    const io = req.app.get('io');
    io.to(question.eventId).emit('question:deleted', { id });

    res.json({ message: "Đã xóa", id });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa câu hỏi" });
  }
};