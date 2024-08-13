import amqp from "amqplib";

let channel = null;
const exchanges = {}; // To keep track of exchanges
const queues = {};    // To keep track of queues

/**
 * Connect to RabbitMQ and set up the channel.
 */
const connectRabbitMQ = async () => {
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
    await assertExchange("event-bus", "direct"); 
    await assertQueue("password-change-queue");
    await bindQueue("password-change-queue", "event-bus", "password-change");
  } catch (error) {
    console.error("RabbitMQ connection error:", error);
    throw error;
  }
};

/**
 * Create an exchange if it doesn't exist.
 * @param {string} exchangeName - The name of the exchange.
 * @param {string} type - The type of the exchange (direct, topic, fanout).
 */
const assertExchange = async (exchangeName, type = "direct") => {
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
 * Bind a queue to an exchange with a routing key.
 * @param {string} queueName - The name of the queue.
 * @param {string} exchangeName - The name of the exchange.
 * @param {string} routingKey - The routing key.
 */
const bindQueue = async (queueName, exchangeName, routingKey = '') => {
  await assertQueue(queueName);
  await assertExchange(exchangeName);
  await channel.bindQueue(queueName, exchangeName, routingKey);
  console.log(`Queue ${queueName} bound to exchange ${exchangeName} with routing key ${routingKey}`);
};

/**
 * Publish a message to an exchange with a routing key.
 * @param {string} exchangeName - The name of the exchange.
 * @param {string} routingKey - The routing key.
 * @param {string|Object} message - The message to publish.
 */
const publishMessage = async (exchangeName, routingKey, message) => {
  await assertExchange(exchangeName);
  const msgBuffer = Buffer.isBuffer(message) ? message : Buffer.from(JSON.stringify(message));
  channel.publish(exchangeName, routingKey, msgBuffer, { persistent: true });
  console.log(`Message published to exchange ${exchangeName} with routing key ${routingKey}`);
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

export {
  connectRabbitMQ,
  assertQueue,
  assertExchange,
  bindQueue,
  publishMessage,
  consumeQueue
};
