import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
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

// Pre-save hook to hash the password if it is new or modified
// userSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }

//   // Publish user registration event with hashed password
//   await publishMessage("user-events-exchange", "user.registration", {
//     userId: this._id,
//     email: this.email,
//     username: this.username,
//     password: this.password, // This is the hashed password
//     Verified: this.Verified,
//   });

//   // Publish email notification event
//   await publishMessage("user-events-exchange", "user.registration.email", {
//     fullName: this.fullName,
//     email: this.email,
//     username: this.username,
//   });

//   next();
// });

// // Pre-updateOne hook to handle password updates
// userSchema.pre("updateOne", async function (next) {
//   const update = this.getUpdate();

//   // Check if the password is being updated
//   if (update.$set && update.$set.password) {
//     // Hash the password if it is being modified in the update
//     update.$set.password = await bcrypt.hash(update.$set.password, 10);

//     // Publish the password change event with the hashed password
//     await publishMessage("user-events-exchange", "user.password.change.auth", {
//       email: this._conditions.email, // Assuming email is part of the query condition
//       username: this._conditions.username, // Assuming username is part of the query condition
//       password: update.$set.password, // This is the hashed password
//     });

//     // Publish email notification event
//     await publishMessage("user-events-exchange", "user.password.change.email", {
//       email: this._conditions.email,
//       username: this._conditions.username,
//     });
//   }

//   next();
// });

export const User = mongoose.model("User", userSchema);
