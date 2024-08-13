import { ApiError } from "../utils/ApiError.js";
import {
  findUserByIdentifier,
  setRefreshToken,
} from "../repositories/user.repositories.js";
import { generateAccessToken, generateRefreshToken } from "./token.services.js";
import bcrypt from "bcrypt";

const isPasswordCorrect = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const logInUser = async (identifier, password) => {
  if (!identifier || !password) {
    throw new ApiError(400, "Username or email and password are required");
  }
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (!(await isPasswordCorrect(password, user.password))) {
    throw new ApiError(401, "Invalid password");
  }
  const refreshToken =await setRefreshToken(user, generateRefreshToken(user));
  return {
    user,
    accessToken: generateAccessToken(user),
    refreshToken: refreshToken,
  };
};

const logOutUser = async (user) => {
  await setRefreshToken(user, null);
  return;
};

export { logInUser, logOutUser };
