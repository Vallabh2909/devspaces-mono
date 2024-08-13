import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";

const options = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};
const AccessTokenOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw error;
  }
};

const getUserFromToken = async (decodedToken) => {
  return await User.findById(decodedToken?._id).select(
    "-password -refreshToken",
  );
};

const renewAccessToken = asyncHandler(async (req, res, next) => {
  const refreshToken =
    req.cookies?.refreshToken ||
    req.header("Authorization")?.replace("Bearer", "").trim();
  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = verifyToken(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await getUserFromToken(decodedToken);
    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }
    const accessToken = user.generateAccessToken();
    req.user = user;
    res.cookie("accessToken", accessToken, AccessTokenOptions);
    next();
  } catch (error) {
    res
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options);
    return res
      .status(401)
      .json(new ApiResponse(401, 22, "Sign In Again to Continue"));
  }
});

const verifyJWT = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "").trim();

  if (!accessToken) {
    return await renewAccessToken(req, res, next);
  }

  try {
    const decodedToken = verifyToken(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET,
    );
    const user = await getUserFromToken(decodedToken);
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return await renewAccessToken(req, res, next);
    } else {
      res
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options);
      return res
        .status(401)
        .json(new ApiResponse(401, 22, "Unauthorized Request"));
    }
  }
});

export { renewAccessToken, verifyJWT };
