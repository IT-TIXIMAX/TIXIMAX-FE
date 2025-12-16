import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
  Search,
  X,
} from "lucide-react";
import managerOrderService from "../../Services/Manager/managerOrderService";
import DetailOrderSale from "../Manager/DetailForSale/DetailOrderSale";

const OrderList = () => {
  // Pagination & Data states
  const [orders, setOrders] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search input states
  const [searchOrderCode, setSearchOrderCode] = useState("");
  const [searchCustomerCode, setSearchCustomerCode] = useState("");
  const [searchShipmentCode, setSearchShipmentCode] = useState("");

  // Applied search states
  const [appliedOrderCode, setAppliedOrderCode] = useState("");
  const [appliedCustomerCode, setAppliedCustomerCode] = useState("");
  const [appliedShipmentCode, setAppliedShipmentCode] = useState("");

  // Detail modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Constants
  const availableStatuses = useMemo(
    () => managerOrderService.getAvailableStatuses(),
    []
  );

  // Override status labels - TÙY CHỈNH Ở ĐÂY
  const statusLabelOverrides = useMemo(
    () => ({
      // Các trạng thái cơ bản
      CHO_XAC_NHAN: "Chờ xác nhận",
      DA_XAC_NHAN: "Đã xác nhận",
      DANG_XU_LY: "Đang xử lý",

      // Trạng thái mua hàng
      DANG_MUA_HANG: "Đang mua hàng",
      DA_MUA_HANG: "Đã mua hàng",
      MUA_HANG_THAT_BAI: "Mua hàng thất bại",

      // Trạng thái đấu giá
      CHO_DAU_GIA: "Chờ đấu giá",
      DANG_DAU_GIA: "Đang đấu giá",
      DAU_GIA_THANH_CONG: "Thắng đấu giá",
      DAU_GIA_THAT_BAI: "Thua đấu giá",

      // Trạng thái vận chuyển
      CHO_VAN_CHUYEN: "Chờ vận chuyển",
      DANG_VAN_CHUYEN: "Đang vận chuyển",
      DA_VE_KHO_NUOC_NGOAI: "Đã về kho nước ngoài",
      DANG_VAN_CHUYEN_QUOC_TE: "Đang vận chuyển quốc tế",
      DA_VE_KHO_VN: "Đã về kho VN",
      DA_VE_KHO: "Đã về kho",

      // Trạng thái giao hàng
      CHO_GIAO_HANG: "Chờ giao hàng",
      DANG_GIAO_HANG: "Đang giao hàng",
      GIAO_HANG_THAT_BAI: "Giao hàng thất bại",
      DA_GIAO_HANG: "Đã giao hàng",

      // Trạng thái thanh toán
      CHO_THANH_TOAN: "Chờ thanh toán",
      DA_THANH_TOAN: "Đã thanh toán",
      THANH_TOAN_MOT_PHAN: "Thanh toán một phần",

      // Trạng thái hoàn thành/hủy
      HOAN_THANH: "Hoàn thành",
      HUY: "Đã hủy",
      TRA_HANG: "Trả hàng",
      HOAN_TIEN: "Hoàn tiền",

      // Trạng thái ký gửi
      CHO_KY_GUI: "Chờ ký gửi",
      DANG_KY_GUI: "Đang ký gửi",
      DA_BAN: "Đã bán",
      CHUA_BAN: "Chưa bán",
    }),
    []
  );

  const pageSizeOptions = useMemo(() => [20, 50, 100, 200], []);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = {};
      if (appliedOrderCode.trim())
        searchParams.orderCode = appliedOrderCode.trim();
      if (appliedCustomerCode.trim())
        searchParams.customerCode = appliedCustomerCode.trim();
      if (appliedShipmentCode.trim())
        searchParams.shipmentCode = appliedShipmentCode.trim();

      const result = await managerOrderService.getOrdersPaginated(
        currentPage,
        pageSize,
        searchParams
      );

      setOrders(result.content || []);
      setTotalPages(result.totalPages || 1);
      setTotalElements(result.totalElements || 0);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đơn hàng");
      setOrders([]);
      setTotalPages(1);
      setTotalElements(0);
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

  // Handle Search Button Click
  const handleSearch = useCallback(() => {
    setAppliedOrderCode(searchOrderCode);
    setAppliedCustomerCode(searchCustomerCode);
    setAppliedShipmentCode(searchShipmentCode);
    setCurrentPage(0);
  }, [searchOrderCode, searchCustomerCode, searchShipmentCode]);

  // Handle Clear Button Click
  const handleClearSearch = useCallback(() => {
    setSearchOrderCode("");
    setSearchCustomerCode("");
    setSearchShipmentCode("");
    setAppliedOrderCode("");
    setAppliedCustomerCode("");
    setAppliedShipmentCode("");
    setCurrentPage(0);
  }, []);

  // Check if any search is active
  const hasActiveSearch = useMemo(() => {
    return appliedOrderCode || appliedCustomerCode || appliedShipmentCode;
  }, [appliedOrderCode, appliedCustomerCode, appliedShipmentCode]);

  // Handle Enter key press
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  // Pagination handlers
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 0 && newPage < totalPages && !loading) {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages, loading]
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
      alert("Không thể tải chi tiết đơn hàng: " + err.message);
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
    [fetchOrderDetail]
  );

  const handleCloseDetail = useCallback(() => {
    setShowDetailModal(false);
    setSelectedOrder(null);
    setLoadingDetail(false);
  }, []);

  // Utility functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  }, []);

  const formatPrice = useCallback((price) => {
    if (price === null || price === undefined || price === "") return "-";
    const number = Number(price);
    if (isNaN(number)) return "-";
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
    };
    return colorMap[color] || "bg-gray-100 text-gray-800";
  }, []);

  const getOrderTypeText = useCallback((type) => {
    const orderTypes = {
      MUA_HO: "Mua hộ",
      VAN_CHUYEN: "Vận chuyển",
      DAU_GIA: "Đấu giá",
      KY_GUI: "Ký gửi",
    };
    return orderTypes[type] || type;
  }, []);

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Danh sách đơn hàng</h1>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Tìm kiếm</h2>
          </div>
          {hasActiveSearch && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              Đang lọc
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Order Code */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Mã đơn hàng..."
              value={searchOrderCode}
              onChange={(e) => setSearchOrderCode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Search Customer Code */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Mã khách hàng..."
              value={searchCustomerCode}
              onChange={(e) => setSearchCustomerCode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Search Shipment Code */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Mã vận đơn..."
              value={searchShipmentCode}
              onChange={(e) => setSearchShipmentCode(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" />
            Tìm kiếm
          </button>

          <button
            onClick={handleClearSearch}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
            Xóa
          </button>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị{" "}
            <span className="font-semibold text-blue-600">
              {loading ? "..." : orders.length}
            </span>{" "}
            / <span className="font-semibold">{totalElements}</span> đơn hàng
            {hasActiveSearch && (
              <span className="ml-2 text-gray-500">(đã lọc)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} đơn/trang
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
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
                  onClick={fetchOrders}
                  disabled={loading}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang tải..." : "Thử lại"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tỷ giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading
                ? // Loading skeleton
                  [...Array(8)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-28 bg-gray-200 rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 w-24 bg-gray-200 rounded-full" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-28 bg-gray-200 rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-9 w-20 bg-gray-200 rounded-lg" />
                      </td>
                    </tr>
                  ))
                : orders.length > 0
                ? // Data rows
                  orders.map((order) => {
                    const orderStatus = availableStatuses.find(
                      (s) => s.key === order.status
                    );
                    return (
                      <tr
                        key={order.orderId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderCode}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getOrderTypeText(order.orderType)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              orderStatus
                                ? getStatusColor(orderStatus.color)
                                : getStatusColor("gray")
                            }`}
                          >
                            {/* Check override trước, ưu tiên cao nhất */}
                            {statusLabelOverrides[order.status]
                              ? statusLabelOverrides[order.status]
                              : orderStatus
                              ? orderStatus.label
                              : order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">
                            {order.customer?.customerCode || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.customer?.name || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.exchangeRate
                            ? `${order.exchangeRate.toLocaleString("vi-VN")} `
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatPrice(order.finalPriceOrder)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              handleViewDetail(order.orderId, order)
                            }
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Xem</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {!loading && orders.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 mt-6">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy đơn hàng
          </p>
          <p className="text-sm text-gray-500">
            {totalElements === 0
              ? "Chưa có đơn hàng nào trong hệ thống"
              : "Thử thay đổi từ khóa tìm kiếm"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalElements > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentPage === 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Trang trước</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Trang</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold">
              {currentPage + 1}
            </span>
            <span className="text-sm text-gray-500">/ {totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentPage >= totalPages - 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span>Trang sau</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <DetailOrderSale
          orderData={selectedOrder}
          onClose={handleCloseDetail}
          availableStatuses={availableStatuses}
          isLoading={loadingDetail}
        />
      )}
    </div>
  );
};

export default OrderList;
