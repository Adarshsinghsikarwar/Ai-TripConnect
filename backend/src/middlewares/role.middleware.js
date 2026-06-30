import ApiError from '../utils/apiError.js';
import userRepo from '../repositories/user.repository.js';
import asyncHandler from '../utils/asyncHandler.js';

// Use after requireAuth. Usage: requireRole('admin') or requireRole('provider', 'admin')
const requireRole = (...allowedRoles) =>
  asyncHandler(async (req, res, next) => {
    const user = await userRepo.findById(req.userId);
    if (!user) throw new ApiError(401, 'User not found');

    const hasRole = user.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole) throw new ApiError(403, 'You do not have permission to do this');

    req.user = user;
    next();
  });

export default requireRole;