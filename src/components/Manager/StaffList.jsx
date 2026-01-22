import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  X,
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
    [],
  );

  // ✅ giống PerformancesCustomer
  const pageSizeOptions = [50, 100, 200];

  const fetchStaffAccounts = useCallback(
    async (page = 0, size = pageSize) => {
      setError(null);
      setLoading(true);
      try {
        const response = await userService.getStaffAccounts(page, size);
        setStaffList(response?.content || []);
        setTotalElements(response?.totalElements || 0);
        setTotalPages(response?.totalPages || 0);
        setCurrentPage(page);
      } catch (err) {
        setError(err?.message || "Không thể tải danh sách nhân viên");
        setStaffList([]);
        setTotalElements(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    fetchStaffAccounts(0, pageSize);
  }, [fetchStaffAccounts, pageSize]);

  // Filter logic (lọc trên page hiện tại)
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
          staff.staffCode?.toLowerCase().includes(search),
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
      if (loading) return;
      if (newPage >= 0 && newPage < totalPages) {
        fetchStaffAccounts(newPage, pageSize);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [loading, totalPages, pageSize, fetchStaffAccounts],
  );

  const handlePageSizeChange = useCallback(
    (newSize) => {
      if (loading) return;
      setPageSize(newSize);
      fetchStaffAccounts(0, newSize);
    },
    [loading, fetchStaffAccounts],
  );

  // Utils
  const formatDate = useCallback((dateString) => {
    return dateString ? new Date(dateString).toLocaleString("vi-VN") : "-";
  }, []);

  const getRoleInfo = useCallback(
    (role) =>
      availableRoles.find((r) => r.key === role) || {
        label: role || "-",
        color: "gray",
      },
    [availableRoles],
  );

  const getRoleColor = useCallback((color) => {
    const colorMap = {
      red: "bg-red-100 text-red-700 border-red-300",
      orange: "bg-orange-100 text-orange-700 border-orange-300",
      blue: "bg-blue-100 text-blue-700 border-blue-300",
      purple: "bg-purple-100 text-purple-700 border-purple-300",
      indigo: "bg-indigo-100 text-indigo-700 border-indigo-300",
      green: "bg-green-100 text-green-700 border-green-300",
      gray: "bg-gray-100 text-gray-700 border-gray-300",
    };
    return colorMap[color] || "bg-gray-100 text-gray-700 border-gray-300";
  }, []);

  const getStatusBadge = useCallback(
    (status) =>
      status === "HOAT_DONG"
        ? "bg-green-100 text-green-700 border-green-300"
        : "bg-gray-100 text-gray-600 border-gray-300",
    [],
  );

  const getStatusText = useCallback(
    (status) => (status === "HOAT_DONG" ? "Hoạt động" : "Không hoạt động"),
    [],
  );

  const isFilterActive =
    !!searchTerm || selectedRole !== "ALL" || selectedStatus !== "ALL";

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* ✅ Header - Yellow Gradient */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-yellow-300 via-yellow-300 to-yellow-300 border-[1px] border-black rounded-xl shadow-lg p-4 md:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1.5 h-8 md:h-9 bg-black rounded-full shrink-0 shadow-sm" />
                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl font-bold text-black leading-tight truncate">
                    Quản Lý Nhân Viên
                  </h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-sm">
                      <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
                        Tổng: {totalElements} nhân viên
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-sm">
                      <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
                        Trang: {currentPage + 1}/{totalPages || 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Add button */}
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-black rounded-lg hover:bg-gray-100 transition-all shadow-sm font-semibold self-start lg:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-sm">Thêm nhân viên</span>
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Filters Section */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
            Bộ lọc
          </h3>

          <div className="bg-white rounded-xl shadow-sm border-1 border-black p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm tên, username, email, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm font-semibold"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                    title="Xóa"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Role Filter */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2.5 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm font-semibold bg-white"
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
                className="px-3 py-2.5 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm font-semibold bg-white"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="HOAT_DONG">Hoạt động</option>
                <option value="KHONG_HOAT_DONG">Không hoạt động</option>
              </select>
            </div>

            {/* ✅ Synced "Hiển thị" giống PerformancesCustomer */}
            <div className="mt-4 pt-4 border-t-2 border-black">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                {/* Left: info pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-sm">
                    <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
                      Đang hiển thị:{" "}
                      <span className="font-bold">
                        {loading ? "..." : filteredStaff.length}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-sm">
                    <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
                      Tổng: <span className="font-bold">{totalElements}</span>{" "}
                      nhân viên
                    </span>
                  </div>

                  {isFilterActive && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-200 border-2 border-black rounded-lg shadow-sm">
                      <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
                        Đang lọc
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: PAGE SIZE buttons 50/100/200 */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    Hiển thị:
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {pageSizeOptions.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handlePageSizeChange(size)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 border-yellow-600 shadow-sm ${
                          pageSize === size
                            ? "bg-yellow-400 text-black"
                            : "bg-white text-black hover:bg-gray-100"
                        } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                        title={`${size} nhân viên / trang`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-red-800 mb-1">
                  Có lỗi xảy ra
                </h3>
                <p className="text-sm text-red-700 break-words mb-3">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchStaffAccounts(currentPage, pageSize)}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  {loading ? "Đang tải..." : "Thử lại"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="p-1 hover:bg-red-100 rounded transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        )}

        {/* ✅ Staff Table */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
            Danh sách nhân viên
          </h3>

          <div className="bg-white shadow-lg rounded-xl overflow-hidden border-1 border-black">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-200 to-gray-300 border-b-2 border-black">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Nhân viên
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Mã NV
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Phòng ban
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Liên hệ
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-4 md:px-6 py-3 text-center text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {loading
                    ? [...Array(8)].map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gray-300 rounded-full" />
                              <div>
                                <div className="h-3 w-32 bg-gray-300 rounded mb-2" />
                                <div className="h-3 w-20 bg-gray-200 rounded" />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="h-3 w-16 bg-gray-300 rounded" />
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="h-6 w-28 bg-gray-300 rounded-lg" />
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="h-3 w-24 bg-gray-300 rounded" />
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="h-3 w-40 bg-gray-300 rounded mb-2" />
                            <div className="h-3 w-28 bg-gray-200 rounded" />
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="h-6 w-24 bg-gray-300 rounded-lg" />
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="h-3 w-24 bg-gray-300 rounded" />
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-8 w-8 bg-gray-300 rounded-lg" />
                              <div className="h-8 w-8 bg-gray-300 rounded-lg" />
                              <div className="h-8 w-8 bg-gray-300 rounded-lg" />
                            </div>
                          </td>
                        </tr>
                      ))
                    : filteredStaff.map((staff) => {
                        const roleInfo = getRoleInfo(staff.role);
                        const isActive = staff.status === "HOAT_DONG";

                        return (
                          <tr
                            key={staff.accountId}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm border-2 border-black">
                                  <span className="text-white font-bold text-sm">
                                    {staff.name?.charAt(0).toUpperCase() || "?"}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-bold text-gray-900">
                                    {staff.name || "-"}
                                  </div>
                                  <div className="text-xs text-gray-600 font-semibold">
                                    {staff.username || "-"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                              <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold border-2 border-blue-300">
                                {staff.staffCode || "-"}
                              </span>
                            </td>

                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg border-2 ${getRoleColor(
                                  roleInfo.color,
                                )}`}
                              >
                                {roleInfo.label}
                              </span>
                            </td>

                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                              {staff.department || "-"}
                            </td>

                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                {staff.email || "-"}
                              </div>
                              <div className="text-xs text-gray-600 font-semibold">
                                {staff.phone || "-"}
                              </div>
                            </td>

                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border-2 ${getStatusBadge(
                                  staff.status,
                                )}`}
                              >
                                {isActive ? (
                                  <Unlock className="w-3 h-3" />
                                ) : (
                                  <Lock className="w-3 h-3" />
                                )}
                                {getStatusText(staff.status)}
                              </span>
                            </td>

                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                              {formatDate(staff.createdAt)}
                            </td>

                            <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  title="Xem chi tiết"
                                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border-2 border-transparent hover:border-blue-300"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  title="Chỉnh sửa"
                                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors border-2 border-transparent hover:border-green-300"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  title="Xóa"
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors border-2 border-transparent hover:border-red-300"
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
        </div>

        {/* ✅ Empty State */}
        {!loading && filteredStaff.length === 0 && !error && (
          <div className="mt-6 text-center py-12 md:py-16 bg-white rounded-xl border-1 border-black shadow-lg">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-base md:text-lg font-bold text-gray-900 mb-2">
              Không tìm thấy nhân viên
            </p>
            <p className="text-sm text-gray-600 font-medium">
              {staffList.length === 0
                ? "Chưa có nhân viên nào trong hệ thống"
                : "Thử thay đổi điều kiện lọc"}
            </p>
          </div>
        )}

        {/* ✅ Pagination (Synced Footer) */}
        {!loading &&
          totalPages > 1 &&
          (() => {
            const from = totalElements === 0 ? 0 : currentPage * pageSize + 1;
            const to = Math.min((currentPage + 1) * pageSize, totalElements);

            const btnBase =
              "px-3 md:px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 border-black shadow-sm";
            const btnActive = "bg-white text-black hover:bg-gray-100";
            const btnDisabled = "bg-gray-100 text-gray-400 cursor-not-allowed";

            const isFirst = currentPage === 0;
            const isLast = currentPage >= totalPages - 1;

            return (
              <div className="mt-6 bg-white rounded-xl shadow-lg border-1 border-black overflow-hidden">
                {/* Top strip info */}
                <div className="px-4 md:px-6 py-4 bg-gray-50 border-b-2 border-black flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-sm">
                      <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
                        Đang xem:{" "}
                        <span className="font-bold text-black">
                          {from}-{to}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-sm">
                      <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
                        Tổng: <span className="font-bold">{totalElements}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs md:text-sm font-bold text-black uppercase tracking-wide">
                      Trang
                    </span>
                    <span className="px-4 py-2 bg-yellow-400 text-black border-2 border-black rounded-lg text-sm font-bold shadow-sm">
                      {currentPage + 1}
                    </span>
                    <span className="text-sm text-gray-700 font-semibold">
                      / {totalPages}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePageChange(0)}
                      disabled={isFirst}
                      className={`${btnBase} ${isFirst ? btnDisabled : btnActive}`}
                      title="Về trang đầu"
                    >
                      Đầu
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={isFirst}
                      className={`${btnBase} flex items-center gap-2 ${
                        isFirst ? btnDisabled : btnActive
                      }`}
                      title="Trang trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Trước
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={isLast}
                      className={`${btnBase} flex items-center gap-2 ${
                        isLast ? btnDisabled : btnActive
                      }`}
                      title="Trang sau"
                    >
                      Sau
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePageChange(totalPages - 1)}
                      disabled={isLast}
                      className={`${btnBase} ${isLast ? btnDisabled : btnActive}`}
                      title="Tới trang cuối"
                    >
                      Cuối
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
};

export default StaffList;
