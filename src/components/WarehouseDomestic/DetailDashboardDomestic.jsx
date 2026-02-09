// src/pages/Manager/Dashboard/DetailDashboardDomestic.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Bar } from "react-chartjs-2";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  TrendingUp,
  BarChart3,
  Users,
} from "lucide-react";
import dashboardWarehouseService from "../../Services/Dashboard/dashboardwarehouseService";

// Constants
const PAGE_SIZE = 100;
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const CURRENT_YEAR = new Date().getFullYear();

// Chart colors
const CHART_COLORS = {
  bar: {
    background: "rgba(37, 99, 235, 0.85)",
    border: "rgba(37, 99, 235, 1)",
    hover: "rgba(29, 78, 216, 1)",
  },
  line: {
    background: "rgba(249, 115, 22, 0.2)",
    border: "rgba(249, 115, 22, 1)",
    point: "rgba(251, 146, 60, 1)",
  },
};

// Utility functions
const formatNumber = (num, decimals = 0) => {
  if (typeof num !== "number") return "0";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const DetailDashboardDomestic = () => {
  const currentMonth = new Date().getMonth() + 1;

  // States
  const [month, setMonth] = useState(currentMonth);
  const [customerData, setCustomerData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");

  // Fetch all data when month changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingCustomer(true);
        setLoadingChart(true);

        // Fetch both API calls in parallel
        const [customerRes, chartRes] = await Promise.all([
          dashboardWarehouseService.getCustomerInventory({
            page: 0,
            size: 100,
            month,
            year: CURRENT_YEAR,
          }),
          dashboardWarehouseService.getExportedDashboard({
            month,
            year: CURRENT_YEAR,
          }),
        ]);

        setCustomerData(customerRes?.data?.content || []);
        setChartData(chartRes?.data || []);
        setPage(0);
      } catch (err) {
        console.error("Error loading data:", err);
        toast.error("Không lấy được dữ liệu");
      } finally {
        setLoadingCustomer(false);
        setLoadingChart(false);
      }
    };

    loadData();
  }, [month]);

  // Filtered customer data
  const filteredCustomerData = useMemo(() => {
    if (!keyword.trim()) return customerData;
    const lowerKeyword = keyword.toLowerCase();
    return customerData.filter(
      (item) =>
        item.customerName?.toLowerCase().includes(lowerKeyword) ||
        item.customerCode?.toLowerCase().includes(lowerKeyword),
    );
  }, [customerData, keyword]);

  // Paginated customer data
  const paginatedCustomerData = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredCustomerData.slice(start, start + PAGE_SIZE);
  }, [filteredCustomerData, page]);

  const totalPages = Math.ceil(filteredCustomerData.length / PAGE_SIZE);

  // Customer summary totals
  const customerSummary = useMemo(() => {
    return filteredCustomerData.reduce(
      (acc, cur) => {
        const inv = cur.inventoryQuantity || {};
        acc.exportedCode += inv.exportedCode || 0;
        acc.exportedWeightKg += inv.exportedWeightKg || 0;
        acc.remainingCode += inv.remainingCode || 0;
        acc.remainingWeightKg += inv.remainingWeightKg || 0;
        return acc;
      },
      {
        exportedCode: 0,
        exportedWeightKg: 0,
        remainingCode: 0,
        remainingWeightKg: 0,
      },
    );
  }, [filteredCustomerData]);

  // Chart summary stats
  const chartStats = useMemo(() => {
    const total = chartData.reduce(
      (acc, i) => ({
        code: acc.code + i.totalCode,
        weight: acc.weight + i.totalWeight,
      }),
      { code: 0, weight: 0 },
    );

    return {
      totalCode: total.code,
      totalWeight: total.weight,
      avgCode:
        chartData.length > 0 ? (total.code / chartData.length).toFixed(0) : 0,
      avgWeight:
        chartData.length > 0 ? (total.weight / chartData.length).toFixed(2) : 0,
    };
  }, [chartData]);

  // Chart configuration
  const chartConfig = useMemo(
    () => ({
      labels: chartData.map((i) => new Date(i.date).getDate()),
      datasets: [
        {
          type: "bar",
          label: "Số kiện xuất",
          data: chartData.map((i) => i.totalCode),
          backgroundColor: CHART_COLORS.bar.background,
          borderColor: CHART_COLORS.bar.border,
          borderWidth: 2,
          borderRadius: 6,
          hoverBackgroundColor: CHART_COLORS.bar.hover,
          yAxisID: "y",
          barThickness: 24,
          maxBarThickness: 32,
          order: 2,
        },
        {
          type: "line",
          label: "Tổng trọng lượng (kg)",
          data: chartData.map((i) => Number(i.totalWeight.toFixed(2))),
          borderColor: CHART_COLORS.line.border,
          backgroundColor: CHART_COLORS.line.background,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: CHART_COLORS.line.point,
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          yAxisID: "y1",
          order: 1,
        },
      ],
    }),
    [chartData],
  );

  const chartOptions = {
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
          label: (context) => {
            let label = context.dataset.label || "";
            if (label) label += ": ";
            if (context.parsed.y !== null) {
              if (context.datasetIndex === 1) {
                label += context.parsed.y.toFixed(2) + " kg";
              } else {
                label += context.parsed.y + " kiện";
              }
            }
            return label;
          },
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
        type: "linear",
        position: "left",
        beginAtZero: true,
        grid: { color: "rgba(229, 231, 235, 0.8)", drawBorder: false },
        ticks: {
          color: "#1F2937",
          font: { size: 12, weight: "600" },
          padding: 8,
          callback: (value) => value + " kiện",
        },
        border: { display: false },
        title: {
          display: true,
          text: "Số kiện",
          color: "#1E40AF",
          font: { size: 13, weight: "700" },
          padding: { bottom: 10 },
        },
      },
      y1: {
        type: "linear",
        position: "right",
        beginAtZero: true,
        grid: { drawOnChartArea: false, drawBorder: false },
        ticks: {
          color: "#C2410C",
          font: { size: 12, weight: "600" },
          padding: 8,
          callback: (value) => value.toFixed(1) + " kg",
        },
        border: { display: false },
        title: {
          display: true,
          text: "Trọng lượng",
          color: "#C2410C",
          font: { size: 13, weight: "700" },
          padding: { bottom: 10 },
        },
      },
    },
  };

  // Loading Skeletons
  const statsCardsSkeleton = Array.from({ length: 4 }).map((_, idx) => (
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

  const tableSkeletonRows = Array.from({ length: 10 }).map((_, idx) => (
    <tr key={idx} className="border-t border-gray-100">
      {Array.from({ length: 7 }).map((_, cellIdx) => (
        <td key={cellIdx} className="p-3 md:p-4">
          <div className="animate-pulse bg-gray-200 h-4 rounded w-full" />
        </td>
      ))}
    </tr>
  ));

  return (
    <div className="min-h-screen ">
      <div className="mx-auto p-4 md:p-6 lg:p-8 ">
        {/* Combined Header with Month Selector */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-lg border border-blue-500 p-6 md:p-8 mb-6 md:mb-8">
          {/* Title Section */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Thống Kê Tồn Kho & Xuất Kho
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
                  disabled={loadingChart || loadingCustomer}
                  className={`
                    px-3 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
                    ${
                      month === m
                        ? "bg-white text-blue-700 shadow-lg scale-105"
                        : "bg-white/20 text-white hover:bg-white/30 hover:shadow-md backdrop-blur-sm"
                    }
                    ${loadingChart || loadingCustomer ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  Tháng {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
          {loadingChart ? (
            statsCardsSkeleton
          ) : (
            <>
              {/* Tổng kiện xuất */}
              <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-700" />
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                      Tổng kiện xuất
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-700">
                    {formatNumber(chartStats.totalCode)}
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    TB {chartStats.avgCode} kiện/ngày
                  </div>
                </div>
              </div>

              {/* Tổng KL xuất */}
              <div className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-orange-700" />
                    <div className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                      Tổng KL xuất
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-orange-700">
                    {formatNumber(chartStats.totalWeight, 2)}
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    TB {chartStats.avgWeight} kg/ngày
                  </div>
                </div>
              </div>

              {/* Tổng KH có tồn */}
              <div className="bg-white rounded-xl shadow-md border border-emerald-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-emerald-700" />
                    <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                      Khách hàng
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-emerald-700">
                    {filteredCustomerData.length}
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    Có dữ liệu tồn kho
                  </div>
                </div>
              </div>

              {/* Tổng tồn kho */}
              <div className="bg-white rounded-xl shadow-md border border-purple-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-purple-700" />
                    <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                      Tồn kho (mã)
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-purple-700">
                    {formatNumber(customerSummary.remainingCode)}
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    {formatNumber(customerSummary.remainingWeightKg, 2)} kg
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Chart Section */}
        {loadingChart ? (
          chartSkeleton
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-6 md:mb-8">
            <div className="px-5 md:px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-600">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  Biểu đồ xuất kho theo ngày
                </h2>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <div className="h-[350px] md:h-[400px]">
                {chartData.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <TrendingUp className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-base font-semibold text-gray-800">
                      Chưa có dữ liệu
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      Không có dữ liệu xuất kho trong tháng {month}/
                      {CURRENT_YEAR}
                    </p>
                  </div>
                ) : (
                  <Bar data={chartConfig} options={chartOptions} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search Filter */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 md:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-600">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              Chi tiết tồn kho khách hàng
            </h2>
          </div>

          <div className="mt-4">
            <div className="relative max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(0);
                }}
                placeholder="Tìm mã / tên khách hàng..."
                className="pl-10 px-4 py-2.5 border-2 border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Customer Inventory Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
              <tr className="text-blue-900 font-semibold">
                <th className="p-3 md:p-4 text-left text-sm whitespace-nowrap">
                  Mã KH
                </th>
                <th className="p-3 md:p-4 text-left text-sm whitespace-nowrap">
                  Tên KH
                </th>
                <th className="p-3 md:p-4 text-left text-sm whitespace-nowrap">
                  Nhân viên
                </th>
                <th className="p-3 md:p-4 text-right text-sm whitespace-nowrap">
                  Đã xuất (mã)
                </th>
                <th className="p-3 md:p-4 text-right text-sm whitespace-nowrap">
                  Đã xuất (kg)
                </th>
                <th className="p-3 md:p-4 text-right text-sm whitespace-nowrap">
                  Còn lại (mã)
                </th>
                <th className="p-3 md:p-4 text-right text-sm whitespace-nowrap">
                  Còn lại (kg)
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loadingCustomer ? (
                tableSkeletonRows
              ) : paginatedCustomerData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 md:p-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-base font-semibold text-gray-800">
                        Không có dữ liệu
                      </p>
                      <p className="text-sm text-gray-600 font-medium">
                        Không tìm thấy khách hàng phù hợp
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomerData.map((item, idx) => {
                  const inv = item.inventoryQuantity || {};
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="p-3 md:p-4 font-semibold text-gray-900 text-sm">
                        {item.customerCode}
                      </td>
                      <td className="p-3 md:p-4 text-gray-800 text-sm font-medium">
                        {item.customerName}
                      </td>
                      <td className="p-3 md:p-4 text-gray-700 text-sm">
                        {item.staffName}
                      </td>
                      <td className="p-3 md:p-4 text-right text-gray-900 text-sm font-semibold">
                        {formatNumber(inv.exportedCode || 0)}
                      </td>
                      <td className="p-3 md:p-4 text-right text-gray-900 text-sm font-semibold">
                        {formatNumber(inv.exportedWeightKg || 0, 2)}
                      </td>
                      <td className="p-3 md:p-4 text-right text-gray-900 text-sm font-semibold">
                        {formatNumber(inv.remainingCode || 0)}
                      </td>
                      <td className="p-3 md:p-4 text-right text-gray-900 text-sm font-semibold">
                        {formatNumber(inv.remainingWeightKg || 0, 2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Footer Summary */}
            {!loadingCustomer && paginatedCustomerData.length > 0 && (
              <tfoot className="bg-gradient-to-r from-blue-100 to-blue-50 border-t-2 border-blue-200">
                <tr className="font-bold text-blue-900">
                  <td
                    colSpan={3}
                    className="p-3 md:p-4 text-left text-sm uppercase tracking-wide"
                  >
                    Tổng cộng
                  </td>
                  <td className="p-3 md:p-4 text-right text-sm">
                    {formatNumber(customerSummary.exportedCode)}
                  </td>
                  <td className="p-3 md:p-4 text-right text-sm">
                    {formatNumber(customerSummary.exportedWeightKg, 2)}
                  </td>
                  <td className="p-3 md:p-4 text-right text-sm">
                    {formatNumber(customerSummary.remainingCode)}
                  </td>
                  <td className="p-3 md:p-4 text-right text-sm">
                    {formatNumber(customerSummary.remainingWeightKg, 2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        {!loadingCustomer && paginatedCustomerData.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-700 font-medium">
              Hiển thị {page * PAGE_SIZE + 1} -{" "}
              {Math.min((page + 1) * PAGE_SIZE, filteredCustomerData.length)} /{" "}
              {filteredCustomerData.length} khách hàng
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={page === 0}
                onClick={() => setPage((prev) => prev - 1)}
                className="p-2.5 border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all"
              >
                <ChevronLeft size={18} className="text-gray-700" />
              </button>

              <span className="text-sm font-semibold text-gray-800 min-w-[100px] text-center">
                Trang {page + 1} / {totalPages || 1}
              </span>

              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="p-2.5 border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all"
              >
                <ChevronRight size={18} className="text-gray-700" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailDashboardDomestic;
