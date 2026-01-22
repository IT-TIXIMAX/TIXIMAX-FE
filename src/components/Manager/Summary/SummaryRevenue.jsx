// pages/Manager/Dashboard/SummaryRevenue.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../../Services/Dashboard/dashboardService";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Banknote,
  TrendingUp,
  DollarSign,
  Award,
  AlertCircle,
  Calendar,
  Layers,
  CheckCircle,
  Clock,
  Truck,
  RotateCcw,
  ChevronRight,
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

const STATUS_OPTIONS = [
  { label: "Đã TT", value: "DA_THANH_TOAN", icon: CheckCircle },
  { label: "Chờ TT", value: "CHO_THANH_TOAN", icon: Clock },
  { label: "Chờ TT Ship", value: "CHO_THANH_TOAN_SHIP", icon: Truck },
  { label: "Đã TT Ship", value: "DA_THANH_TOAN_SHIP", icon: CheckCircle },
  { label: "Hoàn tiền", value: "DA_HOAN_TIEN", icon: RotateCcw },
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
  <div className="bg-white rounded-xl border-2 border-black shadow-lg overflow-hidden animate-pulse">
    <div className="p-4 md:p-5 bg-gradient-to-br from-gray-200 to-gray-300 border-b-2 border-black">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-5 flex-1 max-w-[150px]" />
        </div>
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    </div>
    <div className="p-4 md:p-5 bg-white">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
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
const SummaryRevenue = () => {
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState("MONTH");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("CHO_THANH_TOAN");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isCustom = filterType === "CUSTOM";

  const formatCurrency = (value) => {
    const n = Number(value || 0);
    return `${n.toLocaleString("vi-VN")} đ`;
  };

  const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

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
      const params = { filterType, status };
      if (filterType === "CUSTOM") {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const res = await dashboardService.getRoutesRevenueSummary(params);
      setData(res?.data || []);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi khi tải dữ liệu doanh thu";
      setError(msg);
      toast.error("Không tải được dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  }, [filterType, status, startDate, endDate]);

  useEffect(() => {
    if (filterType !== "CUSTOM") {
      fetchSummary();
    }
  }, [filterType, status, fetchSummary]);

  const getFilterLabel = () => {
    const type = FILTER_OPTIONS.find((t) => t.value === filterType);
    let label = type?.label || "Tháng này";

    if (filterType === "CUSTOM" && startDate && endDate) {
      label = `${startDate} đến ${endDate}`;
    }
    return label;
  };

  const getStatusLabel = () => {
    const statusOpt = STATUS_OPTIONS.find((s) => s.value === status);
    return statusOpt?.label || "Chờ TT";
  };

  const metrics = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;

    const totalRevenue = data.reduce(
      (sum, item) => sum + (item.totalRevenue || 0),
      0,
    );
    const totalRoutes = data.length;

    const topRoute =
      data.length > 0
        ? [...data].sort(
            (a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0),
          )[0]
        : null;

    const avgRevenuePerRoute = totalRoutes > 0 ? totalRevenue / totalRoutes : 0;

    return { totalRevenue, totalRoutes, topRoute, avgRevenuePerRoute };
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
              <Banknote className="w-4 h-4 text-black" />
              <span className="text-sm font-semibold text-black">
                Doanh thu theo tuyến
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
                    Thống kê doanh thu theo tuyến
                  </h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-sm">
                      <Calendar className="w-4 h-4 text-black" />
                      <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
                        {getFilterLabel()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-sm">
                      <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
                        TT: {getStatusLabel()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {/* Time Filters */}
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

                {/* Status Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {STATUS_OPTIONS.map((opt) => {
                    const active = opt.value === status;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setStatus(opt.value)}
                        disabled={loading}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border-2 border-yellow-600 shadow-sm flex items-center gap-1.5 ${
                          active
                            ? "bg-yellow-400 text-black"
                            : "bg-white text-black hover:bg-gray-100"
                        } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
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
                <SummaryCardSkeleton bgGradient="from-yellow-50 to-yellow-100" />
                <SummaryCardSkeleton bgGradient="from-red-50 to-red-100" />
                <SummaryCardSkeleton bgGradient="from-green-50 to-green-100" />
                <SummaryCardSkeleton bgGradient="from-blue-50 to-blue-100" />
              </>
            ) : metrics ? (
              <>
                <SummaryCard
                  icon={Banknote}
                  label="Tổng doanh thu"
                  value={formatCurrency(metrics.totalRevenue)}
                  unit=""
                  iconColor="bg-yellow-600"
                  bgGradient="from-yellow-50 to-yellow-100"
                />

                <SummaryCard
                  icon={Layers}
                  label="Số tuyến"
                  value={formatNumber(metrics.totalRoutes)}
                  unit="Tuyến hoạt động"
                  iconColor="bg-red-600"
                  bgGradient="from-red-50 to-red-100"
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
                        {formatCurrency(metrics.topRoute?.totalRevenue || 0)}
                      </div>
                    </div>
                  }
                  unit=""
                  iconColor="bg-green-600"
                  bgGradient="from-green-50 to-green-100"
                />

                <SummaryCard
                  icon={TrendingUp}
                  label="TB / tuyến"
                  value={formatCurrency(metrics.avgRevenuePerRoute)}
                  unit=""
                  iconColor="bg-blue-600"
                  bgGradient="from-blue-50 to-blue-100"
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
          <div>
            <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
              Chi tiết theo từng tuyến
            </h3>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: skeletonRouteCount }).map((_, i) => (
                <RouteCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          data &&
          data.length > 0 &&
          metrics && (
            <div>
              <div className="flex items-end justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 uppercase">
                  Chi tiết theo từng tuyến
                </h3>
                <div className="text-xs text-gray-600">
                  Tổng:{" "}
                  <b className="text-black tabular-nums">
                    {metrics.totalRoutes}
                  </b>{" "}
                  tuyến
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {data.map((route, index) => (
                  <div
                    key={`${route.routeName}-${index}`}
                    className="bg-white rounded-xl border-1 border-black shadow-lg hover:shadow-xl transition-all overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-4 md:p-5 bg-gradient-to-br from-gray-200 to-gray-300 border-b-2 border-black">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border-1 border-black font-bold text-black text-xs shrink-0">
                            {index + 1}
                          </div>
                          <h4 className="text-base md:text-lg font-bold text-black truncate">
                            {route.routeName}
                          </h4>
                        </div>

                        <div className="p-2 rounded-lg bg-black shrink-0">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 md:p-5 bg-white">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs md:text-sm font-semibold text-gray-700 truncate">
                            Doanh thu
                          </span>
                        </div>
                        <span className="text-sm md:text-base font-bold text-black tabular-nums whitespace-nowrap">
                          {formatCurrency(route.totalRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Summary */}
              <div className="mt-6 bg-yellow-300 border-[1px] border-black rounded-xl p-5 shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      Tổng doanh thu
                    </div>
                    <div className="text-2xl font-black text-gray-900 tabular-nums break-words">
                      {formatCurrency(metrics.totalRevenue)}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-white border-2 border-black rounded-lg">
                    <div className="text-xs text-gray-600 uppercase font-bold mb-2 tracking-wide">
                      TB / tuyến
                    </div>
                    <div className="text-2xl font-black text-gray-900 tabular-nums break-words">
                      {formatCurrency(metrics.avgRevenuePerRoute)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SummaryRevenue;
