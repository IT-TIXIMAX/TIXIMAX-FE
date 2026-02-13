import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  Wallet,
  Weight,
  DollarSign,
  Search,
  X,
  BarChart3,
  Calendar,
  ArrowLeft,
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
  <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
    <div className="p-5 md:p-6 bg-gradient-to-br from-gray-200 to-gray-300">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 bg-gray-300 rounded" />
        <div className="h-10 w-10 bg-gray-300 rounded-lg" />
      </div>
      <div className="h-10 md:h-12 w-32 bg-gray-300 rounded" />
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

/* ===================== SummaryCard ===================== */
const SummaryCard = ({
  icon: Icon,
  label,
  value,
  unit,
  iconColor,
  bgGradient,
}) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden min-h-[150px]">
    <div className={`p-5 md:p-6 bg-gradient-to-br ${bgGradient} h-full`}>
      <div className="flex items-center justify-between mb-4 min-w-0">
        <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
          {label}
        </span>
        <div className={`p-2.5 rounded-lg ${iconColor} shrink-0`}>
          <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </div>
      </div>
      <div className="flex items-baseline gap-2 min-w-0 mb-1">
        <span className="text-2xl md:text-3xl font-bold text-gray-900 leading-none break-words tabular-nums">
          {value}
        </span>
      </div>
      {unit && (
        <div className="text-xs md:text-sm text-black font-medium">{unit}</div>
      )}
    </div>
  </div>
);

