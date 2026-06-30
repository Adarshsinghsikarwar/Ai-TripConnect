import analyticsService from '../services/analytics.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';

const getAdminDashboard = asyncHandler(async (req, res) => {
  const [data] = await analyticsService.getAdminDashboard();
  res.status(200).json(new ApiResponse(200, data));
});

const getTopRatedProviders = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTopRatedProviders();
  res.status(200).json(new ApiResponse(200, data));
});

const getPendingVerifications = asyncHandler(async (req, res) => {
  const data = await analyticsService.getPendingProviderVerifications();
  res.status(200).json(new ApiResponse(200, data));
});

export { getAdminDashboard, getTopRatedProviders, getPendingVerifications };
export default { getAdminDashboard, getTopRatedProviders, getPendingVerifications };