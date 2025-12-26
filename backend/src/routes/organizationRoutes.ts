import { Router } from 'express';
import { createOrganization, getMyOrganizations } from '../controllers/organizationController';
import { authenticateToken } from '../middleware/auth'; // Middleware xác thực JWT

const router = Router();

// Tất cả routes này đều cần login
router.use(authenticateToken);

router.get('/', getMyOrganizations);
router.post('/', createOrganization);

export default router;