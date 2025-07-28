import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  res.send("Health of user service is good");
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
