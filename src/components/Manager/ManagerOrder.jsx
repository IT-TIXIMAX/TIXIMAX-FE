// src/Pages/Manager/Order/ManagerOrder.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText,
  Eye,
  Package,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  ShoppingCart,
  TruckIcon,
} from "lucide-react";
import managerOrderService from "../../Services/Manager/managerOrderService";
import DetailOrderSale from "./DetailForSale/DetailOrderSale";

const PAGE_SIZES = [50, 100, 200];

/** ✅ Status handle ở ManagerOrder */
const AVAILABLE_STATUSES = [
  { key: "DA_XAC_NHAN", label: "Đã xác nhận", color: "green" },
  { key: "CHO_THANH_TOAN", label: "Chờ thanh toán tiền hàng", color: "orange" },
  {
    key: "CHO_THANH_TOAN_DAU_GIA",
    label: "Chờ thanh toán đấu giá",
    color: "pink",
  },
  { key: "CHO_MUA", label: "Chờ mua", color: "blue" },
  { key: "CHO_NHAP_KHO_NN", label: "Đang về kho NN", color: "cyan" },
  { key: "CHO_DONG_GOI", label: "Đã về kho NN", color: "purple" },
  { key: "DANG_XU_LY", label: "Đang về kho VN", color: "indigo" },
  { key: "DA_DU_HANG", label: "Đã về kho VN", color: "lime" },
  { key: "CHO_THANH_TOAN_SHIP", label: "Chờ thanh toán ship", color: "teal" },
  { key: "CHO_GIAO", label: "Đang giao hàng", color: "amber" },
  { key: "DA_GIAO", label: "Hoàn thành đơn hàng", color: "amber" },
  { key: "DA_HUY", label: "Đã hủy", color: "red" },
];

/* ===================== Skeletons ===================== */
const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-12 w-12 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

