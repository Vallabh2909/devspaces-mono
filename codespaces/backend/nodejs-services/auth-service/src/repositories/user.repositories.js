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
  // console.log("Creating user", user);
  try {
    const userExists = await findUserByIdentifier(user.email);
    if (userExists) {
      throw new ApiError(409, "User already exists");
    }
    const newUser = await User.create(user);
    return newUser;
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something went wrong while creating user");
  }
};

const updateUserPassword = async (data) => {
  const { email, password } = data;
  console.log("Updating password", email, password);
  try {
    await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          password: password,
        },
      },
      {
        new: true,
      },
    );
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while updating user password",
    );
  }
};
const updateUserEmail = async (data) => {
  const { email, newEmail } = data;
  console.log("Updating email", email, newEmail);
  try {
    await User.findOneAndUpdate(
      { email: email },
      { $set: { email: newEmail } },
    );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while updating user email");
  }
};

const updateUsername = async (data) => {
  const { email, newUsername } = data;
  // console.log("Updating username", email, username);
  try {
    await User.findOneAndUpdate(
      { email: email },
      { $set: { username: newUsername } },
    );
  } catch (error) {}
};

export {
  findUserByIdentifier,
  setRefreshToken,
  createUser,
  updateUserPassword,
  updateUserEmail,
  updateUsername,
};
