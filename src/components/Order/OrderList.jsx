// src/components/Order/OrderList.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText,
  Eye,
  Search,
  X,
  Package,
  TruckIcon,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import api from "../../config/api";
import managerOrderService from "../../Services/Manager/managerOrderService";
import DetailOrderSale from "../Manager/DetailForSale/DetailOrderSale";
import DetailOrderLink from "./DetailOrderLink";
import AccountSearch from "../Order/AccountSearch";

const PAGE_SIZES = [100, 200, 500, 1000, 2000];

/** ✅ Status handle ở UI (không phụ thuộc service) */
const AVAILABLE_STATUSES = [
  { key: "CHO_XAC_NHAN", label: "Chờ xác nhận", color: "yellow" },
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
  { key: "DA_GIAO", label: "Hoàn thành đơn hàng", color: "emerald" },

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

const OrderList = () => {
  // Pagination & Data states
  const [orders, setOrders] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);

  // UI states
  const [loading, setLoading] = useState(false);

  // Search input states
  const [searchOrderCode, setSearchOrderCode] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchShipmentCode, setSearchShipmentCode] = useState("");

  // Applied search states
  const [appliedOrderCode, setAppliedOrderCode] = useState("");
  const [appliedCustomerCode, setAppliedCustomerCode] = useState("");
  const [appliedShipmentCode, setAppliedShipmentCode] = useState("");

  // Detail modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrderId, setEditOrderId] = useState(null);

  const availableStatuses = useMemo(() => AVAILABLE_STATUSES, []);

  // Fetch orders from API (✅ service chỉ API, list gọi trực tiếp)
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (appliedOrderCode?.trim()) params.orderCode = appliedOrderCode.trim();
      if (appliedCustomerCode?.trim())
        params.customerCode = appliedCustomerCode.trim();
      if (appliedShipmentCode?.trim())
        params.shipmentCode = appliedShipmentCode.trim();

      // ✅ giữ theo format cũ bạn đang dùng trước đó
      const { data } = await api.get(`/orders/${currentPage}/${pageSize}`, {
        params,
      });

      setOrders(data?.content || []);
      setTotalPages(data?.totalPages || 1);
      setTotalElements(data?.totalElements || 0);
    } catch (err) {
      setOrders([]);
      setTotalPages(1);
      setTotalElements(0);
      // ❌ bạn bảo không cần error UI -> bỏ alert/toast
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    appliedOrderCode,
    appliedCustomerCode,
    appliedShipmentCode,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto clear and reload
  useEffect(() => {
    const allFieldsEmpty =
      !searchOrderCode.trim() &&
      !selectedCustomer &&
      !searchShipmentCode.trim();
    const hasAppliedFilters =
      appliedOrderCode || appliedCustomerCode || appliedShipmentCode;

    if (allFieldsEmpty && hasAppliedFilters) {
      setAppliedOrderCode("");
      setAppliedCustomerCode("");
      setAppliedShipmentCode("");
      setCurrentPage(0);
    }
  }, [
    searchOrderCode,
    selectedCustomer,
    searchShipmentCode,
    appliedOrderCode,
    appliedCustomerCode,
    appliedShipmentCode,
  ]);

  // Handle account selection
  const handleSelectAccount = useCallback((account) => {
    setSelectedCustomer(account);
  }, []);

  const handleClearAccount = useCallback(() => {
    setSelectedCustomer(null);
  }, []);

  // Handle Search
  const handleSearch = useCallback(() => {
    setAppliedOrderCode(searchOrderCode || "");
    setAppliedCustomerCode(selectedCustomer?.customerCode || "");
    setAppliedShipmentCode(searchShipmentCode || "");
    setCurrentPage(0);
  }, [searchOrderCode, selectedCustomer, searchShipmentCode]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch],
  );

  // Pagination handlers
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 0 && newPage < totalPages && !loading) {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages, loading],
  );

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(Number(newSize));
    setCurrentPage(0);
  }, []);

  // Detail order handlers
  const fetchOrderDetail = useCallback(async (orderId) => {
    setLoadingDetail(true);
    try {
      const orderDetail = await managerOrderService.getOrderDetail(orderId);
      setSelectedOrder(orderDetail);
    } catch (err) {
      console.error(err);
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleViewDetail = useCallback(
    (orderId, orderPreview) => {
      setShowDetailModal(true);
      setSelectedOrder(orderPreview);
      fetchOrderDetail(orderId);
    },
    [fetchOrderDetail],
  );

  const handleCloseDetail = useCallback(() => {
    setShowDetailModal(false);
    setSelectedOrder(null);
    setLoadingDetail(false);
  }, []);

  // Edit order handlers
  const handleEdit = useCallback((orderId) => {
    setEditOrderId(orderId);
    setShowEditModal(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setShowEditModal(false);
    setEditOrderId(null);
  }, []);

  // Utility functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  }, []);

  const formatPrice = useCallback((price) => {
    if (price === null || price === undefined || price === "") return "-";
    const number = Number(price);
    if (Number.isNaN(number)) return "-";
    return number.toLocaleString("vi-VN");
  }, []);

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

  /** ✅ Support cả data mới và data cũ */
  const getCustomerCode = (o) =>
    o?.customerCode || o?.customer?.customerCode || "—";
  const getCustomerName = (o) => o?.customerName || o?.customer?.name || "—";

  const showingFrom = totalElements ? currentPage * pageSize + 1 : 0;
  const showingTo = Math.min((currentPage + 1) * pageSize, totalElements);

  // Calculate statistics
  const orderTypeStats = useMemo(() => {
    const stats = {
      MUA_HO: 0,
      VAN_CHUYEN: 0,
      DAU_GIA: 0,
      KY_GUI: 0,
      CHUYEN_TIEN: 0,
    };
    orders.forEach((order) => {
      if (Object.prototype.hasOwnProperty.call(stats, order?.orderType)) {
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
                <ShoppingCart size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Danh Sách Đơn Hàng
              </h1>
            </div>

            <button
              onClick={fetchOrders}
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
                      {totalElements}
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
                      Đang Hiển Thị
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {orders.length}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FileText className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Inputs */}
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1">
                <AccountSearch
                  onSelectAccount={handleSelectAccount}
                  value={
                    selectedCustomer
                      ? `${selectedCustomer.customerCode} - ${selectedCustomer.name}`
                      : ""
                  }
                  onClear={handleClearAccount}
                />
              </div>

              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã đơn hàng..."
                    value={searchOrderCode}
                    onChange={(e) => setSearchOrderCode(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchOrderCode && (
                    <button
                      onClick={() => setSearchOrderCode("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã vận đơn..."
                    value={searchShipmentCode}
                    onChange={(e) => setSearchShipmentCode(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchShipmentCode && (
                    <button
                      onClick={() => setSearchShipmentCode("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  type="button"
                >
                  <Search size={18} />
                  Tìm kiếm
                </button>
              </div>
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

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <TableSkeleton rows={10} />
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">
                Không tìm thấy đơn hàng
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {totalElements === 0
                  ? "Chưa có đơn hàng nào trong hệ thống"
                  : "Thử thay đổi từ khóa tìm kiếm"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã Đơn Hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Loại Đơn
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Trạng Thái
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã KH
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Tên Khách Hàng
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
                  {orders.map((order, index) => {
                    const orderStatus = availableStatuses.find(
                      (s) => s.key === order.status,
                    );

                    return (
                      <tr
                        key={order.orderId || index}
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-4">
                          <span className="font-semibold text-blue-700 whitespace-nowrap">
                            {order.orderCode || `#${order.orderId}`}
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
                            {orderStatus?.label || order.status}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-blue-600">
                            {getCustomerCode(order)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900">
                            {getCustomerName(order)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900">
                            {order.exchangeRate != null
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
                            {formatDate(order.createdAt)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(order.orderId)}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all text-sm"
                              type="button"
                              title="Chỉnh sửa"
                            >
                              Chỉnh Sửa
                            </button>
                            <button
                              onClick={() =>
                                handleViewDetail(order.orderId, order)
                              }
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 text-sm"
                              type="button"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                              Xem
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
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
                    {totalElements}
                  </span>{" "}
                  đơn hàng
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Đầu
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Sau
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
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

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <DetailOrderSale
          orderData={selectedOrder}
          onClose={handleCloseDetail}
          availableStatuses={availableStatuses}
          isLoading={loadingDetail}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <DetailOrderLink
          orderId={editOrderId}
          isOpen={showEditModal}
          onClose={handleCloseEdit}
        />
      )}
    </div>
  );
};

export default OrderList;
