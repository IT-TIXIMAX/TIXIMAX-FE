// src/Pages/Manager/Dashboard/LoyalCustomer.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Trophy,
  Users,
  ChevronDown,
  Search,
  RefreshCw,
  X,
  Loader2,
  Package,
  User,
  UserCircle,
  Weight,
  Medal,
  Crown,
  Award,
  Star,
  Hash,
} from "lucide-react";
import userService from "../../Services/Manager/userService";
import toast from "react-hot-toast";

/* ===================== Config ===================== */
const ORDER_TYPES = [
  { key: "ALL", label: "Tất cả loại đơn", color: "blue" },
  { key: "MUA_HO", label: "Mua hộ", color: "green" },
  { key: "KY_GUI", label: "Ký gửi", color: "purple" },
  { key: "DAU_GIA", label: "Đấu giá", color: "orange" },
  { key: "THANH_TOAN_HO", label: "Thanh toán hộ", color: "indigo" },
  { key: "CHUYEN_TIEN", label: "Chuyển tiền", color: "pink" },
];

const DEFAULT_LIMIT = 100;

/* ===================== Format helpers ===================== */
const formatWeight = (weight) => {
  if (!weight && weight !== 0) return "0 kg";
  return `${parseFloat(weight).toFixed(2)} kg`;
};

/* ===================== Skeleton ===================== */
const TableSkeleton = ({ rows = 10 }) => (
  <>
    {Array.from({ length: rows }).map((_, idx) => (
      <tr key={idx} className="border-b border-gray-200 animate-pulse">
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded-full" />
            <div className="h-4 w-8 bg-gray-200 rounded" />
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-28 bg-gray-200 rounded" />
        </td>
        <td className="px-4 py-4">
          <div className="h-6 w-24 bg-gray-200 rounded-lg" />
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </td>
      </tr>
    ))}
  </>
);

