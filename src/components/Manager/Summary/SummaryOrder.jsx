// pages/Manager/Dashboard/SummaryOrder.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../../Services/Dashboard/dashboardService";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Package,
  Link as LinkIcon,
  Award,
  AlertCircle,
  Calendar,
  ShoppingBag,
  Layers,
  ChevronRight,
} from "lucide-react";

const FILTER_OPTIONS = [
  { label: "Hôm nay", value: "DAY" },
  { label: "Tháng này", value: "MONTH" },
  { label: "Quý này", value: "QUARTER" },
  { label: "6 tháng", value: "HALF_YEAR" },
  { label: "Tùy chỉnh", value: "CUSTOM" },
];

const SummaryOrder = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("MONTH");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    if (filterType === "CUSTOM" && (!startDate || !endDate)) {
      toast.error("Vui lòng chọn ngày bắt đầu và kết thúc");
      return;
    }
    if (filterType === "CUSTOM" && startDate > endDate) {
      toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getRoutesOrdersSummary({
        filterType,
        startDate,
        endDate,
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Lỗi khi tải dữ liệu đơn hàng"
      );
      toast.error("Lỗi khi tải dữ liệu đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

  const metrics = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;

    const totalOrders = data.reduce(
      (sum, item) => sum + (item.totalOrders || 0),
      0
    );
    const totalLinks = data.reduce(
      (sum, item) => sum + (item.totalLinks || 0),
      0
    );
    const totalRoutes = data.length;

    // nếu BE không sort, vẫn ổn vì mình có thể sort nhẹ ở FE để lấy topRoute chắc chắn
    const sorted = [...data].sort(
      (a, b) => (b.totalOrders || 0) - (a.totalOrders || 0)
    );
    const topRoute = sorted.length > 0 ? sorted[0] : null;

    const avgOrdersPerRoute = totalRoutes > 0 ? totalOrders / totalRoutes : 0;

    return {
      totalOrders,
      totalLinks,
      totalRoutes,
      topRoute,
      avgOrdersPerRoute,
    };
  }, [data]);

  const SkeletonCard = () => (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-24 rounded bg-gray-100" />
          <div className="h-10 w-10 rounded-xl bg-gray-100" />
        </div>
        <div className="h-8 w-32 rounded bg-gray-100" />
      </div>
    </div>
  );

  const getRouteColor = (index) => {
    const colors = [
      "from-blue-50 to-blue-200 border-blue-200",
      "from-green-50 to-green-200 border-green-200",
      "from-purple-50 to-purple-200 border-purple-200",
      "from-amber-50 to-amber-200 border-amber-200",
      "from-pink-50 to-pink-200 border-pink-200",
      "from-indigo-50 to-indigo-200 border-indigo-200",
    ];
    return colors[index % colors.length];
  };

  const getRouteIconColor = (index) => {
    const colors = [
      "text-blue-600",
      "text-green-600",
      "text-purple-600",
      "text-amber-600",
      "text-pink-600",
      "text-indigo-600",
    ];
    return colors[index % colors.length];
  };

  const canSearchCustom = filterType === "CUSTOM";

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto">
        {/* ✅ Breadcrumb tách riêng */}
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-700">
          <button
            onClick={() => navigate("/manager/dashboard")}
            className="px-2 py-1 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="px-2 py-1 rounded-lg bg-white border border-gray-200">
            Đơn hàng theo tuyến
          </span>
        </div>

        {/* ✅ Header gọn */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-sky-300 px-6 py-4 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Top row */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <Package className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-semibold text-black">
                    Thống kê đơn hàng theo tuyến
                  </h1>
                </div>
              </div>

              {/* Quick info pill */}
              <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 bg-white/70">
                <div className="p-1.5 rounded-lg bg-white text-blue-700">
                  <Layers size={16} />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-gray-900">
                    {metrics ? formatNumber(metrics.totalRoutes) : "0"} tuyến
                  </div>
                  <div className="text-[11px] text-gray-600">Đang thống kê</div>
                </div>
              </div>
            </div>

            {/* Filters row */}
            <div className="pt-4 border-t border-sky-400">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/70">
                Khoảng thời gian
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="inline-flex flex-wrap rounded-xl bg-gray-100 p-1">
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilterType(opt.value)}
                      disabled={loading}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        filterType === opt.value
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Custom range bar */}
                {canSearchCustom && (
                  <div className="w-full lg:w-auto">
                    <div className="rounded-xl bg-white/70 border border-gray-200 p-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-800" />
                            <span className="text-sm font-semibold text-gray-900">
                              Tùy chỉnh:
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              Từ
                            </span>
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              Đến
                            </span>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                          </div>
                        </div>

                        <button
                          onClick={fetchSummary}
                          disabled={loading}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? "Đang tải..." : "Tìm kiếm"}
                        </button>
                      </div>

                      <p className="mt-2 text-xs text-gray-600">
                        Chọn ngày rồi bấm <b>Tìm kiếm</b> để cập nhật dữ liệu.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* NO DATA */}
        {!loading && (!data || data.length === 0) && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 text-sm font-semibold mb-1">
              Không có dữ liệu
            </p>
            <p className="text-gray-500 text-sm">
              Thử đổi khoảng thời gian khác.
            </p>
          </div>
        )}

        {/* DATA */}
        {!loading && data && data.length > 0 && metrics && (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
              {/* Tổng đơn hàng */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                      Tổng đơn hàng
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {formatNumber(metrics.totalOrders)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-3">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Tổng links */}
              <div className="rounded-2xl bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                      Tổng links
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {formatNumber(metrics.totalLinks)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-3">
                    <LinkIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Số tuyến */}
              <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                      Số tuyến
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {formatNumber(metrics.totalRoutes)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-3">
                    <Layers className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Tuyến hàng đầu */}
              <div className="rounded-2xl bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-900 mb-1">
                      Tuyến hàng đầu
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.topRoute?.routeName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-700 mt-1 font-semibold">
                      {formatNumber(metrics.topRoute?.totalOrders || 0)} đơn
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-3">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* ROUTES GRID */}
            <div>
              <div className="flex items-end justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase">
                  Chi tiết theo từng tuyến
                </h3>
                <div className="text-xs text-gray-500">
                  Tổng:{" "}
                  <b className="text-gray-800">
                    {formatNumber(metrics.totalRoutes)}
                  </b>{" "}
                  tuyến
                </div>
              </div>

              <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {data.map((route, index) => {
                  const ratio =
                    (route.totalLinks || 0) > 0
                      ? ((route.totalOrders || 0) / (route.totalLinks || 0)) *
                        100
                      : 0;

                  const percentOfTotal =
                    metrics.totalOrders > 0
                      ? ((route.totalOrders || 0) / metrics.totalOrders) * 100
                      : 0;

                  return (
                    <div
                      key={`${route.routeName}-${index}`}
                      className={`rounded-xl bg-gradient-to-br ${getRouteColor(
                        index
                      )} p-4 shadow-sm border transition-all hover:shadow-lg hover:-translate-y-1`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-gray-200 font-bold text-gray-900 text-xs">
                            {index + 1}
                          </div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {route.routeName}
                          </h4>
                        </div>
                        <div
                          className={`p-1.5 bg-white/70 rounded-lg ${getRouteIconColor(
                            index
                          )}`}
                        >
                          <Package className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <ShoppingBag className="h-3.5 w-3.5 text-gray-600" />
                            <span className="text-xs font-medium text-gray-700">
                              Đơn hàng
                            </span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {formatNumber(route.totalOrders)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <LinkIcon className="h-3.5 w-3.5 text-gray-600" />
                            <span className="text-xs font-medium text-gray-700">
                              Links
                            </span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {formatNumber(route.totalLinks)}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-gray-300">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">
                              Tỷ lệ đơn/link
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {ratio.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* % tổng đơn + bar */}
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">% tổng đơn</span>
                          <span className="font-bold text-gray-900">
                            {percentOfTotal.toFixed(1)}%
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, percentOfTotal)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer summary */}
              <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                      Tổng tuyến
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatNumber(metrics.totalRoutes)}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                      Tổng đơn
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatNumber(metrics.totalOrders)}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-green-50">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                      Tổng links
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatNumber(metrics.totalLinks)}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-purple-50">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                      TB/tuyến
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {metrics.avgOrdersPerRoute.toFixed(1)}
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

export default SummaryOrder;
