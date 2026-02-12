import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  UserCircle,
  Search,
  Filter,
  Users,
  RefreshCw,
  X,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Weight,
  Wallet,
  UserCheck,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import userService from "../../Services/Manager/userService";
import dashboardService from "../../Services/Dashboard/dashboardService";
import CreateRefund from "./CreateRefund";

const PAGE_SIZES = [100, 200, 500, 1000, 2000];

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
            <div className="h-10 w-10 bg-gray-200 rounded-full" />
            <div className="h-4 w-36 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 flex-1 bg-gray-200 rounded hidden md:block" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ===================== Format helpers ===================== */
const formatWeight = (w) => {
  const n = Number(w);
  if (!Number.isFinite(n) || n === 0) return "0 kg";
  return `${n.toLocaleString("vi-VN")} kg`;
};

const formatMoney = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0 ₫";
  return `${n.toLocaleString("vi-VN")} ₫`;
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("vi-VN");
  } catch {
    return "—";
  }
};

/* ===================== Segment Cards ===================== */
const SEGMENT_COLORS = {
  1: {
    bg: "bg-red-100",
    border: "border-red-200",
    text: "text-red-600",
    label: "Mua 1 lần",
  },
  2: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
    label: "Mua 2 lần",
  },
  3: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
    label: "Mua 3 lần",
  },
  4: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
    label: "Mua 4 lần",
  },
  "5+": {
    bg: "bg-green-100",
    border: "border-green-200",
    text: "text-green-600",
    label: "Mua 5+ lần",
  },
};

const OrderSegmentSection = ({ segments, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
          >
            <div className="h-3 w-16 bg-gray-200 rounded mb-3" />
            <div className="h-7 w-12 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!segments || segments.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {segments.map((seg) => {
        const colors = SEGMENT_COLORS[seg.segment] ?? {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-600",
          label: `Mua ${seg.segment} lần`,
        };
        return (
          <div
            key={seg.segment}
            className={`${colors.bg} ${colors.border} border rounded-xl p-5`}
          >
            <p className={`text-sm font-medium text-gray-600 mb-1`}>
              {colors.label}
            </p>
            <p className={`text-3xl font-bold ${colors.text}`}>
              {seg.customers.toLocaleString("vi-VN")}
            </p>
            <p className="text-2xs font-semibold text-black mt-1">
              {seg.retentionPercent > 0
                ? `Giữ chân ${seg.retentionPercent.toFixed(1)}%`
                : "Chưa có tỷ lệ"}
            </p>
          </div>
        );
      })}
    </div>
  );
};

