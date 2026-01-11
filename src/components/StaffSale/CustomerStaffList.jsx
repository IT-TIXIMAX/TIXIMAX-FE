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
} from "lucide-react";
import userService from "../../Services/Manager/userService";

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

const CustomerStaffList = () => {
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("ALL");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Giá trị đặc biệt cho KH không có source
  const EMPTY_SOURCE_VALUE = "__EMPTY__";

  // Build nguồn từ dữ liệu
  const availableSources = useMemo(() => {
    const raw = customerList.map((c) =>
      c.source && c.source.trim() !== "" ? c.source : EMPTY_SOURCE_VALUE
    );

    const unique = [...new Set(raw)];

    return unique.sort((a, b) => {
      if (a === EMPTY_SOURCE_VALUE) return 1;
      if (b === EMPTY_SOURCE_VALUE) return -1;
      return a.localeCompare(b, "vi");
    });
  }, [customerList]);

  const getSourceLabel = (value) => {
    if (!value || value === EMPTY_SOURCE_VALUE) return "(Không có nguồn)";
    return value;
  };

  // Fetch my customers
  const fetchMyCustomers = useCallback(
    async (page = 0, size = pageSize) => {
      setError(null);
      setLoading(true);
      try {
        const response = await userService.getMyCustomers(
          page,
          size,
          searchTerm
        );

        setCustomerList(response?.content || []);
        setTotalElements(response?.totalElements || 0);
        setTotalPages(response?.totalPages || 0);
        setCurrentPage(page);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách khách hàng của bạn");
        setCustomerList([]);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, searchTerm]
  );

  useEffect(() => {
    fetchMyCustomers(0, pageSize);
  }, [fetchMyCustomers, pageSize]);

  // Filter logic
  const filteredCustomers = useMemo(() => {
    let filtered = [...customerList];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.username?.toLowerCase().includes(search) ||
          customer.name?.toLowerCase().includes(search) ||
          customer.email?.toLowerCase().includes(search) ||
          customer.phone?.includes(search) ||
          customer.customerCode?.toLowerCase().includes(search) ||
          customer.address?.toLowerCase().includes(search)
      );
    }

    // Source filter
    if (selectedSource !== "ALL") {
      if (selectedSource === EMPTY_SOURCE_VALUE) {
        filtered = filtered.filter(
          (customer) => !customer.source || customer.source.trim() === ""
        );
      } else {
        filtered = filtered.filter(
          (customer) => customer.source === selectedSource
        );
      }
    }

    return filtered;
  }, [customerList, searchTerm, selectedSource]);

  // Handlers
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 0 && newPage < totalPages && !loading) {
        fetchMyCustomers(newPage, pageSize);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages, pageSize, loading, fetchMyCustomers]
  );

  const handlePageSizeChange = useCallback(
    (newSize) => {
      setPageSize(newSize);
      fetchMyCustomers(0, newSize);
    },
    [fetchMyCustomers]
  );

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setOpenDetailModal(true);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedSource("ALL");
  };

  const hasActiveFilter = searchTerm || selectedSource !== "ALL";

  const getSourceColor = useCallback((source) => {
    const colorMap = {
      Facebook: "bg-blue-100 text-blue-800",
      Zalo: "bg-cyan-100 text-cyan-800",
      Website: "bg-purple-100 text-purple-800",
      "Giới thiệu": "bg-green-100 text-green-800",
    };
    if (!source || source === EMPTY_SOURCE_VALUE) {
      return "bg-gray-100 text-gray-800";
    }
    return colorMap[source] || "bg-gray-100 text-gray-800";
  }, []);

  const showingFrom = totalElements ? currentPage * pageSize + 1 : 0;
  const showingTo = Math.min((currentPage + 1) * pageSize, totalElements);

  // Source stats
  const sourceStats = useMemo(() => {
    const stats = {};
    customerList.forEach((customer) => {
      const source = customer.source || EMPTY_SOURCE_VALUE;
      stats[source] = (stats[source] || 0) + 1;
    });
    return stats;
  }, [customerList]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Danh Sách Khách Hàng
              </h1>
            </div>

            <button
              onClick={() => fetchMyCustomers(currentPage, pageSize)}
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
                    <p className="text-3xl font-bold text-green-600">
                      {sourceStats.Facebook || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <UserCircle className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Zalo
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {sourceStats.Zalo || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <UserCircle className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Đang Hiển Thị
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {filteredCustomers.length}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Filter className="text-orange-600" size={24} />
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
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm tên, email, SĐT, mã KH..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 max-w-xs">
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="ALL">Tất cả nguồn</option>
                  {availableSources.map((sourceValue) => (
                    <option key={sourceValue} value={sourceValue}>
                      {getSourceLabel(sourceValue)}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilter && (
                <button
                  onClick={handleClearSearch}
                  disabled={loading}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  type="button"
                >
                  <X size={18} />
                  Xóa lọc
                </button>
              )}
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
                    onClick={() => fetchMyCustomers(currentPage, pageSize)}
                    disabled={loading}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center">
              <UserCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">
                Không tìm thấy khách hàng
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {customerList.length === 0
                  ? "Chưa có khách hàng nào được phân công cho bạn"
                  : "Thử thay đổi điều kiện lọc"}
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
                      Số Điện Thoại
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Email
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Địa Chỉ
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
                  {filteredCustomers.map((customer, index) => {
                    const mainAddress =
                      customer.addresses?.[0]?.addressName || "—";

                    return (
                      <tr
                        key={
                          customer.accountId ??
                          customer.customerCode ??
                          `customer-${index}`
                        }
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {customer.name?.charAt(0).toUpperCase() || "?"}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {customer.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {customer.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-blue-600">
                            {customer.customerCode}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Phone className="text-gray-400" size={14} />
                            <span className="text-sm text-gray-900">
                              {customer.phone}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 max-w-xs">
                            <Mail
                              className="text-gray-400 flex-shrink-0"
                              size={14}
                            />
                            <span className="text-sm text-gray-900 truncate">
                              {customer.email}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 max-w-xs">
                            <MapPin
                              className="text-gray-400 flex-shrink-0"
                              size={14}
                            />
                            <span className="text-sm text-gray-900 truncate">
                              {mainAddress}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          {customer.source ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getSourceColor(
                                customer.source
                              )}`}
                            >
                              {customer.source}
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getSourceColor(
                                EMPTY_SOURCE_VALUE
                              )}`}
                            >
                              {getSourceLabel(EMPTY_SOURCE_VALUE)}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleViewCustomer(customer)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 mx-auto text-sm"
                            type="button"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                            Xem
                          </button>
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

      {/* Detail Modal */}
      {openDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden">
            {/* HEADER */}
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
                onClick={() => setOpenDetailModal(false)}
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            {/* BODY */}
            <div className="px-6 py-6 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* GRID 2 CỘT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mã KH */}
                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Mã khách hàng
                  </p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedCustomer.customerCode}
                  </p>
                </div>

                {/* Tên */}
                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Tên khách hàng
                  </p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedCustomer.name}
                  </p>
                </div>

                {/* SĐT */}
                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Số điện thoại
                  </p>
                  <div className="flex items-center gap-2">
                    <Phone className="text-blue-600" size={16} />
                    <p className="font-semibold text-gray-900">
                      {selectedCustomer.phone}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Email
                  </p>
                  <div className="flex items-center gap-2">
                    <Mail className="text-blue-600 flex-shrink-0" size={16} />
                    <p className="text-gray-900 break-words">
                      {selectedCustomer.email}
                    </p>
                  </div>
                </div>

                {/* Trạng thái */}
                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Trạng thái
                  </p>
                  <p
                    className={`font-semibold ${
                      selectedCustomer.status === "HOAT_DONG"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedCustomer.status === "HOAT_DONG"
                      ? "Hoạt động"
                      : "Không hoạt động"}
                  </p>
                </div>

                {/* Nguồn */}
                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Nguồn
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getSourceColor(
                      selectedCustomer.source
                    )}`}
                  >
                    {selectedCustomer.source ||
                      getSourceLabel(EMPTY_SOURCE_VALUE)}
                  </span>
                </div>
              </div>

              {/* ĐỊA CHỈ */}
              <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="text-blue-600" size={16} />
                  <p className="text-sm font-medium text-gray-600">Địa chỉ</p>
                </div>
                <div className="flex flex-col gap-2">
                  {selectedCustomer.addresses?.length > 0 ? (
                    selectedCustomer.addresses.map((a, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-200"
                      >
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-900">
                          {a.addressName}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Chưa có địa chỉ</p>
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
              <button
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-colors"
                onClick={() => setOpenDetailModal(false)}
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

export default CustomerStaffList;
