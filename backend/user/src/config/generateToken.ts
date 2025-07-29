import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

const generateToken = (user: any) => {
  const token = jwt.sign({ user }, JWT_SECRET, {
    expiresIn: "15d",
  });
  return token;
};

export default generateToken;
