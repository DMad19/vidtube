import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { APIResponse } from "../utils/apiResponse.js";

const generateAccessAndRefreshToken = async (userid) => {
    try {
        const user = await User.findById(userid);
        if (!user) {
            throw new APIError(400, "User Not Found");
        }
        const accesstoken = User.generateAccessToken();
        const refreshtoken = User.generateRefreshToken();

        user.refreshtoken = refreshtoken;

        await user.save({ validateBeforeSave: false });

        return { accesstoken, refreshtoken };
    } catch (error) {
        throw new APIError(
            500,
            "Something went wrong while generating access and refresh tokens"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;
    if (
        [fullname, email, username, password].some(
            (field) => field == null || field?.trim() === ""
        )
    ) {
        throw new APIError(400, "All Fields are Required");
    }
    const existingUser = await User.findOne({ $or: [{ username, email }] });
    if (existingUser) {
        throw new APIError(
            "400",
            "User with given email or username already exists"
        );
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;

    // if (!avatarLocalPath) {
    //     throw new APIError(404, "Avatar File is Missing");
    // }
    // const avatar = await uploadOnCloudinary(avatarLocalPath);

    // const coverimage = "";
    // if (coverLocalPath) {
    //     coverimage = await uploadOnCloudinary(coverLocalPath);
    // }
    let avatar;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        console.log("Uploaded Avatar");
    } catch (error) {
        console.log("Error uploading avatar", error);
        throw new APIError(500, "Failed to upload avatar");
    }

    let coverimage;
    try {
        if (coverLocalPath) {
            coverimage = await uploadOnCloudinary(coverLocalPath);
            console.log("Uploaded cover image");
        }
    } catch (error) {
        console.log("Error uploading cover image", error);
        throw new APIError(500, "Failed to upload cover image");
    }

    try {
        const user = await User.create({
            username: username.toLowerCase(),
            email,
            fullname,
            avatar: avatar.url,
            coverimage: coverimage?.url || "",
            password,
        });
        const createdUser = await User.findById(user._id).select(
            "-password -refreshtoken"
        );
        if (!createdUser) {
            throw new APIError(
                401,
                "Something went Wrong while registering a User"
            );
        }

        return res
            .status(201)
            .json(
                new APIResponse(
                    200,
                    createdUser,
                    "User Registration Successful"
                )
            );
    } catch (error) {
        if (avatar) {
            await deleteFromCloudinary(avatar.public_id);
        }
        if (coverimage) {
            await deleteFromCloudinary(coverimage.public_id);
        }
        console.log(error);
        throw new APIError(
            500,
            "Something went wrong while registering a user and images were deleted from cloudinary"
        );
    }
});

const loginUser = asyncHandler(async (req, res) => {
    // get data from the body
    const { username, email, password } = req.body;

    //validation
    if (!email) {
        throw new APIError(400, "email is Required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new APIError(404, "user not found");
    }

    //if user found, validate password
    let isPasswordValid = await User.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new APIError(401, "Invalid Credentials");
    }

    const { accesstoken, refreshtoken } = await generateAccessAndRefreshToken(
        user._id
    );

    let loggedInUser = await User.findById(user._id).select(
        "-password -refreshtoken"
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    res.status(200)
        .cookie("accesstoken", accesstoken, options)
        .cookie("refreshtoken", refreshtoken, options)
        .json(
            new APIResponse(
                200,
                { user: { loggedInUser, accesstoken, refreshtoken } },
                "User logged in Successful"
            )
        );
});

export { registerUser, loginUser };
