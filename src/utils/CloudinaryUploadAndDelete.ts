import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { CLOUDINARY_IMAGE_FOLDER } from "../constant.js";

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

export const uploadToCloudinary = async (filePath: string) => {
  try {
    if (!filePath) return null;

    const result = await cloudinary.uploader.upload(filePath, {
      folder: CLOUDINARY_IMAGE_FOLDER,
      use_filename: true,
      resource_type: "auto",
    });

    // remove file from temp folder
    fs.unlinkSync(filePath);
    return result;
  } catch (error) {
    console.log("☁️ Error while uploading file to cloudinary! error : ", error);
    fs.unlinkSync(filePath);
    return null;
  }
};

export const deleteFromCloudinary = async (publicUrl: string) => {
  try {
    const publicId = publicUrl.split(".")[2].split("/").slice(5).join("/");
    cloudinary.api
      .delete_resources([publicId], {
        resource_type: "image",
        type: "upload",
        invalidate: true,
      })
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.log(`🔴☁️ Error while deleting files ${error}`);
        return null;
      });
  } catch (error) {
    console.log(`🔴☁️ Error while deleting files ${error}`);
    return null;
  }
};
