// src/Pages/Manager/Flight/ManagerInfoFlight.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Plane,
  Search,
  RefreshCw,
  ArrowUpDown,
  BadgeCheck,
  BadgeX,
  Eye,
  X,
  Loader2,
  Download,
  FileText,
} from "lucide-react";
import managerInforFlightService from "../../Services/Manager/managerInforFlightService";

const fmtDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("vi-VN", { hour12: false });
};

const fmtDateTimeExport = (iso) => {
  if (!iso) return "";
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

  // ✅ Export to CSV
  const handleDownloadCSV = () => {
    if (filtered.length === 0) {
      toast.error("Không có dữ liệu để xuất!");
      return;
    }

    const headers = [
      "ID",
      "Mã chuyến bay",
      "Ngày đến",
      "Ngày tạo",
      "Nhân viên",
      "Số lượng kho",
      "Tổng khối lượng",
      "Tổng chi phí",
      "Chi phí gốc/Kg",
      "Lợi nhuận",
      "Vận chuyển HK - Đã TT",
      "Vận chuyển HK - Ngày TT",
      "Hải quan - Đã TT",
      "Hải quan - Ngày TT",
      "Chi phí vận chuyển HK",
      "Chi phí thông quan",
      "Chi phí vận chuyển sân bay",
      "Chi phí khác",
      "Trạng thái",
      "AWB File",
      "Invoice File",
      "Export License",
      "Single Invoice",
      "Packing List",
    ];

    const csvRows = [
      headers.join(","),
      ...filtered.map((it) => {
        return [
          it.flightShipmentId ?? "",
          `"${it.flightCode || ""}"`,
          `"${fmtDateTimeExport(it.arrivalDate)}"`,
          `"${fmtDateTimeExport(it.createdAt)}"`,
          `"${it.staffName || ""}"`,
          Number(it.numberOfWarehouses || 0),
          Number(it.totalVolumeWeight || 0),
          Number(it.totalCost || 0),
          Number(it.originCostPerKg || 0),
          Number(it.grossProfit || 0),
          it.airFreightPaid ? "Có" : "Không",
          `"${fmtDateTimeExport(it.airFreightPaidDate)}"`,
          it.customsPaid ? "Có" : "Không",
          `"${fmtDateTimeExport(it.customsPaidDate)}"`,
          Number(it.airFreightCost || 0),
          Number(it.customsClearanceCost || 0),
          Number(it.airportShippingCost || 0),
          Number(it.otherCosts || 0),
          `"${it.status || ""}"`,
          `"${it.awbFilePath || ""}"`,
          `"${it.invoiceFilePath || ""}"`,
          `"${it.exportLicensePath || ""}"`,
          `"${it.singleInvoicePath || ""}"`,
          `"${it.packingListPath || ""}"`,
        ].join(",");
      }),
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n"); // BOM for UTF-8
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `flight-info-${timestamp}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Xuất file CSV thành công!");
  };

  return (
    <div className="min-h-screen p-4 md:p-6 text-sm md:text-base">
      <div className="mx-auto space-y-6">
        {/* ✅ Header lớn - VÀNG với border đen */}
        <div className="bg-gradient-to-r from-yellow-300 via-yellow-300 to-yellow-300 border-[1px] border-black rounded-xl shadow-lg p-4 md:p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-1.5 h-8 md:h-9 bg-black rounded-full shrink-0 shadow-sm" />
              <div className="w-11 h-11 rounded-lg bg-white border-2 border-black flex items-center justify-center shrink-0">
                <Plane className="w-6 h-6 text-black" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-black leading-tight">
                  Quản Lý Thông Tin Chuyến Bay
                </h1>
                <p className="text-sm text-gray-700 font-medium mt-1">
                  Xem và quản lý danh sách chuyến bay
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadCSV}
                disabled={loading || filtered.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors border-2 border-green-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <Download className="w-4 h-4" />
                Xuất CSV
              </button>

              <button
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-gray-100 text-black text-sm font-medium transition-colors border-2 border-black shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Tải lại
              </button>
            </div>
          </div>
        </div>

        {/* Search card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm mã chuyến bay, nhân viên, trạng thái..."
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-sm md:text-base leading-6
                         focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Error */}
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            {error}
          </div>
        ) : null}

        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Top bar */}
          <div className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100">
            <div className="text-sm md:text-base text-slate-600">
              Hiển thị{" "}
              <span className="font-semibold text-slate-900">
                {filtered.length.toLocaleString("vi-VN")}
              </span>{" "}
              bản ghi
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <Th onClick={() => toggleSort("flightCode")}>
                    Mã chuyến bay <SortIcon active={sortKey === "flightCode"} />
                  </Th>

                  <Th>ID</Th>

                  <Th onClick={() => toggleSort("arrivalDate")}>
                    Ngày đến <SortIcon active={sortKey === "arrivalDate"} />
                  </Th>

                  <Th onClick={() => toggleSort("createdAt")}>
                    Ngày tạo <SortIcon active={sortKey === "createdAt"} />
                  </Th>

                  <Th>Nhân viên</Th>
                  <Th>SL kho</Th>

                  <Th onClick={() => toggleSort("totalCost")}>
                    Tổng chi phí <SortIcon active={sortKey === "totalCost"} />
                  </Th>

                  <Th onClick={() => toggleSort("grossProfit")}>
                    Lợi nhuận <SortIcon active={sortKey === "grossProfit"} />
                  </Th>

                  <Th>Thanh toán</Th>
                  <Th>Tệp đính kèm</Th>
                  <Th className="text-center px-4 py-3">Thao tác</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      <Plane className="w-12 h-12 text-slate-300 mb-3 mx-auto" />
                      <p className="text-sm md:text-base font-medium">
                        Không có dữ liệu chuyến bay
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((it) => (
                    <tr
                      key={it.flightShipmentId}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        {it.flightCode || "-"}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {it.flightShipmentId ?? "-"}
                      </td>

                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {fmtDateTime(it.arrivalDate)}
                      </td>

                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {fmtDateTime(it.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {it.staffName || "-"}
                      </td>

                      <td className="px-4 py-3 text-slate-900">
                        {Number(it.numberOfWarehouses || 0).toLocaleString(
                          "vi-VN",
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-900 font-semibold font-mono">
                        {money(it.totalCost)}
                      </td>

                      <td className="px-4 py-3">
                        <ProfitBadge value={it.grossProfit} />
                      </td>

                      <td className="px-4 py-3">
                        <PaidBadges
                          airFreightPaid={it.airFreightPaid}
                          airFreightPaidDate={it.airFreightPaidDate}
                          customsPaid={it.customsPaid}
                          customsPaidDate={it.customsPaidDate}
                        />
                      </td>

                      <td className="px-4 py-3">
                        <FilesCell it={it} />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => openDetail(it.flightShipmentId)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-1.5 rounded-lg border border-blue-200 transition-all"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {detailOpen ? (
          <DetailModal
            onClose={closeDetail}
            loading={detailLoading}
            error={detailError}
            data={detail}
          />
        ) : null}
      </div>
    </div>
  );
};

const Th = ({ children, onClick, className = "" }) => (
  <th
    onClick={onClick}
    className={`text-left px-4 py-3 text-xs md:text-sm font-semibold text-slate-700 tracking-wide ${
      onClick ? "cursor-pointer select-none hover:text-slate-900" : ""
    } ${className}`}
  >
    <div className="inline-flex items-center gap-1">{children}</div>
  </th>
);

const SortIcon = ({ active }) => (
  <span
    className={`inline-flex items-center ${
      active ? "text-slate-900" : "text-slate-400"
    }`}
  >
    <ArrowUpDown className="w-3.5 h-3.5" />
  </span>
);

const ProfitBadge = ({ value }) => {
  const v = Number(value || 0);
  const isNeg = v < 0;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium leading-5 ${
        isNeg
          ? "bg-red-50 text-red-700 border border-red-100"
          : "bg-green-50 text-green-700 border border-green-100"
      }`}
    >
      {isNeg ? "-" : "+"}
      {Math.abs(v).toLocaleString("en-US")}
    </span>
  );
};

