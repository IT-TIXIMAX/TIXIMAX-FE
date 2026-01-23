// src/common/UploadFile.jsx
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import uploadImageService from "../Services/uploadImageService"; // đổi path nếu khác

const MAX_SIZE_MB_DEFAULT = 50;

const isUrlLike = (s) => /^https?:\/\//i.test(String(s || "").trim());

const getFileNameFromUrlOrPath = (s) => {
  const str = String(s || "");
  try {
    const u = new URL(str);
    const p = u.pathname.split("/").filter(Boolean);
    return p[p.length - 1] || str;
  } catch {
    const p = str.split("/").filter(Boolean);
    return p[p.length - 1] || str;
  }
};

const UploadFile = ({
  fileUrl = "",
  onFileUpload,
  onFileRemove,
  label = "File",
  required = false,
  maxSizeMB = MAX_SIZE_MB_DEFAULT,
  accept = "*", // vd: ".pdf,.xlsx,.docx" hoặc "application/pdf"
  placeholder = "Chưa có file",
  className = "",
  showPreviewName = true,
}) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpload = async (file) => {
    if (!file) return;

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`File quá lớn. Vui lòng chọn file dưới ${maxSizeMB}MB`);
      return;
    }

    try {
      setUploading(true);

      // NEW endpoint: /images/upload-file
      const response = await uploadImageService.uploadFile(file, {
        onUploadProgress: (p) => {
          // bạn có thể show progress nếu muốn
          // const percent = p.total ? Math.round((p.loaded * 100) / p.total) : 0;
        },
      });

      // cố gắng map nhiều dạng response
      let uploadedUrl =
        (typeof response === "string" && response) ||
        response?.url ||
        response?.fileUrl ||
        response?.filePath ||
        response?.data?.url ||
        response?.data?.fileUrl ||
        response?.data?.filePath;

      if (!uploadedUrl) {
        toast.error("Upload thành công nhưng không lấy được URL/filePath");
        return;
      }

      onFileUpload?.(uploadedUrl);
      toast.success("Upload file thành công!");
    } catch (error) {
      console.error("Lỗi upload file:", error);
      toast.error(
        "Upload thất bại: " + (error.response?.data?.error || error.message),
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!fileUrl) {
      toast.error("Không có file để xóa");
      return;
    }

    try {
      setDeleting(true);

      try {
        // NEW endpoint: DELETE /images/delete-file?filePath=...
        await uploadImageService.deleteFile(fileUrl);
      } catch (deleteError) {
        console.warn("Không thể xóa file từ server:", deleteError);
      }

      onFileRemove?.();
      toast.success("Đã xóa file thành công");
    } catch (error) {
      console.error("Lỗi khi xóa file:", error);
      toast.error("Có lỗi khi xóa file");
    } finally {
      setDeleting(false);
    }
  };

  const displayName = fileUrl ? getFileNameFromUrlOrPath(fileUrl) : "";

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="space-y-3">
        {/* Buttons */}
        <div className="flex gap-2 flex-wrap">
          <label className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 disabled:opacity-50 text-sm flex items-center">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Uploading...
              </>
            ) : (
              "Upload File"
            )}
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={(e) => handleUpload(e.target.files?.[0])}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {fileUrl && (
            <>
              {isUrlLike(fileUrl) && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 text-sm inline-flex items-center"
                >
                  Open File
                </a>
              )}

              <button
                type="button"
                onClick={handleRemove}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm disabled:opacity-50 flex items-center"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete File"
                )}
              </button>
            </>
          )}
        </div>

        {/* Preview */}
        {fileUrl ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <div className="text-sm font-medium text-green-800">
                  File đã upload thành công
                </div>
                {showPreviewName ? (
                  <div className="mt-1 text-xs text-green-800/80 break-all">
                    {displayName}
                  </div>
                ) : null}
                <div className="mt-1 text-xs text-green-800/70 break-all">
                  {String(fileUrl)}
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
                  d="M7 16a4 4 0 01.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M9 19l3 3 3-3M12 12v10"
                />
              </svg>
              <span>{placeholder}</span>
              <span className="text-xs text-gray-400">
                Chọn file để upload (tối đa {maxSizeMB}MB)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadFile;
