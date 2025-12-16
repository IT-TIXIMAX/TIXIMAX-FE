import React, { useState, useEffect } from "react";
import {
  Search,
  Warehouse,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RefreshCw,
  Eye,
  ImageIcon,
  Edit,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import warehouseService from "../../Services/Warehouse/warehouseService";
import DetailWarehouse from "../Warehouse/DetailWarehouse";
import UpdateWarehouse from "./UpdateWarehouse";

const WarehouseList = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateData, setUpdateData] = useState(null);

  useEffect(() => {
    fetchWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const fetchWarehouses = async (term = "") => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = term.trim() ? { trackingCode: term.trim() } : {};

      const data = await warehouseService.getReadyWarehouses(
        currentPage,
        pageSize,
        searchParams
      );

      setWarehouses(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Error loading data!";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    fetchWarehouses(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(0);
    fetchWarehouses("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  };

  const changePageSize = (e) => {
    setPageSize(parseInt(e.target.value, 10));
    setCurrentPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const openDetail = (id) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailId(null);
  };

  const openUpdate = (item) => {
    setUpdateData(item);
    setUpdateOpen(true);
  };

  const closeUpdate = () => {
    setUpdateOpen(false);
    setUpdateData(null);
  };

  const handleUpdateSuccess = () => {
    toast.success("Cập nhật thành công!");
    fetchWarehouses(searchTerm);
  };

  const openImagePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  // Loading Skeleton Component
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
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Image
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Shipment Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Order Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Customer Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Weight
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Net Weight
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Dimension
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
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
                  <div className="flex justify-center">
                    <div className="w-14 h-14 bg-gray-200 rounded-lg"></div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-7 bg-gray-200 rounded-lg w-16"></div>
                    <div className="h-7 bg-gray-200 rounded-lg w-16"></div>
                  </div>
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

  return (
    <div className="p-6 min-h-screen">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Warehouse size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-semibold text-white">
              Warehouse Management
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
            <div className="flex-1 relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by shipment code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-8 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={handleSearch}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>

            <select
              value={pageSize}
              onChange={changePageSize}
              disabled={loading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
              <option value={200}>200 / page</option>
            </select>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && <TableSkeleton />}

        {/* Empty State */}
        {!loading && !error && warehouses.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <Warehouse size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              No data
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? `No results found for "${searchTerm}"`
                : "There are no items in the warehouse yet."}
            </p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && warehouses.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-3 bg-blue-200 border-b border-blue-100">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-black-900">
                  Total: {warehouses.length} items
                </span>
                <span className="text-blue-700">
                  Page {currentPage + 1} / {totalPages}
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
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Shipment Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Order Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Customer Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Weight
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Net Weight
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Dimension
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {warehouses.map((item, index) => (
                    <tr
                      key={item.warehouseId ?? `${item.trackingCode}-${index}`}
                      className="hover:bg-blue-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-900">
                        {currentPage * pageSize + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.trackingCode}
                              onClick={() => openImagePreview(item.image)}
                              className="w-14 h-14 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                              <ImageIcon size={22} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900 font-medium">
                        {item.destination || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {item.trackingCode}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.orderCode || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {item.customerCode || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {item.weight} kg
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {item.netWeight} kg
                      </td>
                      <td className="px-4 py-3 text-gray-900">{item.dim} kg</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetail(item.warehouseId)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                          >
                            <Eye size={14} />
                            View
                          </button>
                          <button
                            onClick={() => openUpdate(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                          >
                            <Edit size={14} />
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white border-t border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={prevPage}
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
                  onClick={nextPage}
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

      {/* Detail Modal */}
      <DetailWarehouse
        open={detailOpen}
        warehouseId={detailId}
        onClose={closeDetail}
      />

      {/* Update Modal */}
      <UpdateWarehouse
        isOpen={updateOpen}
        onClose={closeUpdate}
        warehouseData={updateData}
        onSuccess={handleUpdateSuccess}
      />

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={closeImagePreview}
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
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border-4 border-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseList;
