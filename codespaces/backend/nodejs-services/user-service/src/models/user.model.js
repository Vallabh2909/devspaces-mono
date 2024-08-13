import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { redisClient } from "../config/Redis.js";
import { channel } from "../config/RabbitMQ.js";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    Verified: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    coverImage: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.post("save", async function () {
  //logic for sending email(verification email valid for next 10mins) using notification service[RabbitMQ]

  //if error occurs then delete the user and tell the user to register again

  //if user successfully opens the email in next 10 mins and clicks on the link then update the user's Verified field to true and user will actually be registered

  //if user doesn't click on the link in next 10 mins then delete the user
 try{
  await redisClient.set(`${(this._id).toString()}`,`${JSON.stringify(this)}`,{
    EX:20
  })
  await channel.sendToQueue("event-bus", Buffer.from(JSON.stringify(this)));
 }catch(error){
    console.log(error)
    await User.findByIdAndDelete(this._id);
    throw new Error("Try Again!")
 }

 

});

export const User = mongoose.model("User", userSchema);

// userSchema.methods.isPasswordCorrect = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// userSchema.methods.generateAccessToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//       email: this.email,
//       username: this.username,
//       fullName: this.fullName,
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     {
//       expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
//     },
//   );
// };
// userSchema.methods.generateRefreshToken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//     },
//     process.env.REFRESH_TOKEN_SECRET,
//     {
//       expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
//     },
//   );
// };
