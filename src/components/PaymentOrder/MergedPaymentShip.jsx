// MergedPaymentShip.jsx
import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import AccountSearch from "../Order/AccountSearch";
import orderCustomerService from "../../Services/Order/orderCustomerService";
import CreateMergedPaymentShip from "./CreateMergedPaymentShip";
import PaymentDialog from "./PaymentDialog";
import {
  User,
  Calendar,
  CreditCard,
  CheckSquare,
  Square,
  Truck,
  Weight,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Package,
  DollarSign,
  Search,
} from "lucide-react";

// Helper function to extract error message from backend
const getErrorMessage = (error) => {
  if (error.response) {
    const backendError =
      error.response.data?.error ||
      error.response.data?.message ||
      error.response.data?.detail ||
      error.response.data?.errors;

    if (backendError) {
      if (typeof backendError === "object" && !Array.isArray(backendError)) {
        const errorMessages = Object.entries(backendError)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(", ");
        return `Lỗi validation: ${errorMessages}`;
      } else if (Array.isArray(backendError)) {
        return backendError.join(", ");
      } else {
        return backendError;
      }
    }
    return `Lỗi ${error.response.status}: ${
      error.response.statusText || "Không xác định"
    }`;
  } else if (error.request) {
    return "Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.";
  }
  return error.message || "Đã xảy ra lỗi không xác định";
};

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

