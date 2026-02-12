import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  RefreshCw,
  Search,
  X,
  Users,
  ShoppingBag,
  Weight,
  UserCheck,
  Sparkles,
} from "lucide-react";
import dashboardService from "../../Services/Dashboard/dashboardService";

/* ===================== Helpers ===================== */
const formatDateTime = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatWeight = (w) => {
  const n = Number(w);
  if (!Number.isFinite(n)) return "0 kg";
  return `${n.toLocaleString("vi-VN", { maximumFractionDigits: 3 })} kg`;
};

const SERVICE_TYPE_MAP = {
  MUA_HO: { label: "Mua hộ", bg: "bg-violet-100", text: "text-violet-700" },
  KY_GUI: { label: "Ký gửi", bg: "bg-sky-100", text: "text-sky-700" },
  DAU_GIA: { label: "Đấu giá", bg: "bg-amber-100", text: "text-amber-700" },
  CHUYEN_TIEN: {
    label: "Chuyển tiền",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  default: { label: "Khác", bg: "bg-gray-100", text: "text-gray-600" },
};

const PAGE_SIZES = [50, 100, 200, 500];

/* ===================== Skeletons ===================== */
const StatSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-7 w-16 bg-gray-200 rounded" />
      </div>
      <div className="h-11 w-11 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="p-4 animate-pulse space-y-2">
    <div className="h-10 bg-gray-100 rounded-lg" />
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="flex gap-3 items-center py-3 border-b border-gray-100"
      >
        <div className="h-9 w-9 bg-gray-200 rounded-full shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
      </div>
    ))}
  </div>
);

