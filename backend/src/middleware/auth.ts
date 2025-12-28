import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { EventRole, OrganizationRole } from 'generated/prisma/client';


export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user; // Gán user vào request để Controller dùng
    next();
  });
};
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  // Kiểm tra role trong token (được sign lúc login trong authController)
  if (!user || user.systemRole !== 'ADMIN') { 
    return res.status(403).json({ message: "Forbidden: Yêu cầu quyền Admin" });
  }
  next();
};
export const requireOrgRole = (roles: OrganizationRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;
      // Lấy orgId từ params (:id) hoặc body
      const organizationId = req.params.id || req.body.organizationId || req.query.organizationId;

      if (!organizationId) {
        return res.status(400).json({ message: "Thiếu organizationId" });
      }

      const member = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: userId,
            organizationId: String(organizationId)
          }
        }
      });

      if (!member || !roles.includes(member.role)) {
        return res.status(403).json({ message: "Bạn không có quyền trong tổ chức này" });
      }

      next();
    } catch (error) {
      console.error("Org Auth Error", error);
      res.status(500).json({ message: "Lỗi xác thực quyền tổ chức" });
    }
  };
};

// 2. Middleware kiểm tra quyền trong SỰ KIỆN (Dùng cho trang Event/Room)
export const requireEventRole = (roles: EventRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;
      
      // [QUAN TRỌNG] Lấy eventId linh hoạt từ query hoặc params
      // Vì nãy chúng ta sửa getQuestions dùng query, còn update/delete thường dùng params
      let eventId = req.params.eventId || req.query.eventId || req.body.eventId;
      
      // Trường hợp đặc biệt: Nếu gọi route dạng /api/questions/:id (vote/delete), 
      // ta phải tìm eventId từ questionId trong database trước (tốn thêm 1 query)
      // Để tối ưu, tốt nhất Frontend nên gửi kèm eventId nếu có thể.
      // Ở đây giả sử ta luôn lấy được eventId.

      if (!eventId) {
        // Nếu route là /:id (của question), ta cần query ngược lại eventId
        if (req.params.id) {
           const question = await prisma.question.findUnique({
             where: { id: req.params.id },
             select: { eventId: true }
           });
           if (question) eventId = question.eventId;
        }
      }

      if (!eventId) {
        return res.status(400).json({ message: "Không xác định được Event để kiểm tra quyền" });
      }

      const member = await prisma.eventMember.findUnique({
        where: {
          eventId_userId: {
            eventId: String(eventId),
            userId: userId
          }
        }
      });

      // Nếu là HOST thì có toàn quyền (thường logic là vậy)
      // Hoặc check đúng role trong danh sách cho phép
      if (!member || !roles.includes(member.role)) {
        return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này trong sự kiện" });
      }

      next();
    } catch (error) {
      console.error("Event Auth Error", error);
      res.status(500).json({ message: "Lỗi xác thực quyền sự kiện" });
    }
  };
};