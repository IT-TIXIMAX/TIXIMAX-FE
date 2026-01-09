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
  Search,
  CheckSquare,
  Square,
  Truck,
  Weight,
  AlertTriangle,
} from "lucide-react";
import ListOrderManager from "../Order/ListOrderManager";

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
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order.orderCode));
    }
  };

  // Handle payment creation success
  const handlePaymentCreated = async (payment) => {
    setPaymentDialog({ open: true, payment });
    setSelectedOrders([]);
    // Refresh orders list
    if (selectedCustomer) {
      await fetchCustomerShippingOrders(selectedCustomer.customerCode);
    }
  };

  // Handle payment creation error
  const handlePaymentError = (error) => {
    console.error("Merged payment ship error:", error);
    // Error is already handled in CreateMergedPaymentShip component
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
        toast.error("Không tìm thấy token xác thực lỗi ở mergedPayment");
        return;
      }

      const data = await orderCustomerService.getOrdersShippingByCustomer(
        customerCode,
        token
      );

      setOrders(data || []);

      if (!data || data.length === 0) {
        toast(`Không tìm thấy đơn hàng  ${customerCode}`, {
          duration: 4000,
          style: {
            background: "#e43833ff",
            color: "#fff",
          },
        });
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
    <div className="mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          Thanh toán vận chuyển
        </h1>
      </div>

      {/* Customer Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Tìm kiếm khách hàng
          </h2>
        </div>

        <div className="max-w-md">
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
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-blue-900">
                  {selectedCustomer.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-blue-700">
                  <div>
                    <span className="font-medium">Mã KH:</span>{" "}
                    {selectedCustomer.customerCode}
                  </div>

                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedCustomer.email}
                  </div>
                  <div>
                    <span className="font-medium">SĐT:</span>{" "}
                    {selectedCustomer.phone}
                  </div>
                  <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200 rounded-md px-2 py-1 text-sm font-semibold text-red-700 shadow-sm w-auto max-w-max">
                    <span className="font-medium">Số dư:</span>{" "}
                    {new Intl.NumberFormat("vi-VN").format(
                      selectedCustomer.balance
                    )}{" "}
                    VND
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">
            Đang tải đơn hàng vận chuyển...
          </span>
        </div>
      )}

      {/* Orders List */}
      {!loading && hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header with Bulk Actions */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                Danh sách thanh toán vận chuyển
                {orders.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({orders.length} đơn hàng)
                  </span>
                )}
              </h2>

              {orders.length > 0 && (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedOrders.length === orders.length ? (
                      <CheckSquare className="w-4 h-4 mr-1" />
                    ) : (
                      <Square className="w-4 h-4 mr-1" />
                    )}
                    {selectedOrders.length === orders.length
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả"}
                  </button>

                  {selectedOrders.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Đã chọn: {selectedOrders.length} đơn hàng
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        Tổng: {formatCurrency(calculateSelectedTotal())}
                      </span>
                      {/* Cảnh báo nếu chọn đơn từ nhiều accountId khác nhau */}
                      {uniqueAccountIds.length > 1 && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          Đang chọn nhiều tài khoản (accountId khác nhau)
                        </span>
                      )}

                      {/* Use CreateMergedPaymentShip Component */}
                      <CreateMergedPaymentShip
                        selectedOrders={selectedOrders}
                        totalAmount={calculateSelectedTotal()}
                        formatCurrency={formatCurrency}
                        onSuccess={handlePaymentCreated}
                        onError={handlePaymentError}
                        accountId={derivedAccountId}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Orders Content */}
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có đơn hàng vận chuyển
              </h3>
              <p className="text-gray-500">
                Khách hàng này chưa có đơn hàng vận chuyển nào cần thanh toán
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div
                  key={order.orderCode}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    selectedOrders.includes(order.orderCode)
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    {/* Checkbox */}
                    <div className="flex items-start space-x-4">
                      <button
                        onClick={() =>
                          handleOrderSelection(
                            order.orderCode,
                            !selectedOrders.includes(order.orderCode)
                          )
                        }
                        className="mt-1 text-blue-600 hover:text-blue-800"
                      >
                        {selectedOrders.includes(order.orderCode) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.orderCode}
                          </h3>
                          {getStatusBadge(order.status)}
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getOrderTypeDisplay(order.orderType)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                          {order.paymentCode && (
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 mr-2" />
                              <span>Mã GD: {order.paymentCode}</span>
                            </div>
                          )}
                          {order.totalNetWeight && (
                            <div className="flex items-center">
                              <Weight className="w-4 h-4 mr-2" />
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-400 text-white">
                                Tổng ký: {order.totalNetWeight}kg
                              </span>
                            </div>
                          )}
                        </div>

                        {order.note && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                              <span className="font-medium">Ghi chú:</span>{" "}
                              {order.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(order.finalPriceOrder)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Phí vận chuyển
                      </div>
                      <div className="text-base font-bold text-gray-900">
                        {formatCurrency(order.leftoverMoney)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Tiền thiếu
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State - No Search Yet */}
      {!hasSearched && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chọn khách hàng để xem đơn hàng vận chuyển
          </h3>
          <p className="text-gray-500">
            Sử dụng ô tìm kiếm ở trên để tìm và chọn khách hàng
          </p>
        </div>
      )}
      {/* 👇 THÊM PHẦN NÀY - ListOrderManager component */}
      <div className="mt-8">
        <div className="border-t border-gray-300 pt-8">
          <ListOrderManager />
        </div>
      </div>
    </div>
  );
};

export default MergedPaymentShip;
