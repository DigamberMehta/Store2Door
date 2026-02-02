const API_URL = import.meta.env.VITE_API_URL;

/**
 * Upload an image to the server
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} The URL of the uploaded image
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_URL}/upload/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Failed to upload image");
  }

  return data.url;
};
