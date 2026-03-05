import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Eye,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  FileImage,
  X,
  ExternalLink,
  DollarSign,
  Loader2,
  Building2,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import expenseService from "../../Services/Manager/expenseService";
import { getApiErrorMessage } from "../../Utils/getApiErrorMessage";
import ExpenseAction from "./ExpenseAction";

// ─── Helpers ────────────────────────────────────────────────────────────────
const n0 = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const money = (v) => `${n0(v).toLocaleString("vi-VN")} ₫`;
const fmtDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? String(iso)
    : d.toLocaleDateString("vi-VN");
};
const isUrlLike = (s) => /^https?:\/\//i.test(String(s || "").trim());

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "CHO_DUYET", label: "Chờ duyệt" },
  { value: "DA_DUYET", label: "Đã duyệt" },
  { value: "TU_CHOI", label: "Từ chối" },
];
const STATUS_LABEL = {
  ALL: "Tất cả",
  CHO_DUYET: "Chờ duyệt",
  DA_DUYET: "Đã duyệt",
  TU_CHOI: "Từ chối",
};
const PAGE_SIZES = [20, 50, 100];

// ─── Sub-components ──────────────────────────────────────────────────────────
const Badge = ({ children, tone = "gray" }) => {
  const cls =
    {
      green: "bg-emerald-100 text-emerald-700 border-emerald-200",
      red: "bg-red-100 text-red-700 border-red-200",
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      amber: "bg-amber-100 text-amber-800 border-amber-200",
      gray: "bg-slate-100 text-slate-700 border-slate-200",
    }[tone] ?? "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${cls}`}
    >
      {children}
    </span>
  );
};

const statusTone = (st) =>
  ({
    DA_DUYET: "green",
    TU_CHOI: "red",
    CHO_DUYET: "amber",
  })[String(st || "").toUpperCase()] ?? "gray";

// Skeleton
const TableRowSkeleton = () => (
  <React.Fragment>
    <tr className="border-t border-gray-100">
      {[280, 80, 120, 96, 80, 160].map((w, i) => (
        <td key={i} className="px-4 pt-3 pb-1">
          <div
            className={`animate-pulse bg-gray-200 h-4 rounded`}
            style={{ width: w }}
          />
        </td>
      ))}
    </tr>
    <tr className="border-b border-gray-100">
      <td className="px-4 pt-1 pb-3" colSpan={6}>
        <div className="flex items-center justify-between gap-4">
          <div className="animate-pulse bg-gray-200 h-7 rounded-lg w-28" />
          <div className="flex gap-2">
            <div className="animate-pulse bg-gray-200 h-7 rounded-lg w-20" />
            <div className="animate-pulse bg-gray-200 h-7 rounded-lg w-20" />
          </div>
        </div>
      </td>
    </tr>
  </React.Fragment>
);

