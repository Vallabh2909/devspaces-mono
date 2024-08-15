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
  methods: process.env.CORS_ALLOWED_METHODS.split(","),
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS.split(","),
  exposedHeaders: process.env.CORS_EXPOSED_HEADERS.split(","),
  maxAge: parseInt(process.env.CORS_MAX_AGE, 10),
  preflightContinue: process.env.CORS_PREFLIGHT_CONTINUE === "true",
  optionsSuccessStatus: parseInt(process.env.CORS_OPTIONS_SUCCESS_STATUS, 10),
};
const helmetOptions = {
  contentSecurityPolicy: false, // Disable if you're not setting up CSP or using inline scripts/styles
  frameguard: { action: 'deny' }, // Prevent clickjacking by disallowing your site from being framed
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true, // Prevent browsers from sniffing the MIME type
  xssFilter: true, // Adds small XSS protection
  referrerPolicy: { policy: 'no-referrer' }, // Controls the referrer information sent along with requests
};
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
