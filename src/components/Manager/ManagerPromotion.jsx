// src/pages/Manager/ManagerPromotion.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  FiPlus,
  FiTrash2,
  FiX,
  FiGift,
  FiPercent,
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiCheck,
  FiEdit,
  FiArrowLeft,
} from "react-icons/fi";
import managerPromotionService from "../../Services/Manager/managerPromotionService";
import managerRoutesService from "../../Services/Manager/managerRoutesService";
import ConfirmDialog from "../../common/ConfirmDialog";

// Helpers
const toIso = (v) => {
  if (!v) return v;
  if (typeof v === "string" && v.endsWith("Z")) return v;
  try {
    return new Date(v).toISOString();
  } catch {
    return v;
  }
};

const toDatetimeLocal = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
};

const VOUCHER_TYPES = [
  { value: "PHAN_TRAM", label: "PHẦN TRĂM" },
  { value: "CO_DINH", label: "CỐ ĐỊNH" },
];

const ASSIGN_TYPES = [
  { value: "THU_CONG", label: "THỦ CÔNG" },
  { value: "DANG_KI_TK", label: "ĐĂNG KÝ TÀI KHOẢN" },
  { value: "DAT_CHI_TIEU", label: "ĐẠT CHỈ TIÊU" },
];

const ManagerPromotion = () => {
  const navigate = useNavigate();

  // Table & paging
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Form in modal
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "PHAN_TRAM",
    value: "",
    description: "",
    startDate: "",
    endDate: "",
    minOrderValue: "",
    assignType: "THU_CONG",
    thresholdAmount: "",
    routeIds: [],
  });

  // Delete
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Routes
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((totalElements || 0) / size)),
    [totalElements, size],
  );

  const fetchVouchers = async (p = page, s = size) => {
    try {
      setLoading(true);
      const res = await managerPromotionService.getVouchers(p, s);
      if (Array.isArray(res)) {
        setVouchers(res);
        setTotalElements(res.length);
      } else {
        setVouchers(res.content || []);
        setTotalElements(
          res.totalElements ?? res.total ?? res.content?.length ?? 0,
        );
      }
    } catch {
      toast.error("Lỗi khi tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  };

  const fetchVoucherDetail = async (id) => {
    try {
      setLoadingDetail(true);
      const data = await managerPromotionService.getVoucherById(id);
      setFormData({
        code: data.code || "",
        type: data.type || "PHAN_TRAM",
        value: data.value?.toString() || "",
        description: data.description || "",
        startDate: toDatetimeLocal(data.startDate),
        endDate: toDatetimeLocal(data.endDate),
        minOrderValue: data.minOrderValue?.toString() || "",
        assignType: data.assignType || "THU_CONG",
        thresholdAmount: data.thresholdAmount?.toString() || "",
        routeIds: data.routeIds || [],
      });
    } catch {
      toast.error("Không thể tải thông tin voucher");
      setShowForm(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const data = await managerRoutesService.getRoutes();
      const formatted = (data || []).map((r) => ({
        routeId: r.routeId,
        routeName: r.name || `Tuyến ${r.routeId}`,
        shipTime: r.shipTime,
        exchangeRate: r.exchangeRate,
      }));
      setRoutes(formatted);
    } catch {
      toast.error("Lỗi khi tải danh sách tuyến đường");
    } finally {
      setLoadingRoutes(false);
    }
  };

  useEffect(() => {
    fetchVouchers(page, size);
    fetchRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  const resetForm = () => {
    setFormData({
      code: "",
      type: "PHAN_TRAM",
      value: "",
      description: "",
      startDate: "",
      endDate: "",
      minOrderValue: "",
      assignType: "THU_CONG",
      thresholdAmount: "",
      routeIds: [],
    });
    setEditingId(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = async (voucher) => {
    const vid = voucher.id ?? voucher.voucherId;
    if (!vid) return toast.error("Không tìm thấy ID voucher");
    setEditingId(vid);
    setShowForm(true);
    await fetchVoucherDetail(vid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code?.trim()) return toast.error("Vui lòng nhập mã voucher");
    if (formData.value === "" || isNaN(Number(formData.value)))
      return toast.error("Vui lòng nhập giá trị hợp lệ");

    const payload = {
      ...formData,
      value: Number(formData.value),
      minOrderValue:
        formData.minOrderValue === "" ? 0 : Number(formData.minOrderValue),
      thresholdAmount:
        formData.thresholdAmount === "" ? 0 : Number(formData.thresholdAmount),
      startDate: toIso(formData.startDate),
      endDate: toIso(formData.endDate),
      routeIds: formData.routeIds?.length ? formData.routeIds : [],
    };

    const isEdit = editingId !== null;
    const loadingToast = toast.loading(
      isEdit ? "Đang cập nhật voucher..." : "Đang tạo voucher...",
    );
    try {
      setSaving(true);
      if (isEdit) {
        await managerPromotionService.updateVoucher(editingId, payload);
        toast.success("Cập nhật voucher thành công!", { id: loadingToast });
      } else {
        await managerPromotionService.createVoucher(payload);
        toast.success("Tạo voucher thành công!", { id: loadingToast });
      }
      resetForm();
      setShowForm(false);
      fetchVouchers(page, size);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        `Không thể ${isEdit ? "cập nhật" : "tạo"} voucher`;
      toast.error(msg, { id: loadingToast, duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (id) => {
    if (id === undefined || id === null)
      return toast.error("Không tìm thấy ID voucher để xóa");
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (deleteId === undefined || deleteId === null) return;
    setDeleting(true);
    try {
      setVouchers((prev) =>
        prev.filter((item) => (item.id ?? item.voucherId) !== deleteId),
      );
      await managerPromotionService.deleteVoucher(deleteId);
      toast.success("Xóa voucher thành công!");
      const remaining = vouchers.length - 1;
      if (remaining <= 0 && page > 0) setPage((p) => p - 1);
      else fetchVouchers(page, size);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Không thể xóa voucher";
      toast.error(msg, { duration: 5000 });
      fetchVouchers(page, size);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const formatDate = (str) => {
    if (!str) return "N/A";
    try {
      return new Date(str).toLocaleDateString("vi-VN");
    } catch {
      return str;
    }
  };

  const handleRouteToggle = (routeId) => {
    setFormData((prev) => {
      const cur = prev.routeIds || [];
      const updated = cur.includes(routeId)
        ? cur.filter((id) => id !== routeId)
        : [...cur, routeId];
      return { ...prev, routeIds: updated };
    });
  };

  // Loading Skeleton
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 w-24 bg-slate-200 rounded" />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="inline-block h-5 w-16 bg-slate-200 rounded-full" />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="h-4 w-16 bg-slate-200 rounded mx-auto" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 bg-slate-200 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 bg-slate-200 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-24 bg-slate-200 rounded" />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="h-7 w-32 bg-slate-200 rounded mx-auto" />
      </td>
    </tr>
  );

  const renderTableContent = () => {
    if (loading) {
      const rows = Math.min(size || 10, 10);
      return Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ));
    }
    if (vouchers.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="py-16">
            <div className="flex flex-col items-center gap-3">
              <FiGift className="w-16 h-16 text-slate-300" />
              <h3 className="text-slate-500 font-medium text-lg">
                Chưa có voucher nào
              </h3>
              <p className="text-sm text-slate-400">
                Nhấn nút "Tạo voucher mới" để bắt đầu
              </p>
            </div>
          </td>
        </tr>
      );
    }
    return vouchers.map((v) => {
      const vid = v.id ?? v.voucherId;
      return (
        <tr key={vid} className="hover:bg-blue-50/50 transition-colors">
          <td className="px-4 py-3 font-semibold text-blue-700">{v.code}</td>

          <td className="px-4 py-3 text-center">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                v.type === "PHAN_TRAM"
                  ? "bg-purple-100 text-purple-700 border-purple-200"
                  : "bg-emerald-100 text-emerald-700 border-emerald-200"
              }`}
            >
              {v.type === "PHAN_TRAM" ? (
                <FiPercent className="w-3 h-3" />
              ) : (
                <FiDollarSign className="w-3 h-3" />
              )}
              {v.type === "PHAN_TRAM" ? "%" : "VNĐ"}
            </span>
          </td>

          <td className="px-4 py-3 text-center font-semibold text-slate-800">
            {v.type === "PHAN_TRAM"
              ? `${v.value}%`
              : `${Number(v.value).toLocaleString("vi-VN")} ₫`}
          </td>

          <td className="px-4 py-3 text-slate-600 font-medium">
            {formatDate(v.startDate)}
          </td>

          <td className="px-4 py-3 text-slate-600 font-medium">
            {formatDate(v.endDate)}
          </td>

          <td className="px-4 py-3">
            {v.routeIds && v.routeIds.length > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                <FiMapPin className="w-3 h-3" />
                {v.routeIds.length} tuyến
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Tất cả</span>
            )}
          </td>

          <td className="px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => openEditForm(v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-all shadow-sm hover:shadow-md"
                title="Sửa voucher"
              >
                <FiEdit className="w-3.5 h-3.5" />
                Sửa
              </button>
              <button
                onClick={() => openDelete(vid)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 transition-all shadow-sm hover:shadow-md"
                title="Xóa voucher"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                Xóa
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <Toaster
        position="top-center"
        toastOptions={{ duration: 3000, style: { fontSize: "13px" } }}
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
                    <FiGift className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                      Quản Lý Chương Trình Khuyến Mãi
                    </h1>
                  </div>
                </div>

                {/* Right side - Actions */}
                <button
                  onClick={openCreateForm}
                  className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-white/20"
                >
                  <FiPlus className="w-4 h-4" />
                  <span className="text-sm">Tạo voucher mới</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Table Card */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Stats bar */}
          <div className="px-4 md:px-6 py-4 bg-slate-50 border-b border-slate-200">
            {loading ? (
              <div className="h-4 w-56 bg-slate-200 rounded animate-pulse" />
            ) : (
              <div className="text-sm md:text-base font-medium text-slate-700">
                Hiển thị{" "}
                <span className="text-lg font-bold text-blue-600">
                  {vouchers.length}
                </span>{" "}
                voucher
                {totalElements > vouchers.length && (
                  <span className="text-slate-500">
                    {" "}
                    / {totalElements} tổng
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <Th>Mã voucher</Th>
                  <Th className="text-center">Loại</Th>
                  <Th className="text-center">Giá trị</Th>
                  <Th>Bắt đầu</Th>
                  <Th>Kết thúc</Th>
                  <Th>Tuyến đường</Th>
                  <Th className="text-center">Thao tác</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {renderTableContent()}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {vouchers.length > 0 && (
            <div className="bg-slate-50 px-4 md:px-6 py-3 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="text-sm text-slate-600">
                Trang{" "}
                <span className="font-semibold text-slate-900">{page + 1}</span>{" "}
                /{" "}
                <span className="font-semibold text-slate-900">
                  {totalPages}
                </span>{" "}
                • Tổng{" "}
                <span className="font-semibold text-blue-600">
                  {totalElements}
                </span>{" "}
                voucher
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors shadow-sm"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  Trước
                </button>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() =>
                    setPage((p) => (p + 1 < totalPages ? p + 1 : p))
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors shadow-sm"
                >
                  Sau
                  <FiChevronRight className="w-4 h-4" />
                </button>

                <select
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(0);
                  }}
                  className="ml-2 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                  title="Số voucher / trang"
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n} / trang
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form - Giữ nguyên phần còn lại */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => {
            resetForm();
            setShowForm(false);
          }}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FiGift className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-base md:text-lg font-bold text-slate-900">
                  {editingId ? "Cập nhật voucher" : "Tạo voucher mới"}
                </h2>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                aria-label="Đóng"
                title="Đóng"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[70vh] overflow-y-auto">
              {loadingDetail ? (
                <div className="py-16 text-center">
                  <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-500 mt-4">
                    Đang tải thông tin voucher...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Code + Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Mã voucher <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({ ...formData, code: e.target.value })
                        }
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="VD: SUMMER2024"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Loại giảm giá <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {VOUCHER_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Value + Min Order */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {formData.type === "PHAN_TRAM" ? (
                          <FiPercent className="inline w-4 h-4 mr-1" />
                        ) : (
                          <FiDollarSign className="inline w-4 h-4 mr-1" />
                        )}
                        Giá trị <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.value}
                        onChange={(e) =>
                          setFormData({ ...formData, value: e.target.value })
                        }
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={
                          formData.type === "PHAN_TRAM" ? "VD: 10" : "VD: 50000"
                        }
                        min="0"
                        step={formData.type === "PHAN_TRAM" ? "0.01" : "1"}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Giá trị đơn tối thiểu
                      </label>
                      <input
                        type="number"
                        value={formData.minOrderValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minOrderValue: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="VD: 100000"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Mô tả chi tiết về voucher..."
                      rows={3}
                    />
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Ngày bắt đầu
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Ngày kết thúc
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            endDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Assign Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Kiểu phân phối
                      </label>
                      <select
                        value={formData.assignType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            assignType: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {ASSIGN_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {formData.assignType === "DAT_CHI_TIEU" && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Ngưỡng chỉ tiêu (₫)
                        </label>
                        <input
                          type="number"
                          value={formData.thresholdAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              thresholdAmount: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="VD: 1000000"
                          min="0"
                        />
                      </div>
                    )}
                  </div>

                  {/* Route Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Áp dụng cho tuyến đường
                      <span className="ml-2 text-xs font-normal text-slate-500">
                        ({formData.routeIds?.length || 0} đã chọn)
                      </span>
                    </label>

                    {loadingRoutes ? (
                      <div className="p-6 bg-slate-50 rounded-lg text-center border border-slate-200">
                        <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-slate-500 mt-3">
                          Đang tải danh sách tuyến đường...
                        </p>
                      </div>
                    ) : routes.length === 0 ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-700">
                          Không có tuyến đường nào. Vui lòng kiểm tra hoặc thêm
                          tuyến mới.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-3 border border-slate-200 rounded-lg bg-slate-50">
                        {routes.map((route) => {
                          const isSelected = formData.routeIds?.includes(
                            route.routeId,
                          );
                          return (
                            <label
                              key={route.routeId}
                              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 shadow-sm"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  handleRouteToggle(route.routeId)
                                }
                                className="sr-only"
                              />
                              <div
                                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                <FiCheck
                                  className={`w-3.5 h-3.5 ${
                                    isSelected
                                      ? "text-white"
                                      : "text-transparent"
                                  }`}
                                />
                              </div>
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FiMapPin
                                  className={`flex-shrink-0 w-4 h-4 ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-slate-400"
                                  }`}
                                />
                                <span
                                  className={`text-sm font-medium truncate ${
                                    isSelected
                                      ? "text-blue-900"
                                      : "text-slate-700"
                                  }`}
                                  title={route.routeName}
                                >
                                  {route.routeName}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            {!loadingDetail && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg font-medium transition-all shadow-md hover:shadow-lg ${
                    saving
                      ? "bg-slate-400 text-white cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  <FiCheck className="w-4 h-4" />
                  {saving
                    ? editingId
                      ? "Đang cập nhật..."
                      : "Đang lưu..."
                    : editingId
                      ? "Cập nhật"
                      : "Lưu"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeleteId(null);
        }}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa voucher này không?"
        confirmText="Xóa"
        cancelText="Hủy"
        loading={deleting}
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

export default ManagerPromotion;
