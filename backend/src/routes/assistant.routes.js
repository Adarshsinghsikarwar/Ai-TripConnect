import express from 'express';
import requireAuth from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { generalLimiter } from '../middlewares/rateLimiter.middleware.js';
import { askAssistantValidator } from '../validators/assistant.validator.js';
import { ask } from '../controllers/assistant.controller.js';

const router = express.Router();

// Authenticated + rate-limited: each call costs real LLM tokens, don't leave it open.
router.post('/ask', requireAuth, generalLimiter, askAssistantValidator, validate, ask);

export default router;