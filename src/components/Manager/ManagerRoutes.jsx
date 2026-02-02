import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiRefreshCw } from "react-icons/fi";
import { Truck, Check, ArrowLeft } from "lucide-react";
import managerRoutesService from "../../Services/Manager/managerRoutesService";
import ConfirmDialog from "../../common/ConfirmDialog";

const ManagerRoutes = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateRatesLoading, setUpdateRatesLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    shipTime: "",
    unitBuyingPrice: "",
    unitDepositPrice: "",
    exchangeRate: "",
    differenceRate: "",
    updateAuto: false,
    note: "",
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const data = await managerRoutesService.getRoutes();
      setRoutes(data);
    } catch {
      toast.error("Có lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExchangeRates = async () => {
    setUpdateRatesLoading(true);
    const loadingToast = toast.loading("Đang cập nhật tỷ giá...");

    try {
      await managerRoutesService.updateExchangeRates();
      toast.success("Cập nhật tỷ giá thành công!", { id: loadingToast });
      await fetchRoutes();
    } catch (error) {
      let errorMessage = "Có lỗi xảy ra khi cập nhật tỷ giá!";
      if (error.response?.data) {
        errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          error.response.data.detail ||
          JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage, { id: loadingToast, duration: 5000 });
    } finally {
      setUpdateRatesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading(
      editingId ? "Đang cập nhật..." : "Đang tạo mới...",
    );

    try {
      const submitData = {
        name: formData.name,
        shipTime: formData.shipTime,
        unitBuyingPrice: Number(formData.unitBuyingPrice) || 0,
        unitDepositPrice: Number(formData.unitDepositPrice) || 0,
        exchangeRate: Number(formData.exchangeRate) || 0,
        differenceRate: Number(formData.differenceRate) || 0,
        updateAuto: !!formData.updateAuto,
        note: formData.note,
      };

      if (editingId) {
        setRoutes((prev) =>
          prev.map((item) =>
            item.routeId === editingId ? { ...item, ...submitData } : item,
          ),
        );
        await managerRoutesService.updateRoute(editingId, submitData);
        toast.success("Cập nhật thành công!", { id: loadingToast });
      } else {
        const newItem = await managerRoutesService.createRoute(submitData);
        setRoutes((prev) => [...prev, newItem]);
        toast.success("Tạo mới thành công!", { id: loadingToast });
      }

      closeDialog();
    } catch (error) {
      let errorMessage = "Có lỗi xảy ra!";
      if (error.response?.data) {
        errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          error.response.data.detail ||
          JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { id: loadingToast, duration: 5000 });
      if (editingId) fetchRoutes();
    }
  };

  const closeDialog = () => {
    setFormData({
      name: "",
      shipTime: "",
      unitBuyingPrice: "",
      unitDepositPrice: "",
      exchangeRate: "",
      differenceRate: "",
      updateAuto: false,
      note: "",
    });
    setShowDialog(false);
    setEditingId(null);
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData({
      name: "",
      shipTime: "",
      unitBuyingPrice: "",
      unitDepositPrice: "",
      exchangeRate: "",
      differenceRate: "",
      updateAuto: false,
      note: "",
    });
    setShowDialog(true);
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      shipTime: item.shipTime,
      unitBuyingPrice: item.unitBuyingPrice || "",
      unitDepositPrice: item.unitDepositPrice || "",
      exchangeRate: item.exchangeRate || "",
      differenceRate: item.differenceRate ?? "",
      updateAuto: item.updateAuto ?? false,
      note: item.note || "",
    });
    setEditingId(item.routeId);
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);

    try {
      setRoutes((prev) => prev.filter((item) => item.routeId !== deleteId));
      await managerRoutesService.deleteRoute(deleteId);
      toast.success("Xóa thành công!");
    } catch (error) {
      let errorMessage = "Có lỗi xảy ra khi xóa!";
      if (error.response?.data) {
        errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          error.response.data.detail ||
          "Có lỗi xảy ra khi xóa!";
      }
      toast.error(errorMessage, { duration: 5000 });
      fetchRoutes();
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

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN").format(amount);

  const SkeletonRows = () =>
    [...Array(8)].map((_, idx) => (
      <tr key={idx} className="animate-pulse">
        <td className="px-4 py-3">
          <div className="h-4 w-20 bg-slate-200 rounded" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-40 bg-slate-200 rounded" />
        </td>
        <td className="px-4 py-3">
          <div className="h-8 w-24 bg-slate-200 rounded mx-auto" />
        </td>
      </tr>
    ));

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
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
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Quay lại Cấu hình</span>
                </button>
              </div>

              {/* ✅ Title Row */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Left side - Title */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-1.5 h-10 md:h-12 bg-white/90 rounded-full shrink-0 shadow-sm" />
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md">
                    <Truck className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                      Quản Lý Tuyến Vận Chuyển
                    </h1>
                  </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleUpdateExchangeRates}
                    disabled={updateRatesLoading || loading}
                    className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateRatesLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        <span className="text-sm">Đang cập nhật...</span>
                      </>
                    ) : (
                      <>
                        <FiRefreshCw className="w-4 h-4" />
                        <span className="text-sm">Cập nhật tỷ giá</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={openCreateDialog}
                    className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-white/20"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span className="text-sm">Thêm tuyến</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Stats bar */}
          <div className="px-4 md:px-6 py-4 bg-slate-50 border-b border-slate-200">
            {loading ? (
              <div className="h-4 w-56 bg-slate-200 rounded animate-pulse" />
            ) : (
              <div className="text-sm md:text-base font-medium text-slate-700">
                Hiển thị{" "}
                <span className="text-lg font-bold text-blue-600">
                  {routes.length}
                </span>{" "}
                tuyến vận chuyển
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <Th>Mã tỷ giá</Th>
                  <Th>Thời gian</Th>
                  <Th className="text-right">ĐG mua hộ</Th>
                  <Th className="text-right">ĐG ký gửi</Th>
                  <Th className="text-right">Tỷ giá</Th>
                  <Th>Tên tuyến</Th>
                  <Th className="text-center">Thao tác</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <SkeletonRows />
                ) : routes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16">
                      <div className="flex flex-col items-center gap-3">
                        <Truck className="w-16 h-16 text-slate-300" />
                        <p className="text-slate-500 font-medium text-lg">
                          Chưa có dữ liệu tuyến vận chuyển
                        </p>
                        <button
                          onClick={openCreateDialog}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-md hover:shadow-lg mt-2"
                        >
                          <FiPlus className="w-4 h-4" />
                          Thêm tuyến mới
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  routes.map((item) => (
                    <tr
                      key={item.routeId}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-blue-700">
                        {item.name}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                          {item.shipTime}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-800 font-mono">
                        {item.unitBuyingPrice
                          ? formatCurrency(item.unitBuyingPrice)
                          : "-"}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-800 font-mono">
                        {item.unitDepositPrice
                          ? formatCurrency(item.unitDepositPrice)
                          : "-"}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-800 font-mono">
                        {item.exchangeRate
                          ? formatCurrency(item.exchangeRate)
                          : "-"}
                      </td>

                      <td className="px-4 py-3 text-slate-700 font-medium">
                        <div
                          className="max-w-xs truncate"
                          title={item.note || "Không có"}
                        >
                          {item.note || (
                            <span className="text-slate-400 text-xs">
                              Không có
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 p-2 rounded-lg border border-amber-200 transition-all shadow-sm hover:shadow-md"
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.routeId)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded-lg border border-red-200 transition-all shadow-sm hover:shadow-md"
                            title="Xóa"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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

      {/* Modal */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base md:text-lg font-bold text-slate-900">
                {editingId
                  ? "Cập nhật tuyến vận chuyển"
                  : "Thêm tuyến vận chuyển mới"}
              </h3>
              <button
                onClick={closeDialog}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors p-2 rounded-lg"
                title="Đóng"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Mã tỷ giá <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="VD: JPY - VNĐ"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Thời gian vận chuyển <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="shipTime"
                    value={formData.shipTime}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="VD: 7-10 ngày"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Đơn giá mua hộ (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="unitBuyingPrice"
                    value={formData.unitBuyingPrice}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Đơn giá ký gửi (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="unitDepositPrice"
                    value={formData.unitDepositPrice}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tỷ giá
                  </label>
                  <input
                    type="number"
                    name="exchangeRate"
                    value={formData.exchangeRate}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tỷ giá chênh (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="differenceRate"
                    value={formData.differenceRate}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên tuyến
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập tên tuyến vận chuyển..."
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      name="updateAuto"
                      checked={formData.updateAuto}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-700">
                        Tự động cập nhật tỷ giá cho mã này
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Nếu bật, hệ thống sẽ tự cập nhật tỷ giá dựa trên nguồn
                        tỷ giá chung (API backend).
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-slate-300 shadow-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Check className="w-4 h-4" />
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
        message="Bạn có chắc chắn muốn xóa tuyến vận chuyển này không? Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn."
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

export default ManagerRoutes;
