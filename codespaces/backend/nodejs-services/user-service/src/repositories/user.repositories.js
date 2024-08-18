import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
const findUserByIdentifier = async (username = "", email = "") => {
  try {
    const user = await User.findOne({ $or: [{ email }, { username }] });
    return user;
  } catch (error) {
    throw new ApiError(401, "Error Occured in findUserByIdentifier function");
  }
};
const findUserByUserId = async (userId) => {
  try {
    const user = await User.findOne({
      _id: new mongoose.Types.ObjectId(`${userId}`),
    });
    return user;
  } catch (error) {
    throw new ApiError(401, "Error Occured in findUserByUserId function");
  }
};
const createNewUser = async (
  fullName,
  email,
  username,
  password,
  coverImage = "",
  avatar = "",
  session = null,
) => {
  try {
    const user = await User.create(
      [
        {
          fullName,
          email,
          username,
          password, // Ensure password is hashed before passing here
          coverImage,
          avatar,
        },
      ],
      { session },
    );

    return user;
  } catch (error) {
    // Rethrow error to be handled by the service layer
    throw new Error(`Repository Error: ${error.message}`);
  }
};
const deleteUserById = async (userId) => {
  try {
    const result = await User.deleteOne({ _id: userId });
    return result;
  } catch (error) {
    throw new ApiError(401, "Error Occured in deleteUserById function");
  }
};
const updateUserEmail = async (email, newEmail) => {
  try {
    const result = await User.findOneAndUpdate(
      { email: email },
      { email: newEmail },
    );
    return result;
  } catch (error) {
    throw new ApiError(401, "Error Occured in updateUserEmail function");
  }
};

const updateUserPassword = async (email, newPassword) => {
  try {
    const result = await User.updateOne(
      { email: email },
      { $set: { password: newPassword } },
    );
    return result;
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
    });
    throw new Error("Error updating user password: " + error.message);
  }
};

const updateUsername = async (email, newUsername) => {
  try {
    const result = await User.findOneAndUpdate(
      { email: email },
      { $set: { username: newUsername } },
      { new: true },
    );
    return result;
  } catch (error) {
    throw new ApiError(401, "Error Occured in updateUsername function");
  }
};

export {
  findUserByIdentifier,
  createNewUser,
  updateUserPassword,
  findUserByUserId,
  deleteUserById,
  updateUserEmail,
  updateUsername,
};
