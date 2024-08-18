import { ApiError } from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import bcrypt from "bcrypt";
import {
  findUserByIdentifier,
  findUserByUserId,
  createNewUser,
  updateUserPassword,
  updateUserEmail,
  updateUsername
} from "../repositories/user.repositories.js";
import { publishMessage } from "../config/RabbitMQ.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validation
    if (!fullName || !email || !username || !password) {
      throw new ApiError(400, "All fields are required");
    }
    if ([fullName, email, username, password].some((field) => !field.trim())) {
      throw new ApiError(400, "All fields are required");
    }

    // Check if user exists
    const userExists = await findUserByIdentifier(username, email, session);
    if (userExists) {
      throw new ApiError(409, "User with the same email or username exists");
    }

    // Upload images
    const coverImage = coverImageLocalPath
      ? await uploadOnCloudinary(coverImageLocalPath)
      : "";
    const avatar = avatarLocalPath
      ? await uploadOnCloudinary(avatarLocalPath)
      : "";

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user and get the document including _id
    const newUser = await createNewUser(
      fullName,
      email,
      username,
      hashedPassword,
      coverImage,
      avatar,
      session,
    );

    await publishMessage("user-events-exchange", "user.registration.auth", {
      email: email,
      username: username,
      password: hashedPassword, // Or omit password if not needed
    });

    // Publish email notification event
    await publishMessage("user-events-exchange", "user.registration.email", {
      fullName: fullName,
      email: email,
      username: username,
    });
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    return newUser;
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Internal Server Error",
    );
  }
};
const changePasswordService = async (
  email,
  oldPassword,
  newPassword,
  confirmNewPassword,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await findUserByIdentifier(email, email);
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
    newPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(email, newPassword);

    await publishMessage("user-events-exchange", "user.password.change.auth", {
      email: email,
      password: newPassword,
    });

    await publishMessage("user-events-exchange", "user.password.change.email", {
      email: email,
    });

    await session.commitTransaction();
    session.endSession();

    return "Password updated successfully";
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, error.message);
  }
};

const changeEmailService = async (email, newEmail) => {
  try {
    const user = await findUserByIdentifier(email, email);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    publishMessage("user-events-exchange", "user.email.change.email", {
      email: email,
      token: jwt.sign(
        { email: email, newEmail: newEmail },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
      ),
    });
    return "Email change request sent to the new email";
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};
const updateUserEmailService = async (token) => {
  try {
    const { email, newEmail } = jwt.verify(token, process.env.JWT_SECRET);
    await updateUserEmail(email, newEmail);
    await publishMessage("user-events-exchange", "user.email.change.auth", {
      email: email,
      newEmail: newEmail,
    });
    return "Email updated successfully";
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

const updateUsernameService = async (email, newUsername) => {
  try {
    const user = await findUserByIdentifier(newUsername, newUsername);
    if (user) {
      throw new ApiError(404, "The username is already taken");
    }
    await updateUsername(email, newUsername);
    await publishMessage("user-events-exchange", "user.username.change.auth", {
      email: email,
      newUsername: newUsername,
    });
    await publishMessage("user-events-exchange", "user.username.change.email", {
      email: email,
      newUsername: newUsername,
    });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};
export {
  createUser,
  changePasswordService,
  changeEmailService,
  updateUserEmailService,
  updateUsernameService,
};
