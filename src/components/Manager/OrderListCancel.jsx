import React, { useState, useEffect, useCallback } from "react";
import managerOrderService from "../../Services/Manager/managerOrderService";
import DetailOrderDialog from "./DetailOrderDialog"; // Import dialog

// Order status constants
const ORDER_STATUS_OPTIONS = [
  { value: "DA_XAC_NHAN", label: "Đã xác nhận" },
  { value: "CHO_THANH_TOAN", label: "Chờ thanh toán" },
  { value: "CHO_MUA", label: "Chờ mua" },
  { value: "CHO_NHAP_KHO_NN", label: "Chờ nhập kho NN" },
];

function OrderListCancel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState("CHO_MUA");
  const [searchTerm, setSearchTerm] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [pageSize] = useState(100);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await managerOrderService.getOrdersByStatus(
        selectedStatus,
        currentPage,
        pageSize
      );

      setOrders(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, selectedStatus]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(0);
    setSearchTerm("");
    setCustomerName("");
  };

  const handleViewDetail = (orderId) => {
    setSelectedOrderId(orderId);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrderId(null);
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchTerm ||
      order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.customerCode
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCustomer =
      !customerName ||
      order.customer?.name?.toLowerCase().includes(customerName.toLowerCase());

    return matchesSearch && matchesCustomer;
  });

  const handleClearFilters = () => {
    setSearchTerm("");
    setCustomerName("");
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quản lý đơn hàng
          </h1>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow mb-6 p-4 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Lọc theo trạng thái
          </h2>
          <div className="flex flex-wrap gap-2">
            {ORDER_STATUS_OPTIONS.map((status) => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                className={`px-4 py-2 rounded text-sm font-medium border ${
                  selectedStatus === status.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Tìm kiếm</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã đơn hàng / Mã khách hàng
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập để tìm kiếm..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên khách hàng
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nhập tên khách hàng..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200"
              >
                Xóa bộ lọc
              </button>
              <button
                onClick={loadOrders}
                className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
              >
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Trạng thái:{" "}
                  <span className="text-blue-600">
                    {
                      ORDER_STATUS_OPTIONS.find(
                        (s) => s.value === selectedStatus
                      )?.label
                    }
                  </span>
                </span>
                <span className="text-sm text-gray-600 ml-4">
                  Tổng: <span className="font-semibold">{totalElements}</span>{" "}
                  đơn hàng
                  {filteredOrders.length !== orders.length && (
                    <span className="ml-2">
                      (Hiển thị: {filteredOrders.length})
                    </span>
                  )}
                </span>
              </div>
              {totalPages > 1 && (
                <span className="text-sm text-gray-600">
                  Trang {currentPage + 1} / {totalPages}
                </span>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-2">Đang tải...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Không có đơn hàng</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      STT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mã đơn hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Loại đơn
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order, index) => (
                    <tr
                      key={order.orderId || index}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {currentPage * pageSize + index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">
                        {order.orderCode || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 font-medium">
                          {order.customer?.name || "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.customer?.customerCode || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {order.orderType === "MUA_HO"
                            ? "Mua hộ"
                            : order.orderType || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.finalPriceOrder)}
                        </div>
                        {order.exchangeRate && (
                          <div className="text-xs text-gray-500">
                            Tỷ giá: {order.exchangeRate}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {
                            ORDER_STATUS_OPTIONS.find(
                              (s) =>
                                s.value === (order.status || selectedStatus)
                            )?.label
                          }
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleViewDetail(order.orderId)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Pagination */}
          {!loading && filteredOrders.length > 0 && totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentPage === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang trước
                </button>

                <span className="text-sm text-gray-700">
                  Trang {currentPage + 1} / {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trang sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <DetailOrderDialog
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        orderId={selectedOrderId}
      />
    </div>
  );
}
export default OrderListCancel;
