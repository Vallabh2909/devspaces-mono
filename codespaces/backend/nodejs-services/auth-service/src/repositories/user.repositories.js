import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

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
    throw new ApiError(500, "Something went wrong while setting refresh token");
  }
};
const createUser = async (user) => {
  console.log("Creating user", user);
  try {
    const newUser = await User.create(user);
    return newUser;
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something went wrong while creating user");
  }
};

export { findUserByIdentifier, setRefreshToken, createUser };
