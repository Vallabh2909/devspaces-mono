import mongoose from "mongoose";
import { User } from "./user.model.js"; // Update the path to the correct location

// Connect to MongoDB (replace with your connection string)
mongoose.connect("mongodb+srv://vallabhwasule913:y4dVNKAidvva6FsO@cluster0.upvoqy7.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const insertUser = async () => {
  try {
    const userData = {
      userId: "66bd1bd0bffab8c25c8ff719",
      username: "vallabh2909",
      Verified: false,
      email: "vallabhwasule913@gmail.com",
      password: "$2b$10$wVH3o57yhnZE.f/9.FKl5.QXBZ0QRNP/HpEAzxcCYBVmu71Wja7ia",
    };

    // Create a new user instance
    const newUser = new User(userData);

    // Save the user to the database
    await newUser.save();

    console.log("User inserted successfully");
  } catch (error) {
    console.error("Error inserting user:", error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Call the function to insert the user
insertUser();
