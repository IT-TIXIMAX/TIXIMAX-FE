// src/Pages/Manager/Staff/StaffList.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  Eye,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  X,
  RefreshCw,
  Filter,
  UserCircle,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  Loader2,
  User,
  Briefcase,
  MapPin,
  Shield,
  Route as RouteIcon,
} from "lucide-react";
import userService from "../../Services/Manager/userService";
import registrationService from "../../Services/Auth/Registration";
import managerRoutesService from "../../Services/Manager/managerRoutesService";
import registrationByStaffService from "../../Services/Auth/RegistrationByStaffService";
import createAccountRoutesService from "../../Services/Auth/createAccountRouteService";
import ConfirmDialog from "../../common/ConfirmDialog";
import toast from "react-hot-toast";

/* ===================== Config ===================== */
const ROLE_OPTIONS = [
  { key: "ADMIN", label: "Quản trị viên", color: "red" },
  { key: "MANAGER", label: "Quản lý", color: "orange" },
  { key: "LEAD_SALE", label: "Trưởng nhóm bán hàng", color: "green" },
  { key: "STAFF_SALE", label: "Nhân viên bán hàng", color: "blue" },
  { key: "STAFF_PURCHASER", label: "Nhân viên mua hộ", color: "gray" },
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
];

const STATUS_OPTIONS = [
  { key: "ALL", label: "Tất cả trạng thái" },
  { key: "HOAT_DONG", label: "Hoạt động" },
  { key: "KHONG_HOAT_DONG", label: "Không hoạt động" },
];

const PAGE_SIZES = [50, 100, 200, 500];

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

const TableSkeleton = ({ rows = 8 }) => (
  <>
    {Array.from({ length: rows }).map((_, idx) => (
      <tr key={idx} className="border-b border-gray-200 animate-pulse">
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </td>
        <td className="px-4 py-4">
          <div className="h-6 w-28 bg-gray-200 rounded-lg" />
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </td>
        <td className="px-4 py-4">
          <div className="space-y-2">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-28 bg-gray-200 rounded" />
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="h-6 w-24 bg-gray-200 rounded-lg" />
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            <div className="h-8 w-16 bg-gray-200 rounded-lg" />
            <div className="h-8 w-16 bg-gray-200 rounded-lg" />
          </div>
        </td>
      </tr>
    ))}
  </>
);

/* ===================== Format helpers ===================== */
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

const formatCurrency = (amount) => {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("vi-VN").format(amount);
};

