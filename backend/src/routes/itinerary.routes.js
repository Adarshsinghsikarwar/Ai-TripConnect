import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  generateItinerary,
  getItineraryForTrip,
} from "../controllers/itinerary.controller.js";

const router = express.Router();

router.post("/generate", requireAuth, generateItinerary);
router.get("/trip/:tripId", requireAuth, getItineraryForTrip);
export default router;
