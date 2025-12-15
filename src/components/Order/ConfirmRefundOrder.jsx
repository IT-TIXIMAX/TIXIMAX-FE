import React, { useEffect, useCallback, useRef, useState } from "react";
import { X, AlertTriangle, Loader2, CheckCircle2, Ban } from "lucide-react";
import orderService from "../../Services/LeadSale/orderService";
import toast from "react-hot-toast";
import UploadImg from "../../common/UploadImg";

const ConfirmRefundOrder = ({ open, order, onClose, onSuccess }) => {
  const [refundToCustomer, setRefundToCustomer] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const dialogRef = useRef(null);

  // Reset mỗi lần mở modal
  useEffect(() => {
    if (!open) return;
    setRefundToCustomer(true);
    setSubmitting(false);
    setImageUrl("");
    setTimeout(() => dialogRef.current?.focus?.(), 0);
  }, [open]);

  // Đóng bằng ESC (không đóng khi đang submit)
  const handleKeyDown = useCallback(
    (e) => {
      if (!open) return;
      if (e.key === "Escape") {
        if (!submitting) onClose?.();
      }
    },
    [open, submitting, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const safeClose = useCallback(() => {
    if (submitting) return;
    onClose?.();
  }, [submitting, onClose]);

  const submit = useCallback(async () => {
    if (submitting) return;
    if (!order?.orderId) return;

    // ✅ Chỉ bắt buộc ảnh khi HOÀN TIỀN VỀ KHÁCH
    if (refundToCustomer && !imageUrl) {
      toast.error("Vui lòng upload ảnh xác nhận hoàn tiền về khách!");
      return;
    }

    try {
      setSubmitting(true);

      await orderService.confirmRefundOrder(
        order.orderId,
        refundToCustomer,
        refundToCustomer ? imageUrl : null // ✅ không hoàn về khách -> không gửi ảnh
      );

      toast.success(
        refundToCustomer
          ? "Đã xác nhận hoàn tiền về khách."
          : "Đã xác nhận hoàn tiền (không hoàn về khách)."
      );

      onClose?.();
      onSuccess?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Xác nhận hoàn tiền thất bại.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }, [
    submitting,
    order?.orderId,
    refundToCustomer,
    imageUrl,
    onClose,
    onSuccess,
  ]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={safeClose} />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold">Xác nhận hoàn tiền</h3>
          </div>

          <button
            onClick={safeClose}
            disabled={submitting}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <div className="text-sm text-gray-600">
            Bạn đang xử lý hoàn tiền cho đơn{" "}
            <span className="font-semibold text-gray-900">
              {order?.orderCode}
            </span>
            .
          </div>

          {/* ✅ Chỉ hiển thị upload khi Hoàn tiền về khách */}
          {refundToCustomer && (
            <UploadImg
              label="Ảnh xác nhận hoàn tiền"
              required
              imageUrl={imageUrl}
              onImageUpload={(url) => setImageUrl(url)}
              onImageRemove={() => setImageUrl("")}
              className="mt-2"
            />
          )}

          {/* Chọn hình thức hoàn tiền */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-800 mb-3">
              Chọn hình thức xử lý:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRefundToCustomer(true)}
                disabled={submitting}
                className={`w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition ${
                  refundToCustomer
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Hoàn tiền về khách
                  </div>
                  <div className="text-xs text-gray-500">
                    Chuyển tiền trực tiếp cho khách.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRefundToCustomer(false);
                  setImageUrl(""); // ✅ chuyển qua "không hoàn" thì clear ảnh luôn
                }}
                disabled={submitting}
                className={`w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition ${
                  !refundToCustomer
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                <Ban className="w-5 h-5 text-amber-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Không hoàn về khách
                  </div>
                  <div className="text-xs text-gray-500">
                    Chỉ ghi nhận xử lý hoàn.
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Thao tác không thể hoàn tác. Vui lòng kiểm tra kỹ.
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          <button
            onClick={safeClose}
            disabled={submitting}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Hủy
          </button>

          <button
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Xác nhận</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRefundOrder;
