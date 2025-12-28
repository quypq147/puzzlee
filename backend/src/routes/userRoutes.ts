import { Router } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth"; // Import thêm requireAdmin
import { 
  getProfile, 
  updateProfile, 
  getAllUsers, 
  updateUserRole, 
  deleteUser,
  getUserAnalytics
} from "../controllers/userController";

const router = Router();

// Route cá nhân (User tự quản lý)
router.get("/profile", authenticateToken, getProfile);
router.patch("/profile", authenticateToken, updateProfile);

// Route quản trị (Chỉ Admin mới truy cập được)
router.get("/", authenticateToken, requireAdmin, getAllUsers);       // GET /api/users
router.patch("/:id/role", authenticateToken, requireAdmin, updateUserRole); // PATCH /api/users/:id/role
router.delete("/:id", authenticateToken, requireAdmin, deleteUser); // DELETE /api/users/:id
router.get("/analytics", authenticateToken, getUserAnalytics); // GET /api/users/analytics

export default router;