import { validationResult } from 'express-validator';
import ApiError from '../utils/apiError.js';

// Runs after a validator chain. If express-validator collected any errors,
// short-circuit with a 400 instead of letting bad data reach the service layer.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(', ');
    return next(new ApiError(400, message));
  }
  next();
}

export default validate;