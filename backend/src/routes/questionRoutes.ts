import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { 
  getQuestionsByEvent, 
  createQuestion,       // [Mới] Import thêm
  voteQuestion,         // [Mới] Import thêm
  updateQuestion, 
  deleteQuestion 
} from "../controllers/questionController";

const router = Router();

// 1. Lấy danh sách câu hỏi
// Frontend gọi: GET /api/questions?eventId=...
// Controller dùng: req.query.eventId
// -> Route phải là "/" thay vì "/event/:eventId"
router.get("/", authenticateToken, getQuestionsByEvent);

// 2. Tạo câu hỏi mới
// Frontend gọi: POST /api/questions
router.post("/", authenticateToken, createQuestion);

// 3. Vote câu hỏi
// Frontend gọi: POST /api/questions/:id/vote
router.post("/:questionId/vote", authenticateToken, voteQuestion);

// 4. Các hành động quản lý (Sửa/Xóa)
router.patch("/:id", authenticateToken, updateQuestion);
router.delete("/:id", authenticateToken, deleteQuestion);

export default router;