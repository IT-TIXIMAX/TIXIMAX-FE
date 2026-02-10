// src/Pages/.../DashboardPurchase.jsx
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Package,
  Truck,
  AlertCircle,
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import dashboardPurchaseService from "../../../Services/Dashboard/dashboardPurchaseService";

/* ===================== Config ===================== */
const PAGE_SIZES = [50, 100, 200];

const PURCHASE_SUMMARY_CONFIG = [
  {
    key: "totalOrderlinks",
    title: "Total Orders",
    icon: ShoppingCart,
    bgGradient: "from-blue-50 to-blue-100",
    iconColor: "bg-blue-600",
    textColor: "text-blue-600",
  },
  {
    key: "bought",
    title: "Purchased",
    icon: Package,
    bgGradient: "from-green-50 to-green-100",
    iconColor: "bg-green-600",
    textColor: "text-green-600",
  },
  {
    key: "waitingBuy",
    title: "Waiting to Buy",
    icon: AlertCircle,
    bgGradient: "from-yellow-50 to-yellow-100",
    iconColor: "bg-yellow-500",
    textColor: "text-yellow-600",
  },
  {
    key: "hasShipmentCode",
    title: "Has Shipment Code",
    icon: Truck,
    bgGradient: "from-emerald-50 to-emerald-100",
    iconColor: "bg-emerald-600",
    textColor: "text-emerald-600",
  },
  {
    key: "lackShipmentCode",
    title: "Missing Shipment Code",
    icon: Users,
    bgGradient: "from-red-50 to-red-100",
    iconColor: "bg-red-600",
    textColor: "text-red-600",
  },
];

const EXCHANGE_SUMMARY_CONFIG = [
  {
    key: "totalOrderlinks",
    title: "Total Exchange Orders",
    icon: DollarSign,
    bgGradient: "from-purple-50 to-purple-100",
    iconColor: "bg-purple-600",
    textColor: "text-purple-600",
  },
  {
    key: "waitingExchange",
    title: "Waiting Exchange",
    icon: Clock,
    bgGradient: "from-orange-50 to-orange-100",
    iconColor: "bg-orange-500",
    textColor: "text-orange-600",
  },
  {
    key: "exchanged",
    title: "Exchanged",
    icon: CheckCircle,
    bgGradient: "from-teal-50 to-teal-100",
    iconColor: "bg-teal-600",
    textColor: "text-teal-600",
  },
];

/* ===================== Skeleton ===================== */
const SummaryCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
    <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
      </div>
      <div className="h-10 w-16 bg-gray-300 rounded" />
    </div>
  </div>
);

