import React, { useState } from "react";
import toast from "react-hot-toast";
import uploadImageService from "../Services/uploadImageService";
import imageCompression from "browser-image-compression";

const UploadImg = ({
  imageUrl = "",
  onImageUpload,
  onImageRemove,
  label = "Img",
  required = false,
  maxSizeMB = 3,
  placeholder = "Chưa có ảnh",
  className = "",
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh");
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File quá lớn. Vui lòng chọn ảnh dưới ${maxSizeMB}MB`);
      return;
    }

    try {
      setUploading(true);

      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1080,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const response = await uploadImageService.upload(compressedFile);

      let uploadedImageUrl =
        typeof response === "string" && response.startsWith("http")
          ? response
          : response?.url || response?.imageUrl || response?.data?.url;

      if (!uploadedImageUrl) {
        toast.error("Upload thành công nhưng không lấy được URL ảnh");
        return;
      }

      // Call parent callback
      onImageUpload?.(uploadedImageUrl);
      toast.success("Upload ảnh thành công!");
    } catch (error) {
      console.error("Lỗi upload:", error);
      toast.error(
        "Upload thất bại: " + (error.response?.data?.error || error.message),
      );
    } finally {
      setUploading(false);
    }
  };

  // Handle image removal
  const handleRemoveImage = async () => {
    if (!imageUrl) {
      toast.error("Không có ảnh để xóa");
      return;
    }

    try {
      setDeleting(true);

      try {
        await uploadImageService.deleteByUrl(imageUrl);
        console.log("Đã xóa ảnh từ server thành công");
      } catch (deleteError) {
        console.warn("Không thể xóa ảnh từ server:", deleteError);
      }

      // Call parent callback
      onImageRemove?.();
      toast.success("Đã xóa ảnh thành công");
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      toast.error("Có lỗi khi xóa ảnh");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="space-y-3">
        {/* Upload buttons */}
        <div className="flex space-x-2">
          <label className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 disabled:opacity-50 text-sm flex items-center">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              "Upload Img"
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files[0])}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {imageUrl && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm disabled:opacity-50 flex items-center"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete Img"
              )}
            </button>
          )}
        </div>

        {/* Image preview or placeholder */}
        {imageUrl ? (
          <div className="flex items-center space-x-3">
            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-20 h-20 object-cover border border-gray-200 rounded-md"
            />
            <div className="flex-1">
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-green-800">
                    Ảnh đã upload thành công
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 bg-gray-100 p-4 rounded-md text-center border-2 border-dashed border-gray-300">
            <div className="flex flex-col items-center space-y-2">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{placeholder}</span>
              <span className="text-xs text-gray-400">
                Chọn ảnh để upload (tối đa {maxSizeMB}MB)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadImg;
