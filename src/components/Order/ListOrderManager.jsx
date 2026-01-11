import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Package,
  RefreshCw,
  Eye,
  User,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  X,
  Calendar,
  TruckIcon,
  Clock,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import createOrderPaymentService from "../../Services/Payment/createOrderPaymentService";
import DetailPaymentOrder from "../PaymentOrder/DetailPaymentOrder";

const PAGE_SIZES = [50, 100, 200];

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

const OrderCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
    <div className="px-4 py-3 bg-gray-50 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-5 w-24 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="p-4 space-y-3">
      <div className="h-20 bg-gray-50 rounded-lg" />
      <div className="h-20 bg-gray-50 rounded-lg" />
      <div className="flex justify-end gap-2 pt-3 border-t">
        <div className="h-9 w-28 bg-gray-200 rounded-lg" />
        <div className="h-9 w-32 bg-gray-200 rounded-lg" />
      </div>
    </div>
  </div>
);

const ListOrderManager = () => {
  // State lưu data cho TẤT CẢ các trạng thái
  const [allOrdersData, setAllOrdersData] = useState({
    DA_XAC_NHAN: { content: [], totalElements: 0, loaded: false, pageSize: 50 },
    CHO_THANH_TOAN: {
      content: [],
      totalElements: 0,
      loaded: false,
      pageSize: 50,
    },
    DAU_GIA_THANH_CONG: {
      content: [],
      totalElements: 0,
      loaded: false,
      pageSize: 50,
    },
    DA_DU_HANG: { content: [], totalElements: 0, loaded: false, pageSize: 50 },
    CHO_THANH_TOAN_SHIP: {
      content: [],
      totalElements: 0,
      loaded: false,
      pageSize: 50,
    },
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("DA_XAC_NHAN");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [pageSize, setPageSize] = useState(100);

  // State dialog thanh toán
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPaymentCode, setSelectedPaymentCode] = useState(null);

  const tabs = useMemo(
    () => [
      { key: "DA_XAC_NHAN", label: "Đã xác nhận", color: "green" },
      { key: "CHO_THANH_TOAN", label: "Chờ thanh toán", color: "orange" },
      {
        key: "DAU_GIA_THANH_CONG",
        label: "Đấu giá thành công",
        color: "purple",
      },
      { key: "DA_DU_HANG", label: "Đã đủ đơn", color: "blue" },
      {
        key: "CHO_THANH_TOAN_SHIP",
        label: "Chờ thanh toán ship",
        color: "yellow",
      },
    ],
    []
  );

  // Fetch TẤT CẢ trạng thái cùng lúc với page size mặc định (50)
  const fetchAllStatuses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Gọi API cho TẤT CẢ 5 trạng thái đồng thời với page size 50
      const promises = tabs.map((tab) =>
        createOrderPaymentService
          .getOrdersByStatus(tab.key, 0, 100)
          .then((response) => ({
            status: tab.key,
            data: response,
          }))
          .catch((error) => ({
            status: tab.key,
            error: error,
          }))
      );

      const results = await Promise.all(promises);

      // Tổ chức data theo trạng thái
      const newData = {};
      results.forEach((result) => {
        if (result.error) {
          console.error(`Error fetching ${result.status}:`, result.error);
          newData[result.status] = {
            content: [],
            totalElements: 0,
            loaded: false,
            pageSize: 100,
          };
        } else {
          newData[result.status] = {
            content: result.data?.content || [],
            totalElements: result.data?.totalElements || 0,
            loaded: true,
            pageSize: 100,
          };
        }
      });

      setAllOrdersData(newData);
      setInitialLoading(false);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải danh sách đơn hàng";
      setError(errorMessage);
      toast.error(errorMessage);
      setInitialLoading(false);
    } finally {
      setLoading(false);
    }
  }, [tabs]);

  // Fetch một trạng thái cụ thể với page size tùy chỉnh
  const fetchSingleStatus = useCallback(async (status, size = 100) => {
    try {
      setLoading(true);
      const response = await createOrderPaymentService.getOrdersByStatus(
        status,
        0,
        size
      );

      setAllOrdersData((prev) => ({
        ...prev,
        [status]: {
          content: response?.content || [],
          totalElements: response?.totalElements || 0,
          loaded: true,
          pageSize: size,
        },
      }));

      toast.success("Đã cập nhật dữ liệu!");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải dữ liệu";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tất cả khi component mount
  useEffect(() => {
    fetchAllStatuses();
  }, [fetchAllStatuses]);

  // Get orders cho tab hiện tại
  const currentOrders = useMemo(() => {
    return allOrdersData[activeTab]?.content || [];
  }, [allOrdersData, activeTab]);

  const handleTabChange = (tabKey) => {
    if (tabKey === activeTab) return;

    // Khi chuyển tab, kiểm tra xem tab đó đã load với page size hiện tại chưa
    const targetTabData = allOrdersData[tabKey];

    setActiveTab(tabKey);
    setSearchTerm("");
    setFilterDate("");

    // Nếu tab đích chưa load hoặc page size khác với page size hiện tại, fetch lại
    if (!targetTabData.loaded || targetTabData.pageSize !== pageSize) {
      fetchSingleStatus(tabKey, pageSize);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
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
      CHUYEN_TIEN: "Chuyển tiền",
    };
    return texts[type] || type;
  };

  // Filter orders - client side filtering
  const filteredOrders = useMemo(() => {
    return currentOrders.filter((order) => {
      // Filter by search term
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
  }, [currentOrders, searchTerm, filterDate]);

  // Pagination - client side
  const [currentPage, setCurrentPage] = useState(0);

  const paginatedOrders = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reset page khi đổi tab hoặc filter
  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab, searchTerm, filterDate, pageSize]);

  // Handle page size change - CHỈ fetch lại tab hiện tại
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);

    // CHỈ fetch lại trạng thái hiện tại với page size mới
    fetchSingleStatus(activeTab, newSize);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterDate("");
  };

  const openPaymentDialog = (order) => {
    if (!order.paymentCode) {
      toast.error("Đơn hàng này chưa có mã thanh toán");
      return;
    }
    setSelectedPaymentCode(order.paymentCode);
    setIsPaymentDialogOpen(true);
  };

  const closePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedPaymentCode(null);
  };

  const currentTab = tabs.find((tab) => tab.key === activeTab);
  const showingFrom = filteredOrders.length ? currentPage * pageSize + 1 : 0;
  const showingTo = Math.min(
    (currentPage + 1) * pageSize,
    filteredOrders.length
  );

  // Total statistics từ tất cả trạng thái
  const totalAllOrders = useMemo(() => {
    return Object.values(allOrdersData).reduce(
      (sum, data) => sum + data.totalElements,
      0
    );
  }, [allOrdersData]);

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
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Quản Lý Đơn Hàng Thanh Toán
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchSingleStatus(activeTab, pageSize)}
                disabled={loading}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                type="button"
                title="Tải lại tab hiện tại"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Tab này
              </button>
              <button
                onClick={fetchAllStatuses}
                disabled={loading}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                type="button"
                title="Tải lại tất cả với page size 50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Tất cả (50)
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {initialLoading ? (
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
                      Tổng Tất Cả
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {totalAllOrders}
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
                      Đã Xác Nhận
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {allOrdersData.DA_XAC_NHAN.totalElements}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Chờ Thanh Toán
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {allOrdersData.CHO_THANH_TOAN.totalElements}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Clock className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tab Hiện Tại
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {allOrdersData[activeTab].totalElements}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Loaded: {allOrdersData[activeTab].content.length}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <TruckIcon className="text-orange-600" size={24} />
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
              {tabs.map((tab) => {
                const tabData = allOrdersData[tab.key];
                const needsReload = tabData.pageSize !== pageSize;

                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                      activeTab === tab.key
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    type="button"
                  >
                    {tab.label}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === tab.key
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {tabData.totalElements}
                    </span>
                    {needsReload && (
                      <span className="text-xs opacity-60">
                        ({tabData.pageSize})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && !loading && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
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
                    onClick={fetchAllStatuses}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Section */}
        {!initialLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col gap-4">
              {/* Search Input */}
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo mã đơn, mã KH, tên KH, mã thanh toán..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        type="button"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 max-w-xs">
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {(searchTerm || filterDate) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all flex items-center gap-2 whitespace-nowrap"
                    type="button"
                  >
                    <X size={18} />
                    Xóa lọc
                  </button>
                )}
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Hiển thị:
                  </span>
                  <div className="flex gap-2">
                    {PAGE_SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => handlePageSizeChange(size)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
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
                  {loading && (
                    <span className="text-sm text-blue-600 font-medium flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin" />
                      Đang tải {pageSize} items...
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  {filteredOrders.length !== currentOrders.length && (
                    <span className="font-medium text-blue-600">
                      Hiển thị: {filteredOrders.length} / {currentOrders.length}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {(initialLoading || loading) && (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <OrderCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!initialLoading &&
          !loading &&
          !error &&
          filteredOrders.length === 0 && (
            <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-gray-200">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">Không có đơn hàng nào</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || filterDate
                  ? "Không tìm thấy kết quả phù hợp với bộ lọc."
                  : `Chưa có đơn hàng ${currentTab?.label.toLowerCase()}.`}
              </p>
            </div>
          )}

        {/* Orders List */}
        {!initialLoading && !loading && paginatedOrders.length > 0 && (
          <div className="space-y-4">
            {paginatedOrders.map((order, index) => (
              <div
                key={order.orderId}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 px-4 py-3 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {currentPage * pageSize + index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900">
                            {order.orderCode}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getOrderTypeColor(
                              order.orderType
                            )}`}
                          >
                            {getOrderTypeText(order.orderType)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-600">
                        Tổng tiền
                      </div>
                      <div className="text-lg font-bold text-blue-700">
                        {formatCurrency(order.finalPriceOrder)} ₫
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Customer Info */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-blue-600" />
                        Thông tin khách hàng
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                            {order.customer?.customerCode || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {order.customer?.name || "Chưa có tên"}
                          </span>
                        </div>
                        {order.customer?.email && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span>{order.customer.email}</span>
                          </div>
                        )}
                        {order.customer?.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              {order.customer.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-green-600" />
                        Chi tiết đơn hàng
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tổng tiền:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(order.finalPriceOrder)} ₫
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trọng lượng:</span>
                          <span className="font-semibold text-gray-900">
                            {order.totalWeight} kg
                          </span>
                        </div>
                        {order.paymentCode && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Mã thanh toán:
                            </span>
                            <span className="font-semibold text-blue-600">
                              {order.paymentCode}
                            </span>
                          </div>
                        )}
                        {order.leftoverMoney && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tiền thừa:</span>
                            <span className="font-semibold text-green-600">
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
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                      type="button"
                    >
                      <Eye className="w-4 h-4" />
                      Xem chi tiết
                    </button>

                    {order.paymentCode && (
                      <button
                        onClick={() => openPaymentDialog(order)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                        type="button"
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
        {!initialLoading &&
          !loading &&
          filteredOrders.length > 0 &&
          totalPages > 1 && (
            <div className="px-6 py-4 bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
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
                    {filteredOrders.length}
                  </span>{" "}
                  đơn hàng
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(0)}
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
                    onClick={() => handlePageChange(totalPages - 1)}
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

      {/* Payment Dialog */}
      {isPaymentDialogOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closePaymentDialog}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={16} />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Chi Tiết Thanh Toán
                </h3>
              </div>
              <button
                onClick={closePaymentDialog}
                className="text-white/80 hover:text-white transition-colors"
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {selectedPaymentCode && (
                <DetailPaymentOrder codeFromProp={selectedPaymentCode} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOrderManager;
