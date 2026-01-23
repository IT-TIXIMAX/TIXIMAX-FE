import api from "../config/api";

const uploadImageService = {
  /**
   * Upload single image to server
   * @param {File} file - Image file to upload
   * @param {Object} options - Axios options (onUploadProgress, etc.)
   * @returns {Promise<Object>} Upload response
   */
  upload: async (file, options = {}) => {
    if (!file) {
      throw new Error("File is required");
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post("/images/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...options,
    });

    return response.data;
  },

  /**
   * Delete single image by URL
   * @param {string} imageUrl - Full URL or path of the image to delete
   * @returns {Promise<Object>} Delete response
   */
  deleteByUrl: async (imageUrl) => {
    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    const response = await api.delete(`/images/delete-image`, {
      params: { filePath: imageUrl },
    });

    return response.data;
  },

  /**
   * Upload file to server (NEW endpoint)
   * Endpoint: POST /images/upload-file
   * @param {File} file - File to upload
   * @param {Object} options - Axios options (onUploadProgress, etc.)
   * @param {string} fieldName - field name in multipart (default: "file")
   * @returns {Promise<Object>} Upload response
   */
  uploadFile: async (file, options = {}, fieldName = "file") => {
    if (!file) throw new Error("File is required");

    const formData = new FormData();
    formData.append(fieldName, file);

    const response = await api.post("/images/upload-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      ...options,
    });

    return response.data;
  },

  /**
   * Delete file by path (NEW endpoint)
   * Endpoint: DELETE /images/delete-file?filePath=...
   * @param {string} filePath - file path/url to delete
   * @returns {Promise<Object>} Delete response
   */
  deleteFile: async (filePath) => {
    if (!filePath) throw new Error("filePath is required");

    const response = await api.delete("/images/delete-file", {
      params: { filePath },
    });

    return response.data;
  },
};

export default uploadImageService;
