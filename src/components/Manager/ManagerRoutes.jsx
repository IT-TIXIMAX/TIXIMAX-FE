import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiFileText,
  FiRefreshCw,
} from "react-icons/fi";
import managerRoutesService from "../../Services/Manager/managerRoutesService";
import ConfirmDialog from "../../common/ConfirmDialog";
import { Truck, Check } from "lucide-react";

const ManagerRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateRatesLoading, setUpdateRatesLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ✅ Thêm differenceRate & updateAuto cho đúng API
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

  // Cập nhật tỷ giá cho tất cả routes
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
      editingId ? "Đang cập nhật..." : "Đang tạo mới..."
    );

    try {
      // ✅ Chuẩn payload đúng API mới
      const submitData = {
        name: formData.name,
        shipTime: formData.shipTime, // API đang nhận string -> giữ nguyên
        unitBuyingPrice: Number(formData.unitBuyingPrice) || 0,
        unitDepositPrice: Number(formData.unitDepositPrice) || 0,
        exchangeRate: Number(formData.exchangeRate) || 0,
        differenceRate: Number(formData.differenceRate) || 0,
        updateAuto: !!formData.updateAuto,
        note: formData.note,
      };

      if (editingId) {
        // Optimistic update
        setRoutes((prev) =>
          prev.map((item) =>
            item.routeId === editingId ? { ...item, ...submitData } : item
          )
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

  // ✅ riêng checkbox updateAuto
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN").format(amount);

  // ===== Loading Skeleton Rows (7 cột, khớp thead) =====
  const SkeletonRows = () =>
    [...Array(8)].map((_, idx) => (
      <tr key={idx} className="animate-pulse">
        <td className="px-4 py-3">
          <div className="h-4 w-20 bg-slate-100 rounded" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-24 bg-slate-100 rounded" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-24 bg-slate-100 rounded ml-auto" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-24 bg-slate-100 rounded ml-auto" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-24 bg-slate-100 rounded ml-auto" />
        </td>
        <td className="px-4 py-3">
          <div className="h-4 w-40 bg-slate-100 rounded" />
        </td>
        <td className="px-4 py-3">
          <div className="h-8 w-24 bg-slate-100 rounded mx-auto" />
        </td>
      </tr>
    ));

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto space-y-6">
        {/* Header giống style màn Bank Accounts */}
        <div className="border border-blue-400 bg-blue-600 text-white rounded-xl px-5 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-semibold">
                Quản lý tuyến vận chuyển
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleUpdateExchangeRates}
              disabled={updateRatesLoading || loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-200"
            >
              {updateRatesLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <>
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Cập nhật tỷ giá</span>
                </>
              )}
            </button>

            <button
              onClick={openCreateDialog}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 shadow-sm border border-blue-300"
            >
              <FiPlus className="w-4 h-4" />
              Thêm tuyến
            </button>
          </div>
        </div>

        {/* Table card đồng bộ style */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Mã tỷ giá
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Thời gian
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                    ĐG mua hộ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                    ĐG ký gửi
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                    Tỷ giá
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                    Tên tuyến
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <SkeletonRows />
                ) : routes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      <FiFileText className="w-12 h-12 text-slate-300 mb-3 mx-auto" />
                      <p className="text-sm font-medium mb-1">
                        Chưa có dữ liệu tuyến vận chuyển
                      </p>

                      <button
                        onClick={openCreateDialog}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-1 shadow-sm"
                      >
                        <FiPlus className="w-4 h-4" />
                        Thêm tuyến mới
                      </button>
                    </td>
                  </tr>
                ) : (
                  routes.map((item) => (
                    <tr
                      key={item.routeId}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {item.shipTime}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-900 font-mono">
                        {item.unitBuyingPrice
                          ? formatCurrency(item.unitBuyingPrice)
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-900 font-mono">
                        {item.unitDepositPrice
                          ? formatCurrency(item.unitDepositPrice)
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-900 font-mono">
                        {item.exchangeRate
                          ? formatCurrency(item.exchangeRate)
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs truncate" title={item.note}>
                          {item.note || "Không có"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 p-1.5 rounded-lg border border-amber-200 transition-all"
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.routeId)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 p-1.5 rounded-lg border border-red-200 transition-all"
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
            <div className="absolute inset-x-0 bottom-0 bg-white/80 flex items-center justify-center py-4 rounded-b-xl border-t border-red-100">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
                <span className="text-red-600 text-xs font-medium">
                  Đang xóa...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog nhỏ gọn */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                {editingId
                  ? "Cập nhật tuyến vận chuyển"
                  : "Thêm tuyến vận chuyển mới"}
              </h3>
              <button
                onClick={closeDialog}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded hover:bg-slate-100"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mã tỷ giá<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    placeholder="VD: JPY - VNĐ"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Thời gian vận chuyển <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="shipTime"
                    value={formData.shipTime}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    placeholder="VD: 7-10 ngày"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Đơn giá mua hộ (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="unitBuyingPrice"
                    value={formData.unitBuyingPrice}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Đơn giá ký gửi (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="unitDepositPrice"
                    value={formData.unitDepositPrice}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tỷ giá
                  </label>
                  <input
                    type="number"
                    name="exchangeRate"
                    value={formData.exchangeRate}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* ✅ Tỷ giá chênh */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tỷ giá chênh (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="differenceRate"
                    value={formData.differenceRate}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tên tuyến
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    placeholder="Nhập tên tuyến vận chuyển..."
                    rows={3}
                  />
                </div>

                {/* ✅ Checkbox updateAuto */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      name="updateAuto"
                      checked={formData.updateAuto}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 border-slate-300 rounded"
                    />
                    Tự động cập nhật tỷ giá cho mã này
                  </label>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Nếu bật, hệ thống sẽ tự cập nhật tỷ giá dựa trên nguồn tỷ
                    giá chung (API backend).
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-medium transition-colors border border-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors inline-flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  {editingId ? "Cập nhật" : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default ManagerRoutes;
