import express from 'express';
import requireAuth from '../middlewares/auth.middleware.js';
import { generateItinerary, getItineraryForTrip } from '../controllers/itinerary.controller.js';

const router = express.Router();
router.use(requireAuth);

router.post('/generate', generateItinerary);
router.get('/trip/:tripId', getItineraryForTrip);

export default router;