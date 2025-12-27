import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { getProfile, updateProfile } from "../controllers/userController";

const router = Router();

router.patch("/profile", authenticateToken, updateProfile);
router.get("/profile", authenticateToken, getProfile);

export default router;