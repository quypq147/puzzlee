import { Router } from 'express';
import { 
  createEvent, 
  getEventsByOrg, 
  joinEventByCode,
  getEventByCode, // Import mới
  updateEvent,    // Import mới
  deleteEvent,     // Import mới
  getEventStats,
  getEventByCodePublic
} from '../controllers/eventController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public / Guest (Nếu cần)
router.post('/join', joinEventByCode); 
router.get("/code/:code", getEventByCodePublic);
// Protected Routes
router.post('/', authenticateToken, createEvent);
router.get('/org/:orgId', authenticateToken, getEventsByOrg);
router.get('/:code/stats', authenticateToken, getEventStats); // GET /api/events/CODE123/stats
// [MỚI] Các route quản lý chi tiết
router.get('/:code/details', authenticateToken, getEventByCode); // GET /api/events/CODE123/details
router.patch('/:id', authenticateToken, updateEvent);            // PATCH /api/events/:id
router.delete('/:id', authenticateToken, deleteEvent);           // DELETE /api/events/:id

export default router;