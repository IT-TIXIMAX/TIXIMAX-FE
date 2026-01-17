import React, { useState, useEffect, useMemo, useCallback } from "react";
import dashboardService from "../../Services/Dashboard/dashboardService";
import managerRoutesService from "../../Services/Manager/managerRoutesService";
import {
  Truck,
  DollarSign,
  Weight,
  Users,
  Calendar,
  BarChart3,
  Filter,
  X,
} from "lucide-react";
import FilterRoute from "../Filter/FilterRoute"; // ✅ chỉnh path đúng theo project bạn

const FILTER_TYPES = [
  { value: "DAY", label: "Hôm nay" },
  { value: "MONTH", label: "Tháng này" },
  { value: "QUARTER", label: "Quý này" },
  { value: "HALF_YEAR", label: "6 tháng" },
  { value: "CUSTOM", label: "Tùy chỉnh" },
];

const DEFAULT_FILTERS = {
  routeId: "",
  filterType: "MONTH",
  startDate: "",
  endDate: "",
};

/** ✅ Format tiền theo từng tuyến: "12,345 IDR" */
const formatMoney = (value, currency) => {
  const n = Number(value || 0);
  const formatted = new Intl.NumberFormat("vi-VN").format(n);
  return currency ? `${formatted} ${currency}` : formatted;
};

