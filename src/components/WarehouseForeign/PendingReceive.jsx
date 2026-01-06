import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  PackageSearch,
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  X,
  Image as ImageIcon,
  RefreshCw,
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

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200];

// Loading Skeleton Component - Giống WarehouseList
const TableSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <div className="px-6 py-3 bg-blue-200 border-b border-blue-100">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-blue-300 rounded w-32 animate-pulse"></div>
        <div className="h-4 bg-blue-300 rounded w-24 animate-pulse"></div>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-blue-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              No.
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Order
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Product
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Image
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Shipment
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {[...Array(8)].map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </td>
              <td className="px-4 py-3">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-5 bg-gray-200 rounded-full w-20"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="bg-white border-t border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Table Row Component
const TableRow = React.memo(({ row, index, page, size, onPreview }) => {
  const badge = STATUS_BADGES[row.status] || STATUS_BADGES.DEFAULT;
  const [imageError, setImageError] = useState(false);

  const handlePreview = () => {
    if (!row.image || imageError) return;
    onPreview?.({
      url: row.image,
      title: row.productName,
      sub: `${row.orderCode || ""} • ${row.customerCode || ""}`,
    });
  };

  return (
    <tr className="hover:bg-blue-50/60 transition-colors">
      <td className="px-4 py-3 text-gray-900">{index + 1 + page * size}</td>

      <td className="px-4 py-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-mono text-xs font-semibold border border-gray-200">
          {row.customerCode}
        </span>
      </td>

      <td className="px-4 py-3">
        <span className="font-mono text-xs font-semibold text-blue-600">
          {row.orderCode}
        </span>
      </td>

      <td className="px-4 py-3">
        <span className="text-xs text-gray-900 font-medium line-clamp-2">
          {row.productName}
        </span>
      </td>

      <td className="px-4 py-3">
        {row.image && !imageError ? (
          <img
            src={row.image}
            alt={row.productName}
            className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
            loading="lazy"
            onError={() => setImageError(true)}
            onClick={handlePreview}
          />
        ) : (
          <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
            <ImageIcon size={22} className="text-gray-400" />
          </div>
        )}
      </td>

      <td className="px-4 py-3">
        {row.shipmentcode ? (
          <span className="font-mono text-xs font-semibold text-gray-700">
            {row.shipmentcode}
          </span>
        ) : (
          <span className="text-xs text-gray-400 italic">-</span>
        )}
      </td>

      <td className="px-4 py-3">
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${badge.className}`}
        >
          {badge.label}
        </span>
      </td>
    </tr>
  );
});

TableRow.displayName = "TableRow";

const PendingReceive = () => {
  const [rows, setRows] = useState([]);

  const [filters, setFilters] = useState({
    shipmentCode: "",
    customerCode: "",
  });
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

  // Image preview modal state
  const [preview, setPreview] = useState(null);

  const closePreview = useCallback(() => setPreview(null), []);

  // ESC to close preview
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closePreview();
    };
    if (preview) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [preview, closePreview]);

  const fetchData = useCallback(
    async (pageIndex = 0, pageSize = size, searchFilters = appliedFilters) => {
      try {
        setLoading(true);
        setError(null);

        const data = await warehouseService.getWarehouseForeignLinks(
          pageIndex,
          pageSize,
          {
            shipmentCode: searchFilters.shipmentCode,
            customerCode: searchFilters.customerCode,
          }
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
    [size, appliedFilters]
  );

  useEffect(() => {
    fetchData(0, size, appliedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSearch = useCallback(() => {
    setAppliedFilters(filters);
    setPage(0);
    fetchData(0, size, filters);
  }, [filters, size, fetchData]);

  const handleClearFilter = useCallback((field) => {
    setFilters((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  const nextPage = useCallback(() => {
    if (loading) return;
    if (page < totalPages - 1) {
      fetchData(page + 1, size);
    }
  }, [loading, page, totalPages, size, fetchData]);

  const prevPage = useCallback(() => {
    if (loading) return;
    if (page > 0) {
      fetchData(page - 1, size);
    }
  }, [loading, page, size, fetchData]);

  const handlePageSizeChange = useCallback((newSize) => {
    setSize(newSize);
    setPage(0);
  }, []);

  return (
    <div className="p-6 min-h-screen">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <PackageSearch size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-semibold text-white">
              Overseas Pending Receipt
            </h1>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Customer Code */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Customer Code..."
                value={filters.customerCode}
                onChange={(e) =>
                  handleFilterChange("customerCode", e.target.value)
                }
                onKeyPress={handleKeyPress}
                className="w-full pl-8 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {filters.customerCode && (
                <button
                  onClick={() => handleClearFilter("customerCode")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Shipment Code */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Shipment Code..."
                value={filters.shipmentCode}
                onChange={(e) =>
                  handleFilterChange("shipmentCode", e.target.value)
                }
                onKeyPress={handleKeyPress}
                className="w-full pl-8 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {filters.shipmentCode && (
                <button
                  onClick={() => handleClearFilter("shipmentCode")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>

            <select
              value={size}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
        {loading && <TableSkeleton />}

        {/* Empty State */}
        {!loading && !error && rows.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <PackageSearch size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              No data
            </h3>
            <p className="text-gray-500 text-sm">
              {appliedFilters.customerCode || appliedFilters.shipmentCode
                ? "No results found with current filters"
                : "There are no pending items to display."}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && rows.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-3 bg-blue-200 border-b border-blue-100">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-black-900">
                  Total: {rows.length} items
                </span>
                <span className="text-blue-700">
                  Page {page + 1} / {totalPages}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Shipment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {rows.map((row, idx) => (
                    <TableRow
                      key={`${row.orderId}-${row.linkId}`}
                      row={row}
                      index={idx}
                      page={page}
                      size={size}
                      onPreview={setPreview}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white border-t border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={prevPage}
                  disabled={page === 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    page === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>

                <div className="font-medium text-gray-700">
                  Page {page + 1} / {totalPages}
                </div>

                <button
                  onClick={nextPage}
                  disabled={page >= totalPages - 1}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    page >= totalPages - 1
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

      {/* Image Preview Modal - Giống WarehouseList */}
      {preview?.url && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={closePreview}
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
            <img
              src={preview.url}
              alt={preview.title || "Preview"}
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border-4 border-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingReceive;
