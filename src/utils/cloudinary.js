import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: "/src/.env" });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) return null;

        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto",
        });
        console.log(`File uploaded successfully. File src: ${response.url}`);
        fs.unlinkSync(localfilepath);
        return response;
    } catch (error) {
        fs.unlinkSync(localfilepath);
        return null;
    }
};

const deleteFromCloudinary = async (publicID) => {
    try {
        const result = await cloudinary.uploader.destroy(publicID);
    } catch (error) {
        console.log("error deleting from cloudinary");
        return null;
    }
};
export { uploadOnCloudinary, deleteFromCloudinary };
