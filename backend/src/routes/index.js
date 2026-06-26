import express from "express";
import authRoutes from "./auth.routes.js";
import tripRoutes from "./trip.routes.js";
import expenseRoutes from "./expenses.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/trips", tripRoutes);
router.use("/expenses", expenseRoutes);

export default router;
