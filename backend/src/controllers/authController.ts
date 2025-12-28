// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    // 1. Kiểm tra user đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // [FIX] Tạo username mặc định từ email + số ngẫu nhiên để tránh trùng
    // Ví dụ: email "test@gmail.com" -> username "test_1234"
    const baseUsername = email.split('@')[0];
    const uniqueUsername = `${baseUsername}_${Math.floor(Math.random() * 10000)}`;

    // 2. Transaction: Tạo User -> Tạo Org -> Add User làm Owner
    const result = await prisma.$transaction(async (tx) => {
      // A. Tạo User (Đã thêm username)
      const user = await tx.user.create({
        data: {
          email,
          username: uniqueUsername, // <--- ĐÃ THÊM DÒNG NÀY
          passwordHash: hashedPassword,
          fullName,
        },
      });

      // B. Tạo tên Organization mặc định
      const orgName = `${fullName}'s Workspace`;
      const slug = fullName.toLowerCase().replace(/ /g, '-') + '-' + Math.floor(Math.random() * 1000);

      // C. Tạo Organization và link User vào làm OWNER
      const organization = await tx.organization.create({
        data: {
          name: orgName,
          slug: slug,
          members: {
            create: {
              userId: user.id,
              role: 'OWNER',
            },
          },
        },
      });

      return { user, organization };
    });

    res.status(201).json({
      message: 'User and Organization created successfully',
      user: { id: result.user.id, email: result.user.email, username: result.user.username },
      organization: result.organization,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Tạo Token
    const token = jwt.sign(
      { userId: user.id, role: user.systemRole },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.fullName, email: user.email } });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};