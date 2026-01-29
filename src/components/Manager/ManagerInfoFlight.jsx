// src/Pages/Manager/Flight/ManagerInfoFlight.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Plane,
  Search,
  ArrowUpDown,
  BadgeCheck,
  BadgeX,
  Eye,
  Plus,
  X,
} from "lucide-react";
import managerInforFlightService from "../../Services/Manager/managerInforFlightService";
import DetailInfoFlight from "./DetailInfoFlight";
import CreateInforFlight from "../LeadSale/CreateInforFlight";

const fmtDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("vi-VN", { hour12: false });
};

const money = (n) => {
  const v = Number(n || 0);
  return Number.isFinite(v) ? v.toLocaleString("en-US") : "0";
};

const isUrlLike = (s) => /^https?:\/\//i.test(String(s || "").trim());

const ManagerInfoFlight = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  // UI state
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // create modal
  const [createOpen, setCreateOpen] = useState(false);

  // detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detail, setDetail] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await managerInforFlightService.getAll();
      if (!Array.isArray(data)) {
        setRows([]);
        toast.error("Dữ liệu trả về không đúng định dạng (không phải array).");
        return;
      }
      setRows(data);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Lỗi tải danh sách flight";
      setError(msg);
      toast.error(msg);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (flightShipmentId) => {
    if (!flightShipmentId && flightShipmentId !== 0) return;
    setDetailOpen(true);
    setDetail(null);
    setDetailError("");
    try {
      setDetailLoading(true);
      const data = await managerInforFlightService.getDetail(flightShipmentId);
      setDetail(data);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Lỗi tải chi tiết flight";
      setDetailError(msg);
      toast.error(msg);
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetail(null);
    setDetailError("");
  };

  const handleDelete = async (flightShipmentId) => {
    await managerInforFlightService.delete(flightShipmentId);
    await fetchData();
  };

  const handleCreateSuccess = () => {
    setCreateOpen(false);
    fetchData();
  };

  const handleCreateCancel = () => {
    setCreateOpen(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter + sort (client-side)
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    let list = rows.filter((it) => {
      if (query) {
        const hay = [
          it.flightCode,
          it.staffName,
          it.status,
          String(it.flightShipmentId ?? ""),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });

    const dir = sortDir === "asc" ? 1 : -1;
    const getVal = (x) => {
      switch (sortKey) {
        case "arrivalDate":
          return new Date(x.arrivalDate || 0).getTime() || 0;
        case "createdAt":
          return new Date(x.createdAt || 0).getTime() || 0;
        case "totalCost":
          return Number(x.totalCost || 0);
        case "grossProfit":
          return Number(x.grossProfit || 0);
        case "flightCode":
          return String(x.flightCode || "").toLowerCase();
        default:
          return new Date(x.createdAt || 0).getTime() || 0;
      }
    };

    list.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (typeof va === "string" || typeof vb === "string") {
        return String(va).localeCompare(String(vb)) * dir;
      }
      return (va - vb) * dir;
    });

    return list;
  }, [rows, q, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("desc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-yellow-300 via-yellow-300 to-yellow-300 border-[1px] border-black rounded-xl shadow-lg p-4 md:p-5">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 md:h-9 bg-black rounded-full shrink-0 shadow-sm" />
              <div className="w-11 h-11 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0">
                <Plane className="w-6 h-6 text-black" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg md:text-xl font-bold text-black leading-tight">
                  Quản Lý Thông Tin Chuyến Bay
                </h1>
              </div>
              {/* ✅ Button Tạo mới */}
              {/* <button
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Tạo Thông Tin</span>
                <span className="sm:hidden">Tạo</span>
              </button> */}
            </div>
          </div>
        </div>

        {/* Search card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 md:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm mã chuyến bay, nhân viên, trạng thái..."
              className="w-full h-11 pl-10 pr-3 rounded-lg border border-slate-300 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Error */}
        {error ? (
          <div className="rounded-xl bg-red-50 border-2 border-red-300 px-4 py-4 text-red-700 font-medium">
            {error}
          </div>
        ) : null}

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Top bar */}
          <div className="px-4 md:px-6 py-4 bg-slate-50 border-b border-slate-200">
            {loading ? (
              <div className="h-4 w-56 bg-slate-200 rounded animate-pulse" />
            ) : (
              <div className="text-sm font-medium text-slate-700">
                Hiển thị{" "}
                <span className="font-bold text-blue-600">
                  {filtered.length}
                </span>{" "}
                bản ghi
                {filtered.length !== rows.length && (
                  <span className="text-slate-500">
                    {" "}
                    (Lọc từ {rows.length} tổng)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <Th onClick={() => toggleSort("flightCode")}>
                    <div className="flex items-center gap-2">
                      Mã chuyến bay
                      <SortIcon active={sortKey === "flightCode"} />
                    </div>
                  </Th>

                  <Th onClick={() => toggleSort("arrivalDate")}>
                    <div className="flex items-center gap-2">
                      Ngày đến
                      <SortIcon active={sortKey === "arrivalDate"} />
                    </div>
                  </Th>
                  <Th onClick={() => toggleSort("createdAt")}>
                    <div className="flex items-center gap-2">
                      Ngày tạo
                      <SortIcon active={sortKey === "createdAt"} />
                    </div>
                  </Th>
                  <Th>Nhân viên</Th>
                  <Th>SL kho</Th>
                  <Th onClick={() => toggleSort("totalCost")}>
                    <div className="flex items-center gap-2">
                      Tổng chi phí
                      <SortIcon active={sortKey === "totalCost"} />
                    </div>
                  </Th>
                  <Th onClick={() => toggleSort("grossProfit")}>
                    <div className="flex items-center gap-2">
                      Lợi nhuận
                      <SortIcon active={sortKey === "grossProfit"} />
                    </div>
                  </Th>
                  <Th>Thanh toán</Th>
                  <Th>Tệp đính kèm</Th>
                  <Th>Thao tác</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <FlightRowSkeleton key={i} />
                    ))}
                  </>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16">
                      <div className="flex flex-col items-center gap-3">
                        <Plane className="w-16 h-16 text-slate-300" />
                        <p className="text-slate-500 font-medium text-lg">
                          Không có dữ liệu chuyến bay
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((it) => (
                    <tr
                      key={it.flightShipmentId}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-blue-700">
                        {it.flightCode || "-"}
                      </td>

                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {fmtDateTime(it.arrivalDate)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {fmtDateTime(it.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {it.staffName || "-"}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-700">
                        {Number(it.numberOfWarehouses || 0).toLocaleString(
                          "vi-VN",
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">
                        {money(it.totalCost)}
                      </td>
                      <td className="px-4 py-3">
                        <ProfitBadge value={it.grossProfit} />
                      </td>
                      <td className="px-4 py-3">
                        <PaidBadges
                          airFreightPaid={it.airFreightPaid}
                          customsPaid={it.customsPaid}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <FilesCell it={it} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openDetail(it.flightShipmentId)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="relative w-full max-w-7xl my-8">
            {/* Close button */}
            <button
              onClick={handleCreateCancel}
              className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal content */}
            <div className="bg-gray-50 rounded-2xl shadow-2xl">
              <CreateInforFlight
                onSuccess={handleCreateSuccess}
                onCancel={handleCreateCancel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DetailInfoFlight
        open={detailOpen}
        onClose={closeDetail}
        loading={detailLoading}
        error={detailError}
        data={detail}
        onDelete={handleDelete}
      />
    </div>
  );
};

const Th = ({ children, onClick, className = "" }) => (
  <th
    onClick={onClick}
    className={`px-4 py-3 text-left font-bold text-sm uppercase tracking-wider ${
      onClick ? "cursor-pointer hover:bg-blue-700 transition-colors" : ""
    } ${className}`}
  >
    {children}
  </th>
);

const SortIcon = ({ active }) => (
  <ArrowUpDown
    className={`w-4 h-4 ${active ? "text-yellow-300" : "text-blue-200"}`}
  />
);

const ProfitBadge = ({ value }) => {
  const v = Number(value || 0);
  const isNeg = v < 0;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
        isNeg
          ? "bg-red-100 text-red-700 border border-red-300"
          : "bg-green-100 text-green-700 border border-green-300"
      }`}
    >
      {isNeg ? "-" : "+"} {Math.abs(v).toLocaleString("en-US")}
    </span>
  );
};

const PaidBadges = ({ airFreightPaid, customsPaid }) => {
  return (
    <div className="flex flex-col gap-1.5 min-w-[140px]">
      <div className="flex items-center gap-1.5 text-xs">
        {airFreightPaid ? (
          <BadgeCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
        ) : (
          <BadgeX className="w-4 h-4 text-red-600 flex-shrink-0" />
        )}
        <span
          className={
            airFreightPaid ? "text-green-700 font-medium" : "text-red-700"
          }
        >
          VC: {airFreightPaid ? "Đã TT" : "Chưa"}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        {customsPaid ? (
          <BadgeCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
        ) : (
          <BadgeX className="w-4 h-4 text-red-600 flex-shrink-0" />
        )}
        <span
          className={
            customsPaid ? "text-green-700 font-medium" : "text-red-700"
          }
        >
          HQ: {customsPaid ? "Đã TT" : "Chưa"}
        </span>
      </div>
    </div>
  );
};

const FilesCell = ({ it }) => {
  const files = [
    { label: "A", value: it.awbFilePath },
    { label: "I", value: it.invoiceFilePath },
    { label: "E", value: it.exportLicensePath },
    { label: "S", value: it.singleInvoicePath },
    { label: "P", value: it.packingListPath },
  ].filter((x) => x.value);

  if (files.length === 0)
    return <span className="text-slate-400 text-xs">Không có</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {files.map((f, idx) => {
        const url = String(f.value);
        const clickable = isUrlLike(url);
        if (clickable) {
          return (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
              title={f.label}
            >
              {f.label}
            </a>
          );
        }
        return (
          <span
            key={idx}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-200 text-slate-400 text-xs font-bold"
            title="Không có"
          >
            {f.label}
          </span>
        );
      })}
    </div>
  );
};

/* ===================== Loading Skeleton ===================== */
const Sk = ({ className = "" }) => (
  <div className={`bg-slate-200 rounded animate-pulse ${className}`} />
);

const FlightRowSkeleton = () => (
  <tr className="hover:bg-transparent">
    <td className="px-4 py-3">
      <Sk className="h-4 w-28" />
    </td>
    <td className="px-4 py-3">
      <Sk className="h-4 w-36" />
    </td>
    <td className="px-4 py-3">
      <Sk className="h-4 w-36" />
    </td>
    <td className="px-4 py-3">
      <Sk className="h-4 w-32" />
    </td>
    <td className="px-4 py-3 text-center">
      <Sk className="h-4 w-10 mx-auto" />
    </td>
    <td className="px-4 py-3 text-right">
      <Sk className="h-4 w-24 ml-auto" />
    </td>
    <td className="px-4 py-3">
      <Sk className="h-5 w-24 rounded-full" />
    </td>
    <td className="px-4 py-3">
      <div className="space-y-2">
        <Sk className="h-3 w-24" />
        <Sk className="h-3 w-20" />
      </div>
    </td>
    <td className="px-4 py-3">
      <div className="flex gap-1">
        <Sk className="h-7 w-7 rounded-md" />
        <Sk className="h-7 w-7 rounded-md" />
        <Sk className="h-7 w-7 rounded-md" />
      </div>
    </td>
    <td className="px-4 py-3">
      <Sk className="h-9 w-9 rounded-lg" />
    </td>
  </tr>
);

export default ManagerInfoFlight;
