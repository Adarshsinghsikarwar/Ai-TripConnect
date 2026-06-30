import { body } from 'express-validator';

const createReviewValidator = [
  body('booking').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ max: 1000 }),
];

export { createReviewValidator };
export default { createReviewValidator };