/* ===================== Stat Card ===================== */
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: { bg: "bg-blue-100", icon: "text-blue-600", val: "text-blue-600" },
    violet: {
      bg: "bg-violet-100",
      icon: "text-violet-600",
      val: "text-violet-600",
    },
    emerald: {
      bg: "bg-emerald-100",
      icon: "text-emerald-600",
      val: "text-emerald-600",
    },
    amber: {
      bg: "bg-amber-100",
      icon: "text-amber-600",
      val: "text-amber-600",
    },
  }[color] || {
    bg: "bg-gray-100",
    icon: "text-gray-600",
    val: "text-gray-800",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${colors.val}`}>{value}</p>
        </div>
        <div className={`p-3 ${colors.bg} rounded-lg`}>
          <Icon size={22} className={colors.icon} />
        </div>
      </div>
    </div>
  );
};

/* ===================== Main ===================== */
const FirstOrderAnalysis = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = useCallback(async (p = 0, size = 100) => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.firstTimeCustomers(p, size);
      const list = res?.content ?? (Array.isArray(res) ? res : []);
      setData(list);
      setTotalElements(res?.totalElements ?? list.length);
      setTotalPages(res?.totalPages ?? 1);
      setPage(p);
    } catch (err) {
      setError(err?.message || "Không thể tải dữ liệu");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(0, pageSize);
  }, [pageSize]);

  /* ---- client-side search filter ---- */
  const filtered = useMemo(() => {
    if (!appliedSearch) return data;
    const q = appliedSearch.toLowerCase();
    return data.filter(
      (r) =>
        r.customerName?.toLowerCase().includes(q) ||
        r.staffName?.toLowerCase().includes(q) ||
        String(r.customerId).includes(q),
    );
  }, [data, appliedSearch]);

  /* ---- stats from current page data ---- */
  const stats = useMemo(() => {
    const totalWeight = data.reduce(
      (s, r) => s + (Number(r.totalWeightPurchasedKg) || 0),
      0,
    );
    const staffSet = new Set(data.map((r) => r.staffId).filter(Boolean));
    const serviceBreakdown = data.reduce((acc, r) => {
      acc[r.serviceType] = (acc[r.serviceType] || 0) + 1;
      return acc;
    }, {});
    return { totalWeight, staffCount: staffSet.size, serviceBreakdown };
  }, [data]);

  const handleSearch = () => setAppliedSearch(search.trim());
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const showFrom = filtered.length ? 1 : 0;
  const showTo = filtered.length;

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Khách Hàng Mua Lần Đầu
                </h1>
              </div>
            </div>
            <button
              onClick={() => fetchData(page, pageSize)}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors flex items-center gap-2"
              type="button"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Tải lại
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {loading ? (
            [1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Tổng KH mới"
                value={totalElements.toLocaleString("vi-VN")}
                icon={Users}
                color="blue"
              />
              <StatCard
                label="Trang hiện tại"
                value={data.length.toLocaleString("vi-VN")}
                icon={ShoppingBag}
                color="violet"
              />
              <StatCard
                label="Tổng cân (trang này)"
                value={`${stats.totalWeight.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} kg`}
                icon={Weight}
                color="emerald"
              />
              <StatCard
                label="Nhân viên phụ trách"
                value={stats.staffCount}
                icon={UserCheck}
                color="amber"
              />
            </>
          )}
        </div>

        {/* Search + Page Size */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm tên KH, nhân viên, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-9 pr-9 py-2.5 border-2 border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-all"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setAppliedSearch("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    type="button"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                type="button"
              >
                <Search size={16} />
                Tìm
              </button>
            </div>

            {/* Page size */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                Hiển thị:
              </span>
              <div className="flex gap-1.5">
                {PAGE_SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setPageSize(s);
                      setPage(0);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      pageSize === s
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    type="button"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-sm text-red-700">
            {error}
            <button
              onClick={() => fetchData(page, pageSize)}
              className="ml-3 underline font-medium"
              type="button"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500 font-medium">Không có dữ liệu</p>
              <p className="text-gray-400 text-sm mt-1">
                {appliedSearch
                  ? "Không khớp từ khóa tìm kiếm"
                  : "Chưa có khách hàng mua lần đầu"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                      #
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                      Ngày mua đầu
                    </th>
                    <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                      Số đơn
                    </th>
                    <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                      Tổng cân
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                      Nhân viên
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                      Dịch vụ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, idx) => {
                    const svc =
                      SERVICE_TYPE_MAP[row.serviceType] ??
                      SERVICE_TYPE_MAP.default;
                    return (
                      <tr
                        key={row.customerId ?? idx}
                        className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        {/* # */}
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-gray-400 font-medium">
                            {idx + 1}
                          </span>
                        </td>

                        {/* Khách hàng */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
                              <span className="text-white text-sm font-bold">
                                {row.customerName?.charAt(0)?.toUpperCase() ||
                                  "?"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {row.customerName || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Ngày mua đầu */}
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-gray-700">
                            {formatDateTime(row.firstPurchaseDate)}
                          </span>
                        </td>

                        {/* Số đơn */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
                            {row.orderCount ?? 1}
                          </span>
                        </td>

                        {/* Tổng cân */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-sm text-gray-700 whitespace-nowrap">
                            {formatWeight(row.totalWeightPurchasedKg)}
                          </span>
                        </td>

                        {/* Nhân viên */}
                        <td className="px-4 py-3.5">
                          <span className="text-sm text-gray-700 whitespace-nowrap">
                            {row.staffName || "—"}
                          </span>
                        </td>

                        {/* Dịch vụ */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${svc.bg} ${svc.text}`}
                          >
                            {svc.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                Hiển thị{" "}
                <span className="font-semibold text-gray-800">
                  {showFrom}–{showTo}
                </span>
                {appliedSearch && ` (lọc từ ${data.length})`} · Tổng{" "}
                <span className="font-semibold text-gray-800">
                  {totalElements.toLocaleString("vi-VN")}
                </span>{" "}
                khách
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchData(0, pageSize)}
                  disabled={page === 0 || loading}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  type="button"
                >
                  Đầu
                </button>
                <button
                  onClick={() => fetchData(page - 1, pageSize)}
                  disabled={page === 0 || loading}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  type="button"
                >
                  Trước
                </button>
                <span className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => fetchData(page + 1, pageSize)}
                  disabled={page >= totalPages - 1 || loading}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  type="button"
                >
                  Sau
                </button>
                <button
                  onClick={() => fetchData(totalPages - 1, pageSize)}
                  disabled={page >= totalPages - 1 || loading}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  type="button"
                >
                  Cuối
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirstOrderAnalysis;
