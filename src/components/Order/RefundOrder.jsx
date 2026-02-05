import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Eye,
  Banknote,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Search,
  Receipt,
} from "lucide-react";
import orderService from "../../Services/LeadSale/orderService";
import ConfirmRefundOrder from "./ConfirmRefundOrder";

const RefundOrder = () => {
  const [refundOrders, setRefundOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchOrderCode, setSearchOrderCode] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 100,
    total: 0,
    currentPage: 1,
  });

  const [openRefundModal, setOpenRefundModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchRefundOrders = async (orderCode = "", offset = 0, limit = 100) => {
    try {
      setLoading(true);
      setError(null);

      const response = await orderService.getRefundOrders(
        orderCode,
        offset,
        limit,
      );

      setRefundOrders(response?.content || []);
      setPagination((prev) => ({
        ...prev,
        offset,
        limit,
        total: response?.totalElements ?? response?.content?.length ?? 0,
      }));
    } catch (err) {
      setError("Không thể tải danh sách hoàn tiền. Vui lòng thử lại.");
      console.error("Error fetching refund orders:", err);
      setRefundOrders([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefundOrders("", 0, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount ?? 0);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return String(dateString);
    return date.toLocaleString("vi-VN", { hour12: false });
  };

  const getOrderTypeName = (type) => {
    const map = {
      MUA_HO: "Mua hộ",
      CHIA_DON: "Chia đơn",
      NHAP_HANG: "Nhập hàng",
      DAU_GIA: "Đấu giá",
    };
    return map[type] || type;
  };

  const getStatusInfo = (status) => {
    const map = {
      DA_HUY: {
        name: "Đã hủy",
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-300",
      },
      CHO_HOAN_TIEN: {
        name: "Chờ hoàn tiền",
        bg: "bg-amber-100",
        text: "text-amber-700",
        border: "border-amber-300",
      },
      DA_HOAN_TIEN: {
        name: "Đã hoàn tiền",
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-300",
      },
      DANG_XU_LY: {
        name: "Đang xử lý",
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-300",
      },
      DA_GIAO: {
        name: "Đã giao",
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-300",
      },
    };
    return (
      map[status] || {
        name: status,
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-300",
      }
    );
  };

  const totalPages = Math.max(
    1,
    Math.ceil((pagination.total || 0) / (pagination.limit || 100)),
  );

  const handlePageChange = (page) => {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const pageIndex = safePage - 1;

    setPagination((prev) => ({
      ...prev,
      currentPage: safePage,
      offset: pageIndex,
    }));

    fetchRefundOrders(activeFilter, pageIndex, pagination.limit || 100);
  };

  const handleSearch = () => {
    const code = searchOrderCode.trim();
    setActiveFilter(code);
    setPagination((prev) => ({ ...prev, offset: 0, currentPage: 1 }));
    fetchRefundOrders(code, 0, pagination.limit);
  };

  const handleClearSearch = () => {
    setSearchOrderCode("");
    setActiveFilter("");
    setPagination((prev) => ({ ...prev, offset: 0, currentPage: 1 }));
    fetchRefundOrders("", 0, pagination.limit);
  };

  const handleRefresh = () =>
    fetchRefundOrders(activeFilter, pagination.offset, pagination.limit);

  const openRefundDialog = (order) => {
    setSelectedOrder(order);
    setOpenRefundModal(true);
  };

  const closeRefundDialog = () => {
    setSelectedOrder(null);
    setOpenRefundModal(false);
  };

  // ===== Loading Skeleton Row =====
  const SkeletonRow = () => (
    <tr className="hover:bg-transparent">
      <td className="px-4 py-3">
        <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-6 w-28 bg-slate-200 rounded-full animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="h-4 w-28 bg-slate-200 rounded animate-pulse ml-auto" />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse ml-auto" />
      </td>
      <td className="px-4 py-3 text-center">
        <div className="h-9 w-20 bg-slate-200 rounded-lg animate-pulse mx-auto" />
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mx-auto space-y-6">
        {/* ===== Header ===== */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-yellow-300 via-yellow-300 to-yellow-300 border-[1px] border-black rounded-xl shadow-lg p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 md:h-9 bg-black rounded-full shrink-0 shadow-sm" />
                <div className="w-11 h-11 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0">
                  <Receipt className="w-6 h-6 text-black" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg md:text-xl font-bold text-black leading-tight">
                    Danh Sách Đơn Hoàn Tiền
                  </h1>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors shadow-md hover:shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===== Search Card ===== */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn hàng..."
                value={searchOrderCode}
                onChange={(e) => setSearchOrderCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-300 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
              />
              {searchOrderCode && (
                <button
                  onClick={() => setSearchOrderCode("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  type="button"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Search size={18} />
              Tìm kiếm
            </button>
            {activeFilter && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2.5 bg-slate-500 text-white rounded-lg hover:bg-slate-600 font-medium transition-all whitespace-nowrap shadow-md hover:shadow-lg"
              >
                Xóa lọc
              </button>
            )}
          </div>
          {activeFilter && (
            <div className="mt-3 text-sm text-slate-600">
              Đang lọc:{" "}
              <span className="font-semibold text-blue-600">
                {activeFilter}
              </span>
            </div>
          )}
        </div>

        {/* ===== Error ===== */}
        {error && (
          <div className="rounded-xl bg-red-50 border-2 border-red-300 px-4 py-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* ===== Table Card ===== */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Top bar */}
          <div className="px-4 md:px-6 py-4 bg-slate-50 border-b border-slate-200">
            {loading ? (
              <div className="h-4 w-56 bg-slate-200 rounded animate-pulse" />
            ) : (
              <div className="text-sm font-medium text-slate-700">
                Hiển thị{" "}
                <span className="font-bold text-blue-600">
                  {refundOrders.length}
                </span>{" "}
                bản ghi
                {pagination.total > 0 && (
                  <span className="text-slate-500">
                    {" "}
                    (Tổng: {pagination.total})
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
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider">
                    Mã đơn
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider">
                    Loại đơn
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider">
                    Nhân viên
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-sm uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-sm uppercase tracking-wider">
                    Tiền dư
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-sm uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading &&
                  Array.from({ length: Math.min(pagination.limit, 10) }).map(
                    (_, i) => <SkeletonRow key={`skeleton-${i}`} />,
                  )}

                {!loading &&
                  refundOrders.length > 0 &&
                  refundOrders.map((order) => {
                    const s = getStatusInfo(order.status);
                    const leftover = order.leftoverMoney ?? 0;
                    const leftoverClass =
                      leftover < 0
                        ? "text-red-600"
                        : leftover > 0
                          ? "text-green-600"
                          : "text-slate-600";

                    return (
                      <tr
                        key={order.orderId}
                        className="hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            {order.orderCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium">
                          {getOrderTypeName(order.orderType)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}
                          >
                            {s.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className="font-semibold text-slate-800">
                              {order.customerName || "—"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatDate(order.createdAt)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium">
                          {order.staffName || "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">
                          {formatCurrency(order.finalPriceOrder)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-bold ${leftoverClass}`}
                        >
                          {formatCurrency(order.leftoverMoney)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() =>
                                console.log("View order:", order.orderId)
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                              title="Xem chi tiết đơn"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openRefundDialog(order)}
                              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                              title="Xử lý hoàn tiền"
                            >
                              <Banknote className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {!loading && refundOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-16 h-16 text-slate-300" />
                        <p className="text-slate-500 font-medium text-lg">
                          {activeFilter
                            ? `Không tìm thấy đơn hàng "${activeFilter}"`
                            : "Không có đơn hoàn tiền nào"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== Pagination ===== */}
        {pagination.total > 0 && totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm font-medium text-slate-700">
                Hiển thị{" "}
                <span className="font-bold text-blue-600">
                  {(pagination.currentPage - 1) * pagination.limit + 1}
                </span>{" "}
                -{" "}
                <span className="font-bold text-blue-600">
                  {Math.min(
                    pagination.currentPage * pagination.limit,
                    pagination.total,
                  )}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-bold text-blue-600">
                  {pagination.total}
                </span>{" "}
                đơn
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1 || loading}
                  className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  if (
                    p === 1 ||
                    p === totalPages ||
                    (p >= pagination.currentPage - 2 &&
                      p <= pagination.currentPage + 2)
                  ) {
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        disabled={loading}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          p === pagination.currentPage
                            ? "bg-blue-600 text-white shadow-md"
                            : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  } else if (
                    p === pagination.currentPage - 3 ||
                    p === pagination.currentPage + 3
                  ) {
                    return (
                      <span key={p} className="px-2 text-slate-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === totalPages || loading}
                  className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Confirm Refund */}
      <ConfirmRefundOrder
        open={openRefundModal}
        order={selectedOrder}
        onClose={closeRefundDialog}
        onSuccess={() =>
          fetchRefundOrders(activeFilter, pagination.offset, pagination.limit)
        }
      />
    </div>
  );
};

export default RefundOrder;
