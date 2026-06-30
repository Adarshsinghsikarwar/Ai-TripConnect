import { body, query } from 'express-validator';

const createProviderValidator = [
  body('serviceType').isIn(['guide', 'driver', 'homestay', 'planner', 'photographer', 'other']),
  body('title').trim().notEmpty().isLength({ max: 150 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('pricePerDay').isFloat({ min: 0 }).withMessage('pricePerDay must be a positive number'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('coordinates must be [longitude, latitude]'),
  body('location.city').trim().notEmpty(),
];

const searchProviderValidator = [
  query('lng').optional().isFloat(),
  query('lat').optional().isFloat(),
  query('radiusKm').optional().isFloat({ min: 1, max: 200 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

export { createProviderValidator, searchProviderValidator };
export default { createProviderValidator, searchProviderValidator };