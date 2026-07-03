import userRepo from "../repositories/user.repository.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";

// GET /api/v1/users/me — returns the logged-in user's own profile
const getMe = asyncHandler(async (req, res) => {
  const user = await userRepo.findById(req.userId);
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json(new ApiResponse(200, user));
});

// PATCH /api/v1/users/me — update name, phone, or avatarUrl
// Intentionally blocks role/email/password changes here — those have
// their own dedicated flows (admin sets roles, separate change-password endpoint).
const updateMe = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "avatarUrl"];
  const update = {};

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) update[field] = req.body[field];
  });

  if (Object.keys(update).length === 0) {
    throw new ApiError(
      400,
      "No updatable fields provided (allowed: name, phone, avatarUrl)"
    );
  }

  const user = await userRepo.updateProfile(req.userId, update);
  res.status(200).json(new ApiResponse(200, user, "Profile updated"));
});

export { getMe, updateMe };
