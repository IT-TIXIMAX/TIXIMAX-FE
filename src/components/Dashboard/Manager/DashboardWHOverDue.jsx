// src/components/Dashboard/Manager/DashboardWHOverDue.jsx
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Warehouse,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  Package,
  User,
  Route,
} from "lucide-react";
import dashboardService from "../../../Services/Dashboard/dashboardService";

const PAGE_SIZES = [50, 100, 200];

const STATUS_MAP = {
  DA_NHAP_KHO_VN: {
    label: "Đã nhập kho VN",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  CHO_GIAO: {
    label: "Chờ giao",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  DANG_GIAO: {
    label: "Đang giao",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  DA_GIAO: {
    label: "Đã giao",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  TRA_HANG: {
    label: "Trả hàng",
    color: "bg-red-100 text-red-700 border-red-200",
  },
};

const getDaysColor = (days) => {
  if (days >= 14) return "text-red-600 font-bold";
  if (days >= 7) return "text-orange-500 font-bold";
  return "text-yellow-600 font-semibold";
};

const getDaysBg = (days) => {
  if (days >= 14) return "bg-red-50 border-red-200";
  if (days >= 7) return "bg-orange-50 border-orange-200";
  return "bg-yellow-50 border-yellow-200";
};

const SkeletonRows = ({ rows = 10 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={i} className="border-b border-gray-100 animate-pulse">
        <td className="px-4 py-3">
          <div className="h-3.5 w-12 bg-gray-200 rounded" />
        </td>
        <td className="px-4 py-3">
          <div className="h-3.5 w-14 bg-gray-200 rounded" />
        </td>
        <td className="px-4 py-3">
          <div className="h-3.5 w-32 bg-gray-200 rounded mb-1.5" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </td>
        <td className="px-4 py-3">
          <div className="h-3.5 w-24 bg-gray-200 rounded" />
        </td>
        <td className="px-4 py-3">
          <div className="h-5 w-12 bg-gray-200 rounded-full" />
        </td>
        <td className="px-4 py-3">
          <div className="h-5 w-24 bg-gray-200 rounded-full" />
        </td>
        <td className="px-4 py-3">
          <div className="h-3.5 w-24 bg-gray-200 rounded" />
        </td>
        <td className="px-4 py-3">
          <div className="h-6 w-14 bg-gray-200 rounded-lg" />
        </td>
        <td className="px-4 py-3">
          <div className="h-3.5 w-14 bg-gray-200 rounded" />
        </td>
      </tr>
    ))}
  </>
);

const DashboardWHOverDue = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getWarehouseOverdue(page, size);
      setData(res?.content || []);
      setTotalElements(res?.totalElements ?? 0);
      setTotalPages(res?.totalPages ?? 0);
    } catch {
      toast.error("Không lấy được dữ liệu kho quá hạn");
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0);
  };

  const statusInfo = (status) =>
    STATUS_MAP[status] ?? {
      label: status,
      color: "bg-gray-100 text-gray-600 border-gray-200",
    };

  // Summary stats
  const totalWeight = data.reduce((s, r) => s + (r.netWeight || 0), 0);
  const maxDays = data.length
    ? Math.max(...data.map((r) => r.daysInWarehouse))
    : 0;
  const criticalCount = data.filter((r) => r.daysInWarehouse >= 14).length;

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-red-600 via-red-700 to-rose-800 rounded-2xl shadow-lg border border-red-500 p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Kho Hàng Quá Hạn
                </h1>
                <p className="text-red-100 text-sm font-medium mt-1">
                  Danh sách đơn hàng tồn kho lâu chưa được xử lý
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-red-100 text-xs font-semibold uppercase tracking-wide mb-1">
                Tổng đơn
              </div>
              <div className="text-2xl font-bold text-white">
                {totalElements}
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-red-100 text-xs font-semibold uppercase tracking-wide mb-1">
                Nguy cấp ≥14 ngày
              </div>
              <div className="text-2xl font-bold text-white">
                {criticalCount}
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-red-100 text-xs font-semibold uppercase tracking-wide mb-1">
                Tổng khối lượng
              </div>
              <div className="text-2xl font-bold text-white">
                {totalWeight.toFixed(2)} kg
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-red-100 text-xs font-semibold uppercase tracking-wide mb-1">
                Lâu nhất
              </div>
              <div className="text-2xl font-bold text-white">
                {maxDays} ngày
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-red-600" />
              <span className="text-sm font-bold text-gray-900">
                {totalElements} đơn quá hạn
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">
                Hiển thị:
              </span>
              <div className="flex gap-1">
                {PAGE_SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSizeChange(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      size === s
                        ? "bg-red-600 text-white shadow"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-red-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    Kho
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    Đơn
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Khách hàng
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    Nhân viên
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Route className="w-3.5 h-3.5" /> Tuyến
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Nhập kho VN
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    Số ngày
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" /> KL (kg)
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows rows={10} />
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <Warehouse className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-base font-semibold text-gray-700">
                          Không có dữ liệu
                        </p>
                        <p className="text-sm text-gray-400">
                          Không có đơn hàng quá hạn trong kho
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((row, idx) => {
                    const st = statusInfo(row.status);
                    return (
                      <tr
                        key={row.warehouseId}
                        className={`border-b border-gray-100 transition-colors hover:bg-red-50/40 ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                          {row.warehouseId}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-blue-700 font-semibold font-mono text-xs">
                            {row.orderId}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-semibold text-gray-900 text-sm">
                            {row.customerName}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {row.customerId}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap text-sm">
                          {row.staffName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                            {row.routeName}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${st.color}`}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm whitespace-nowrap">
                          {row.domesticArrivalDate}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm border ${getDaysBg(row.daysInWarehouse)} ${getDaysColor(row.daysInWarehouse)}`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {row.daysInWarehouse}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-semibold text-sm whitespace-nowrap">
                          {row.netWeight} kg
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-3">
              <span className="text-sm text-gray-600 font-medium">
                Trang {page + 1} / {totalPages} &nbsp;·&nbsp; {totalElements}{" "}
                đơn
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || loading}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Trước
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                  const p = start + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      disabled={loading}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                        p === page
                          ? "bg-red-600 text-white shadow"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-red-300 hover:text-red-600"
                      }`}
                    >
                      {p + 1}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1 || loading}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Sau <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardWHOverDue;
