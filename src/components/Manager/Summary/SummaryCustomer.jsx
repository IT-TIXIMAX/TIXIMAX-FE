// pages/Manager/Dashboard/SummaryCustomer.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../../Services/Dashboard/dashboardService";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Users,
  UserPlus,
  TrendingUp,
  Award,
  Loader2,
  AlertCircle,
  Calendar,
  Medal,
  Crown,
} from "lucide-react";

const FILTER_OPTIONS = [
  { label: "Hôm nay", value: "DAY" },
  { label: "Tháng này", value: "MONTH" },
  { label: "Quý này", value: "QUARTER" },
  { label: "6 tháng", value: "HALF_YEAR" },
  { label: "Tùy chỉnh", value: "CUSTOM" },
];

const SummaryCustomer = () => {
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

    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getStaffCustomersSummary({
        filterType,
        startDate,
        endDate,
      });
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Lỗi khi tải dữ liệu khách hàng"
      );
      toast.error("Lỗi khi tải dữ liệu khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const formatNumber = (value) => {
    if (value == null) return "0";
    return Number(value).toLocaleString("vi-VN");
  };

  // Tính toán các metrics
  const calculateMetrics = () => {
    if (!data || !Array.isArray(data)) return null;

    const totalCustomers = data.reduce(
      (sum, item) => sum + (item.newCustomerCount || 0),
      0
    );
    const totalStaff = data.length;
    const topPerformer = data.length > 0 ? data[0] : null;
    const avgCustomersPerStaff =
      totalStaff > 0 ? totalCustomers / totalStaff : 0;

    return {
      totalCustomers,
      totalStaff,
      topPerformer,
      avgCustomersPerStaff,
    };
  };

  const metrics = calculateMetrics();

  // Skeleton Loading
  const SkeletonCard = () => (
    <div className="rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-5 shadow-sm border border-gray-100">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-24 rounded bg-gray-300" />
          <div className="h-10 w-10 rounded-xl bg-gray-300" />
        </div>
        <div className="h-8 w-32 rounded bg-gray-300" />
      </div>
    </div>
  );

  // Get medal icon cho top 3
  const getMedalIcon = (index) => {
    if (index === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-700" />;
    return null;
  };

  // Get background color cho ranking
  const getRankBgColor = (index) => {
    if (index === 0)
      return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
    if (index === 1)
      return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
    if (index === 2)
      return "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200";
    return "bg-white border-gray-200";
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto">
        {/* HEADER */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-sky-300 px-6 py-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-black mb-1">
                <button
                  onClick={() => navigate("/manager/dashboard")}
                  className="hover:underline flex items-center gap-1 transition-all"
                >
                  <ArrowLeft size={14} />
                  Dashboard
                </button>
                <span className="h-1 w-1 rounded-full bg-black" />
                <span>Khách hàng mới theo nhân viên</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <Users className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-semibold text-black">
                    Thống kê khách hàng mới
                  </h1>
                </div>
              </div>
            </div>

            {/* FILTER */}
            <div className="flex flex-col items-start gap-2 md:items-end">
              <span className="text-xs font-medium uppercase tracking-wide text-black-500">
                Khoảng thời gian
              </span>

              <div className="inline-flex rounded-xl bg-gray-100 p-1">
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
          </div>

          {/* CUSTOM DATE RANGE */}
          {filterType === "CUSTOM" && (
            <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-sky-400">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-black" />
                <span className="text-sm font-medium text-black">Từ ngày:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-black">
                  Đến ngày:
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={fetchSummary}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Đang tải..." : "Tìm kiếm"}
              </button>
            </div>
          )}
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
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              Không có dữ liệu khách hàng trong khoảng thời gian này
            </p>
          </div>
        )}

        {/* DATA */}
        {!loading && data && data.length > 0 && metrics && (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
              {/* Tổng khách hàng mới */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                      Tổng KH mới
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {formatNumber(metrics.totalCustomers)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-3">
                    <UserPlus className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Số nhân viên */}
              <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                      Số nhân viên
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {formatNumber(metrics.totalStaff)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-3">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Top Performer */}
              <div className="rounded-2xl bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-900 mb-1">
                      Nhân viên xuất sắc
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {metrics.topPerformer?.staffName || "N/A"}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatNumber(
                        metrics.topPerformer?.newCustomerCount || 0
                      )}{" "}
                      KH
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-3">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Trung bình */}
              <div className="rounded-2xl bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                      TB mỗi NV
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {metrics.avgCustomersPerStaff.toFixed(1)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-3">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* RANKING TABLE */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">
                Bảng xếp hạng nhân viên
              </h3>

              <div className="space-y-2">
                {data.map((staff, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${getRankBgColor(
                      index
                    )}`}
                  >
                    {/* Left: Rank + Name */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Rank Number */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200 font-bold text-gray-900">
                        {index === 0 || index === 1 || index === 2 ? (
                          getMedalIcon(index)
                        ) : (
                          <span className="text-sm">{index + 1}</span>
                        )}
                      </div>

                      {/* Staff Name */}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {staff.staffName}
                        </p>
                        {index === 0 && (
                          <p className="text-xs text-yellow-600 font-medium">
                            🏆 Xuất sắc nhất
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Customer Count */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(staff.newCustomerCount)}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        khách hàng
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Tổng cộng: <strong>{metrics.totalStaff}</strong> nhân viên
                  </span>
                  <span className="text-gray-600">
                    Tổng:{" "}
                    <strong>{formatNumber(metrics.totalCustomers)}</strong>{" "}
                    khách hàng mới
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SummaryCustomer;
