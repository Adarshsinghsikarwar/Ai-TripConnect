import express from 'express';
import requireAuth from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createReviewValidator } from '../validators/review.validator.js';
import { createReview, getForProvider, getSummary } from '../controllers/review.controller.js';

const router = express.Router();

router.get('/provider/:providerId', getForProvider); // public
router.get('/provider/:providerId/summary', getSummary); // public — AI summary
router.post('/', requireAuth, createReviewValidator, validate, createReview);

export default router;