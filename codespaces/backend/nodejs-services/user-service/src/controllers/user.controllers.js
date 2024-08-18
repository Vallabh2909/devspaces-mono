import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { redisClient } from "../config/Redis.js";
import mongoose from "mongoose";
import {
  createUser,
  changePasswordService,
  changeEmailService,
  updateUserEmailService,
  updateUsernameService,
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
  const email = req.user.email;
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  await changePasswordService(
    email,
    oldPassword,
    newPassword,
    confirmNewPassword,
  );
  res.status(200).json(new ApiResponse(200, "Password changed successfully"));
});
const changeEmailController = asyncHandler(async (req, res) => {
  const email = req.user.email;
  const { newEmail } = req.body;
  await changeEmailService(email, newEmail);
  res.status(200).json(new ApiResponse(200, "Sent email change request successfully"));
});

const updateEmailController = asyncHandler(async (req, res) => {
  console.log(req.params.token);
  await updateUserEmailService(req.params.token);
  res.status(200).json(new ApiResponse(200, "Email updated successfully"));
});

const updateUsernameController = asyncHandler(async (req, res) => {
  const email = req.user.email;
  const { newUsername } = req.body;
  await updateUsernameService(email, newUsername);
  res.status(200).json(new ApiResponse(200, "Username changed successfully"));
}); 
export {
  registerUserController,
  changePasswordController,
  changeEmailController,
  updateEmailController,
  updateUsernameController,
};
