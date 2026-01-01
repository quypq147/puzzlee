import { Router } from "express";
import { authenticateTokenOptional } from "../middleware/auth";
import { createComment } from "../controllers/commentController";

const router = Router();
router.post("/", authenticateTokenOptional, createComment);

export default router;