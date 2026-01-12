import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { X, Wallet, User, CheckCircle2, Loader2 } from "lucide-react";
import paymentService from "../../Services/Payment/paymentService";
import UploadImg from "../../common/UploadImg";
// Helper: bóc tách lỗi backend
const getErrorMessage = (error) => {
  if (error?.response) {
    const be =
      error.response.data?.error ||
      error.response.data?.message ||
      error.response.data?.detail ||
      error.response.data?.errors;

    if (be) {
      if (typeof be === "object" && !Array.isArray(be)) {
        return Object.entries(be)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
      }
      if (Array.isArray(be)) return be.join(", ");
      return be;
    }
  }
  return error?.message || "Có lỗi xảy ra";
};

const formatMoney = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0 ₫";
  return `${n.toLocaleString("vi-VN")} ₫`;
};

// chỉ cho phép số (không dấu âm), trả về string
const toNonNegativeNumberText = (value) => {
  const s = String(value ?? "");
  const onlyDigits = s.replace(/[^\d]/g, "");
  return onlyDigits === "" ? "" : onlyDigits;
};

const CreateRefund = ({ open, onClose, customer = null, onSuccess }) => {
  const [accountId, setAccountId] = useState("");
  const [amountText, setAmountText] = useState("0"); // ✅ text
  const [image, setImage] = useState(""); // ✅ imageUrl
  const [loading, setLoading] = useState(false);

  // ✅ trạng thái upload ảnh từ UploadImg (để khóa submit)
  const [imgBusy, setImgBusy] = useState(false);

  // ✅ Auto fill khi mở modal / đổi customer
  useEffect(() => {
    if (!open) return;

    const id = customer?.id ?? "";
    setAccountId(id ? String(id) : "");

    const bal = customer?.balance;
    const defaultAmt = Number.isFinite(Number(bal))
      ? String(Math.max(0, Number(bal)))
      : "0";
    setAmountText(defaultAmt);

    // reset ảnh khi mở (tuỳ bạn: nếu muốn giữ ảnh lần trước thì bỏ dòng này)
    setImage("");
  }, [open, customer]);

  const amountNumber = useMemo(() => {
    const n = Number(String(amountText || "0"));
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, n);
  }, [amountText]);

  const canSubmit = useMemo(() => {
    const idOk = String(accountId || "").trim() !== "";
    const imgOk = String(image || "").trim() !== "";
    const amtOk = Number.isFinite(amountNumber) && amountNumber >= 0;
    return idOk && imgOk && amtOk && !loading && !imgBusy;
  }, [accountId, image, amountNumber, loading, imgBusy]);

  const handleClose = useCallback(() => {
    if (loading || imgBusy) return;
    onClose?.();
  }, [loading, imgBusy, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      toast.error("Vui lòng nhập đủ Account ID, Amount và upload Image");
      return;
    }

    setLoading(true);
    try {
      const res = await paymentService.refundBalance(String(accountId).trim(), {
        image: String(image || "").trim(), // ✅ imageUrl từ UploadImg
        amount: amountNumber, // ✅ luôn >= 0
      });

      toast.success("Hoàn số dư thành công!");
      onSuccess?.(res);
      onClose?.();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [canSubmit, accountId, image, amountNumber, onClose, onSuccess]);

  if (!open) return null;

  const accountLocked = !!customer?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <Wallet className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-white text-lg font-semibold">Hoàn số dư</h2>
              {(loading || imgBusy) && (
                <p className="text-white/80 text-xs mt-0.5">
                  {loading ? "Đang xử lý hoàn..." : "Đang xử lý ảnh..."}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleClose}
            type="button"
            className="text-white/80 hover:text-white transition-colors disabled:opacity-60"
            title="Đóng"
            disabled={loading || imgBusy}
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Customer quick card */}
          {customer && (
            <div className="border border-blue-100 bg-blue-50/60 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">
                    {(customer?.name || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">
                      {customer?.name || "—"}
                    </p>
                    {customer?.customerCode && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white border border-blue-200 text-blue-700">
                        {customer.customerCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xl text-gray-600 mt-1">
                    Balance:{" "}
                    <span className="font-semibold text-gray-900">
                      {formatMoney(customer?.balance)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account ID */}
            <div>
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                <User size={16} className="text-blue-600" />
                Account ID <span className="text-red-500">*</span>
              </label>

              <input
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="VD: 182"
                className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none transition ${
                  accountLocked
                    ? "border-gray-200 bg-gray-100 text-gray-700"
                    : "border-gray-200 focus:border-blue-600"
                }`}
                disabled={loading || imgBusy || accountLocked}
              />
            </div>

            {/* Amount (TEXT + no negative) */}
            <div>
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                <Wallet size={16} className="text-blue-600" />
                Amount <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={amountText}
                onChange={(e) =>
                  setAmountText(toNonNegativeNumberText(e.target.value))
                }
                onKeyDown={(e) => {
                  if (
                    e.key === "-" ||
                    e.key === "e" ||
                    e.key === "E" ||
                    e.key === "." ||
                    e.key === "+"
                  ) {
                    e.preventDefault();
                  }
                }}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-600 outline-none transition"
                disabled={loading || imgBusy}
              />
              <p className="text-xs text-gray-500 mt-1">
                Sẽ hoàn:{" "}
                <span className="font-semibold">
                  {formatMoney(amountNumber)}
                </span>
              </p>
            </div>

            {/* ✅ Upload Image */}
            <div className="md:col-span-2">
              <UploadImg
                label="Ảnh hoàn tiền"
                required
                imageUrl={image}
                maxSizeMB={3}
                placeholder="Chưa có ảnh hoàn tiền"
                className="w-full"
                onImageUpload={(url) => {
                  setImgBusy(true);
                  setImage(url);
                  // setImgBusy chỉ để “khóa” lúc callback chạy nhanh; nếu muốn phản ánh upload thực,
                  // hãy nâng cấp UploadImg trả ra uploading/deleting qua props (mình có thể chỉnh luôn).
                  setTimeout(() => setImgBusy(false), 0);
                }}
                onImageRemove={() => {
                  setImgBusy(true);
                  setImage("");
                  setTimeout(() => setImgBusy(false), 0);
                }}
              />
              {/* gợi ý: nếu muốn imgBusy phản ánh đúng uploading/deleting, xem note dưới */}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            type="button"
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition disabled:opacity-60"
            disabled={loading || imgBusy}
          >
            Đóng
          </button>

          <button
            onClick={handleSubmit}
            type="button"
            disabled={!canSubmit}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Xác nhận hoàn
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRefund;
