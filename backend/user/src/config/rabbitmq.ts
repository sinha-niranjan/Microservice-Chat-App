import amqp from "amqplib";

let Channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOST,
      port: Number(process.env.RABBITMQ_PORT) || 5672,
      username: process.env.RABBITMQ_USER,
      password: process.env.RABBITMQ_PASSWORD,
    });

    Channel = await connection.createChannel();
    console.log("✅ RabbitMQ connected successfully");
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
    throw error;
  }
};
