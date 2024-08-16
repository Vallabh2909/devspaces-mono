import { ApiError } from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import bcrypt from "bcrypt";
import {
  findUserByIdentifier,
  findUserByUserId,
  createNewUser,
  updateUserPassword,
} from "../repositories/user.repositories.js";
import { publishMessage } from "../config/RabbitMQ.js";
import mongoose from "mongoose";

const isPasswordCorrect = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const createUser = async (
  fullName,
  email,
  username,
  password,
  avatarLocalPath = "",
  coverImageLocalPath = "",
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validation
    if (!fullName || !email || !username || !password) {
      throw new ApiError(400, "All fields are required");
    }
    if ([fullName, email, username, password].some((field) => !field.trim())) {
      throw new ApiError(400, "All fields are required");
    }

    // Check if user exists
    const userExists = await findUserByIdentifier(
      username,
      email,
      session,
    );
    if (userExists) {
      throw new ApiError(409, "User with the same email or username exists");
    }

    // Upload images
    const coverImage = coverImageLocalPath
      ? await uploadOnCloudinary(coverImageLocalPath)
      : "";
    const avatar = avatarLocalPath
      ? await uploadOnCloudinary(avatarLocalPath)
      : "";

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user and get the document including _id
    const newUser = await createNewUser(
      fullName,
      email,
      username,
      hashedPassword,
      coverImage,
      avatar,
      session,
    );
    
    await publishMessage(
      "user-events-exchange",
      "user.registration.auth",
      {
        email: email,
        username: username,
        password: hashedPassword, // Or omit password if not needed
      },
    );

    // Publish email notification event
    await publishMessage(
      "user-events-exchange",
      "user.registration.email",
      {
        fullName: fullName,
        email: email,
        username: username,
      },
    );
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    return newUser;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};
const changePasswordService = async (
  userId,
  oldPassword,
  newPassword,
  confirmNewPassword,
) => {
  try {
    const user = await findUserByUserId(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const isOldPasswordCorrect = await isPasswordCorrect(
      oldPassword,
      user.password,
    );
    if (!isOldPasswordCorrect) {
      throw new ApiError(401, "Old password is incorrect");
    }
    if (newPassword !== confirmNewPassword) {
      throw new ApiError(400, "New password and confirm password do not match");
    }
    await updateUserPassword(userId, newPassword);
    return "Password updated successfully";
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};
export { createUser, changePasswordService };
