import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { 
  getQuestionsByEvent, 
  updateQuestion, 
  deleteQuestion 
} from "../controllers/questionController";

const router = Router();

// Lấy danh sách câu hỏi cho event
router.get("/event/:eventId", authenticateToken, getQuestionsByEvent);

// Các hành động quản lý (cần check quyền Host ở middleware nâng cao sau này)
router.patch("/:id", authenticateToken, updateQuestion);
router.delete("/:id", authenticateToken, deleteQuestion);

export default router;