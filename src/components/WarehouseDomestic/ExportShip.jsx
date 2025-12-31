// ExportShip.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  X,
  Loader2,
  Warehouse,
  BadgeCheck,
  Truck,
  Hash,
  ClipboardList,
  Clock,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import domesticService from "../../Services/Warehouse/domesticService";

const normalizeArray = (res) => {
  const raw = res?.data ?? res;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("vi-VN");
  } catch {
    return iso;
  }
};

const ExportShip = ({ customerCode: initialCustomerCode = "", onClose }) => {
  const [customerCode, setCustomerCode] = useState(initialCustomerCode);
  const [vnpostTrackingCode, setVnpostTrackingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const vnRef = useRef(null);

  useEffect(() => {
    setCustomerCode(initialCustomerCode || "");
    setTimeout(() => vnRef.current?.focus(), 50);
  }, [initialCustomerCode]);

  const totalShipping = useMemo(
    () => rows.reduce((a, r) => a + (r?.shippingList?.length || 0), 0),
    [rows]
  );

  const submitExport = useCallback(async () => {
    const code = customerCode.trim();
    const vn = vnpostTrackingCode.trim();

    if (!code) return toast.error("Thiếu mã khách (VD: C00001)");
    if (!vn) return toast.error("Hãy scan/nhập mã VNPost");

    setLoading(true);
    try {
      const res = await domesticService.transferByCustomer(code, {
        vnpostTrackingCode: vn,
      });
      const arr = normalizeArray(res);
      setRows(arr);
      toast.success("✅ Xuất kho thành công");
    } catch (e) {
      setRows([]);
      toast.error(e?.response?.data?.message || e?.message || "Lỗi xuất kho");
    } finally {
      setLoading(false);
    }
  }, [customerCode, vnpostTrackingCode]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 ring-1 ring-blue-100 grid place-items-center">
            <Warehouse className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <div className="text-base font-semibold text-gray-900">
              Xuất kho
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="h-9 w-9 rounded-xl hover:bg-gray-100 grid place-items-center"
          aria-label="Đóng"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Form */}
        <div className="rounded-xl bg-white ring-1 ring-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">
                Mã khách hàng
              </div>
              <input
                value={customerCode}
                disabled
                readOnly
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm
               text-gray-700 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">
                Mã vận chuyển
              </div>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={vnRef}
                  value={vnpostTrackingCode}
                  onChange={(e) => setVnpostTrackingCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitExport()}
                  placeholder="Nhập mã vận chuyển VNPost"
                  className="w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 py-2.5 text-sm outline-none
                             focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          <button
            onClick={submitExport}
            disabled={loading}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5
                       text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BadgeCheck className="h-4 w-4" />
            )}
            Xác nhận xuất kho
          </button>
        </div>

        {/* Result */}
        {loading ? (
          <div className="rounded-xl bg-white ring-1 ring-gray-200 p-5">
            <div className="flex items-center gap-2 text-gray-700">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang tạo phiếu xuất kho...
            </div>
          </div>
        ) : !rows?.length ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <div className="text-gray-900 font-semibold">
              Chưa có phiếu xuất
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Nhập mã và nhấn “Xác nhận xuất kho”.
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white ring-1 ring-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">
                Kết quả xuất kho • Rows: {rows.length} • Vận đơn:{" "}
                {totalShipping}
              </div>
            </div>

            <div className="p-4 space-y-3">
              {rows.map((r, idx) => (
                <div
                  key={`${r?.domesticId || idx}-${r?.timestamp || ""}`}
                  className="rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        Domestic #{r?.domesticId || "—"} • {r?.status || "—"}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {r?.note || "—"}
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Từ:</span>
                          <span className="truncate">
                            {r?.fromLocationName || "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Time:</span>
                          <span className="truncate">
                            {formatDateTime(r?.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">VNPost:</span>
                          <span className="truncate">
                            {r?.vnpostTrackingCode || "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Đ/c:</span>
                          <span className="truncate">
                            {r?.toAddressName || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-[220px] rounded-xl bg-white ring-1 ring-gray-200 overflow-hidden">
                      <div className="px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-gray-400" />
                        <div className="text-sm font-semibold text-gray-900">
                          Vận đơn ({r?.shippingList?.length || 0})
                        </div>
                      </div>
                      <div className="max-h-[160px] overflow-auto">
                        {(r?.shippingList || []).map((code, i) => (
                          <div
                            key={`${code}-${i}`}
                            className="px-3 py-2 text-sm font-medium text-gray-800 border-b border-gray-100"
                          >
                            {i + 1}. {code}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportShip;
