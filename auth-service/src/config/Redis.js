// import { createClient } from "redis";

// const redisClient = createClient({
//   password: "Q9id0woo09MZYhBgnpGZulJy6dyhC843",
//   socket: {
//     host: "redis-15343.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
//     port: 15343,
//   },
// });

// redisClient.on("connect", () => {
//   console.log("Redis connected");
// });

// redisClient.on("error", (error) => {
//   console.log("Redis error", error);
// });


// export default redisClient;
// src/config/redisClient.js

// import Redis from 'ioredis';

// const redisClient = new Redis({
//   host: "redis-15343.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
//   port: 15343,
//   password: "Q9id0woo09MZYhBgnpGZulJy6dyhC843",
//   db: 0, // default database number
//   retryStrategy(times) {
//     return Math.min(times * 50, 2000); // Reconnect strategy
//   },
// });

// redisClient.on('error', (err) => {
//   console.error('Redis error', err);
// });

// const connectRedis = async () => {
//   return new Promise((resolve, reject) => {
//     redisClient.on('connect', () => {
//       console.log('Connected to Redis');
//       resolve();
//     });

//     redisClient.on('error', (err) => {
//       reject(err);
//     });
//   });
// };

// export { redisClient, connectRedis };

// src/config/redisClient.js
import { createClient } from 'redis';

const redisClient = createClient({
  password: "Q9id0woo09MZYhBgnpGZulJy6dyhC843",
  socket: {
    host: "redis-15343.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 15343,
  },
});

const connectRedis = () => {
  return new Promise((resolve, reject) => {
    redisClient.on('error', (err) => {
      console.error('Redis error', err);
      reject(err);
    });

    redisClient.connect()
      .then(() => {
        console.log('Connected to Redis');
        resolve();
      })
      .catch((err) => {
        console.error('Failed to connect to Redis', err);
        reject(err);
      });
  });
};

export { redisClient, connectRedis };

