import React, { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertOctagon,
  RefreshCw,
  Receipt,
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

import dashboardService from "../../Services/Dashboard/dashboardService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPayment = () => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState([]); // [{month,totalRevenue,totalShip}] (backend trả như vậy)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const monthName = (m) => `Tháng ${m}`;

  const fetchYearly = async (y) => {
    try {
      setLoading(true);
      setError("");
      const res = await dashboardService.getYearlyPayments(y);
      const arr = Array.isArray(res?.data) ? res.data : [];
      setData(arr);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể tải dữ liệu payment dashboard."
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

  // ✅ Map đủ 12 tháng + đọc đúng field, dùng ?? để không mất 0
  const fullYearData = useMemo(() => {
    const byMonth = new Map(data.map((x) => [Number(x.month), x]));

    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const found = byMonth.get(m);

      const totalRevenue = Number(found?.totalRevenue ?? 0);
      const totalShip = Number(found?.totalShip ?? 0);

      return {
        month: m,
        totalRevenue: Number.isFinite(totalRevenue) ? totalRevenue : 0,
        totalShip: Number.isFinite(totalShip) ? totalShip : 0,
      };
    });
  }, [data]);

  const totals = useMemo(() => {
    return fullYearData.reduce(
      (acc, cur) => {
        acc.revenue += cur.totalRevenue;
        acc.ship += cur.totalShip;
        return acc;
      },
      { revenue: 0, ship: 0 }
    );
  }, [fullYearData]);

  const bestRevenueMonth = useMemo(() => {
    if (!fullYearData.length) return null;
    return fullYearData.reduce(
      (best, cur) =>
        cur.totalRevenue > (best?.totalRevenue ?? -1) ? cur : best,
      null
    );
  }, [fullYearData]);

  const bestShipMonth = useMemo(() => {
    if (!fullYearData.length) return null;
    return fullYearData.reduce(
      (best, cur) => (cur.totalShip > (best?.totalShip ?? -1) ? cur : best),
      null
    );
  }, [fullYearData]);

  const chartData = useMemo(() => {
    return {
      labels: fullYearData.map((x) => monthName(x.month)),
      datasets: [
        {
          label: "Doanh thu (VNĐ)",
          data: fullYearData.map((x) => x.totalRevenue),
          backgroundColor: "rgba(250, 204, 21, 0.6)",
          borderColor: "#facc15",
          borderWidth: 1,
        },
        {
          label: "Sản lượng ship",
          data: fullYearData.map((x) => x.totalShip),
          backgroundColor: "rgba(34, 197, 94, 0.6)",
          borderColor: "#22c55e",
          borderWidth: 1,
        },
      ],
    };
  }, [fullYearData]);

  const chartOptions = useMemo(() => {
    const nf = new Intl.NumberFormat("vi-VN");
    return {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#d1d5db" } },
        title: {
          display: true,
          text: `Payment theo tháng (${year})`,
          color: "#facc15",
          font: { size: 18 },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed?.y ?? 0;
              return `${ctx.dataset.label}: ${nf.format(v)}`;
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
            callback: (value) => nf.format(value),
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
        title: "Tổng doanh thu (năm)",
        value: `${nf.format(totals.revenue)} VNĐ`,
        icon: <DollarSign />,
        ariaLabel: "Tổng doanh thu payment trong năm",
      },
      {
        title: "Tổng ship (năm)",
        value: nf.format(totals.ship),
        icon: <Receipt />,
        ariaLabel: "Tổng sản lượng ship trong năm",
      },
      {
        title: "Năm đang xem",
        value: String(year),
        icon: <Calendar />,
        ariaLabel: "Năm đang xem",
      },
      {
        title: "Tháng top (doanh thu)",
        value: bestRevenueMonth
          ? `${monthName(bestRevenueMonth.month)} • ${nf.format(
              bestRevenueMonth.totalRevenue
            )} VNĐ`
          : "N/A",
        icon: <TrendingUp />,
        ariaLabel: "Tháng có doanh thu cao nhất",
      },
    ];
  }, [totals.revenue, totals.ship, year, bestRevenueMonth]);

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-yellow-300">
                  Dashboard Payment
                </h1>
                <p className="text-gray-300 text-sm mt-2">
                  Theo dõi doanh thu & sản lượng theo từng tháng
                </p>
              </div>
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
                  {idx === 3 && bestShipMonth ? (
                    <p className="text-xs text-gray-400 mt-2">
                      Top ship: {monthName(bestShipMonth.month)} •{" "}
                      {new Intl.NumberFormat("vi-VN").format(
                        bestShipMonth.totalShip
                      )}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-yellow-300 mb-6">
            Biểu đồ payment theo tháng
          </h2>

          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </section>

        {/* Month cards list */}
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
              // ✅ tháng 11/12 chắc chắn ACTIVE
              const isActive = m.totalRevenue > 0 || m.totalShip > 0;

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
                        <CreditCard
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
                          {isActive ? "Có giao dịch" : "Chưa có dữ liệu"}
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
                      <DollarSign
                        className="w-4 h-4 text-yellow-400"
                        aria-hidden
                      />
                      Doanh thu:{" "}
                      <span className="font-semibold text-gray-100">
                        {new Intl.NumberFormat("vi-VN").format(m.totalRevenue)}{" "}
                        VNĐ
                      </span>
                    </p>
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-green-400" aria-hidden />
                      Tổng ship:{" "}
                      <span className="font-semibold text-gray-100">
                        {new Intl.NumberFormat("vi-VN").format(m.totalShip)}
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
      </div>
    </div>
  );
};

export default DashboardPayment;
