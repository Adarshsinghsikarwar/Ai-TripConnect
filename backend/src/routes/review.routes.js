import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createBookingValidator } from "../validators/booking.validator.js";
import {
  createReview,
  getForProvider,
} from "../controllers/review.controller.js";

const router = express.Router();

router.get("/provider/:providerId", getForProvider); // public
router.post("/", requireAuth, createReviewValidator, validate, createReview);

export default router;
