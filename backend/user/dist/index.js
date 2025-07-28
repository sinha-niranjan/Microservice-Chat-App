import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import { createClient } from "redis";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.get("/health", (req, res) => {
    res.send("Health of user service is good");
});
connectDB();
export const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient
    .connect()
    .then(() => console.log("Redis connected successfully"))
    .catch((err) => {
    console.log(err);
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
