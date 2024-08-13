import { User } from "../models/user.model.js";

const findUserByIdentifier = async (identifier) => {
  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    return user;
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while finding user by identifier",
    );
  }
};

const setRefreshToken = async (user, refreshToken) => {
  try {
    await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          refreshToken: refreshToken,
        },
      },
      {
        new: true,
      },
    );
    return refreshToken;
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while setting refresh token",
    );
  }
};

export { findUserByIdentifier, setRefreshToken };
