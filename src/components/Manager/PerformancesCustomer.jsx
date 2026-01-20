import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  TrendingUp,
  Package,
  Wallet,
  Weight,
  DollarSign,
  RefreshCw,
  Search,
  X,
  Phone,
  Mail,
} from "lucide-react";
import dashboardService from "../../Services/Dashboard/dashboardService";

const PAGE_SIZES = [100, 200, 500, 1000];

const FILTER_TYPES = [
  { value: null, label: "Tất cả", icon: Users },
  { value: "TOTAL_AMOUNT", label: "Giá trị cao", icon: DollarSign },
  { value: "TOTAL_WEIGHT", label: "Cân nặng cao", icon: Weight },
  { value: "TOTAL_ORDERS", label: "Đơn hàng nhiều", icon: Package },
  { value: "BALANCE", label: "Số dư cao", icon: Wallet },
];

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
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-20 bg-gray-200 rounded hidden md:block" />
            <div className="h-4 w-16 bg-gray-200 rounded hidden lg:block" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ===================== Format helpers ===================== */
const formatWeight = (w) => {
  const n = Number(w);
  if (!Number.isFinite(n)) return "0 kg";
  return `${n.toFixed(2)} kg`;
};

const formatMoney = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0 ₫";
  return `${n.toLocaleString("vi-VN")} ₫`;
};

