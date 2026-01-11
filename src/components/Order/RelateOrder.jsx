import React, { useEffect, useState } from "react";
import {
  Search,
  Loader2,
  Check,
  X,
  Package,
  Truck,
  AlertCircle,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import orderlinkService from "../../Services/StaffPurchase/orderlinkService";

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

const TableSkeleton = ({ rows = 10 }) => (
  <div className="p-4 animate-pulse">
    <div className="h-12 bg-gray-100 rounded-lg mb-4" />
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 bg-gray-200 rounded-lg" />
            <div className="h-4 w-36 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 flex-1 bg-gray-200 rounded hidden md:block" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RelateOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSubmitting, setDialogSubmitting] = useState(false);
  const [dialogCode, setDialogCode] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  // Image preview
  const [imagePreview, setImagePreview] = useState(null);

  const fetchOrders = async (page = 0, size = pageSize) => {
    try {
      setLoadingList(true);
      const data = await orderlinkService.getOrdersWithoutShipment(page, size);
      setOrders(data?.content || []);
      setTotalElements(data?.totalElements || 0);
      setTotalPages(data?.totalPages || 0);
      setCurrentPage(page);
    } catch {
      toast.error("Không thể tải danh sách.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchOrders(0, pageSize);
  }, [pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages && !loadingList) {
      fetchOrders(newPage, pageSize);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
    fetchOrders(0, newSize);
  };

  const statusBadge = (status) => {
    const statusMap = {
      CHO_MUA: {
        label: "Chờ mua",
        style: "bg-amber-100 text-amber-800",
      },
      DAU_GIA_THANH_CONG: {
        label: "Đấu giá thành công",
        style: "bg-emerald-100 text-emerald-800",
      },
      MUA_SAU: {
        label: "Mua sau",
        style: "bg-blue-100 text-blue-800",
      },
      DA_MUA: {
        label: "Đã mua",
        style: "bg-green-100 text-green-800",
      },
      DA_HUY: {
        label: "Đã hủy",
        style: "bg-red-100 text-red-800",
      },
      CHO_XU_LY: {
        label: "Chờ xử lý",
        style: "bg-gray-100 text-gray-800",
      },
      DA_GIAO: {
        label: "Đã giao",
        style: "bg-purple-100 text-purple-800",
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      style: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${statusInfo.style}`}
      >
        {statusInfo.label}
      </span>
    );
  };

  // Flatten
  const rows = orders.flatMap((o) =>
    o.pendingLinks.map((l) => ({
      orderId: o.orderId,
      orderCode: o.orderCode,
      customerName: o.customer?.name,
      customerCode: o.customer?.customerCode,
      productName: l.productName,
      quantity: l.quantity,
      linkId: l.linkId,
      status: l.status,
      shipmentCode: l.shipmentCode || "",
      purchaseImage: l.purchaseImage || "",
      checkStatus: l.checkStatus || "CHECK",
    }))
  );

  // Search
  const filtered = rows.filter((r) => {
    const t = searchText.toLowerCase();
    return (
      !t ||
      r.orderCode.toLowerCase().includes(t) ||
      r.customerCode.toLowerCase().includes(t) ||
      r.customerName.toLowerCase().includes(t) ||
      r.productName.toLowerCase().includes(t)
    );
  });

  // Open dialog
  const handleOpenDialog = (row) => {
    setEditingItem(row);
    setDialogCode(row.shipmentCode || "");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (dialogSubmitting) return;
    setDialogOpen(false);
    setDialogCode("");
    setEditingItem(null);
  };

  const handleConfirmUpdate = async () => {
    if (!editingItem) return;

    if (!dialogCode.trim()) {
      toast.error("Vui lòng nhập mã vận đơn!");
      return;
    }

    try {
      setDialogSubmitting(true);

      await orderlinkService.updateOrderLinkShipmentCode(
        editingItem.orderId,
        editingItem.linkId,
        dialogCode
      );

      toast.success("Cập nhật thành công.");
      handleCloseDialog();
      fetchOrders(currentPage, pageSize);
    } catch {
      toast.error("Cập nhật thất bại.");
    } finally {
      setDialogSubmitting(false);
    }
  };

  const showingFrom = totalElements ? currentPage * pageSize + 1 : 0;
  const showingTo = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Truck size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Cập Nhật Mã Vận Đơn
              </h1>
            </div>

            <button
              onClick={() => fetchOrders(currentPage, pageSize)}
              disabled={loadingList}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              type="button"
            >
              <RefreshCw
                size={16}
                className={loadingList ? "animate-spin" : ""}
              />
              Tải lại
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {loadingList ? (
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
                      Tổng Link
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {rows.length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Truck className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Kết Quả Tìm Kiếm
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {filtered.length}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Search className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng Số Bản Ghi
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {totalElements}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Package className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm mã đơn, mã KH, tên KH hoặc sản phẩm..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    type="button"
                  >
                    <X size={18} />
                  </button>
                )}
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
          {loadingList ? (
            <TableSkeleton rows={10} />
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">
                Không tìm thấy dữ liệu
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {searchText
                  ? "Thử thay đổi từ khóa tìm kiếm"
                  : "Chưa có đơn hàng nào cần cập nhật"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Hình Ảnh
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã Đơn
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Khách Hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã KH
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Sản Phẩm
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Trạng Thái
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Thao Tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      {/* Purchase Image */}
                      <td className="px-4 py-4">
                        {row.purchaseImage ? (
                          <div className="relative group">
                            <img
                              src={row.purchaseImage}
                              alt="Product"
                              className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-all shadow-sm"
                              onClick={() => setImagePreview(row.purchaseImage)}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center pointer-events-none">
                              <ImageIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>

                      {/* Order Code */}
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-blue-700">
                          {row.orderCode}
                        </span>
                      </td>

                      {/* Customer Name */}
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-900 font-medium">
                          {row.customerName}
                        </span>
                      </td>

                      {/* Customer Code */}
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-blue-600">
                          {row.customerCode}
                        </span>
                      </td>

                      {/* Product Name */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900 font-medium line-clamp-2">
                            {row.productName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Số lượng:{" "}
                            <span className="font-semibold">
                              {row.quantity}
                            </span>
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">{statusBadge(row.status)}</td>

                      {/* Action */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleOpenDialog(row)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 mx-auto text-sm"
                          type="button"
                        >
                          <Truck className="w-4 h-4" />
                          Cập nhật
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loadingList && (
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
                  bản ghi
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
      </div>

      {/* Update Dialog */}
      {dialogOpen && editingItem && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
            {/* Dialog Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Truck className="text-white" size={16} />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Cập Nhật Mã Vận Đơn
                </h3>
              </div>
              <button
                onClick={handleCloseDialog}
                disabled={dialogSubmitting}
                className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            {/* Dialog Body */}
            <div className="px-6 py-6 space-y-4">
              {/* Order Info Card */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <div className="flex items-start gap-3">
                  {editingItem.purchaseImage && (
                    <img
                      src={editingItem.purchaseImage}
                      alt="Product"
                      className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-blue-700">
                        {editingItem.orderCode}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-700 font-medium truncate">
                        {editingItem.customerName}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                      {editingItem.productName}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">
                        SL: {editingItem.quantity}
                      </span>
                      <span className="text-gray-300">•</span>
                      {statusBadge(editingItem.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mã vận đơn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập mã vận đơn..."
                  value={dialogCode}
                  onChange={(e) => setDialogCode(e.target.value)}
                  disabled={dialogSubmitting}
                  autoFocus
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Info Notice */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  Vui lòng kiểm tra kỹ thông tin trước khi lưu. Mã vận đơn không
                  thể thay đổi sau khi cập nhật.
                </p>
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={handleCloseDialog}
                disabled={dialogSubmitting}
                className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmUpdate}
                disabled={dialogSubmitting || !dialogCode.trim()}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                type="button"
              >
                {dialogSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Xác nhận lưu
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-[200] p-4"
          onClick={() => setImagePreview(null)}
        >
          <div className="relative w-full max-w-6xl max-h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setImagePreview(null)}
              className="absolute -top-12 right-0 p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              type="button"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <img
              src={imagePreview}
              alt="Preview"
              className="w-auto max-w-[95vw] max-h-[85vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RelateOrder;
