import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Truck,
  Car,
  DollarSign,
  CheckCircle,
  Users,
  Weight,
  Calendar,
  Filter,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";
import dashboardWarehouseService from "../../Services/Dashboard/dashboardwarehouseService";
import FilterRoute from "../../components/Filter/FilterRoute";

const FILTER_TYPES = [
  { value: "DAY", label: "Hôm nay" },
  { value: "WEEK", label: "Tuần này" },
  { value: "MONTH", label: "Tháng này" },
  { value: "QUARTER", label: "Quý này" },
  { value: "CUSTOM", label: "Tùy chỉnh" },
];

const DEFAULT_FILTERS = {
  filterType: "DAY",
  routeId: "",
  startDate: "",
  endDate: "",
};

const STATS_CONFIG = [
  {
    key: "inStock",
    title: "Hàng trong kho",
    icon: Package,
    bgGradient: "from-blue-50 to-blue-100",
    iconColor: "bg-blue-600",
    textColor: "text-blue-600",
  },
  {
    key: "exportByVnPost",
    title: "Xuất VnPost",
    icon: Truck,
    bgGradient: "from-green-50 to-green-100",
    iconColor: "bg-green-600",
    textColor: "text-green-600",
  },
  {
    key: "exportByOther",
    title: "Đơn vị khác",
    icon: Car,
    bgGradient: "from-orange-50 to-orange-100",
    iconColor: "bg-orange-600",
    textColor: "text-orange-600",
  },
  {
    key: "unpaid_SHIPPING",
    title: "Chưa thanh toán",
    icon: DollarSign,
    bgGradient: "from-red-50 to-red-100",
    iconColor: "bg-red-600",
    textColor: "text-red-600",
  },
  {
    key: "paid_SHIPPING",
    title: "Đã thanh toán",
    icon: CheckCircle,
    bgGradient: "from-emerald-50 to-emerald-100",
    iconColor: "bg-emerald-600",
    textColor: "text-emerald-600",
  },
];

