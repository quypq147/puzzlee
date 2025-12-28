import { Router } from 'express';
import { createOrganization, getMyOrganizations } from '../controllers/organizationController';
import { authenticateToken, requireOrgRole } from '../middleware/auth'; // Middleware xác thực JWT

const router = Router();

// Tất cả routes này đều cần login
router.patch(
  "/:id", 
  authenticateToken, 
  requireOrgRole(['OWNER', 'ADMIN']), // <--- Check quyền Organization
);

router.get('/', getMyOrganizations);
router.post('/', createOrganization);

export default router;