import amqp from "amqplib";
let Channel;
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
    }
    catch (error) {
        console.error("Error connecting to RabbitMQ:", error);
        throw error;
    }
};
export const publishToQueue = async (queueName, message) => {
    try {
        if (!Channel) {
            throw new Error("RabbitMQ channel is not initialized. Please connect first.");
        }
        await Channel.assertQueue(queueName, { durable: true });
        Channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
            persistent: true,
        });
    }
    catch (error) {
        console.error("Error publishing to queue:", error);
    }
};