const getPerformanceColor = (value, max) => {
  const percent = (value / max) * 100;
  if (percent >= 70) return "bg-green-500";
  if (percent >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

/* ===================== Loading skeleton ===================== */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const SummaryCardSkeleton = ({ bgGradient = "from-gray-50 to-gray-100" }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
    <div className={`p-4 md:p-5 bg-gradient-to-br ${bgGradient}`}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
);

const RouteCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
    <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Skeleton className="h-6 w-6 bg-white/40" />
        </div>
        <Skeleton className="h-5 w-40 bg-white/40" />
      </div>
    </div>

    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="grid grid-cols-3 gap-4 mb-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="text-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm"
          >
            <Skeleton className="h-3 w-16 mx-auto mb-2" />
            <Skeleton className="h-7 w-14 mx-auto" />
          </div>
        ))}
      </div>

      <div className="space-y-4 mb-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between mb-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-gray-300 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-4 bg-yellow-200" />
          <Skeleton className="h-3 w-40 bg-yellow-200" />
        </div>
        <Skeleton className="h-4 w-32 mb-3 bg-yellow-200" />
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-3 w-14 mb-2 bg-yellow-200" />
            <Skeleton className="h-4 w-24 bg-yellow-200" />
          </div>
          <div className="text-right">
            <Skeleton className="h-3 w-16 mb-2 bg-yellow-200" />
            <Skeleton className="h-4 w-20 bg-yellow-200" />
          </div>
        </div>
      </div>
    </div>

    <div className="border-t-2 border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {Array.from({ length: 6 }).map((_, i) => (
                <th key={i} className="px-3 md:px-4 py-3">
                  <Skeleton className="h-3 w-14" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {Array.from({ length: 6 }).map((_, r) => (
              <tr key={r}>
                <td className="px-3 md:px-4 py-3">
                  <Skeleton className="h-4 w-6" />
                </td>
                <td className="px-3 md:px-4 py-3">
                  <Skeleton className="h-5 w-16 rounded-md" />
                </td>
                <td className="px-3 md:px-4 py-3">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="px-3 md:px-4 py-3 text-right">
                  <Skeleton className="h-4 w-20 ml-auto" />
                </td>
                <td className="px-3 md:px-4 py-3 text-right">
                  <Skeleton className="h-4 w-14 ml-auto" />
                </td>
                <td className="px-3 md:px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Skeleton className="h-2 w-20 rounded-full" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
/* =================== End skeleton =================== */

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  unit,
  iconColor,
  bgGradient,
}) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
    <div className={`p-4 md:p-5 bg-gradient-to-br ${bgGradient}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-black font-bold text-xl md:text-sm font-semibold uppercase tracking-wide">
          {label}
        </span>
        <div className={`p-2 rounded-lg ${iconColor}`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
      </div>
      <div className="text-2xl md:text-3xl font-bold text-gray-800">
        {value}
      </div>
      <div className="text-black text-xs md:text-sm font-medium mt-1">
        {unit}
      </div>
    </div>
  </div>
);

const FilterDialog = ({ show, filters, onClose, onApply }) => {
  const [tempFilters, setTempFilters] = useState({ ...filters });

  useEffect(() => {
    if (show) setTempFilters({ ...filters });
  }, [show, filters]);

  const handleChange = (key, value) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    if (tempFilters.filterType === "CUSTOM") {
      if (!tempFilters.startDate || !tempFilters.endDate) return;
      if (tempFilters.startDate > tempFilters.endDate) return;
    }
    onApply(tempFilters);
  };

  const handleReset = () => setTempFilters(DEFAULT_FILTERS);

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
              {/* ✅ FilterRoute */}
              <div>
                <FilterRoute
                  value={tempFilters.routeId}
                  onChange={(v) => handleChange("routeId", v)}
                  showLabel={true}
                  label="Chọn tuyến"
                  placeholder="Tất cả tuyến"
                  showNote={true}
                  selectClassName="!rounded-lg !border !border-gray-300 !h-[48px] focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500"
                />
              </div>

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

const RouteCard = ({ routeData, maxValues }) => {
  const routeTotal = useMemo(() => {
    return routeData.staffPerformances?.reduce(
      (acc, staff) => ({
        goods: acc.goods + (staff.totalGoods || 0),
        weight: acc.weight + (staff.totalNetWeight || 0),
      }),
      { goods: 0, weight: 0 }
    );
  }, [routeData.staffPerformances]);

  const maxGoodsInRoute = useMemo(() => {
    return Math.max(
      ...(routeData.staffPerformances?.map((s) => s.totalGoods || 0) || [0])
    );
  }, [routeData.staffPerformances]);

  const goodsPercent =
    maxValues.goods > 0 ? (routeTotal.goods / maxValues.goods) * 100 : 0;
  const weightPercent =
    maxValues.weight > 0 ? (routeTotal.weight / maxValues.weight) * 100 : 0;

  const topPerformer = useMemo(() => {
    return routeData.staffPerformances
      ?.filter((s) => s.totalGoods > 0)
      .sort((a, b) => b.totalGoods - a.totalGoods)[0];
  }, [routeData.staffPerformances]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Truck className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white">
            {routeData.routeName}
          </h2>
        </div>
      </div>

      <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="text-center p-3 bg-green-300 rounded-lg border border-gray-100 shadow-sm">
            <div className="text-xl text-black mb-1 font-medium">Nhân viên</div>
            <div className="text-xl md:text-2xl font-bold text-gray-800">
              {routeData.staffPerformances?.length || 0}
            </div>
          </div>

          {/* ✅ Tổng giá trị: gắn theo currency = routeName */}
          <div className="text-center p-3 bg-red-200 rounded-lg border border-gray-100 shadow-sm">
            <div className="text-xl text-black mb-1 font-medium">
              Tổng giá trị
            </div>
            <div className="text-base md:text-lg font-bold text-gray-800 break-words">
              {formatMoney(routeTotal.goods, routeData.routeName)}
            </div>
          </div>

          <div className="text-center p-3 bg-yellow-200 rounded-lg border border-gray-100 shadow-sm">
            <div className="text-xl text-black mb-1 font-medium">Số kg</div>
            <div className="text-xl md:text-2xl font-bold text-gray-800">
              {routeTotal.weight.toFixed(1)}
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-5">
          <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span className="font-medium text-xl">So sánh giá trị</span>
              <span className="font-bold text-blue-600">
                {goodsPercent.toFixed(1)}%
              </span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${goodsPercent}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span className="font-medium text-xl">So sánh trọng lượng</span>
              <span className="font-bold text-blue-600">
                {weightPercent.toFixed(1)}%
              </span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${weightPercent}%` }}
              />
            </div>
          </div>
        </div>

        {topPerformer && (
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xs font-bold text-yellow-800 uppercase tracking-wide">
                Nhân viên xuất sắc
              </span>
            </div>
            <div className="text-xl font-bold text-gray-800">
              {topPerformer.name}
            </div>
            <div className="flex items-center justify-between mt-2">
              <div>
                <div className="text-2xs text-gray-600 font-medium">
                  Giá trị
                </div>
                <div className="text-2xs font-bold text-gray-800">
                  {formatMoney(topPerformer.totalGoods, routeData.routeName)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xs text-gray-600 font-medium">
                  Khối lượng
                </div>
                <div className="text-2xs font-bold text-gray-800">
                  {Number(topPerformer.totalNetWeight || 0).toFixed(2)} kg
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t-2 border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  #
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Mã NV
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Tên
                </th>
                <th className="px-3 md:px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Giá trị
                </th>
                <th className="px-3 md:px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  KL (kg)
                </th>
                <th className="px-3 md:px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Hiệu suất
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {routeData.staffPerformances
                ?.slice()
                .sort((a, b) => (b.totalGoods || 0) - (a.totalGoods || 0))
                .map((staff, index) => {
                  const performancePercent =
                    maxGoodsInRoute > 0
                      ? ((staff.totalGoods || 0) / maxGoodsInRoute) * 100
                      : 0;

                  return (
                    <tr
                      key={staff.staffCode || index}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-3 md:px-4 py-3">
                        <span className="text-xs md:text-sm font-semibold text-gray-600">
                          {index + 1}
                        </span>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold whitespace-nowrap border border-blue-200">
                          {staff.staffCode}
                        </span>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <span className="text-xs md:text-sm font-medium text-gray-800">
                          {staff.name}
                        </span>
                      </td>

                      <td className="px-3 md:px-4 py-3 text-right">
                        <span className="text-xs md:text-sm font-bold text-gray-800">
                          {formatMoney(staff.totalGoods, routeData.routeName)}
                        </span>
                      </td>

                      <td className="px-3 md:px-4 py-3 text-right">
                        <span className="text-xs md:text-sm font-semibold text-gray-600">
                          {Number(staff.totalNetWeight || 0).toFixed(2)}
                        </span>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 md:w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getPerformanceColor(
                                performancePercent,
                                100
                              )} transition-all duration-500`}
                              style={{ width: `${performancePercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700 w-10 text-right">
                            {performancePercent.toFixed(0)}%
                          </span>
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
  );
};

const DashboardKPI = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const list = await managerRoutesService.getRoutes();
        setRoutes(list || []);
      } catch {
        setRoutes([]);
      }
    };
    fetchRoutes();
  }, []);

  const fetchKPI = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        const params = { filterType: filters.filterType };

        if (filters.filterType === "CUSTOM") {
          params.startDate = filters.startDate;
          params.endDate = filters.endDate;
        }

        if (filters.routeId) params.routeId = filters.routeId;

        const res = await dashboardService.getRoutesKPI(params, { signal });
        setData(res?.data || {});
      } catch (error) {
        if (error?.name !== "AbortError")
          console.error("Error fetching KPI:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchKPI(controller.signal);
    return () => controller.abort();
  }, [fetchKPI]);

  const handleApplyFilter = useCallback((newFilters) => {
    setFilters(newFilters);
    setShowFilterDialog(false);
  }, []);

  const getFilterLabel = () => {
    const type = FILTER_TYPES.find((t) => t.value === filters.filterType);
    const route = routes.find(
      (r) => String(r.routeId) === String(filters.routeId)
    );

    let label = type?.label || "Tháng này";
    if (route) label += ` - ${route.name}`;

    if (
      filters.filterType === "CUSTOM" &&
      filters.startDate &&
      filters.endDate
    ) {
      label = `${filters.startDate} đến ${filters.endDate}`;
      if (route) label += ` - ${route.name}`;
    }
    return label;
  };

  const totals = useMemo(() => {
    let totalWeight = 0;
    let totalStaff = 0;

    Object.values(data).forEach((route) => {
      route.staffPerformances?.forEach((staff) => {
        totalWeight += staff.totalNetWeight || 0;
      });
      totalStaff += route.staffPerformances?.length || 0;
    });

    return { totalWeight, totalStaff };
  }, [data]);

  /** ✅ Tính "Giá trị tuyến cao nhất" + routeName */
  const bestRoute = useMemo(() => {
    let best = { value: 0, currency: "", routeKey: "" };

    Object.entries(data || {}).forEach(([key, route]) => {
      const sumGoods =
        route?.staffPerformances?.reduce(
          (acc, s) => acc + (s.totalGoods || 0),
          0
        ) || 0;

      if (sumGoods > best.value) {
        best = {
          value: sumGoods,
          currency: route?.routeName || "",
          routeKey: key,
        };
      }
    });

    return best;
  }, [data]);

  const maxValues = useMemo(() => {
    return Object.values(data).reduce(
      (acc, route) => {
        const routeTotal = route.staffPerformances?.reduce(
          (sum, staff) => ({
            goods: sum.goods + (staff.totalGoods || 0),
            weight: sum.weight + (staff.totalNetWeight || 0),
          }),
          { goods: 0, weight: 0 }
        );
        return {
          goods: Math.max(acc.goods, routeTotal?.goods || 0),
          weight: Math.max(acc.weight, routeTotal?.weight || 0),
        };
      },
      { goods: 0, weight: 0 }
    );
  }, [data]);

  const skeletonRouteCount = Math.max(2, Math.min(8, routes?.length || 4));

  return (
    <div className="min-h-screen ">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 md:h-10 bg-gradient-to-b from-blue-600 to-blue-700 rounded-full"></div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Thống kê hiệu suất nhân viên
              </h1>
            </div>

            <button
              onClick={() => setShowFilterDialog(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Bộ lọc</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg w-fit">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">
              {getFilterLabel()}
            </span>
          </div>
        </div>

        <FilterDialog
          show={showFilterDialog}
          filters={filters}
          onClose={() => setShowFilterDialog(false)}
          onApply={handleApplyFilter}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
          {loading ? (
            <>
              <SummaryCardSkeleton bgGradient="from-blue-50 to-blue-100" />
              <SummaryCardSkeleton bgGradient="from-green-50 to-green-100" />
              <SummaryCardSkeleton bgGradient="from-orange-50 to-orange-100" />
              <SummaryCardSkeleton bgGradient="from-purple-50 to-purple-100" />
            </>
          ) : (
            <>
              <SummaryCard
                icon={Truck}
                label="Tổng tuyến"
                value={Object.keys(data).length}
                unit="Đang hoạt động"
                iconColor="bg-blue-600"
                bgGradient="from-red-200 to-red-200"
              />

              {/* ✅ Đổi: "Tổng giá trị" -> "Giá trị tuyến cao nhất" */}
              <SummaryCard
                icon={DollarSign}
                label="Giá trị tuyến cao nhất"
                value={formatMoney(bestRoute.value, bestRoute.currency)}
                unit={bestRoute.currency ? `Tuyến: ${bestRoute.currency}` : ""}
                iconColor="bg-green-600"
                bgGradient="from-green-50 to-green-100"
              />

              <SummaryCard
                icon={Weight}
                label="Trọng lượng"
                value={totals.totalWeight.toFixed(2)}
                unit="Kilogram"
                iconColor="bg-orange-600"
                bgGradient="from-orange-50 to-orange-100"
              />

              <SummaryCard
                icon={Users}
                label="Nhân viên"
                value={totals.totalStaff}
                unit="Tổng số"
                iconColor="bg-purple-600"
                bgGradient="from-purple-50 to-purple-100"
              />
            </>
          )}
        </div>

        {/* Routes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
            {Array.from({ length: skeletonRouteCount }).map((_, i) => (
              <RouteCardSkeleton key={i} />
            ))}
          </div>
        ) : Object.keys(data).length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-10 md:p-16 text-center border border-gray-100">
            <BarChart3 className="w-14 h-14 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-base md:text-lg font-semibold mb-2">
              Không có dữ liệu
            </p>
            <p className="text-gray-500 text-sm md:text-base">
              Vui lòng thử lại với bộ lọc khác
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
            {Object.entries(data).map(([routeKey, routeData]) => (
              <RouteCard
                key={routeKey}
                routeData={routeData}
                maxValues={maxValues}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardKPI;
