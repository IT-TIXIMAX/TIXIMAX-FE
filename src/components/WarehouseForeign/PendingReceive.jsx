import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  PackageSearch,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  RefreshCw,
  ZoomIn,
  Image as ImageIcon,
} from "lucide-react";
import warehouseService from "../../Services/Warehouse/warehouseService";

const STATUS_BADGES = {
  DA_MUA: {
    label: "Purchased",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  KY_GUI: {
    label: "Consignment",
    className: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  DEFAULT: {
    label: "Other",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

const PAGE_SIZES = [50, 100, 200];

/* ===================== Skeletons ===================== */
const TableSkeleton = ({ rows = 8 }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="h-12 bg-gray-100 border-b border-gray-200 animate-pulse" />
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="p-4 flex gap-4 animate-pulse">
          <div className="w-14 h-14 bg-gray-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-3 w-72 bg-gray-200 rounded" />
            <div className="h-3 w-56 bg-gray-200 rounded" />
          </div>
          <div className="w-40 space-y-2">
            <div className="h-8 bg-gray-200 rounded-lg" />
            <div className="h-8 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
    <div className="h-14 bg-gray-50 border-t border-gray-200 animate-pulse" />
  </div>
);

/* ===================== Image Modal ===================== */
const ImageModal = React.memo(({ isOpen, onClose, imageUrl, title, sub }) => {
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
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
        className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <ZoomIn className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {title || "Xem ảnh"}
              </h3>
              {sub ? (
                <p className="text-xs text-gray-500 truncate">{sub}</p>
              ) : null}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={title || "Preview"}
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
        </div>
      </div>
    </div>
  );
});
ImageModal.displayName = "ImageModal";

/* ===================== Row ===================== */
const TableRow = React.memo(({ row, idx, page, size, onPreview }) => {
  const badge = STATUS_BADGES[row.status] || STATUS_BADGES.DEFAULT;
  const [imageError, setImageError] = useState(false);

  const handlePreview = () => {
    if (!row.image || imageError) return;
    onPreview?.({
      isOpen: true,
      url: row.image,
      title: row.productName,
      sub: `${row.orderCode || "-"} • ${row.customerCode || "-"}`,
    });
  };

  return (
    <tr
      className={`border-b border-gray-200 ${
        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
      }`}
    >
      <td className="px-4 py-4 text-gray-900 font-medium whitespace-nowrap">
        {idx + 1 + page * size}
      </td>

      <td className="px-4 py-4">
        <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 font-mono text-xs font-semibold border border-gray-200">
          {row.customerCode || "-"}
        </span>
      </td>

      <td className="px-4 py-4">
        <span className="font-mono text-xs font-semibold text-blue-700 whitespace-nowrap">
          {row.orderCode || "-"}
        </span>
      </td>

      <td className="px-4 py-4">
        <span className="text-sm text-gray-900 font-medium line-clamp-2">
          {row.productName || "-"}
        </span>
      </td>

      <td className="px-4 py-4">
        {row.image && !imageError ? (
          <button
            onClick={handlePreview}
            className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-blue-500 transition-all group"
            type="button"
            title="Xem ảnh"
          >
            <img
              src={row.image}
              alt={row.productName || "Product"}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ) : (
          <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
            <ImageIcon size={20} className="text-gray-400" />
          </div>
        )}
      </td>

      <td className="px-4 py-4">
        {row.shipmentcode ? (
          <span className="font-mono text-xs font-semibold text-gray-800 whitespace-nowrap">
            {row.shipmentcode}
          </span>
        ) : (
          <span className="text-xs text-gray-400 italic">-</span>
        )}
      </td>

      <td className="px-4 py-4">
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${badge.className}`}
        >
          {badge.label}
        </span>
      </td>
    </tr>
  );
});
TableRow.displayName = "TableRow";

/* ===================== Main ===================== */
const PendingReceive = () => {
  const [rows, setRows] = useState([]);

  // input (chưa apply)
  const [filters, setFilters] = useState({
    shipmentCode: "",
    customerCode: "",
  });
  // filter (đã apply)
  const [appliedFilters, setAppliedFilters] = useState({
    shipmentCode: "",
    customerCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Image modal
  const [preview, setPreview] = useState({
    isOpen: false,
    url: "",
    title: "",
    sub: "",
  });

  const closePreview = useCallback(
    () => setPreview({ isOpen: false, url: "", title: "", sub: "" }),
    [],
  );

  const fetchData = useCallback(
    async (pageIndex = 0, pageSize = size, searchFilters = appliedFilters) => {
      try {
        setLoading(true);
        setError(null);

        const data = await warehouseService.getWarehouseForeignLinks(
          pageIndex,
          pageSize,
          {
            shipmentCode: (searchFilters.shipmentCode || "").trim(),
            customerCode: (searchFilters.customerCode || "").trim(),
          },
        );

        const list = Array.isArray(data) ? data : data?.content || [];

        const flattened = [];
        list.forEach((order) => {
          (order.orderLinks || []).forEach((link) => {
            flattened.push({
              customerCode: order.customerCode,
              orderId: order.orderId,
              orderCode: order.orderCode,
              linkId: link.linkId,
              productName: link.productName,
              image: link.image,
              status: link.status,
              shipmentcode: link.shipmentcode || "",
            });
          });
        });

        setRows(flattened);
        setPage(pageIndex);
        setTotalPages(data?.totalPages || 1);
        setTotalElements(data?.totalElements || flattened.length);
      } catch (err) {
        console.error("Error fetching foreign warehouse links:", err);
        const errorMsg =
          err.response?.data?.message ||
          "Unable to load data. Please try again.";
        setError(errorMsg);
        setRows([]);
        setTotalPages(1);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    },
    [size, appliedFilters],
  );

  // load theo size
  useEffect(() => {
    fetchData(0, size, appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSearch = useCallback(() => {
    const next = {
      shipmentCode: (filters.shipmentCode || "").trim(),
      customerCode: (filters.customerCode || "").trim(),
    };
    setAppliedFilters(next);
    setPage(0);
    fetchData(0, size, next);
  }, [filters, size, fetchData]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch],
  );

  const clearFieldAndRefetch = useCallback(
    (field) => {
      // 1) clear input
      setFilters((prev) => ({ ...prev, [field]: "" }));

      // 2) nếu field đang apply thì bỏ apply và fetch lại
      if (appliedFilters[field]) {
        const nextApplied = { ...appliedFilters, [field]: "" };
        setAppliedFilters(nextApplied);
        setPage(0);
        fetchData(0, size, nextApplied);
      }
    },
    [appliedFilters, fetchData, size],
  );

  const totalDisplay = useMemo(
    () => totalElements || rows.length,
    [totalElements, rows.length],
  );

  const showingFrom = totalDisplay ? page * size + 1 : 0;
  const showingTo = Math.min((page + 1) * size, totalDisplay);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <PackageSearch size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Overseas Pending Receipt
              </h1>
            </div>

            <button
              onClick={() => fetchData(page, size, appliedFilters)}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              type="button"
            >
              <RefreshCw size={16} />
              Tải lại
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 mb-6">
            <X className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Customer Code */}
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by Customer code..."
                    value={filters.customerCode}
                    onChange={(e) =>
                      handleFilterChange("customerCode", e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {filters.customerCode && (
                    <button
                      onClick={() => clearFieldAndRefetch("customerCode")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                      title="Xóa"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
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
                    placeholder="Search by shipment code..."
                    value={filters.shipmentCode}
                    onChange={(e) =>
                      handleFilterChange("shipmentCode", e.target.value)
                    }
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {filters.shipmentCode && (
                    <button
                      onClick={() => clearFieldAndRefetch("shipmentCode")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                      title="Xóa"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                type="button"
              >
                <Search size={18} />
                Search
              </button>
            </div>

            {/* Page size buttons */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Show:
              </span>
              <div className="flex gap-2 flex-wrap">
                {PAGE_SIZES.map((ps) => (
                  <button
                    key={ps}
                    onClick={() => {
                      setSize(ps);
                      setPage(0);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      size === ps
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    type="button"
                    disabled={loading}
                  >
                    {ps}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && <TableSkeleton rows={8} />}

        {/* Empty */}
        {!loading && !error && rows.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <PackageSearch className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600 font-medium">
              {appliedFilters.customerCode || appliedFilters.shipmentCode
                ? "Không có kết quả với bộ lọc hiện tại"
                : "Không có dữ liệu chờ nhận"}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && rows.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      No.
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Customer Code
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Order Code
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Product Name
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Image
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Shipment
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, idx) => (
                    <TableRow
                      key={`${row.orderId}-${row.linkId}-${idx}`}
                      row={row}
                      idx={idx}
                      page={page}
                      size={size}
                      onPreview={setPreview}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <div className="px-6 py-4">
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
                        {totalDisplay}
                      </span>{" "}
                      sản phẩm
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchData(0, size)}
                        disabled={!canPrev || loading}
                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Trang đầu"
                        type="button"
                      >
                        <ChevronsLeft size={18} className="text-gray-700" />
                      </button>

                      <button
                        onClick={() => fetchData(page - 1, size)}
                        disabled={!canPrev || loading}
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
                        onClick={() => fetchData(page + 1, size)}
                        disabled={!canNext || loading}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        type="button"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          Sau
                        </span>
                        <ChevronRight size={18} className="text-gray-700" />
                      </button>

                      <button
                        onClick={() => fetchData(totalPages - 1, size)}
                        disabled={!canNext || loading}
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
        )}

        {/* Image Modal */}
        <ImageModal
          isOpen={preview.isOpen}
          onClose={closePreview}
          imageUrl={preview.url}
          title={preview.title}
          sub={preview.sub}
        />
      </div>
    </div>
  );
};

export default PendingReceive;
