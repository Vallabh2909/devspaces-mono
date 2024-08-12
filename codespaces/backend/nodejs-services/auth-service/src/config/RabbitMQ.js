// src/config/rabbitMQClient.js
import amqp from "amqplib";

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: "localhost",
      port: 5672,
      username: "user",
      password: "password",
      vhost: "/",
    });
    channel = await connection.createChannel();
    await channel.assertQueue("event-bus", { durable: true });
    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error("RabbitMQ connection error:", error);
    throw error;
  }
};

export { connectRabbitMQ, channel };