/* ===================== Main Component ===================== */
const CustomerList = () => {
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  const [openRefundModal, setOpenRefundModal] = useState(false);
  const [refundCustomer, setRefundCustomer] = useState(null);

  const [segments, setSegments] = useState([]);
  const [segmentsLoading, setSegmentsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchSegments = useCallback(async () => {
    setSegmentsLoading(true);
    try {
      const data = await dashboardService.customerOrderSegments();
      setSegments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Không thể tải phân khúc khách hàng:", err);
      setSegments([]);
    } finally {
      setSegmentsLoading(false);
    }
  }, []);

  const fetchMyCustomers = useCallback(async (page, size, term) => {
    setError(null);
    setLoading(true);
    try {
      const res = await userService.getMyCustomers(page, size, term);
      setCustomerList(res?.content || []);
      setTotalElements(res?.totalElements || 0);
      setTotalPages(res?.totalPages || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách khách hàng của bạn");
      setCustomerList([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCustomers(0, pageSize, appliedSearch);
  }, [pageSize, appliedSearch, fetchMyCustomers]);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 0 && newPage < totalPages && !loading) {
        fetchMyCustomers(newPage, pageSize, appliedSearch);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages, pageSize, loading, fetchMyCustomers, appliedSearch],
  );

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
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

  const getSourceColor = useCallback((source) => {
    const colorMap = {
      Facebook: "bg-blue-100 text-blue-800",
      Zalo: "bg-cyan-100 text-cyan-800",
      Website: "bg-indigo-100 text-indigo-800",
      "Giới thiệu": "bg-sky-100 text-sky-800",
    };
    if (!source || source.trim() === "") return "bg-gray-100 text-gray-800";
    return colorMap[source] || "bg-gray-100 text-gray-800";
  }, []);

  const EMPTY_SOURCE_VALUE = "__EMPTY__";
  const getSourceLabel = (value) => {
    if (!value || value === EMPTY_SOURCE_VALUE) return "(Trống)";
    return value;
  };

  const showingFrom = totalElements ? currentPage * pageSize + 1 : 0;
  const showingTo = Math.min((currentPage + 1) * pageSize, totalElements);

  const sourceStats = useMemo(() => {
    const stats = {};
    customerList.forEach((c) => {
      const source = c?.source || "__EMPTY__";
      stats[source] = (stats[source] || 0) + 1;
    });
    return stats;
  }, [customerList]);

  const closeModal = useCallback(() => {
    setOpenDetailModal(false);
    setSelectedCustomer(null);
    setDetailLoading(false);
  }, []);

  const handleOpenRefund = useCallback((customer) => {
    setRefundCustomer(customer);
    setOpenRefundModal(true);
  }, []);

  const handleRefundSuccess = useCallback(
    (res) => {
      const newBalance =
        res?.balance ??
        res?.newBalance ??
        res?.data?.balance ??
        res?.data?.newBalance;

      if (refundCustomer?.accountId && newBalance !== undefined) {
        setCustomerList((prev) =>
          prev.map((c) =>
            c?.accountId === refundCustomer.accountId
              ? { ...c, balance: newBalance }
              : c,
          ),
        );
        setSelectedCustomer((prev) =>
          prev?.accountId === refundCustomer.accountId
            ? { ...prev, balance: newBalance }
            : prev,
        );
      } else {
        fetchMyCustomers(currentPage, pageSize, appliedSearch);
      }
    },
    [refundCustomer, fetchMyCustomers, currentPage, pageSize, appliedSearch],
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Users size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Danh Sách Khách Hàng
              </h1>
            </div>
            <button
              onClick={() => {
                fetchMyCustomers(currentPage, pageSize, appliedSearch);
                fetchSegments();
              }}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              type="button"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Tải lại
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {loading ? (
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
                      Tổng Khách Hàng
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {totalElements}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Facebook
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {sourceStats.Facebook || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <UserCircle className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Zalo
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {sourceStats.Zalo || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <UserCircle className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Đang Hiển Thị
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {customerList.length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Filter className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Segment Cards */}
        <OrderSegmentSection segments={segments} loading={segmentsLoading} />

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
                    placeholder="Tìm kiếm tên, sđt, email, mã khách hàng..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchInput && (
                    <button
                      onClick={() => setSearchInput("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={handleApplySearch}
                disabled={loading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                type="button"
              >
                <Search size={18} />
                Tìm kiếm
              </button>
            </div>
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

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
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
                      fetchMyCustomers(currentPage, pageSize, appliedSearch)
                    }
                    disabled={loading}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
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
            <TableSkeleton rows={10} />
          ) : customerList.length === 0 ? (
            <div className="p-12 text-center">
              <UserCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">
                Không tìm thấy khách hàng
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {appliedSearch
                  ? "Không có kết quả phù hợp với từ khóa"
                  : "Chưa có khách hàng nào được phân công cho bạn"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Khách Hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã KH
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      SĐT
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Email
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Tổng đơn
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Tổng cân
                    </th>
                    <th className="px-4 py-4 text-right text-sm font-semibold whitespace-nowrap">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-4 text-right text-sm font-semibold whitespace-nowrap">
                      Số dư
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Nhân viên
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Nguồn
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customerList.map((customer, index) => (
                    <tr
                      key={customer?.accountId ?? `customer-${index}`}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {customer?.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {customer?.name || "—"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDateTime(customer?.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-blue-600">
                          {customer?.customerCode || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-900">
                          {customer?.phone || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-[200px]">
                          <span className="text-sm text-gray-900 truncate block">
                            {customer?.email || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {customer?.totalOrders ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-gray-900 whitespace-nowrap">
                          {formatWeight(customer?.totalWeight)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-medium text-gray-900 tabular-nums whitespace-nowrap">
                          {formatMoney(customer?.totalAmount)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-blue-600 tabular-nums whitespace-nowrap">
                          {formatMoney(customer?.balance)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-900 truncate">
                          {customer?.staffName || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {customer?.source && customer.source.trim() !== "" ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getSourceColor(customer.source)}`}
                          >
                            {customer.source}
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getSourceColor("")}`}
                          >
                            {getSourceLabel(EMPTY_SOURCE_VALUE)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleOpenRefund(customer)}
                            className="px-3 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 font-semibold transition-all text-sm"
                            type="button"
                            title="Hoàn tiền / hoàn số dư"
                          >
                            Hoàn
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                  khách hàng
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

      {/* Refund Modal */}
      <CreateRefund
        open={openRefundModal}
        onClose={() => setOpenRefundModal(false)}
        customer={refundCustomer}
        onSuccess={handleRefundSuccess}
      />
    </div>
  );
};

export default CustomerList;
