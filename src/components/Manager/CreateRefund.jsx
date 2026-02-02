import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { X, Wallet, CheckCircle2, Loader2 } from "lucide-react";
import paymentService from "../../Services/Payment/paymentService";
import UploadImg from "../../common/UploadImg";

/* ================= HELPERS ================= */
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

// format cho input (không có ₫)
const formatVndInput = (value) => {
  if (!value) return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("vi-VN");
};

// parse ngược từ input → số sạch
const parseVndInput = (value) => value.replace(/[^\d]/g, "");

const normalizeStr = (v) => String(v ?? "").trim();

/* ================= COMPONENT ================= */
const CreateRefund = ({ open, onClose, customer = null, onSuccess }) => {
  const [accountId, setAccountId] = useState("");
  const [amountText, setAmountText] = useState(""); // số sạch dạng string
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);

  /* ===== init khi mở modal ===== */
  useEffect(() => {
    if (!open) return;

    const id = customer?.id ?? "";
    setAccountId(id ? String(id) : "");

    const balNum = Number(customer?.balance);
    const defaultAmt = Number.isFinite(balNum) ? Math.max(0, balNum) : 0;
    setAmountText(String(Math.floor(defaultAmt)));

    setImage("");
    setImgBusy(false);
    setLoading(false);
  }, [open, customer]);

  const amountNumber = useMemo(() => {
    const n = Number(amountText || "0");
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n));
  }, [amountText]);

  const accountLocked = !!customer?.id;

  const canSubmit = useMemo(() => {
    return (
      normalizeStr(accountId) &&
      normalizeStr(image) &&
      amountNumber > 0 &&
      !loading &&
      !imgBusy
    );
  }, [accountId, image, amountNumber, loading, imgBusy]);

  const resetForm = useCallback(() => {
    setAccountId("");
    setAmountText("");
    setImage("");
    setImgBusy(false);
    setLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    if (loading || imgBusy) return;
    onClose?.();
    resetForm();
  }, [loading, imgBusy, onClose, resetForm]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      if (!normalizeStr(accountId)) toast.error("Vui lòng nhập Account ID");
      else if (!normalizeStr(image))
        toast.error("Vui lòng upload ảnh hoàn tiền");
      else if (!(amountNumber > 0)) toast.error("Số tiền hoàn phải lớn hơn 0");
      else toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setLoading(true);
    try {
      const res = await paymentService.refundBalance(normalizeStr(accountId), {
        image: normalizeStr(image),
        amount: amountNumber,
      });

      toast.success("Hoàn số dư thành công!");
      onSuccess?.(res);
      onClose?.();
      resetForm();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [
    canSubmit,
    accountId,
    image,
    amountNumber,
    onClose,
    onSuccess,
    resetForm,
  ]);

  if (!open) return null;

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
            disabled={loading || imgBusy}
            className="text-white/80 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {customer && (
            <div className="border border-blue-100 bg-blue-50/60 rounded-xl p-4">
              <p className="font-semibold">{customer.name}</p>
              <p className="text-gray-600">
                Balance:{" "}
                <span className="font-semibold">
                  {formatMoney(customer.balance)}
                </span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account ID */}
            <div>
              <label className="text-sm font-semibold mb-2 flex items-center gap-2">
                Account ID *
              </label>
              <input
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                disabled={accountLocked || loading || imgBusy}
                className="w-full px-4 py-2.5 rounded-xl border-2"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-semibold mb-2 flex items-center gap-2">
                Amount *
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={formatVndInput(amountText)}
                onChange={(e) => setAmountText(parseVndInput(e.target.value))}
                onKeyDown={(e) => {
                  if (["-", "e", "E", ".", "+", ","].includes(e.key))
                    e.preventDefault();
                }}
                disabled={loading || imgBusy}
                className="w-full px-4 py-2.5 rounded-xl border-2"
              />
              <p className="text-xs text-red-500 mt-1">
                Sẽ hoàn:{" "}
                <span className="font-semibold">
                  {formatMoney(amountNumber)}
                </span>
              </p>
            </div>

            {/* Upload */}
            <div className="md:col-span-2">
              <UploadImg
                label="Ảnh hoàn tiền"
                required
                imageUrl={image}
                onImageUpload={(url) => setImage(normalizeStr(url))}
                onImageRemove={() => setImage("")}
                onBusyChange={setImgBusy}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={loading || imgBusy}
            className="px-4 py-2 rounded-xl border"
          >
            Đóng
          </button>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white flex items-center gap-2 disabled:opacity-50"
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
