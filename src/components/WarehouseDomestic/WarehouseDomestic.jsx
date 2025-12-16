import React, { useState, useEffect, useCallback } from "react";
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
  List,
} from "lucide-react";
import domesticService from "../../Services/Warehouse/domesticService";

// Status constants
const STATUS_OPTIONS = [
  { value: "", label: "-- Tất cả trạng thái --" },
  { value: "DA_NHAP_KHO_VN", label: "Đã nhập kho VN" },
  { value: "CHO_TRUNG_CHUYEN", label: "Chờ trung chuyển" },
  { value: "CHO_GIAO", label: "Chờ giao" },
  { value: "DANG_GIAO", label: "Đang giao" },
  { value: "DA_GIAO", label: "Đã giao" },
];

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200];

// Loading Skeleton Component - Giống WarehouseList style
const LoadingSkeleton = () => {
  return (
    <div className="divide-y divide-gray-100 animate-pulse">
      {[1, 2, 3].map((item) => (
        <div key={item} className="p-6">
          <div className="flex gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-24 h-20 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 gap-3">
              {[1, 2].map((link) => (
                <div
                  key={link}
                  className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((box) => (
                        <div
                          key={box}
                          className="bg-white p-3 rounded-lg border border-gray-200"
                        >
                          <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Image Modal Component - Giống WarehouseList style
const ImageModal = React.memo(({ isOpen, onClose, imageUrl, linkData }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors flex items-center gap-2 bg-black/50 px-3 py-2 rounded-lg"
        >
          <span className="text-sm font-medium">Close</span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
          {/* Image */}
          <div className="p-2 bg-black/5">
            <img
              src={imageUrl}
              alt={linkData?.productName || "Product"}
              className="w-full max-h-[50vh] object-contain rounded-lg bg-white"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x600?text=Image+Not+Available";
              }}
            />
          </div>

          {/* Product Information */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 border-b pb-2">
                  Thông tin sản phẩm
                </h3>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tên sản phẩm
                  </label>
                  <p className="text-base text-gray-900 font-medium mt-1">
                    {linkData?.productName || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Mã lô hàng
                  </label>
                  <p className="text-base text-gray-900 font-mono mt-1">
                    {linkData?.shipmentCode || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Mã đóng gói
                  </label>
                  <p className="text-base text-gray-900 font-mono mt-1">
                    {linkData?.packingCode || "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Trạng thái
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        linkData?.status === "DA_NHAP_KHO_VN"
                          ? "bg-green-100 text-green-800"
                          : linkData?.status === "CHO_TRUNG_CHUYEN"
                          ? "bg-yellow-100 text-yellow-800"
                          : linkData?.status === "CHO_GIAO"
                          ? "bg-blue-100 text-blue-800"
                          : linkData?.status === "DANG_GIAO"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {STATUS_OPTIONS.find((s) => s.value === linkData?.status)
                        ?.label || linkData?.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 border-b pb-2">
                  Thông tin kích thước
                </h3>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Kích thước (D × R × C)
                  </label>
                  <p className="text-base text-gray-900 font-medium mt-1">
                    {linkData?.length && linkData?.width && linkData?.height
                      ? `${linkData.length} × ${linkData.width} × ${linkData.height} cm`
                      : "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Khối lượng thực tế
                  </label>
                  <p className="text-base text-gray-900 font-bold mt-1">
                    {linkData?.weight
                      ? `${linkData.weight.toFixed(3)} kg`
                      : "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Khối lượng quy đổi (Dim)
                  </label>
                  <p className="text-base text-gray-900 font-bold mt-1">
                    {linkData?.dim ? `${linkData.dim.toFixed(3)} kg` : "-"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Khối lượng tính phí
                  </label>
                  <p className="text-lg text-blue-600 font-bold mt-1">
                    {linkData?.weight && linkData?.dim
                      ? `${Math.max(linkData.weight, linkData.dim).toFixed(
                          3
                        )} kg`
                      : "-"}
                  </p>
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
    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex gap-4">
        {/* Image - Clickable */}
        <div className="flex-shrink-0">
          {link.image ? (
            <div
              className="relative group cursor-pointer"
              onClick={() => onImageClick(link.image, link)}
            >
              <img
                src={link.image}
                alt={link.productName}
                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 shadow-sm group-hover:border-blue-500 transition-all"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition-all flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow">
                {linkIndex + 1}
              </div>
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1 font-medium">Sản phẩm</p>
            <p className="font-semibold text-gray-900 truncate">
              {link.productName || "-"}
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1 font-medium">Mã vận đơn</p>
            <p className="font-mono text-gray-900 text-xs font-semibold">
              {link.shipmentCode || "-"}
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1 font-medium">
              Mã đóng gói
            </p>
            <p className="font-mono text-gray-900 text-xs font-semibold">
              {link.packingCode || "-"}
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1 font-medium">Trạng thái</p>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(
                link.status
              )}`}
            >
              {getStatusLabel(link.status)}
            </span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1 font-medium">
              Kích thước (cm)
            </p>
            <p className="font-semibold text-gray-900">
              {link.length && link.width && link.height
                ? `${link.length} × ${link.width} × ${link.height}`
                : "-"}
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1 font-medium">KL thực tế</p>
            <p className="font-bold text-blue-600">
              {link.weight?.toFixed(3) || "-"} kg
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1 font-medium">
              KL quy đổi (Dim)
            </p>
            <p className="font-bold text-purple-600">
              {link.dim?.toFixed(3) || "-"} kg
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border-2 border-green-300">
            <p className="text-xs text-green-700 mb-1 font-medium">
              KL tính phí
            </p>
            <p className="font-bold text-green-700 text-base">
              {link.weight && link.dim
                ? `${Math.max(link.weight, link.dim).toFixed(3)} kg`
                : "-"}
            </p>
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
      <div className="hover:bg-blue-50/60 transition-colors">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex-shrink-0">
                {currentPage * pageSize + index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {order.customerName || "-"}
                  </h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {order.customerCode || "-"}
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-wrap text-sm">
                  <span className="text-gray-600">
                    <span className="font-medium">Mã đơn:</span>{" "}
                    <span className="font-mono text-blue-600 font-semibold">
                      {order.orderCode || "-"}
                    </span>
                  </span>
                  <span className="text-gray-600">
                    <span className="font-medium">Nhân viên:</span>{" "}
                    <span className="text-gray-900">
                      {order.staffName || "-"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 lg:flex-col lg:items-end">
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Tổng trọng lượng</p>
                <p className="text-2xl font-bold text-gray-900">
                  {order.netWeight?.toFixed(2) || "0.00"}
                </p>
                <p className="text-xs text-gray-500">kg</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-lg border border-blue-200">
                <Link2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-800">
                  {order.orderLinks?.length || 0} links
                </span>
              </div>
            </div>
          </div>

          {/* Order Links */}
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
              <List className="w-4 h-4 text-gray-500" />
              Chi tiết Order Links ({order.orderLinks?.length || 0})
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {order.orderLinks?.map((link, linkIndex) => (
                <OrderLinkItem
                  key={link.linkId || linkIndex}
                  link={link}
                  linkIndex={linkIndex}
                  onImageClick={onImageClick}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

OrderCard.displayName = "OrderCard";

function WarehouseDomestic() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
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

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiFilters = {};

      if (filters.status) apiFilters.status = filters.status;
      if (filters.shipmentCode.trim())
        apiFilters.shipmentCode = filters.shipmentCode.trim();
      if (filters.customerCode.trim())
        apiFilters.customerCode = filters.customerCode.trim();

      const response = await domesticService.getWarehouseLinkOrders(
        currentPage,
        pageSize,
        apiFilters
      );

      setOrders(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      console.error("Error loading orders:", err);
      const errorMsg = err.response?.data?.message || "Error loading data!";
      setError(errorMsg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    filters.status,
    filters.shipmentCode,
    filters.customerCode,
  ]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSearch = useCallback(() => {
    setCurrentPage(0);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      status: "",
      shipmentCode: "",
      customerCode: "",
    });
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
    <div className="p-6 min-h-screen">
      <div className="mx-auto">
        {/* Header - Giống WarehouseList */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <PackageOpen size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-semibold text-white">
              Quản lý đơn hàng Nội địa
            </h1>
          </div>
        </div>

        {/* Error - Giống WarehouseList */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Filters - Giống WarehouseList */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {/* Status Select */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Shipment Code */}
            <div className="relative">
              <Package
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={filters.shipmentCode}
                onChange={(e) =>
                  handleFilterChange("shipmentCode", e.target.value)
                }
                onKeyPress={handleKeyPress}
                placeholder="Mã vận đơn..."
                className="w-full pl-8 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {filters.shipmentCode && (
                <button
                  onClick={() => handleFilterChange("shipmentCode", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Customer Code */}
            <div className="relative">
              <FileText
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={filters.customerCode}
                onChange={(e) =>
                  handleFilterChange("customerCode", e.target.value)
                }
                onKeyPress={handleKeyPress}
                placeholder="Mã khách hàng..."
                className="w-full pl-8 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {filters.customerCode && (
                <button
                  onClick={() => handleFilterChange("customerCode", "")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
            <button
              onClick={handleClearFilters}
              disabled={loading}
              className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>

            <select
              value={pageSize}
              onChange={changePageSize}
              disabled={loading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-3 bg-blue-200 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-blue-300 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-blue-300 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            <LoadingSkeleton />
          </div>
        )}

        {/* Empty State - Giống WarehouseList */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <PackageOpen size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              No data
            </h3>
            <p className="text-gray-500 text-sm">
              There are no orders to display.
            </p>
          </div>
        )}

        {/* Results - Giống WarehouseList */}
        {!loading && orders.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-3 bg-blue-200 border-b border-blue-100">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-black-900">
                  Total: {orders.length} items
                </span>
                <span className="text-blue-700">
                  Page {currentPage + 1} / {totalPages}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="divide-y divide-gray-100">
              {orders.map((order, index) => (
                <OrderCard
                  key={order.orderId || index}
                  order={order}
                  index={index}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  onImageClick={openImageModal}
                />
              ))}
            </div>

            {/* Pagination - Giống WarehouseList */}
            <div className="bg-white border-t border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => handlePageChange("prev")}
                  disabled={currentPage === 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    currentPage === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>

                <div className="font-medium text-gray-700">
                  Page {currentPage + 1} / {totalPages}
                </div>

                <button
                  onClick={() => handlePageChange("next")}
                  disabled={currentPage >= totalPages - 1}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    currentPage >= totalPages - 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
