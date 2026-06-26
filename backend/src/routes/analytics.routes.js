import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { getAdminDashboard, getTopRatedGuides } from "../controllers/analytics.controller.js";


const router = express.Router();
router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/top-guides', getTopRatedGuides);

export default router;