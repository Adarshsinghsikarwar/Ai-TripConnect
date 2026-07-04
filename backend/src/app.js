import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";
import sanitizeInputs from "./middlewares/sanitize.middleware.js";
import passport from "./config/passport.js";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";
import { razorpayWebhook } from "./controllers/webhook.controller.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { generalLimiter } from "./middlewares/rateLimiter.middleware.js";
import { clientUrl } from "./config/env.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Trust proxy for rate limiting (Render/Vercel proxies)
app.set("trust proxy", 1);

app.use(helmet()); // sensible security headers (HSTS, no-sniff, frame deny, etc.)
app.disable("x-powered-by");
app.use(morgan("dev"));

app.use(cors({ origin: clientUrl, credentials: true }));

// IMPORTANT: Razorpay webhook signature must be verified against the RAW request
// body bytes. This route is registered with express.raw() BEFORE express.json()
// runs globally, so the handler sees the untouched buffer.
app.post(
  "/api/v1/webhooks/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

app.use(express.json({ limit: "1mb" })); // limit body size — basic DoS guard
app.use(cookieParser());
app.use(sanitizeInputs); // strips $-prefixed/dotted keys in place — blocks NoSQL injection
app.use(hpp()); // protects against HTTP parameter pollution (e.g. ?role=admin&role=user)
app.use(passport.initialize());

app.use(generalLimiter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/v1", routes);

// Serve static files from frontend output folder
app.use(express.static(path.join(__dirname, "../public")));

// Fallback routing for SPA / Next.js static files
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  const filePath = path.join(__dirname, "../public", req.path);
  const htmlFilePath = filePath + ".html";

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.sendFile(filePath);
  } else if (fs.existsSync(htmlFilePath)) {
    res.sendFile(htmlFilePath);
  } else {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorMiddleware); // must be last

export default app;
