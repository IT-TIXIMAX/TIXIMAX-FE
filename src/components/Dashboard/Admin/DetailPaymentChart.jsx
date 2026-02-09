// src/pages/Manager/Dashboard/DetailPaymentChart.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Line } from "react-chartjs-2";
import { DollarSign, Truck, Calendar } from "lucide-react";
import dashboardService from "../../../Services/Dashboard/dashboardService";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const CURRENT_YEAR = new Date().getFullYear();

const YELLOW = {
  border: "#facc15",
  bg: "rgba(250, 204, 21, 0.2)",
};

const DetailPaymentChart = () => {
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
  const buildChartData = (data, label) => {
    const dates = [...new Set(data.map((i) => i.date))].sort();
    return {
      labels: dates.map((d) => new Date(d).getDate()),
      datasets: [
        {
          label,
          data: dates.map((d) => data.find((x) => x.date === d)?.revenue || 0),
          borderColor: YELLOW.border,
          backgroundColor: YELLOW.bg,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: "#fff",
          pointBorderWidth: 3,
        },
      ],
    };
  };

  /* ===================== Chart options ===================== */
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#d1d5db", font: { size: 13 } } },
      tooltip: {
        backgroundColor: "#1f2937",
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString("vi-VN")} ₫`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#d1d5db" },
        title: {
          display: true,
          text: "Ngày",
          color: "#f5df18",
          font: { size: 14, weight: "600" },
          padding: { top: 10 },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#d1d5db",
          callback: (v) => v.toLocaleString("vi-VN") + " ₫",
        },
        title: {
          display: true,
          text: "Số tiền",
          color: "#f5df18",
          font: { size: 14, weight: "600" },
          padding: { bottom: 10 },
        },
      },
    },
  };

  return (
    <div className="min-h-screen p-6">
      <div className=" mx-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-yellow-300">
            Thống Kê Thanh Toán & Vận Chuyển
          </h1>

          <div className="flex flex-wrap gap-3 mt-6">
            {MONTHS.map((m) => (
              <button
                key={m}
                onClick={() => setMonth(m)}
                disabled={loading}
                className={`px-6 py-3 rounded-xl font-semibold transition-all border
                  ${
                    month === m
                      ? "bg-yellow-400 text-black border-yellow-400 scale-105"
                      : "bg-gray-800 text-gray-300 border-yellow-500/30 hover:bg-yellow-500/10"
                  }`}
              >
                Tháng {m}
              </button>
            ))}
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: <DollarSign />,
              title: "Tổng doanh thu",
              value: stats.totalRevenue,
              sub: `Trung bình ${stats.avgRevenue.toLocaleString()} VND/ngày`,
            },
            {
              icon: <Truck />,
              title: "Tổng phí vận chuyển",
              value: stats.totalShipping,
              sub: `Trung bình ${stats.avgShipping.toLocaleString()} VND/ngày`,
            },
            {
              icon: <Calendar />,
              title: "Ngày có giao dịch",
              value: stats.totalDays,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-2xl p-6 hover:-translate-y-2 hover:shadow-xl transition-all"
            >
              {React.cloneElement(item.icon, {
                className: "w-8 h-8 text-yellow-400 mb-4",
              })}
              <p className="text-3xl font-bold text-yellow-400">
                {item.value.toLocaleString("vi-VN")} VND
              </p>
              <p className="text-xl text-yellow-400 mt-1">{item.title}</p>
              {item.sub && (
                <p className="text-xl text-yellow-400 mt-2">{item.sub}</p>
              )}
            </div>
          ))}
        </div>

        {/* Charts */}
        {[
          {
            title: "Tiền Hàng Thu",
            data: revenueData,
            label: "Doanh thu",
          },
          {
            title: "Tiền Vận Chuyển Thu",
            data: shippingData,
            label: "Phí vận chuyển",
          },
        ].map((c, i) => (
          <section key={i} className="mb-10">
            <h2 className="text-2xl font-semibold text-yellow-300 mb-4">
              {c.title} – Tháng {month}
            </h2>

            <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-2xl p-6 h-[420px]">
              <Line
                data={buildChartData(c.data, c.label)}
                options={chartOptions}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default DetailPaymentChart;
