// ExportShip.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { X, Loader2, Warehouse, BadgeCheck, Truck } from "lucide-react";
import toast from "react-hot-toast";
import domesticService from "../../Services/Warehouse/domesticService";

const normalizeArray = (res) => {
  const raw = res?.data ?? res;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
};

const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const ExportShip = ({
  customerCode: initialCustomerCode = "",
  onClose,
  onSuccess, // callback để cha refresh list (không nên đóng modal ngay nếu muốn thấy nút đổi)
}) => {
  const [customerCode, setCustomerCode] = useState(initialCustomerCode);
  const [vnpostTrackingCode, setVnpostTrackingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [exported, setExported] = useState(false); // ✅ trạng thái đã xuất thành công

  const vnRef = useRef(null);
  const submittingRef = useRef(false);
  const focusTimerRef = useRef(null);

  useEffect(() => {
    setCustomerCode(initialCustomerCode || "");
    setVnpostTrackingCode("");
    setRows([]);
    setExported(false); // ✅ reset khi mở modal với khách khác

    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    focusTimerRef.current = setTimeout(() => vnRef.current?.focus(), 50);

    return () => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    };
  }, [initialCustomerCode]);

  const totalShipping = useMemo(
    () => rows.reduce((a, r) => a + (r?.shippingList?.length || 0), 0),
    [rows]
  );

  const canSubmit = useMemo(() => {
    return (
      !loading && !exported && customerCode.trim() && vnpostTrackingCode.trim()
    );
  }, [loading, exported, customerCode, vnpostTrackingCode]);

  const submitExport = useCallback(async () => {
    if (loading || submittingRef.current || exported) return;

    const code = customerCode.trim();
    const vn = vnpostTrackingCode.trim();

    if (!code) return toast.error("Thiếu mã khách (VD: C00001)");
    if (!vn) return toast.error("Hãy scan/nhập mã VNPost");

    submittingRef.current = true;
    setLoading(true);

    try {
      const res = await domesticService.transferByCustomer(code, {
        vnpostTrackingCode: vn,
      });

      const arr = normalizeArray(res);
      setRows(arr);

      toast.success("Xuất kho thành công");
      setExported(true); // ✅ nút sẽ đổi thành ĐÓNG

      // ✅ báo cha refresh list (KHÔNG nên đóng modal ngay nếu muốn thấy nút đổi)
      onSuccess?.({
        customerCode: code,
        vnpostTrackingCode: vn,
        rows: arr,
      });
    } catch (e) {
      setRows([]);
      setExported(false);
      toast.error(e?.response?.data?.message || e?.message || "Lỗi xuất kho");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }, [customerCode, vnpostTrackingCode, loading, exported, onSuccess]);

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
          type="button"
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
                Mã vận chuyển (VNPost)
              </div>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={vnRef}
                  value={vnpostTrackingCode}
                  disabled={exported || loading}
                  onChange={(e) => setVnpostTrackingCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !exported) submitExport();
                  }}
                  placeholder="Nhập/scan mã vận chuyển VNPost"
                  className="w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 py-2.5 text-sm outline-none
                             focus:border-blue-600 focus:ring-4 focus:ring-blue-100
                             disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* ✅ Button: confirm -> close */}
          <button
            onClick={exported ? onClose : submitExport}
            disabled={exported ? false : !canSubmit}
            className={`mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5
                       text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed
                       ${
                         exported
                           ? "bg-green-600 hover:bg-green-700"
                           : "bg-red-600 hover:bg-red-700"
                       }`}
            type="button"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : exported ? (
              <X className="h-4 w-4" />
            ) : (
              <BadgeCheck className="h-4 w-4" />
            )}
            {exported ? "Hoàn thành" : "Xác nhận xuất kho"}
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
                Kết quả xuất kho - Tổng số mã xuất: {totalShipping}
              </div>
              {exported && (
                <div className="text-xs font-semibold text-green-700 bg-green-50 ring-1 ring-green-200 px-2 py-1 rounded-lg">
                  Thành công
                </div>
              )}
            </div>

            <div className="p-4 space-y-3">
              {rows.map((r, idx) => (
                <div
                  key={`${r?.domesticId || "x"}-${
                    r?.vnpostTrackingCode || "y"
                  }-${idx}`}
                  className="rounded-xl bg-gray-50 ring-1 ring-gray-200 p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mt-1 text-sm text-gray-600">
                        {r?.note || "—"}
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium">Từ:</span>
                          <span className="truncate">
                            {r?.fromLocationName || "—"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium">Ngày:</span>
                          <span className="truncate">
                            {formatDate(r?.timestamp)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium">Mã VNPost:</span>
                          <span className="truncate">
                            {r?.vnpostTrackingCode || "—"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium">Đ/c:</span>
                          <span className="truncate">
                            {r?.toAddressName || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-[220px] rounded-xl bg-white ring-1 ring-gray-200 overflow-hidden">
                      <div className="px-3 py-2 border-b border-gray-200">
                        <div className="text-sm font-semibold text-gray-900">
                          Ds mã vận đơn ({r?.shippingList?.length || 0})
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
