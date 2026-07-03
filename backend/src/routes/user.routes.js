import express from "express";
import requireAuth from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { updateProfileValidator } from "../validators/auth.validator.js";
import { getMe, updateMe } from "../controllers/user.controller.js";

const router = express.Router();
router.use(requireAuth);
router.get("/me", getMe);
router.patch("/me", updateProfileValidator, validate, updateMe);

export default router;
