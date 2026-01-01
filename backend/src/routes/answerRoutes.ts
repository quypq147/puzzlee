import { Router } from "express";
import { authenticateTokenOptional } from "../middleware/auth";
import { createAnswer, getAnswersByQuestion } from "../controllers/answerController";

const router = Router();
// Dùng Optional Auth để Guest cũng gọi được
router.post("/", authenticateTokenOptional, createAnswer);
router.get("/:questionId", authenticateTokenOptional, getAnswersByQuestion); // [MỚI]

export default router;