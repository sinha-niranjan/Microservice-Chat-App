import { Response, text } from "express";
import TryCatch from "../config/tryCatch.js";
import { redisClient } from "../index.js";
import { publishToQueue } from "../config/rabbitmq.js";
import { User } from "../model/User.js";
import generateToken from "../config/generateToken.js";
import { AuthenticatedRequest } from "../middleware/isAuth.js";

export const loginUser = TryCatch(async (req, res) => {
  const { email } = req.body;
  const rateLimitKey = `otp:ratelimit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);
  if (rateLimit) {
    res.status(429).json({
      message: "Too many requests. Please wait before requesting new otp",
    });
    return;
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `otp:${email}`;

  await redisClient.set(otpKey, otp, { EX: 300 });

  await redisClient.set(rateLimitKey, "true", { EX: 60 });

  const message = {
    to: email,
    subject: "Your OTP Code",
    body: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
  };
  await publishToQueue("send-otp", message);
  res.status(200).json({
    message: `OTP sent to your mail : ${email}`,
  });
});

export const verifyUser = TryCatch(async (req, res) => {
  const { email, otp: enteredOtp } = req.body;

  if (!email || !enteredOtp) {
    res.status(400).json({ message: "Email and OTP are required" });
    return;
  }

  const otpKey = `otp:${email}`;
  const storedOtp = await redisClient.get(otpKey);
  if (!storedOtp) {
    res.status(400).json({ message: "OTP has expired or is invalid" });
    return;
  }
  if (storedOtp !== enteredOtp) {
    res.status(400).json({ message: "Invalid OTP" });
    return;
  }
  await redisClient.del(otpKey);

  let user = await User.findOne({
    email,
  });

  if (!user) {
    const name = email.slice(0, 8);
    user = await User.create({
      email,
      name,
    });
  }
  const token = generateToken(user);
  res.json({
    message: "user verified successfully",
    user,
    token,
  });
});

export const myProfile = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;

    res.json(user);
  }
);

export const updateName = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }
    user.name = name;
    await user.save();

    const token = generateToken(user);
    res.status(200).json({
      message: "Name updated successfully",
      user,
      token,
    });
  }
);

export const getAllUsers = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const users = await User.find();
    res.status(200).json(users);
  }
);

export const getUserById = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  }
);
