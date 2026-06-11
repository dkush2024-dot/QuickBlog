import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("❌ MONGODB_URI environment variable is not set. Check your .env file.");
        }

        mongoose.connection.on('connected', () => {
            console.log("✅ Database Connected Successfully");
        });

        mongoose.connection.on('disconnected', () => {
            console.log("⚠️ Database Disconnected");
        });

        mongoose.connection.on('error', (error) => {
            console.error("❌ Database Connection Error:", error.message);
        });

        await mongoose.connect(process.env.MONGODB_URI, {
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            retryWrites: true,
            w: 'majority'
        });

        console.log("✅ MongoDB connected successfully");
        return true;
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

export default connectDB;