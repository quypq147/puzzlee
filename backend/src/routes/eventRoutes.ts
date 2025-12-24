import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { 
  createEvent, 
  getMyEvents, 
  getEventByCode, 
  joinEvent, 
  getEventById 
} from "../controllers/eventController";

const router = Router();

// Các routes cần đăng nhập
router.post("/", authenticateToken, createEvent);
router.get("/my-events", authenticateToken, getMyEvents);
router.post("/join", authenticateToken, joinEvent);
router.get("/:id", authenticateToken, getEventById);

// Route public (nếu muốn check code mà chưa cần login, hoặc tùy logic app bạn)
router.get("/code/:code", getEventByCode);

export default router;