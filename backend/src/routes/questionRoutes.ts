// backend/src/routes/questionRoutes.ts
import { Router } from "express";
import { authenticateToken, authenticateTokenOptional } from "../middleware/auth"; // Đảm bảo import đủ
import { 
  getQuestionsByEvent, 
  createQuestion,
  voteQuestion,
  updateQuestion, 
  deleteQuestion 
} from "../controllers/questionController";
import { 
  votePoll // [MỚI]
} from "../controllers/questionController";

const router = Router();

router.get("/", authenticateTokenOptional, getQuestionsByEvent);
router.post("/", authenticateTokenOptional, createQuestion);

// [SỬA] Đổi thành Optional để Guest cũng vote được
router.post("/:questionId/vote", authenticateTokenOptional, voteQuestion);
// [MỚI] Route cho Poll Vote (Dùng Optional Auth để ẩn danh cũng vote được)
router.post("/:questionId/poll-vote", authenticateTokenOptional, votePoll);

router.patch("/:id", authenticateToken, updateQuestion);
router.delete("/:id", authenticateToken, deleteQuestion);

export default router;