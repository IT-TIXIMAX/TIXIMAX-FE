// src/components/Dashboard/Manager/AverageDeliveryHours.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Line } from "react-chartjs-2";
import { Clock, TrendingUp } from "lucide-react";
import dashboardService from "../../../Services/Dashboard/dashboardService";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const ROUTE_COLORS = [
  {
    border: "rgba(37, 99, 235, 1)",
    background: "rgba(37, 99, 235, 0.15)",
    point: "rgba(59, 130, 246, 1)",
  },
  {
    border: "rgba(234, 88, 12, 1)",
    background: "rgba(234, 88, 12, 0.15)",
    point: "rgba(251, 146, 60, 1)",
  },
  {
    border: "rgba(5, 150, 105, 1)",
    background: "rgba(5, 150, 105, 0.15)",
    point: "rgba(52, 211, 153, 1)",
  },
  {
    border: "rgba(147, 51, 234, 1)",
    background: "rgba(147, 51, 234, 0.15)",
    point: "rgba(196, 181, 253, 1)",
  },
  {
    border: "rgba(220, 38, 38, 1)",
    background: "rgba(220, 38, 38, 0.15)",
    point: "rgba(252, 165, 165, 1)",
  },
  {
    border: "rgba(202, 138, 4, 1)",
    background: "rgba(202, 138, 4, 0.15)",
    point: "rgba(253, 224, 71, 1)",
  },
];

const formatMonth = (dateStr) => {
  const d = new Date(dateStr);
  return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
};

