// src/pages/Manager/Dashboard/ManagerChartPayment.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Line } from "react-chartjs-2";
import { DollarSign, Truck, Calendar, TrendingUp } from "lucide-react";
import dashboardService from "../../../Services/Dashboard/dashboardService";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const CURRENT_YEAR = new Date().getFullYear();

const CHART_COLORS = {
  revenue: {
    border: "rgba(37, 99, 235, 1)",
    background: "rgba(37, 99, 235, 0.2)",
    point: "rgba(59, 130, 246, 1)",
  },
  shipping: {
    border: "rgba(249, 115, 22, 1)",
    background: "rgba(249, 115, 22, 0.2)",
    point: "rgba(251, 146, 60, 1)",
  },
};

const formatCurrency = (num) => {
  return num.toLocaleString("vi-VN") + " ₫";
};

const ManagerChartPayment = () => {
  const currentMonth = new Date().getMonth() + 1;

  const [month, setMonth] = useState(currentMonth);
  const [revenueData, setRevenueData] = useState([]);
  const [shippingData, setShippingData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ===================== Fetch data ===================== */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [rev, ship] = await Promise.all([
          dashboardService.dailyPaymentRevenue({ month, year: CURRENT_YEAR }),
          dashboardService.dailyPaymentShipping({ month, year: CURRENT_YEAR }),
        ]);
        setRevenueData(rev || []);
        setShippingData(ship || []);
      } catch {
        toast.error("Không lấy được dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [month]);

  /* ===================== Stats ===================== */
  const stats = useMemo(() => {
    const totalRev = revenueData.reduce((a, c) => a + (c.revenue || 0), 0);
    const totalShip = shippingData.reduce((a, c) => a + (c.revenue || 0), 0);
    const days = Math.max(revenueData.length, shippingData.length);

    return {
      totalRevenue: totalRev,
      totalShipping: totalShip,
      avgRevenue: days ? Math.round(totalRev / days) : 0,
      avgShipping: days ? Math.round(totalShip / days) : 0,
      totalDays: days,
    };
  }, [revenueData, shippingData]);

  /* ===================== Chart data builder ===================== */
  const buildChartData = (data, label, colorKey) => {
    const dates = [...new Set(data.map((i) => i.date))].sort();
    const colors = CHART_COLORS[colorKey];

    return {
      labels: dates.map((d) => new Date(d).getDate()),
      datasets: [
        {
          label,
          data: dates.map((d) => data.find((x) => x.date === d)?.revenue || 0),
          borderColor: colors.border,
          backgroundColor: colors.background,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: colors.point,
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        },
      ],
    };
  };

  /* ===================== Chart options ===================== */
  const getChartOptions = (yAxisLabel, colorKey) => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "center",
        labels: {
          usePointStyle: false,
          boxWidth: 30,
          boxHeight: 16,
          padding: 20,
          font: {
            size: 13,
            weight: "600",
            family: "system-ui, -apple-system, sans-serif",
          },
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
          title: (items) => `Ngày ${items[0].label}`,
          label: (ctx) =>
            `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: "#374151",
          font: { size: 12, weight: "600" },
          maxRotation: 0,
        },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(229, 231, 235, 0.8)", drawBorder: false },
        ticks: {
          color: "#1F2937",
          font: { size: 12, weight: "600" },
          padding: 8,
          callback: (v) => formatCurrency(v),
        },
        border: { display: false },
        title: {
          display: true,
          text: yAxisLabel,
          color: colorKey === "revenue" ? "#1E40AF" : "#C2410C",
          font: { size: 13, weight: "700" },
          padding: { bottom: 10 },
        },
      },
    },
  });

  // Loading skeletons
  const statsCardsSkeleton = Array.from({ length: 3 }).map((_, idx) => (
    <div
      key={idx}
      className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
    >
      <div className="p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-28" />
        </div>
        <div className="h-10 bg-gray-300 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
    </div>
  ));

  const chartSkeleton = (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-6 md:mb-8">
      <div className="px-5 md:px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-11 h-11 bg-gray-300 rounded-lg" />
          <div className="h-6 bg-gray-300 rounded w-64" />
        </div>
      </div>
      <div className="p-5 md:p-6">
        <div className="h-[350px] md:h-[400px] animate-pulse bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* Combined Header with Month Selector */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-lg border border-blue-500 p-6 md:p-8 mb-6 md:mb-8">
          {/* Title Section */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Thống Kê Thanh Toán & Vận Chuyển
              </h1>
              <p className="text-blue-100 text-sm font-medium mt-1">
                Báo cáo chi tiết theo tháng năm {CURRENT_YEAR}
              </p>
            </div>
          </div>

          {/* Month Selector */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 md:gap-3">
              {MONTHS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMonth(m)}
                  disabled={loading}
                  className={`
                    px-3 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
                    ${
                      month === m
                        ? "bg-white text-blue-700 shadow-lg scale-105"
                        : "bg-white/20 text-white hover:bg-white/30 hover:shadow-md backdrop-blur-sm"
                    }
                    ${loading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  Tháng {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-8">
          {loading ? (
            statsCardsSkeleton
          ) : (
            <>
              {/* Tổng doanh thu */}
              <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-700" />
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                      Tổng doanh thu
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-700">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    TB {formatCurrency(stats.avgRevenue)}/ngày
                  </div>
                </div>
              </div>

              {/* Tổng phí vận chuyển */}
              <div className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-orange-700" />
                    <div className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                      Tổng phí vận chuyển
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-orange-700">
                    {formatCurrency(stats.totalShipping)}
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    TB {formatCurrency(stats.avgShipping)}/ngày
                  </div>
                </div>
              </div>

              {/* Ngày có giao dịch */}
              <div className="bg-white rounded-xl shadow-md border border-emerald-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-emerald-700" />
                    <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                      Ngày có giao dịch
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-emerald-700">
                    {stats.totalDays}
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    Tháng {month}/{CURRENT_YEAR}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Revenue Chart */}
        {loading ? (
          chartSkeleton
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-6 md:mb-8">
            <div className="px-5 md:px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-600">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  Tiền Hàng Thu – Tháng {month}
                </h2>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <div className="h-[350px] md:h-[400px]">
                {revenueData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <DollarSign className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-base font-semibold text-gray-800">
                      Chưa có dữ liệu
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      Không có dữ liệu doanh thu trong tháng {month}/
                      {CURRENT_YEAR}
                    </p>
                  </div>
                ) : (
                  <Line
                    data={buildChartData(revenueData, "Doanh thu", "revenue")}
                    options={getChartOptions("Số tiền (₫)", "revenue")}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Shipping Chart */}
        {loading ? (
          chartSkeleton
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-6 md:mb-8">
            <div className="px-5 md:px-6 py-4 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-600">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  Tiền Vận Chuyển Thu – Tháng {month}
                </h2>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <div className="h-[350px] md:h-[400px]">
                {shippingData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <Truck className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-base font-semibold text-gray-800">
                      Chưa có dữ liệu
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      Không có dữ liệu vận chuyển trong tháng {month}/
                      {CURRENT_YEAR}
                    </p>
                  </div>
                ) : (
                  <Line
                    data={buildChartData(
                      shippingData,
                      "Phí vận chuyển",
                      "shipping",
                    )}
                    options={getChartOptions("Số tiền (₫)", "shipping")}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerChartPayment;
