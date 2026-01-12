import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  Search,
  X,
  Package,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ZoomIn,
  PlaneTakeoff,
  Truck,
  Weight,
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
  <div className="animate-pulse">
    <div className="h-12 bg-gray-100 rounded-t-xl" />
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-white border-b border-gray-200 p-4 flex gap-4"
        >
          <div className="h-20 w-20 bg-gray-200 rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-48 bg-gray-200 rounded" />
            <div className="h-3 w-40 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ===================== Image Modal ===================== */
const ImageModal = React.memo(({ isOpen, onClose, imageUrl, linkData }) => {
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) setImageLoading(true);
  }, [isOpen, imageUrl]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <ZoomIn className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Chi tiết sản phẩm
            </h3>
          </div>
          <button
            onClick={onClose}
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
              alt={`${linkData?.productName || "Product"}`}
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

/* ===================== Main Component ===================== */
function WarehouseDomestic() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState(null);

  // Search inputs (not yet applied)
  const [searchStatus, setSearchStatus] = useState("");
  const [searchShipmentCode, setSearchShipmentCode] = useState("");
  const [searchCustomerCode, setSearchCustomerCode] = useState("");

  // Applied filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterShipmentCode, setFilterShipmentCode] = useState("");
  const [filterCustomerCode, setFilterCustomerCode] = useState("");

  // Image modal
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageUrl: "",
    linkData: null,
  });

  const abortControllerRef = useRef(null);

  const fetchOrders = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const apiFilters = {};
      if (filterStatus) apiFilters.status = filterStatus;
      if (filterShipmentCode.trim())
        apiFilters.shipmentCode = filterShipmentCode.trim();
      if (filterCustomerCode.trim())
        apiFilters.customerCode = filterCustomerCode.trim();

      const response = await domesticService.getWarehouseLinkOrders(
        page,
        pageSize,
        apiFilters,
        abortControllerRef.current.signal
      );

      if (!abortControllerRef.current.signal.aborted) {
        setOrders(response.content || []);
        setTotalElements(response.totalElements || 0);
      }
    } catch (err) {
      if (err.name === "AbortError" || err.code === "ERR_CANCELED") return;
      console.error("Error loading orders:", err);
      setError(err.response?.data?.message || "Lỗi khi tải dữ liệu!");
      setOrders([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterStatus, filterShipmentCode, filterCustomerCode]);

  useEffect(() => {
    fetchOrders();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchOrders]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalElements / pageSize)),
    [totalElements, pageSize]
  );

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(0);
  };

  const handleSearch = () => {
    setFilterStatus(searchStatus);
    setFilterShipmentCode(searchShipmentCode.trim());
    setFilterCustomerCode(searchCustomerCode.trim());
    setPage(0);
  };

  const handleFirstPage = () => setPage(0);
  const handlePrevPage = () => setPage((p) => Math.max(0, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages - 1, p + 1));
  const handleLastPage = () => setPage(totalPages - 1);

  const showingFrom = totalElements ? page * pageSize + 1 : 0;
  const showingTo = Math.min((page + 1) * pageSize, totalElements);

  const openImageModal = useCallback((imageUrl, linkData) => {
    setImageModal({ isOpen: true, imageUrl, linkData });
  }, []);

  const closeImageModal = useCallback(() => {
    setImageModal({ isOpen: false, imageUrl: "", linkData: null });
  }, []);

  // Statistics calculations
  const statistics = useMemo(() => {
    const totalLinks = orders.reduce(
      (sum, order) => sum + (order.orderLinks?.length || 0),
      0
    );
    const totalWeight = orders.reduce(
      (sum, order) => sum + (order.netWeight || 0),
      0
    );
    return { totalOrders: totalElements, totalLinks, totalWeight };
  }, [orders, totalElements]);

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

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <PlaneTakeoff size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Tổng Kiện Đang Vận Chuyển
              </h1>
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              Tải lại
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 mb-6">
            <X className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {loading ? (
            <>
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
                      {statistics.totalOrders}
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
                      Tổng Order Links
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {statistics.totalLinks}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <PackageOpen className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng Trọng Lượng
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {statistics.totalWeight.toFixed(2)} kg
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Weight className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filter & Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Inputs */}
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Status Select */}
              <div className="flex-1">
                <select
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shipment Code */}
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã vận đơn ..."
                    value={searchShipmentCode}
                    onChange={(e) => setSearchShipmentCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchShipmentCode && (
                    <button
                      onClick={() => setSearchShipmentCode("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Code */}
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã khách hàng ..."
                    value={searchCustomerCode}
                    onChange={(e) => setSearchCustomerCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchCustomerCode && (
                    <button
                      onClick={() => setSearchCustomerCode("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap h-full"
                  type="button"
                >
                  <Search size={18} />
                  Tìm kiếm
                </button>
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
          {loading ? (
            <TableSkeleton rows={10} />
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <Truck className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">Không có đơn hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Chi Tiết Sản Phẩm
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã Đơn Hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Khách Hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã KH
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Nhân Viên
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Trọng Lượng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Số Sản Phẩm
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          {order.orderLinks?.map((link, linkIdx) => (
                            <div
                              key={link.id || linkIdx}
                              className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200"
                            >
                              {/* Image Thumbnail */}
                              {link.image ? (
                                <button
                                  onClick={() =>
                                    openImageModal(link.image, link)
                                  }
                                  className="relative w-16 h-16 rounded overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all group flex-shrink-0"
                                >
                                  <img
                                    src={link.image}
                                    alt={link.productName || "Product"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src =
                                        "https://via.placeholder.com/64x64?text=No+Image";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs font-bold px-1 py-0.5 rounded">
                                    {linkIdx + 1}
                                  </div>
                                </button>
                              ) : (
                                <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}

                              {/* Link Info */}
                              <div className="flex-1 min-w-0 text-xs space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-900">
                                    Sản phẩm:
                                  </span>
                                  <span className="font-medium text-gray-900 truncate">
                                    {link.productName || "-"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-xl text-gray-800">
                                    Mã Vận Đơn:
                                  </span>
                                  <span className="font-medium text-xl text-blue-700">
                                    {link.shipmentCode || "-"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-900">TT:</span>
                                  <span
                                    className={`inline-block px-1.5 py-0.5 text-xs font-medium rounded border ${getStatusBadgeClass(
                                      link.status
                                    )}`}
                                  >
                                    {STATUS_OPTIONS.find(
                                      (s) => s.value === link.status
                                    )?.label || link.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-gray-900">
                                  <span>
                                    {" "}
                                    {link.length && link.width && link.height
                                      ? `${link.length}×${link.width}×${link.height}`
                                      : "-"}
                                  </span>
                                  <span className="text-blue-600 text-xl font-semibold">
                                    {" "}
                                    {link.weight
                                      ? Math.max(link.weight).toFixed(3)
                                      : "-"}{" "}
                                    kg
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-semibold text-blue-700 whitespace-nowrap">
                          {order.orderCode || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900 whitespace-nowrap">
                          {order.customerName || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900 whitespace-nowrap">
                          {order.customerCode || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900 whitespace-nowrap">
                          {order.staffName || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900 whitespace-nowrap">
                          {order.netWeight?.toFixed(2) || "0.00"} kg
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
                          {order.orderLinks?.length || 0} sản phẩm
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && !loading && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
              <div className="px-6 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Info */}
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
                    đơn hàng
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFirstPage}
                      disabled={page === 0}
                      className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Trang đầu"
                      type="button"
                    >
                      <ChevronsLeft size={18} className="text-gray-700" />
                    </button>

                    <button
                      onClick={handlePrevPage}
                      disabled={page === 0}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      type="button"
                    >
                      <ChevronLeft size={18} className="text-gray-700" />
                      <span className="text-sm font-medium text-gray-700">
                        Trước
                      </span>
                    </button>

                    <div className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                      <span className="text-sm font-semibold">
                        {page + 1} / {totalPages}
                      </span>
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={page >= totalPages - 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      type="button"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        Sau
                      </span>
                      <ChevronRight size={18} className="text-gray-700" />
                    </button>

                    <button
                      onClick={handleLastPage}
                      disabled={page >= totalPages - 1}
                      className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Trang cuối"
                      type="button"
                    >
                      <ChevronsRight size={18} className="text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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
