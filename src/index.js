import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "src/.env",
});
const PORT = process.env.PORT || 8001;
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server listening on ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("DB Connection error", err);
    });
