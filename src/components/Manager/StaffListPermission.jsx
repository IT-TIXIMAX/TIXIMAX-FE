import React, { useState, useEffect } from "react";
import userService from "../../Services/Manager/userService";
import managerRoutesService from "../../Services/Manager/managerRoutesService";
import createAccountRoutesService from "../../Services/Auth/createAccountRouteService";
import toast from "react-hot-toast";
import { X, Plus, Trash2, Shield } from "lucide-react";

const StaffListPermission = () => {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [staffRoutes, setStaffRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [loadingModal, setLoadingModal] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  // Fetch staff data
  const fetchStaffData = async (page = 0, size = 20) => {
    setLoading(true);
    try {
      const response = await userService.getSaleLeadStaff(page, size);
      setStaffData(response.content);
      setCurrentPage(response.number);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      toast.error("Không thể tải danh sách nhân viên: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData(0, pageSize);
  }, [pageSize]); // Add pageSize dependency

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchStaffData(newPage, pageSize);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(0); // Reset to first page
  };

  // Open modal for permission management
  const handleOpenPermissionModal = async (staff) => {
    setSelectedStaff(staff);
    setShowModal(true);
    setLoadingRoutes(true);

    try {
      const routes = await managerRoutesService.getRoutes();
      setAvailableRoutes(routes);
      setStaffRoutes([]); // TODO: nếu có API lấy các tuyến đã gán -> gọi và set vào đây
    } catch {
      toast.error("Không thể tải danh sách tuyến!");
    } finally {
      setLoadingRoutes(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedStaff(null);
    setSelectedRouteId("");
    setStaffRoutes([]);
    setAvailableRoutes([]);
  };

  // Assign route to staff
  const handleAssignRoute = async () => {
    if (!selectedRouteId) {
      toast.error("Vui lòng chọn tuyến đường!");
      return;
    }

    setLoadingModal(true);
    const loadingToast = toast.loading("Đang gán quyền...");

    try {
      await createAccountRoutesService.assignRouteToAccount(
        selectedStaff.accountId,
        parseInt(selectedRouteId)
      );

      const assignedRoute = availableRoutes.find(
        (r) => r.routeId === parseInt(selectedRouteId)
      );

      // Optimistic update
      setStaffRoutes((prev) => [...prev, assignedRoute]);
      setSelectedRouteId("");

      toast.success(
        `Đã gán tuyến "${assignedRoute.name}" cho ${selectedStaff.name}!`,
        { id: loadingToast }
      );
    } catch (error) {
      let errorMessage = error.message || "Có lỗi xảy ra!";
      if (error.response?.data) {
        errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          errorMessage;
      }
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setLoadingModal(false);
    }
  };

  // Remove route from staff (if API exists)
  const handleRemoveRoute = async (routeId) => {
    if (!window.confirm("Bạn có chắc muốn xóa quyền này?")) return;

    const loadingToast = toast.loading("Đang xóa quyền...");
    try {
      // TODO: gọi API xóa nếu có
      setStaffRoutes((prev) => prev.filter((r) => r.routeId !== routeId));
      toast.success("Đã xóa quyền thành công!", { id: loadingToast });
    } catch {
      toast.error("Không thể xóa quyền!", { id: loadingToast });
    }
  };

  // Get role color classes
  const getRoleColorClass = (role) => {
    const colorMap = {
      red: "bg-red-50 text-red-700 border-red-200",
      orange: "bg-orange-50 text-orange-700 border-orange-200",
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
      green: "bg-green-50 text-green-700 border-green-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
    };
    const roleConfig = userService
      .getAvailableRoles()
      .find((r) => r.key === role);
    return colorMap[roleConfig?.color] || colorMap.gray;
  };

  // Get role label
  const getRoleLabel = (role) => {
    const roleConfig = userService
      .getAvailableRoles()
      .find((r) => r.key === role);
    return roleConfig?.label || role;
  };

  // Get status color classes
  const getStatusColorClass = (status) => {
    const colorMap = {
      green: "bg-green-50 text-green-700 border-green-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
    };
    const statusConfig = userService
      .getAvailableStatuses()
      .find((s) => s.key === status);
    return colorMap[statusConfig?.color] || colorMap.gray;
  };

  // Get status label
  const getStatusLabel = (status) => {
    const statusConfig = userService
      .getAvailableStatuses()
      .find((s) => s.key === status);
    return statusConfig?.label || status;
  };

  // Filter data
  const getFilteredData = () => {
    let filtered = [...staffData];

    if (searchText) {
      filtered = filtered.filter(
        (staff) =>
          staff.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          staff.username?.toLowerCase().includes(searchText.toLowerCase()) ||
          staff.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          staff.staffCode?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filterRole) {
      filtered = filtered.filter((staff) => staff.role === filterRole);
    }

    return filtered;
  };

  // Format date
  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleString("vi-VN") : "-";

  // Format currency
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN").format(amount);

  const filteredData = getFilteredData();

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-semibold text-gray-800">
            Danh sách nhân viên & Phân quyền
          </h2>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, mã NV..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 min-w-[250px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="min-w-[180px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="">Tất cả vai trò</option>
              {userService.getAvailableRoles().map((role) => (
                <option key={role.key} value={role.key}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* Table with loading skeleton in tbody */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Mã NV
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tên nhân viên
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Số điện thoại
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Phòng ban
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  // ===== Skeleton rows (8) =====
                  [...Array(8)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="h-3 w-20 bg-gray-200 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3 w-40 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-24 bg-gray-100 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3 w-48 bg-gray-200 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3 w-32 bg-gray-200 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-5 w-28 bg-gray-200 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-3 w-24 bg-gray-200 rounded" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-5 w-28 bg-gray-200 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-9 w-28 bg-gray-200 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : // ===== Data rows =====
                getFilteredData().length > 0 ? (
                  getFilteredData().map((staff) => (
                    <tr
                      key={staff.accountId}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {staff.staffCode}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {staff.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {staff.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {staff.phone}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getRoleColorClass(
                            staff.role
                          )}`}
                        >
                          {getRoleLabel(staff.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {staff.department || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColorClass(
                            staff.status
                          )}`}
                        >
                          {getStatusLabel(staff.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleOpenPermissionModal(staff)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow-md"
                        >
                          <Shield className="w-4 h-4" />
                          Phân quyền
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && (
            <div className="flex flex-wrap justify-between items-center mt-6 pt-4 border-t border-gray-200 gap-4">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Hiển thị {getFilteredData().length} / {totalElements} nhân
                  viên
                </div>

                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Hiển thị:</span>
                  <select
                    value={pageSize}
                    onChange={(e) =>
                      handlePageSizeChange(Number(e.target.value))
                    }
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-600">/ trang</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-gray-700"
                >
                  ← Trước
                </button>

                <span className="text-sm text-gray-600 min-w-[100px] text-center">
                  Trang {currentPage + 1} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-gray-700"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Permission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Shield className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Quản lý quyền tuyến đường
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {selectedStaff?.name} ({selectedStaff?.staffCode})
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Staff Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Email:</span>{" "}
                    <span className="font-medium text-gray-900">
                      {selectedStaff?.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Vai trò:</span>{" "}
                    <span className="font-medium text-gray-900">
                      {getRoleLabel(selectedStaff?.role)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assign New Route */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Gán tuyến đường mới
                </h4>
                <div className="flex gap-3">
                  <select
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={loadingRoutes || loadingModal}
                  >
                    <option value="">-- Chọn tuyến đường --</option>
                    {availableRoutes
                      .filter(
                        (route) =>
                          !staffRoutes.some(
                            (sr) => sr.routeId === route.routeId
                          )
                      )
                      .map((route) => (
                        <option key={route.routeId} value={route.routeId}>
                          {route.name} ({route.shipTime}) - Tỷ giá:{" "}
                          {formatCurrency(route.exchangeRate)}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={handleAssignRoute}
                    disabled={!selectedRouteId || loadingModal}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
                  >
                    {loadingModal ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Đang gán...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Gán Tuyến
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Current Routes */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Tuyến đường đã được gán ({staffRoutes.length})
                </h4>
                {loadingRoutes ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-indigo-600"></div>
                    <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
                  </div>
                ) : staffRoutes.length > 0 ? (
                  <div className="space-y-2">
                    {staffRoutes.map((route) => (
                      <div
                        key={route.routeId}
                        className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              #{route.routeId} - {route.name}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-xs text-gray-600">
                            <span>⏱️ {route.shipTime}</span>
                            <span>
                              💵 Tỷ giá: {formatCurrency(route.exchangeRate)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveRoute(route.routeId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Xóa quyền"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg border border-gray-200">
                    Chưa có tuyến đường nào được gán
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffListPermission;
