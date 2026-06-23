import express from "express";
import routes from "./routes";

const app = express();

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/v1", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export default app;