const OrdersListSkeleton = () => (
  <div className="p-4 animate-pulse">
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="h-5 w-5 bg-gray-200 rounded" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-32 bg-gray-200 rounded" />
                <div className="h-6 w-24 bg-gray-200 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-28 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-8 w-32 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MergedPaymentShip = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    payment: null,
  });

  // Handle customer selection from AccountSearch
  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setHasSearched(true);
    setSelectedOrders([]);
    setPaymentDialog({ open: false, payment: null });
    await fetchCustomerShippingOrders(customer.customerCode);
  };

  // Clear customer selection
  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setOrders([]);
    setHasSearched(false);
    setSelectedOrders([]);
    setPaymentDialog({ open: false, payment: null });
  };

  // Handle order selection for merged payment
  const handleOrderSelection = (orderCode, isSelected) => {
    if (isSelected) {
      setSelectedOrders((prev) => [...prev, orderCode]);
    } else {
      setSelectedOrders((prev) => prev.filter((code) => code !== orderCode));
    }
  };

  // Select all orders
  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length && orders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order.orderCode));
    }
  };

  // Handle payment creation success
  const handlePaymentCreated = async (payment) => {
    setPaymentDialog({ open: true, payment });
    setSelectedOrders([]);
    if (selectedCustomer) {
      await fetchCustomerShippingOrders(selectedCustomer.customerCode);
    }
  };

  // Handle payment creation error
  const handlePaymentError = (error) => {
    console.error("Merged payment ship error:", error);
  };

  // Close payment dialog
  const handleClosePaymentDialog = () => {
    setPaymentDialog({ open: false, payment: null });
  };

  // Copy payment code to clipboard
  const handleCopyPaymentCode = () => {
    if (paymentDialog.payment?.paymentCode) {
      navigator.clipboard.writeText(paymentDialog.payment.paymentCode);
      toast.success("Đã sao chép mã thanh toán");
    }
  };

  // Fetch shipping orders for selected customer
  const fetchCustomerShippingOrders = async (customerCode) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");

      if (!token) {
        toast.error("Không tìm thấy token xác thực");
        return;
      }

      const data = await orderCustomerService.getOrdersShippingByCustomer(
        customerCode,
        token
      );

      setOrders(data || []);

      if (!data || data.length === 0) {
        toast(`Không tìm thấy đơn ${customerCode}`, {
          duration: 4000,
          style: {
            background: "#f63b3b",
            color: "#fff",
          },
        });
      } else {
        toast.success(
          `Tìm thấy ${data.length} đơn hàng vận chuyển cho KH ${customerCode}`
        );
      }
    } catch (error) {
      console.error("Error fetching customer shipping orders:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(`Không thể tải đơn hàng vận chuyển: ${errorMessage}`, {
        duration: 5000,
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total amount of selected orders
  const calculateSelectedTotal = () => {
    return orders
      .filter((order) => selectedOrders.includes(order.orderCode))
      .reduce(
        (total, order) =>
          total +
          (Number(order.finalPriceOrder) || 0) +
          (Number(order.leftoverMoney) || 0),
        0
      );
  };

  // Calculate total amount of all orders
  const calculateTotalAmount = () => {
    return orders.reduce(
      (total, order) =>
        total +
        (Number(order.finalPriceOrder) || 0) +
        (Number(order.leftoverMoney) || 0),
      0
    );
  };

  // Calculate total weight
  const calculateTotalWeight = () => {
    return orders.reduce(
      (total, order) => total + (Number(order.totalNetWeight) || 0),
      0
    );
  };

  const selectedOrdersData = useMemo(
    () => orders.filter((o) => selectedOrders.includes(o.orderCode)),
    [orders, selectedOrders]
  );

  const uniqueAccountIds = useMemo(() => {
    const ids = selectedOrdersData
      .map((o) => o?.customer?.accountId)
      .filter((v) => v !== null && v !== undefined);
    return [...new Set(ids)];
  }, [selectedOrdersData]);

  const derivedAccountId = useMemo(() => {
    if (uniqueAccountIds.length === 1) return uniqueAccountIds[0];
    return null;
  }, [uniqueAccountIds]);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      DA_XAC_NHAN: {
        text: "Đã xác nhận",
        className: "bg-green-100 text-green-800",
      },
      CHO_THANH_TOAN_SHIP: {
        text: "Chờ thanh toán ship",
        className: "bg-yellow-100 text-yellow-800",
      },
      CHO_THANH_TOAN: {
        text: "Chờ thanh toán",
        className: "bg-orange-100 text-orange-800",
      },
      DA_DU_HANG: {
        text: "Đã đủ hàng",
        className: "bg-blue-100 text-blue-800",
      },
      CHO_NHAP_KHO_VN: {
        text: "Chờ nhập kho VN",
        className: "bg-blue-100 text-blue-800",
      },
      HOAN_THANH: {
        text: "Hoàn thành",
        className: "bg-green-100 text-green-800",
      },
      HUY: {
        text: "Đã hủy",
        className: "bg-red-100 text-red-800",
      },
    };

    const config = statusConfig[status] || {
      text: status,
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.text}
      </span>
    );
  };

  // Get order type display
  const getOrderTypeDisplay = (orderType) => {
    const typeConfig = {
      MUA_HO: "Mua hộ",
      VAN_CHUYEN: "Vận chuyển",
      KY_GUI: "Ký gửi",
    };
    return typeConfig[orderType] || orderType;
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Truck size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Thanh Toán Vận Chuyển
              </h1>
            </div>

            <button
              onClick={() => {
                if (selectedCustomer) {
                  fetchCustomerShippingOrders(selectedCustomer.customerCode);
                }
              }}
              disabled={loading || !selectedCustomer}
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
          {loading && !hasSearched ? (
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
                      {orders.length}
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
                      Đã Chọn
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {selectedOrders.length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CheckSquare className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng Giá Trị
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(calculateTotalAmount())}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng Cân Nặng
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {calculateTotalWeight().toFixed(2)} kg
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Weight className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Customer Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Tìm Kiếm Khách Hàng
            </h2>
          </div>

          <div className="max-w-2xl">
            <AccountSearch
              onSelectAccount={handleSelectCustomer}
              onClear={handleClearCustomer}
              value={
                selectedCustomer
                  ? `${selectedCustomer.customerCode} - ${selectedCustomer.name}`
                  : ""
              }
            />
          </div>

          {/* Selected Customer Info */}
          {selectedCustomer && (
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">
                      {selectedCustomer.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    {selectedCustomer.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-blue-800">
                        Mã KH:
                      </span>
                      <span className="text-blue-700">
                        {selectedCustomer.customerCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-blue-800">
                        Email:
                      </span>
                      <span className="text-blue-700 truncate">
                        {selectedCustomer.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-blue-800">SĐT:</span>
                      <span className="text-blue-700">
                        {selectedCustomer.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-red-200 border-2 border-red-300 rounded-lg px-3 py-1.5 shadow-sm">
                      <span className="text-sm font-semibold text-black">
                        Số dư:
                      </span>
                      <span className="text-sm font-bold text-black">
                        {new Intl.NumberFormat("vi-VN").format(
                          selectedCustomer.balance
                        )}{" "}
                        ₫
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Dialog */}
        <PaymentDialog
          open={paymentDialog.open}
          payment={paymentDialog.payment}
          onClose={handleClosePaymentDialog}
          onCopyCode={handleCopyPaymentCode}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />

        {/* Orders List Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header with Bulk Actions */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-semibold text-white flex items-center">
                Danh Sách Đơn Vận Chuyển
                <span className="ml-2 text-xl font-normal text-blue-100">
                  ({orders.length} đơn hàng)
                </span>
              </h2>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  disabled={orders.length === 0}
                  className="flex items-center text-sm text-white/90 hover:text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {selectedOrders.length === orders.length &&
                  orders.length > 0 ? (
                    <CheckSquare className="w-4 h-4 mr-1" />
                  ) : (
                    <Square className="w-4 h-4 mr-1" />
                  )}
                  {selectedOrders.length === orders.length && orders.length > 0
                    ? "Chọn tất cả"
                    : "Chọn tất cả"}
                </button>

                <div
                  className={`flex items-center space-x-3 bg-white/50 px-4 py-2 rounded-lg transition-opacity ${
                    selectedOrders.length > 0 ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <span className="text-xl font-bold text-black">
                    Đã chọn: {selectedOrders.length}
                  </span>
                  <span className="text-xl font-bold text-black">
                    {formatCurrency(calculateSelectedTotal())}
                  </span>

                  {/* Cảnh báo nhiều accountId */}
                  {uniqueAccountIds.length > 1 && selectedOrders.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 border border-red-200 px-2 py-1 rounded">
                      <AlertTriangle className="w-3 h-3" />
                      Nhiều tài khoản
                    </span>
                  )}

                  <CreateMergedPaymentShip
                    selectedOrders={selectedOrders}
                    totalAmount={calculateSelectedTotal()}
                    formatCurrency={formatCurrency}
                    onSuccess={handlePaymentCreated}
                    onError={handlePaymentError}
                    accountId={derivedAccountId}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Orders Content */}
          {loading ? (
            <OrdersListSkeleton />
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <Truck className="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {hasSearched
                  ? "Không Có Đơn Vận Chuyển"
                  : "Chưa Tìm Kiếm Khách Hàng"}
              </h3>
              <p className="text-gray-500">
                {hasSearched
                  ? "Khách hàng này chưa có đơn vận chuyển nào cần thanh toán"
                  : "Vui lòng tìm kiếm và chọn khách hàng ở trên để xem danh sách đơn vận chuyển"}
              </p>
            </div>
          ) : (
            <div className="p-4">
              <div className="space-y-3">
                {orders.map((order, index) => (
                  <div
                    key={order.orderCode}
                    className={`border-2 rounded-xl p-5 transition-all ${
                      selectedOrders.includes(order.orderCode)
                        ? "bg-blue-50 border-blue-500 shadow-md"
                        : index % 2 === 0
                        ? "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                        : "bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Checkbox */}
                        <button
                          onClick={() =>
                            handleOrderSelection(
                              order.orderCode,
                              !selectedOrders.includes(order.orderCode)
                            )
                          }
                          className="mt-1 text-blue-600 hover:text-blue-800 transition-colors"
                          type="button"
                        >
                          {selectedOrders.includes(order.orderCode) ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-bold text-gray-900">
                              {order.orderCode}
                            </h3>
                            {getStatusBadge(order.status)}
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {getOrderTypeDisplay(order.orderType)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="font-medium">
                                {formatDate(order.createdAt)}
                              </span>
                            </div>
                            {order.paymentCode && (
                              <div className="flex items-center text-gray-600">
                                <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                                <span>Mã GD: {order.paymentCode}</span>
                              </div>
                            )}
                            {order.totalNetWeight && (
                              <div className="flex items-center">
                                <Weight className="w-4 h-4 mr-2 text-blue-600" />
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                                  {order.totalNetWeight} kg
                                </span>
                              </div>
                            )}
                          </div>

                          {order.note && (
                            <div className="mt-3 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <span className="font-semibold">Ghi chú:</span>{" "}
                                {order.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="text-right ml-6 space-y-2">
                        <div>
                          <div className="text-xl font-bold text-blue-600">
                            {formatCurrency(order.finalPriceOrder)}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            Phí vận chuyển
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-300">
                          <div className="text-lg font-bold text-red-600">
                            {formatCurrency(order.leftoverMoney)}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            Tiền thiếu
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MergedPaymentShip;