const LoyalCustomer = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedOrderType, setSelectedOrderType] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [limitInput, setLimitInput] = useState(DEFAULT_LIMIT.toString());
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  /* ===================== Fetch Data ===================== */
  const fetchLoyalCustomers = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const orderType = selectedOrderType === "ALL" ? null : selectedOrderType;
      const response = await userService.getTopCustomersAll(orderType, limit);
      setData(response || {});
    } catch (err) {
      console.error("Error fetching loyal customers:", err);
      setError(
        err?.message || "Không thể tải danh sách khách hàng trung thành",
      );
      setData({});
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [selectedOrderType, limit]);

  useEffect(() => {
    fetchLoyalCustomers();
  }, [fetchLoyalCustomers]);

  /* ===================== Handle Limit Change ===================== */
  const handleApplyLimit = useCallback(() => {
    const newLimit = parseInt(limitInput);
    if (isNaN(newLimit) || newLimit < 1) {
      toast.error("Vui lòng nhập số lượng hợp lệ (>= 1)");
      setLimitInput(limit.toString());
      return;
    }
    if (newLimit > 1000) {
      toast.error("Số lượng tối đa là 1000");
      setLimitInput("1000");
      setLimit(1000);
      return;
    }
    setLimit(newLimit);
  }, [limitInput, limit]);

  const handleLimitKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleApplyLimit();
      }
    },
    [handleApplyLimit],
  );

  /* ===================== Get Current List ===================== */
  const currentList = useMemo(() => {
    if (selectedOrderType === "ALL") {
      // Combine all lists and sort by totalWeight
      const allCustomers = [];
      Object.entries(data).forEach(([orderType, customers]) => {
        customers.forEach((customer) => {
          allCustomers.push({ ...customer, orderType });
        });
      });
      return allCustomers.sort((a, b) => b.totalWeight - a.totalWeight);
    }
    return data[selectedOrderType] || [];
  }, [data, selectedOrderType]);

  /* ===================== Search Filter ===================== */
  const filteredList = useMemo(() => {
    if (!searchInput.trim()) return currentList;
    const searchLower = searchInput.toLowerCase();
    return currentList.filter(
      (customer) =>
        customer.customerName?.toLowerCase().includes(searchLower) ||
        customer.staffName?.toLowerCase().includes(searchLower) ||
        customer.customerId?.toString().includes(searchLower),
    );
  }, [currentList, searchInput]);

  /* ===================== Stats ===================== */
  const stats = useMemo(() => {
    const totalCustomers = currentList.length;
    const totalWeight = currentList.reduce(
      (sum, c) => sum + (c.totalWeight || 0),
      0,
    );
    const uniqueStaff = new Set(currentList.map((c) => c.staffId)).size;

    return {
      totalCustomers,
      totalWeight,
      uniqueStaff,
    };
  }, [currentList]);

  /* ===================== Get Rank Icon ===================== */
  const getRankIcon = useCallback((rank) => {
    if (rank === 1)
      return <Crown className="w-5 h-5 text-yellow-500" strokeWidth={2.5} />;
    if (rank === 2)
      return <Medal className="w-5 h-5 text-gray-400" strokeWidth={2.5} />;
    if (rank === 3)
      return <Award className="w-5 h-5 text-orange-600" strokeWidth={2.5} />;
    return <Star className="w-5 h-5 text-blue-500" strokeWidth={2} />;
  }, []);

  /* ===================== Get Rank Badge ===================== */
  const getRankBadge = useCallback((rank) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    if (rank === 2) return "bg-gray-100 text-gray-700 border-gray-300";
    if (rank === 3) return "bg-orange-100 text-orange-700 border-orange-300";
    return "bg-blue-50 text-blue-700 border-blue-200";
  }, []);

  /* ===================== Get Order Type Color ===================== */
  const getOrderTypeColor = useCallback((orderType) => {
    const typeConfig = ORDER_TYPES.find((t) => t.key === orderType);
    const color = typeConfig?.color || "gray";

    const colorMap = {
      blue: "bg-blue-100 text-blue-700 border-blue-300",
      green: "bg-green-100 text-green-700 border-green-300",
      purple: "bg-purple-100 text-purple-700 border-purple-300",
      orange: "bg-orange-100 text-orange-700 border-orange-300",
      indigo: "bg-indigo-100 text-indigo-700 border-indigo-300",
      pink: "bg-pink-100 text-pink-700 border-pink-300",
      gray: "bg-gray-100 text-gray-700 border-gray-300",
    };

    return colorMap[color] || colorMap.gray;
  }, []);

  /* ===================== Get Order Type Label ===================== */
  const getOrderTypeLabel = useCallback((orderType) => {
    const typeConfig = ORDER_TYPES.find((t) => t.key === orderType);
    return typeConfig?.label || orderType;
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Trophy size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Khách Hàng Trung Thành
                </h1>
              </div>
            </div>

            <button
              onClick={fetchLoyalCustomers}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Tổng Khách Hàng
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalCustomers}
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
                  Tổng Khối Lượng
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {formatWeight(stats.totalWeight)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Weight className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Số Nhân Viên
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.uniqueStaff}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <UserCircle className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Order Type Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại đơn hàng
              </label>
              <select
                value={selectedOrderType}
                onChange={(e) => setSelectedOrderType(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 pr-10 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all text-sm font-medium bg-white cursor-pointer"
              >
                {ORDER_TYPES.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-[38px] text-gray-400 pointer-events-none"
                size={18}
              />
            </div>

            {/* Limit Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng hiển thị
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={limitInput}
                    onChange={(e) => setLimitInput(e.target.value)}
                    onKeyDown={handleLimitKeyDown}
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all text-sm"
                    placeholder="100"
                  />
                </div>
                <button
                  onClick={handleApplyLimit}
                  disabled={loading}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  type="button"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm tên khách hàng, nhân viên..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all text-sm"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    type="button"
                    title="Xóa"
                  >
                    <X size={18} />
                  </button>
                )}
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
                    onClick={fetchLoyalCustomers}
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
                      Hạng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Khách hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Nhân viên phụ trách
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Loại đơn
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Tổng khối lượng
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <TableSkeleton rows={10} />
                </tbody>
              </table>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">
                Không tìm thấy khách hàng
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {searchInput
                  ? "Không có kết quả phù hợp với từ khóa"
                  : "Chưa có dữ liệu khách hàng trung thành"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Hạng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Khách hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Nhân viên phụ trách
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Loại đơn
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Tổng khối lượng
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredList.map((customer, index) => (
                    <tr
                      key={`${customer.customerId}-${customer.orderType}-${index}`}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {getRankIcon(customer.rank || index + 1)}
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${getRankBadge(
                              customer.rank || index + 1,
                            )}`}
                          >
                            {customer.rank || index + 1}
                          </span>
                        </div>
                      </td>

                      {/* Customer - ẨN ID */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {customer.customerName
                                ?.charAt(0)
                                ?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {customer.customerName || "—"}
                          </div>
                        </div>
                      </td>

                      {/* Staff - ẨN ID */}
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.staffName || "—"}
                        </div>
                      </td>

                      {/* Order Type */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${getOrderTypeColor(
                            customer.orderType,
                          )}`}
                        >
                          {getOrderTypeLabel(customer.orderType)}
                        </span>
                      </td>

                      {/* Total Weight */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Weight className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-bold text-green-600">
                            {formatWeight(customer.totalWeight)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Info */}
          {!loading && filteredList.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Hiển thị{" "}
                <span className="font-semibold text-gray-900">
                  {filteredList.length}
                </span>{" "}
                khách hàng
                {searchInput && (
                  <>
                    {" "}
                    (lọc từ{" "}
                    <span className="font-semibold text-gray-900">
                      {currentList.length}
                    </span>{" "}
                    khách hàng)
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoyalCustomer;
