import itineraryService from '../services/itinerary.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

const generateItinerary = asyncHandler(async (req, res) => {
  const { tripId, destination, days, budget, interests } = req.body;
  const itinerary = await itineraryService.generate(req.userId, tripId, { destination, days, budget, interests });
  res.status(201).json(new ApiResponse(201, itinerary, 'Itinerary generated'));
});

const getItineraryForTrip = asyncHandler(async (req, res) => {
  const itinerary = await itineraryService.getForTrip(req.params.tripId);
  res.status(200).json(new ApiResponse(200, itinerary));
});

export { generateItinerary, getItineraryForTrip };
export default { generateItinerary, getItineraryForTrip };