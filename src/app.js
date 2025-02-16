import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config({
    path: "src/.env",
});

const app = express();

// common middle ware
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(express.json({ limit: "16Kb" }));
app.use(express.urlencoded({ extended: true, limit: "16Kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//import routes
import healthcheckRoutes from "./routes/healthcheck.routes.js";
import registeruserRoutes from "./routes/user.routes.js";

//use routes
app.use("/api/v1/healthcheck", healthcheckRoutes);
app.use("/api/v1/users", registeruserRoutes);

export { app };
