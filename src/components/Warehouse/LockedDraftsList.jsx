// src/Components/Warehouse/LockedDraftsList.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  Lock,
  RefreshCw,
  CheckCircle,
  Package,
  Download,
  Calendar as CalendarIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import draftWarehouseService from "../../Services/Warehouse/darftWarehouseService";

/* ===================== Skeletons ===================== */
const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-12 w-12 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

const TableSkeleton = ({ rows = 10 }) => (
  <div className="p-4 animate-pulse">
    <div className="h-12 bg-gray-100 rounded-lg mb-4" />
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 flex-1 bg-gray-200 rounded hidden md:block" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ===================== Helpers ===================== */
const toISODate = (d) => {
  try {
    const x = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(x.getTime())) return "";
    return x.toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const formatWeight = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0";
  return x % 1 === 0 ? String(x) : x.toLocaleString("vi-VN");
};

const getErrorMessage = (error) => {
  if (error?.response) {
    const backendError =
      error.response.data?.error ||
      error.response.data?.message ||
      error.response.data?.detail ||
      error.response.data?.errors;

    if (backendError) {
      if (typeof backendError === "object" && !Array.isArray(backendError)) {
        const errorMessages = Object.entries(backendError)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(", ");
        return `Lỗi validation: ${errorMessages}`;
      }
      if (Array.isArray(backendError)) return backendError.join(", ");
      return backendError;
    }
    return `Lỗi ${error.response.status}: ${
      error.response.statusText || "Không xác định"
    }`;
  }
  if (error?.request)
    return "Không thể kết nối tới server. Vui lòng kiểm tra mạng.";
  return error?.message || "Đã xảy ra lỗi không xác định";
};

const ensureArray = (v) => {
  if (Array.isArray(v)) return v;
  if (v === null || v === undefined || v === "") return [];
  return [v];
};

const setCellStyle = (ws, addr, style) => {
  if (!ws[addr]) return;
  ws[addr].s = { ...(ws[addr].s || {}), ...style };
};

/* ===================== Excel Builder ===================== */
const buildAndSaveExcel = ({
  rows,
  filePrefix = "Hang_Di_VNPost-",
  endDate,
}) => {
  const excelData = [
    [
      "STT",
      "Mã ship",
      "Nhân viên",
      "Tên khách hàng",
      "SĐT",
      "Địa chỉ",
      "Số mã",
      "Danh sách mã",
      "Trọng lượng",
      "VNPost tracking",
    ],
  ];

  let stt = 1;
  rows.forEach((it) => {
    const list = ensureArray(it.shippingList);
    excelData.push([
      stt++,
      it.shipCode ?? "",
      it.staffCode ?? "",
      it.customerName ?? "",
      it.phoneNumber ?? "",
      (it.address ?? "").replace(/\r\n/g, "\n"),
      list.length,
      list.join(", "),
      it.weight !== undefined && it.weight !== null ? Number(it.weight) : "",
      it.vnpostTrackingCode ?? "",
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(excelData);

  ws["!cols"] = [
    { wch: 6 }, // STT
    { wch: 16 }, // Mã ship
    { wch: 10 }, // Nhân viên
    { wch: 22 }, // Tên khách hàng
    { wch: 14 }, // SĐT
    { wch: 50 }, // Địa chỉ
    { wch: 10 }, // Số mã
    { wch: 45 }, // Danh sách mã
    { wch: 12 }, // Trọng lượng
    { wch: 18 }, // VNPost tracking
  ];

  // Header style (giống PackingFlyingList)
  const headerStyle = {
    fill: { fgColor: { rgb: "2563EB" } },
    font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  };

  // vàng nhạt
  const yellowFill = { fill: { fgColor: { rgb: "FFF59D" } } };

  const range = XLSX.utils.decode_range(ws["!ref"]);

  // apply header style
  for (let col = range.s.c; col <= range.e.c; col++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: col });
    setCellStyle(ws, addr, headerStyle);
  }

  //  Tô vàng toàn bộ cột: "Mã ship" (c=2) và "Số mã" (c=7)
  const yellowCols = [1, 6];
  for (let r = 0; r <= range.e.r; r++) {
    yellowCols.forEach((c) => {
      const addr = XLSX.utils.encode_cell({ r, c });
      setCellStyle(ws, addr, yellowFill);
    });
  }

  // weight column index = 9
  for (let row = 1; row < excelData.length; row++) {
    const wCell = XLSX.utils.encode_cell({ r: row, c: 8 });
    if (ws[wCell] && typeof ws[wCell].v === "number") {
      ws[wCell].z = "0.000";
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "LockedDrafts");

  const fileName = `${filePrefix}_${endDate || toISODate(new Date())}.xlsx`;
  XLSX.writeFile(wb, fileName);

  return { fileName, count: rows.length };
};

/* ===================== Component ===================== */
const LockedDraftsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // inputs (not applied)
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState(toISODate(new Date()));

  // applied filters
  const [filterTerm, setFilterTerm] = useState("");
  const [filterDate, setFilterDate] = useState(toISODate(new Date()));

  const [selectedIds, setSelectedIds] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [lockExportLoading, setLockExportLoading] = useState(false);

  const loadLockedDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await draftWarehouseService.getLockedDrafts(
        filterDate,
        "VNPOST",
      );
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getErrorMessage(err), { duration: 5000 });
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    loadLockedDrafts();
  }, [loadLockedDrafts]);

  const handleSearch = () => {
    setFilterTerm(searchTerm.trim());
    setFilterDate(searchDate);
    setSelectedIds([]);
  };

  const filtered = useMemo(() => {
    const kw = filterTerm.trim().toLowerCase();
    return (items || []).filter((it) => {
      const shippingText = ensureArray(it.shippingList).join(" ");
      const hay = [
        it.id,
        it.customerName,
        it.phoneNumber,
        it.address,
        it.shipCode,
        it.staffCode,
        it.vnpostTrackingCode,
        shippingText,
      ]
        .map((x) => (x == null ? "" : String(x)))
        .join(" ")
        .toLowerCase();

      return !kw || hay.includes(kw);
    });
  }, [items, filterTerm]);

  const statistics = useMemo(() => {
    const totalShippingCodes = filtered.reduce(
      (sum, x) => sum + ensureArray(x.shippingList).length,
      0,
    );
    const totalWeight = filtered.reduce((sum, x) => {
      const w = Number(x.weight);
      return sum + (Number.isFinite(w) ? w : 0);
    }, 0);
    return {
      totalDrafts: filtered.length,
      totalShippingCodes,
      totalWeight,
      selected: selectedIds.length,
    };
  }, [filtered, selectedIds]);

  const isAllSelected = useMemo(() => {
    return filtered.length > 0 && selectedIds.length === filtered.length;
  }, [filtered.length, selectedIds.length]);

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSelectAllCheckbox = () => {
    if (isAllSelected) setSelectedIds([]);
    else setSelectedIds(filtered.map((x) => x.id));
  };

  const handleSelectAllButton = () => handleSelectAllCheckbox();

  /* ====== 1) Xuất Excel LOCAL (không gọi API) ====== */
  const handleExportSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một draft để xuất!");
      return;
    }

    setExportLoading(true);
    try {
      const rows = filtered.filter((x) => selectedIds.includes(x.id));
      if (!rows.length) {
        toast.error("Không có dữ liệu để xuất!");
        return;
      }

      const { fileName, count } = buildAndSaveExcel({
        rows,
        filePrefix: "Xuất_Kho_VNPOST_Ngày",
        endDate: filterDate,
      });

      toast.success(`Xuất thành công ${count} draft! (${fileName})`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error?.message || "Export thất bại!");
    } finally {
      setExportLoading(false);
    }
  };

  /* ====== 2) Khóa & Xuất (gọi API exportByIds, rồi xuất Excel) ====== */
  const handleLockAndExportSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một draft để khóa & xuất!");
      return;
    }

    setLockExportLoading(true);
    try {
      // gọi API: export/ids
      const apiData = await draftWarehouseService.exportByIds(selectedIds);

      // Nếu BE trả về array rows để export => ưu tiên dùng; nếu không => dùng FE rows
      const rowsFromApi = Array.isArray(apiData) ? apiData : null;
      const fallbackRows = filtered.filter((x) => selectedIds.includes(x.id));
      const rowsToExport =
        rowsFromApi && rowsFromApi.length ? rowsFromApi : fallbackRows;

      if (!rowsToExport || rowsToExport.length === 0) {
        toast.error("Không có dữ liệu để xuất sau khi gọi API!");
        return;
      }

      const { fileName, count } = buildAndSaveExcel({
        rows: rowsToExport,
        filePrefix: "locked_drafts_lock_export",
        endDate: filterDate,
      });

      toast.success(`Khóa & xuất thành công ${count} draft! (${fileName})`);

      // reload list + reset selected
      setSelectedIds([]);
      await loadLockedDrafts();
    } catch (err) {
      toast.error(getErrorMessage(err), { duration: 5000 });
    } finally {
      setLockExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Lock size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Khóa & Xuất hàng nội địa
              </h1>
            </div>
            <button
              onClick={loadLockedDrafts}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              Tải lại
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng Draft
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {statistics.totalDrafts}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      endDate:{" "}
                      <span className="font-medium">{filterDate || "-"}</span>
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng mã (shippingList)
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {statistics.totalShippingCodes}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tổng weight:{" "}
                      <span className="font-semibold text-gray-900">
                        {formatWeight(statistics.totalWeight)} kg
                      </span>
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <RefreshCw className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Đã Chọn
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {statistics.selected}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <CheckCircle className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filter & Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm: tên / SĐT / shipCode / staff / shipping code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* endDate */}
              <div className="flex-1">
                <div className="relative">
                  <CalendarIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  type="button"
                >
                  <Search size={18} />
                  Tìm kiếm
                </button>

                {/* Nút chọn tất cả / bỏ chọn */}
                <button
                  onClick={handleSelectAllButton}
                  disabled={loading || filtered.length === 0}
                  className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  type="button"
                >
                  <CheckCircle size={18} />
                  {isAllSelected ? "Bỏ chọn" : "Chọn tất cả"}
                </button>

                {/* Xuất local */}
                <button
                  onClick={handleExportSelected}
                  disabled={selectedIds.length === 0 || exportLoading}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  type="button"
                >
                  {exportLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang xuất...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Xuất Excel ({selectedIds.length})
                    </>
                  )}
                </button>

                {/*  Khóa & Xuất (gọi API exportByIds) */}
                <button
                  onClick={handleLockAndExportSelected}
                  disabled={selectedIds.length === 0 || lockExportLoading}
                  className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  type="button"
                >
                  {lockExportLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang khóa...
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      Khóa & Xuất ({selectedIds.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <TableSkeleton rows={10} />
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Lock className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">
                Không có draft bị khóa
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap w-12">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAllCheckbox}
                        className="w-4 h-4 rounded border-white/30 bg-white/10 focus:ring-white/50"
                      />
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Ship Code
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Khách hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      SĐT
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Địa chỉ
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Staff
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Số mã
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Shipping List
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Weight (kg)
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Trạng thái
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((it, index) => {
                    const list = ensureArray(it.shippingList);
                    const selected = selectedIds.includes(it.id);

                    return (
                      <tr
                        key={it.id}
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } ${selected ? "bg-blue-50" : ""}`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => handleSelectOne(it.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-semibold text-blue-700 whitespace-nowrap">
                            {it.shipCode || "-"}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: <span className="font-medium">{it.id}</span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900 whitespace-nowrap">
                            {it.customerName || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-700 whitespace-nowrap">
                            {it.phoneNumber || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-700 whitespace-pre-line line-clamp-3">
                            {it.address || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200 font-medium">
                            {it.staffCode || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="font-semibold text-gray-900">
                            {list.length}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {list.length > 0 ? (
                              list.slice(0, 6).map((code, idx) => (
                                <div
                                  key={`${it.id}-${code}-${idx}`}
                                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg border border-blue-200"
                                >
                                  <span className="text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded-full font-semibold min-w-[20px] text-center">
                                    {idx + 1}
                                  </span>
                                  <span className="text-sm font-mono text-gray-800">
                                    {code}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400 italic">
                                Không có
                              </span>
                            )}
                            {list.length > 6 && (
                              <div className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm font-semibold">
                                +{list.length - 6}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="font-medium text-gray-900">
                            {formatWeight(it.weight)}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200 font-medium">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                            Locked
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LockedDraftsList;
