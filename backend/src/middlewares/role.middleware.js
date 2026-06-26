import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import userRepository from "../repositories/user.repository.js";


// Use after requireAuth. Usage: requireRole('admin')
const requireRole = (...allowedRoles) =>
  asyncHandler(async (req, res, next) => {
    const user = await userRepo.findById(req.userId);
    if (!user || !allowedRoles.includes(user.role)) {
      throw new ApiError(403, 'You do not have permission to do this');
    }
    next();
  });

  export { requireRole };