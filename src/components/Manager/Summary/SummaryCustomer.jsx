// pages/Manager/Dashboard/SummaryCustomer.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../../Services/Dashboard/dashboardService";
import toast from "react-hot-toast";
import {
  Users,
  UserPlus,
  TrendingUp,
  Award,
  AlertCircle,
  Calendar,
  Crown,
  X,
  BarChart3,
  ArrowLeft,
  ChevronRight,
  Trophy,
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

const RankingCardSkeleton = () => (
  <div className="group relative rounded-xl border-2 border-gray-200 bg-white p-4 md:p-5 animate-pulse">
    <div className="absolute -left-3 top-1/2 -translate-y-1/2">
      <Skeleton className="w-12 h-12 rounded-full" />
    </div>
    <div className="ml-10">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-24" />
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
const SummaryCustomer = () => {
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

      const response = await dashboardService.getStaffCustomersSummary(params);
      setData(response?.data || []);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi khi tải dữ liệu khách hàng";
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
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    const totalCustomers = data.reduce(
      (sum, item) => sum + (item.newCustomerCount || 0),
      0,
    );
    const totalStaff = data.length;

    const sorted = [...data].sort(
      (a, b) => (b.newCustomerCount || 0) - (a.newCustomerCount || 0),
    );
    const topPerformer = sorted[0] || null;

    const avgCustomersPerStaff =
      totalStaff > 0 ? totalCustomers / totalStaff : 0;

    return {
      totalCustomers,
      totalStaff,
      topPerformer,
      avgCustomersPerStaff,
      sorted,
    };
  }, [data]);

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
              <Users className="w-4 h-4 text-black" />
              <span className="text-sm font-semibold text-black">
                Khách hàng mới theo nhân viên
              </span>
            </div>
          </div>
        </div>

        {/* ✅ Header */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-yellow-300 via-yellow-300 to-yellow-300 border-[1px] border-black rounded-xl shadow-lg p-4 md:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1.5 h-8 md:h-9 bg-black rounded-full shrink-0 shadow-sm" />
                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl font-bold text-black leading-tight truncate">
                    Thống kê khách hàng mới
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
                  icon={UserPlus}
                  label="Tổng KH mới"
                  value={formatNumber(metrics.totalCustomers)}
                  unit={`TB/NV: ${metrics.avgCustomersPerStaff.toFixed(1)}`}
                  iconColor="bg-blue-600"
                  bgGradient="from-red-200 to-red-200"
                />

                <SummaryCard
                  icon={Users}
                  label="Số nhân viên"
                  value={formatNumber(metrics.totalStaff)}
                  unit="Có dữ liệu"
                  iconColor="bg-green-600"
                  bgGradient="from-green-50 to-green-100"
                />

                <SummaryCard
                  icon={Award}
                  label="NV xuất sắc"
                  value={
                    <div className="truncate">
                      <div className="text-lg font-bold truncate">
                        {metrics.topPerformer?.staffName || "N/A"}
                      </div>
                      <div className="text-xl font-semibold text-gray-600">
                        {formatNumber(
                          metrics.topPerformer?.newCustomerCount || 0,
                        )}{" "}
                        Khách hàng mới
                      </div>
                    </div>
                  }
                  unit=""
                  iconColor="bg-orange-600"
                  bgGradient="from-orange-50 to-orange-100"
                />

                <SummaryCard
                  icon={TrendingUp}
                  label="TB mỗi NV"
                  value={metrics.avgCustomersPerStaff.toFixed(1)}
                  unit="Khách hàng / nhân viên"
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

        {/* ✅ RANKING LIST - CLEAN & SIMPLE */}
        {loading ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-10 w-48" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <RankingCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          data &&
          data.length > 0 &&
          metrics && (
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 border-2 border-black flex items-center justify-center shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 uppercase">
                      Bảng xếp hạng nhân viên
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-300 border-2 border-black rounded-xl shadow-sm">
                  <TrendingUp className="w-5 h-5 text-black" />
                  <span className="text-sm font-bold text-black">
                    Tổng: {formatNumber(metrics.totalCustomers)} KH
                  </span>
                </div>
              </div>

              {/* ✅ RANKING LIST - NO PROGRESS BAR */}
              <div className="space-y-3">
                {metrics.sorted.map((staff, index) => {
                  const count = Number(staff.newCustomerCount || 0);

                  // ✅ Màu vàng cho top 3, còn lại màu trắng
                  const isTop3 = index < 3;
                  const rankBgColor = isTop3
                    ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                    : "bg-white border-2 border-gray-300";
                  const rankTextColor = isTop3 ? "text-white" : "text-gray-800";

                  return (
                    <div
                      key={`${staff.staffName}-${index}`}
                      className="group relative rounded-xl border-2 border-black bg-white hover:bg-yellow-50 transition-all duration-300 p-4 md:p-5 hover:shadow-lg"
                    >
                      {/* ✅ Rank Badge - ROUNDED FULL (tròn) */}
                      <div
                        className={`absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full ${rankBgColor} shadow-lg flex items-center justify-center border-2 border-black`}
                      >
                        <span className={`text-xl font-black ${rankTextColor}`}>
                          {index + 1}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 ml-10">
                        {/* Left: Name + Badge */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-lg md:text-xl truncate">
                            {staff.staffName}
                          </p>
                          {index === 0 && (
                            <div className="shrink-0 flex items-center gap-1 px-2 py-1 bg-yellow-400 border-2 border-black rounded-lg">
                              <Crown className="w-4 h-4 text-black" />
                              <span className="text-xs font-black text-black">
                                TOP 1
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Right: Big Number */}
                        <div className="text-right">
                          <div className="text-3xl md:text-4xl font-black text-gray-900 tabular-nums">
                            {formatNumber(count)}
                          </div>
                          <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                            khách hàng
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Summary */}
              <div className="mt-6 bg-yellow-300 border-2 border-black rounded-xl p-5 shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white border-2 border-black rounded-lg">
                    <div className="text-xs text-gray-600 uppercase font-bold mb-2 tracking-wide">
                      Tổng nhân viên
                    </div>
                    <div className="text-3xl font-black text-gray-900 tabular-nums">
                      {formatNumber(metrics.totalStaff)}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-white border-2 border-black rounded-lg">
                    <div className="text-xs text-gray-600 uppercase font-bold mb-2 tracking-wide">
                      Tổng KH mới
                    </div>
                    <div className="text-3xl font-black text-gray-900 tabular-nums">
                      {formatNumber(metrics.totalCustomers)}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-white border-2 border-black rounded-lg">
                    <div className="text-xs text-gray-600 uppercase font-bold mb-2 tracking-wide">
                      TB mỗi NV
                    </div>
                    <div className="text-3xl font-black text-gray-900 tabular-nums">
                      {metrics.avgCustomersPerStaff.toFixed(1)}
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

export default SummaryCustomer;
