// src/Components/Payment/CreateDividePaymentShip.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { X, Copy, Loader2, Check, Boxes } from "lucide-react";
import createPaymentShipService from "../../Services/Payment/createPaymentShipService";
import CustomerVoucherPayment from "./CustomerVoucherPayment";
import BankShipList from "./BankShipList";

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

    return `Lỗi ${error.response.status}: ${
      error.response.statusText || "Không xác định"
    }`;
  }
  if (error?.request) return "Không thể kết nối tới server.";
  return error?.message || "Đã xảy ra lỗi không xác định";
};

const formatVnd = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(v || 0)
  );

const formatTimeVN = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN");
};

const formatPaymentStatus = (status) => {
  const statusMap = {
    CHO_THANH_TOAN_SHIP: "Chờ thanh toán ship",
    DA_THANH_TOAN: "Đã thanh toán",
    HUY: "Đã hủy",
  };
  return statusMap[status] || status || "-";
};

const copyToClipboard = async (text, successMsg = "Đã copy") => {
  try {
    await navigator.clipboard.writeText(String(text ?? ""));
    toast.success(successMsg);
  } catch {
    toast.error("Không thể copy. Hãy thử lại.");
  }
};

const onlyDigitsAndComma = (s) => /^[\d,]*$/.test(s);

const parseMoneyInput = (s) => {
  const raw = String(s || "")
    .replace(/,/g, "")
    .trim();
  if (!raw) return null;
  const n = Number(raw);
  if (Number.isNaN(n)) return NaN;
  return n;
};

