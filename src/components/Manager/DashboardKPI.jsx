import React, { useState, useEffect, useMemo, useCallback } from "react";
import dashboardService from "../../Services/Dashboard/dashboardService";
import {
  Truck,
  DollarSign,
  Weight,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react";

const FILTER_TYPES = [
  { value: "DAY", label: "Hôm nay" },
  { value: "WEEK", label: "Tuần này" },
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
  <div className={`animate-pulse bg-gray-300 rounded ${className}`} />
);

const SummaryCardSkeleton = ({ bgGradient = "from-gray-200 to-gray-300" }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border-1 border-black">
    <div className={`p-5 md:p-6 bg-gradient-to-br ${bgGradient}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="h-10 md:h-12 w-32" />
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
  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-1 border-black min-h-[150px]">
    <div className={`p-5 md:p-6 bg-gradient-to-br ${bgGradient} h-full`}>
      <div className="flex items-center justify-between mb-4 min-w-0">
        <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
          {label}
        </span>
        <div className={`p-2.5 rounded-lg ${iconColor} shrink-0`}>
          <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </div>
      </div>
      <div className="flex items-baseline gap-2 min-w-0 mb-3">
        <span className="text-2xl md:text-3xl font-bold text-gray-900 leading-none break-words tabular-nums">
          {value}
        </span>
      </div>
      {unit && (
        <div className="text-xs md:text-sm text-black font-medium">{unit}</div>
      )}
    </div>
  </div>
);

const RouteCard = ({ routeData, maxValues }) => {
  const routeTotal = useMemo(() => {
    return routeData.staffPerformances?.reduce(
      (acc, staff) => ({
        goods: acc.goods + (staff.totalGoods || 0),
        weight: acc.weight + (staff.totalNetWeight || 0),
      }),
      { goods: 0, weight: 0 },
    );
  }, [routeData.staffPerformances]);

  const maxGoodsInRoute = useMemo(() => {
    return Math.max(
      ...(routeData.staffPerformances?.map((s) => s.totalGoods || 0) || [0]),
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
                                100,
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
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const fetchKPI = useCallback(
    async (signal) => {
      setLoading(true);
      try {
        const params = { filterType: filters.filterType };

        if (filters.filterType === "CUSTOM") {
          params.startDate = filters.startDate;
          params.endDate = filters.endDate;
        }

        const res = await dashboardService.getRoutesKPI(params, { signal });
        setData(res?.data || {});
      } catch (error) {
        if (error?.name !== "AbortError")
          console.error("Error fetching KPI:", error);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchKPI(controller.signal);
    return () => controller.abort();
  }, [fetchKPI]);

  const getFilterLabel = () => {
    const type = FILTER_TYPES.find((t) => t.value === filters.filterType);
    let label = type?.label || "Tháng này";

    if (filters.filterType === "CUSTOM" && filters.startDate && filters.endDate)
      label = `${filters.startDate} đến ${filters.endDate}`;

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

  const bestRoute = useMemo(() => {
    let best = { value: 0, currency: "", routeKey: "" };

    Object.entries(data || {}).forEach(([key, route]) => {
      const sumGoods =
        route?.staffPerformances?.reduce(
          (acc, s) => acc + (s.totalGoods || 0),
          0,
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
          { goods: 0, weight: 0 },
        );
        return {
          goods: Math.max(acc.goods, routeTotal?.goods || 0),
          weight: Math.max(acc.weight, routeTotal?.weight || 0),
        };
      },
      { goods: 0, weight: 0 },
    );
  }, [data]);

  const skeletonRouteCount = Math.max(
    2,
    Math.min(8, Object.keys(data || {}).length || 4),
  );

  return (
    <div className="min-h-screen ">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* ✅ Header - Blue Gradient với Glassmorphism */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-lg border border-blue-500 p-6 md:p-8">
            {/* Title Section */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Thống Kê Hiệu Suất Nhân Viên
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                    <Calendar className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {getFilterLabel()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                    <span className="text-sm font-semibold text-white">
                      Tất cả tuyến
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Buttons Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                {FILTER_TYPES.map((type) => {
                  const active = filters.filterType === type.value;
                  return (
                    <button
                      key={type.value}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          routeId: "",
                          filterType: type.value,
                          ...(type.value !== "CUSTOM"
                            ? { startDate: "", endDate: "" }
                            : {}),
                        }))
                      }
                      disabled={loading}
                      className={`px-3 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                        active
                          ? "bg-white text-blue-700 shadow-lg scale-105"
                          : "bg-white/20 text-white hover:bg-white/30 hover:shadow-md backdrop-blur-sm"
                      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Date Selector */}
              {filters.filterType === "CUSTOM" && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-white" />
                    <span className="text-sm font-semibold text-white">
                      Chọn khoảng thời gian tùy chỉnh
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-end gap-3 md:gap-4">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-white">
                          Từ ngày
                        </label>
                        <input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              routeId: "",
                              startDate: e.target.value,
                            }))
                          }
                          className="border border-white/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-white focus:border-white bg-white text-gray-900"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-white">
                          Đến ngày
                        </label>
                        <input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              routeId: "",
                              endDate: e.target.value,
                            }))
                          }
                          className="border border-white/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-white focus:border-white bg-white text-gray-900"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setFilters(DEFAULT_FILTERS)}
                      className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors"
                    >
                      Đặt lại
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Summary Cards - Tổng quan */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
            Tổng quan
          </h3>

          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <>
                <SummaryCardSkeleton bgGradient="from-yellow-200 to-yellow-300" />
                <SummaryCardSkeleton bgGradient="from-red-200 to-red-300" />
                <SummaryCardSkeleton bgGradient="from-green-200 to-green-300" />
                <SummaryCardSkeleton bgGradient="from-blue-200 to-blue-300" />
              </>
            ) : (
              <>
                <SummaryCard
                  icon={Truck}
                  label="Tổng tuyến"
                  value={Object.keys(data).length}
                  unit="Đang hoạt động"
                  iconColor="bg-purple-500"
                  bgGradient="from-yellow-200 to-yellow-300"
                />

                <SummaryCard
                  icon={DollarSign}
                  label="Giá trị cao nhất"
                  value={formatMoney(bestRoute.value, bestRoute.currency)}
                  unit={
                    bestRoute.currency ? `Tuyến: ${bestRoute.currency}` : ""
                  }
                  iconColor="bg-red-500"
                  bgGradient="from-red-200 to-red-300"
                />

                <SummaryCard
                  icon={Weight}
                  label="Trọng lượng"
                  value={totals.totalWeight.toFixed(2)}
                  unit="Kilogram"
                  iconColor="bg-green-600"
                  bgGradient="from-green-200 to-green-300"
                />

                <SummaryCard
                  icon={Users}
                  label="Nhân viên"
                  value={totals.totalStaff}
                  unit="Tổng số"
                  iconColor="bg-blue-600"
                  bgGradient="from-blue-200 to-blue-300"
                />
              </>
            )}
          </div>
        </div>

        {/* ✅ Routes Grid - Chi tiết theo tuyến */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
            Chi tiết theo tuyến
          </h3>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
              {Array.from({ length: skeletonRouteCount }).map((_, i) => (
                <RouteCardSkeleton key={i} />
              ))}
            </div>
          ) : Object.keys(data).length === 0 ? (
            <div className="bg-white rounded-xl border-1 border-black p-12 md:p-16 text-center shadow-lg">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-800 text-base md:text-lg font-bold mb-2">
                Không có dữ liệu
              </p>
              <p className="text-gray-600 text-sm">
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
    </div>
  );
};

export default DashboardKPI;
