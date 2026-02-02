import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiGlobe,
  FiArrowLeft,
} from "react-icons/fi";
import websiteService from "../../Services/SharedService/websiteService";
import ConfirmDialog from "../../common/ConfirmDialog";

const ManagerWebsite = ({ token }) => {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ websiteName: "" });

  useEffect(() => {
    fetchWebsites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const data = await websiteService.getAllWebsite(token);
      setWebsites(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Có lỗi khi tải dữ liệu!");
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(
      editingId ? "Đang cập nhật..." : "Đang tạo mới...",
    );
    try {
      if (editingId) {
        setWebsites((prev) =>
          prev.map((item) =>
            item.websiteId === editingId ? { ...item, ...formData } : item,
          ),
        );
        await websiteService.updateWebsite(editingId, formData, token);
        toast.success("Cập nhật thành công!", { id: loadingToast });
      } else {
        const newItem = await websiteService.createWebsite(formData, token);
        setWebsites((prev) => [...prev, newItem]);
        toast.success("Tạo mới thành công!", { id: loadingToast });
      }
      closeDialog();
    } catch (error) {
      let errorMessage = "Có lỗi xảy ra!";
      if (error?.response?.data) {
        errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          error.response.data.detail ||
          JSON.stringify(error.response.data);
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage, { id: loadingToast, duration: 5000 });
      if (editingId) fetchWebsites();
    }
  };

  const closeDialog = () => {
    setFormData({ websiteName: "" });
    setShowDialog(false);
    setEditingId(null);
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData({ websiteName: "" });
    setShowDialog(true);
  };

  const handleEdit = (item) => {
    setFormData({ websiteName: item.websiteName });
    setEditingId(item.websiteId);
    setShowDialog(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      setWebsites((prev) => prev.filter((item) => item.websiteId !== deleteId));
      await websiteService.deleteWebsite(deleteId, token);
      toast.success("Xóa thành công!");
    } catch (error) {
      let errorMessage = "Có lỗi xảy ra khi xóa!";
      if (error?.response?.data) {
        errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          error.response.data.detail ||
          "Có lỗi xảy ra khi xóa!";
      }
      toast.error(errorMessage, { duration: 5000 });
      fetchWebsites();
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Loading Skeleton
  const TableSkeletonRows = () =>
    [...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-4 py-3">
          <div className="h-4 w-16 bg-slate-200 rounded" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-40 bg-slate-200 rounded" />
        </td>
        <td className="px-4 py-3">
          <div className="h-8 w-24 bg-slate-200 rounded mx-auto" />
        </td>
      </tr>
    ));

  const renderTableContent = () => {
    if (loading) return <TableSkeletonRows />;

    if (websites.length === 0) {
      return (
        <tr>
          <td colSpan="3" className="py-16">
            <div className="flex flex-col items-center gap-3">
              <FiGlobe className="w-16 h-16 text-slate-300" />
              <h3 className="text-slate-500 font-medium text-lg">
                Chưa có dữ liệu website
              </h3>
              <p className="text-sm text-slate-400">
                Nhấn nút "Thêm website mới" để bắt đầu
              </p>
              <button
                onClick={openCreateDialog}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-md hover:shadow-lg mt-2"
              >
                <FiPlus className="w-4 h-4" />
                Thêm website mới
              </button>
            </div>
          </td>
        </tr>
      );
    }

    return websites.map((item) => (
      <tr
        key={item.websiteId}
        className="hover:bg-blue-50/50 transition-colors"
      >
        <td className="px-4 py-3 font-semibold text-slate-600">
          #{item.websiteId}
        </td>

        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <FiGlobe className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-semibold text-slate-900">
              {item.websiteName}
            </span>
          </div>
        </td>

        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(item)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg border border-amber-200 transition-all shadow-sm hover:shadow-md"
              title="Chỉnh sửa"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
              Sửa
            </button>
            <button
              onClick={() => handleDelete(item.websiteId)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg border border-red-200 transition-all shadow-sm hover:shadow-md"
              title="Xóa"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              Xóa
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <Toaster
        position="top-right"
        toastOptions={{ style: { fontSize: "12px" } }}
      />

      <div className="mx-auto space-y-6">
        {/* ✅ Header với nút Back - VERSION 1 */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-700 rounded-xl shadow-lg p-4 md:p-6">
            <div className="flex flex-col gap-4">
              {/* ✅ Back Button Row */}
              <div className="flex items-center">
                <button
                  onClick={() => navigate("/manager/settings")}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md border border-white/20"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Quay lại Cấu hình</span>
                </button>
              </div>

              {/* ✅ Title Row */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Left side - Title */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-1.5 h-10 md:h-12 bg-white/90 rounded-full shrink-0 shadow-sm" />
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md">
                    <FiGlobe className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                      Quản Lý Website
                    </h1>
                  </div>
                </div>

                {/* Right side - Actions */}
                <button
                  onClick={openCreateDialog}
                  className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-white/20"
                >
                  <FiPlus className="w-4 h-4" />
                  <span className="text-sm">Thêm website mới</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Table Card */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden relative">
          {/* Stats bar */}
          <div className="px-4 md:px-6 py-4 bg-slate-50 border-b border-slate-200">
            {loading ? (
              <div className="h-4 w-56 bg-slate-200 rounded animate-pulse" />
            ) : (
              <div className="text-sm md:text-base font-medium text-slate-700">
                Hiển thị{" "}
                <span className="text-lg font-bold text-blue-600">
                  {websites.length}
                </span>{" "}
                website
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <Th>ID</Th>
                  <Th>Tên website</Th>
                  <Th className="text-center">Thao tác</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {renderTableContent()}
              </tbody>
            </table>
          </div>

          {/* Delete Loading Overlay */}
          {deleteLoading && (
            <div className="absolute inset-x-0 bottom-0 bg-white/90 flex items-center justify-center py-4 rounded-b-xl border-t border-red-200">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
                <span className="text-red-600 text-sm font-medium">
                  Đang xóa...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal */}
      {showDialog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeDialog}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiGlobe className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-900">
                  {editingId ? "Cập nhật website" : "Thêm website mới"}
                </h3>
              </div>
              <button
                onClick={closeDialog}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                title="Đóng"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tên website <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    name="websiteName"
                    value={formData.websiteName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="VD: Shopee, Lazada, Tiki..."
                    required
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  <FiCheck className="w-4 h-4" />
                  {editingId ? "Cập nhật" : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeleteId(null);
        }}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa website này không? Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn."
        confirmText="Xác nhận xóa"
        cancelText="Hủy"
        loading={deleteLoading}
        type="danger"
      />
    </div>
  );
};

// Table Header Component
const Th = ({ children, className = "" }) => (
  <th
    className={`px-4 py-3 text-left font-bold text-sm uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

export default ManagerWebsite;