const PerformancesCustomer = () => {
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [selectedFilter, setSelectedFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchTopCustomers = useCallback(
    async (page, size, filterType, customerCode) => {
      setError(null);
      setLoading(true);
      try {
        const filters = {};
        if (filterType) filters.customerTopType = filterType;
        if (customerCode) filters.customerCode = customerCode;

        const res = await dashboardService.getTopCustomers(page, size, filters);

        const content = res?.content || [];
        setCustomerList(content);
        setCurrentPage(page);

        // Nếu số lượng record = pageSize, có thể còn trang tiếp theo
        setHasNextPage(content.length === size);
      } catch (err) {
        setError(err?.message || "Không thể tải danh sách khách hàng");
        setCustomerList([]);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchTopCustomers(0, pageSize, selectedFilter, appliedSearch);
  }, [pageSize, selectedFilter, appliedSearch, fetchTopCustomers]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage < 0 || loading) return;
      if (newPage > currentPage && !hasNextPage) return;

      fetchTopCustomers(newPage, pageSize, selectedFilter, appliedSearch);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [
      currentPage,
      pageSize,
      loading,
      hasNextPage,
      selectedFilter,
      appliedSearch,
      fetchTopCustomers,
    ],
  );

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setCurrentPage(0);
  }, []);

  const handleFilterChange = useCallback((filterValue) => {
    setSelectedFilter(filterValue);
    setCurrentPage(0);
  }, []);

  const handleApplySearch = useCallback(() => {
    const term = (searchInput || "").trim();
    setAppliedSearch(term);
    setCurrentPage(0);
  }, [searchInput]);

  const handleSearchKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleApplySearch();
    },
    [handleApplySearch],
  );

  useEffect(() => {
    if (searchInput === "" && appliedSearch !== "") {
      setAppliedSearch("");
      setCurrentPage(0);
    }
  }, [searchInput, appliedSearch]);

  // Stats tính từ data hiện tại
  const stats = useMemo(() => {
    if (!customerList.length)
      return { total: 0, avgWeight: 0, totalOrders: 0, totalBalance: 0 };

    const totalOrders = customerList.reduce(
      (sum, c) => sum + (c.totalOrders || 0),
      0,
    );
    const totalWeight = customerList.reduce(
      (sum, c) => sum + (c.totalWeight || 0),
      0,
    );
    const totalBalance = customerList.reduce(
      (sum, c) => sum + (c.balance || 0),
      0,
    );
    const avgWeight = totalWeight / customerList.length;

    return {
      total: customerList.length,
      avgWeight,
      totalOrders,
      totalBalance,
    };
  }, [customerList]);

  const showingFrom = customerList.length > 0 ? currentPage * pageSize + 1 : 0;
  const showingTo = currentPage * pageSize + customerList.length;

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 md:h-10 bg-gradient-to-b from-blue-600 to-blue-700 rounded-full"></div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Thống kê hiệu suất khách hàng
              </h1>
            </div>

            <button
              onClick={() =>
                fetchTopCustomers(
                  currentPage,
                  pageSize,
                  selectedFilter,
                  appliedSearch,
                )
              }
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline text-sm">Tải lại</span>
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {FILTER_TYPES.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.value || "all"}
                  onClick={() => handleFilterChange(filter.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    selectedFilter === filter.value
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Tổng KH
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-600">
                      {stats.total}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      TB Cân nặng
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-green-600">
                      {stats.avgWeight.toFixed(1)} kg
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Weight className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Tổng Đơn
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-orange-600">
                      {stats.totalOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Package className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Tổng Số dư
                    </p>
                    <p className="text-lg md:text-xl font-bold text-purple-600">
                      {formatMoney(stats.totalBalance)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Wallet className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm theo mã khách hàng..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  {searchInput && (
                    <button
                      onClick={() => setSearchInput("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleApplySearch}
                disabled={loading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
              >
                <Search size={18} />
                Search
              </button>
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
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Có lỗi xảy ra
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() =>
                      fetchTopCustomers(
                        currentPage,
                        pageSize,
                        selectedFilter,
                        appliedSearch,
                      )
                    }
                    disabled={loading}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? "Đang tải..." : "Thử lại"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <TableSkeleton rows={pageSize} />
          ) : customerList.length === 0 ? (
            <div className="p-10 md:p-12 text-center">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-base md:text-lg font-semibold text-gray-600 mb-2">
                Không tìm thấy khách hàng
              </p>
              <p className="text-sm md:text-base text-gray-500">
                {appliedSearch
                  ? "Không có kết quả phù hợp với từ khóa"
                  : "Chưa có dữ liệu khách hàng"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                        #
                      </th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                        Khách Hàng
                      </th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                        Liên Hệ
                      </th>
                      <th className="px-3 md:px-4 py-3 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                        Đơn Hàng
                      </th>
                      <th className="px-3 md:px-4 py-3 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                        Cân Nặng
                      </th>
                      <th className="px-3 md:px-4 py-3 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                        Giá Trị
                      </th>
                      <th className="px-3 md:px-4 py-3 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                        Số Dư
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {customerList.map((customer, index) => {
                      const rankColors = [
                        "from-yellow-400 to-yellow-600", // Top 1
                        "from-gray-300 to-gray-500", // Top 2
                        "from-orange-400 to-orange-600", // Top 3
                      ];

                      const actualRank = currentPage * pageSize + index + 1;

                      return (
                        <tr
                          key={customer.accountId || index}
                          className={`border-b border-gray-200 transition-all duration-150 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 hover:shadow-sm`}
                        >
                          <td className="px-3 md:px-4 py-3">
                            {actualRank <= 3 && currentPage === 0 ? (
                              <div
                                className={`w-8 h-8 rounded-full bg-gradient-to-br ${rankColors[index]} flex items-center justify-center shadow-md`}
                              >
                                <span className="text-white font-bold text-sm">
                                  {actualRank}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm font-semibold text-gray-600">
                                {actualRank}
                              </span>
                            )}
                          </td>

                          <td className="px-3 md:px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {customer?.customerName
                                    ?.charAt(0)
                                    ?.toUpperCase() || "?"}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {customer?.customerName || "—"}
                                </div>
                                <div className="text-xs font-medium text-blue-600">
                                  {customer?.customerCode || "—"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 md:px-4 py-3">
                            <div className="space-y-1">
                              {customer?.phone && (
                                <div className="flex items-center gap-2 text-xs text-gray-700">
                                  <Phone size={14} className="text-gray-400" />
                                  <span>{customer.phone}</span>
                                </div>
                              )}
                              {customer?.email && (
                                <div className="flex items-center gap-2 text-xs text-gray-700">
                                  <Mail size={14} className="text-gray-400" />
                                  <span className="truncate max-w-[150px]">
                                    {customer.email}
                                  </span>
                                </div>
                              )}
                              {!customer?.phone && !customer?.email && (
                                <span className="text-xs text-gray-500">—</span>
                              )}
                            </div>
                          </td>

                          <td className="px-3 md:px-4 py-3 text-right">
                            <span className="inline-flex items-center px-2.5 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-bold border border-orange-200">
                              {customer?.totalOrders || 0}
                            </span>
                          </td>

                          <td className="px-3 md:px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-gray-800">
                              {formatWeight(customer?.totalWeight)}
                            </span>
                          </td>

                          <td className="px-3 md:px-4 py-3 text-right">
                            <span className="text-sm font-bold text-green-600">
                              {formatMoney(customer?.totalAmount)}
                            </span>
                          </td>

                          <td className="px-3 md:px-4 py-3 text-right">
                            <span className="text-sm font-bold text-purple-600">
                              {formatMoney(customer?.balance)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
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
                    khách hàng
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(0)}
                      disabled={currentPage === 0 || loading}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      type="button"
                    >
                      Đầu
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0 || loading}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      type="button"
                    >
                      Trước
                    </button>
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                      Trang {currentPage + 1}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNextPage || loading}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      type="button"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformancesCustomer;
