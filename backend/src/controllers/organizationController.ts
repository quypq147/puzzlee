import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

// Lấy danh sách Organization mà user đang tham gia
export const getMyOrganizations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId; // Lấy từ middleware auth

    const orgs = await prisma.organization.findMany({
      where: {
        members: {
          some: { userId: userId }
        }
      },
      include: {
        members: {
          where: { userId: userId },
          select: { role: true }
        }
      }
    });

    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organizations' });
  }
};

// Tạo thêm Organization mới (nếu user muốn tạo thêm ngoài cái mặc định)
export const createOrganization = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, slug } = req.body;

    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        members: {
          create: { userId, role: 'OWNER' }
        }
      }
    });

    res.status(201).json(org);
  } catch (error) {
    res.status(500).json({ message: 'Could not create organization' });
  }
};
export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body; 
    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: { name, slug }
    });

    res.json(updatedOrg);
  } catch (error) {
    res.status(500).json({ message: 'Khong the update to chuc' });
  }
};
