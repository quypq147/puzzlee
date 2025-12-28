import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ message: "Forbidden: Yêu cầu quyền Admin" });
  }
  next();
};