const formatMoneyInput = (s) => {
  const raw = String(s || "").replace(/,/g, "");
  if (!raw) return "";
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/* ================= SUCCESS MODAL ================= */
const PaymentSuccessModal = ({ isOpen, onClose, paymentData }) => {
  const [qrBroken, setQrBroken] = useState(false);

  useEffect(() => {
    if (isOpen) setQrBroken(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !paymentData) return null;

  const data = paymentData;
  const paymentCode =
    data?.paymentCode ?? data?.code ?? data?.paymentId ?? data?.id ?? "-";
  const qr = data?.qrCode ?? data?.qr ?? data?.qrImage ?? data?.qrUrl ?? null;

  const statusLabel = formatPaymentStatus(data?.status);
  const statusColor =
    data?.status === "DA_THANH_TOAN"
      ? "bg-green-100 text-green-800"
      : data?.status === "HUY"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  const handleOverlayMouseDown = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
      onMouseDown={handleOverlayMouseDown}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header - Green Success */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Thanh Toán Thành Công
                </h3>
                <p className="text-sm text-green-100 mt-0.5">
                  Mã: {paymentCode}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="close"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-4">
          {/* Payment Info */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Mã thanh toán:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-900">{paymentCode}</span>
                <button
                  onClick={() => copyToClipboard(paymentCode, "Đã copy mã")}
                  className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                  type="button"
                >
                  <Copy className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>

            <div className="h-px bg-blue-200"></div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Số tiền:</span>
              <span className="font-bold text-blue-900">
                {formatVnd(data?.amount)}
              </span>
            </div>

            <div className="h-px bg-blue-200"></div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Trạng thái:</span>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}
              >
                {statusLabel}
              </span>
            </div>

            {data?.actionAt && (
              <>
                <div className="h-px bg-blue-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Thời gian:</span>
                  <span className="text-sm font-medium text-blue-900">
                    {formatTimeVN(data.actionAt)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* QR Code */}
          {qr && (
            <div className="space-y-3">
              {!qrBroken ? (
                <img
                  src={qr}
                  alt="QR Code"
                  className="mx-auto w-full max-w-xs rounded-xl border-2 border-gray-200 bg-white p-2"
                  loading="lazy"
                  onError={() => setQrBroken(true)}
                />
              ) : (
                <div className="mx-auto w-full max-w-xs rounded-xl border-2 border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-600">
                  Không tải được QR
                </div>
              )}

              <div className="flex gap-2">
                <a
                  href={qr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 text-center transition-colors"
                >
                  Mở QR
                </a>
                <button
                  onClick={() => copyToClipboard(qr, "Đã copy link QR")}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                  type="button"
                >
                  Copy Link
                </button>
              </div>
            </div>
          )}

          {/* Payment Content */}
          {data?.content && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">
                  Nội dung thanh toán
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(data.content, "Đã copy nội dung")
                  }
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  type="button"
                >
                  Copy
                </button>
              </div>
              <div className="text-sm text-gray-800 bg-white border-2 border-gray-200 rounded-lg p-3 whitespace-pre-wrap break-words">
                {data.content}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-200">
          <button
            onClick={onClose}
            className="w-full rounded-lg py-2.5 font-semibold bg-gray-900 text-white hover:bg-black transition-colors"
            type="button"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= CONFIG MODAL ================= */
const DividePaymentShipConfigModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  totalAmount,
  isCreating,
  accountId,
  cachedBankAccounts = [],
  bankAccountsLoading = false,
  cachedVouchers = [],
  vouchersLoading = false,
}) => {
  const [customerVoucherId, setCustomerVoucherId] = useState(null);
  const [isUseBalance, setIsUseBalance] = useState(true);

  const [bankId, setBankId] = useState(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [voucherLoading, setVoucherLoading] = useState(false);

  const [priceInput, setPriceInput] = useState("");
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    if (isOpen && !bankId && cachedBankAccounts?.length > 0) {
      setBankId(String(cachedBankAccounts[0].id));
    }
  }, [isOpen, bankId, cachedBankAccounts]);

  useEffect(() => {
    if (!isOpen) return;
    setPriceError("");
  }, [isOpen]);

  const priceShipDos = useMemo(() => parseMoneyInput(priceInput), [priceInput]);

  const confirmDisabled =
    isCreating ||
    bankLoading ||
    voucherLoading ||
    !bankId ||
    priceShipDos == null ||
    Number.isNaN(priceShipDos) ||
    Number(priceShipDos) < 0 ||
    !!priceError;

  const handlePriceChange = (e) => {
    const input = e.target.value;
    if (!onlyDigitsAndComma(input)) return;

    const formatted = formatMoneyInput(input);
    setPriceInput(formatted);

    const n = parseMoneyInput(formatted);
    if (n == null) {
      setPriceError("Vui lòng nhập giá vận chuyển");
      return;
    }
    if (Number.isNaN(n)) {
      setPriceError("Vui lòng nhập số hợp lệ");
      return;
    }
    if (n < 0) {
      setPriceError("Giá vận chuyển phải >= 0");
      return;
    }
    setPriceError("");
  };

  const handleClose = () => {
    if (!isCreating) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header - Gradient Blue */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-white" />
              <h3 className="text-xl font-semibold text-white">
                Cấu Hình Thanh Toán Tách Đơn
              </h3>
            </div>
            <button
              onClick={handleClose}
              disabled={isCreating}
              className="text-white/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Summary Info */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700 mb-1">Số đơn đã chọn</p>
                <p className="text-2xl font-bold text-blue-900">
                  {selectedCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700 mb-1">Tổng phí ước tính</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatVnd(totalAmount || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Giá vận chuyển nội địa <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={priceInput}
                onChange={handlePriceChange}
                disabled={isCreating}
                className={`w-full px-4 py-2.5 pr-10 border-2 rounded-lg text-lg font-medium transition-all
                  ${
                    isCreating
                      ? "bg-gray-100 cursor-not-allowed"
                      : "bg-white hover:border-blue-400"
                  }
                  ${
                    priceError
                      ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }
                `}
                placeholder="Nhập giá vận chuyển"
              />
              <span className="absolute right-4 top-2.5 text-xl font-semibold text-gray-500">
                ₫
              </span>
            </div>
            {priceError && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">
                {priceError}
              </p>
            )}
            {priceInput && !priceError && (
              <p className="mt-1.5 text-sm font-medium text-green-600">
                ✓ {formatVnd(priceShipDos)}
              </p>
            )}
          </div>

          {/* Voucher */}
          {accountId && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Voucher khách hàng
              </label>
              <CustomerVoucherPayment
                accountId={accountId}
                disabled={isCreating}
                value={customerVoucherId}
                onChange={setCustomerVoucherId}
                onLoadingChange={setVoucherLoading}
                cachedVouchers={cachedVouchers}
                initialLoading={vouchersLoading}
              />
              {voucherLoading && (
                <p className="mt-1.5 text-sm font-medium text-gray-500">
                  Đang tải voucher...
                </p>
              )}
            </div>
          )}

          {/* Bank Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tài khoản nhận cước <span className="text-red-500">*</span>
            </label>
            <BankShipList
              disabled={isCreating}
              value={bankId}
              onChange={setBankId}
              onLoadingChange={setBankLoading}
              autoSelectFirst
              cachedAccounts={cachedBankAccounts}
              initialLoading={bankAccountsLoading}
            />
            {(bankLoading || !bankId) && (
              <p className="mt-1.5 text-sm font-medium">
                {bankLoading ? (
                  <span className="text-gray-500">
                    Đang tải tài khoản ngân hàng...
                  </span>
                ) : (
                  <span className="text-red-600">
                    Vui lòng chọn tài khoản nhận cước
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Use Balance Checkbox */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isUseBalance}
                onChange={(e) => setIsUseBalance(e.target.checked)}
                disabled={isCreating}
                className="w-5 h-5 mt-0.5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-gray-900 block">
                  Sử dụng số dư tài khoản
                </span>
                <p className="text-xs text-gray-600 mt-1">
                  Tự động trừ số dư khách hàng để thanh toán
                </p>
              </div>
            </label>
          </div>

          {/* Confirmation Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-blue-900 mb-3">
              Xác nhận thông tin:
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Số đơn đã chọn:</span>
                <span className="text-sm font-bold text-blue-900">
                  {selectedCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">
                  Giá vận chuyển nội địa:
                </span>
                <span
                  className={`text-sm font-bold ${
                    priceShipDos != null && !priceError
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {priceShipDos != null && !priceError
                    ? formatVnd(priceShipDos)
                    : "Chưa nhập"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Voucher:</span>
                <span className="text-sm font-bold text-blue-900">
                  {customerVoucherId ? "Có" : "Không"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">
                  Tài khoản nhận cước:
                </span>
                <span
                  className={`text-sm font-bold ${
                    bankId ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {bankId ? "Đã chọn" : "Chưa chọn"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Sử dụng số dư:</span>
                <span className="text-sm font-bold text-blue-900">
                  {isUseBalance ? "Có" : "Không"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-200 rounded-b-xl flex justify-end space-x-3 sticky bottom-0">
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            type="button"
          >
            Hủy
          </button>
          <button
            disabled={confirmDisabled}
            onClick={() =>
              onConfirm({
                customerVoucherId: customerVoucherId ?? null,
                isUseBalance,
                bankId,
                priceShipDos: Number(priceShipDos),
              })
            }
            className="px-6 py-2.5 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center shadow-sm"
            type="button"
            title={
              confirmDisabled
                ? bankLoading
                  ? "Đang tải tài khoản ngân hàng..."
                  : voucherLoading
                  ? "Đang tải voucher..."
                  : !bankId
                  ? "Vui lòng chọn tài khoản nhận cước"
                  : priceShipDos == null ||
                    Number.isNaN(Number(priceShipDos)) ||
                    Number(priceShipDos) < 0 ||
                    priceError
                  ? "Vui lòng nhập giá vận chuyển hợp lệ"
                  : "Không thể xác nhận lúc này"
                : "Xác nhận tạo thanh toán"
            }
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              `Xác nhận thanh toán (${selectedCount})`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN BUTTON ================= */
const CreateDividePaymentShip = ({
  selectedShipmentCodes,
  totalAmount,
  formatCurrency,
  onSuccess,
  onError,
  disabled = false,
  accountId,
  cachedBankAccounts = [],
  bankAccountsLoading = false,
  cachedVouchers = [],
  vouchersLoading = false,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState(null);

  const [pendingAfterClose, setPendingAfterClose] = useState(null);

  const openModal = () => {
    if (!selectedShipmentCodes || selectedShipmentCodes.length < 1) {
      toast.error("Vui lòng chọn ít nhất 1 tracking để tách đơn");
      return;
    }
    setShowConfigModal(true);
  };

  const handleConfirmDividePayment = useCallback(
    async (payload) => {
      if (!payload?.bankId) {
        toast.error("Vui lòng chọn tài khoản ngân hàng");
        return;
      }
      const ship = Number(payload?.priceShipDos);

      if (payload?.priceShipDos == null || Number.isNaN(ship) || ship < 0) {
        toast.error("Vui lòng nhập giá vận chuyển nội địa hợp lệ ");
        return;
      }
      setShowConfigModal(false);

      try {
        setIsCreating(true);

        const res = await createPaymentShipService.createPartialShipment(
          payload.isUseBalance,
          payload.bankId,
          payload.customerVoucherId,
          payload.priceShipDos,
          selectedShipmentCodes
        );

        const data = res?.data ?? res;

        setPaymentResponse(data);
        setShowSuccessModal(true);
        toast.success("Tạo thanh toán tách đơn thành công!", {
          duration: 3000,
        });

        setPendingAfterClose(() => () => onSuccess?.(data));
      } catch (err) {
        toast.error(getErrorMessage(err), { duration: 5000 });
        onError?.(err);
      } finally {
        setIsCreating(false);
      }
    },
    [onSuccess, onError, selectedShipmentCodes]
  );

  const handleCloseSuccessModal = async () => {
    setShowSuccessModal(false);

    const fn = pendingAfterClose;
    setPendingAfterClose(null);
    setPaymentResponse(null);

    if (typeof fn === "function") {
      try {
        await fn();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        disabled={disabled || isCreating}
        className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center shadow-sm"
        type="button"
      >
        {isCreating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang tạo...
          </>
        ) : (
          <>Tạo thanh toán ({selectedShipmentCodes?.length || 0})</>
        )}
      </button>

      <DividePaymentShipConfigModal
        isOpen={showConfigModal}
        onClose={() => !isCreating && setShowConfigModal(false)}
        onConfirm={handleConfirmDividePayment}
        selectedCount={selectedShipmentCodes?.length || 0}
        totalAmount={totalAmount || 0}
        isCreating={isCreating}
        accountId={accountId}
        cachedBankAccounts={cachedBankAccounts}
        bankAccountsLoading={bankAccountsLoading}
        cachedVouchers={cachedVouchers}
        vouchersLoading={vouchersLoading}
      />

      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        paymentData={paymentResponse}
      />
    </>
  );
};

export default CreateDividePaymentShip;
