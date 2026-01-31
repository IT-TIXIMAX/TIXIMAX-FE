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
} from "lucide-react";
import expenseService from "../../Services/Manager/expenseService";
import { getApiErrorMessage } from "../../Utils/getApiErrorMessage";
import ExpenseAction from "./ExpenseAction";

/* ================= Helpers ================= */
const n0 = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const money = (v) => `${n0(v).toLocaleString("vi-VN")} ₫`;

const fmtDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("vi-VN");
};

const isUrlLike = (s) => /^https?:\/\//i.test(String(s || "").trim());

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

/* ================= Loading Skeleton ================= */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-300 rounded ${className}`} />
);

const TableRowSkeleton = () => (
  <>
    {/* Row 1: data */}
    <tr className="border-t border-gray-200">
      <td className="px-4 py-3">
        <div className="min-w-[280px] space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </td>

      <td className="px-4 py-3">
        <Skeleton className="h-6 w-20 rounded-full" />
      </td>

      <td className="px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </td>

      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </td>

      <td className="px-4 py-3">
        <Skeleton className="h-6 w-20 rounded-full" />
      </td>

      <td className="px-4 py-3">
        <Skeleton className="h-4 w-40" />
      </td>
    </tr>

    {/* Row 2: action */}
    <tr className="bg-white">
      <td className="px-4 pb-4 pt-0" colSpan={6}>
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-8 w-28 rounded-2xl" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-2xl" />
            <Skeleton className="h-8 w-20 rounded-2xl" />
          </div>
        </div>
      </td>
    </tr>
  </>
);
/* ================= End Loading Skeleton ================= */

const Badge = ({ children, tone = "gray" }) => {
  const cls =
    tone === "green"
      ? "bg-green-100 text-green-700 border-green-200"
      : tone === "red"
        ? "bg-red-100 text-red-700 border-red-200"
        : tone === "blue"
          ? "bg-blue-100 text-blue-700 border-blue-200"
          : tone === "amber"
            ? "bg-amber-100 text-amber-800 border-amber-200"
            : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      {children}
    </span>
  );
};

const statusTone = (st) => {
  switch (String(st || "").toUpperCase()) {
    case "DA_DUYET":
      return "green";
    case "TU_CHOI":
      return "red";
    case "CHO_DUYET":
      return "amber";
    default:
      return "gray";
  }
};

/* ✅ Buttons nhỏ lại */
const SoftButton = ({ className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2
    px-3.5 py-2 rounded-2xl
    border-2 border-gray-200 bg-white hover:bg-gray-50
    text-gray-900 font-semibold shadow-sm transition
    text-xs md:text-sm
    disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    {...props}
  />
);

const PrimaryButton = ({ className = "", ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2
    px-3.5 py-2 rounded-2xl
    bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-sm transition
    border-2 border-yellow-600
    text-xs md:text-sm
    disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    {...props}
  />
);

const ManagerExpense = () => {
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");
  const [qApplied, setQApplied] = useState("");

  // detail modal
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

    return items.filter((it) => {
      const hay = [
        it?.description,
        it?.note,
        it?.bankInfo,
        it?.vatInfo,
        it?.department,
        it?.paymentMethod,
        it?.status,
      ]
        .map((x) => String(x ?? "").toLowerCase())
        .join(" | ");
      return hay.includes(kw);
    });
  }, [items, qApplied]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, status]);

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
    <div className="min-h-screen p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <div className="bg-gradient-to-r from-yellow-300 via-yellow-300 to-yellow-300 border border-black rounded-2xl shadow-md p-4 md:p-5">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 md:h-9 bg-black rounded-full shrink-0 shadow-sm" />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-black leading-tight">
                Quản lý yêu cầu chi phí
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                  className={`px-3.5 py-2 rounded-2xl text-xs md:text-sm font-semibold transition-all shadow-sm border-2 ${
                    active
                      ? "bg-yellow-400 text-black border-yellow-600"
                      : "bg-white hover:bg-gray-50 text-gray-800 border-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                placeholder="Tìm theo mô tả, note, phòng ban..."
                className="w-full sm:w-80 pl-10 pr-10 py-2.5 rounded-2xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none bg-white text-sm md:text-base"
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
                  title="Xóa"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <PrimaryButton type="button" onClick={onSearch} className="px-4">
              Tìm kiếm
            </PrimaryButton>
          </div>
        </div>

        {/* Page Size Buttons */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-sm md:text-base font-semibold text-gray-700">
              Hiển thị:
            </span>
            <div className="flex flex-wrap gap-2">
              {PAGE_SIZES.map((s) => {
                const active = size === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSize(s);
                      setPage(0);
                    }}
                    className={`px-3.5 py-2 rounded-2xl text-xs md:text-sm font-semibold transition-all shadow-sm border-2 ${
                      active
                        ? "bg-yellow-400 text-black border-yellow-600"
                        : "bg-white hover:bg-gray-50 text-gray-800 border-gray-200"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Phòng ban
                </th>
                <th className="px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Tổng
                </th>
                <th className="px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Note
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: Math.min(size, 10) }).map((_, idx) => (
                  <TableRowSkeleton key={idx} />
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-600 text-base"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredItems.map((it, idx) => (
                  <React.Fragment key={it?.id ?? idx}>
                    {/* Row 1: data */}
                    <tr
                      className={`border-t border-gray-200 transition hover:bg-yellow-50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="min-w-[280px]">
                          <p className="font-semibold text-gray-900 line-clamp-1 text-base md:text-[15px]">
                            {it?.description || "—"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge tone="blue">
                          <span className="text-sm md:text-[15px]">
                            {it?.department || "—"}
                          </span>
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-sm md:text-[15px] text-gray-700 whitespace-nowrap">
                        {fmtDateTime(it?.createdAt)}
                      </td>

                      <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap text-base md:text-[15px]">
                        {money(it?.totalAmount)}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge tone={statusTone(it?.status)}>
                          <span className="text-sm md:text-[15px]">
                            {STATUS_LABEL[it?.status] || it?.status || "—"}
                          </span>
                        </Badge>
                      </td>

                      <td className="px-4 py-3">
                        {it?.note ? (
                          <p className="text-base md:text-[15px] text-gray-800 leading-6 line-clamp-2">
                            {it.note}
                          </p>
                        ) : (
                          <span className="text-base md:text-[15px] text-gray-400">
                            —
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Row 2: action */}
                    <tr className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 pb-4 pt-0" colSpan={6}>
                        <div className="flex items-center justify-between gap-4">
                          {/* Left: Xem chi tiết (nhỏ hơn) */}
                          <SoftButton
                            type="button"
                            onClick={() => openDetail(it?.id)}
                            className="px-4 py-2"
                          >
                            <span className="text-xs md:text-sm">
                              Xem chi tiết
                            </span>
                          </SoftButton>

                          {/* Right: Approve/Reject */}
                          <ExpenseAction
                            id={it?.id}
                            status={it?.status}
                            onDone={handleActionDone}
                            size="button"
                          />
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm md:text-base text-gray-600">
              Hiển thị{" "}
              <span className="font-semibold text-gray-900">{showingFrom}</span>{" "}
              - <span className="font-semibold text-gray-900">{showingTo}</span>{" "}
              / <span className="font-semibold text-gray-900">{total}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="p-2 rounded-2xl bg-white border-2 border-gray-200 hover:bg-gray-50 shadow-sm disabled:opacity-50 transition"
                title="Trang đầu"
              >
                <ChevronsLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-2 rounded-2xl bg-white border-2 border-gray-200 hover:bg-gray-50 shadow-sm disabled:opacity-50 inline-flex items-center gap-2 font-semibold transition text-xs md:text-sm"
              >
                <ChevronLeft size={18} />
                Trước
              </button>

              <div className="px-4 py-2 rounded-2xl bg-yellow-400 text-black font-bold shadow-sm border-2 border-yellow-600 text-xs md:text-sm">
                {page + 1} / {totalPages}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-2 rounded-2xl bg-white border-2 border-gray-200 hover:bg-gray-50 shadow-sm disabled:opacity-50 inline-flex items-center gap-2 font-semibold transition text-xs md:text-sm"
              >
                Sau
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-2xl bg-white border-2 border-gray-200 hover:bg-gray-50 shadow-sm disabled:opacity-50 transition"
                title="Trang cuối"
              >
                <ChevronsRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Footer Navigation */}
      {!loading && total > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-md p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm md:text-base text-gray-600">
              Trang <span className="font-bold text-gray-900">{page + 1}</span>{" "}
              / <span className="font-bold text-gray-900">{totalPages}</span>
              {" • "}
              Hiển thị{" "}
              <span className="font-semibold text-gray-900">{showingFrom}</span>
              -<span className="font-semibold text-gray-900">{showingTo}</span>{" "}
              / <span className="font-semibold text-gray-900">{total}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-2xl bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-yellow-500 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 font-semibold transition text-xs md:text-sm"
              >
                <ChevronLeft size={18} />
                Trang trước
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 rounded-2xl bg-yellow-400 border-2 border-yellow-600 hover:bg-yellow-500 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 font-semibold transition text-xs md:text-sm text-black"
              >
                Trang sau
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Detail Modal */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-yellow-300 to-yellow-400 border-b-2 border-black flex items-start justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3">
                <div className="p-2 bg-black/10 rounded-lg">
                  <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-black truncate">
                    Chi tiết yêu cầu
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDetail}
                className="p-2 rounded-2xl bg-black/10 hover:bg-black/20 border-2 border-black/25 transition"
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-50 to-white max-h-[calc(100vh-200px)] overflow-y-auto">
              {detailLoading ? (
                <div className="py-12 text-center text-gray-600 text-base">
                  Đang tải chi tiết...
                </div>
              ) : !detail ? (
                <div className="py-12 text-center text-gray-600 text-base">
                  Không có dữ liệu
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="blue">{detail.department || "—"}</Badge>
                    <Badge tone={statusTone(detail.status)}>
                      {STATUS_LABEL[detail.status] || detail.status || "—"}
                    </Badge>
                    <Badge tone="gray">{detail.paymentMethod || "—"}</Badge>
                    <Badge tone="gray">{detail.vatStatus || "—"}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-gray-200 p-4 bg-white shadow-sm">
                      <p className="text-sm text-gray-500 font-medium">Mô tả</p>
                      <p className="font-semibold text-gray-900 mt-1 text-base">
                        {detail.description || "—"}
                      </p>

                      {detail.note && (
                        <>
                          <p className="text-sm text-gray-500 mt-3 font-medium">
                            Ghi chú
                          </p>
                          <p className="text-gray-800 mt-1 text-base leading-6">
                            {detail.note}
                          </p>
                        </>
                      )}

                      {detail.cancelReason && (
                        <>
                          <p className="text-sm text-gray-500 mt-3 font-medium">
                            Lý do hủy
                          </p>
                          <p className="text-red-700 font-semibold mt-1 text-base">
                            {detail.cancelReason}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="rounded-2xl border border-gray-200 p-4 bg-white shadow-sm">
                      <p className="text-sm text-gray-500 font-medium">
                        Chi phí
                      </p>
                      <div className="mt-2 space-y-1 text-base">
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">
                            Số lượng
                          </span>
                          <span className="font-semibold text-base">
                            {n0(detail.quantity)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Đơn giá</span>
                          <span className="font-semibold text-base">
                            {money(detail.unitPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Tổng</span>
                          <span className="font-bold text-yellow-700 text-base">
                            {money(detail.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {detail.bankInfo && (
                        <>
                          <p className="text-sm text-gray-500 mt-3 font-medium">
                            Bank info
                          </p>
                          <p className="text-gray-800 mt-1 text-base leading-6">
                            {detail.bankInfo}
                          </p>
                        </>
                      )}

                      {detail.vatInfo && (
                        <>
                          <p className="text-sm text-gray-500 mt-3 font-medium">
                            VAT info
                          </p>
                          <p className="text-gray-800 mt-1 text-base leading-6">
                            {detail.vatInfo}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Images */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Invoice image", url: detail.invoiceImage },
                      { label: "Transfer image", url: detail.transferImage },
                    ].map((img) => (
                      <div
                        key={img.label}
                        className="rounded-2xl border border-gray-200 p-4 bg-white shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-gray-600 flex items-center gap-2 font-semibold">
                            <FileImage size={16} />
                            {img.label}
                          </p>

                          {img.url && isUrlLike(img.url) && (
                            <a
                              href={img.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-semibold text-yellow-700 hover:text-yellow-800 transition"
                            >
                              Mở ảnh <ExternalLink size={14} />
                            </a>
                          )}
                        </div>

                        <div className="mt-3">
                          {img.url && isUrlLike(img.url) ? (
                            <a href={img.url} target="_blank" rel="noreferrer">
                              <img
                                src={img.url}
                                alt={img.label}
                                className="w-full max-h-72 object-contain rounded-2xl border border-gray-200 bg-gray-50"
                              />
                            </a>
                          ) : (
                            <div className="h-40 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-500 text-sm">
                              Không có
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action trong Detail */}
                  <div className="flex items-center justify-end pt-2 border-t border-gray-200">
                    <ExpenseAction
                      id={detail.id}
                      status={detail.status}
                      onDone={handleActionDone}
                      size="button"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerExpense;
