import { Router } from 'express';
import { createOrganization, getMyOrganizations , updateOrganization , getOrganizationMembers } from '../controllers/organizationController';
import { authenticateToken, requireOrgRole } from '../middleware/auth'; // Middleware xác thực JWT

const router = Router();

// Tất cả routes này đều cần login
router.patch(
  "/:id", 
  authenticateToken, 
  requireOrgRole(['OWNER', 'ADMIN']), // <--- Check quyền Organization
);
router.get('/', authenticateToken, getMyOrganizations);
router.post('/', authenticateToken, createOrganization);
router.get(
  "/:id/members",
  authenticateToken,
  // Chỉ cho phép OWNER hoặc ADMIN của tổ chức xem danh sách (hoặc thêm MEMBER nếu muốn công khai)
  requireOrgRole(['OWNER', 'ADMIN', 'MEMBER']), 
  getOrganizationMembers
);
router.patch(
  "/:id", 
  authenticateToken, 
  requireOrgRole(['OWNER', 'ADMIN']),
  updateOrganization
);
export default router;