// Stats card skeleton
const StatsCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden animate-pulse">
    <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
      <div className="h-8 bg-gray-300 rounded w-16 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-28" />
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const ManagerExpense = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");
  const [qApplied, setQApplied] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / size)),
    [total, size],
  );
  const showingFrom = total ? page * size + 1 : 0;
  const showingTo = Math.min((page + 1) * size, total);

  const filteredItems = useMemo(() => {
    const kw = String(qApplied || "")
      .trim()
      .toLowerCase();
    if (!kw) return items;
    return items.filter((it) =>
      [
        it?.description,
        it?.note,
        it?.bankInfo,
        it?.vatInfo,
        it?.department,
        it?.paymentMethod,
        it?.status,
      ]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" | ")
        .includes(kw),
    );
  }, [items, qApplied]);

  // Stats derived from filteredItems
  const stats = useMemo(
    () => ({
      total: filteredItems.length,
      pending: filteredItems.filter((i) => i?.status === "CHO_DUYET").length,
      approved: filteredItems.filter((i) => i?.status === "DA_DUYET").length,
      totalAmt: filteredItems.reduce((s, i) => s + n0(i?.totalAmount), 0),
    }),
    [filteredItems],
  );

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await expenseService.getList(page, size, status);
      const content = Array.isArray(res?.content)
        ? res.content
        : Array.isArray(res)
          ? res
          : [];
      setItems(content);
      setTotal(n0(res?.totalElements ?? content.length));
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Không tải được danh sách"));
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, size, status]); // eslint-disable-line

  const openDetail = async (id) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      const d = await expenseService.getDetail(id);
      setDetail(d);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Không tải được chi tiết"));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    if (detailLoading) return;
    setDetailOpen(false);
    setDetail(null);
  };

  const onSearch = () => {
    setQApplied(q.trim());
    setPage(0);
  };

  const handleActionDone = async () => {
    await fetchList();
    if (detail?.id) await openDetail(detail.id);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-lg border border-blue-500 p-6 md:p-8 mb-6 md:mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Quản Lý Yêu Cầu Chi Phí
            </h1>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-700" />
                  <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                    Tổng yêu cầu
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-700">
                  {stats.total}
                </div>
                <div className="text-xs text-gray-600 font-medium mt-1">
                  {stats.total !== total
                    ? `Lọc từ ${total} yêu cầu`
                    : "Tất cả yêu cầu"}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-amber-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-amber-700" />
                  <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                    Chờ duyệt
                  </div>
                </div>
                <div className="text-3xl font-bold text-amber-700">
                  {stats.pending}
                </div>
                <div className="text-xs text-gray-600 font-medium mt-1">
                  Cần xử lý
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-emerald-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                    Đã duyệt
                  </div>
                </div>
                <div className="text-3xl font-bold text-emerald-700">
                  {stats.approved}
                </div>
                <div className="text-xs text-gray-600 font-medium mt-1">
                  Hoàn thành
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-orange-700" />
                  <div className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                    Tổng tiền
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-700">
                  {money(stats.totalAmt)}
                </div>
                <div className="text-xs text-gray-600 font-medium mt-1">
                  Toàn bộ yêu cầu
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Filter + Search Card ── */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-6">
        {/* Section header */}
        <div className="px-5 md:px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600 flex-shrink-0">
            <Search className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-base font-bold text-blue-900">
            Bộ lọc & Tìm kiếm
          </h2>
        </div>

        <div className="p-5 md:p-6 space-y-4">
          {/* Status filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide shrink-0">
              Trạng thái:
            </span>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const active = status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setStatus(opt.value);
                      setPage(0);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                      active
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search + Page size */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4 border-t border-gray-100">
            <div className="relative max-w-md w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                placeholder="Tìm theo mô tả, note, phòng ban..."
                className="w-full pl-9 pr-10 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-medium"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    if (qApplied) {
                      setQApplied("");
                      setPage(0);
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide shrink-0">
                  Hiển thị:
                </span>
                <div className="flex gap-1.5">
                  {PAGE_SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSize(s);
                        setPage(0);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        size === s
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={onSearch}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <Search size={15} />
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* Table section header */}
        <div className="px-5 md:px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-bold text-blue-900">
              Danh sách yêu cầu
            </h2>
          </div>
          {!loading && (
            <span className="text-sm font-medium text-blue-700">
              <span className="font-bold">{filteredItems.length}</span>
              <span className="text-blue-500"> / {total}</span>
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
              <tr className="text-blue-900 font-semibold text-sm">
                <th className="p-3 md:p-4 text-left whitespace-nowrap">
                  Mô tả
                </th>
                <th className="p-3 md:p-4 text-left whitespace-nowrap">
                  Phòng ban
                </th>
                <th className="p-3 md:p-4 text-left whitespace-nowrap">
                  Ngày tạo
                </th>
                <th className="p-3 md:p-4 text-right whitespace-nowrap">
                  Tổng tiền
                </th>
                <th className="p-3 md:p-4 text-left whitespace-nowrap">
                  Trạng thái
                </th>
                <th className="p-3 md:p-4 text-left whitespace-nowrap">
                  Ghi chú
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: Math.min(size, 8) }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 md:p-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <DollarSign className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-base font-semibold text-gray-800">
                        Không có dữ liệu
                      </p>
                      <p className="text-sm text-gray-600 font-medium">
                        Không tìm thấy yêu cầu phù hợp
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((it, idx) => (
                  <React.Fragment key={it?.id ?? idx}>
                    {/* ── Dòng trên: thông tin chính ── */}
                    <tr className="hover:bg-blue-50/40 transition-colors border-t border-gray-100">
                      <td className="px-4 pt-3 pb-1 font-semibold text-gray-900 text-sm max-w-xs">
                        <p className="line-clamp-1">{it?.description || "—"}</p>
                      </td>
                      <td className="px-4 pt-3 pb-1 whitespace-nowrap">
                        <Badge tone="blue">{it?.department || "—"}</Badge>
                      </td>
                      <td className="px-4 pt-3 pb-1 text-gray-700 text-sm whitespace-nowrap">
                        {fmtDateTime(it?.createdAt)}
                      </td>
                      <td className="px-4 pt-3 pb-1 text-right font-bold text-gray-900 text-sm whitespace-nowrap">
                        {money(it?.totalAmount)}
                      </td>
                      <td className="px-4 pt-3 pb-1 whitespace-nowrap">
                        <Badge tone={statusTone(it?.status)}>
                          {STATUS_LABEL[it?.status] || it?.status || "—"}
                        </Badge>
                      </td>
                      <td className="px-4 pt-3 pb-1 text-gray-700 text-sm max-w-xs">
                        {it?.note ? (
                          <p className="line-clamp-1">{it.note}</p>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>

                    {/* ── Dòng dưới: actions ── */}
                    <tr className="hover:bg-blue-50/40 transition-colors border-b border-gray-100">
                      <td className="px-4 pt-1 pb-3" colSpan={6}>
                        <div className="flex items-center justify-end gap-4">
                          <ExpenseAction
                            id={it?.id}
                            status={it?.status}
                            onDone={handleActionDone}
                            size="button"
                          />
                          <button
                            type="button"
                            onClick={() => openDetail(it?.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Xem chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>

            {/* Footer tổng */}
            {!loading && filteredItems.length > 0 && (
              <tfoot className="bg-gradient-to-r from-blue-100 to-blue-50 border-t-2 border-blue-200">
                <tr className="font-bold text-blue-900">
                  <td
                    colSpan={3}
                    className="p-3 md:p-4 text-left text-sm uppercase tracking-wide"
                  >
                    Tổng cộng ({filteredItems.length} yêu cầu)
                  </td>
                  <td className="p-3 md:p-4 text-right text-sm">
                    {money(stats.totalAmt)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 md:px-6 py-3 border-t-2 border-blue-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm font-medium text-blue-700">
              Hiển thị{" "}
              <span className="font-bold text-blue-900">{showingFrom}</span>–
              <span className="font-bold text-blue-900">{showingTo}</span>
              {" / "}
              <span className="font-bold text-blue-900">{total}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="p-2 rounded-lg bg-white border-2 border-blue-200 hover:bg-blue-50 shadow-sm disabled:opacity-40 transition"
                title="Trang đầu"
              >
                <ChevronsLeft size={16} className="text-blue-700" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white border-2 border-blue-200 hover:bg-blue-50 shadow-sm disabled:opacity-40 font-semibold text-sm text-blue-700 transition"
              >
                <ChevronLeft size={16} /> Trước
              </button>
              <div className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-md text-sm">
                {page + 1} / {totalPages}
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white border-2 border-blue-200 hover:bg-blue-50 shadow-sm disabled:opacity-40 font-semibold text-sm text-blue-700 transition"
              >
                Sau <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg bg-white border-2 border-blue-200 hover:bg-blue-50 shadow-sm disabled:opacity-40 transition"
                title="Trang cuối"
              >
                <ChevronsRight size={16} className="text-blue-700" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Chi tiết yêu cầu chi phí
                  </h3>
                  <p className="text-blue-100 text-sm font-medium mt-0.5">
                    {detail?.department
                      ? `Phòng ban: ${detail.department}`
                      : "Thông tin đầy đủ về yêu cầu"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDetail}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="text-gray-600 font-medium text-sm">
                    Đang tải chi tiết...
                  </p>
                </div>
              ) : !detail ? (
                <div className="text-center py-16">
                  <div className="p-4 bg-gray-100 rounded-full inline-flex mb-3">
                    <DollarSign className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Không có dữ liệu</p>
                </div>
              ) : (
                <>
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="blue">{detail.department || "—"}</Badge>
                    <Badge tone={statusTone(detail.status)}>
                      {STATUS_LABEL[detail.status] || detail.status || "—"}
                    </Badge>
                    {detail.paymentMethod && (
                      <Badge tone="gray">{detail.paymentMethod}</Badge>
                    )}
                    {detail.vatStatus && (
                      <Badge tone="gray">{detail.vatStatus}</Badge>
                    )}
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mô tả + ghi chú */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                      <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                        <h4 className="text-sm font-bold text-blue-900">
                          Mô tả & Ghi chú
                        </h4>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            Mô tả
                          </p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {detail.description || "—"}
                          </p>
                        </div>
                        {detail.note && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Ghi chú
                            </p>
                            <p className="text-gray-800 text-sm leading-6">
                              {detail.note}
                            </p>
                          </div>
                        )}
                        {detail.cancelReason && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Lý do từ chối
                            </p>
                            <p className="text-red-700 font-semibold text-sm">
                              {detail.cancelReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chi phí */}
                    <div className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden">
                      <div className="px-5 py-3 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                        <h4 className="text-sm font-bold text-orange-900">
                          Chi phí
                        </h4>
                      </div>
                      <div className="p-4 space-y-2">
                        {[
                          { label: "Số lượng", value: n0(detail.quantity) },
                          { label: "Đơn giá", value: money(detail.unitPrice) },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="text-gray-600 font-medium">
                              {label}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {value}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center text-sm pt-2 border-t border-orange-100">
                          <span className="font-bold text-gray-800">Tổng</span>
                          <span className="font-bold text-orange-700 text-base">
                            {money(detail.totalAmount)}
                          </span>
                        </div>
                        {detail.bankInfo && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Ngân hàng
                            </p>
                            <p className="text-gray-800 text-sm">
                              {detail.bankInfo}
                            </p>
                          </div>
                        )}
                        {detail.vatInfo && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              VAT
                            </p>
                            <p className="text-gray-800 text-sm">
                              {detail.vatInfo}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Ảnh hóa đơn", url: detail.invoiceImage },
                      { label: "Ảnh chuyển khoản", url: detail.transferImage },
                    ].map((img) => (
                      <div
                        key={img.label}
                        className="bg-white rounded-xl shadow-md border border-purple-100 overflow-hidden"
                      >
                        <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileImage size={15} className="text-purple-700" />
                            <h4 className="text-sm font-bold text-purple-900">
                              {img.label}
                            </h4>
                          </div>
                          {img.url && isUrlLike(img.url) && (
                            <a
                              href={img.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900 transition"
                            >
                              Mở ảnh <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        <div className="p-4">
                          {img.url && isUrlLike(img.url) ? (
                            <a href={img.url} target="_blank" rel="noreferrer">
                              <img
                                src={img.url}
                                alt={img.label}
                                className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
                              />
                            </a>
                          ) : (
                            <div className="h-36 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
                              Không có ảnh
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {detail && !detailLoading && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-blue-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <button
                  onClick={closeDetail}
                  className="px-5 py-2.5 rounded-lg border-2 border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-colors"
                >
                  Đóng
                </button>
                <ExpenseAction
                  id={detail.id}
                  status={detail.status}
                  onDone={handleActionDone}
                  size="button"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerExpense;
