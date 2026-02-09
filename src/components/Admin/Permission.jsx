// src/components/Manager/Permission.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Shield,
  ChevronDown,
  User,
  UserCircle,
  Mail,
  Phone,
  Route as RouteIcon,
  CheckCircle,
  X,
  Loader2,
  AlertTriangle,
  Search,
  RefreshCw,
} from "lucide-react";
import userService from "../../Services/Manager/userService";
import managerRoutesService from "../../Services/Manager/managerRoutesService";
import createAccountRoutesService from "../../Services/Auth/createAccountRouteService";
import ConfirmDialog from "../../common/ConfirmDialog";
import toast from "react-hot-toast";

const formatCurrency = (amount) => {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("vi-VN").format(amount);
};

const Permission = () => {
  const [staffList, setStaffList] = useState([]);
  const [routesList, setRoutesList] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Search states
  const [staffSearchInput, setStaffSearchInput] = useState("");
  const [routeSearchInput, setRouteSearchInput] = useState("");

  /* ===================== Fetch Staff List ===================== */
  const fetchStaffList = useCallback(async () => {
    setLoadingStaff(true);
    try {
      const response = await userService.getSaleLeadStaff(0, 100);
      setStaffList(response.content || []);
    } catch (error) {
      toast.error("Không thể tải danh sách nhân viên!");
      console.error("Error fetching staff:", error);
    } finally {
      setLoadingStaff(false);
    }
  }, []);

  /* ===================== Fetch Routes List ===================== */
  const fetchRoutesList = useCallback(async () => {
    setLoadingRoutes(true);
    try {
      const data = await managerRoutesService.getRoutes();
      setRoutesList(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách tuyến!");
      console.error("Error fetching routes:", error);
    } finally {
      setLoadingRoutes(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffList();
    fetchRoutesList();
  }, [fetchStaffList, fetchRoutesList]);

  /* ===================== Filtered Lists ===================== */
  const filteredStaffList = useMemo(() => {
    if (!staffSearchInput.trim()) return staffList;
    const searchLower = staffSearchInput.toLowerCase();
    return staffList.filter(
      (s) =>
        s.name?.toLowerCase().includes(searchLower) ||
        s.staffCode?.toLowerCase().includes(searchLower) ||
        s.email?.toLowerCase().includes(searchLower),
    );
  }, [staffList, staffSearchInput]);

  const filteredRoutesList = useMemo(() => {
    if (!routeSearchInput.trim()) return routesList;
    const searchLower = routeSearchInput.toLowerCase();
    return routesList.filter(
      (r) =>
        r.name?.toLowerCase().includes(searchLower) ||
        r.routeId?.toString().includes(searchLower),
    );
  }, [routesList, routeSearchInput]);

  /* ===================== Handlers ===================== */
  const handleAccountChange = useCallback(
    (accountId) => {
      setSelectedAccountId(accountId);
      const account = staffList.find(
        (s) => s.accountId === parseInt(accountId),
      );
      setSelectedAccount(account);
    },
    [staffList],
  );

  const handleRouteChange = useCallback(
    (routeId) => {
      setSelectedRouteId(routeId);
      const route = routesList.find((r) => r.routeId === parseInt(routeId));
      setSelectedRoute(route);
    },
    [routesList],
  );

  const handleAssignClick = useCallback(() => {
    if (!selectedAccount) {
      toast.error("Vui lòng chọn tài khoản!");
      return;
    }

    if (!selectedRouteId || selectedRouteId <= 0) {
      toast.error("Vui lòng chọn tuyến!");
      return;
    }

    setShowConfirmDialog(true);
  }, [selectedAccount, selectedRouteId]);

  const handleConfirmAssign = useCallback(async () => {
    setLoading(true);
    try {
      await createAccountRoutesService.assignRouteToAccount(
        selectedAccount.accountId,
        parseInt(selectedRouteId),
      );

      toast.success(
        `Đã gán tuyến "${selectedRoute?.name}" cho ${selectedAccount.name} thành công!`,
      );

      // Reset form
      setSelectedAccount(null);
      setSelectedAccountId("");
      setSelectedRouteId("");
      setSelectedRoute(null);
      setStaffSearchInput("");
      setRouteSearchInput("");
    } catch (error) {
      console.error("Error assigning route:", error);

      let errorMessage = error.message || "Có lỗi xảy ra khi gán tuyến!";

      if (error.response?.data) {
        errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          error.response.data.detail ||
          errorMessage;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  }, [selectedAccount, selectedRouteId, selectedRoute]);

  const handleClearSelection = useCallback(() => {
    setSelectedAccount(null);
    setSelectedAccountId("");
    setSelectedRouteId("");
    setSelectedRoute(null);
    setStaffSearchInput("");
    setRouteSearchInput("");
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Shield size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Gán Quyền Tuyến Cho Nhân Viên
                </h1>
              </div>
            </div>

            <button
              onClick={() => {
                fetchStaffList();
                fetchRoutesList();
              }}
              disabled={loadingStaff || loadingRoutes}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              type="button"
            >
              <RefreshCw
                size={16}
                className={loadingStaff || loadingRoutes ? "animate-spin" : ""}
              />
              Tải lại
            </button>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Account Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-blue-100">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800 text-lg">
                  Chọn nhân viên
                </h3>
              </div>

              {/* Search Staff */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhân viên..."
                  value={staffSearchInput}
                  onChange={(e) => setStaffSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all text-sm"
                />
              </div>

              {/* Staff Dropdown */}
              {loadingStaff ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm py-3 px-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải danh sách nhân viên...</span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedAccountId}
                    onChange={(e) => handleAccountChange(e.target.value)}
                    className="w-full appearance-none px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {filteredStaffList.map((staff) => (
                      <option key={staff.accountId} value={staff.accountId}>
                        {staff.staffCode} - {staff.name} ({staff.email})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              )}

              {/* Selected Staff Info */}
              {selectedAccount && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-blue-600 rounded-full" />
                      <h4 className="font-semibold text-gray-800">
                        Thông tin nhân viên đã chọn
                      </h4>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAccount(null);
                        setSelectedAccountId("");
                        setStaffSearchInput("");
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      type="button"
                      title="Bỏ chọn"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-700">Mã NV:</span>
                      <span className="text-gray-900 font-semibold">
                        {selectedAccount.staffCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-700">Tên:</span>
                      <span className="text-gray-900 font-semibold">
                        {selectedAccount.name}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="text-gray-900">
                        {selectedAccount.email}
                      </span>
                    </div>
                    {selectedAccount.phone && (
                      <div className="col-span-2 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-700">SĐT:</span>
                        <span className="text-gray-900">
                          {selectedAccount.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Route Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-green-100">
                <RouteIcon className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-800 text-lg">
                  Chọn tuyến vận chuyển
                </h3>
              </div>

              {/* Search Route */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm tuyến..."
                  value={routeSearchInput}
                  onChange={(e) => setRouteSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-green-500 transition-all text-sm"
                />
              </div>

              {/* Route Dropdown */}
              {loadingRoutes ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm py-3 px-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải danh sách tuyến...</span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedRouteId}
                    onChange={(e) => handleRouteChange(e.target.value)}
                    className="w-full appearance-none px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-green-500 transition-all cursor-pointer"
                  >
                    <option value="">-- Chọn tuyến vận chuyển --</option>
                    {filteredRoutesList.map((route) => (
                      <option key={route.routeId} value={route.routeId}>
                        #{route.routeId} - {route.name} ({route.shipTime}) - Tỷ
                        giá:{" "}
                        {route.exchangeRate
                          ? formatCurrency(route.exchangeRate)
                          : "N/A"}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              )}

              {/* Selected Route Info */}
              {selectedRoute && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-green-600 rounded-full" />
                      <h4 className="font-semibold text-gray-800">
                        Thông tin tuyến đã chọn
                      </h4>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRoute(null);
                        setSelectedRouteId("");
                        setRouteSearchInput("");
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      type="button"
                      title="Bỏ chọn"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <RouteIcon className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-700">
                        Mã tuyến:
                      </span>
                      <span className="text-gray-900 font-semibold">
                        #{selectedRoute.routeId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Tên:</span>
                      <span className="text-gray-900 font-semibold">
                        {selectedRoute.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">
                        Thời gian:
                      </span>
                      <span className="text-gray-900">
                        {selectedRoute.shipTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Tỷ giá:</span>
                      <span className="text-gray-900 font-mono font-semibold">
                        {selectedRoute.exchangeRate
                          ? formatCurrency(selectedRoute.exchangeRate)
                          : "N/A"}
                      </span>
                    </div>
                    {selectedRoute.note && (
                      <div className="col-span-2 flex items-start gap-2">
                        <span className="font-medium text-gray-700">
                          Ghi chú:
                        </span>
                        <span className="text-gray-900">
                          {selectedRoute.note}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Summary Box */}
            {selectedAccount && selectedRoute && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-800">
                    Tóm tắt gán quyền
                  </h4>
                </div>

                <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Nhân viên:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedAccount.name} ({selectedAccount.staffCode})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tuyến:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedRoute.name} (#{selectedRoute.routeId})
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={handleClearSelection}
                disabled={loading || (!selectedAccount && !selectedRoute)}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                Xóa chọn
              </button>

              <button
                onClick={handleAssignClick}
                disabled={loading || !selectedAccount || !selectedRouteId}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                type="button"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Gán Tuyến
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmAssign}
        title="Xác nhận gán quyền"
        message={`Bạn có chắc chắn muốn gán tuyến "${selectedRoute?.name}" cho ${selectedAccount?.name}?`}
        confirmText="Gán Tuyến"
        cancelText="Hủy"
        loading={loading}
      />
    </div>
  );
};

export default Permission;
