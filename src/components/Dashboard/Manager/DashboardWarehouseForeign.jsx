// pages/Manager/Dashboard/DashboardWarehouseForeign.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import dashboardService from "../../../Services/Dashboard/dashboardService";
import {
  Calendar,
  BarChart3,
  Package,
  Boxes,
  Warehouse,
  Weight,
  X,
} from "lucide-react";

const FILTER_TYPES = [
  { value: "DAY", label: "Hôm nay" },
  { value: "WEEK", label: "Tuần này" },
  { value: "MONTH", label: "Tháng này" },
  { value: "QUARTER", label: "Quý này" },
  { value: "HALF_YEAR", label: "6 tháng" },
];

const DEFAULT_FILTERS = { filterType: "MONTH" };

const n0 = (v) => Number(v || 0);
const fmtInt = (v) => new Intl.NumberFormat("vi-VN").format(n0(v));
const fmtKg = (v) =>
  `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(
    n0(v),
  )} kg`;

/* ===================== Skeleton ===================== */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-300 rounded ${className}`} />
);

const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border-1 border-black">
    <div className="p-5 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="h-10 md:h-12 w-32" />
    </div>
  </div>
);

const TableCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border-1 border-black">
    <div className="px-6 py-4 bg-gradient-to-br from-gray-200 to-gray-300">
      <Skeleton className="h-5 w-48" />
    </div>

    <div className="p-6">
      <div className="grid grid-cols-6 gap-4 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, r) => (
          <div key={r} className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((__, c) => (
              <Skeleton key={c} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);
/* =================== End Skeleton =================== */

const StatCard = ({ icon: Icon, label, value, sub, tone = "gray" }) => {
  const tones = {
    gray: { bg: "from-gray-200 to-gray-300", icon: "text-black" },
    yellow: {
      bg: "from-yellow-200 to-yellow-300",
      icon: "text-white",
      iconBg: "bg-purple-500",
    },
    red: {
      bg: "from-red-200 to-red-300",
      icon: "text-white",
      iconBg: "bg-red-500",
    },
    green: {
      bg: "from-green-200 to-green-300",
      icon: "text-white",
      iconBg: "bg-green-600",
    },
    blue: {
      bg: "from-blue-200 to-blue-300",
      icon: "text-white",
      iconBg: "bg-blue-600",
    },
  };
  const t = tones[tone] || tones.gray;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-1 border-black min-h-[150px]">
      <div className={`p-5 md:p-6 bg-gradient-to-br ${t.bg} h-full`}>
        <div className="flex items-center justify-between mb-4 min-w-0">
          <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
            {label}
          </span>
          <div
            className={`p-2.5 rounded-lg ${t.iconBg || "bg-white"} shrink-0`}
          >
            <Icon className={`w-6 h-6 md:w-7 md:h-7 ${t.icon}`} />
          </div>
        </div>

        <div className="flex items-baseline gap-2 min-w-0 mb-3">
          <span className="text-2xl md:text-3xl font-bold text-gray-900 leading-none break-words tabular-nums">
            {value}
          </span>
        </div>

        {sub && (
          <div className="text-xs md:text-sm text-black font-medium">{sub}</div>
        )}
      </div>
    </div>
  );
};

const LocationTable = ({ title, rows = [], tone = "gray", columns }) => {
  const toneHead =
    {
      gray: "from-gray-200 to-gray-300",
      yellow: "from-yellow-200 to-yellow-300",
      red: "from-red-200 to-red-300",
      green: "from-green-200 to-green-300",
      blue: "from-blue-200 to-blue-300",
    }[tone] || "from-gray-200 to-gray-300";

  return (
    <div className="bg-white rounded-xl shadow-lg border-1 border-black overflow-hidden">
      <div
        className={`px-6 py-4 bg-gradient-to-r ${toneHead} border-b-2 border-black`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-black font-bold text-base md:text-lg uppercase">
            {title}
          </h3>
          <span className="text-black text-xs md:text-sm font-semibold">
            {fmtInt(rows.length)} địa điểm
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wide">
                Khu vực
              </th>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3 text-xs font-semibold text-gray-800 uppercase tracking-wide ${
                    c.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={1 + columns.length}
                  className="px-4 py-12 text-center text-gray-500 font-medium"
                >
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr
                  key={`${r.locationId}-${idx}`}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-900">
                      {r.locationName || "-"}
                    </div>
                  </td>

                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-4 py-4 ${
                        c.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      <span className="text-sm font-semibold text-gray-900 tabular-nums">
                        {c.format ? c.format(r[c.key]) : fmtInt(r[c.key] ?? 0)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DashboardWarehouseForeign = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          filterType: filters.filterType || "MONTH",
        };

        const res = await dashboardService.dailyInventory(params, { signal });
        setData(res?.data ?? res);
      } catch (e) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setError(
            e?.response?.data?.message ||
              e?.message ||
              "Đã xảy ra lỗi khi tải dữ liệu.",
          );
        }
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const label = useMemo(() => {
    const t = FILTER_TYPES.find((x) => x.value === filters.filterType);
    return t?.label || "Tháng này";
  }, [filters]);

  const pending = data?.pending || {};
  const stock = data?.stock || {};
  const packed = data?.packed || {};

  const pendingByLocation = useMemo(
    () => (data?.pendingByLocation || []).slice(),
    [data],
  );
  const stockByLocation = useMemo(
    () => (data?.stockByLocation || []).slice(),
    [data],
  );
  const packedByLocation = useMemo(
    () => (data?.packedByLocation || []).slice(),
    [data],
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-yellow-300 via-yellow-300 to-yellow-300 border-[1px] border-black rounded-xl shadow-lg p-4 md:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Left */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1.5 h-8 md:h-9 bg-black rounded-full shrink-0 shadow-sm" />
                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl font-bold text-black leading-tight truncate">
                    Thống Kê Hiệu Suất Kho Nước Ngoài
                  </h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-sm">
                      <Calendar className="w-4 h-4 text-black" />
                      <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
                        {label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Filter buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {FILTER_TYPES.map((opt) => {
                  const active = opt.value === filters.filterType;
                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          filterType: opt.value,
                        }))
                      }
                      className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all border-2 border-yellow-600 shadow-sm ${
                        active
                          ? "bg-yellow-400 text-black"
                          : "bg-white text-black hover:bg-gray-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-red-800 mb-1">
                  Có lỗi xảy ra
                </h3>
                <p className="text-sm text-red-700 break-words">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-red-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        )}

        {/* Summary Stats - Tổng quan */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
            Tổng quan
          </h3>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard
                icon={Package}
                label="Chờ xử lý - Kiện hàng"
                value={fmtInt(pending.packages)}
                sub={`Đơn hàng: ${fmtInt(pending.orders)} • Link: ${fmtInt(
                  pending.orderLinks,
                )}`}
                tone="red"
              />
              <StatCard
                icon={Warehouse}
                label="Tồn kho - Kho hàng"
                value={fmtInt(stock.warehouses)}
                sub={`Khối lượng: ${fmtKg(stock.weight)} • Thực tế: ${fmtKg(
                  stock.netWeight,
                )}`}
                tone="green"
              />
              <StatCard
                icon={Boxes}
                label="Đã đóng gói - Kho hàng"
                value={fmtInt(packed.warehouses)}
                sub={`Đơn hàng: ${fmtInt(packed.orders)} • Đang đóng: ${fmtInt(
                  packed.packing,
                )}`}
                tone="blue"
              />
              <StatCard
                icon={Weight}
                label="Đã đóng gói - Khối lượng"
                value={fmtKg(packed.weight)}
                sub={`Khối lượng thực: ${fmtKg(packed.netWeight)}`}
                tone="gray"
              />
            </div>
          )}
        </div>

        {/* Tables - Chi tiết theo khu vực */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
            Chi tiết theo khu vực
          </h3>

          {loading ? (
            <div className="space-y-6">
              <TableCardSkeleton />
              <TableCardSkeleton />
              <TableCardSkeleton />
            </div>
          ) : !data ? (
            <div className="bg-white rounded-xl shadow-lg border-1 border-black p-12 md:p-16 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-800 text-base md:text-lg font-bold mb-2">
                Không có dữ liệu
              </p>
              <p className="text-gray-600 text-sm">
                Vui lòng thử lại với bộ lọc khác
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <LocationTable
                title="Chờ xử lý theo khu vực"
                tone="yellow"
                rows={pendingByLocation}
                columns={[
                  { key: "orders", label: "Đơn hàng", align: "right" },
                  { key: "countPackages", label: "Kiện hàng", align: "right" },
                  { key: "orderLinks", label: "Link đơn", align: "right" },
                  { key: "totalQuantity", label: "Số lượng", align: "right" },
                  {
                    key: "weight",
                    label: "Khối lượng",
                    align: "right",
                    format: fmtKg,
                  },
                  {
                    key: "netWeight",
                    label: "KL thực",
                    align: "right",
                    format: fmtKg,
                  },
                ]}
              />

              <LocationTable
                title="Tồn kho theo khu vực"
                tone="green"
                rows={stockByLocation}
                columns={[
                  { key: "warehouses", label: "Kho hàng", align: "right" },
                  { key: "orders", label: "Đơn hàng", align: "right" },
                  {
                    key: "weight",
                    label: "Khối lượng",
                    align: "right",
                    format: fmtKg,
                  },
                  {
                    key: "netWeight",
                    label: "KL thực",
                    align: "right",
                    format: fmtKg,
                  },
                ]}
              />

              <LocationTable
                title="Đã đóng gói theo khu vực"
                tone="blue"
                rows={packedByLocation}
                columns={[
                  { key: "warehouses", label: "Kho hàng", align: "right" },
                  { key: "orders", label: "Đơn hàng", align: "right" },
                  {
                    key: "weight",
                    label: "Khối lượng",
                    align: "right",
                    format: fmtKg,
                  },
                  {
                    key: "netWeight",
                    label: "KL thực",
                    align: "right",
                    format: fmtKg,
                  },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardWarehouseForeign;
