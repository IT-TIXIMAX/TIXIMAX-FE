// src/Components/DashboardSale.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import { DateRange } from "react-date-range";
import { addYears, isAfter, isBefore, endOfDay, startOfDay } from "date-fns";
import {
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  X,
  RotateCcw,
  Weight,
  BarChart3,
} from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import saleService from "../../Services/Dashboard/saleService";

/* ---------------------- Helpers ---------------------- */
const toYMD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const fmtVN = (d) =>
  d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatCurrency = (num) =>
  (Number(num) || 0).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

const formatNum = (n) => (Number.isFinite(n) ? n.toLocaleString("vi-VN") : "—");

/* ---------------------- Loading Skeleton ---------------------- */
const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-200 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-3 bg-gray-200 rounded w-20"></div>
      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="h-7 bg-gray-200 rounded w-28 mb-1"></div>
    <div className="h-2.5 bg-gray-200 rounded w-16"></div>
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-5 bg-gray-200 rounded-full"></div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </div>
    <div className="h-[200px] bg-gray-100 rounded-lg mb-3"></div>
    <div className="pt-3 border-t border-gray-100 flex justify-between">
      <div className="h-2.5 bg-gray-200 rounded w-20"></div>
      <div className="h-2.5 bg-gray-200 rounded w-20"></div>
    </div>
  </div>
);