const AverageDeliveryHours = () => {
  const currentMonth = new Date().getMonth() + 1;

  const [fromMonth, setFromMonth] = useState(1);
  const [toMonth, setToMonth] = useState(currentMonth);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await dashboardService.getAvgDeliveryHours({
          fromMonth,
          toMonth,
        });
        setData(result || []);
      } catch {
        toast.error("Không lấy được dữ liệu thời gian giao hàng");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fromMonth, toMonth]);

  // Derive sorted unique months and routes
  const { months, routes } = useMemo(() => {
    const monthSet = [...new Set(data.map((d) => d.month))].sort();
    const routeSet = [...new Set(data.map((d) => d.routeName))].sort();
    return { months: monthSet, routes: routeSet };
  }, [data]);

  // Stats per route (average across months)
  const routeStats = useMemo(() => {
    return routes.map((route) => {
      const rows = data.filter((d) => d.routeName === route);
      const avg = rows.length
        ? rows.reduce((s, r) => s + r.avgDeliveryHours, 0) / rows.length
        : 0;
      return { route, avg: avg.toFixed(2) };
    });
  }, [data, routes]);

  // Build multi-line chart data
  const chartData = useMemo(() => {
    if (!months.length || !routes.length) return { labels: [], datasets: [] };

    const datasets = routes.map((route, idx) => {
      const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
      return {
        label: route,
        data: months.map((m) => {
          const row = data.find((d) => d.month === m && d.routeName === route);
          return row ? row.avgDeliveryHours : null;
        }),
        borderColor: color.border,
        backgroundColor: color.background,
        pointBackgroundColor: color.point,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointRadius: 6,
        pointHoverRadius: 8,
        spanGaps: true,
      };
    });

    return {
      labels: months.map(formatMonth),
      datasets,
    };
  }, [data, months, routes]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 13, weight: "600" },
          color: "#1F2937",
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#e5e7eb",
        borderColor: "rgba(75, 85, 99, 0.3)",
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12, weight: "500" },
        callbacks: {
          label: (ctx) =>
            ctx.parsed.y !== null
              ? `${ctx.dataset.label}: ${ctx.parsed.y} giờ`
              : `${ctx.dataset.label}: Không có dữ liệu`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#374151",
          font: { size: 12, weight: "600" },
          maxRotation: 30,
        },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(229, 231, 235, 0.8)" },
        ticks: {
          color: "#1F2937",
          font: { size: 12, weight: "600" },
          padding: 8,
          callback: (v) => `${v}h`,
        },
        border: { display: false },
        title: {
          display: true,
          text: "Số giờ giao hàng trung bình",
          color: "#1E40AF",
          font: { size: 13, weight: "700" },
          padding: { bottom: 10 },
        },
      },
    },
  };

  // Skeleton helpers
  const statsSkeleton = Array.from({ length: 4 }).map((_, i) => (
    <div
      key={i}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-5 animate-pulse"
    >
      <div className="h-3 bg-gray-200 rounded w-20 mb-3" />
      <div className="h-8 bg-gray-300 rounded w-24 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-16" />
    </div>
  ));

  const chartSkeleton = (
    <div className="bg-white rounded-xl shadow-md border border-gray-100">
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-gray-200">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-11 h-11 bg-gray-300 rounded-lg" />
          <div className="h-6 bg-gray-300 rounded w-64" />
        </div>
      </div>
      <div className="p-6">
        <div className="h-[400px] animate-pulse bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* Header + Range Selector */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 rounded-2xl shadow-lg border border-indigo-500 p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Thời Gian Mua Hàng Trung Bình
              </h1>
              <p className="text-indigo-100 text-sm font-medium mt-1">
                Thống kê theo tuyến đường và tháng
              </p>
            </div>
          </div>

          {/* Month range selectors */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 space-y-4">
            {/* From Month */}
            <div>
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                Từ tháng
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
                {MONTHS.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setFromMonth(m);
                      if (m > toMonth) setToMonth(m);
                    }}
                    disabled={loading}
                    className={`px-2 py-2 rounded-lg font-semibold text-xs transition-all duration-200 ${
                      fromMonth === m
                        ? "bg-white text-indigo-700 shadow-lg scale-105"
                        : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    T{m}
                  </button>
                ))}
              </div>
            </div>

            {/* To Month */}
            <div>
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-2">
                Đến tháng
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
                {MONTHS.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setToMonth(m);
                      if (m < fromMonth) setFromMonth(m);
                    }}
                    disabled={loading}
                    className={`px-2 py-2 rounded-lg font-semibold text-xs transition-all duration-200 ${
                      toMonth === m
                        ? "bg-white text-indigo-700 shadow-lg scale-105"
                        : m < fromMonth
                          ? "bg-white/10 text-white/40 cursor-not-allowed"
                          : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    T{m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards per route */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8`}>
          {loading
            ? statsSkeleton
            : routeStats.map(({ route, avg }, idx) => {
                const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
                return (
                  <div
                    key={route}
                    className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div
                      className="p-5"
                      style={{
                        background: `linear-gradient(135deg, ${color.background.replace("0.15", "0.08")}, ${color.background})`,
                        borderLeft: `4px solid ${color.border}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock
                          className="w-4 h-4"
                          style={{ color: color.border }}
                        />
                        <span
                          className="text-xs font-semibold uppercase tracking-wide"
                          style={{ color: color.border }}
                        >
                          {route}
                        </span>
                      </div>
                      <div
                        className="text-3xl font-bold"
                        style={{ color: color.border }}
                      >
                        {avg}
                        <span className="text-lg font-semibold ml-1">h</span>
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-1">
                        Trung bình tháng {fromMonth} – {toMonth}
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Chart */}
        {loading ? (
          chartSkeleton
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-100">
            <div className="px-5 md:px-6 py-4 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-600">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  Thời Gian Mua Hàng Trung Bình – Tháng {fromMonth} đến{" "}
                  {toMonth}
                </h2>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <div className="h-[400px]">
                {data.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-base font-semibold text-gray-800">
                      Chưa có dữ liệu
                    </p>
                    <p className="text-sm text-gray-500 font-medium">
                      Không có dữ liệu trong khoảng tháng {fromMonth} –{" "}
                      {toMonth}
                    </p>
                  </div>
                ) : (
                  <Line data={chartData} options={chartOptions} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AverageDeliveryHours;
