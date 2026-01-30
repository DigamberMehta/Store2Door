import express from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import { uploadMultiple } from "../../middleware/upload.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";
import fs from "fs";

const router = express.Router();

// All routes require authentication and store_manager role
router.use(authenticate);
router.use(authorize("store_manager"));

/**
 * @desc Upload product images
 * @route POST /api/managers/upload/product-images
 * @access Private (Store Manager)
 */
router.post(
  "/product-images",
  uploadMultiple("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const uploadPromises = req.files.map(async (file) => {
        try {
          // Upload to Cloudinary
          const result = await uploadToCloudinary(
            file.path,
            "products",
            "image"
          );

          // Delete local file after upload
          fs.unlinkSync(file.path);

          return {
            url: result.url,
            alt: file.originalname,
            isPrimary: false,
          };
        } catch (error) {
          console.error("Error uploading file:", error);
          // Delete local file even if upload fails
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          throw error;
        }
      });

      const uploadedImages = await Promise.all(uploadPromises);

      res.status(200).json({
        success: true,
        message: "Images uploaded successfully",
        data: uploadedImages,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload images",
        error: error.message,
      });
    }
  }
);

export default router;
