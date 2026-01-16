import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Lock,
  Unlock,
} from "lucide-react";
import userService from "../../Services/Manager/userService";

const StaffList = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const availableRoles = useMemo(
    () => [
      { key: "ADMIN", label: "Quản trị viên", color: "red" },
      { key: "MANAGER", label: "Quản lý", color: "orange" },
      { key: "STAFF_SALE", label: "Nhân viên bán hàng", color: "blue" },
      {
        key: "STAFF_WAREHOUSE_FOREIGN",
        label: "Nhân viên kho ngoại",
        color: "purple",
      },
      {
        key: "STAFF_WAREHOUSE_DOMESTIC",
        label: "Nhân viên kho nội địa",
        color: "indigo",
      },
      { key: "LEAD_SALE", label: "Trưởng nhóm bán hàng", color: "green" },
      { key: "STAFF_PURCHASER", label: "Nhân viên mua hộ", color: "gray" },
    ],
    []
  );

  const pageSizeOptions = [50, 100, 200];

  const fetchStaffAccounts = useCallback(
    async (page = 0, size = pageSize) => {
      setError(null);
      setLoading(true);
      try {
        const response = await userService.getStaffAccounts(page, size);
        setStaffList(response.content || []);
        setTotalElements(response.totalElements || 0);
        setTotalPages(response.totalPages || 0);
        setCurrentPage(page);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách nhân viên");
        setStaffList([]);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchStaffAccounts(0, pageSize);
  }, [fetchStaffAccounts, pageSize]);

  // Filter logic
  const filteredStaff = useMemo(() => {
    let filtered = [...staffList];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (staff) =>
          staff.username?.toLowerCase().includes(search) ||
          staff.name?.toLowerCase().includes(search) ||
          staff.email?.toLowerCase().includes(search) ||
          staff.phone?.includes(search) ||
          staff.staffCode?.toLowerCase().includes(search)
      );
    }

    if (selectedRole !== "ALL") {
      filtered = filtered.filter((staff) => staff.role === selectedRole);
    }

    if (selectedStatus !== "ALL") {
      filtered = filtered.filter((staff) => staff.status === selectedStatus);
    }

    return filtered;
  }, [staffList, searchTerm, selectedRole, selectedStatus]);

  // Handlers
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 0 && newPage < totalPages) {
        fetchStaffAccounts(newPage, pageSize);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages, pageSize, fetchStaffAccounts]
  );

  const handlePageSizeChange = useCallback(
    (newSize) => {
      setPageSize(newSize);
      fetchStaffAccounts(0, newSize);
    },
    [fetchStaffAccounts]
  );

  // Utils
  const formatDate = useCallback((dateString) => {
    return dateString ? new Date(dateString).toLocaleString("vi-VN") : "-";
  }, []);

  const getRoleInfo = useCallback(
    (role) =>
      availableRoles.find((r) => r.key === role) || {
        label: role,
        color: "gray",
      },
    [availableRoles]
  );

  const getRoleColor = useCallback((color) => {
    const colorMap = {
      red: "bg-red-100 text-red-700 border-red-200",
      orange: "bg-orange-100 text-orange-700 border-orange-200",
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      purple: "bg-purple-100 text-purple-700 border-purple-200",
      indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
      green: "bg-green-100 text-green-700 border-green-200",
      gray: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colorMap[color] || "bg-gray-100 text-gray-700 border-gray-200";
  }, []);

  const getStatusBadge = useCallback(
    (status) =>
      status === "HOAT_DONG"
        ? "bg-green-100 text-green-700 border-green-200"
        : "bg-gray-100 text-gray-600 border-gray-200",
    []
  );

  const getStatusText = useCallback(
    (status) => (status === "HOAT_DONG" ? "Hoạt động" : "Không hoạt động"),
    []
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 md:h-10 bg-gradient-to-b from-blue-600 to-blue-700 rounded-full"></div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Quản lý nhân viên
              </h1>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Thêm nhân viên</span>
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Bộ lọc</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm tên, username, email, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
            >
              <option value="ALL">Tất cả vai trò</option>
              {availableRoles.map((role) => (
                <option key={role.key} value={role.key}>
                  {role.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="HOAT_DONG">Hoạt động</option>
              <option value="KHONG_HOAT_DONG">Không hoạt động</option>
            </select>
          </div>

          {/* Filter Results Info */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Hiển thị{" "}
              <span className="font-bold text-blue-600">
                {loading ? "..." : filteredStaff.length}
              </span>{" "}
              trong{" "}
              <span className="font-bold text-gray-800">{totalElements}</span>{" "}
              nhân viên
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">
                Hiển thị:
              </span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} nhân viên/trang
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-bold text-red-800 mb-2">
                  Có lỗi xảy ra
                </h3>
                <div className="text-sm text-red-700 mb-3">
                  <p>{error}</p>
                </div>
                <button
                  onClick={() => fetchStaffAccounts(currentPage, pageSize)}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  {loading ? "Đang tải..." : "Thử lại"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Staff Table */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Nhân viên
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Mã NV
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Phòng ban
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-4 md:px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {loading
                  ? // Skeleton rows
                    [...Array(8)].map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gray-200 rounded-full" />
                            <div>
                              <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
                              <div className="h-3 w-20 bg-gray-100 rounded" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="h-3 w-16 bg-gray-200 rounded" />
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="h-6 w-28 bg-gray-200 rounded-lg" />
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="h-3 w-24 bg-gray-200 rounded" />
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="h-3 w-40 bg-gray-200 rounded mb-2" />
                          <div className="h-3 w-28 bg-gray-100 rounded" />
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="h-6 w-24 bg-gray-200 rounded-lg" />
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="h-3 w-24 bg-gray-200 rounded" />
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                            <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                            <div className="h-8 w-8 bg-gray-200 rounded-lg" />
                          </div>
                        </td>
                      </tr>
                    ))
                  : // Data rows
                    filteredStaff.map((staff) => {
                      const roleInfo = getRoleInfo(staff.role);
                      return (
                        <tr
                          key={staff.accountId}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-sm">
                                  {staff.name?.charAt(0).toUpperCase() || "?"}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-bold text-gray-800">
                                  {staff.name}
                                </div>
                                <div className="text-xs text-gray-500 font-medium">
                                  {staff.username}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold border border-blue-200">
                              {staff.staffCode}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg border ${getRoleColor(
                                roleInfo.color
                              )}`}
                            >
                              {roleInfo.label}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                            {staff.department || "-"}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-800">
                              {staff.email}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                              {staff.phone}
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border ${getStatusBadge(
                                staff.status
                              )}`}
                            >
                              {staff.enabled ? (
                                <Unlock className="w-3 h-3" />
                              ) : (
                                <Lock className="w-3 h-3" />
                              )}
                              {getStatusText(staff.status)}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                            {formatDate(staff.createdAt)}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                title="Xem chi tiết"
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                title="Chỉnh sửa"
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-transparent hover:border-green-200"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                title="Xóa"
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-transparent hover:border-red-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {!loading && filteredStaff.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-md">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-bold text-gray-800 mb-2">
              Không tìm thấy nhân viên
            </p>
            <p className="text-sm text-gray-500 font-medium">
              {staffList.length === 0
                ? "Chưa có nhân viên nào trong hệ thống"
                : "Thử thay đổi điều kiện lọc"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 bg-white rounded-xl shadow-md border border-gray-100 px-4 md:px-6 py-4 gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                currentPage === 0
                  ? "text-gray-400 cursor-not-allowed bg-gray-50"
                  : "text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Trang trước</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Trang</span>
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold border border-blue-200">
                {currentPage + 1}
              </span>
              <span className="text-sm text-gray-600 font-medium">
                / {totalPages}
              </span>
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                currentPage >= totalPages - 1
                  ? "text-gray-400 cursor-not-allowed bg-gray-50"
                  : "text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span className="text-sm">Trang sau</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffList;
