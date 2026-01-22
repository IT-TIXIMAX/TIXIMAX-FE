// pages/Manager/Dashboard/SummaryOrder.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../../Services/Dashboard/dashboardService";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ChevronRight,
  Package,
  Link as LinkIcon,
  Award,
  AlertCircle,
  Calendar,
  ShoppingBag,
  Layers,
  X,
  BarChart3,
} from "lucide-react";

const FILTER_OPTIONS = [
  { label: "Hôm nay", value: "DAY" },
  { label: "Tuần này", value: "WEEK" },
  { label: "Tháng này", value: "MONTH" },
  { label: "Quý này", value: "QUARTER" },
  { label: "6 tháng", value: "HALF_YEAR" },
  { label: "Tùy chỉnh", value: "CUSTOM" },
];

/* ===================== Skeleton Components ===================== */
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
    <div className="p-4 md:p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-b border-blue-100">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-5 w-32 flex-1" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>

    <div className="p-4 md:p-5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-gray-50 p-3"
          >
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-gray-200">
        <Skeleton className="h-4 w-full mb-2" />
      </div>
      <div className="pt-3 border-t border-gray-200">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  </div>
);

/* ===================== Summary Card ===================== */
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

/* ===================== Main Component ===================== */
const SummaryOrder = () => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("MONTH");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const isCustom = filterType === "CUSTOM";

  const formatNumber = (value) => {
    if (value == null) return "0";
    return Number(value || 0).toLocaleString("vi-VN");
  };

  const fetchSummary = useCallback(async () => {
    if (filterType === "CUSTOM") {
      if (!startDate || !endDate) {
        toast.error("Vui lòng chọn ngày bắt đầu và kết thúc");
        return;
      }
      if (startDate > endDate) {
        toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const params = { filterType };
      if (filterType === "CUSTOM") {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const res = await dashboardService.getRoutesOrdersSummary(params);
      setData(res?.data || []);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi khi tải dữ liệu đơn hàng";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [filterType, startDate, endDate]);

  useEffect(() => {
    if (filterType !== "CUSTOM") {
      fetchSummary();
    }
  }, [filterType, fetchSummary]);

  const getFilterLabel = () => {
    const type = FILTER_OPTIONS.find((t) => t.value === filterType);
    let label = type?.label || "Tháng này";

    if (filterType === "CUSTOM" && startDate && endDate) {
      label = `${startDate} đến ${endDate}`;
    }
    return label;
  };

  const metrics = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;

    const totalOrders = data.reduce(
      (sum, item) => sum + (item.totalOrders || 0),
      0,
    );
    const totalLinks = data.reduce(
      (sum, item) => sum + (item.totalLinks || 0),
      0,
    );
    const totalRoutes = data.length;

    const topRoute =
      data.length > 0
        ? [...data].sort(
            (a, b) => (b.totalOrders || 0) - (a.totalOrders || 0),
          )[0]
        : null;

    const avgOrdersPerRoute = totalRoutes > 0 ? totalOrders / totalRoutes : 0;

    return {
      totalOrders,
      totalLinks,
      totalRoutes,
      topRoute,
      avgOrdersPerRoute,
    };
  }, [data]);

  const skeletonRouteCount = Math.max(2, Math.min(8, data?.length || 4));

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* ✅ Breadcrumb Navigation */}
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate("/manager/dashboard")}
              className="group flex items-center gap-2 px-3 py-2 bg-white border-2 border-black rounded-lg hover:bg-yellow-300 transition-all shadow-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4 text-black group-hover:animate-pulse" />
              <span className="text-sm text-black hidden sm:inline">
                Dashboard
              </span>
            </button>

            <ChevronRight className="w-4 h-4 text-gray-400" />

            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-300 border-2 border-black rounded-lg shadow-sm">
              <span className="text-sm font-semibold text-black">
                Đơn hàng theo tuyến
              </span>
            </div>
          </div>
        </div>

        {/* ✅ Header - Yellow + Black Theme */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-yellow-300 via-yellow-300 to-yellow-300 border-[1px] border-black rounded-xl shadow-lg p-4 md:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1.5 h-8 md:h-9 bg-black rounded-full shrink-0 shadow-sm" />
                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl font-bold text-black leading-tight truncate">
                    Thống kê đơn hàng theo tuyến
                  </h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-sm">
                      <Calendar className="w-4 h-4 text-black" />
                      <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
                        {getFilterLabel()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {FILTER_OPTIONS.map((opt) => {
                  const active = opt.value === filterType;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setFilterType(opt.value)}
                      disabled={loading}
                      className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all border-2 border-yellow-600 shadow-sm ${
                        active
                          ? "bg-yellow-400 text-black"
                          : "bg-white text-black hover:bg-gray-100"
                      } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {isCustom && (
              <div className="mt-4 pt-4 border-t-2 border-black">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-black">
                        Từ
                      </span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border-2 border-black rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-black">
                        Đến
                      </span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border-2 border-black rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={fetchSummary}
                    disabled={loading}
                    className="bg-yellow-400 text-black border-2 border-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {loading ? "Đang tải..." : "Tìm kiếm"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-red-800 mb-1">
                  Có lỗi xảy ra
                </h3>
                <p className="text-sm text-red-700 break-words">{error}</p>
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

        {/* ✅ Summary Cards */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
            Tổng quan
          </h3>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              <>
                <SummaryCardSkeleton bgGradient="from-blue-50 to-blue-100" />
                <SummaryCardSkeleton bgGradient="from-green-50 to-green-100" />
                <SummaryCardSkeleton bgGradient="from-orange-50 to-orange-100" />
                <SummaryCardSkeleton bgGradient="from-purple-50 to-purple-100" />
              </>
            ) : metrics ? (
              <>
                <SummaryCard
                  icon={ShoppingBag}
                  label="Tổng đơn hàng"
                  value={formatNumber(metrics.totalOrders)}
                  unit="Đơn hàng"
                  iconColor="bg-blue-600"
                  bgGradient="from-red-200 to-red-200"
                />

                <SummaryCard
                  icon={LinkIcon}
                  label="Tổng links"
                  value={formatNumber(metrics.totalLinks)}
                  unit="Links"
                  iconColor="bg-green-600"
                  bgGradient="from-green-50 to-green-100"
                />

                <SummaryCard
                  icon={Layers}
                  label="Số tuyến"
                  value={formatNumber(metrics.totalRoutes)}
                  unit="Tuyến hoạt động"
                  iconColor="bg-orange-600"
                  bgGradient="from-orange-50 to-orange-100"
                />

                <SummaryCard
                  icon={Award}
                  label="Tuyến hàng đầu"
                  value={
                    <div className="truncate">
                      <div className="text-lg font-bold truncate">
                        {metrics.topRoute?.routeName || "N/A"}
                      </div>
                      <div className="text-sm font-semibold text-gray-600">
                        {formatNumber(metrics.topRoute?.totalOrders || 0)} đơn
                      </div>
                    </div>
                  }
                  unit=""
                  iconColor="bg-purple-600"
                  bgGradient="from-purple-50 to-purple-100"
                />
              </>
            ) : null}
          </div>
        </div>

        {/* ✅ No Data State */}
        {!loading && (!data || data.length === 0) && (
          <div className="bg-white rounded-xl shadow-md p-10 md:p-16 text-center border border-gray-100">
            <BarChart3 className="w-14 h-14 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-base md:text-lg font-semibold mb-2">
              Không có dữ liệu
            </p>
            <p className="text-gray-500 text-sm md:text-base">
              Vui lòng thử lại với bộ lọc khác
            </p>
          </div>
        )}

        {/* ✅ Routes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
            {Array.from({ length: skeletonRouteCount }).map((_, i) => (
              <RouteCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          data &&
          data.length > 0 &&
          metrics && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
                {data.map((route, index) => {
                  const orders = Number(route.totalOrders || 0);
                  const links = Number(route.totalLinks || 0);
                  const ratio = links > 0 ? (orders / links) * 100 : 0;
                  const percentOfTotal =
                    metrics.totalOrders > 0
                      ? (orders / metrics.totalOrders) * 100
                      : 0;

                  return (
                    <div
                      key={`${route.routeName}-${index}`}
                      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Header */}
                      <div className="px-4 md:px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Package className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          </div>
                          <h2 className="text-lg md:text-xl font-bold text-white truncate">
                            {route.routeName}
                          </h2>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white">
                        <div className="grid grid-cols-2 gap-4 mb-5">
                          <div className="text-center p-3 bg-green-300 rounded-lg border border-gray-100 shadow-sm">
                            <div className="text-xl text-black mb-1 font-medium">
                              Đơn hàng
                            </div>
                            <div className="text-xl md:text-2xl font-bold text-gray-800">
                              {formatNumber(orders)}
                            </div>
                          </div>

                          <div className="text-center p-3 bg-yellow-200 rounded-lg border border-gray-100 shadow-sm">
                            <div className="text-xl text-black mb-1 font-medium">
                              Links
                            </div>
                            <div className="text-xl md:text-2xl font-bold text-gray-800">
                              {formatNumber(links)}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 mb-5">
                          <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <div className="flex justify-between text-xs text-gray-600 mb-2">
                              <span className="font-medium text-xl">
                                Tỷ lệ đơn/link
                              </span>
                              <span className="font-bold text-blue-600">
                                {ratio.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                style={{ width: `${Math.min(100, ratio)}%` }}
                              />
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <div className="flex justify-between text-xs text-gray-600 mb-2">
                              <span className="font-medium text-xl">
                                % tổng đơn
                              </span>
                              <span className="font-bold text-blue-600">
                                {percentOfTotal.toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                style={{
                                  width: `${Math.min(100, percentOfTotal)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Top performer highlight */}
                        {index === 0 && (
                          <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="w-4 h-4 text-yellow-800" />
                              <span className="text-2xs font-bold text-yellow-800 uppercase tracking-wide">
                                Tuyến xuất sắc nhất
                              </span>
                            </div>
                            <div className="text-xl font-bold text-gray-800">
                              {route.routeName}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div>
                                <div className="text-2xs text-gray-600 font-medium">
                                  Đơn hàng
                                </div>
                                <div className="text-2xs font-bold text-gray-800">
                                  {formatNumber(orders)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xs text-gray-600 font-medium">
                                  Links
                                </div>
                                <div className="text-2xs font-bold text-gray-800">
                                  {formatNumber(links)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Summary */}
              <div className="mt-6 bg-yellow-300 border-2 border-black rounded-xl p-5 shadow-md">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white border-2 border-black rounded-lg">
                    <div className="text-xs text-gray-600 uppercase font-bold mb-2 tracking-wide">
                      Tổng tuyến
                    </div>
                    <div className="text-3xl font-black text-gray-900 tabular-nums">
                      {formatNumber(metrics.totalRoutes)}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-white border-2 border-black rounded-lg">
                    <div className="text-xs text-gray-600 uppercase font-bold mb-2 tracking-wide">
                      Tổng đơn
                    </div>
                    <div className="text-3xl font-black text-gray-900 tabular-nums">
                      {formatNumber(metrics.totalOrders)}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-white border-2 border-black rounded-lg">
                    <div className="text-xs text-gray-600 uppercase font-bold mb-2 tracking-wide">
                      Tổng links
                    </div>
                    <div className="text-3xl font-black text-gray-900 tabular-nums">
                      {formatNumber(metrics.totalLinks)}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-white border-2 border-black rounded-lg">
                    <div className="text-xs text-gray-600 uppercase font-bold mb-2 tracking-wide">
                      TB / tuyến
                    </div>
                    <div className="text-3xl font-black text-gray-900 tabular-nums">
                      {metrics.avgOrdersPerRoute.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default SummaryOrder;
