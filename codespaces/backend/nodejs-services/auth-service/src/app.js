import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import {
  corsOptions,
  helmetOptions,
  compressionOptions,
  rateLimitOptions,
  cookieParserOptions,
} from "./config/env.config.js";

const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(helmet(helmetOptions));
app.use(cookieParser(cookieParserOptions));
app.use(rateLimit(rateLimitOptions));
app.use(compression(compressionOptions));
app.use(express.static("public"));
import userRoutes from "./routes/user.routes.js";
app.use("/api/v1/users", userRoutes);
app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

export default app;
