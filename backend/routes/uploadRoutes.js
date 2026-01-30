import express from "express";
import { uploadSingle } from "../middleware/upload.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { authenticate } from "../middleware/auth.js";
import fs from "fs";

const router = express.Router();

// Upload single image
router.post("/image", authenticate, uploadSingle("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.path,
      "products",
      "image"
    );

    // Delete local file after upload
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url: result.url,
      publicId: result.publicId,
    });
  } catch (error) {
    // Clean up local file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Image upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: error.message,
    });
  }
});

export default router;
