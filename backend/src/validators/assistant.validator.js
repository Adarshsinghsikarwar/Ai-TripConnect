import { body } from "express-validator";

// We only need one field: the user's question. A max length keeps someone
// from sending a huge wall of text and burning AI tokens/money on one request.
const askAssistantValidator = [
  body("question")
    .trim()
    .notEmpty()
    .withMessage("question is required")
    .isLength({ max: 500 }),
];

export { askAssistantValidator };
