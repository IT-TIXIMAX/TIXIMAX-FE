// src/Pages/Manager/Flight/ManagerInfoFlight.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Plane,
  Search,
  BadgeCheck,
  BadgeX,
  Eye,
  Plus,
  X,
  TrendingUp,
  BarChart3,
  Users,
  Package,
  FileText,
  Edit,
} from "lucide-react";
import managerInforFlightService from "../../Services/Manager/managerInforFlightService";
import DetailInfoFlight from "./DetailInfoFlight";
import CreateInforFlight from "../LeadSale/CreateInforFlight";
import UpdateFlightInfor from "./UpdateFlightInfor";

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

  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detail, setDetail] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

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

  const handleCreateCancel = () => setCreateOpen(false);

  const openEdit = async (flightShipmentId) => {
    if (!flightShipmentId && flightShipmentId !== 0) return;
    setEditData(null);
    setEditOpen(true);
    try {
      setEditLoading(true);
      const data = await managerInforFlightService.getDetail(flightShipmentId);
      setEditData(data);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Lỗi tải thông tin chuyến bay";
      toast.error(msg);
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditData(null);
  };

  const handleEditSuccess = () => {
    closeEdit();
    fetchData();
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Summary stats
  const stats = useMemo(() => {
    const totalCost = filtered.reduce(
      (s, r) => s + Number(r.totalCost || 0),
      0,
    );
    const totalProfit = filtered.reduce(
      (s, r) => s + Number(r.grossProfit || 0),
      0,
    );
    const paidAir = filtered.filter((r) => r.airFreightPaid).length;
    const paidCustoms = filtered.filter((r) => r.customsPaid).length;
    return { totalCost, totalProfit, paidAir, paidCustoms };
  }, [filtered]);

  // Skeletons
  const statsCardsSkeleton = Array.from({ length: 4 }).map((_, idx) => (
    <div
      key={idx}
      className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
    >
      <div className="p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-28" />
        </div>
        <div className="h-10 bg-gray-300 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
    </div>
  ));

  const tableSkeletonRows = Array.from({ length: 6 }).map((_, i) => (
    <React.Fragment key={i}>
      <tr className="border-t border-gray-100">
        {Array.from({ length: 7 }).map((_, j) => (
          <td key={j} className="px-4 pt-3 pb-1">
            <div className="animate-pulse bg-gray-200 h-4 rounded w-full" />
          </td>
        ))}
      </tr>
      <tr className="border-b border-gray-100">
        <td className="px-4 pt-1 pb-3" colSpan={2}>
          <div className="space-y-1.5">
            <div className="animate-pulse bg-gray-200 h-3 rounded w-36" />
            <div className="animate-pulse bg-gray-200 h-3 rounded w-32" />
          </div>
        </td>
        <td className="px-4 pt-1 pb-3" colSpan={3}>
          <div className="flex gap-1">
            <div className="animate-pulse bg-gray-200 h-7 w-7 rounded-md" />
            <div className="animate-pulse bg-gray-200 h-7 w-7 rounded-md" />
            <div className="animate-pulse bg-gray-200 h-7 w-7 rounded-md" />
          </div>
        </td>
        <td className="px-4 pt-1 pb-3" colSpan={2}>
          <div className="animate-pulse bg-gray-200 h-7 rounded w-24" />
        </td>
      </tr>
    </React.Fragment>
  ));

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* ── Header ── */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-lg border border-blue-500 p-6 md:p-8 mb-6 md:mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Quản Lý Thông Tin Chuyến Bay
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
          {loading ? (
            statsCardsSkeleton
          ) : (
            <>
              {/* Tổng chuyến bay */}
              <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Plane className="w-5 h-5 text-blue-700" />
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                      Tổng chuyến bay
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-700">
                    {filtered.length}
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    {filtered.length !== rows.length
                      ? `Lọc từ ${rows.length} chuyến`
                      : "Tất cả chuyến"}
                  </div>
                </div>
              </div>

              {/* Tổng chi phí */}
              <div className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-orange-700" />
                    <div className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                      Tổng chi phí
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-orange-700">
                    {money(stats.totalCost)}
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    Toàn bộ chuyến bay
                  </div>
                </div>
              </div>

              {/* Lợi nhuận */}
              <div className="bg-white rounded-xl shadow-md border border-emerald-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-700" />
                    <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                      Lợi nhuận
                    </div>
                  </div>
                  <div
                    className={`text-3xl font-bold ${
                      stats.totalProfit >= 0
                        ? "text-emerald-700"
                        : "text-red-600"
                    }`}
                  >
                    {stats.totalProfit >= 0 ? "+" : ""}
                    {money(stats.totalProfit)}
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    Tổng lợi nhuận gộp
                  </div>
                </div>
              </div>

              {/* Thanh toán */}
              <div className="bg-white rounded-xl shadow-md border border-purple-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-purple-700" />
                    <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                      Đã thanh toán
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-purple-700">
                    {stats.paidAir}
                  </div>
                  <div className="text-xs text-gray-600 font-medium mt-1">
                    VC | HQ: {stats.paidCustoms} chuyến
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Search + Tạo mới ── */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 md:p-6 flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-600">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                Danh sách chuyến bay
              </h2>
            </div>
            <div className="relative max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm mã chuyến bay, nhân viên, trạng thái..."
                className="pl-10 px-4 py-2.5 border-2 border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
              />
            </div>
          </div>

          {/* Tạo mới card */}
          <div className="bg-white rounded-xl shadow-md border border-emerald-100 overflow-hidden md:w-72">
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 h-full flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="w-5 h-5 text-emerald-700" />
                  <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                    Tạo thông tin bay
                  </div>
                </div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  Thêm chuyến bay mới vào hệ thống cùng thông tin chi phí và
                  chứng từ.
                </p>
              </div>
              <button
                onClick={() => setCreateOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Tạo chuyến bay
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border-2 border-red-200 px-4 py-4 text-red-700 font-medium mb-6">
            {error}
          </div>
        )}

        {/* ── Table ── */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
          <table className="w-full">
            {/* ── Thead ── */}
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
              <tr className="text-blue-900 font-semibold text-sm">
                <th className="p-3 md:p-4 text-left whitespace-nowrap">
                  Mã chuyến bay
                </th>
                <th className="p-3 md:p-4 text-left whitespace-nowrap">
                  Nhân viên
                </th>
                <th className="p-3 md:p-4 text-left whitespace-nowrap">
                  SL kho
                </th>
                <th className="p-3 md:p-4 text-right whitespace-nowrap">
                  Tổng chi phí
                </th>
                <th className="p-3 md:p-4 text-left whitespace-nowrap">
                  Lợi nhuận
                </th>
                <th className="p-3 md:p-4 text-left whitespace-nowrap">
                  TT Vận chuyển
                </th>
                <th className="p-3 md:p-4 text-left whitespace-nowrap">
                  TT Hải quan
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                tableSkeletonRows
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 md:p-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <Plane className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-base font-semibold text-gray-800">
                        Không có dữ liệu chuyến bay
                      </p>
                      <p className="text-sm text-gray-600 font-medium">
                        Không tìm thấy chuyến bay phù hợp
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((it) => (
                  <React.Fragment key={it.flightShipmentId}>
                    {/* ── Dòng trên: thông tin chính ── */}
                    <tr className="hover:bg-blue-50/40 transition-colors border-t border-gray-100">
                      <td className="px-4 pt-3 pb-1 font-semibold text-blue-700 text-sm whitespace-nowrap">
                        {it.flightCode || "-"}
                      </td>
                      <td className="px-4 pt-3 pb-1 text-gray-800 text-sm font-medium">
                        {it.staffName || "-"}
                      </td>
                      <td className="px-4 pt-3 pb-1 text-center font-semibold text-gray-900 text-sm">
                        {Number(it.numberOfWarehouses || 0).toLocaleString(
                          "vi-VN",
                        )}
                      </td>
                      <td className="px-4 pt-3 pb-1 text-right font-semibold text-gray-900 text-sm whitespace-nowrap">
                        {money(it.totalCost)}
                      </td>
                      <td className="px-4 pt-3 pb-1">
                        <ProfitBadge value={it.grossProfit} />
                      </td>
                      <td className="px-4 pt-3 pb-1">
                        <PaidBadge paid={it.airFreightPaid} />
                      </td>
                      <td className="px-4 pt-3 pb-1">
                        <PaidBadge paid={it.customsPaid} />
                      </td>
                    </tr>

                    {/* ── Dòng dưới: ngày tháng, tệp, thao tác ── */}
                    <tr className="hover:bg-blue-50/40 transition-colors border-b border-gray-100">
                      <td className="px-4 pt-1 pb-3" colSpan={2}>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-gray-500 font-medium">
                            <span className="text-gray-800 mr-1">
                              Ngày Đến:
                            </span>
                            {fmtDateTime(it.arrivalDate)}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            <span className="text-gray-800 mr-1">
                              Ngày Tạo:
                            </span>
                            {fmtDateTime(it.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 pt-1 pb-3" colSpan={3}>
                        <FilesCell it={it} />
                      </td>
                      <td className="px-4 pt-1 pb-3" colSpan={2}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetail(it.flightShipmentId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Xem chi tiết
                          </button>
                          <button
                            onClick={() => openEdit(it.flightShipmentId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Chỉnh sửa
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              )}
            </tbody>

            {/* Footer tổng */}
            {!loading && filtered.length > 0 && (
              <tfoot className="bg-gradient-to-r from-blue-100 to-blue-50 border-t-2 border-blue-200">
                <tr className="font-bold text-blue-900">
                  <td
                    colSpan={3}
                    className="p-3 md:p-4 text-left text-sm uppercase tracking-wide"
                  >
                    Tổng cộng ({filtered.length} chuyến)
                  </td>
                  <td className="p-3 md:p-4 text-right text-sm">
                    {money(stats.totalCost)}
                  </td>
                  <td className="p-3 md:p-4">
                    <span
                      className={`text-sm font-bold ${stats.totalProfit >= 0 ? "text-emerald-700" : "text-red-600"}`}
                    >
                      {stats.totalProfit >= 0 ? "+" : ""}
                      {money(stats.totalProfit)}
                    </span>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Create Modal — style khớp DetailInfoFlight */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Tạo Thông Tin Chuyến Bay
                  </h3>
                  <p className="text-blue-100 text-sm font-medium mt-0.5">
                    Nhập đầy đủ thông tin để thêm chuyến bay mới
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreateCancel}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto">
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

      {/* Edit Modal — style khớp DetailInfoFlight */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Chỉnh Sửa Chuyến Bay
                    {editData?.flightCode ? ` — ${editData.flightCode}` : ""}
                  </h3>
                  <p className="text-blue-100 text-sm font-medium mt-0.5">
                    Cập nhật thông tin chuyến bay
                  </p>
                </div>
              </div>
              <button
                onClick={closeEdit}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto">
              {editLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-600 font-medium text-sm">
                    Đang tải thông tin...
                  </p>
                </div>
              ) : editData ? (
                <UpdateFlightInfor
                  initialData={editData}
                  onSuccess={handleEditSuccess}
                  onCancel={closeEdit}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sub-components ──

const ProfitBadge = ({ value }) => {
  const v = Number(value || 0);
  const isNeg = v < 0;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
        isNeg
          ? "bg-red-100 text-red-700 border border-red-200"
          : "bg-emerald-100 text-emerald-700 border border-emerald-200"
      }`}
    >
      {isNeg ? "-" : "+"} {Math.abs(v).toLocaleString("en-US")}
    </span>
  );
};

const PaidBadge = ({ paid }) => (
  <div className="flex items-center gap-1.5">
    {paid ? (
      <BadgeCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
    ) : (
      <BadgeX className="w-4 h-4 text-red-500 flex-shrink-0" />
    )}
    <span
      className={`text-xs font-medium ${paid ? "text-emerald-700" : "text-red-600"}`}
    >
      {paid ? "Đã TT" : "Chưa"}
    </span>
  </div>
);

const FILE_META = {
  A: { full: "AWB", color: "bg-blue-600   hover:bg-blue-700   ring-blue-300" },
  I: {
    full: "Invoice",
    color: "bg-violet-600 hover:bg-violet-700 ring-violet-300",
  },
  E: {
    full: "Export",
    color: "bg-orange-500 hover:bg-orange-600 ring-orange-300",
  },
  S: {
    full: "Single",
    color: "bg-emerald-600 hover:bg-emerald-700 ring-emerald-300",
  },
  P: {
    full: "Packing",
    color: "bg-rose-500   hover:bg-rose-600   ring-rose-300",
  },
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
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Tệp:
        </span>
        <span className="text-xs text-gray-400 italic">Không có</span>
      </div>
    );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xl font-bold text-gray-500 uppercase tracking-wide shrink-0">
        Tệp:
      </span>
      {files.map((f, idx) => {
        const url = String(f.value);
        const clickable = isUrlLike(url);
        const meta = FILE_META[f.label] || {
          full: f.label,
          color: "bg-gray-500 hover:bg-gray-600 ring-gray-300",
        };

        return clickable ? (
          <a
            key={idx}
            href={url}
            target="_blank"
            rel="noreferrer"
            title={meta.full}
            className={`
              inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
              ${meta.color} text-white text-xs font-bold
              shadow-md ring-2 ring-offset-1 ring-transparent
              hover:ring-opacity-60 hover:scale-105
              transition-all duration-150
            `}
          >
            <FileText className="w-3 h-3" />
            {meta.full}
          </a>
        ) : (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-400 text-xs font-bold"
            title="Không khả dụng"
          >
            <FileText className="w-3 h-3" />
            {meta.full}
          </span>
        );
      })}
    </div>
  );
};

export default ManagerInfoFlight;
