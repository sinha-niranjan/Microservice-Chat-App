import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import { createClient } from "redis";
import userRoutes from "./routes/User.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 5000;

app.use("/api/v1/user", userRoutes);

app.get("/health", (req, res) => {
  res.send("Health of user service is good");
});

connectDB();
connectRabbitMQ();

export const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient
  .connect()
  .then(() => console.log("🤝 Redis connected successfully"))
  .catch((err) => {
    console.log(err);
  });

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
