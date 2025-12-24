import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { updateProfile } from "../controllers/userController";

const router = Router();

router.patch("/profile", authenticateToken, updateProfile);

export default router;