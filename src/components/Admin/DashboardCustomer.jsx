import React, { useState, useEffect } from "react";
import { User, Users, Calendar, FileText } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import dashboardService from "../../Services/Dashboard/dashboardService"; // Adjust the import path as needed

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardCustomer = () => {
  const currentYear = new Date().getFullYear(); // 2025 based on current date
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [customerMetrics, setCustomerMetrics] = useState([
    {
      title: "Khách hàng mới hôm nay",
      value: "0", // Placeholder, as no daily API provided
      icon: <User />,
      path: "/admin/customer/daily",
      ariaLabel: "Xem khách hàng mới hôm nay",
    },
    {
      title: "Khách hàng mới tuần này",
      value: "0", // Placeholder, as no weekly API provided
      icon: <Users />,
      path: "/admin/customer/weekly",
      ariaLabel: "Xem khách hàng mới tuần này",
    },
    {
      title: "Khách hàng mới tháng này",
      value: "0",
      icon: <Calendar />,
      path: "/admin/customer/monthly",
      ariaLabel: "Xem khách hàng mới tháng này",
    },
    {
      title: `Khách hàng mới năm ${currentYear}`,
      value: "0",
      icon: <FileText />,
      path: "/admin/customer/yearly",
      ariaLabel: `Xem khách hàng mới năm ${currentYear}`,
    },
  ]);

  const [chartData, setChartData] = useState({
    labels: [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ],
    datasets: [
      {
        label: "Khách hàng mới",
        data: Array(12).fill(0),
        borderColor: "#facc15",
        backgroundColor: "rgba(250, 204, 21, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#d1d5db",
        },
      },
      title: {
        display: true,
        text: `Khách hàng mới hàng tháng năm ${selectedYear}`,
        color: "#facc15",
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#d1d5db",
        },
      },
      y: {
        ticks: {
          color: "#d1d5db",
          callback: (value) => `${value}`,
        },
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardService.getYearlyCustomer(selectedYear);
        const data = response.data; // Assuming response.data is the array of monthly objects

        // Process chart data
        const monthlyNewCustomers = Array(12).fill(0);
        data.forEach((item) => {
          if (item.month >= 1 && item.month <= 12) {
            monthlyNewCustomers[item.month - 1] = item.newCustomers;
          }
        });

        setChartData((prev) => ({
          ...prev,
          datasets: [
            {
              ...prev.datasets[0],
              data: monthlyNewCustomers,
            },
          ],
        }));

        // Calculate metrics
        const totalYearly = monthlyNewCustomers.reduce(
          (sum, val) => sum + val,
          0
        );
        const currentMonth = new Date().getMonth() + 1; // 1-12
        const monthlyNew = monthlyNewCustomers[currentMonth - 1];

        setCustomerMetrics((prev) => {
          const updated = [...prev];
          updated[2].value = monthlyNew.toString(); // Monthly (for the selected year's current month equivalent)
          updated[3].value = totalYearly.toString(); // Yearly
          updated[3].title = `Khách hàng mới năm ${selectedYear}`;
          updated[3].ariaLabel = `Xem khách hàng mới năm ${selectedYear}`;
          // Daily and weekly remain placeholders
          return updated;
        });
      } catch (error) {
        console.error("Error fetching customer data:", error);
        // Optionally handle errors, e.g., show toast or fallback to defaults
      }
    };

    fetchData();
  }, [selectedYear]);

  // Generate year options, e.g., from 2020 to current year
  const yearOptions = [];
  for (let y = 2020; y <= currentYear; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-yellow-300">
                Bảng Điều Khiển Khách Hàng
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <label
                htmlFor="year-select"
                className="text-gray-300 font-semibold"
              >
                Chọn năm:
              </label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-gray-800 text-white border border-yellow-500/30 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Customer Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {customerMetrics.map((item, index) => (
            <button
              key={index}
              onClick={() => (window.location.href = item.path)}
              className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-5 text-left hover:-translate-y-2 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
              aria-label={item.ariaLabel}
            >
              <div className="flex items-center space-x-4">
                {React.cloneElement(item.icon, {
                  className: "w-8 h-8 text-yellow-400",
                })}
                <div>
                  <h2 className="text-sm font-semibold uppercase text-gray-300">
                    {item.title}
                  </h2>
                  <p className="text-2xl font-bold text-yellow-400 mt-2">
                    {item.value}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Customer Chart */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-yellow-300 mb-6">
            Biểu Đồ Khách Hàng Mới
          </h2>
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6">
            <Line data={chartData} options={chartOptions} />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-yellow-300 mb-6">
            Tác Vụ Nhanh
          </h2>
          <div className="flex flex-wrap gap-5">
            <button
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 px-8 py-4 rounded-lg text-black font-semibold hover:scale-105 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
              onClick={() => (window.location.href = "/admin/customer/reports")}
              aria-label="Xem báo cáo chi tiết"
            >
              Xem Báo Cáo Chi Tiết
            </button>
            <button
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 px-8 py-4 rounded-lg text-black font-semibold hover:scale-105 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
              onClick={() => (window.location.href = "/admin/customer/export")}
              aria-label="Xuất dữ liệu khách hàng"
            >
              Xuất Dữ Liệu
            </button>
            <button
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 px-8 py-4 rounded-lg text-black font-semibold hover:scale-105 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
              onClick={() => (window.location.href = "/admin/customer/compare")}
              aria-label="So sánh khách hàng"
            >
              So Sánh Khách Hàng
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardCustomer;
