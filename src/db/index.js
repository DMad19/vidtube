import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";
dotenv.config({
    path: "./src/env",
});

const connectDB = async () => {
    try {
        const DBConnInstance = await mongoose.connect(
            `${process.env.MONGO_DB_URI}/${DB_NAME}`
        );
        console.log(
            `DB connection successful. host: ${DBConnInstance.connection.host}`
        );
    } catch (Error) {
        console.log(`Unable to connect DB.${Error}`);
        process.exit(1);
    }
};

export default connectDB;
