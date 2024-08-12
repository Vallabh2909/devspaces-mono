import app from "./app.js";
import dotenv from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const envPath = resolve(__dirname ,`../.env.${process.env.NODE_ENV}`);
import connectDB from "./config/MongoDB.js";
import { connectRedis } from "./config/Redis.js";
import { connectRabbitMQ } from "./config/RabbitMQ.js";
dotenv.config({
    path: envPath
});

// connectDB()
//   .then(() => {
//     app
//       .listen( 4000, () => {
//         console.log(`Server is running at ${process.env.PORT}`);
//       })
//       .on("error", (error) => {
//         console.error(`Error while starting the server: ${error.message}`);
//         process.exit(1); // Exit the process if there's an error starting the server
//       });
//   })
//   .catch((error) => {
//     console.log(`MongoDB connection failed ${error}`);
//   });



const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Connect to Redis
    await connectRedis();

    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Start the application
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1); // Exit the process with failure
  }
};

startServer();