const PaidBadges = ({ airFreightPaid, customsPaid }) => {
  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-medium leading-5 ${
          airFreightPaid ? "text-green-700" : "text-slate-600"
        }`}
      >
        {airFreightPaid ? (
          <BadgeCheck className="w-3.5 h-3.5" />
        ) : (
          <BadgeX className="w-3.5 h-3.5" />
        )}
        <span className="font-semibold">Vận chuyển:</span>{" "}
        {airFreightPaid ? "Đã TT" : "Chưa TT"}
      </span>

      <span
        className={`inline-flex items-center gap-1 text-[11px] font-medium leading-5 ${
          customsPaid ? "text-green-700" : "text-slate-600"
        }`}
      >
        {customsPaid ? (
          <BadgeCheck className="w-3.5 h-3.5" />
        ) : (
          <BadgeX className="w-3.5 h-3.5" />
        )}
        <span className="font-semibold">Hải quan:</span>{" "}
        {customsPaid ? "Đã TT" : "Chưa TT"}
      </span>
    </div>
  );
};

// ✅ Files Cell với download buttons
const FilesCell = ({ it }) => {
  const files = [
    { label: "AWB", value: it.awbFilePath, short: "A" },
    { label: "Invoice", value: it.invoiceFilePath, short: "I" },
    { label: "Export Lic", value: it.exportLicensePath, short: "E" },
    { label: "Single Inv", value: it.singleInvoicePath, short: "S" },
    { label: "Packing", value: it.packingListPath, short: "P" },
  ].filter((x) => x.value);

  if (files.length === 0)
    return <span className="text-slate-400 text-sm">Không có</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {files.map((f) => {
        const url = String(f.value);
        const clickable = isUrlLike(url);

        if (clickable) {
          return (
            <a
              key={f.label}
              href={url}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-medium transition-all group"
              title={`Download ${f.label}`}
            >
              <Download className="w-3 h-3 group-hover:animate-bounce" />
              {f.short}
            </a>
          );
        }

        return (
          <span
            key={f.label}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-700"
            title={`${f.label}: ${url}`}
          >
            <FileText className="w-3 h-3" />
            {f.short}
          </span>
        );
      })}
    </div>
  );
};

// ✅ Detail Modal với download buttons
const DetailModal = ({ onClose, loading, error, data }) => {
  const files = data
    ? [
        { label: "AWB File", value: data.awbFilePath },
        { label: "Invoice File", value: data.invoiceFilePath },
        { label: "Export License", value: data.exportLicensePath },
        { label: "Single Invoice", value: data.singleInvoicePath },
        { label: "Packing List", value: data.packingListPath },
      ].filter((x) => x.value)
    : [];

  const handleDownloadFile = (url, filename) => {
    if (!isUrlLike(url)) {
      toast.error("URL không hợp lệ!");
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "download";
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Đang tải ${filename}...`);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
          <h3 className="text-base md:text-lg font-semibold text-slate-900">
            Chi tiết chuyến bay {data?.flightCode ? `- ${data.flightCode}` : ""}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 text-sm md:text-base">
          {loading ? (
            <div className="py-10 flex items-center justify-center text-slate-600 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang tải chi tiết...
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
              {error}
            </div>
          ) : !data ? (
            <div className="text-slate-500 text-center py-10">
              Không có dữ liệu.
            </div>
          ) : (
            <>
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Info label="Mã chuyến bay" value={data.flightCode} />
                <Info label="Trạng thái" value={data.status ?? "-"} />
                <Info label="Ngày đến" value={fmtDateTime(data.arrivalDate)} />
                <Info label="Ngày tạo" value={fmtDateTime(data.createdAt)} />
                <Info label="Nhân viên" value={data.staffName} />
                <Info
                  label="Số lượng kho"
                  value={Number(data.numberOfWarehouses || 0).toLocaleString(
                    "vi-VN",
                  )}
                />

                <Info
                  label="Tổng khối lượng quy đổi"
                  value={money(data.totalVolumeWeight)}
                />
                <Info label="Tổng chi phí" value={money(data.totalCost)} />
                <Info
                  label="Chi phí gốc / Kg"
                  value={money(data.originCostPerKg)}
                />
                <Info label="Lợi nhuận gộp" value={money(data.grossProfit)} />

                <Info
                  label="Chi phí vận chuyển hàng không"
                  value={money(data.airFreightCost)}
                />
                <Info
                  label="Chi phí thông quan"
                  value={money(data.customsClearanceCost)}
                />
                <Info
                  label="Chi phí vận chuyển sân bay"
                  value={money(data.airportShippingCost)}
                />
                <Info label="Chi phí khác" value={money(data.otherCosts)} />
              </div>

              {/* Payment Status */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="font-semibold text-slate-800 text-base mb-2">
                    Thanh toán vận chuyển hàng không
                  </div>
                  <div className="text-sm text-slate-700">
                    Trạng thái:{" "}
                    <span
                      className={`font-semibold ${
                        data.airFreightPaid
                          ? "text-green-700"
                          : "text-slate-700"
                      }`}
                    >
                      {data.airFreightPaid
                        ? "Đã thanh toán"
                        : "Chưa thanh toán"}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Ngày TT: {fmtDateTime(data.airFreightPaidDate)}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="font-semibold text-slate-800 text-base mb-2">
                    Thanh toán hải quan
                  </div>
                  <div className="text-sm text-slate-700">
                    Trạng thái:{" "}
                    <span
                      className={`font-semibold ${
                        data.customsPaid ? "text-green-700" : "text-slate-700"
                      }`}
                    >
                      {data.customsPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Ngày TT: {fmtDateTime(data.customsPaidDate)}
                  </div>
                </div>
              </div>

              {/* Files Download Section */}
              <div className="mt-4">
                <div className="font-semibold text-slate-800 text-base mb-2">
                  Tệp đính kèm
                </div>
                {files.length === 0 ? (
                  <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                    Không có tệp đính kèm
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {files.map((f) => {
                      const url = String(f.value);
                      const clickable = isUrlLike(url);
                      const filename =
                        f.label.replace(/\s+/g, "_") +
                        "_" +
                        (data.flightCode || "flight");

                      return clickable ? (
                        <button
                          key={f.label}
                          type="button"
                          onClick={() => handleDownloadFile(url, filename)}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {f.label}
                            </span>
                          </div>
                          <Download className="w-4 h-4 group-hover:animate-bounce" />
                        </button>
                      ) : (
                        <div
                          key={f.label}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">{f.label}</span>
                          </div>
                          <span className="text-xs text-slate-500">
                            Không khả dụng
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-white border border-slate-200 rounded-lg p-3">
    <div className="text-[11px] font-medium text-slate-500 uppercase mb-1">
      {label}
    </div>
    <div className="font-semibold text-slate-900 break-words text-sm md:text-base">
      {value ?? "-"}
    </div>
  </div>
);

export default ManagerInfoFlight;
