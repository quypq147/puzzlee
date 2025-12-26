import { Router } from 'express';
import { createEvent, getEventsByOrg, joinEventByCode } from '../controllers/eventController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/join', authenticateToken, joinEventByCode); // Join bằng code

// Routes quản lý (Cần login)
router.post('/', authenticateToken, createEvent);
router.get('/org/:orgId', authenticateToken, getEventsByOrg);

export default router;