// src/common/UploadFolder.jsx
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import uploadImageService from "../Services/uploadImageService";
import { FolderOpen, File, Trash2, Loader2, Check, Upload } from "lucide-react";

const MAX_SIZE_MB_DEFAULT = 200;

const isUrlLike = (s) => /^https?:\/\//i.test(String(s || "").trim());

const UploadFolder = ({
  folderUrl = "",
  onFolderUpload,
  onFolderRemove,
  label = "Files/Folder",
  required = false,
  maxSizeMB = MAX_SIZE_MB_DEFAULT,
  accept = "*",
  placeholder = "Chưa có file/folder",
  className = "",
}) => {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileCount, setFileCount] = useState(0);

  const handleUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxBytes = maxSizeMB * 1024 * 1024;

    if (totalSize > maxBytes) {
      toast.error(
        `Tổng dung lượng quá lớn. Vui lòng chọn file/folder dưới ${maxSizeMB}MB`,
      );
      return;
    }

    try {
      setUploading(true);
      setFileCount(files.length);
      setUploadProgress(0);

      // Upload từng file
      const uploadedFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const response = await uploadImageService.uploadFile(file);

          let uploadedUrl =
            (typeof response === "string" && response) ||
            response?.url ||
            response?.fileUrl ||
            response?.filePath ||
            response?.data?.url ||
            response?.data?.fileUrl ||
            response?.data?.filePath;

          if (uploadedUrl) {
            uploadedFiles.push({
              path: file.webkitRelativePath || file.name,
              url: uploadedUrl,
              name: file.name,
              size: file.size,
              type: file.type,
            });
          }

          setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        } catch (error) {
          console.error(`Lỗi upload file ${file.name}:`, error);
          toast.error(`Không thể upload ${file.name}`);
        }
      }

      if (uploadedFiles.length === 0) {
        toast.error("Không thể upload bất kỳ file nào");
        return;
      }

      // Merge với files cũ (nếu có)
      const existingFiles = Array.isArray(folderUrl) ? folderUrl : [];
      const allFiles = [...existingFiles, ...uploadedFiles];

      // Gọi callback với danh sách files đã upload
      onFolderUpload?.(allFiles);
      toast.success(
        `Upload thành công ${uploadedFiles.length}/${files.length} files`,
      );
    } catch (error) {
      console.error("Lỗi upload:", error);
      toast.error("Upload thất bại: " + (error.message || "Unknown error"));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setFileCount(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (folderInputRef.current) folderInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!folderUrl || !Array.isArray(folderUrl) || folderUrl.length === 0) {
      toast.error("Không có file để xóa");
      return;
    }

    try {
      setDeleting(true);

      // Xóa từng file
      for (const fileInfo of folderUrl) {
        try {
          await uploadImageService.deleteFile(fileInfo.url);
        } catch (deleteError) {
          console.warn(
            `Không thể xóa file ${fileInfo.name} từ server:`,
            deleteError,
          );
        }
      }

      onFolderRemove?.();
      toast.success("Đã xóa tất cả files thành công");
    } catch (error) {
      console.error("Lỗi khi xóa files:", error);
      toast.error("Có lỗi khi xóa files");
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveSingleFile = async (index) => {
    if (!folderUrl || !Array.isArray(folderUrl)) return;

    const fileToRemove = folderUrl[index];

    try {
      // Xóa file khỏi server
      try {
        await uploadImageService.deleteFile(fileToRemove.url);
      } catch (deleteError) {
        console.warn(
          `Không thể xóa file ${fileToRemove.name} từ server:`,
          deleteError,
        );
      }

      // Xóa file khỏi danh sách
      const newFiles = folderUrl.filter((_, idx) => idx !== index);

      if (newFiles.length === 0) {
        onFolderRemove?.();
      } else {
        onFolderUpload?.(newFiles);
      }

      toast.success(`Đã xóa ${fileToRemove.name}`);
    } catch (error) {
      console.error("Lỗi khi xóa file:", error);
      toast.error("Có lỗi khi xóa file");
    }
  };

  const hasFiles =
    folderUrl && Array.isArray(folderUrl) && folderUrl.length > 0;

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="space-y-3">
        {/* Buttons */}
        <div className="flex gap-2 flex-wrap">
          {/* Upload Files Button */}
          <label className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 disabled:opacity-50 text-sm flex items-center gap-2">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Files
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {/* Upload Folder Button */}
          <label className="bg-indigo-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-600 disabled:opacity-50 text-sm flex items-center gap-2">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading... {uploadProgress}%
              </>
            ) : (
              <>
                <FolderOpen className="w-4 h-4" />
                Upload Folder
              </>
            )}
            <input
              ref={folderInputRef}
              type="file"
              accept={accept}
              // @ts-ignore - webkitdirectory is not in standard types
              webkitdirectory=""
              directory=""
              multiple
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {/* Delete All Button */}
          {hasFiles && (
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm disabled:opacity-50 flex items-center gap-2"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete All
                </>
              )}
            </button>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-sm font-medium text-blue-800">
                Đang upload {fileCount} files...
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-xs text-blue-600 mt-1 text-right">
              {uploadProgress}%
            </div>
          </div>
        )}

        {/* Preview */}
        {hasFiles ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-700" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-green-800">
                  Đã upload thành công
                </div>
                <div className="text-xs text-green-700 mt-1">
                  {folderUrl.length} files •{" "}
                  {(
                    folderUrl.reduce((sum, f) => sum + (f.size || 0), 0) /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </div>
              </div>
            </div>

            {/* File List */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {folderUrl.map((fileInfo, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-md p-2 border border-green-200 hover:border-green-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <File className="w-4 h-4 text-green-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-800 truncate">
                        {fileInfo.path || fileInfo.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(fileInfo.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {isUrlLike(fileInfo.url) && (
                        <a
                          href={fileInfo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Open
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveSingleFile(idx)}
                        className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50"
                        title="Xóa file này"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 bg-gray-100 p-6 rounded-md text-center border-2 border-dashed border-gray-300">
            <div className="flex flex-col items-center space-y-3">
              <div className="flex gap-2">
                <Upload className="w-12 h-12 text-gray-400" />
                <FolderOpen className="w-12 h-12 text-gray-400" />
              </div>
              <span className="font-medium">{placeholder}</span>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Chọn files hoặc folder để upload</div>
                <div>(tối đa {maxSizeMB}MB)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadFolder;