const FilterDialog = ({ show, filters, onClose, onApply }) => {
  const [tempFilters, setTempFilters] = useState({ ...filters });

  useEffect(() => {
    if (show) {
      setTempFilters({ ...filters });
    }
  }, [show, filters]);

  const handleChange = (key, value) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    if (tempFilters.filterType === "CUSTOM") {
      if (!tempFilters.startDate || !tempFilters.endDate) {
        alert("Vui lòng chọn ngày bắt đầu và kết thúc");
        return;
      }
      if (tempFilters.startDate > tempFilters.endDate) {
        alert("Ngày bắt đầu phải trước ngày kết thúc");
        return;
      }
    }
    onApply(tempFilters);
  };

  const handleReset = () => {
    setTempFilters(DEFAULT_FILTERS);
  };

  if (!show) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-white" />
              <h2 className="text-xl font-bold text-white">Bộ lọc dữ liệu</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Khoảng thời gian
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FILTER_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleChange("filterType", type.value)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        tempFilters.filterType === type.value
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {tempFilters.filterType === "CUSTOM" && (
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">
                      Chọn khoảng thời gian tùy chỉnh
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Từ ngày
                      </label>
                      <input
                        type="date"
                        value={tempFilters.startDate}
                        onChange={(e) =>
                          handleChange("startDate", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Đến ngày
                      </label>
                      <input
                        type="date"
                        value={tempFilters.endDate}
                        onChange={(e) =>
                          handleChange("endDate", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Thay thế input number bằng FilterRoute */}
              <FilterRoute
                value={tempFilters.routeId}
                onChange={(value) => handleChange("routeId", value)}
                label="Tuyến đường "
                placeholder="Tất cả tuyến đường"
                showIcon={true}
                showLabel={true}
                showNote={true}
                selectClassName="border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between gap-3">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
            >
              Đặt lại
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleApply}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg text-sm font-semibold"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const StatCardSkeleton = ({ bgGradient }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
      <div className={`p-5 md:p-6 bg-gradient-to-br ${bgGradient}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 bg-gray-300 rounded"></div>
          <div className="p-2.5 rounded-lg bg-gray-300 w-10 h-10"></div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-baseline gap-2">
              <div className="h-12 md:h-14 w-20 bg-gray-300 rounded"></div>
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-5 w-20 bg-gray-300 rounded"></div>
              </div>
              <div>
                <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-5 w-12 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ config, data }) => {
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      <div className={`p-5 md:p-6 bg-gradient-to-br ${config.bgGradient}`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600 text-sm md:text-base font-semibold uppercase tracking-wide">
            {config.title}
          </span>
          <div className={`p-2.5 rounded-lg ${config.iconColor}`}>
            <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-4xl md:text-5xl lg:text-6xl font-bold ${config.textColor}`}
              >
                {data?.totalCodes || 0}
              </span>
              <span className="text-base md:text-lg text-gray-600 font-medium">
                mã
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Weight className="w-4 h-4 text-gray-500" />
                  <span className="text-xs md:text-sm text-gray-500 font-medium">
                    Khối lượng
                  </span>
                </div>
                <span className="text-base md:text-lg font-bold text-gray-800">
                  {(data?.totalWeight || 0).toFixed(2)} kg
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-xs md:text-sm text-gray-500 font-medium">
                    Khách hàng
                  </span>
                </div>
                <span className="text-base md:text-lg font-bold text-gray-800">
                  {data?.totalCustomers || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardWarehouseDomestic = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (currentFilters = filters) => {
    setLoading(true);
    setError(null);

    try {
      const params = { filter: currentFilters.filterType };

      if (currentFilters.filterType === "CUSTOM") {
        params.start = currentFilters.startDate;
        params.end = currentFilters.endDate;
      }

      if (currentFilters.routeId) {
        params.routeId = Number(currentFilters.routeId);
      }

      const response = await dashboardWarehouseService.getDashboardData(params);
      setDashboardData(response.data);
    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = useCallback((newFilters) => {
    setFilters(newFilters);
    setShowFilterDialog(false);
    fetchDashboardData(newFilters);
  }, []);

  const getFilterLabel = () => {
    const type = FILTER_TYPES.find((t) => t.value === filters.filterType);
    let label = type?.label || "Hôm nay";

    if (
      filters.filterType === "CUSTOM" &&
      filters.startDate &&
      filters.endDate
    ) {
      label = `${filters.startDate} đến ${filters.endDate}`;
    }

    if (filters.routeId) {
      label += ` - Tuyến ${filters.routeId}`;
    }

    return label;
  };

  const totalStats = dashboardData
    ? {
        totalCodes: Object.values(dashboardData).reduce(
          (sum, item) => sum + (item.totalCodes || 0),
          0,
        ),
        totalWeight: Object.values(dashboardData).reduce(
          (sum, item) => sum + (item.totalWeight || 0),
          0,
        ),
        totalCustomers: Math.max(
          ...Object.values(dashboardData).map(
            (item) => item.totalCustomers || 0,
          ),
        ),
      }
    : null;

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 md:h-10 bg-gradient-to-b from-blue-600 to-blue-700 rounded-full"></div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Thống Kê Kho Nội Địa
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilterDialog(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Bộ lọc</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg w-fit">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">
              {getFilterLabel()}
            </span>
          </div>
        </div>

        {/* Filter Dialog */}
        <FilterDialog
          show={showFilterDialog}
          filters={filters}
          onClose={() => setShowFilterDialog(false)}
          onApply={handleApplyFilter}
        />

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-800 mb-1">
                  Có lỗi xảy ra
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-red-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {loading ? (
          <>
            {/* Total Summary Skeleton */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 mb-6 md:mb-8 animate-pulse">
              <div className="h-6 w-32 bg-white/20 rounded mb-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                  >
                    <div className="h-3 w-24 bg-white/20 rounded mb-2"></div>
                    <div className="h-8 w-16 bg-white/30 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
              {STATS_CONFIG.map((config) => (
                <StatCardSkeleton
                  key={config.key}
                  bgGradient={config.bgGradient}
                />
              ))}
            </div>
          </>
        ) : dashboardData ? (
          <>
            {/* Total Summary */}
            {totalStats && (
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 mb-6 md:mb-8">
                <h2 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
                  Tổng quan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-blue-50 text-xl font-medium mb-1">
                      Tổng mã vận đơn
                    </div>
                    <div className="text-white text-2xl md:text-3xl font-bold">
                      {totalStats.totalCodes}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-blue-50 text-xl font-medium mb-1">
                      Tổng khối lượng
                    </div>
                    <div className="text-white text-2xl md:text-3xl font-bold">
                      {totalStats.totalWeight.toFixed(2)} kg
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-blue-50 text-xl font-medium mb-1">
                      Tổng khách hàng
                    </div>
                    <div className="text-white text-2xl md:text-3xl font-bold">
                      {totalStats.totalCustomers}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
              {STATS_CONFIG.map((config) => (
                <StatCard
                  key={config.key}
                  config={config}
                  data={dashboardData[config.key]}
                />
              ))}
            </div>
          </>
        ) : !error ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-md">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-bold text-gray-800 mb-2">
              Chưa có dữ liệu
            </p>
            <p className="text-sm text-gray-500 font-medium">
              Vui lòng chọn bộ lọc và nhấn "Áp dụng"
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DashboardWarehouseDomestic;
