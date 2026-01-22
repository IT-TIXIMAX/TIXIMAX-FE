// pages/Manager/Dashboard/SummaryWeight.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../../Services/Dashboard/dashboardService";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Scale,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle,
  Calendar,
  Package,
  Layers,
  ChevronRight,
  X,
} from "lucide-react";

const FILTER_OPTIONS = [
  { label: "Hôm nay", value: "DAY" },
  { label: "Tuần này", value: "WEEK" },
  { label: "Tháng này", value: "MONTH" },
  { label: "Quý này", value: "QUARTER" },
  { label: "6 tháng", value: "HALF_YEAR" },
  { label: "Tùy chỉnh", value: "CUSTOM" },
];

const SummaryWeight = () => {
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState("MONTH");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isCustom = filterType === "CUSTOM";

  const fetchSummary = async (opts = {}) => {
    const nextFilter = opts.filterType ?? filterType;
    const nextStart = opts.startDate ?? startDate;
    const nextEnd = opts.endDate ?? endDate;

    if (nextFilter === "CUSTOM" && (!nextStart || !nextEnd)) {
      toast.error("Vui lòng chọn ngày bắt đầu và kết thúc");
      return;
    }
    if (nextFilter === "CUSTOM" && nextStart > nextEnd) {
      toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = { filterType: nextFilter };
      if (nextFilter === "CUSTOM") {
        params.startDate = nextStart;
        params.endDate = nextEnd;
      }

      const res = await dashboardService.getRoutesWeightSummary(params);
      setData(res?.data || []);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi khi tải dữ liệu khối lượng";
      setError(msg);
      toast.error("Lỗi khi tải dữ liệu khối lượng");
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch khi chọn filter nhanh (không phải CUSTOM)
  useEffect(() => {
    if (filterType !== "CUSTOM") {
      fetchSummary({ filterType });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const formatKg = (value) =>
    Number(value || 0).toLocaleString("vi-VN", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

  const metrics = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    const totalWeight = data.reduce(
      (sum, item) => sum + (item.totalWeight || 0),
      0,
    );
    const totalNetWeight = data.reduce(
      (sum, item) => sum + (item.totalNetWeight || 0),
      0,
    );
    const totalRoutes = data.length;
    const totalDifference = totalNetWeight - totalWeight;

    const topRoute = [...data].sort(
      (a, b) => (b.totalNetWeight || 0) - (a.totalNetWeight || 0),
    )[0];

    const avgWeightPerRoute = totalRoutes > 0 ? totalWeight / totalRoutes : 0;
    const avgNetWeightPerRoute =
      totalRoutes > 0 ? totalNetWeight / totalRoutes : 0;

    return {
      totalWeight,
      totalNetWeight,
      totalRoutes,
      totalDifference,
      topRoute,
      avgWeightPerRoute,
      avgNetWeightPerRoute,
    };
  }, [data]);

  const SkeletonCard = ({ colorClass = "from-gray-200 to-gray-300" }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border-1 border-black animate-pulse">
      <div className={`p-5 md:p-6 bg-gradient-to-br ${colorClass}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 bg-gray-300 rounded" />
          <div className="h-10 w-10 bg-gray-300 rounded-lg" />
        </div>
        <div className="h-10 w-40 bg-gray-300 rounded" />
        <div className="mt-3 h-3 w-28 bg-gray-300 rounded" />
      </div>
    </div>
  );

  const SkeletonRouteCard = () => (
    <div className="bg-white rounded-xl border-1 border-black shadow-md overflow-hidden animate-pulse">
      {/* header */}
      <div className="p-4 md:p-5 bg-gradient-to-br from-gray-200 to-gray-300 border-b-2 border-black">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-gray-300" />
            <div className="h-5 bg-gray-300 rounded flex-1 max-w-[150px]" />
          </div>
          <div className="w-8 h-8 rounded-lg bg-gray-300" />
        </div>
      </div>

      {/* body */}
      <div className="p-4 md:p-5 bg-white">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-300 rounded" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-300 rounded" />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t-2 border-black">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-5 w-20 bg-gray-300 rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  const SectionTitle = ({ children }) => (
    <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
      {children}
    </h3>
  );

  const FilterButton = ({ value, label }) => {
    const active = filterType === value;
    return (
      <button
        onClick={() => setFilterType(value)}
        disabled={loading}
        className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all border-2 border-yellow-600 shadow-sm ${
          active
            ? "bg-yellow-400 text-black"
            : "bg-white text-black hover:bg-gray-100"
        } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* ✅ Breadcrumb */}
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
                Khối Lượng Theo Tuyến
              </span>
            </div>
          </div>
        </div>

        {/* ✅ Header - YELLOW GRADIENT */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-yellow-300 via-yellow-300 to-yellow-300 border-[1px] border-black rounded-xl shadow-lg p-4 md:p-5">
            <div className="flex flex-col gap-4">
              {/* Top row */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-1.5 h-8 md:h-9 bg-black rounded-full shrink-0 shadow-sm" />
                  <div className="min-w-0">
                    <h1 className="text-lg md:text-xl font-bold text-black leading-tight truncate">
                      Thống Kê Khối Lượng Theo Tuyến
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-white px-3 py-1.5 shadow-sm">
                    <Calendar className="w-4 h-4 text-black" />
                    <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
                      {FILTER_OPTIONS.find((f) => f.value === filterType)
                        ?.label || "—"}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-lg border-2 border-black bg-white px-3 py-1.5 shadow-sm">
                    <Layers className="w-4 h-4 text-black" />
                    <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
                      {metrics ? metrics.totalRoutes : 0} tuyến
                    </span>
                  </div>
                </div>
              </div>

              {/* Filters row */}
              <div className="pt-4 border-t-2 border-black">
                <div className="mb-2 text-xs font-bold text-black uppercase tracking-wide">
                  Khoảng thời gian
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  {/* inline filter buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {FILTER_OPTIONS.map((opt) => (
                      <FilterButton
                        key={opt.value}
                        value={opt.value}
                        label={opt.label}
                      />
                    ))}
                  </div>

                  {/* custom bar */}
                  {isCustom && (
                    <div className="w-full lg:w-auto">
                      <div className="rounded-xl bg-white border-2 border-black p-3 shadow-sm">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-black" />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-black">
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
                              <span className="text-sm font-medium text-black">
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
                            onClick={() =>
                              fetchSummary({
                                filterType: "CUSTOM",
                                startDate,
                                endDate,
                              })
                            }
                            disabled={loading}
                            className="bg-yellow-400 text-black border-2 border-yellow-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                          >
                            {loading ? "Đang tải..." : "Tìm kiếm"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Error */}
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

        {/* ✅ Loading */}
        {loading && (
          <>
            {/* Skeleton Tổng quan */}
            <SectionTitle>Tổng quan</SectionTitle>
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
              <SkeletonCard colorClass="from-yellow-200 to-yellow-300" />
              <SkeletonCard colorClass="from-red-200 to-red-300" />
              <SkeletonCard colorClass="from-green-200 to-green-300" />
              <SkeletonCard colorClass="from-blue-200 to-blue-300" />
            </div>

            {/* Skeleton Chi tiết theo từng tuyến */}
            <div>
              <div className="flex items-end justify-between mb-4">
                <SectionTitle>Chi tiết theo từng tuyến</SectionTitle>
                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
              </div>

              <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <SkeletonRouteCard />
                <SkeletonRouteCard />
                <SkeletonRouteCard />
                <SkeletonRouteCard />
                <SkeletonRouteCard />
                <SkeletonRouteCard />
                <SkeletonRouteCard />
                <SkeletonRouteCard />
              </div>
            </div>
          </>
        )}

        {/* ✅ No data */}
        {!loading && (!data || data.length === 0) && (
          <div className="bg-white rounded-xl border-1 border-black p-12 md:p-16 text-center shadow-lg">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Scale className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-800 text-base md:text-lg font-bold mb-2">
              Không có dữ liệu
            </p>
            <p className="text-gray-600 text-sm">
              Thử đổi khoảng thời gian khác.
            </p>
          </div>
        )}

        {/* ✅ Data */}
        {!loading && data && data.length > 0 && metrics && (
          <>
            {/* SUMMARY CARDS */}
            <SectionTitle>Tổng quan</SectionTitle>

            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
              {/* Tổng KL thực - VÀNG */}
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-1 border-black min-h-[150px]">
                <div className="p-5 md:p-6 bg-gradient-to-br from-yellow-200 to-yellow-300 h-full">
                  <div className="flex items-center justify-between mb-4 min-w-0">
                    <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Tổng KL thực
                    </span>
                    <div className="p-2.5 rounded-lg bg-purple-500 shrink-0">
                      <Package className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-2xl md:text-3xl font-bold text-gray-900 leading-none break-words tabular-nums">
                      {formatKg(metrics.totalWeight)}
                    </span>
                    <span className="text-sm md:text-base text-black font-medium shrink-0">
                      kg
                    </span>
                  </div>

                  <div className="mt-3 text-xs md:text-sm text-black font-medium">
                    TB/tuyến: <b>{formatKg(metrics.avgWeightPerRoute)} kg</b>
                  </div>
                </div>
              </div>

              {/* Tổng KL thu - ĐỎ */}
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-1 border-black min-h-[150px]">
                <div className="p-5 md:p-6 bg-gradient-to-br from-red-200 to-red-300 h-full">
                  <div className="flex items-center justify-between mb-4 min-w-0">
                    <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Tổng KL thu
                    </span>
                    <div className="p-2.5 rounded-lg bg-red-500 shrink-0">
                      <Scale className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-2xl md:text-3xl font-bold text-gray-900 leading-none break-words tabular-nums">
                      {formatKg(metrics.totalNetWeight)}
                    </span>
                    <span className="text-sm md:text-base text-black font-medium shrink-0">
                      kg
                    </span>
                  </div>

                  <div className="mt-3 text-xs md:text-sm text-black font-medium">
                    TB/tuyến: <b>{formatKg(metrics.avgNetWeightPerRoute)} kg</b>
                  </div>
                </div>
              </div>

              {/* Chênh lệch - XANH LÁ */}
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-1 border-black min-h-[150px]">
                <div className="p-5 md:p-6 bg-gradient-to-br from-green-200 to-green-300 h-full">
                  <div className="flex items-center justify-between mb-4 min-w-0">
                    <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Chênh lệch
                    </span>
                    <div className="p-2.5 rounded-lg bg-green-600 shrink-0">
                      {metrics.totalDifference >= 0 ? (
                        <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      ) : (
                        <TrendingDown className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-2xl md:text-3xl font-bold text-gray-900 leading-none break-words tabular-nums">
                      {metrics.totalDifference >= 0 ? "+" : ""}
                      {formatKg(metrics.totalDifference)}
                    </span>
                    <span className="text-sm md:text-base text-black font-medium shrink-0">
                      kg
                    </span>
                  </div>

                  <div className="mt-3 text-xs md:text-sm text-black font-medium">
                    {metrics.totalWeight > 0 ? (
                      <>
                        ~{" "}
                        <b>
                          {(
                            (metrics.totalDifference / metrics.totalWeight) *
                            100
                          ).toFixed(1)}
                          %
                        </b>{" "}
                        so với KL thực
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              </div>

              {/* Tuyến hàng đầu - XANH DƯƠNG */}
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-1 border-black min-h-[150px]">
                <div className="p-5 md:p-6 bg-gradient-to-br from-blue-200 to-blue-300 h-full">
                  <div className="flex items-center justify-between mb-4 min-w-0">
                    <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Tuyến KL thu cao nhất
                    </span>
                    <div className="p-2.5 rounded-lg bg-blue-600 shrink-0">
                      <Award className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="text-lg md:text-xl font-bold text-gray-900 truncate leading-none mb-2">
                      {metrics.topRoute?.routeName || "N/A"}
                    </div>
                    <div className="text-sm md:text-base font-bold text-black tabular-nums">
                      {formatKg(metrics.topRoute?.totalNetWeight || 0)} kg
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROUTES GRID */}
            <div>
              <div className="flex items-end justify-between mb-4">
                <SectionTitle>Chi tiết theo từng tuyến</SectionTitle>
                <div className="text-xs text-gray-600">
                  Tổng:{" "}
                  <b className="text-black tabular-nums">
                    {metrics.totalRoutes}
                  </b>{" "}
                  tuyến
                </div>
              </div>

              <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {data.map((route, index) => {
                  const totalWeight = route.totalWeight || 0;
                  const totalNetWeight = route.totalNetWeight || 0;

                  const difference = totalNetWeight - totalWeight;
                  const percentDiff =
                    totalWeight > 0 ? (difference / totalWeight) * 100 : 0;

                  return (
                    <div
                      key={`${route.routeName}-${index}`}
                      className="bg-white rounded-xl border-1 border-black shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* header */}
                      <div className="p-4 md:p-5 bg-gradient-to-br from-gray-200 to-gray-300 border-b-2 border-black">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border-2 border-black font-bold text-black text-xs shrink-0">
                              {index + 1}
                            </div>
                            <h4 className="text-base md:text-lg font-bold text-black truncate">
                              {route.routeName}
                            </h4>
                          </div>

                          <div className="p-2 rounded-lg bg-white shrink-0">
                            <Scale className="h-4 w-4 text-black" />
                          </div>
                        </div>
                      </div>

                      {/* body */}
                      <div className="p-4 md:p-5 bg-white">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <Package className="h-4 w-4 text-gray-600 shrink-0" />
                              <span className="text-xs md:text-sm font-semibold text-gray-700 truncate">
                                KL thực
                              </span>
                            </div>
                            <span className="text-sm md:text-base font-bold text-gray-900 tabular-nums whitespace-nowrap">
                              {formatKg(totalWeight)} kg
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <Scale className="h-4 w-4 text-gray-600 shrink-0" />
                              <span className="text-xs md:text-sm font-semibold text-gray-700 truncate">
                                KL thu
                              </span>
                            </div>
                            <span className="text-sm md:text-base font-bold text-gray-900 tabular-nums whitespace-nowrap">
                              {formatKg(totalNetWeight)} kg
                            </span>
                          </div>
                        </div>

                        {/* difference */}
                        <div className="mt-4 pt-4 border-t-2 border-black">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              {difference >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600 shrink-0" />
                              )}
                              <span className="text-xs md:text-sm font-semibold text-gray-700 truncate">
                                Chênh lệch
                              </span>
                            </div>

                            <div className="text-right">
                              <div
                                className={`text-sm md:text-base font-bold tabular-nums ${
                                  difference >= 0
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {difference >= 0 ? "+" : ""}
                                {formatKg(difference)} kg
                              </div>
                              <div
                                className={`text-xs font-semibold tabular-nums ${
                                  difference >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                ({difference >= 0 ? "+" : ""}
                                {percentDiff.toFixed(1)}%)
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer summary */}
              <div className="mt-6 bg-white rounded-xl border-1 border-black p-4 shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-black">
                    <p className="text-xs text-black uppercase font-semibold mb-1">
                      Tổng tuyến
                    </p>
                    <p className="text-xl font-bold text-gray-900 tabular-nums">
                      {metrics.totalRoutes}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-black">
                    <p className="text-xs text-black uppercase font-semibold mb-1">
                      Tổng KL thực
                    </p>
                    <p className="text-base font-bold text-gray-900 tabular-nums">
                      {formatKg(metrics.totalWeight)} kg
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-black">
                    <p className="text-xs text-black uppercase font-semibold mb-1">
                      Tổng KL thu
                    </p>
                    <p className="text-base font-bold text-gray-900 tabular-nums">
                      {formatKg(metrics.totalNetWeight)} kg
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-black">
                    <p className="text-xs text-black uppercase font-semibold mb-1">
                      Chênh lệch
                    </p>
                    <p
                      className={`text-base font-bold tabular-nums ${
                        metrics.totalDifference >= 0
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {metrics.totalDifference >= 0 ? "+" : ""}
                      {formatKg(metrics.totalDifference)} kg
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SummaryWeight;
