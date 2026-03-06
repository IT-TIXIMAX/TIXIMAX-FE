// src/components/Dashboard/Manager/DashboardWHStats.jsx
import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Bar } from "react-chartjs-2";
import {
  Warehouse,
  RefreshCw,
  Clock,
  TrendingUp,
  Package,
  CalendarRange,
} from "lucide-react";
import dashboardService from "../../../Services/Dashboard/dashboardService";

const FILTER_OPTIONS = [
  { value: "DAY",       label: "Ngày" },
  { value: "WEEK",      label: "Tuần" },
  { value: "MONTH",     label: "Tháng" },
  { value: "QUARTER",   label: "Quý" },
  { value: "HALF_YEAR", label: "Nửa năm" },
  { value: "CUSTOM",    label: "Tùy chỉnh" },
];

const TODAY = new Date().toISOString().split("T")[0];
const FIRST_OF_YEAR = `${new Date().getFullYear()}-01-01`;

const StatCard = ({ icon, label, value, sub, colorClass }) => (
  <div className={`bg-white rounded-xl shadow-md border overflow-hidden hover:shadow-lg transition-shadow ${colorClass}`}>
    <div className="p-5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-500 font-medium mt-1">{sub}</div>}
    </div>
  </div>
);

const DashboardWHStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("MONTH");
  const [startDate, setStartDate] = useState(FIRST_OF_YEAR);
  const [endDate, setEndDate] = useState(TODAY);

  const fetchData = async (ft, sd, ed) => {
    setLoading(true);
    try {
      const result = await dashboardService.getWarehouseTimeStats({
        filterType: ft,
        startDate: sd,
        endDate: ed,
      });
      setData(result || []);
    } catch {
      toast.error("Không lấy được dữ liệu thống kê kho");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterType !== "CUSTOM") {
      fetchData(filterType);
    }
  }, [filterType]);

  const handleCustomApply = () => {
    if (!startDate || !endDate) {
      toast.error("Vui lòng chọn ngày bắt đầu và kết thúc");
      return;
    }
    fetchData("CUSTOM", startDate, endDate);
  };

  // Summary stats
  const totalDelivered = data.reduce((s, r) => s + (r.totalDelivered || 0), 0);
  const avgDomestic = data.length
    ? (data.reduce((s, r) => s + (r.avgDaysInDomesticWarehouse || 0), 0) / data.length).toFixed(2)
    : "—";
  const avgForeign = data.length
    ? (data.reduce((s, r) => s + (r.avgDaysInForeignWarehouse || 0), 0) / data.length).toFixed(2)
    : "—";

  // Chart
  const chartData = useMemo(() => ({
    labels: data.map((r) => r.country),
    datasets: [
      {
        label: "TB ngày kho VN",
        data: data.map((r) => r.avgDaysInDomesticWarehouse),
        backgroundColor: "rgba(37, 99, 235, 0.75)",
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: "TB ngày kho nước ngoài",
        data: data.map((r) => r.avgDaysInForeignWarehouse),
        backgroundColor: "rgba(5, 150, 105, 0.75)",
        borderColor: "rgba(5, 150, 105, 1)",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }), [data]);

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
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#fff",
        bodyColor: "#e5e7eb",
        borderColor: "rgba(75,85,99,0.3)",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} ngày`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#374151", font: { size: 13, weight: "600" } },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(229,231,235,0.8)" },
        ticks: {
          color: "#1F2937",
          font: { size: 12, weight: "600" },
          padding: 8,
          callback: (v) => `${v} ngày`,
        },
        border: { display: false },
        title: {
          display: true,
          text: "Số ngày trung bình",
          color: "#1E40AF",
          font: { size: 13, weight: "700" },
          padding: { bottom: 10 },
        },
      },
    },
  };

  const chartSkeleton = (
    <div className="h-[380px] animate-pulse bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg" />
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl shadow-lg border border-blue-500 p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Warehouse className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Thống Kê Thời Gian Kho
                </h1>
                <p className="text-blue-100 text-sm font-medium mt-1">
                  Số ngày trung bình hàng lưu kho theo quốc gia
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchData(filterType, startDate, endDate)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-sm transition-all border border-white/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>

          {/* Filter */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-white/80 text-xs font-bold uppercase tracking-wide mb-3">
              Bộ lọc thời gian
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterType(opt.value)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    filterType === opt.value
                      ? "bg-white text-blue-700 shadow-lg scale-105"
                      : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom date range */}
            {filterType === "CUSTOM" && (
              <div className="flex flex-wrap items-end gap-3 mt-3 pt-3 border-t border-white/20">
                <div className="flex flex-col gap-1">
                  <label className="text-white/70 text-xs font-semibold">Từ ngày</label>
                  <input
                    type="date"
                    value={startDate}
                    max={endDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white text-gray-800 text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-white/70 text-xs font-semibold">Đến ngày</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    max={TODAY}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white text-gray-800 text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <button
                  onClick={handleCustomApply}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 bg-white text-blue-700 rounded-lg font-bold text-sm hover:bg-blue-50 transition-all disabled:opacity-50"
                >
                  <CalendarRange className="w-4 h-4" />
                  Áp dụng
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<Package className="w-4 h-4 text-blue-600" />}
            label="Tổng đơn đã giao"
            value={totalDelivered.toLocaleString("vi-VN")}
            colorClass="border-blue-100"
          />
          <StatCard
            icon={<Clock className="w-4 h-4 text-emerald-600" />}
            label="TB ngày kho VN"
            value={`${avgDomestic} ngày`}
            sub="Trung bình tất cả quốc gia"
            colorClass="border-emerald-100"
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4 text-orange-500" />}
            label="TB ngày kho nước ngoài"
            value={`${avgForeign} ngày`}
            sub="Trung bình tất cả quốc gia"
            colorClass="border-orange-100"
          />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-6">
          <div className="px-5 md:px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Số Ngày Trung Bình Lưu Kho Theo Quốc Gia
              </h2>
            </div>
          </div>
          <div className="p-5 md:p-6">
            <div className="h-[380px]">
              {loading ? (
                chartSkeleton
              ) : data.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Warehouse className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-base font-semibold text-gray-700">Chưa có dữ liệu</p>
                  <p className="text-sm text-gray-400">Thử thay đổi bộ lọc thời gian</p>
                </div>
              ) : (
                <Bar data={chartData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-gray-900">Chi tiết theo quốc gia</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Quốc gia</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wide">Tổng đơn giao</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-blue-600 uppercase tracking-wide">TB ngày kho VN</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-emerald-600 uppercase tracking-wide">TB ngày kho nước ngoài</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100 animate-pulse">
                      <td className="px-5 py-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                      <td className="px-5 py-3"><div className="h-4 w-16 bg-gray-200 rounded ml-auto" /></td>
                      <td className="px-5 py-3"><div className="h-4 w-16 bg-gray-200 rounded ml-auto" /></td>
                      <td className="px-5 py-3"><div className="h-4 w-16 bg-gray-200 rounded ml-auto" /></td>
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-gray-400 text-sm font-medium">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  data.map((row, idx) => (
                    <tr
                      key={row.country}
                      className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}
                    >
                      <td className="px-5 py-3 font-semibold text-gray-900">{row.country}</td>
                      <td className="px-5 py-3 text-right font-bold text-gray-800">
                        {row.totalDelivered.toLocaleString("vi-VN")}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm">
                          <Clock className="w-3.5 h-3.5" />
                          {row.avgDaysInDomesticWarehouse} ngày
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm">
                          <Clock className="w-3.5 h-3.5" />
                          {row.avgDaysInForeignWarehouse} ngày
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWHStats;
