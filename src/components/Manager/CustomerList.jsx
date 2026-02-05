import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  UserCircle,
  Eye,
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

const CustomerList = () => {
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  // ✅ Refund modal
  const [openRefundModal, setOpenRefundModal] = useState(false);
  const [refundCustomer, setRefundCustomer] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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

  const handleViewCustomer = useCallback(async (customer) => {
    setSelectedCustomer(customer);
    setOpenDetailModal(true);

    setDetailLoading(true);
    try {
      const detail = await userService.getAccountById(customer?.accountId);
      setSelectedCustomer((prev) => ({ ...prev, ...detail }));
    } catch {
      // vẫn xem được data list
    } finally {
      setDetailLoading(false);
    }
  }, []);

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
    <div className="min-h-screen ">
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
              onClick={() =>
                fetchMyCustomers(currentPage, pageSize, appliedSearch)
              }
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
                      title="Xóa text"
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
                      {/* Khách hàng */}
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

                      {/* Mã KH */}
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-blue-600">
                          {customer?.customerCode || "—"}
                        </span>
                      </td>

                      {/* SĐT */}
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-900">
                          {customer?.phone || "—"}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-4">
                        <div className="max-w-[200px]">
                          <span className="text-sm text-gray-900 truncate block">
                            {customer?.email || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Tổng đơn */}
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {customer?.totalOrders ?? 0}
                        </span>
                      </td>

                      {/* Tổng cân */}
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm text-gray-900 whitespace-nowrap">
                          {formatWeight(customer?.totalWeight)}
                        </span>
                      </td>

                      {/* Tổng tiền */}
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-medium text-gray-900 tabular-nums whitespace-nowrap">
                          {formatMoney(customer?.totalAmount)}
                        </span>
                      </td>

                      {/* Số dư */}
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-blue-600 tabular-nums whitespace-nowrap">
                          {formatMoney(customer?.balance)}
                        </span>
                      </td>

                      {/* Nhân viên */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm text-gray-900 truncate">
                            {customer?.staffName || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Nguồn */}
                      <td className="px-4 py-4">
                        {customer?.source && customer.source.trim() !== "" ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getSourceColor(
                              customer.source,
                            )}`}
                          >
                            {customer.source}
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getSourceColor(
                              "",
                            )}`}
                          >
                            {getSourceLabel(EMPTY_SOURCE_VALUE)}
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewCustomer(customer)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 text-sm"
                            type="button"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                            Xem
                          </button>

                          <button
                            onClick={() => handleOpenRefund(customer)}
                            className="px-3 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 font-semibold transition-all flex items-center gap-2 text-sm"
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

      {/* ✅ Refund Modal */}
      <CreateRefund
        open={openRefundModal}
        onClose={() => setOpenRefundModal(false)}
        customer={refundCustomer}
        onSuccess={handleRefundSuccess}
      />

      {/* Detail Modal */}
      {openDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <UserCircle className="text-white" size={20} />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  Thông Tin Khách Hàng
                </h2>
              </div>
              <button
                className="text-white/80 hover:text-white transition-colors"
                onClick={closeModal}
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-6 py-6 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
              {detailLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="animate-spin" size={16} />
                  Đang tải thêm thông tin...
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Mã khách hàng
                  </p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedCustomer?.customerCode || "—"}
                  </p>
                </div>

                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Tên khách hàng
                  </p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedCustomer?.name || "—"}
                  </p>
                </div>

                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Số điện thoại
                  </p>
                  <div className="flex items-center gap-2">
                    <Phone className="text-blue-600" size={16} />
                    <p className="font-semibold text-gray-900">
                      {selectedCustomer?.phone || "—"}
                    </p>
                  </div>
                </div>

                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Email
                  </p>
                  <div className="flex items-center gap-2">
                    <Mail className="text-blue-600 flex-shrink-0" size={16} />
                    <p className="text-gray-900 break-words text-sm">
                      {selectedCustomer?.email || "—"}
                    </p>
                  </div>
                </div>

                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Tổng đơn hàng
                  </p>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="text-blue-600" size={16} />
                    <p className="font-semibold text-gray-900 text-lg">
                      {selectedCustomer?.totalOrders ?? 0}
                    </p>
                  </div>
                </div>

                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Tổng cân nặng
                  </p>
                  <div className="flex items-center gap-2">
                    <Weight className="text-blue-600" size={16} />
                    <p className="font-semibold text-gray-900 text-lg">
                      {formatWeight(selectedCustomer?.totalWeight)}
                    </p>
                  </div>
                </div>

                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Tổng tiền
                  </p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-blue-600" size={16} />
                    <p className="font-semibold text-gray-900 text-lg">
                      {formatMoney(selectedCustomer?.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Số dư
                  </p>
                  <div className="flex items-center gap-2">
                    <Wallet className="text-blue-600" size={16} />
                    <p className="font-semibold text-blue-600 text-lg">
                      {formatMoney(selectedCustomer?.balance)}
                    </p>
                  </div>
                </div>

                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Nhân viên phụ trách
                  </p>
                  <div className="flex items-center gap-2">
                    <UserCheck className="text-blue-600" size={16} />
                    <p className="font-semibold text-gray-900">
                      {selectedCustomer?.staffName || "—"}
                    </p>
                  </div>
                </div>

                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Nguồn
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getSourceColor(
                      selectedCustomer?.source || "",
                    )}`}
                  >
                    {selectedCustomer?.source || getSourceLabel("__EMPTY__")}
                  </span>
                </div>
              </div>

              {/* Địa chỉ */}
              {selectedCustomer?.addresses &&
                Array.isArray(selectedCustomer.addresses) &&
                selectedCustomer.addresses.length > 0 && (
                  <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="text-blue-600" size={16} />
                      <p className="text-sm font-medium text-gray-600">
                        Địa chỉ
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {selectedCustomer.addresses
                        .filter((a) => (a?.addressName || "").trim() !== "")
                        .map((a, i) => (
                          <div
                            key={a?.id ?? i}
                            className="flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-200"
                          >
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-sm text-gray-900">
                              {a?.addressName}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
              <button
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors"
                onClick={closeModal}
                type="button"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
