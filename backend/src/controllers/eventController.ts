import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { customAlphabet } from "nanoid";

const prisma = new PrismaClient();
const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6); // Tạo mã 6 ký tự

// Tạo sự kiện mới
export const createEvent = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { title, description } = req.body;

    // Tạo code unique
    let code = nanoid();
    let isUnique = false;
    while (!isUnique) {
      const existing = await prisma.event.findUnique({ where: { code } });
      if (!existing) isUnique = true;
      else code = nanoid();
    }

    // Transaction: Tạo Event và Add User làm HOST
    const event = await prisma.event.create({
      data: {
        title,
        description,
        code,
        createdBy: userId,
        members: {
          create: {
            userId: userId,
            role: "HOST",
          },
        },
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi tạo sự kiện" });
  }
};

// Lấy danh sách sự kiện mà user đã tham gia hoặc tạo
export const getMyEvents = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.userId;

    const events = await prisma.event.findMany({
      where: {
        members: {
          some: { userId: userId },
        },
      },
      include: {
        _count: {
          select: { members: true, questions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách sự kiện" });
  }
};

// Lấy chi tiết sự kiện bằng ID (Dành cho trang Dashboard/Room)
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: true } // Lấy thông tin user của thành viên
        }
      }
    });

    if (!event) return res.status(404).json({ message: "Không tìm thấy sự kiện" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy thông tin sự kiện" });
  }
};

// Lấy sự kiện bằng Code (Dành cho màn hình Join)
export const getEventByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const event = await prisma.event.findUnique({
      where: { code },
      select: {
        id: true,
        title: true,
        description: true,
        code: true,
        startTime: true
      }
    });

    if (!event) return res.status(404).json({ message: "Mã sự kiện không hợp lệ" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Tham gia sự kiện
export const joinEvent = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { code } = req.body;

    const event = await prisma.event.findUnique({ where: { code } });
    if (!event) return res.status(404).json({ message: "Sự kiện không tồn tại" });

    // Kiểm tra đã tham gia chưa
    const existingMember = await prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: userId
        }
      }
    });

    if (existingMember) {
      return res.json({ message: "Đã tham gia sự kiện", eventId: event.id });
    }

    // Thêm vào bảng thành viên
    await prisma.eventMember.create({
      data: {
        eventId: event.id,
        userId: userId,
        role: "PARTICIPANT"
      }
    });

    res.json({ message: "Tham gia thành công", eventId: event.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi tham gia sự kiện" });
  }
};