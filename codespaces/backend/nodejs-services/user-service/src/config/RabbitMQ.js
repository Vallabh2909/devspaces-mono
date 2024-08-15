import amqp from "amqplib";

let channel = null;
const exchanges = {}; // To keep track of exchanges
const queues = {}; // To keep track of queues

const assertUserEventsExchangeAndQueues = async () => {
  try {
    // Assert the exchange
    await channel.assertExchange("user-events-exchange", "topic", {
      durable: true,
    });

    // Assert each queue and bind it to the exchange with the appropriate routing key

    // 1. auth-registration-queue
    await channel.assertQueue("auth-registration-queue", { durable: true });
    await channel.bindQueue(
      "auth-registration-queue",
      "user-events-exchange",
      "user.registration",
    );

    // 2. notification-registration-queue
    await channel.assertQueue("notification-registration-queue", {
      durable: true,
    });
    await channel.bindQueue(
      "notification-registration-queue",
      "user-events-exchange",
      "user.registration.email",
    );

    // 3. auth-email-change-queue
    await channel.assertQueue("auth-email-change-queue", { durable: true });
    await channel.bindQueue(
      "auth-email-change-queue",
      "user-events-exchange",
      "user.email.change",
    );

    // 4. notification-email-change-queue
    await channel.assertQueue("notification-email-change-queue", {
      durable: true,
    });
    await channel.bindQueue(
      "notification-email-change-queue",
      "user-events-exchange",
      "user.email.change",
    );

    // 5. notification-password-change-queue
    await channel.assertQueue("notification-password-change-queue", {
      durable: true,
    });
    await channel.bindQueue(
      "notification-password-change-queue",
      "user-events-exchange",
      "user.password.change",
    );

    // 6. notification-username-update-queue
    await channel.assertQueue("notification-username-update-queue", {
      durable: true,
    });
    await channel.bindQueue(
      "notification-username-update-queue",
      "user-events-exchange",
      "user.username.update",
    );

    console.log(
      "User events exchange and all queues have been asserted and bound.",
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
    // console.log(channel);
    // Handle connection errors and reconnections
    connection.on('error', (err) => {
      console.error('Connection error:', err);
    });

    connection.on('close', () => {
      console.warn('Connection closed. Reconnecting...');
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
const assertExchange = async (exchangeName, type="topic") => {
  if (!exchanges[exchangeName]) {
    await channel.assertExchange(exchangeName, type, { durable: true });
    exchanges[exchangeName] = true;
    console.log(`Exchange ${exchangeName} created`);
  }
};

// /**
//  * Create a queue if it doesn't exist.
//  * @param {string} queueName - The name of the queue.
//  * @param {Object} options - Options for the queue.
//  */
// const assertQueue = async (queueName, options = { durable: true }) => {
//   if (!queues[queueName]) {
//     await channel.assertQueue(queueName, options);
//     queues[queueName] = true;
//     console.log(`Queue ${queueName} created`);
//   }
// };

// /**
//  * Bind a queue to an exchange with a routing key.
//  * @param {string} queueName - The name of the queue.
//  * @param {string} exchangeName - The name of the exchange.
//  * @param {string} routingKey - The routing key.
//  */
// const bindQueue = async (queueName, exchangeName, routingKey = "") => {
//   await assertQueue(queueName);
//   await assertExchange(exchangeName);
//   await channel.bindQueue(queueName, exchangeName, routingKey);
//   console.log(
//     `Queue ${queueName} bound to exchange ${exchangeName} with routing key ${routingKey}`,
//   );
// };

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
    `Message published to exchange ${exchangeName} with routing key ${routingKey}`,
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
