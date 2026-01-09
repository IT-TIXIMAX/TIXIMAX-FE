import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  X,
  Package,
  FileText,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
  Link2,
  ZoomIn,
  PlaneTakeoff,
  List,
} from "lucide-react";
import domesticService from "../../Services/Warehouse/domesticService";

const STATUS_OPTIONS = [
  { value: "", label: "-- Tất cả trạng thái --" },
  { value: "DA_NHAP_KHO_VN", label: "Đã nhập kho VN" },
  { value: "CHO_NHAP_KHO_VN", label: "Chờ nhập kho VN" },
  { value: "CHO_TRUNG_CHUYEN", label: "Chờ trung chuyển" },
  { value: "CHO_GIAO", label: "Chờ giao" },
  { value: "DANG_GIAO", label: "Đang giao" },
  { value: "DA_GIAO", label: "Đã giao" },
];

const PAGE_SIZE_OPTIONS = [50, 100, 200];

// Loading Skeleton Component
const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          </div>

          {[1, 2].map((link) => (
            <div
              key={link}
              className="border border-gray-200 rounded-lg p-4 mb-3"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((box) => (
                      <div key={box} className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Image Modal Component
const ImageModal = React.memo(({ isOpen, onClose, imageUrl, linkData }) => {
  const [imageLoading, setImageLoading] = useState(true);

  // Keyboard support - ESC to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Reset loading state when modal opens
  useEffect(() => {
    if (isOpen) {
      setImageLoading(true);
    }
  }, [isOpen, imageUrl]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <ZoomIn className="w-5 h-5 text-blue-600" />
            <h3
              id="modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              Chi tiết sản phẩm
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Image */}
          <div className="relative bg-gray-100 rounded-lg mb-6 overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={`${linkData?.productName || "Product"} - ${
                linkData?.shipmentCode || ""
              }`}
              className={`w-full h-auto rounded-lg shadow-lg transition-opacity ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                setImageLoading(false);
                e.target.src =
                  "https://via.placeholder.com/800x600?text=Image+Not+Available";
              }}
            />
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                Thông tin sản phẩm
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Tên sản phẩm</div>
                  <div className="text-sm font-medium text-gray-900">
                    {linkData?.productName || "-"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Mã lô hàng</div>
                  <div className="text-sm font-medium text-gray-900">
                    {linkData?.shipmentCode || "-"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Mã đóng gói</div>
                  <div className="text-sm font-medium text-gray-900">
                    {linkData?.packingCode || "-"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Trạng thái</div>
                  <div className="text-sm font-medium text-gray-900">
                    {STATUS_OPTIONS.find((s) => s.value === linkData?.status)
                      ?.label || linkData?.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Dimension Information */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <PackageOpen className="w-4 h-4 text-blue-600" />
                Thông tin kích thước
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">
                    Kích thước (D × R × C)
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {linkData?.length && linkData?.width && linkData?.height
                      ? `${linkData.length} × ${linkData.width} × ${linkData.height} cm`
                      : "-"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">
                    Khối lượng thực tế
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {linkData?.weight
                      ? `${linkData.weight.toFixed(3)} kg`
                      : "-"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">
                    Khối lượng quy đổi (Dim)
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {linkData?.dim ? `${linkData.dim.toFixed(3)} kg` : "-"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">
                    Khối lượng tính phí
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {linkData?.weight && linkData?.dim
                      ? `${Math.max(linkData.weight, linkData.dim).toFixed(
                          3
                        )} kg`
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ImageModal.displayName = "ImageModal";

// Order Link Item Component
const OrderLinkItem = React.memo(({ link, linkIndex, onImageClick }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "DA_NHAP_KHO_VN":
        return "bg-green-100 text-green-800 border-green-200";
      case "CHO_NHAP_KHO_VN":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "CHO_TRUNG_CHUYEN":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CHO_GIAO":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "DANG_GIAO":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DA_GIAO":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    return STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex gap-4">
        {/* Image - Clickable */}
        <div className="flex-shrink-0">
          {link.image ? (
            <button
              onClick={() => onImageClick(link.image, link)}
              className="relative w-20 h-20 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all group"
              aria-label={`Xem ảnh ${link.productName || "sản phẩm"}`}
            >
              <img
                src={link.image}
                alt={`${link.productName || "Product"} - ${
                  link.shipmentCode || ""
                }`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/80x80?text=No+Image";
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                {linkIndex + 1}
              </div>
            </button>
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3 text-sm">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Sản phẩm</div>
              <div className="font-medium text-gray-900 truncate">
                {link.productName || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Mã vận đơn</div>
              <div className="font-medium text-gray-900 truncate">
                {link.shipmentCode || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Mã đóng gói</div>
              <div className="font-medium text-gray-900 truncate">
                {link.packingCode || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Trạng thái</div>
              <span
                className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${getStatusBadgeClass(
                  link.status
                )}`}
              >
                {getStatusLabel(link.status)}
              </span>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">
                Kích thước (cm)
              </div>
              <div className="font-medium text-gray-900">
                {link.length && link.width && link.height
                  ? `${link.length} × ${link.width} × ${link.height}`
                  : "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">KL thực tế</div>
              <div className="font-medium text-gray-900">
                {link.weight?.toFixed(3) || "-"} kg
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">
                KL quy đổi (Dim)
              </div>
              <div className="font-medium text-gray-900">
                {link.dim?.toFixed(3) || "-"} kg
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">KL tính phí</div>
              <div className="font-medium text-blue-600">
                {link.weight && link.dim
                  ? `${Math.max(link.weight, link.dim).toFixed(3)} kg`
                  : "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

OrderLinkItem.displayName = "OrderLinkItem";

// Order Card Component
const OrderCard = React.memo(
  ({ order, index, currentPage, pageSize, onImageClick }) => {
    return (
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
        {/* Order Header */}
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              {currentPage * pageSize + index + 1}
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {order.customerName || "-"}
              </h3>
              <div className="text-sm text-gray-500">
                {order.customerCode || "-"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">
              <span className="font-medium">Mã đơn:</span>{" "}
              <span className="text-gray-900">{order.orderCode || "-"}</span>
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-medium">Nhân viên:</span>{" "}
              <span className="text-gray-900">{order.staffName || "-"}</span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="flex items-center gap-6 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <PackageOpen className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Tổng trọng lượng</span>
            <span className="font-semibold text-gray-900">
              {order.netWeight?.toFixed(2) || "0.00"}
            </span>
            <span className="text-gray-500">kg</span>
          </div>
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-blue-600">
              {order.orderLinks?.length || 0} links
            </span>
          </div>
        </div>

        {/* Order Links */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <List className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-900">
              Chi tiết Order Links ({order.orderLinks?.length || 0})
            </h4>
          </div>
          <div className="space-y-3">
            {order.orderLinks?.map((link, linkIndex) => (
              <OrderLinkItem
                key={link.id || linkIndex}
                link={link}
                linkIndex={linkIndex}
                onImageClick={onImageClick}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

OrderCard.displayName = "OrderCard";

// Main Component
function WarehouseDomestic() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);

  // Input filters (not yet applied)
  const [filters, setFilters] = useState({
    status: "",
    shipmentCode: "",
    customerCode: "",
  });

  // Applied filters (used for API calls)
  const [appliedFilters, setAppliedFilters] = useState({
    status: "",
    shipmentCode: "",
    customerCode: "",
  });

  // Image modal state
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageUrl: "",
    linkData: null,
  });

  // Ref to cancel previous requests
  const abortControllerRef = useRef(null);

  const loadOrders = useCallback(async () => {
    // Cancel previous request if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    // Clear old data immediately
    setOrders([]);
    setTotalElements(0);
    setTotalPages(0);

    try {
      const apiFilters = {};
      if (appliedFilters.status) apiFilters.status = appliedFilters.status;
      if (appliedFilters.shipmentCode.trim())
        apiFilters.shipmentCode = appliedFilters.shipmentCode.trim();
      if (appliedFilters.customerCode.trim())
        apiFilters.customerCode = appliedFilters.customerCode.trim();

      const response = await domesticService.getWarehouseLinkOrders(
        currentPage,
        pageSize,
        apiFilters,
        abortControllerRef.current.signal
      );

      // Only update if request wasn't cancelled
      if (!abortControllerRef.current.signal.aborted) {
        setOrders(response.content || []);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 0);
      }
    } catch (err) {
      // Ignore AbortError
      if (err.name === "AbortError" || err.code === "ERR_CANCELED") {
        return;
      }

      console.error("Error loading orders:", err);
      const errorMsg = err.response?.data?.message || "Lỗi khi tải dữ liệu!";
      setError(errorMsg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, appliedFilters]);

  useEffect(() => {
    loadOrders();

    // Cleanup: cancel request when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadOrders]);

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Search button: Apply filters and reset to page 0
  const handleSearch = useCallback(() => {
    setAppliedFilters({ ...filters });
    setCurrentPage(0);
  }, [filters]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    const emptyFilters = {
      status: "",
      shipmentCode: "",
      customerCode: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(0);
  }, []);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const changePageSize = useCallback((e) => {
    setPageSize(parseInt(e.target.value, 10));
    setCurrentPage(0);
  }, []);

  const openImageModal = useCallback((imageUrl, linkData) => {
    setImageModal({
      isOpen: true,
      imageUrl,
      linkData,
    });
  }, []);

  const closeImageModal = useCallback(() => {
    setImageModal({
      isOpen: false,
      imageUrl: "",
      linkData: null,
    });
  }, []);

  const handlePageChange = useCallback((direction) => {
    setCurrentPage((prev) => {
      if (direction === "next") {
        return prev + 1;
      }
      return Math.max(0, prev - 1);
    });
  }, []);

  return (
    <div className="min-h-screen n p-6">
      {/* Header */}
      <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <PlaneTakeoff size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white">
            Tổng kiện đang vận chuyển
          </h1>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <X className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Status Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Trạng thái
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Shipment Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mã vận đơn
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.shipmentCode}
                onChange={(e) =>
                  handleFilterChange("shipmentCode", e.target.value)
                }
                onKeyPress={handleKeyPress}
                disabled={loading}
                placeholder="Mã vận đơn..."
                className="w-full pl-8 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {filters.shipmentCode && (
                <button
                  onClick={() => handleFilterChange("shipmentCode", "")}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                  aria-label="Xóa mã vận đơn"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Customer Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mã khách hàng
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.customerCode}
                onChange={(e) =>
                  handleFilterChange("customerCode", e.target.value)
                }
                onKeyPress={handleKeyPress}
                disabled={loading}
                placeholder="Mã khách hàng..."
                className="w-full pl-8 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {filters.customerCode && (
                <button
                  onClick={() => handleFilterChange("customerCode", "")}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                  aria-label="Xóa mã khách hàng"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              <Search className="w-4 h-4" />
              Tìm kiếm
            </button>
            <button
              onClick={handleClearFilters}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Xóa bộ lọc"
              aria-label="Xóa bộ lọc"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Page Size */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">
            Số dòng mỗi trang:
          </label>
          <select
            value={pageSize}
            onChange={changePageSize}
            disabled={loading}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Số dòng mỗi trang"
          >
            {PAGE_SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt} dòng
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && <LoadingSkeleton />}

      {/* Empty State */}
      {!loading && !error && orders.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không có dữ liệu
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {appliedFilters.status ||
            appliedFilters.shipmentCode ||
            appliedFilters.customerCode
              ? "Không tìm thấy đơn hàng nào phù hợp với bộ lọc của bạn."
              : "Chưa có đơn hàng nào để hiển thị."}
          </p>
          {(appliedFilters.status ||
            appliedFilters.shipmentCode ||
            appliedFilters.customerCode) && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {!loading && orders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Tổng số: {totalElements} đơn hàng
              </span>
            </div>
            <span className="text-sm text-gray-500">
              Trang {currentPage + 1} / {totalPages}
            </span>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {orders.map((order, index) => (
              <OrderCard
                key={order.id || `order-${currentPage}-${index}`}
                order={order}
                index={index}
                currentPage={currentPage}
                pageSize={pageSize}
                onImageClick={openImageModal}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 0 || loading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                currentPage === 0 || loading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-blue-50"
              }`}
              aria-label="Trang trước"
            >
              <ChevronLeft className="w-4 h-4" />
              Trước
            </button>

            <span className="text-sm text-gray-600">
              Trang {currentPage + 1} / {totalPages}
            </span>

            <button
              onClick={() => handlePageChange("next")}
              disabled={currentPage >= totalPages - 1 || loading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                currentPage >= totalPages - 1 || loading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-blue-50"
              }`}
              aria-label="Trang sau"
            >
              Sau
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
        imageUrl={imageModal.imageUrl}
        linkData={imageModal.linkData}
      />
    </div>
  );
}

export default WarehouseDomestic;
