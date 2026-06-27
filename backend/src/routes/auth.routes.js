import express from "express";
import passport from "passport";
import {
  register,
  login,
  refresh,
  logout,
  googleCallback,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh); // reads refreshToken cookie, no access token needed
router.post("/logout", requireAuth, logout);

export default router;
