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
    const userId = (req as any).user.userId; // Có thể null nếu là guest (tuỳ logic)
    const { code } = req.body;

    const event = await prisma.event.findUnique({ where: { code } });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Add user to event members (Participant)
    const member = await prisma.eventMember.create({
      data: {
        eventId: event.id,
        userId: userId,
        role: 'PARTICIPANT'
      }
    });

    res.json({ message: 'Joined successfully', event });
  } catch (error) {
    // Check lỗi duplicate key (đã join rồi)
    res.status(500).json({ message: 'Could not join event' });
  }
};