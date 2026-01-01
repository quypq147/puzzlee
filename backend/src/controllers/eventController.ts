import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

// Tạo sự kiện mới
export const createEvent = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { title, description, startDate, organizationId } = req.body;

    // 1. Kiểm tra User có phải là Admin/Owner của Org này không
    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId
        }
      }
    });

    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'You do not have permission to create events in this organization' });
    }

    // 2. Tạo Event
    // Tạo code ngẫu nhiên 5 ký tự
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();

    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: startDate || new Date(),
        code,
        organizationId,
        creatorId: userId
      }
    });

    res.status(201).json(event);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating event' });
  }
};

// Lấy danh sách sự kiện của 1 Organization
export const getEventsByOrg = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    
    const events = await prisma.event.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
};

// Join event (Người tham gia nhập code)
export const joinEventByCode = async (req: Request, res: Response) => {
  try {
    // 1. FIX CRASH: Dùng optional chaining (?.) để lấy userId an toàn
    // Nếu là khách, userId sẽ là undefined thay vì gây lỗi
    const userId = (req as any).user?.userId; 
    
    // Lấy thêm nickname từ body (do Frontend gửi lên)
    const { code, nickname } = req.body;

    // 2. Tìm sự kiện
    const event = await prisma.event.findUnique({ where: { code } });
    
    if (!event) {
        return res.status(404).json({ message: 'Sự kiện không tồn tại' });
    }
    
    if (!event.isActive) {
        return res.status(400).json({ message: 'Sự kiện đã kết thúc' });
    }

    // 3. Xử lý lưu Member vào DB
    if (userId) {
      // TRƯỜNG HỢP 1: Đã đăng nhập -> Lưu vào DB
      // Kiểm tra xem đã join chưa để tránh lỗi Duplicate Key
      const existingMember = await prisma.eventMember.findUnique({
        where: {
          eventId_userId: { eventId: event.id, userId }
        }
      });

      if (!existingMember) {
        await prisma.eventMember.create({
          data: {
            eventId: event.id,
            userId: userId,
            role: 'PARTICIPANT'
          }
        });
      }
    } else {
      // TRƯỜNG HỢP 2: Khách ẩn danh
      // HIỆN TẠI: Schema DB của bạn yêu cầu "userId" bắt buộc trong bảng "EventMember".
      // Do đó, ta KHÔNG THỂ lưu khách vào DB lúc này (trừ khi sửa Schema).
      // GIẢI PHÁP: Chỉ trả về thành công để Frontend cho vào phòng.
      // (Khách sẽ tương tác qua Socket hoặc API với danh nghĩa ẩn danh sau)
      
      console.log(`Khách ${nickname || 'Ẩn danh'} đang tham gia sự kiện ${code}`);
    }


    // [MỚI] Emit socket event để thông báo cho mọi người trong phòng biết có người mới
    const io = req.app.get('io');
    io.to(event.id).emit('participant:joined', {
      guestName: nickname || "Ẩn danh",
      userId: userId || null,
      timestamp: new Date()
    });

    // 4. Trả về kết quả thành công
    res.json({ 
      message: 'Joined successfully', 
      event,
      // Trả lại nickname để frontend lưu vào session/localStorage nếu cần
      guestName: nickname || "Anonymous" 
    });

  } catch (error) {
    console.error("Join Error:", error); // Log lỗi ra terminal để dễ debug
    res.status(500).json({ message: 'Lỗi server khi tham gia phòng' });
  }
};
export const getEventByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const userId = (req as any).user.userId;

    const event = await prisma.event.findUnique({
      where: { code },
      include: {
        organization: true // Lấy thêm info org để hiển thị nếu cần
      }
    });

    if (!event) return res.status(404).json({ message: 'Event not found' });

    // (Tuỳ chọn) Kiểm tra quyền truy cập nếu cần bảo mật chặt chẽ hơn
    // Ở đây tạm thời cho phép người dùng xem nếu họ biết code (hoặc check member)

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event details' });
  }
};
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Thêm settings và endDate vào body nhận được
    const { title, description, startDate, endDate, isActive, settings } = req.body;
    const userId = (req as any).user.userId;

    // 1. Check quyền (Owner/Admin)
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: event.organizationId
        }
      }
    });

    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // 2. Update
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        startDate,
        endDate,     
        settings,    
        isActive
      }
    });

    res.json(updatedEvent);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi cập nhật sự kiện' });
  }
};
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    // A. Kiểm tra quyền (Tương tự update)
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: event.organizationId
        }
      }
    });

    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'Không có quyền xóa sự kiện này' });
    }

    // B. Xóa
    await prisma.event.delete({ where: { id } });

    res.json({ message: 'Đã xóa sự kiện thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa sự kiện' });
  }
};
export const getEventStats = async (req: Request, res: Response) => {
  try {
    const { code } = req.params; // Nhận code từ URL

    // 1. Lấy ID sự kiện từ Code
    const event = await prisma.event.findUnique({
      where: { code },
      select: { id: true, title: true }
    });

    if (!event) return res.status(404).json({ message: 'Event not found' });

    // 2. Chạy các query thống kê song song (Promise.all) để tối ưu tốc độ
    const [memberCount, questionCount, voteData, statusDistribution] = await Promise.all([
      // Đếm số người tham gia
      prisma.eventMember.count({
        where: { eventId: event.id }
      }),
      // Đếm tổng số câu hỏi
      prisma.question.count({
        where: { eventId: event.id }
      }),
      // Tính tổng số vote (dựa trên cột upvotes được cache trong bảng Question)
      prisma.question.aggregate({
        _sum: { upvotes: true },
        where: { eventId: event.id }
      }),
      // Nhóm câu hỏi theo trạng thái (Approved, Pending, Hidden...)
      prisma.question.groupBy({
        by: ['status'],
        where: { eventId: event.id },
        _count: { status: true }
      })
    ]);

    // 3. Format dữ liệu trả về
    const stats = {
      eventName: event.title,
      totalMembers: memberCount,
      totalQuestions: questionCount,
      totalVotes: voteData._sum.upvotes || 0,
      // Map mảng group by thành object: { APPROVED: 5, PENDING: 2 }
      questionsByStatus: statusDistribution.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {} as Record<string, number>)
    };

    res.json(stats);

  } catch (error) {
    console.error("Event Stats Error:", error);
    res.status(500).json({ message: 'Lỗi lấy thống kê sự kiện' });
  }
};
export const getEventByCodePublic = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { code: code.toUpperCase() }, // Đảm bảo code viết hoa
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
        startDate: true,
        isActive: true,
        settings: true,
        // Không trả về danh sách câu hỏi ở đây để bảo mật/tối ưu
      }
    });

    if (!event) {
      return res.status(404).json({ message: "Sự kiện không tồn tại" });
    }

    if (!event.isActive) {
      return res.status(400).json({ message: "Sự kiện đã đóng" });
    }

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};