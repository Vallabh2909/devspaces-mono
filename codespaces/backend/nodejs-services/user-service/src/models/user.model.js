import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { redisClient } from "../config/Redis.js";
// import { channel } from "../config/RabbitMQ.js";
import { publishMessage } from "../config/RabbitMQ.js";
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
  await publishMessage("user-events-exchange", "user.registration", {
    userId: this._id,
    email: this.email,
    username: this.username,
    password: this.password,
    Verified: this.Verified,
  });
  await publishMessage("user-events-exchange", "user.registration.email", {
    fullName: this.fullName,
    email: this.email,
    username: this.username,
  });

  next();
});

export const User = mongoose.model("User", userSchema);
