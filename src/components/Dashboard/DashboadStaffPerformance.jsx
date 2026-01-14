import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Package,
  Weight,
  Calendar,
  BarChart3,
} from "lucide-react";
import { getGoodsAndWeight } from "../../Services/Dashboard/staffdashboardService";
import FilterRoute from "../../components/Filter/FilterRoute";

const FILTER_TYPES = [
  { value: "DAY", label: "Theo ngày", icon: Calendar },
  { value: "MONTH", label: "Theo tháng", icon: Calendar },
  { value: "QUARTER", label: "Theo quý", icon: BarChart3 },
];

const formatNumber = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0";
  return x.toLocaleString("vi-VN");
};

const formatWeight = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0";
  return x % 1 === 0 ? String(x) : x.toLocaleString("vi-VN");
};

const toRows = (obj) =>
  Object.entries(obj || {}).map(([currency, v]) => ({
    currency,
    totalGoods: Number(v?.totalGoods ?? 0),
    totalNetWeight: Number(v?.totalNetWeight ?? 0),
  }));

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-gray-50 rounded-xl p-6 animate-pulse shadow-sm"
        >
          <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

const DashboadStaffPerformance = () => {
  const [routeId, setRouteId] = useState("");
  const [filterType, setFilterType] = useState("DAY");
  const [useCustom, setUseCustom] = useState(false);
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-01-14");

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const rows = useMemo(() => {
    return toRows(data).sort((a, b) => a.currency.localeCompare(b.currency));
  }, [data]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.totalGoods += r.totalGoods;
        acc.totalNetWeight += r.totalNetWeight;
        return acc;
      },
      { totalGoods: 0, totalNetWeight: 0 }
    );
  }, [rows]);

  const buildParams = () => {
    const params = {};
    if (routeId !== "") params.routeId = Number(routeId);
    if (useCustom) {
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      params.filterType = "CUSTOM";
    } else {
      params.filterType = filterType || "DAY";
    }
    return params;
  };

  const fetchData = async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await getGoodsAndWeight(buildParams());
      setData(res || {});
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Có lỗi xảy ra";
      setErr(msg);
      setData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, filterType, useCustom, startDate, endDate]);

  return (
    <div className="min-h-screen p-6 ">
      <div className="mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 rounded-lg p-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    Báo Cáo Hiệu Suất
                  </h1>
                </div>
              </div>

              <button
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors disabled:opacity-50 border border-white/20"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Làm mới
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="p-6 bg-white">
            {/* Route Filter Component */}
            <FilterRoute
              value={routeId}
              onChange={setRouteId}
              label="Tuyến đường"
              showIcon={true}
              showLabel={true}
              placeholder="Tất cả tuyến đường"
              className="mb-5"
              showNote={true}
            />

            {/* Filter Mode Buttons */}
            <div className="mb-5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Loại bộ lọc
              </label>
              <div className="flex flex-wrap gap-2">
                {FILTER_TYPES.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = !useCustom && filterType === filter.value;
                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => {
                        setUseCustom(false);
                        setFilterType(filter.value);
                      }}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {filter.label}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setUseCustom(true)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    useCustom
                      ? "bg-green-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  Tùy chỉnh khoảng ngày
                </button>
              </div>
            </div>

            {/* Custom Date Range */}
            {useCustom && (
              <div className="mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <CalendarDays className="w-4 h-4 text-green-600" />
                  Chọn khoảng thời gian
                </label>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Từ ngày
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Đến ngày
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {err && (
              <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4 flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">
                    Có lỗi xảy ra
                  </p>
                  <p className="text-sm text-red-700 mt-1">{err}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <LoadingSkeleton />
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
              <BarChart3 className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-1">
              Không có dữ liệu
            </p>
            <p className="text-sm text-gray-500">
              Thử điều chỉnh bộ lọc hoặc chọn tuyến đường khác
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-gray-600 text-xs font-medium bg-gray-100 px-2 py-1 rounded-full">
                    TỔNG HÀNG
                  </div>
                </div>
                <div className="text-gray-600 text-sm font-medium mb-2">
                  Tổng số hàng hóa
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatNumber(totals.totalGoods)}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-purple-100 rounded-lg p-3">
                    <Weight className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-gray-600 text-xs font-medium bg-gray-100 px-2 py-1 rounded-full">
                    TỔNG TRỌNG LƯỢNG
                  </div>
                </div>
                <div className="text-gray-600 text-sm font-medium mb-2">
                  Tổng trọng lượng ròng
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {formatWeight(totals.totalNetWeight)}
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tiền tệ
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-end gap-2">
                          Tổng tiền hàng
                        </div>
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-end gap-2">
                          Tổng trọng lượng
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rows.map((r) => (
                      <tr
                        key={r.currency}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-medium text-xs">
                              {r.currency.substring(0, 2)}
                            </div>
                            <span className="font-medium text-gray-900">
                              {r.currency}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-base font-medium text-gray-900">
                            {formatNumber(r.totalGoods)} {r.currency}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-base font-medium text-gray-900">
                            {formatWeight(r.totalNetWeight)} Kg
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <td className="px-6 py-4 font-medium text-gray-900 text-sm uppercase">
                        Tổng cộng
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-blue-700">
                          {formatNumber(totals.totalGoods)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-purple-700">
                          {formatWeight(totals.totalNetWeight)} Kg
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboadStaffPerformance;
