import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const findUserByIdentifier = async (username, email) => {
  try {
    const user = await User.findOne({ $or: [{ email }, { username }] });
    return user;
  } catch (error) {
    throw new ApiError(401, "Error Occured in findUserByIdentifier function");
  }
};

const createNewUser = async (
  fullName,
  email,
  username,
  password,
  coverImage = "",
  avatar = "",
) => {
  try {
    const user = await User.create({
      fullName,
      email,
      username,
      password,
      coverImage,
      avatar,
    });
    return user;
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
    });
    throw new ApiError(401, "Error Occured while creating a new user");
  }
};

const updateUserPassword = async (userId, newPassword) => {
  try {
    const result = await User.updateOne(
      { _id: userId },
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

export { findUserByIdentifier, createNewUser, updateUserPassword };