const TableSkeleton = ({ rows = 10 }) => (
  <div className="p-4 animate-pulse">
    <div className="h-12 bg-gray-100 rounded-lg mb-4" />
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-36 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 flex-1 bg-gray-200 rounded hidden md:block" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ManagerOrder = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ status do UI quản lý
  const [activeStatus, setActiveStatus] = useState("DA_XAC_NHAN");
  const [pageSize, setPageSize] = useState(50);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: false,
  });

  // ✅ Search: input đang gõ + term đã apply
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Detail modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const statusMap = useMemo(() => {
    const m = new Map();
    AVAILABLE_STATUSES.forEach((s) => m.set(s.key, s));
    return m;
  }, []);

  const currentStatus = useMemo(
    () => statusMap.get(activeStatus),
    [statusMap, activeStatus],
  );

  const getStatusColor = useCallback((color) => {
    const colorMap = {
      gray: "bg-gray-100 text-gray-800",
      green: "bg-green-100 text-green-800",
      orange: "bg-orange-100 text-orange-800",
      blue: "bg-blue-100 text-blue-800",
      indigo: "bg-indigo-100 text-indigo-800",
      slate: "bg-slate-100 text-slate-800",
      purple: "bg-purple-100 text-purple-800",
      yellow: "bg-yellow-100 text-yellow-800",
      cyan: "bg-cyan-100 text-cyan-800",
      pink: "bg-pink-100 text-pink-800",
      teal: "bg-teal-100 text-teal-800",
      emerald: "bg-emerald-100 text-emerald-800",
      red: "bg-red-100 text-red-800",
      lime: "bg-lime-100 text-lime-800",
      amber: "bg-amber-100 text-amber-800",
    };
    return colorMap[color] || "bg-gray-100 text-gray-800";
  }, []);

  const getOrderTypeText = useCallback((type) => {
    const orderTypes = {
      MUA_HO: "Mua hộ",
      VAN_CHUYEN: "Vận chuyển",
      DAU_GIA: "Đấu giá",
      KY_GUI: "Ký gửi",
      CHUYEN_TIEN: "Chuyển tiền",
    };
    return orderTypes[type] || type;
  }, []);

  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("vi-VN", { hour12: false });
  }, []);

  const formatPrice = useCallback((price) => {
    if (price === null || price === undefined || price === "") return "-";
    const number = Number(price);
    if (Number.isNaN(number)) return "-";
    return number.toLocaleString("vi-VN");
  }, []);

  // Fetch orders data
  const fetchOrders = useCallback(
    async (page = 1, status = activeStatus, size = pageSize) => {
      setError(null);
      setLoading(true);

      try {
        const response = await managerOrderService.getOrdersPaging(
          page - 1,
          size,
          status,
        );

        setOrders(response.content || []);
        setPagination({
          currentPage: page,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          first: !!response.first,
          last: !!response.last,
        });
      } catch (err) {
        setOrders([]);
        setPagination((p) => ({
          ...p,
          currentPage: page,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
        }));
        setError(err?.message || "Không thể tải danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    },
    [activeStatus, pageSize],
  );

  // ✅ tự fetch theo state (tránh double-fetch)
  useEffect(() => {
    fetchOrders(pagination.currentPage, activeStatus, pageSize);
  }, [fetchOrders, pagination.currentPage, activeStatus, pageSize]);

  // ✅ Apply search
  const handleApplySearch = useCallback(() => {
    setAppliedSearch(searchInput.trim());
  }, [searchInput]);

  const handleSearchKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleApplySearch();
    },
    [handleApplySearch],
  );

  // ✅ Auto clear applied khi input trống
  useEffect(() => {
    if (!searchInput.trim() && appliedSearch) setAppliedSearch("");
  }, [searchInput, appliedSearch]);

  // ✅ Filter orders based on appliedSearch (data mới + fallback data cũ)
  const filteredOrders = useMemo(() => {
    if (!appliedSearch) return orders;

    const search = appliedSearch.toLowerCase().trim();

    return orders.filter((order) => {
      const orderCode = order.orderCode || "";
      const customerCode =
        order.customerCode || order.customer?.customerCode || "";
      const customerName = order.customerName || order.customer?.name || "";
      const staffName = order.staffName || "";
      const orderId = order.orderId?.toString?.() || "";
      const orderType = order.orderType || "";
      const status = order.status || "";

      return (
        orderCode.toLowerCase().includes(search) ||
        customerCode.toLowerCase().includes(search) ||
        customerName.toLowerCase().includes(search) ||
        staffName.toLowerCase().includes(search) ||
        orderId.includes(search) ||
        orderType.toLowerCase().includes(search) ||
        status.toLowerCase().includes(search)
      );
    });
  }, [orders, appliedSearch]);

  // Fetch order detail
  const fetchOrderDetail = useCallback(async (orderId) => {
    setDetailError(null);

    try {
      const orderDetail = await managerOrderService.getOrderDetail(orderId);
      setSelectedOrder(orderDetail);
      setShowDetailModal(true);
    } catch (err) {
      setDetailError(err?.message || "Failed to fetch order detail");
      alert("Không thể tải chi tiết đơn hàng: " + (err?.message || ""));
    }
  }, []);

  const handleViewDetail = useCallback(
    (orderId) => {
      fetchOrderDetail(orderId);
    },
    [fetchOrderDetail],
  );

  const handleCloseDetail = useCallback(() => {
    setShowDetailModal(false);
    setSelectedOrder(null);
    setDetailError(null);
  }, []);

  // Status change handler
  const handleStatusChange = useCallback(
    (status) => {
      if (status === activeStatus) return;

      setActiveStatus(status);

      // reset search khi đổi tab
      setSearchInput("");
      setAppliedSearch("");

      // reset page về 1 (useEffect sẽ fetch)
      setPagination((p) => ({ ...p, currentPage: 1 }));
    },
    [activeStatus],
  );

  // Page size change handler
  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPagination((p) => ({ ...p, currentPage: 1 }));
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback(
    (newPage) => {
      if (loading) return;
      if (newPage < 1 || newPage > pagination.totalPages) return;

      setPagination((p) => ({ ...p, currentPage: newPage }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [pagination.totalPages, loading],
  );

  const showingFrom = pagination.totalElements
    ? (pagination.currentPage - 1) * pageSize + 1
    : 0;
  const showingTo = Math.min(
    pagination.currentPage * pageSize,
    pagination.totalElements,
  );

  // Statistics (trên page hiện tại)
  const orderTypeStats = useMemo(() => {
    const stats = {
      MUA_HO: 0,
      VAN_CHUYEN: 0,
      DAU_GIA: 0,
      KY_GUI: 0,
      CHUYEN_TIEN: 0,
    };
    orders.forEach((order) => {
      if (Object.prototype.hasOwnProperty.call(stats, order.orderType)) {
        stats[order.orderType]++;
      }
    });
    return stats;
  }, [orders]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Package size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Quản Lý Đơn Hàng
              </h1>
            </div>

            <button
              onClick={() =>
                fetchOrders(pagination.currentPage, activeStatus, pageSize)
              }
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              type="button"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Tải lại
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng Đơn Hàng
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {pagination.totalElements}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Mua Hộ
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {orderTypeStats.MUA_HO}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <ShoppingCart className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Vận Chuyển
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {orderTypeStats.VAN_CHUYEN}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TruckIcon className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Trạng Thái
                    </p>
                    <p className="text-xl font-bold text-orange-600 truncate">
                      {currentStatus?.label || activeStatus}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <CheckCircle className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_STATUSES.map((status) => {
                const isActive = activeStatus === status.key;
                return (
                  <button
                    key={status.key}
                    onClick={() => handleStatusChange(status.key)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    type="button"
                  >
                    {status.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-3 items-stretch">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã đơn, mã KH, tên KH, nhân viên..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleApplySearch}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                type="button"
              >
                <Search size={18} />
                Tìm kiếm
              </button>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Hiển thị:
              </span>
              <div className="flex gap-2">
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handlePageSizeChange(size)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      pageSize === size
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    type="button"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Có lỗi xảy ra
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() =>
                      fetchOrders(
                        pagination.currentPage,
                        activeStatus,
                        pageSize,
                      )
                    }
                    disabled={loading}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    {loading ? "Đang tải..." : "Thử lại"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <TableSkeleton rows={10} />
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">
                {appliedSearch
                  ? "Không tìm thấy kết quả"
                  : "Không có đơn hàng nào"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {appliedSearch ? (
                  <>
                    Không tìm thấy đơn hàng với từ khóa "
                    <span className="font-semibold">{appliedSearch}</span>"
                  </>
                ) : (
                  <>
                    Chưa có đơn hàng với trạng thái "
                    <span className="font-semibold">
                      {currentStatus?.label || activeStatus}
                    </span>
                    "
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã Đơn
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Loại
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Trạng Thái
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã KH
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Tên Khách
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Nhân Viên
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Tỷ Giá
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Tổng Tiền
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Ngày Tạo
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Thao Tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order, index) => {
                    const orderStatus = statusMap.get(order.status);

                    return (
                      <tr
                        key={order.orderId}
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-4">
                          <span className="font-semibold text-blue-700">
                            {order.orderCode || `#${order.orderCode}`}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900">
                            {getOrderTypeText(order.orderType)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                              orderStatus
                                ? getStatusColor(orderStatus.color)
                                : getStatusColor("gray")
                            }`}
                          >
                            {orderStatus ? orderStatus.label : order.status}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-blue-600">
                            {order.customerCode ||
                              order.customer?.customerCode ||
                              "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900">
                            {order.customerName || order.customer?.name || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900">
                            {order.staffName || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900">
                            {order.exchangeRate !== null &&
                            order.exchangeRate !== undefined
                              ? Number(order.exchangeRate).toLocaleString(
                                  "vi-VN",
                                )
                              : "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900 font-semibold">
                            {formatPrice(order.finalPriceOrder)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900">
                            {formatDateTime(order.createdAt)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleViewDetail(order.orderId)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 mx-auto text-sm"
                            type="button"
                          >
                            <Eye size={16} />
                            Xem
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && !loading && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Hiển thị{" "}
                  <span className="font-semibold text-gray-900">
                    {showingFrom}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-gray-900">
                    {showingTo}
                  </span>{" "}
                  trong tổng số{" "}
                  <span className="font-semibold text-gray-900">
                    {pagination.totalElements}
                  </span>{" "}
                  đơn hàng
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Đầu
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                    {pagination.currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Sau
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Cuối
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Order Modal */}
      {showDetailModal && selectedOrder && (
        <DetailOrderSale
          orderData={selectedOrder}
          onClose={handleCloseDetail}
          availableStatuses={AVAILABLE_STATUSES}
          detailError={detailError}
        />
      )}
    </div>
  );
};

export default ManagerOrder;
