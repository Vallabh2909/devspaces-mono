import User from "../models/user.js";

const generateAccessAndRefreshTokens = async (userID) => {
    try {
      const user = await User.findById(userID);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
  
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
  
      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(
        500,
        "Something went wrong while generating access and refresh token"
      );
    }
  };

export { generateAccessAndRefreshTokens };