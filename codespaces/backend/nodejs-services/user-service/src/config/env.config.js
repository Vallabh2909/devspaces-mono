import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { resolve } from "path";
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const envPath = resolve(__dirname, `../../.env.${process.env.NODE_ENV}`);
dotenv.config({
  path: envPath,
});
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  // methods: process.env.CORS_ALLOWED_METHODS.split(","),
  // allowedHeaders: process.env.CORS_ALLOWED_HEADERS.split(","),
  // exposedHeaders: process.env.CORS_EXPOSED_HEADERS.split(","),
  // maxAge: parseInt(process.env.CORS_MAX_AGE, 10),
  // preflightContinue: process.env.CORS_PREFLIGHT_CONTINUE === "true",
  // optionsSuccessStatus: parseInt(process.env.CORS_OPTIONS_SUCCESS_STATUS, 10),
};
const helmetOptions = {};
const cookieParserOptions = {};
const rateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
};
const compressionOptions = {};
export {
  helmetOptions,
  cookieParserOptions,
  rateLimitOptions,
  compressionOptions,
  corsOptions,
};
