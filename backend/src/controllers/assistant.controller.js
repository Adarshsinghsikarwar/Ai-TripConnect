import assistantService from "../services/assistant.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

// req.userId comes from the requireAuth middleware (decoded from the JWT
// access token). We pass it into the service so get_booking_status can ONLY
// ever look up bookings belonging to THIS user — never anyone else's.

const ask = asyncHandler(async (req, res) => {
  const result = await assistantService.ask(req.userId, req.body.question);
  res.status(200).json(new ApiResponse(200, result));
});

export { ask };
