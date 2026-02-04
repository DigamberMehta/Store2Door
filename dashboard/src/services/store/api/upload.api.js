import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/managers";

/**
 * Upload API Service for Store Image Uploads
 */
export const uploadAPI = {
  /**
   * Upload store image (logo or cover)
   * @param {File} file - Image file to upload
   * @returns {Promise<{url: string, publicId: string}>}
   */
  uploadStoreImage: async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${API_BASE_URL}/upload/store-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  },

  /**
   * Upload product images
   * @param {FileList|File[]} files - Image files to upload
   * @returns {Promise<Array<{url: string, publicId: string}>>}
   */
  uploadProductImages: async (files) => {
    const formData = new FormData();
    
    // Handle both FileList and array of Files
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      formData.append("images", file);
    });

    const token = localStorage.getItem("storeAuthToken");

    const response = await axios.post(
      `${API_BASE_URL}/upload/product-images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  },
};
