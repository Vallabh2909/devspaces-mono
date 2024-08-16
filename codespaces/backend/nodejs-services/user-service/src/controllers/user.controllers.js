import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { redisClient } from "../config/Redis.js";
import mongoose from "mongoose";
import {
  createUser,
  changePasswordService,
} from "../services/user.services.js";

// const redisPublisher = redisClient.duplicate();

const registerUserController = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path || "";
  const avatarLocalPath = req.files?.avatar?.[0]?.path || "";
  await createUser(
    fullName,
    email,
    username,
    password,
    avatarLocalPath,
    coverImageLocalPath,
  );
  res.status(201).json(new ApiResponse(201, "User created successfully"));
});

const changePasswordController = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  await changePasswordService(
    userId,
    oldPassword,
    newPassword,
    confirmNewPassword,
  );
  res.status(200).json(new ApiResponse(200, "Password changed successfully"));
});


export { registerUserController, changePasswordController };
