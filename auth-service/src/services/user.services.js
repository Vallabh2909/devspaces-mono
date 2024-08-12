import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
// class User{
//     user={};
//     constructor(user){
//         this.username=user.username;
//         this.email=user.email;
//         this.fullName=user.fullName;
//         this.avatar=user.avatar;
//         this.password=user.password;
//     }
// }

// const registerUser = async (req, res) => {
//   // get user details from frontend
//   // validation - not empty
//   // check if user already exists: username, email
//   // check for images, check for avatar
//   // upload them to cloudinary, avatar
//   // create user object - create entry in db
//   // remove password and refresh token field from response
//   // check for user creation
//   // return res
//   const { fullName, email, username, password } = req.body;

//   //checking if any field is empty
//   if (
//     [fullName, email, username, password].some((field) => field?.trim() === "")
//   ) {
//     throw new ApiError(400, "All fields are required");
//   }

//   //user with same username or email exists
//   const existingUser = await User.findOne({
//     $or: [{ email }, { username }],
//   });

//   if (existingUser) {
//     throw new ApiError(409, "User with same email or username exists");
//   }

//   const avatarLocalPath = req.files?.avatar[0]?.path;
//   //   const coverImageLocalPath = req.files?.coverImage[0]?.path;
//   let coverImageLocalPath;
//   if (
//     req.files &&
//     Array.isArray(req.files.coverImage) &&
//     req.files.coverImage.length > 0
//   ) {
//     coverImageLocalPath = req.files.coverImage[0].path;
//   }

//   if (!avatarLocalPath) {
//     throw new ApiError(400, "Avatar file is required");
//   }

//   const avatar = await uploadOnCloudinary(avatarLocalPath);
//   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

//   if (!avatar) {
//     throw new ApiError(500, "Internal Server Error ");
//   }

// const user = await User.create({
//   fullName,
//   avatar: avatar.url,
//   coverImage: coverImage?.url || "",
//   email,
//   password,
//   username: username.toLowerCase(),
// });

//   const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken",
//   );

//   if (!createdUser) {
//     throw new ApiError(501, "Internal Server Error ");
//   }

//   return createdUser;
// };

const createUser = async ({
  fullName,
  email,
  username,
  password,
  avatarLocalPath="",
  coverImageLocalPath="",
}) => {
  try {
    const userExists=await User.findOne({$or:[{email},{username}]});

    if(userExists){
      throw new ApiError(409,"User with same email or username exists");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const user = await User.create({
      fullName,
      email,
      username,
      password,
      coverImage: coverImage || "",
      avatar: avatar || "",
    });

    return user;
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

export { createUser };
