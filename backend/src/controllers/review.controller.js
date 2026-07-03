import reviewService from '../services/review.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.userId, req.body);
  res.status(201).json(new ApiResponse(201, review, 'Review submitted'));
});

const getForProvider = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getForProvider(req.params.providerId);
  res.status(200).json(new ApiResponse(200, reviews));
});

const getSummary = asyncHandler(async (req, res) => {
  const summary = await reviewService.summarizeForProvider(req.params.providerId);
  res.status(200).json(new ApiResponse(200, summary));
});

export { createReview, getForProvider, getSummary };
export default { createReview, getForProvider, getSummary };