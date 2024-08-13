import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { logInUser, logOutUser } from "../services/user.services.js";

const cookieOptions = {
  httpOnly: true,
  Domain: "devspaces.vallabhwasule.co",
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
};

const logIn = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const { accessToken, refreshToken } = await logInUser(identifier, password);
  const accessTokenExpiry = new Date(Date.now() + 6 * 60 * 60 * 1000);
  const refreshTokenExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      expires: accessTokenExpiry,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      expires: refreshTokenExpiry,
    })
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "User Logged In Successfully",
      ),
    );
});

const logOut = asyncHandler(async (req, res) => {
  await logOutUser(req.user);
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { logIn, logOut };