/* ---------------------- Component ---------------------- */
const DashboardSale = () => {
  const maxDate = endOfDay(new Date());
  const minDate = startOfDay(addYears(new Date(), -1));

  const [selectionRange, setSelectionRange] = useState({
    startDate: startOfDay(new Date()),
    endDate: endOfDay(new Date()),
    key: "selection",
  });
  const [openPicker, setOpenPicker] = useState(false);
  const [perf, setPerf] = useState({ loading: false, error: "", row: null });

  const { rangeLabel, startYMD, endYMD } = useMemo(() => {
    let s = selectionRange.startDate
      ? startOfDay(selectionRange.startDate)
      : minDate;
    let e = selectionRange.endDate ? endOfDay(selectionRange.endDate) : maxDate;

    if (isBefore(s, minDate)) s = minDate;
    if (isAfter(e, maxDate)) e = maxDate;
    if (isAfter(s, e)) s = e;

    return {
      startDateClamped: s,
      endDateClamped: e,
      startYMD: toYMD(s),
      endYMD: toYMD(e),
      rangeLabel: `${fmtVN(s)} - ${fmtVN(e)}`,
    };
  }, [selectionRange, minDate, maxDate]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setPerf((s) => ({ ...s, loading: true, error: "" }));
        const data = await saleService.getMyPerformance(startYMD, endYMD);
        const firstKey = data ? Object.keys(data)[0] : null;
        const row = firstKey ? data[firstKey] : null;
        if (!ignore) setPerf({ loading: false, error: "", row });
      } catch (e) {
        if (!ignore)
          setPerf({
            loading: false,
            error: e?.message || "Không lấy được hiệu suất.",
            row: null,
          });
      }
    })();
    return () => {
      ignore = true;
    };
  }, [startYMD, endYMD]);

  const handleSelect = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setSelectionRange({
      startDate: startDate || selectionRange.startDate,
      endDate: endDate || selectionRange.endDate,
      key: "selection",
    });
  };

  const resetToToday = () => {
    setSelectionRange({
      startDate: startOfDay(new Date()),
      endDate: endOfDay(new Date()),
      key: "selection",
    });
  };

  const applyAndClose = () => {
    setOpenPicker(false);
  };

  const row = perf.row || {
    totalGoods: 0,
    totalShip: 0,
    totalOrders: 0,
    totalParcels: 0,
    completionRate: 0,
    totalNetWeight: 0,
    badFeedbackCount: 0,
    newCustomersInPeriod: 0,
    name: "",
    staffCode: "",
  };

  const chartValueVsShip = [
    { name: "Giá trị hàng", value: row.totalGoods || 0 },
    { name: "Phí ship", value: row.totalShip || 0 },
  ];
  const chartOrdersVsParcels = [
    { name: "Đơn hàng", value: row.totalOrders || 0 },
    { name: "Kiện hàng", value: row.totalParcels || 0 },
  ];
  const completion = Math.max(
    0,
    Math.min(100, Number(row.completionRate || 0))
  );
  const chartCompletion = [
    { name: "Hoàn tất", value: completion },
    { name: "Còn lại", value: Math.max(0, 100 - completion) },
  ];
  const chartWeight = [
    { name: "Khối lượng (kg)", value: row.totalNetWeight || 0 },
  ];

  return (
    <section className="min-h-screen ">
      {/* ✅ NEW: Separate Header Section */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6">
        <div className=" mx-auto bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-lg rounded-2xl">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Thống kế hiệu suất cá nhân
                </h1>
                {row.staffCode && (
                  <p className="text-blue-100 text-sm mt-0.5">
                    Nhân viên:{" "}
                    <span className="font-semibold text-white">
                      {row.name || row.staffCode}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ✅ MODIFIED: Control Card - chỉ còn date range và buttons */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-blue-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold">{rangeLabel}</span>
              </div>

              {perf.error && (
                <div className="mt-2 flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-600 text-xs">⚠️ {perf.error}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetToToday}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-gray-700 text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm"
                title="Về hôm nay"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hôm nay</span>
              </button>

              <button
                onClick={() => setOpenPicker(true)}
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span>Chọn ngày</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {perf.loading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <SkeletonChart />
              <SkeletonChart />
              <SkeletonChart />
              <SkeletonChart />
            </div>
          </>
        ) : (
          <>
            {/* KPI Cards - COMPACT 4 CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Card 1: Tổng doanh thu */}
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tổng tiền hàng
                  </h3>
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(row.totalGoods)}
                </p>
                <p className="text-xs text-gray-500 mt-1.5">
                  Phí ship: {formatCurrency(row.totalShip)}
                </p>
              </div>

              {/* Card 2: Tổng đơn hàng */}
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-cyan-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tổng đơn hàng
                  </h3>
                  <div className="p-1.5 bg-cyan-100 rounded-lg">
                    <Package className="w-4 h-4 text-cyan-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNum(row.totalOrders)}
                </p>
                <p className="text-xs text-gray-500 mt-1.5">
                  Khách hàng mới: {formatNum(row.newCustomersInPeriod)}
                </p>
              </div>

              {/* Card 3: Tổng kiện hàng */}
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-teal-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tổng kiện hàng
                  </h3>
                  <div className="p-1.5 bg-teal-100 rounded-lg">
                    <Package className="w-4 h-4 text-teal-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNum(row.totalParcels)}
                </p>
                <p className="text-xs text-gray-500 mt-1.5">
                  Feedback: {formatNum(row.badFeedbackCount)}
                </p>
              </div>

              {/* Card 4: Tổng khối lượng hàng */}
              <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-indigo-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tổng khối lượng
                  </h3>
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <Weight className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNum(row.totalNetWeight)}
                </p>
                <p className="text-xs text-gray-500 mt-1.5">Đơn vị: kg</p>
              </div>
            </div>

            {/* Charts Grid - COMPACT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Chart 1: Giá trị hàng vs Phí ship */}
              <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                  Giá trị hàng vs Phí ship
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartValueVsShip}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis
                      tickFormatter={(v) => `${Math.round(v / 1_000_000)}tr`}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(v) => formatCurrency(v)}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    Doanh thu:{" "}
                    <b className="text-gray-900">
                      {formatCurrency(row.totalGoods)}
                    </b>
                  </span>
                  <span className="text-gray-600">
                    Phí ship:{" "}
                    <b className="text-gray-900">
                      {formatCurrency(row.totalShip)}
                    </b>
                  </span>
                </div>
              </div>

              {/* Chart 2: Số đơn vs Số kiện */}
              <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-cyan-500 rounded-full"></div>
                  Số đơn vs Số kiện
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartOrdersVsParcels}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#06b6d4"
                      stroke="#0891b2"
                      strokeWidth={2}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    Đơn:{" "}
                    <b className="text-gray-900">
                      {formatNum(row.totalOrders)}
                    </b>
                  </span>
                  <span className="text-gray-600">
                    Kiện:{" "}
                    <b className="text-gray-900">
                      {formatNum(row.totalParcels)}
                    </b>
                  </span>
                </div>
              </div>

              {/* Chart 3: Tỉ lệ hoàn tất */}
              <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
                  Tỉ lệ hoàn tất
                </h3>
                <div className="h-[200px]">
                  <ResponsiveContainer>
                    <RadialBarChart
                      data={chartCompletion}
                      innerRadius="55%"
                      outerRadius="95%"
                      startAngle={180}
                      endAngle={0}
                    >
                      <RadialBar
                        dataKey="value"
                        cornerRadius={10}
                        fill="#14b8a6"
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={30}
                        iconType="circle"
                        wrapperStyle={{ fontSize: "12px" }}
                      />
                      <Tooltip
                        formatter={(v) => `${v}%`}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "12px",
                        }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    Hoàn tất:{" "}
                    <b className="text-teal-600">{completion.toFixed(1)}%</b>
                  </span>
                  <span className="text-gray-600">
                    Còn lại:{" "}
                    <b className="text-gray-900">
                      {(100 - completion).toFixed(1)}%
                    </b>
                  </span>
                </div>
              </div>

              {/* Chart 4: Khối lượng */}
              <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-indigo-500 rounded-full"></div>
                  Khối lượng tịnh (kg)
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartWeight}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#6366f1"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                  Tổng khối lượng:{" "}
                  <b className="text-gray-900">
                    {formatNum(row.totalNetWeight)} kg
                  </b>
                </div>
              </div>
            </div>

            {!perf.error && !perf.row && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-gray-500 text-sm">
                  Không có dữ liệu trong khoảng thời gian đã chọn
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Date Picker Popup Modal */}
      {openPicker && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setOpenPicker(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md md:max-w-lg max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between rounded-t-xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Chọn khoảng thời gian
                </h2>
              </div>
              <button
                onClick={() => setOpenPicker(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Date Picker */}
            <div className="p-4">
              <div className="flex justify-center">
                <DateRange
                  ranges={[selectionRange]}
                  onChange={handleSelect}
                  showSelectionPreview
                  moveRangeOnFirstSelection={false}
                  months={1}
                  direction="horizontal"
                  maxDate={maxDate}
                  minDate={minDate}
                  rangeColors={["#3b82f6"]}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-gray-200 px-5 py-3 flex items-center justify-between rounded-b-xl">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Đã chọn:</span>{" "}
                <span className="font-semibold text-gray-900">
                  {rangeLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpenPicker(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-gray-700 text-sm font-semibold transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={applyAndClose}
                  className="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors shadow-md"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DashboardSale;
