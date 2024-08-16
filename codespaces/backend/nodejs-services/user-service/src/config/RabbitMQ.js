import amqp from "amqplib";

let channel = null;
const exchanges = {}; // To keep track of exchanges
const queues = {}; // To keep track of queues

/**
 * Assert the necessary exchanges and queues for user events.
 */
const assertUserEventsExchangeAndQueues = async () => {
  try {
    // Assert the exchange
    await channel.assertExchange("user-events-exchange", "topic", {
      durable: true,
    });

    // 1. When a user registers successfully
    // Send a message to the auth service to create a new user
    await channel.assertQueue("auth-registration-queue", { durable: true });
    await channel.bindQueue(
      "auth-registration-queue",
      "user-events-exchange",
      "user.registration.auth"
    );

    // Send a notification to the user's registered email
    await channel.assertQueue("notification-registration-queue", {
      durable: true,
    });
    await channel.bindQueue(
      "notification-registration-queue",
      "user-events-exchange",
      "user.registration.email"
    );

    // 2. When a user changes their password
    // Send a message to the auth service to update the password
    await channel.assertQueue("auth-password-change-queue", { durable: true });
    await channel.bindQueue(
      "auth-password-change-queue",
      "user-events-exchange",
      "user.password.change.auth"
    );

    // Send a notification to the user's email about the password change
    await channel.assertQueue("notification-password-change-queue", {
      durable: true,
    });
    await channel.bindQueue(
      "notification-password-change-queue",
      "user-events-exchange",
      "user.password.change.email"
    );

    // 3. When a user changes their email
    // Send a message to the auth service to update the email
    await channel.assertQueue("auth-email-change-queue", { durable: true });
    await channel.bindQueue(
      "auth-email-change-queue",
      "user-events-exchange",
      "user.email.change.auth"
    );

    // Send a notification to the user's new email about the email change
    await channel.assertQueue("notification-email-change-queue", {
      durable: true,
    });
    await channel.bindQueue(
      "notification-email-change-queue",
      "user-events-exchange",
      "user.email.change.email"
    );

    // 4. When a user changes their username
    // Send a message to the auth service to update the username
    await channel.assertQueue("auth-username-change-queue", { durable: true });
    await channel.bindQueue(
      "auth-username-change-queue",
      "user-events-exchange",
      "user.username.change.auth"
    );

    // Send a notification to the user's email about the username change
    await channel.assertQueue("notification-username-change-queue", {
      durable: true,
    });
    await channel.bindQueue(
      "notification-username-change-queue",
      "user-events-exchange",
      "user.username.change.email"
    );

    console.log(
      "User events exchange and all queues have been asserted and bound."
    );
  } catch (error) {
    console.error("Error asserting exchanges and queues:", error);
    throw error;
  }
};

export { assertUserEventsExchangeAndQueues };

/**
 * Connect to RabbitMQ and set up the channel.
 */
const connectRabbitMQ = async (retries = 5) => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: "localhost",
      port: 5672,
      username: "guest",
      password: "guest",
      vhost: "/",
    });
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");
    await assertUserEventsExchangeAndQueues();

    // Handle connection errors and reconnections
    connection.on("error", (err) => {
      console.error("Connection error:", err);
    });

    connection.on("close", () => {
      console.warn("Connection closed. Reconnecting...");
      setTimeout(() => connectRabbitMQ(retries - 1), 5000);
    });
  } catch (error) {
    console.error("RabbitMQ connection error:", error);
    if (retries > 0) {
      console.log(`Retrying connection (${retries} retries left)...`);
      setTimeout(() => connectRabbitMQ(retries - 1), 5000);
    } else {
      throw error;
    }
  }
};

/**
 * Create an exchange if it doesn't exist.
 * @param {string} exchangeName - The name of the exchange.
 * @param {string} type - The type of the exchange (direct, topic, fanout).
 */
const assertExchange = async (exchangeName, type = "topic") => {
  if (!exchanges[exchangeName]) {
    await channel.assertExchange(exchangeName, type, { durable: true });
    exchanges[exchangeName] = true;
    console.log(`Exchange ${exchangeName} created`);
  }
};

/**
 * Create a queue if it doesn't exist.
 * @param {string} queueName - The name of the queue.
 * @param {Object} options - Options for the queue.
 */
const assertQueue = async (queueName, options = { durable: true }) => {
  if (!queues[queueName]) {
    await channel.assertQueue(queueName, options);
    queues[queueName] = true;
    console.log(`Queue ${queueName} created`);
  }
};

/**
 * Publish a message to an exchange with a routing key.
 * @param {string} exchangeName - The name of the exchange.
 * @param {string} routingKey - The routing key.
 * @param {string|Object} message - The message to publish.
 */
const publishMessage = async (exchangeName, routingKey, message) => {
  await assertExchange(exchangeName);
  const msgBuffer = Buffer.isBuffer(message)
    ? message
    : Buffer.from(JSON.stringify(message));
  channel.publish(exchangeName, routingKey, msgBuffer, { persistent: true });
  console.log(
    `Message published to exchange ${exchangeName} with routing key ${routingKey}`
  );
};

/**
 * Consume messages from a queue.
 * @param {string} queueName - The name of the queue.
 * @param {function} callback - The callback function to handle messages.
 */
const consumeQueue = async (queueName, callback) => {
  await assertQueue(queueName);
  channel.consume(queueName, async (msg) => {
    if (msg !== null) {
      const content = JSON.parse(msg.content.toString());
      await callback(content);
      channel.ack(msg);
    }
  });
  console.log(`Consuming messages from queue ${queueName}`);
};

export { connectRabbitMQ, publishMessage, consumeQueue };
