import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessToken } from "../services/token.services.js";

const options = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};
const AccessTokenOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  expires: new Date(Date.now() + 15 * 60 * 1000),
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getUserFromToken = async (decodedToken) => {
  return await User.findOne({ userId: decodedToken?.userId }).select(
    "-password -refreshToken",
  );
};

const renewAccessToken = asyncHandler(async (req, res, next) => {
  const refreshToken =
    req.cookies?.refreshToken ||
    req.header("Authorization")?.replace("Bearer", "").trim()||req.body.refreshToken;
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
    const accessToken = generateAccessToken(user);
    req.user = user;
    res.cookie("accessToken", accessToken, AccessTokenOptions);
    next();
  } catch (error) {
    console.log(error);
    res
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options);
    return res
      .status(401)
      .json(new ApiResponse(401, 22, "You have been Logged out , Sign In Again to Continue"));
  }
});

const verifyJWT = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "").trim()||req.body.accessToken;

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

export { verifyJWT };
// fetch('localhost:3001/api/v1/users/login', {
//   method: 'POST',
//   headers: {
//       'Content-Type': 'application/json' // Indicates that you're sending JSON data
//   },
//   body: JSON.stringify({
//       identifier: "vallabhwasule913@gmail.com",
//       password: "12345678"
//   })
// })
