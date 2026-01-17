// pages/Manager/Dashboard/SummaryRevenue.jsx
import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";

const FILTER_OPTIONS = [
  { label: "Hôm nay", value: "DAY" },
  { label: "Tháng này", value: "MONTH" },
  { label: "Quý này", value: "QUARTER" },
  { label: "6 tháng", value: "HALF_YEAR" },
  { label: "Tùy chỉnh", value: "CUSTOM" },
];

const STATUS_OPTIONS = [
  {
    label: "Đã thanh toán",
    value: "DA_THANH_TOAN",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    label: "Chờ thanh toán",
    value: "CHO_THANH_TOAN",
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    label: "Chờ thanh toán ship",
    value: "CHO_THANH_TOAN_SHIP",
    icon: Truck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    label: "Đã thanh toán ship",
    value: "DA_THANH_TOAN_SHIP",
    icon: CheckCircle,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    label: "Đã hoàn tiền",
    value: "DA_HOAN_TIEN",
    icon: RotateCcw,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

const SummaryRevenue = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("MONTH");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("CHO_THANH_TOAN");
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
      const res = await dashboardService.getRoutesRevenueSummary({
        filterType,
        startDate,
        endDate,
        status,
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Lỗi khi tải dữ liệu doanh thu"
      );
      toast.error("Không tải được dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, status]);

  const formatCurrency = (value) => {
    const n = Number(value || 0);
    return `${n.toLocaleString("vi-VN")} đ`;
  };

  const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

  const metrics = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;

    const totalRevenue = data.reduce(
      (sum, item) => sum + (item.totalRevenue || 0),
      0
    );
    const totalRoutes = data.length;
    // giả định data đã sort desc theo totalRevenue từ BE, nếu chưa thì vẫn ổn vì mình sort lại bên dưới
    const topRoute = data.length > 0 ? data[0] : null;
    const avgRevenuePerRoute = totalRoutes > 0 ? totalRevenue / totalRoutes : 0;

    return { totalRevenue, totalRoutes, topRoute, avgRevenuePerRoute };
  }, [data]);

  const currentStatusConfig =
    STATUS_OPTIONS.find((opt) => opt.value === status) || STATUS_OPTIONS[0];
  const StatusIcon = currentStatusConfig.icon;

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
            Doanh thu theo tuyến
          </span>
        </div>

        {/* ✅ Header gọn: Title + Icon / Filters */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-sky-300 px-6 py-4 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Top row */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <Banknote className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-semibold text-black">
                    Thống kê doanh thu theo tuyến
                  </h1>
                </div>
              </div>

              {/* Status pill (nhỏ gọn) */}
              <div
                className={`inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 bg-white/70`}
                title="Trạng thái đang xem"
              >
                <div
                  className={`p-1.5 rounded-lg bg-white ${currentStatusConfig.color}`}
                >
                  <StatusIcon size={16} />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-gray-900">
                    {currentStatusConfig.label}
                  </div>
                  <div className="text-[11px] text-gray-600">Trạng thái</div>
                </div>
              </div>
            </div>

            {/* Filters row */}
            <div className="pt-4 border-t border-sky-400 grid gap-4 lg:grid-cols-2">
              {/* Time filter */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/70">
                  Khoảng thời gian
                </div>
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
              </div>

              {/* Status filter */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/70">
                  Trạng thái thanh toán
                </div>
                <div className="inline-flex flex-wrap rounded-xl bg-gray-100 p-1">
                  {STATUS_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setStatus(opt.value)}
                        disabled={loading}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                          status === opt.value
                            ? `bg-white ${opt.color} shadow-sm`
                            : "text-gray-600 hover:text-gray-900"
                        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Icon size={14} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom range bar */}
              {canSearchCustom && (
                <div className="lg:col-span-2">
                  <div className="mt-1 rounded-xl bg-white/70 border border-gray-200 p-3">
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

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* LOADING STATE */}
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
            <Banknote className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 text-sm font-semibold mb-1">
              Không có dữ liệu
            </p>
            <p className="text-gray-500 text-sm">
              Thử đổi khoảng thời gian hoặc trạng thái thanh toán.
            </p>
          </div>
        )}

        {/* DATA */}
        {!loading && data && data.length > 0 && metrics && (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
              {/* Tổng doanh thu */}
              <div className="rounded-2xl bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                      Tổng doanh thu
                    </p>
                    <p className="mt-2 text-xl font-bold text-gray-900">
                      {formatCurrency(metrics.totalRevenue)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-3">
                    <Banknote className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Số tuyến */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-5 shadow-sm border border-gray-100">
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
                    <Layers className="h-6 w-6 text-blue-600" />
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
                      {formatCurrency(metrics.topRoute?.totalRevenue || 0)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-3">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* TB doanh thu/tuyến */}
              <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                      TB/tuyến
                    </p>
                    <p className="mt-2 text-lg font-bold text-gray-900">
                      {formatCurrency(metrics.avgRevenuePerRoute)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-3">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
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
                  Tổng: <b className="text-gray-800">{metrics.totalRoutes}</b>{" "}
                  tuyến
                </div>
              </div>

              <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {data.map((route, index) => {
                  const percentOfTotal =
                    metrics.totalRevenue > 0
                      ? (route.totalRevenue / metrics.totalRevenue) * 100
                      : 0;

                  return (
                    <div
                      key={`${route.routeName}-${index}`}
                      className={`rounded-xl bg-gradient-to-br ${getRouteColor(
                        index
                      )} p-4 shadow-sm border transition-all hover:shadow-lg hover:-translate-y-1`}
                    >
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
                          <DollarSign className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-gray-600 font-medium mb-0.5">
                          Doanh thu
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(route.totalRevenue)}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-gray-300">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700">
                            % tổng DT
                          </span>
                          <span className="text-base font-bold text-gray-900">
                            {percentOfTotal.toFixed(1)}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-600 h-1.5 rounded-full transition-all"
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

              {/* Summary Footer */}
              <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                      Tổng tuyến
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {metrics.totalRoutes}
                    </p>
                  </div>

                  <div className="text-center p-3 rounded-lg bg-green-50">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                      Tổng doanh thu
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {formatCurrency(metrics.totalRevenue)}
                    </p>
                  </div>

                  <div className="text-center p-3 rounded-lg bg-blue-50">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                      TB/tuyến
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {formatCurrency(metrics.avgRevenuePerRoute)}
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

export default SummaryRevenue;
