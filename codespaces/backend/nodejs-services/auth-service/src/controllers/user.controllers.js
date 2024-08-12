import { createUser } from "../services/user.services.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {redisClient} from "../config/Redis.js";


// const redisPublisher = redisClient.duplicate();

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  if (!fullName || !email || !username || !password) {
    return res.status(400).send("All fields are required");
  }
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    return res.status(400).send("All fields are required");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  await createUser({
    fullName,
    email,
    username,
    password,
    avatarLocalPath,
    coverImageLocalPath,
  });
  res.status(201).json("User created successfully");
});

const cache = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const username= await redisClient.get(id.toString());
  res.send(username);
});

export { registerUser, cache };
