import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Package, TruckIcon, X, RefreshCw } from "lucide-react";
import DomesticService from "../../Services/Warehouse/domesticService";

const PAGE_SIZES = [50, 100, 200];

const getShipmentCodes = (d) => {
  const codes = d?.shipmemtCode ?? d?.shipmentCode ?? d?.shippingList ?? [];
  return Array.isArray(codes) ? codes : [];
};

const getAddress = (d) => d?.address ?? d?.toAddress ?? d?.to ?? "-";

/* ===================== Loading Skeletons ===================== */
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
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-36 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 flex-1 bg-gray-200 rounded hidden md:block" />
            <div className="h-9 w-28 bg-gray-200 rounded-lg" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="h-8 w-24 bg-gray-200 rounded-lg" />
            <div className="h-8 w-28 bg-gray-200 rounded-lg" />
            <div className="h-8 w-20 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PendingWarehouse = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // Paging server-side
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Fetch với search từ server
  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);

      const params = { status: "CHUA_DU_DIEU_KIEN" };
      const keyword = activeSearch.trim();
      if (keyword) params.customerCode = keyword;

      const res = await DomesticService.getDeliveryList(page, pageSize, params);

      setDeliveries(res?.content ?? []);
      setTotalPages(res?.totalPages ?? 0);
      setTotalElements(res?.totalElements ?? 0);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeSearch]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // Handle search
  const handleSearch = useCallback(() => {
    const v = searchInput.trim();
    setActiveSearch(v);
    setPage(0);
  }, [searchInput]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setActiveSearch("");
    setPage(0);
  }, []);

  // Page size change
  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(0);
  }, []);

  // Stats
  const totalShipments = useMemo(() => {
    return deliveries.reduce((sum, d) => sum + getShipmentCodes(d).length, 0);
  }, [deliveries]);

  const showingFrom = totalElements ? page * pageSize + 1 : 0;
  const showingTo = totalElements
    ? Math.min((page + 1) * pageSize, totalElements)
    : 0;

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TruckIcon size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                ĐH Chưa Thanh Toán Vận Chuyển
              </h1>
            </div>

            {/* Right: Reload Button */}
            <button
              onClick={fetchDeliveries}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              Tải lại
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                      {totalElements}
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
                      Tổng Kiện Hàng
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {totalShipments}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Package className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Đang Hiển Thị
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {deliveries.length}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TruckIcon className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            {/* Search Input */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã khách hàng ..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchInput && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  type="button"
                >
                  {loading ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                  {loading ? "Đang tìm..." : "Tìm kiếm"}
                </button>
              </div>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Hiển thị:
              </span>
              <div className="flex gap-2">
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handlePageSizeChange(size)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pageSize === size
                        ? "bg-blue-600 text-white"
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
            // Loading Skeleton
            <TableSkeleton rows={10} />
          ) : deliveries.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-700 font-semibold">
                Không có đơn hàng nào
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {activeSearch
                  ? "Không tìm thấy kết quả phù hợp."
                  : "Hiện tại không có đơn hàng nào."}
              </p>
              {activeSearch && (
                <button
                  onClick={handleClearSearch}
                  className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã KH
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Thông Tin KH
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Địa Chỉ
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Nhân Viên
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Số Đơn
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Danh sách mã vận đơn
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {deliveries.map((d, index) => {
                    const shipmentCodes = getShipmentCodes(d);
                    const address = getAddress(d);

                    return (
                      <tr
                        key={`${d?.customerCode ?? "x"}-${index}`}
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-4 align-top">
                          <span className="font-semibold text-blue-700 whitespace-nowrap">
                            {d?.customerCode || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {d?.customerName || "-"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700 whitespace-nowrap">
                                {d?.phoneNumber || "Chưa có"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="flex items-start gap-2">
                            <span className="text-sm text-gray-700">
                              {address}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium whitespace-nowrap">
                            {d?.staffName || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center align-top">
                          <span className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 bg-blue-100 text-blue-700 rounded-lg font-bold text-sm">
                            {shipmentCodes.length}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-top">
                          {shipmentCodes.length === 0 ? (
                            <span className="text-sm text-gray-500">-</span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {shipmentCodes.map((code, idx) => (
                                <div
                                  key={`${code}-${idx}`}
                                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg border border-blue-200"
                                >
                                  <span className="text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded-full font-semibold min-w-[20px] text-center">
                                    {idx + 1}
                                  </span>
                                  <span className="text-sm font-mono text-gray-800">
                                    {code}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
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
                  đơn hàng
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Đầu
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Sau
                  </button>
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
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

        {/* Footer Navigation */}
        {totalPages > 1 && !loading && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-white">
                  <span className="font-bold">{totalPages}</span> • Hiển thị{" "}
                  <span className="font-bold">
                    {showingFrom}-{showingTo}
                  </span>{" "}
                  / {totalElements} đơn hàng
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Đầu
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    ← Trước
                  </button>
                  <span className="px-4 py-2 bg-white text-blue-700 rounded-lg text-sm font-bold">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Sau →
                  </button>
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Cuối
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingWarehouse;
