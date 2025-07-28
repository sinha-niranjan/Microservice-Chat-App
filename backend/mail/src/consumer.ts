import amqp from "amqplib";
import nodemailer from "nodemailer";

export const startSendOtpConsumer = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOST,
      port: Number(process.env.RABBITMQ_PORT) || 5672,
      username: process.env.RABBITMQ_USER,
      password: process.env.RABBITMQ_PASSWORD,
    });

    const channel = await connection.createChannel();

    const queueName = "send-otp";

    await channel.assertQueue(queueName, { durable: true });

    console.log(
      `✅ RabbitMQ connected successfully and Mail service consumer started, listening to queue: ${queueName}`
    );
    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const { to, subject, body } = JSON.parse(msg.content.toString());

          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 465,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          });

          await transporter.sendMail({
            from: "Chat app",
            to,
            subject,
            text: body,
          });
          console.log(
            `✅ OTP sent successfully to ${to} with subject "${subject}"`
          );
          channel.ack(msg);
        } catch (error) {
          console.error(`❌ Failed to send OTP :`, error);
        }
      }
    });
  } catch (error) {
    console.error("Failed to start rabbit mq consumer :", error);
  }
};
