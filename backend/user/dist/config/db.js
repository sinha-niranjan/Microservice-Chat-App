import mongoose from "mongoose";
const connectDB = async () => {
    try {
        const url = process.env.MONGO_URL;
        if (!url) {
            throw new Error("MONGO_URL is not defined in environment variables");
        }
        const db = await mongoose.connect(url, {
            dbName: "ChatAppMicroServiceApp",
        });
        console.log(`MongoDB connected  on ${db?.connection?.host} successfully`);
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};
export default connectDB;
