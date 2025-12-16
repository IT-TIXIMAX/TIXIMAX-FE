import React, { useEffect, useMemo, useState } from "react";
import {
  Package,
  Link2,
  Calendar,
  TrendingUp,
  AlertOctagon,
  RefreshCw,
} from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ✅ đổi path import cho đúng dự án của bạn
import dashboardService from "../../Services/Dashboard/dashboardService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardOrder = () => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState([]); // [{month,totalOrders,totalLinks}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchYearly = async (y) => {
    try {
      setLoading(true);
      setError("");
      const res = await dashboardService.getYearlyOrders(y);
      const arr = Array.isArray(res?.data) ? res.data : [];
      setData(arr);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể tải dữ liệu dashboard."
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYearly(year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const monthName = (m) => `Tháng ${m}`;

  // ✅ đảm bảo đủ 12 tháng
  const fullYearData = useMemo(() => {
    const byMonth = new Map(data.map((x) => [Number(x.month), x]));
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const found = byMonth.get(m);
      return {
        month: m,
        totalOrders: Number(found?.totalOrders || 0),
        totalLinks: Number(found?.totalLinks || 0),
      };
    });
  }, [data]);

  const totals = useMemo(() => {
    return fullYearData.reduce(
      (acc, cur) => {
        acc.orders += cur.totalOrders;
        acc.links += cur.totalLinks;
        return acc;
      },
      { orders: 0, links: 0 }
    );
  }, [fullYearData]);

  const bestMonth = useMemo(() => {
    if (!fullYearData.length) return null;
    return fullYearData.reduce(
      (best, cur) => (cur.totalOrders > (best?.totalOrders ?? -1) ? cur : best),
      null
    );
  }, [fullYearData]);

  const chartData = useMemo(() => {
    return {
      labels: fullYearData.map((x) => monthName(x.month)),
      datasets: [
        {
          label: "Tổng đơn hàng",
          data: fullYearData.map((x) => x.totalOrders),
          backgroundColor: "rgba(250, 204, 21, 0.6)",
          borderColor: "#facc15",
          borderWidth: 1,
        },
        {
          label: "Tổng links",
          data: fullYearData.map((x) => x.totalLinks),
          backgroundColor: "rgba(34, 197, 94, 0.6)",
          borderColor: "#22c55e",
          borderWidth: 1,
        },
      ],
    };
  }, [fullYearData]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#d1d5db" },
        },
        title: {
          display: true,
          text: `Tổng đơn hàng & links theo tháng (${year})`,
          color: "#facc15",
          font: { size: 18 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed?.y ?? 0;
              return `${ctx.dataset.label}: ${new Intl.NumberFormat(
                "vi-VN"
              ).format(v)}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#d1d5db" },
          grid: { color: "rgba(209,213,219,0.08)" },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#d1d5db",
            callback: (value) => new Intl.NumberFormat("vi-VN").format(value),
          },
          grid: { color: "rgba(209,213,219,0.08)" },
        },
      },
    };
  }, [year]);

  const metricCards = useMemo(() => {
    const nf = new Intl.NumberFormat("vi-VN");
    return [
      {
        title: "Tổng đơn hàng (năm)",
        value: nf.format(totals.orders),
        icon: <Package />,
        ariaLabel: "Tổng đơn hàng trong năm",
      },
      {
        title: "Tổng links (năm)",
        value: nf.format(totals.links),
        icon: <Link2 />,
        ariaLabel: "Tổng links trong năm",
      },
      {
        title: "Năm đang xem",
        value: String(year),
        icon: <Calendar />,
        ariaLabel: "Năm đang xem",
      },
      {
        title: "Tháng tốt nhất (đơn)",
        value: bestMonth
          ? `${monthName(bestMonth.month)} • ${nf.format(
              bestMonth.totalOrders
            )}`
          : "N/A",
        icon: <TrendingUp />,
        ariaLabel: "Tháng có số đơn cao nhất",
      },
    ];
  }, [totals.orders, totals.links, year, bestMonth]);

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-yellow-300">
                Dashboard Đơn Hàng
              </h1>
              <p className="text-gray-300 text-sm mt-3">
                Theo dõi tổng đơn hàng & tổng links theo từng tháng
              </p>
            </div>

            {/* Year Picker + Reload */}
            <div className="flex items-center gap-3">
              <div className="bg-gray-800 border border-yellow-500/30 rounded-lg px-3 py-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-400" />
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="bg-transparent text-gray-200 outline-none"
                  aria-label="Chọn năm"
                >
                  {Array.from({ length: 6 }, (_, i) => currentYear - i).map(
                    (y) => (
                      <option key={y} value={y} className="bg-gray-900">
                        {y}
                      </option>
                    )
                  )}
                </select>
              </div>

              <button
                onClick={() => fetchYearly(year)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 px-4 py-2 rounded-lg text-black font-semibold hover:scale-[1.02] hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
                aria-label="Tải lại dữ liệu"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Đang tải..." : "Tải lại"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-6 bg-red-500/10 border border-red-400/30 rounded-2xl p-4 text-red-200 flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-red-300 mt-0.5" />
              <div>
                <p className="font-semibold">Có lỗi khi tải dữ liệu</p>
                <p className="text-sm text-red-200/80 mt-1">{error}</p>
              </div>
            </div>
          ) : null}
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {metricCards.map((metric, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-5 text-left"
              aria-label={metric.ariaLabel}
            >
              <div className="flex items-center space-x-4">
                {React.cloneElement(metric.icon, {
                  className: "w-8 h-8 text-yellow-400",
                  "aria-hidden": true,
                })}
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold uppercase text-gray-300">
                    {metric.title}
                  </h2>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-400 mt-2 truncate">
                    {metric.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Chart moved UP (no search bar) */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-yellow-300 mb-6">
            Biểu đồ đơn hàng & links theo tháng
          </h2>

          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </section>

        {/* Month cards list (no filter) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-5 animate-pulse"
              >
                <div className="h-4 w-40 bg-gray-700/60 rounded mb-4" />
                <div className="h-6 w-24 bg-gray-700/60 rounded mb-3" />
                <div className="h-4 w-56 bg-gray-700/60 rounded mb-2" />
                <div className="h-4 w-44 bg-gray-700/60 rounded" />
              </div>
            ))
          ) : fullYearData.length > 0 ? (
            fullYearData.map((m) => {
              const nf = new Intl.NumberFormat("vi-VN");
              const isActive = m.totalOrders > 0 || m.totalLinks > 0;

              return (
                <div
                  key={m.month}
                  className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-5 text-left hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          isActive
                            ? "bg-yellow-500/10 border-yellow-500/30"
                            : "bg-gray-700/20 border-gray-500/20"
                        }`}
                      >
                        <Package
                          className={`w-5 h-5 ${
                            isActive ? "text-yellow-400" : "text-gray-400"
                          }`}
                          aria-hidden
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold uppercase text-gray-300">
                          {monthName(m.month)}
                        </h3>
                        <p
                          className={`text-lg font-bold mt-1 ${
                            isActive ? "text-yellow-400" : "text-gray-400"
                          }`}
                        >
                          {isActive ? "Có hoạt động" : "Chưa có dữ liệu"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full border ${
                        isActive
                          ? "bg-green-500/10 text-green-200 border-green-400/30"
                          : "bg-gray-500/10 text-gray-300 border-gray-400/20"
                      }`}
                    >
                      {isActive ? "ACTIVE" : "EMPTY"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <Package
                        className="w-4 h-4 text-yellow-400"
                        aria-hidden
                      />
                      Tổng đơn:{" "}
                      <span className="font-semibold text-gray-100">
                        {nf.format(m.totalOrders)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-green-400" aria-hidden />
                      Tổng links:{" "}
                      <span className="font-semibold text-gray-100">
                        {nf.format(m.totalLinks)}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-300 text-center col-span-full">
              Không có dữ liệu để hiển thị
            </p>
          )}
        </div>

        {/* Quick actions */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-yellow-300 mb-6">
            Tác vụ nhanh
          </h2>

          <div className="flex flex-wrap gap-5">
            <button
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 px-8 py-4 rounded-lg text-black font-semibold hover:scale-105 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
              onClick={() => setYear(currentYear)}
              aria-label="Quay về năm hiện tại"
            >
              Về năm hiện tại
            </button>

            <button
              className="bg-gray-900/40 border border-yellow-500/30 hover:border-yellow-400/60 px-8 py-4 rounded-lg text-yellow-200 font-semibold hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
              onClick={() => fetchYearly(year)}
              aria-label="Làm mới dữ liệu"
              disabled={loading}
            >
              Làm mới dữ liệu
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardOrder;
