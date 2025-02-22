import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { APIError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import dotenv from "dotenv";

dotenv.config({
    path: "/src/.env",
});

export const verifyJWT = asyncHandler(async (req, _, next) => {
    const token =
        req.cookies.accesstoken ||
        req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new APIError("401", "Unauthorized");
    }
    try {
        const decodedToken = jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshtoken"
        );

        req.user = user;

        next();
    } catch (error) {
        throw new APIError("401", error?.message || "Invalid access token");
    }
});
