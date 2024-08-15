import multer from "multer";
import { ApiError } from "../utils/ApiError.js"; // Assuming ApiError is defined in utils

// File filter function to allow only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true); // Accept the file
  } else {
    cb(new ApiError(400, "Only image files are allowed"), false); // Reject the file
  }
};

// Multer storage configuration with unique filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp/"); // Directory to store uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix); // Generate a unique filename
  },
});

// Multer upload configuration with file filter and unique filename
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter, // Use the file filter function
  limits: {
    fileSize: 5 * 1024 * 1024, // Optional: Set a file size limit (e.g., 5MB)
  },
});
