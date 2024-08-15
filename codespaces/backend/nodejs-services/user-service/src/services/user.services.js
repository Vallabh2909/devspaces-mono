import { ApiError } from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import bcrypt from "bcrypt";
import {
  findUserByIdentifier,
  createNewUser,
  updateUserPassword,
} from "../repositories/user.repositories.js";
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
  try {
    if (!fullName || !email || !username || !password) {
      return res.status(400).send("All fields are required");
    }
    if (
      [fullName, email, username, password].some(
        (field) => field?.trim() === "",
      )
    ) {
      return res.status(400).send("All fields are required");
    }
    const userExists = await findUserByIdentifier(username, email);

    if (userExists) {
      throw new ApiError(409, "User with same email or username exists");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    
    const user = await createNewUser(
      fullName,
      email,
      username,
      password,
      coverImage,
      avatar,
    );

    return user;
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message);
  }
};
const changePasswordService = async (
  userId,
  oldPassword,
  newPassword,
  confirmNewPassword,
) => {
  try {
    const user = await findUserByIdentifier(userId);
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
