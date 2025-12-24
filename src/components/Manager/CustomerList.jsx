import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Eye,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Tag,
  Calendar,
} from "lucide-react";
import userService from "../../Services/Manager/userService";

const CustomerList = () => {
  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedSource, setSelectedSource] = useState("ALL");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const pageSizeOptions = [50, 100, 200];

  // Available sources (extract from data or predefined)
  const availableSources = useMemo(() => {
    const sources = [
      ...new Set(customerList.map((c) => c.source).filter((s) => s)),
    ];
    return ["Facebook", "Zalo", "Website", "Giới thiệu", "Khác", ...sources];
  }, [customerList]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer); // Lưu toàn bộ object customer
    setOpenDetailModal(true); // Mở modal
  };

  // Fetch customer accounts
  const fetchCustomerAccounts = useCallback(
    async (page = 0, size = pageSize) => {
      setError(null);
      setLoading(true);
      try {
        const response = await userService.getCustomerAccounts(page, size);
        setCustomerList(response.content || []);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 0);
        setCurrentPage(page);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách khách hàng");
        setCustomerList([]);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchCustomerAccounts(0, pageSize);
  }, [fetchCustomerAccounts, pageSize]);

  // Filter logic (client-side on current page data)
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
          customer.addresses?.some((a) =>
            a.addressName.toLowerCase().includes(search)
          )
      );
    }

    // Status filter
    if (selectedStatus !== "ALL") {
      filtered = filtered.filter(
        (customer) => customer.status === selectedStatus
      );
    }

    // Source filter
    if (selectedSource !== "ALL") {
      filtered = filtered.filter(
        (customer) => customer.source === selectedSource
      );
    }

    return filtered;
  }, [customerList, searchTerm, selectedStatus, selectedSource]);

  // Handlers
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 0 && newPage < totalPages) {
        fetchCustomerAccounts(newPage, pageSize);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages, pageSize, fetchCustomerAccounts]
  );

  const handlePageSizeChange = useCallback(
    (newSize) => {
      setPageSize(newSize);
      fetchCustomerAccounts(0, newSize);
    },
    [fetchCustomerAccounts]
  );

  // // Utility functions
  // const formatDate = useCallback((dateString) => {
  //   return dateString ? new Date(dateString).toLocaleString("vi-VN") : "-";
  // }, []);

  const getStatusBadge = useCallback((status) => {
    return status === "HOAT_DONG"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  }, []);

  const getStatusText = useCallback((status) => {
    return status === "HOAT_DONG" ? "Hoạt động" : "Không hoạt động";
  }, []);

  const getSourceColor = useCallback((source) => {
    const colorMap = {
      Facebook: "bg-blue-100 text-blue-800",
      Zalo: "bg-cyan-100 text-cyan-800",
      Website: "bg-purple-100 text-purple-800",
      "Giới thiệu": "bg-green-100 text-green-800",
    };
    return colorMap[source] || "bg-gray-100 text-gray-800";
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý khách hàng
          </h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <UserPlus className="w-5 h-5" />
          Thêm khách hàng
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tên, email, SĐT, mã KH..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="HOAT_DONG">Hoạt động</option>
            <option value="KHONG_HOAT_DONG">Không hoạt động</option>
          </select>

          {/* Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả nguồn</option>
            {availableSources.map((source) => (
              <option key={source} value={source}>
                {source || "(Không có)"}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Results Info */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị{" "}
            <span className="font-semibold text-blue-600">
              {loading ? "..." : filteredCustomers.length}
            </span>{" "}
            trong <span className="font-semibold">{totalElements}</span> khách
            hàng
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} khách hàng/trang
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Có lỗi xảy ra
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => fetchCustomerAccounts(currentPage, pageSize)}
                  disabled={loading}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm disabled:opacity-50"
                >
                  {loading ? "Đang tải..." : "Thử lại"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Table with loading skeleton */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã KH
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa chỉ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nguồn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NV phụ trách
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading
                ? // Skeleton rows (8)
                  [...Array(8)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-200 rounded-full" />
                          <div>
                            <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
                            <div className="h-3 w-20 bg-gray-100 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-3 w-28 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-40 bg-gray-100 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 w-64 bg-gray-200 rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 w-20 bg-gray-200 rounded-full" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 w-24 bg-gray-200 rounded-full" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-3 w-28 bg-gray-200 rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-gray-200 rounded" />
                          <div className="h-8 w-8 bg-gray-200 rounded" />
                          <div className="h-8 w-8 bg-gray-200 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))
                : // Data rows
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.accountId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {customer.name?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {customer.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-purple-600">
                          {customer.customerCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {customer.phone}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {customer.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-1 text-sm text-gray-900 max-w-xs">
                          <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">
                            {customer.addresses?.length > 0
                              ? customer.addresses
                                  .map((a) => a.addressName)
                                  .join(", ")
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.source ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getSourceColor(
                              customer.source
                            )}`}
                          >
                            <Tag className="w-3 h-3" />
                            {customer.source}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="text-blue-600 font-medium">
                          NV #{customer.staffId || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                            customer.status
                          )}`}
                        >
                          {getStatusText(customer.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            title="Xem chi tiết"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Chỉnh sửa"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            title="Xóa"
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {!loading && filteredCustomers.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <UserCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy khách hàng
          </p>
          <p className="text-sm text-gray-500">
            {customerList.length === 0
              ? "Chưa có khách hàng nào trong hệ thống"
              : "Thử thay đổi điều kiện lọc"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentPage === 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Trang trước
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Trang</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-semibold">
              {currentPage + 1}
            </span>
            <span className="text-sm text-gray-500">/ {totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentPage >= totalPages - 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Trang sau
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
      {openDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden animate-[fadeIn_0.2s_ease] relative">
            {/* HEADER */}
            <div className="px-8 py-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-800">
                <UserCircle className="w-7 h-7 text-blue-600" />
                Thông Tin Khách Hàng
              </h2>

              <button
                className="text-gray-400 hover:text-gray-600 transition"
                onClick={() => setOpenDetailModal(false)}
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="px-8 py-6 space-y-6">
              {/* GRID 2 CỘT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mã KH */}
                <div className="p-4 border rounded-xl bg-gray-50">
                  <p className="text-sm text-gray-500">Mã khách hàng</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedCustomer.customerCode}
                  </p>
                </div>

                {/* Tên */}
                <div className="p-4 border rounded-xl bg-gray-50">
                  <p className="text-sm text-gray-500">Tên khách hàng</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedCustomer.name}
                  </p>
                </div>

                {/* SĐT */}
                <div className="p-4 border rounded-xl bg-gray-50 flex gap-3">
                  <Phone className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCustomer.phone}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="p-4 border rounded-xl bg-gray-50 flex gap-3">
                  <Mail className="w-5 h-5 text-purple-600 mt-1" />
                  <div className="w-full">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 break-words">
                      {selectedCustomer.email}
                    </p>
                  </div>
                </div>

                {/* Trạng thái */}
                <div className="p-4 border rounded-xl bg-gray-50 flex gap-3">
                  <Tag className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <p
                      className={`
                font-semibold 
                ${
                  selectedCustomer.status === "HOAT_DONG"
                    ? "text-green-600"
                    : "text-red-600"
                }
              `}
                    >
                      {selectedCustomer.status === "HOAT_DONG"
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ĐỊA CHỈ */}
              <div className="p-4 border rounded-xl bg-gray-50">
                <p className="text-sm text-gray-500 mb-2">Địa chỉ</p>
                <div className="flex flex-col gap-2">
                  {selectedCustomer.addresses?.length > 0 ? (
                    selectedCustomer.addresses.map((a, i) => (
                      <div key={i} className="flex gap-2">
                        <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                        <span className="text-gray-900 break-words">
                          {a.addressName}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex gap-2">
                      <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                      <span>-</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="bg-gray-50 px-8 py-4 flex justify-end border-t">
              <button
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 transition"
                onClick={() => setOpenDetailModal(false)}
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