const StaffList = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search states
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Filter states
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ✅ Create Staff Modal states
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phone: "",
    name: "",
    role: "",
    department: "",
    location: "",
    routeIds: [],
  });
  const [formErrors, setFormErrors] = useState({});

  // ✅ Permission Modal states
  const [openPermissionModal, setOpenPermissionModal] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [loadingRoutesForPermission, setLoadingRoutesForPermission] =
    useState(false);
  const [routesForPermission, setRoutesForPermission] = useState([]);
  const [selectedStaffForPermission, setSelectedStaffForPermission] =
    useState(null);
  const [selectedRouteIdForPermission, setSelectedRouteIdForPermission] =
    useState("");
  const [selectedRouteForPermission, setSelectedRouteForPermission] =
    useState(null);
  const [showPermissionConfirm, setShowPermissionConfirm] = useState(false);

  // Role map
  const roleMap = useMemo(() => {
    const m = new Map();
    ROLE_OPTIONS.forEach((r) => m.set(r.key, r));
    return m;
  }, []);

  /* ===================== Load Routes for Create ===================== */
  useEffect(() => {
    if (openCreateModal) {
      managerRoutesService
        .getRoutes()
        .then(setRoutes)
        .catch(() => toast.error("Không thể tải danh sách tuyến"));
    }
  }, [openCreateModal]);

  /* ===================== Load Routes for Permission ===================== */
  useEffect(() => {
    if (openPermissionModal) {
      setLoadingRoutesForPermission(true);
      managerRoutesService
        .getRoutes()
        .then((data) => {
          setRoutesForPermission(data);
          setLoadingRoutesForPermission(false);
        })
        .catch(() => {
          toast.error("Không thể tải danh sách tuyến");
          setLoadingRoutesForPermission(false);
        });
    }
  }, [openPermissionModal]);

  /* ===================== API Call ===================== */
  const fetchStaffAccounts = useCallback(
    async (page, size, term) => {
      setError(null);
      setLoading(true);
      try {
        const roleForApi = selectedRole === "ALL" ? null : selectedRole;

        const response = await userService.getAccounts(
          page,
          size,
          term,
          roleForApi,
        );

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
    [selectedRole],
  );

  /* ===================== Effects ===================== */
  useEffect(() => {
    fetchStaffAccounts(0, pageSize, appliedSearch);
  }, [pageSize, appliedSearch, selectedRole, fetchStaffAccounts]);

  /* ===================== Handlers ===================== */
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 0 && newPage < totalPages && !loading) {
        fetchStaffAccounts(newPage, pageSize, appliedSearch);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages, pageSize, loading, fetchStaffAccounts, appliedSearch],
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

  /* ===================== Create Staff Handlers ===================== */
  const handleOpenCreateModal = useCallback(() => {
    setOpenCreateModal(true);
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
      name: "",
      role: "",
      department: "",
      location: "",
      routeIds: [],
    });
    setFormErrors({});
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setOpenCreateModal(false);
    setFormData({
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
      name: "",
      role: "",
      department: "",
      location: "",
      routeIds: [],
    });
    setFormErrors({});
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFormErrors((p) => ({ ...p, [name]: "" }));
  }, []);

  const handleRouteToggle = useCallback((routeId) => {
    setFormData((p) => ({
      ...p,
      routeIds: p.routeIds.includes(routeId)
        ? p.routeIds.filter((id) => id !== routeId)
        : [...p.routeIds, routeId],
    }));
  }, []);

  const handleSubmitClick = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  const handleConfirmSubmit = useCallback(async () => {
    try {
      setCreateLoading(true);
      setFormErrors({});

      const validation =
        registrationByStaffService.validateStaffRegistrationData(formData);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        setShowConfirmDialog(false);
        return;
      }

      const { confirmPassword, ...payload } = formData;
      const res = await registrationService.registerStaff(payload);

      toast.success(`Tạo tài khoản thành công! Mã NV: ${res.staffCode}`);

      handleCloseCreateModal();
      setShowConfirmDialog(false);
      fetchStaffAccounts(currentPage, pageSize, appliedSearch);
    } catch (err) {
      console.error("Registration error:", err);

      const errorMessage = err.response?.data?.message || "";
      const errorData = err.response?.data;

      if (
        errorMessage.toLowerCase().includes("username") ||
        errorMessage.includes("đăng nhập") ||
        errorMessage.includes("trùng") ||
        errorData?.field === "username"
      ) {
        setFormErrors((prev) => ({
          ...prev,
          username: errorMessage || "Tên đăng nhập đã tồn tại!",
        }));
        toast.error("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!");
      } else if (
        errorMessage.toLowerCase().includes("email") ||
        errorData?.field === "email"
      ) {
        setFormErrors((prev) => ({
          ...prev,
          email: errorMessage || "Email đã được sử dụng!",
        }));
        toast.error("Email đã được sử dụng!");
      } else if (
        errorMessage.toLowerCase().includes("phone") ||
        errorMessage.toLowerCase().includes("số điện thoại") ||
        errorData?.field === "phone"
      ) {
        setFormErrors((prev) => ({
          ...prev,
          phone: errorMessage || "Số điện thoại đã được sử dụng!",
        }));
        toast.error("Số điện thoại đã được sử dụng!");
      } else if (errorData?.errors && typeof errorData.errors === "object") {
        setFormErrors(errorData.errors);
        toast.error("Vui lòng kiểm tra lại thông tin!");
      } else {
        setFormErrors((prev) => ({
          ...prev,
          general: errorMessage || "Có lỗi xảy ra khi tạo tài khoản",
        }));
        toast.error(errorMessage || "Có lỗi xảy ra khi tạo tài khoản");
      }
    } finally {
      setCreateLoading(false);
      setShowConfirmDialog(false);
    }
  }, [
    formData,
    handleCloseCreateModal,
    fetchStaffAccounts,
    currentPage,
    pageSize,
    appliedSearch,
  ]);

  /* ===================== Permission Handlers ===================== */
  const handleOpenPermissionModal = useCallback((staff) => {
    setSelectedStaffForPermission(staff);
    setOpenPermissionModal(true);
    setSelectedRouteIdForPermission("");
    setSelectedRouteForPermission(null);
  }, []);

  const handleClosePermissionModal = useCallback(() => {
    setOpenPermissionModal(false);
    setSelectedStaffForPermission(null);
    setSelectedRouteIdForPermission("");
    setSelectedRouteForPermission(null);
  }, []);

  const handleRouteChangeForPermission = useCallback(
    (routeId) => {
      setSelectedRouteIdForPermission(routeId);
      const route = routesForPermission.find(
        (r) => r.routeId === parseInt(routeId),
      );
      setSelectedRouteForPermission(route);
    },
    [routesForPermission],
  );

  const handleAssignRouteClick = useCallback(() => {
    if (!selectedStaffForPermission) {
      toast.error("Vui lòng chọn nhân viên!");
      return;
    }

    if (!selectedRouteIdForPermission || selectedRouteIdForPermission <= 0) {
      toast.error("Vui lòng chọn tuyến!");
      return;
    }

    setShowPermissionConfirm(true);
  }, [selectedStaffForPermission, selectedRouteIdForPermission]);

  const handleConfirmAssignRoute = useCallback(async () => {
    setPermissionLoading(true);
    try {
      await createAccountRoutesService.assignRouteToAccount(
        selectedStaffForPermission.accountId,
        parseInt(selectedRouteIdForPermission),
      );

      toast.success(
        `Đã gán tuyến "${selectedRouteForPermission?.name}" cho ${selectedStaffForPermission.name} thành công!`,
      );

      handleClosePermissionModal();
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
      setPermissionLoading(false);
      setShowPermissionConfirm(false);
    }
  }, [
    selectedStaffForPermission,
    selectedRouteIdForPermission,
    selectedRouteForPermission,
    handleClosePermissionModal,
  ]);

  /* ===================== Computed ===================== */
  const filteredStaff = useMemo(() => {
    let filtered = [...staffList];

    if (selectedStatus !== "ALL") {
      filtered = filtered.filter((staff) => staff.status === selectedStatus);
    }

    return filtered;
  }, [staffList, selectedStatus]);

  const showingFrom = totalElements ? currentPage * pageSize + 1 : 0;
  const showingTo = Math.min((currentPage + 1) * pageSize, totalElements);

  /* ===================== Utils ===================== */
  const getRoleInfo = useCallback(
    (role) =>
      roleMap.get(role) || {
        label: role || "—",
        color: "gray",
      },
    [roleMap],
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

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Users size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Quản Lý Nhân Viên
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  fetchStaffAccounts(currentPage, pageSize, appliedSearch)
                }
                disabled={loading}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                type="button"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Tải lại
              </button>

              <button
                onClick={handleOpenCreateModal}
                type="button"
                className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <UserPlus size={16} />
                Thêm nhân viên
              </button>
            </div>
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
                      Tổng Nhân Viên
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
                      Hoạt động
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {staffList.filter((s) => s.status === "HOAT_DONG").length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Unlock className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Không hoạt động
                    </p>
                    <p className="text-3xl font-bold text-gray-600">
                      {staffList.filter((s) => s.status !== "HOAT_DONG").length}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Lock className="text-gray-600" size={24} />
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
                      {filteredStaff.length}
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

        {/* Search & Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Row 1: Search + Role + Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Tìm tên, username, email, SĐT..."
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

              {/* Role Filter */}
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 pr-10 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all text-sm font-medium bg-white cursor-pointer"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.key} value={role.key}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={18}
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 pr-10 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all text-sm font-medium bg-white cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={18}
                />
              </div>
            </div>

            {/* Row 2: Search Button + Page Size */}
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center lg:justify-between">
              <button
                onClick={handleApplySearch}
                disabled={loading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                type="button"
              >
                <Search size={18} />
                Tìm kiếm
              </button>

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
                      fetchStaffAccounts(currentPage, pageSize, appliedSearch)
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Nhân viên
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã NV
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Vai trò
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Phòng ban
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Liên hệ
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Trạng thái
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <TableSkeleton rows={8} />
                </tbody>
              </table>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-12 text-center">
              <UserCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">
                Không tìm thấy nhân viên
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {appliedSearch
                  ? "Không có kết quả phù hợp với từ khóa"
                  : "Chưa có nhân viên nào trong hệ thống"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Nhân viên
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã NV
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Vai trò
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Phòng ban
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Liên hệ
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Trạng thái
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Thao Tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredStaff.map((staff, index) => {
                    const roleInfo = getRoleInfo(staff.role);
                    const isActive = staff.status === "HOAT_DONG";

                    return (
                      <tr
                        key={staff.accountId ?? `staff-${index}`}
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        {/* Nhân viên */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {staff.name?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {staff.name || "—"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {staff.username || "—"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Mã NV */}
                        <td className="px-4 py-4">
                          <span className="text-sm font-medium text-blue-600">
                            {staff.staffCode || "—"}
                          </span>
                        </td>

                        {/* Vai trò */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${getRoleColor(
                              roleInfo.color,
                            )}`}
                          >
                            {roleInfo.label}
                          </span>
                        </td>

                        {/* Phòng ban */}
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900">
                            {staff.department || "—"}
                          </span>
                        </td>

                        {/* Liên hệ */}
                        <td className="px-4 py-4">
                          <div className="max-w-[200px]">
                            <span className="text-sm text-gray-900 truncate block">
                              {staff.email || "—"}
                            </span>
                            <span className="text-xs text-gray-500 truncate block">
                              {staff.phone || "—"}
                            </span>
                          </div>
                        </td>

                        {/* Trạng thái */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
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

                        {/* Ngày tạo */}
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900">
                            {formatDateTime(staff.createdAt)}
                          </span>
                        </td>

                        {/* Thao tác */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 text-sm"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                              Xem
                            </button>

                            <button
                              onClick={() => handleOpenPermissionModal(staff)}
                              type="button"
                              className="px-3 py-2 bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 font-medium transition-all flex items-center gap-2 text-sm"
                              title="Cấp quyền tuyến"
                            >
                              <Shield size={16} />
                              Quyền
                            </button>
                          </div>
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
                  nhân viên
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

      {/* ✅ CREATE STAFF MODAL */}
      {openCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <UserPlus className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Tạo Tài Khoản Nhân Viên
                  </h2>
                </div>
              </div>
              <button
                className="text-white/80 hover:text-white transition-colors"
                onClick={handleCloseCreateModal}
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6 space-y-6">
              {/* Account Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b-2 border-blue-100">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800 text-lg">
                    Thông tin tài khoản
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên đăng nhập <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`w-full border-2 rounded-lg px-3 py-2.5 outline-none focus:ring-0 transition-all ${
                        formErrors.username
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="username"
                    />
                    {formErrors.username && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {formErrors.username}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full border-2 rounded-lg px-3 py-2.5 outline-none focus:ring-0 transition-all ${
                        formErrors.password
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="••••••••"
                    />
                    {formErrors.password && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {formErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full border-2 rounded-lg px-3 py-2.5 outline-none focus:ring-0 transition-all ${
                        formErrors.confirmPassword
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="••••••••"
                    />
                    {formErrors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b-2 border-blue-100">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800 text-lg">
                    Thông tin cá nhân
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full border-2 rounded-lg px-3 py-2.5 outline-none focus:ring-0 transition-all ${
                        formErrors.name
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="Nguyễn Văn A"
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full border-2 rounded-lg px-3 py-2.5 outline-none focus:ring-0 transition-all ${
                        formErrors.email
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="email@example.com"
                    />
                    {formErrors.email && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full border-2 rounded-lg px-3 py-2.5 outline-none focus:ring-0 transition-all ${
                        formErrors.phone
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="0123456789"
                    />
                    {formErrors.phone && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Work Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b-2 border-blue-100">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800 text-lg">
                    Thông tin công việc
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Role */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vai trò <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className={`w-full appearance-none border-2 rounded-lg px-3 py-2.5 pr-10 outline-none focus:ring-0 transition-all cursor-pointer ${
                        formErrors.role
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                    >
                      <option value="">-- Chọn vai trò --</option>
                      <option value="STAFF_SALE">Nhân viên bán hàng</option>
                      <option value="LEAD_SALE">Trưởng nhóm bán hàng</option>
                      <option value="STAFF_PURCHASER">
                        Nhân viên mua hàng
                      </option>
                      <option value="STAFF_WAREHOUSE_FOREIGN">
                        Nhân viên kho ngoại
                      </option>
                      <option value="STAFF_WAREHOUSE_DOMESTIC">
                        Nhân viên kho nội
                      </option>
                      <option value="MANAGER">Quản lý</option>
                    </select>
                    <ChevronDown
                      className="absolute right-3 top-[38px] text-gray-400 pointer-events-none"
                      size={18}
                    />
                    {formErrors.role && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {formErrors.role}
                      </p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phòng ban
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-0 focus:border-blue-500 transition-all"
                      placeholder="Phòng kinh doanh"
                    />
                  </div>
                </div>
              </div>

              {/* Routes Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b-2 border-blue-100">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800 text-lg">
                    Tuyến đường phụ trách
                  </h3>
                </div>

                <div className="border-2 border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
                  {routes.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">
                        Đang tải danh sách tuyến...
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {routes.map((r) => (
                        <label
                          key={r.routeId}
                          className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2.5 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={formData.routeIds.includes(r.routeId)}
                            onChange={() => handleRouteToggle(r.routeId)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {r.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formErrors.routeIds && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {formErrors.routeIds}
                  </p>
                )}
              </div>

              {/* General Error */}
              {formErrors.general && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border-2 border-red-200 px-4 py-3 rounded-lg">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {formErrors.general}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 sticky bottom-0">
              <button
                onClick={handleCloseCreateModal}
                disabled={createLoading}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitClick}
                disabled={createLoading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {createLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Tạo tài khoản
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ PERMISSION MODAL */}
      {openPermissionModal && selectedStaffForPermission && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Shield className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Cấp Quyền Tuyến
                  </h2>
                </div>
              </div>
              <button
                className="text-white/80 hover:text-white transition-colors"
                onClick={handleClosePermissionModal}
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6 space-y-6">
              {/* Staff Info */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-1 h-5 bg-blue-600 rounded-full" />
                  <h3 className="font-semibold text-gray-800">
                    Thông tin nhân viên
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-700">Mã NV:</span>
                    <span className="text-gray-900 font-semibold">
                      {selectedStaffForPermission.staffCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-700">Tên:</span>
                    <span className="text-gray-900 font-semibold">
                      {selectedStaffForPermission.name}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="text-gray-900">
                      {selectedStaffForPermission.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Route Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn tuyến vận chuyển <span className="text-red-500">*</span>
                </label>

                {loadingRoutesForPermission ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm py-3 px-4 border-2 border-gray-200 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tải danh sách tuyến...</span>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedRouteIdForPermission}
                      onChange={(e) =>
                        handleRouteChangeForPermission(e.target.value)
                      }
                      className="w-full appearance-none px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-green-500 transition-all cursor-pointer"
                    >
                      <option value="">-- Chọn tuyến vận chuyển --</option>
                      {routesForPermission.map((route) => (
                        <option key={route.routeId} value={route.routeId}>
                          #{route.routeId} - {route.name} ({route.shipTime}) -
                          Tỷ giá:{" "}
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
              </div>

              {/* Selected Route Info */}
              {selectedRouteForPermission && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-1 h-5 bg-green-600 rounded-full" />
                    <h3 className="font-semibold text-gray-800">
                      Thông tin tuyến đã chọn
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <RouteIcon className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-700">
                        Mã tuyến:
                      </span>
                      <span className="text-gray-900 font-semibold">
                        #{selectedRouteForPermission.routeId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Tên:</span>
                      <span className="text-gray-900 font-semibold">
                        {selectedRouteForPermission.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">
                        Thời gian:
                      </span>
                      <span className="text-gray-900">
                        {selectedRouteForPermission.shipTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Tỷ giá:</span>
                      <span className="text-gray-900 font-mono font-semibold">
                        {selectedRouteForPermission.exchangeRate
                          ? formatCurrency(
                              selectedRouteForPermission.exchangeRate,
                            )
                          : "N/A"}
                      </span>
                    </div>
                    {selectedRouteForPermission.note && (
                      <div className="col-span-2 flex items-start gap-2">
                        <span className="font-medium text-gray-700">
                          Ghi chú:
                        </span>
                        <span className="text-gray-900">
                          {selectedRouteForPermission.note}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={handleClosePermissionModal}
                disabled={permissionLoading}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                Hủy
              </button>
              <button
                onClick={handleAssignRouteClick}
                disabled={permissionLoading || !selectedRouteIdForPermission}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {permissionLoading ? (
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
      )}

      {/* ✅ CONFIRM DIALOGS */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSubmit}
        title="Xác nhận tạo tài khoản"
        message={`Bạn có chắc chắn muốn tạo tài khoản cho ${formData.name || formData.username}?`}
        confirmText="Tạo tài khoản"
        cancelText="Hủy"
        loading={createLoading}
      />

      <ConfirmDialog
        isOpen={showPermissionConfirm}
        onClose={() => setShowPermissionConfirm(false)}
        onConfirm={handleConfirmAssignRoute}
        title="Xác nhận cấp quyền"
        message={`Bạn có chắc chắn muốn gán tuyến "${selectedRouteForPermission?.name}" cho ${selectedStaffForPermission?.name}?`}
        confirmText="Gán Tuyến"
        cancelText="Hủy"
        loading={permissionLoading}
      />
    </div>
  );
};

export default StaffList;
