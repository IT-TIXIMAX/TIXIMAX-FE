// src/Components/Payment/PartialPayment.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Search,
  RefreshCw,
  ClipboardList,
  User2,
  Calendar,
  Hash,
  BadgeCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import createOrderPaymentService from "../../Services/Payment/createOrderPaymentService";
import ConfirmPayment from "./ConfirmPayment";

const nf = new Intl.NumberFormat("vi-VN");
const formatMoney = (v) => (v == null ? "-" : nf.format(Number(v)) + " ₫");
const formatDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN");
};

const Badge = ({ children, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    amber: "bg-amber-100 text-amber-800 ring-amber-200",
    green: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    red: "bg-rose-100 text-rose-800 ring-rose-200",
    blue: "bg-blue-100 text-blue-800 ring-blue-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const statusTone = (s) => {
  const str = String(s || "");
  if (!str) return "slate";
  if (str.includes("CHO")) return "amber";
  if (str.includes("DA") || str.includes("DONE") || str.includes("THANH_TOAN"))
    return "green";
  if (str.includes("HUY") || str.includes("CANCEL")) return "red";
  return "blue";
};

// ✅ Chỉ cho confirm khi status còn "CHO..."
const canConfirmShip = (paymentStatus) => {
  const s = String(paymentStatus || "").toUpperCase();
  return s.includes("CHO");
};

// ✅ Map item partial shipment -> order shape cho ConfirmPayment
const buildOrderForConfirm = (x) => ({
  orderCode: x?.orderCode,
  code: x?.orderCode,
  // ConfirmPayment mode="ship" ưu tiên shippingPaymentCode, nên set cả 2 cho chắc
  paymentCode: x?.paymentCode,
  shippingPaymentCode: x?.paymentCode,
  // số tiền hiển thị trong dialog
  finalPrice: x?.paymentAmount ?? x?.partialAmount,
  finalPriceOrder: x?.paymentAmount ?? x?.partialAmount,
  customer: {
    name:
      x?.customerName ||
      x?.customer?.name ||
      x?.receiverName ||
      x?.userName ||
      "",
  },
});

export default function PartialPayment() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("CHO_THANH_TOAN_SHIP");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const LIMIT = 100; // ✅ fix endpoint cần limit trong path

  const items = useMemo(() => {
    const arr = Array.isArray(data?.content) ? data.content : [];
    const keyword = q.trim().toLowerCase();
    if (!keyword) return arr;

    return arr.filter((x) => {
      const fields = [
        x.orderCode,
        x.paymentCode,
        x.staffCode,
        x.staffName,
        x.customerName,
        String(x.orderId ?? ""),
        String(x.paymentId ?? ""),
        String(x.partialShipmentId ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return fields.includes(keyword);
    });
  }, [data, q]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await createOrderPaymentService.getPartialShipments(
        page,
        status,
        LIMIT
      );
      setData(res);
    } catch (e) {
      const msg = e?.message || "Không tải được dữ liệu";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const canNext =
    data?.totalPages == null ? true : page < Math.max(0, data.totalPages - 1);

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 ring-1 ring-blue-100 grid place-items-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  Partial Payment
                </div>
                <div className="text-sm text-slate-500">
                  Danh sách thanh toán theo từng đợt (partial shipment)
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Trạng thái:
                </span>
                <select
                  value={status}
                  onChange={(e) => {
                    setPage(0);
                    setStatus(e.target.value);
                  }}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none
                             focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="CHO_THANH_TOAN_SHIP">
                    CHO_THANH_TOAN_SHIP
                  </option>
                  <option value="DA_THANH_TOAN_SHIP">DA_THANH_TOAN_SHIP</option>
                  <option value="HUY">HUY</option>
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm theo mã đơn, mã GD, nhân viên..."
                  className="h-10 w-full md:w-80 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none
                             focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                onClick={fetchData}
                disabled={loading}
                className="h-10 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white
                           shadow-sm hover:bg-blue-700 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Làm mới
              </button>
            </div>
          </div>

          {/* Page controls */}
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-600">
              Tổng hiển thị:{" "}
              <span className="font-semibold text-slate-900">
                {items.length}
              </span>
              {data?.totalElements != null && (
                <>
                  {" "}
                  • Tổng:{" "}
                  <span className="font-semibold text-slate-900">
                    {data.totalElements}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={loading || page <= 0}
                className="h-10 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700
                           hover:bg-slate-50 disabled:opacity-60"
              >
                <ChevronLeft className="h-4 w-4" />
                Trang trước
              </button>

              <div className="h-10 inline-flex items-center rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-800 ring-1 ring-slate-200">
                Page: {page}
              </div>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading || !canNext}
                className="h-10 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700
                           hover:bg-slate-50 disabled:opacity-60"
              >
                Trang sau
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-rose-50 p-3 ring-1 ring-rose-100 text-rose-800 text-sm flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <div>
                <div className="font-semibold">Lỗi</div>
                <div className="opacity-90">{error}</div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="mt-6 hidden lg:block rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-slate-500" />
            <div className="text-sm font-semibold text-slate-900">
              Danh sách
            </div>
            <div className="ml-auto">
              <Badge tone={statusTone(status)}>{status}</Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Partial ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Đơn / Order
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Giao dịch
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Partial Amount
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Payment Amount
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Ngày</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Nhân viên
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  items.map((x) => (
                    <tr key={x.partialShipmentId} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          #{x.partialShipmentId}
                        </div>
                        <div className="text-xs text-slate-500">
                          PaymentId: {x.paymentId}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {x.orderCode || "-"}
                        </div>
                        <div className="text-xs text-slate-500">
                          OrderId: {x.orderId}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {x.paymentCode || "-"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {x.note ? `Note: ${x.note}` : "Không có ghi chú"}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatMoney(x.partialAmount)}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatMoney(x.paymentAmount)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2 text-slate-700">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {formatDateTime(x.shipmentDate)}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2">
                          <User2 className="h-4 w-4 text-slate-400" />
                          <div>
                            <div className="font-semibold text-slate-900">
                              {x.staffName || "-"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {x.staffCode || "-"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge tone={statusTone(x.paymentStatus)}>
                          {x.paymentStatus}
                        </Badge>
                      </td>

                      <td className="px-4 py-3">
                        {canConfirmShip(x.paymentStatus) ? (
                          <ConfirmPayment
                            mode="ship"
                            order={buildOrderForConfirm(x)}
                            confirmWithDialog={true}
                            onDone={fetchData}
                            className="h-9 px-3 rounded-xl text-xs"
                          />
                        ) : (
                          <span className="text-xs text-slate-500">
                            Không khả dụng
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile / Tablet cards */}
        <div className="mt-6 grid gap-4 lg:hidden">
          {loading ? (
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 text-slate-500">
              Đang tải dữ liệu...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 text-slate-500">
              Không có dữ liệu
            </div>
          ) : (
            items.map((x) => (
              <div
                key={x.partialShipmentId}
                className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-slate-400" />
                      <div className="text-base font-semibold text-slate-900">
                        #{x.partialShipmentId}
                      </div>
                      <Badge tone={statusTone(x.paymentStatus)}>
                        {x.paymentStatus}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      Order:{" "}
                      <span className="font-semibold">
                        {x.orderCode || "-"}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      Payment:{" "}
                      <span className="font-semibold">
                        {x.paymentCode || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                    <div className="text-xs font-medium text-slate-500">
                      Partial Amount
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {formatMoney(x.partialAmount)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                    <div className="text-xs font-medium text-slate-500">
                      Payment Amount
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {formatMoney(x.paymentAmount)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-sm text-slate-700">
                  <div className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {formatDateTime(x.shipmentDate)}
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-slate-400" />
                    {x.staffName || "-"} ({x.staffCode || "-"})
                  </div>
                </div>

                {x.note && (
                  <div className="mt-3 text-sm text-slate-600">
                    Ghi chú: <span className="font-medium">{x.note}</span>
                  </div>
                )}

                {canConfirmShip(x.paymentStatus) && (
                  <div className="mt-4">
                    <ConfirmPayment
                      mode="ship"
                      order={buildOrderForConfirm(x)}
                      confirmWithDialog={true}
                      onDone={fetchData}
                      className="w-full h-10 rounded-xl"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
