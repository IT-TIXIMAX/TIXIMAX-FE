// src/Components/LeadSale/OrderList.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Package,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RefreshCw,
  Eye,
  User,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import createOrderPaymentService from "../../Services/Payment/createOrderPaymentService";
import DetailPaymentOrder from "../PaymentOrder/DetailPaymentOrder";

const OrderSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    {/* Header Skeleton */}
    <div className="px-4 py-3 border-b bg-gray-50">
      <div className="flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-300 rounded-full" />
          <div>
            <div className="h-5 w-32 bg-gray-300 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="text-right">
          <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
          <div className="h-5 w-24 bg-gray-300 rounded" />
        </div>
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-pulse">
        {/* Customer Info Skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-36 bg-gray-300 rounded mb-2" />
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="h-6 w-20 bg-gray-300 rounded" />
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-3 w-3/4 bg-gray-200 rounded" />
            <div className="h-3 w-5/6 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Order Details Skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-300 rounded mb-2" />
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-3 w-3/4 bg-gray-200 rounded" />
            <div className="h-3 w-5/6 bg-gray-200 rounded" />
            <div className="h-3 w-4/5 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* Actions Skeleton */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2 animate-pulse">
        <div className="h-9 w-28 bg-gray-300 rounded-lg" />
        <div className="h-9 w-32 bg-gray-300 rounded-lg" />
      </div>
    </div>
  </div>
);

const ListOrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("DA_XAC_NHAN");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 50,
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: true,
  });

  // State dialog thanh toán
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPaymentCode, setSelectedPaymentCode] = useState(null);

  const tabs = [
    {
      key: "DA_XAC_NHAN",
      label: "Đã xác nhận",
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-500",
    },
    {
      key: "CHO_THANH_TOAN",
      label: "Chờ thanh toán",
      color: "orange",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      borderColor: "border-orange-500",
    },
    {
      key: "DAU_GIA_THANH_CONG",
      label: "Đấu giá thành công",
      color: "purple",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-500",
    },
    {
      key: "DA_DU_HANG",
      label: "Đã đủ đơn",
      color: "blue",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-500",
    },
    {
      key: "CHO_THANH_TOAN_SHIP",
      label: "Chờ thanh toán ship",
      color: "yellow",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-500",
    },
  ];

  const fetchOrders = useCallback(
    async (page = 0, size = 50) => {
      try {
        setLoading(true);
        setError(null);

        const response = await createOrderPaymentService.getOrdersByStatus(
          activeTab,
          page,
          size
        );

        if (response?.content) {
          setOrders(response.content);
          setPagination({
            pageNumber: response.number ?? page,
            pageSize: response.size ?? size,
            totalPages: response.totalPages ?? 0,
            totalElements: response.totalElements ?? 0,
            first: response.first ?? page === 0,
            last: response.last ?? true,
          });
        } else {
          setOrders([]);
          setPagination((prev) => ({
            ...prev,
            totalElements: 0,
            totalPages: 0,
          }));
        }
      } catch (error) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách đơn hàng";
        setError(errorMessage);
        toast.error(errorMessage);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (
        newPage >= 0 &&
        newPage < pagination.totalPages &&
        newPage !== pagination.pageNumber
      ) {
        fetchOrders(newPage, pagination.pageSize);
      }
    },
    [
      fetchOrders,
      pagination.pageNumber,
      pagination.pageSize,
      pagination.totalPages,
    ]
  );

  const handleTabChange = (tabKey) => {
    if (tabKey === activeTab || loading) return; // Prevent tab change while loading

    setActiveTab(tabKey);
    setOrders([]); // Clear old data immediately
    setError(null); // Clear old errors
    setSearchTerm(""); // Clear search
    setFilterDate(""); // Clear date filter
    setPagination((prev) => ({
      ...prev,
      pageNumber: 0,
      totalPages: 0,
      totalElements: 0,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const getOrderTypeColor = (type) => {
    const colors = {
      MUA_HO: "bg-blue-100 text-blue-800",
      DAU_GIA: "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getOrderTypeText = (type) => {
    const texts = {
      MUA_HO: "Mua hộ",
      DAU_GIA: "Đấu giá",
    };
    return texts[type] || type;
  };

  // Filter orders - Tìm kiếm trên nhiều trường
  const filteredOrders = orders.filter((order) => {
    // Filter by search term (tìm kiếm chung)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesOrderCode = order.orderCode
        ?.toLowerCase()
        .includes(lowerSearchTerm);
      const matchesCustomerCode = order.customer?.customerCode
        ?.toLowerCase()
        .includes(lowerSearchTerm);
      const matchesCustomerName = order.customer?.name
        ?.toLowerCase()
        .includes(lowerSearchTerm);
      const matchesPaymentCode = order.paymentCode
        ?.toLowerCase()
        .includes(lowerSearchTerm);

      // Nếu không match bất kỳ trường nào thì filter ra
      if (
        !matchesOrderCode &&
        !matchesCustomerCode &&
        !matchesCustomerName &&
        !matchesPaymentCode
      ) {
        return false;
      }
    }

    // Filter by Date
    if (
      filterDate &&
      new Date(order.createdAt).toISOString().slice(0, 10) !== filterDate
    ) {
      return false;
    }

    return true;
  });

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPagination((prev) => ({ ...prev, pageSize: newSize }));
    fetchOrders(0, newSize);
  };

  // Xóa tất cả filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterDate("");
  };

  const currentTab = tabs.find((tab) => tab.key === activeTab);

  // Mở dialog thanh toán
  const openPaymentDialog = (order) => {
    if (!order.paymentCode) {
      toast.error("Đơn hàng này chưa có mã thanh toán");
      return;
    }
    setSelectedPaymentCode(order.paymentCode);
    setIsPaymentDialogOpen(true);
  };

  // Đóng dialog
  const closePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedPaymentCode(null);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            Quản Lý Đơn Hàng Thanh Toán
          </h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                disabled={loading}
                className={`flex-1 min-w-[150px] px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? `${tab.bgColor} ${tab.textColor} ${tab.borderColor} border-2`
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Messages */}
        {error && !loading && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
              <div>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={() => fetchOrders()}
                  className="text-red-600 hover:text-red-800 text-xs underline mt-1"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls - Ẩn khi loading */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex flex-col gap-3">
              {/* Search Box - Tìm kiếm chung */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã đơn, mã KH, tên KH, mã thanh toán..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Date Filter, Page Size and Stats */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <select
                    value={pagination.pageSize}
                    onChange={handlePageSizeChange}
                    disabled={loading}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value={50}>50 / trang</option>
                    <option value={100}>100 / trang</option>
                  </select>

                  {/* Clear Filters Button */}
                  {(searchTerm || filterDate) && (
                    <button
                      onClick={handleClearFilters}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Xóa bộ lọc
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  Tổng:{" "}
                  <span className="font-semibold">
                    {pagination.totalElements}
                  </span>{" "}
                  đơn
                  {filteredOrders.length !== orders.length && (
                    <span className="ml-2 text-blue-600">
                      (Hiển thị: {filteredOrders.length})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State với Skeleton */}
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <OrderSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-2">
              Không có đơn hàng nào
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm || filterDate
                ? "Không tìm thấy kết quả phù hợp với bộ lọc."
                : `Chưa có đơn hàng ${currentTab?.label.toLowerCase()}.`}
            </p>
          </div>
        )}

        {/* Orders List */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-3">
            {filteredOrders.map((order, index) => (
              <div
                key={order.orderId}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className={`px-4 py-3 border-b ${currentTab?.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 ${currentTab?.bgColor} rounded-full flex items-center justify-center border ${currentTab?.borderColor}`}
                      >
                        <span
                          className={`text-xs font-semibold ${currentTab?.textColor}`}
                        >
                          {pagination.pageNumber * pagination.pageSize +
                            index +
                            1}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                          {order.orderCode}
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getOrderTypeColor(
                              order.orderType
                            )}`}
                          >
                            {getOrderTypeText(order.orderType)}
                          </span>
                        </h3>
                        <div className="text-xs text-gray-600 mt-1">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-500">
                        Tổng tiền
                      </div>
                      <div className="text-base font-bold text-gray-900">
                        {formatCurrency(order.finalPriceOrder)} ₫
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Customer Info */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-2">
                        <User className="w-4 h-4 text-blue-600" />
                        Thông tin khách hàng
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                            {order.customer?.customerCode || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {order.customer?.name || "Chưa có tên"}
                            </div>
                          </div>
                        </div>
                        {order.customer?.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-xs">
                              {order.customer.email}
                            </span>
                          </div>
                        )}
                        {order.customer?.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-medium">
                              {order.customer.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        Chi tiết đơn hàng
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tổng tiền:</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(order.finalPriceOrder)} ₫
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Tổng trọng lượng:
                          </span>
                          <span className="font-medium text-gray-900">
                            {order.totalWeight} kg
                          </span>
                        </div>
                        {order.paymentCode && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Mã thanh toán:
                            </span>
                            <span className="font-medium text-blue-600">
                              {order.paymentCode}
                            </span>
                          </div>
                        )}
                        {order.leftoverMoney && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tiền thừa:</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(order.leftoverMoney)} ₫
                            </span>
                          </div>
                        )}
                        {order.note && (
                          <div className="pt-2 border-t border-gray-200">
                            <span className="text-gray-600 block mb-1">
                              Ghi chú:
                            </span>
                            <span className="text-xs text-gray-800 italic">
                              {order.note}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </button>

                    {order.paymentCode && (
                      <button
                        onClick={() => openPaymentDialog(order)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Xem thanh toán
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredOrders.length > 0 && (
          <div className="flex items-center justify-between mt-4 bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
            <button
              onClick={() => handlePageChange(pagination.pageNumber - 1)}
              disabled={pagination.first || loading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pagination.first || loading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Trang trước
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Trang</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                {pagination.pageNumber + 1}
              </span>
              <span className="text-xs text-gray-500">
                / {pagination.totalPages || 1}
              </span>
            </div>

            <button
              onClick={() => handlePageChange(pagination.pageNumber + 1)}
              disabled={pagination.last || loading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pagination.last || loading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Trang sau
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Dialog thanh toán */}
      {isPaymentDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closePaymentDialog}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-5xl w-[95%] max-h-[90vh] overflow-y-auto p-4 sm:p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={closePaymentDialog}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6 text-red-500" />
              </button>
            </div>

            {selectedPaymentCode && (
              <DetailPaymentOrder codeFromProp={selectedPaymentCode} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOrderManager;