const TableSkeleton = ({ rows = 10 }) => (
  <>
    {Array.from({ length: rows }).map((_, idx) => (
      <tr key={idx} className="border-b border-gray-100 animate-pulse">
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gray-200 rounded-full flex-shrink-0" />
            <div>
              <div className="h-4 w-28 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-16 bg-gray-100 rounded" />
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-14 bg-gray-100 rounded" />
        </td>
        {[...Array(5)].map((_, i) => (
          <td key={i} className="px-4 py-4">
            <div className="h-6 w-12 bg-gray-200 rounded-full" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

/* ===================== SummaryCard ===================== */
const SummaryCard = ({ config, value }) => {
  const Icon = config.icon;
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      <div className={`p-5 bg-gradient-to-br ${config.bgGradient}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
            {config.title}
          </span>
          <div className={`p-2.5 rounded-lg ${config.iconColor}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <span className={`text-4xl font-bold ${config.textColor}`}>
          {value ?? 0}
        </span>
      </div>
    </div>
  );
};

/* ===================== Section Label ===================== */
const SectionLabel = ({ label, color = "blue" }) => {
  const colorMap = {
    blue: "bg-blue-600",
    purple: "bg-purple-600",
  };
  return (
    <div className="flex items-center gap-3 mb-3">
      <div
        className={`w-1 h-6 ${colorMap[color] ?? colorMap.blue} rounded-full`}
      />
      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
};

/* ===================== Component ===================== */
const DashboardPurchase = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [total, setTotal] = useState(0);

  /* ===================== Fetch ===================== */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, detailRes] = await Promise.all([
        dashboardPurchaseService.purchaseSummary(),
        dashboardPurchaseService.purchaseDetail(page, size),
      ]);
      setSummary(summaryRes || null);
      setData(detailRes?.content || []);
      setTotal(detailRes?.totalElements || 0);
    } catch {
      toast.error("Failed to load purchase dashboard data");
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0);
  };

  const totalPages = Math.ceil(total / size);

  /* ===================== Render ===================== */
  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-lg border border-blue-500 p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Purchase Dashboard
                </h1>
                <p className="text-blue-100 text-sm font-medium mt-1">
                  Detailed order report by customer
                </p>
              </div>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* ===== Exchange Money Summary ===== */}
        <SectionLabel label="Exchange Money Summary" color="purple" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {loading && !summary
            ? Array.from({ length: 3 }).map((_, i) => (
                <SummaryCardSkeleton key={i} />
              ))
            : EXCHANGE_SUMMARY_CONFIG.map((config) => (
                <SummaryCard
                  key={config.key}
                  config={config}
                  value={summary?.exchangeMoneySummary?.[config.key]}
                />
              ))}
        </div>

        {/* ===== Purchase Summary ===== */}
        <SectionLabel label="Purchase Summary" color="blue" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {loading && !summary
            ? Array.from({ length: 5 }).map((_, i) => (
                <SummaryCardSkeleton key={i} />
              ))
            : PURCHASE_SUMMARY_CONFIG.map((config) => (
                <SummaryCard
                  key={config.key}
                  config={config}
                  value={summary?.purchaseSummary?.[config.key]}
                />
              ))}
        </div>
        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Toolbar */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-base font-semibold text-gray-800">
              Purchase Details by Customer
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">
                Rows per page:
              </span>
              <div className="flex gap-1.5">
                {PAGE_SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSizeChange(s)}
                    disabled={loading}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200
                      ${
                        size === s
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-blue-400"
                      }
                      ${loading ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">
                    Customer
                  </th>
                  <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">
                    Staff
                  </th>
                  <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">
                    Waiting
                  </th>
                  <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">
                    Purchased
                  </th>
                  <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">
                    Shipment Code
                  </th>
                  <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">
                    Missing Code
                  </th>
                  <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">
                    Total Links
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <TableSkeleton rows={size > 10 ? 10 : size} />
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <ShoppingCart
                        className="mx-auto text-gray-300 mb-3"
                        size={40}
                      />
                      <p className="text-gray-500 font-medium">
                        No data available
                      </p>
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-blue-50 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      {/* Customer */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {item.customerCode?.charAt(0)?.toUpperCase() ||
                                "?"}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {item.customerCode}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.customerName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Staff */}
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900">
                          {item.staffCode}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.staffName}
                        </div>
                      </td>

                      {/* Waiting */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
                          {item.waitingBuy}
                        </span>
                      </td>

                      {/* Purchased */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                          {item.bought}
                        </span>
                      </td>

                      {/* Has Shipment Code */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300">
                          {item.hasShipmentCode}
                        </span>
                      </td>

                      {/* Missing Code */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
                          {item.lackShipmentCode}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-4">
                        <span className="font-bold text-gray-900">
                          {item.totalOrderLinks}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && total > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {page * size + 1}
                </span>{" "}
                –{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min((page + 1) * size, total)}
                </span>{" "}
                of <span className="font-semibold text-gray-900">{total}</span>{" "}
                results
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <span className="px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg">
                  {page + 1} / {totalPages}
                </span>

                <button
                  disabled={(page + 1) * size >= total}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPurchase;