/* ===================== Main Component ===================== */
const PerformancesCustomer = () => {
  const navigate = useNavigate();
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
    return {
      total: customerList.length,
      avgWeight: totalWeight / customerList.length,
      totalOrders,
      totalBalance,
    };
  }, [customerList]);

  const getFilterLabel = () =>
    FILTER_TYPES.find((f) => f.value === selectedFilter)?.label || "Tất cả";

  const showingFrom = customerList.length > 0 ? currentPage * pageSize + 1 : 0;
  const showingTo = currentPage * pageSize + customerList.length;

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* ✅ Header - Blue Gradient + Glassmorphism (chuẩn DashboardKPI) */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-lg border border-blue-500 p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(-1)}
                type="button"
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
                title="Quay lại"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Thống Kê Hiệu Suất Khách Hàng
                </h1>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {FILTER_TYPES.map((filter) => {
                    const Icon = filter.icon;
                    const active = selectedFilter === filter.value;
                    return (
                      <button
                        key={filter.value || "all"}
                        onClick={() => handleFilterChange(filter.value)}
                        disabled={loading}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                          active
                            ? "bg-white text-blue-700 shadow-lg scale-105"
                            : "bg-white/20 text-white hover:bg-white/30 hover:shadow-md backdrop-blur-sm"
                        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Icon size={16} />
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
                {/* Status badges */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                    <Calendar className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white whitespace-nowrap">
                      {getFilterLabel()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                    <span className="text-sm font-semibold text-white whitespace-nowrap">
                      Trang {currentPage + 1}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Summary Cards */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
            Tổng quan
          </h3>
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <SummaryCard
                  icon={Users}
                  label="Tổng khách hàng"
                  value={stats.total}
                  unit="Đang hiển thị"
                  iconColor="bg-purple-500"
                  bgGradient="from-yellow-200 to-yellow-300"
                />
                <SummaryCard
                  icon={Weight}
                  label="TB Cân nặng"
                  value={`${stats.avgWeight.toFixed(1)}`}
                  unit="Kilogram"
                  iconColor="bg-red-500"
                  bgGradient="from-red-200 to-red-300"
                />
                <SummaryCard
                  icon={Package}
                  label="Tổng đơn hàng"
                  value={stats.totalOrders}
                  unit="Đơn hàng"
                  iconColor="bg-green-600"
                  bgGradient="from-green-200 to-green-300"
                />
                <SummaryCard
                  icon={Wallet}
                  label="Tổng số dư"
                  value={formatMoney(stats.totalBalance)}
                  unit="Số dư tích lũy"
                  iconColor="bg-blue-600"
                  bgGradient="from-blue-200 to-blue-300"
                />
              </>
            )}
          </div>
        </div>

        {/* ✅ Search & Page Size */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
            Tìm kiếm & Hiển thị
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 relative">
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
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
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
                <button
                  onClick={handleApplySearch}
                  disabled={loading}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                >
                  <Search size={18} />
                  Tìm kiếm
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                  Hiển thị:
                </span>
                <div className="flex gap-2">
                  {PAGE_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => handlePageSizeChange(size)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        pageSize === size
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-800 mb-1">
                  Có lỗi xảy ra
                </h3>
                <p className="text-sm text-red-700">{error}</p>
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
                  className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? "Đang tải..." : "Thử lại"}
                </button>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-red-100 rounded"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        )}

        {/* ✅ Table */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
            Danh sách khách hàng
          </h3>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {loading ? (
              <TableSkeleton rows={Math.min(pageSize, 10)} />
            ) : customerList.length === 0 ? (
              <div className="p-10 md:p-12 text-center">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-base md:text-lg font-bold text-gray-800 mb-2">
                  Không tìm thấy khách hàng
                </p>
                <p className="text-sm text-gray-600">
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
                        {[
                          "#",
                          "Khách Hàng",
                          "Liên Hệ",
                          "Đơn Hàng",
                          "Cân Nặng",
                          "Giá Trị",
                          "Số Dư",
                        ].map((h, i) => (
                          <th
                            key={h}
                            className={`px-3 md:px-4 py-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap ${i >= 3 ? "text-right" : "text-left"}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {customerList.map((customer, index) => {
                        const rankColors = [
                          "from-yellow-400 to-yellow-600",
                          "from-gray-300 to-gray-500",
                          "from-orange-400 to-orange-600",
                        ];
                        const actualRank = currentPage * pageSize + index + 1;
                        return (
                          <tr
                            key={customer.accountId || index}
                            className="hover:bg-blue-50 transition-colors"
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
                                  <div className="text-sm font-bold text-gray-900">
                                    {customer?.customerName || "—"}
                                  </div>
                                  <div className="text-xs font-semibold text-blue-600">
                                    {customer?.customerCode || "—"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 md:px-4 py-3">
                              <div className="space-y-1">
                                {customer?.phone && (
                                  <div className="text-xs font-semibold text-gray-700">
                                    {customer.phone}
                                  </div>
                                )}
                                {customer?.email && (
                                  <div className="text-xs font-semibold text-gray-700 truncate max-w-[150px]">
                                    {customer.email}
                                  </div>
                                )}
                                {!customer?.phone && !customer?.email && (
                                  <span className="text-xs text-gray-500">
                                    —
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 md:px-4 py-3 text-right">
                              <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold border border-green-300">
                                {customer?.totalOrders || 0}
                              </span>
                            </td>
                            <td className="px-3 md:px-4 py-3 text-right">
                              <span className="text-sm font-bold text-gray-900 tabular-nums">
                                {formatWeight(customer?.totalWeight)}
                              </span>
                            </td>
                            <td className="px-3 md:px-4 py-3 text-right">
                              <span className="text-sm font-bold text-green-600 tabular-nums">
                                {formatMoney(customer?.totalAmount)}
                              </span>
                            </td>
                            <td className="px-3 md:px-4 py-3 text-right">
                              <span className="text-sm font-bold text-purple-600 tabular-nums">
                                {formatMoney(customer?.balance)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Hiển thị{" "}
                      <span className="font-bold text-gray-900">
                        {showingFrom}
                      </span>{" "}
                      -{" "}
                      <span className="font-bold text-gray-900">
                        {showingTo}
                      </span>{" "}
                      khách hàng
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(0)}
                        disabled={currentPage === 0 || loading}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        type="button"
                      >
                        Đầu
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0 || loading}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        type="button"
                      >
                        Trước
                      </button>
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">
                        Trang {currentPage + 1}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNextPage || loading}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
    </div>
  );
};

export default PerformancesCustomer;
