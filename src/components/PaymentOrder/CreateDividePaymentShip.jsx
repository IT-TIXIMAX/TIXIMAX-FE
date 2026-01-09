// // src/Components/Payment/CreateDividePaymentShip.jsx
// import React, { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import { X, DollarSign } from "lucide-react";
// import createPaymentShipService from "../../Services/Payment/createPaymentShipService";
// import CustomerVoucherPayment from "./CustomerVoucherPayment";
// import BankShipList from "./BankShipList";

// /** Helper: bóc tách lỗi backend */
// const getErrorMessage = (error) => {
//   if (error?.response) {
//     const be =
//       error.response.data?.error ||
//       error.response.data?.message ||
//       error.response.data?.detail ||
//       error.response.data?.errors;
//     if (be) {
//       if (typeof be === "object" && !Array.isArray(be)) {
//         return Object.entries(be)
//           .map(([k, v]) => `${k}: ${v}`)
//           .join(", ");
//       }
//       if (Array.isArray(be)) return be.join(", ");
//       return be;
//     }
//     return `Lỗi ${error.response.status}: ${
//       error.response.statusText || "Không xác định"
//     }`;
//   }
//   if (error?.request) return "Không thể kết nối tới server.";
//   return error?.message || "Đã xảy ra lỗi không xác định";
// };

// /** Helper: Format trạng thái thanh toán */
// const formatPaymentStatus = (status) => {
//   const statusMap = {
//     CHO_THANH_TOAN_SHIP: "Chờ thanh toán ship",
//     DA_THANH_TOAN: "Đã thanh toán",
//     HUY: "Đã hủy",
//     // Thêm các status khác nếu có
//   };
//   return statusMap[status] || status;
// };

// /* ================= SUCCESS MODAL ================= */
// const PaymentSuccessModal = ({ isOpen, onClose, paymentData }) => {
//   if (!isOpen || !paymentData) return null;

//   return (
//     <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
//         {/* Header */}
//         <div className="px-6 py-4 border-b bg-green-50 rounded-t-xl">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
//               <svg
//                 className="w-6 h-6 text-green-600"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M5 13l4 4L19 7"
//                 />
//               </svg>
//             </div>
//             <h3 className="text-lg font-semibold text-green-900">
//               Tạo thanh toán thành công!
//             </h3>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="px-6 py-4 space-y-3">
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
//             <div className="flex justify-between items-center">
//               <span className="text-sm text-gray-600">Mã thanh toán:</span>
//               <span className="font-bold text-blue-600 text-lg">
//                 {paymentData.paymentCode}
//               </span>
//             </div>

//             <div className="flex justify-between items-center pt-2 border-t border-blue-200">
//               <span className="text-sm text-gray-600">Trạng thái:</span>
//               <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
//                 {formatPaymentStatus(paymentData.status)}
//               </span>
//             </div>

//             {paymentData.amount && (
//               <div className="flex justify-between items-center pt-2 border-t border-blue-200">
//                 <span className="text-sm text-gray-600">Số tiền:</span>
//                 <span className="font-semibold text-gray-900">
//                   {new Intl.NumberFormat("vi-VN", {
//                     style: "currency",
//                     currency: "VND",
//                   }).format(paymentData.amount)}
//                 </span>
//               </div>
//             )}

//             {paymentData.content && (
//               <div className="pt-2 border-t border-blue-200">
//                 <span className="text-sm text-gray-600 block mb-1">
//                   Nội dung:
//                 </span>
//                 <p className="text-sm text-gray-800 bg-white p-2 rounded border">
//                   {paymentData.content}
//                 </p>
//               </div>
//             )}

//             {paymentData.paymentType && (
//               <div className="flex justify-between items-center pt-2 border-t border-blue-200">
//                 <span className="text-sm text-gray-600">Loại thanh toán:</span>
//                 <span className="text-sm font-medium text-gray-900">
//                   {paymentData.paymentType}
//                 </span>
//               </div>
//             )}
//           </div>

//           {paymentData.qrCode && (
//             <div className="text-center">
//               <img
//                 src={paymentData.qrCode}
//                 alt="QR Code"
//                 className="mx-auto max-w-full h-auto rounded-lg border"
//               />
//               <p className="text-xs text-gray-500 mt-2">
//                 Quét mã QR để thanh toán
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-4 border-t bg-gray-50 rounded-b-xl">
//           <button
//             onClick={onClose}
//             className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium hover:bg-blue-700 transition-colors"
//           >
//             Đóng
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ================= MODAL ================= */
// const DividePaymentShipConfigModal = ({
//   isOpen,
//   onClose,
//   onConfirm,
//   selectedCount,
//   totalAmount,
//   formatCurrency,
//   isCreating,
//   accountId,
//   cachedBankAccounts = [],
//   bankAccountsLoading = false,
//   cachedVouchers = [],
//   vouchersLoading = false,
// }) => {
//   const [customerVoucherId, setCustomerVoucherId] = useState(null);
//   const [isUseBalance, setIsUseBalance] = useState(true);

//   const [availableVouchers, setAvailableVouchers] = useState([]);
//   const [voucherLoading, setVoucherLoading] = useState(false);

//   const [bankId, setBankId] = useState(null);
//   const [bankLoading, setBankLoading] = useState(false);

//   /** ⭐ QUAN TRỌNG: LƯU SỐ THUẦN */
//   const [priceShipDos, setPriceShipDos] = useState(undefined);

//   const [priceError, setPriceError] = useState("");

//   /* Auto chọn bank đầu */
//   useEffect(() => {
//     if (
//       isOpen &&
//       !bankId &&
//       cachedBankAccounts &&
//       cachedBankAccounts.length > 0
//     ) {
//       setBankId(String(cachedBankAccounts[0].id));
//     }
//   }, [cachedBankAccounts, isOpen]); // eslint-disable-line

//   /* Format chỉ để HIỂN THỊ */
//   const formatNumber = (num) => {
//     if (num === null || num === undefined) return "";
//     return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//   };

//   const handlePriceChange = (e) => {
//     const input = e.target.value;

//     // Chỉ cho phép số và dấu phẩy
//     if (input !== "" && !/^[\d,]*$/.test(input)) return;

//     const raw = input.replace(/,/g, "");

//     // Không nhập → không đi ship
//     if (raw === "") {
//       setPriceShipDos(undefined);
//       setPriceError("");
//       return;
//     }

//     const num = Number(raw);

//     if (Number.isNaN(num)) {
//       setPriceError("Vui lòng nhập số hợp lệ");
//       return;
//     }

//     // Hợp lệ
//     setPriceError("");
//     setPriceShipDos(num); // number sạch
//   };

//   const handleVouchersChange = (vouchers) => {
//     setAvailableVouchers(vouchers || []);
//   };

//   const confirmDisabled =
//     isCreating || bankLoading || voucherLoading || !bankId;

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
//       <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-lg max-h-[95vh] overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="px-4 sm:px-6 py-4 border-b bg-white flex justify-between">
//           <h3 className="text-lg font-semibold">Tạo thanh toán tách đơn</h3>
//           <button
//             onClick={onClose}
//             disabled={isCreating}
//             className="text-gray-400 hover:text-gray-600"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
//           {/* Summary */}
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <div className="flex justify-between mb-2">
//               <span>Số đơn đã chọn</span>
//               <span className="font-bold">{selectedCount}</span>
//             </div>
//             <div className="flex justify-between pt-2 border-t">
//               <span>Tổng phí ước tính</span>
//               <span className="font-bold text-blue-600">
//                 {formatCurrency(totalAmount)}
//               </span>
//             </div>
//           </div>

//           {/* Price */}
//           <div>
//             <label className="block text-sm font-medium mb-2">
//               Giá vận chuyển nội địa <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 inputMode="numeric"
//                 value={formatNumber(priceShipDos)}
//                 onChange={handlePriceChange}
//                 disabled={isCreating}
//                 className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none ${
//                   priceError
//                     ? "border-red-400 focus:border-red-500"
//                     : "border-gray-300 focus:border-blue-500"
//                 }`}
//                 placeholder="0"
//               />
//             </div>
//             {/* {priceError && (
//               <p className="text-xs text-red-600 mt-1">{priceError}</p>
//             )} */}
//           </div>

//           {/* Voucher */}
//           {accountId && (
//             <CustomerVoucherPayment
//               accountId={accountId}
//               disabled={isCreating}
//               value={customerVoucherId}
//               onChange={setCustomerVoucherId}
//               onLoadingChange={setVoucherLoading}
//               onVouchersChange={handleVouchersChange}
//               cachedVouchers={cachedVouchers}
//               initialLoading={vouchersLoading}
//             />
//           )}

//           {/* Bank */}
//           <BankShipList
//             disabled={isCreating}
//             value={bankId}
//             onChange={setBankId}
//             onLoadingChange={setBankLoading}
//             autoSelectFirst
//             cachedAccounts={cachedBankAccounts}
//             initialLoading={bankAccountsLoading}
//           />

//           {/* Balance */}
//           <label className="flex items-center gap-3 border p-3 rounded-lg">
//             <input
//               type="checkbox"
//               checked={isUseBalance}
//               onChange={(e) => setIsUseBalance(e.target.checked)}
//             />
//             <span>Dùng số dư tài khoản</span>
//           </label>
//         </div>

//         {/* Footer */}
//         <div className="px-4 sm:px-6 py-3 border-t bg-gray-50 flex gap-3">
//           <button
//             onClick={onClose}
//             disabled={isCreating}
//             className="flex-1 border rounded-lg py-2"
//           >
//             Hủy
//           </button>
//           <button
//             disabled={confirmDisabled}
//             onClick={() =>
//               onConfirm({
//                 customerVoucherId: customerVoucherId ?? null,
//                 isUseBalance,
//                 bankId,
//                 priceShipDos, // ⭐ NUMBER THUẦN
//               })
//             }
//             className="flex-1 bg-blue-600 text-white rounded-lg py-2 disabled:bg-gray-400"
//           >
//             {isCreating ? "Đang tạo..." : "Xác nhận"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ================= MAIN BUTTON ================= */
// const CreateDividePaymentShip = ({
//   selectedShipmentCodes,
//   totalAmount,
//   formatCurrency,
//   onSuccess,
//   onError,
//   disabled = false,
//   accountId,
//   cachedBankAccounts = [],
//   bankAccountsLoading = false,
//   cachedVouchers = [],
//   vouchersLoading = false,
// }) => {
//   const [showConfigModal, setShowConfigModal] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [paymentResponse, setPaymentResponse] = useState(null);

//   const openModal = () => {
//     if (!selectedShipmentCodes || selectedShipmentCodes.length < 1) {
//       toast.error("Vui lòng chọn ít nhất 1 tracking để tách đơn");
//       return;
//     }
//     setShowConfigModal(true);
//   };

//   const handleConfirmDividePayment = async (payload) => {
//     setShowConfigModal(false);
//     try {
//       setIsCreating(true);
//       const res = await createPaymentShipService.createPartialShipment(
//         payload.isUseBalance,
//         payload.bankId,
//         payload.customerVoucherId,
//         payload.priceShipDos,
//         selectedShipmentCodes
//       );

//       // Hiển thị toast ngắn gọn
//       toast.success("Tạo thanh toán thành công!");

//       // Lưu response và hiển thị modal chi tiết
//       setPaymentResponse(res);
//       setShowSuccessModal(true);

//       onSuccess?.(res);
//     } catch (err) {
//       toast.error(getErrorMessage(err));
//       onError?.(err);
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   const handleCloseSuccessModal = () => {
//     setShowSuccessModal(false);
//     setPaymentResponse(null);
//   };

//   return (
//     <>
//       <button
//         onClick={openModal}
//         disabled={disabled || isCreating}
//         className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
//       >
//         {isCreating ? "Đang tạo..." : "Tạo thanh toán"}
//       </button>

//       <DividePaymentShipConfigModal
//         isOpen={showConfigModal}
//         onClose={() => !isCreating && setShowConfigModal(false)}
//         onConfirm={handleConfirmDividePayment}
//         selectedCount={selectedShipmentCodes?.length || 0}
//         totalAmount={totalAmount || 0}
//         formatCurrency={formatCurrency}
//         isCreating={isCreating}
//         accountId={accountId}
//         cachedBankAccounts={cachedBankAccounts}
//         bankAccountsLoading={bankAccountsLoading}
//         cachedVouchers={cachedVouchers}
//         vouchersLoading={vouchersLoading}
//       />

//       <PaymentSuccessModal
//         isOpen={showSuccessModal}
//         onClose={handleCloseSuccessModal}
//         paymentData={paymentResponse}
//       />
//     </>
//   );
// };

// export default CreateDividePaymentShip;

// src/Components/Payment/CreateDividePaymentShip.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { X, DollarSign, Copy } from "lucide-react";
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

/** "12,300" -> 12300  | "" -> null */
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

/* ================= SUCCESS MODAL (clean QR) ================= */
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
  const statusTone =
    data?.status === "DA_THANH_TOAN"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : data?.status === "HUY"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : "bg-yellow-50 text-yellow-700 ring-yellow-200";

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
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-5 py-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-gray-500">Mã thanh toán</div>
              <div className="mt-1 flex items-center gap-2">
                <div className="text-lg font-bold text-gray-900 truncate">
                  {paymentCode}
                </div>
                <button
                  onClick={() => copyToClipboard(paymentCode, "Đã copy mã")}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-sm text-blue-700 hover:bg-blue-50"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-700">
              Số tiền:{" "}
              <span className="font-semibold text-gray-900">
                {formatVnd(data?.amount)}
              </span>
            </span>

            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${statusTone}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="px-5 py-5 overflow-y-auto">
          {qr ? (
            <>
              {!qrBroken ? (
                <img
                  src={qr}
                  alt="QR Code"
                  className="mx-auto w-72 max-w-full rounded-2xl border bg-white"
                  loading="lazy"
                  onError={() => setQrBroken(true)}
                />
              ) : (
                <div className="mx-auto w-72 max-w-full rounded-2xl border bg-gray-50 p-6 text-center text-sm text-gray-600">
                  Không tải được QR (link không phải ảnh hoặc bị lỗi).
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-3">
                <a
                  href={qr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Mở QR
                </a>

                <button
                  onClick={() => copyToClipboard(qr, "Đã copy link QR")}
                  className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                  Copy link QR
                </button>
              </div>

              {(data?.content || data?.actionAt) && (
                <div className="mt-5 rounded-xl border bg-gray-50 p-4 space-y-2">
                  {data?.actionAt && (
                    <div className="text-sm text-gray-700">
                      Thời gian:{" "}
                      <span className="font-medium text-gray-900">
                        {formatTimeVN(data?.actionAt)}
                      </span>
                    </div>
                  )}

                  {data?.content && (
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-medium text-gray-600">
                          Nội dung thanh toán
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(data.content, "Đã copy nội dung")
                          }
                          className="text-xs font-medium text-blue-700 hover:underline"
                        >
                          Copy
                        </button>
                      </div>

                      <div className="mt-2 text-sm text-gray-800 bg-white border rounded-lg p-3 whitespace-pre-wrap break-words">
                        {data.content}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-sm text-gray-600">
              Không có QR trong dữ liệu trả về.
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full rounded-xl py-2.5 font-medium bg-gray-900 text-white hover:bg-black"
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

  // ✅ input dạng string để không giật cursor
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
    // muốn reset mỗi lần mở:
    // setPriceInput("");
  }, [isOpen]);

  const priceShipDos = useMemo(() => parseMoneyInput(priceInput), [priceInput]);

  const confirmDisabled =
    isCreating ||
    bankLoading ||
    voucherLoading ||
    !bankId ||
    priceShipDos == null ||
    Number.isNaN(priceShipDos) ||
    Number(priceShipDos) <= 0 ||
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
      setPriceError("Giá vận chuyển phải > 0");
      return;
    }
    setPriceError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[95vh] overflow-hidden flex flex-col">
        <div className="px-4 sm:px-6 py-4 border-b bg-white flex justify-between items-center">
          <h3 className="text-lg font-semibold">Tạo thanh toán tách đơn</h3>
          <button
            onClick={onClose}
            disabled={isCreating}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex justify-between mb-2 text-sm text-gray-700">
              <span>Số đơn đã chọn</span>
              <span className="font-bold text-gray-900">{selectedCount}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-blue-200 text-sm text-gray-700">
              <span>Tổng phí ước tính</span>
              <span className="font-bold text-blue-600">
                {formatVnd(totalAmount || 0)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Giá vận chuyển nội địa <span className="text-red-500">*</span>
            </label>
            <div>
              <input
                type="text"
                inputMode="numeric"
                value={priceInput}
                onChange={handlePriceChange}
                disabled={isCreating}
                className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-left ${
                  priceError
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                placeholder="0"
              />
            </div>
            {priceError && (
              <p className="text-xs text-red-600 mt-1">{priceError}</p>
            )}
          </div>

          {accountId && (
            <CustomerVoucherPayment
              accountId={accountId}
              disabled={isCreating}
              value={customerVoucherId}
              onChange={setCustomerVoucherId}
              onLoadingChange={setVoucherLoading}
              cachedVouchers={cachedVouchers}
              initialLoading={vouchersLoading}
            />
          )}

          <BankShipList
            disabled={isCreating}
            value={bankId}
            onChange={setBankId}
            onLoadingChange={setBankLoading}
            autoSelectFirst
            cachedAccounts={cachedBankAccounts}
            initialLoading={bankAccountsLoading}
          />

          <label className="flex items-center gap-3 border p-3 rounded-xl">
            <input
              type="checkbox"
              checked={isUseBalance}
              onChange={(e) => setIsUseBalance(e.target.checked)}
            />
            <span className="text-sm text-gray-800">Dùng số dư tài khoản</span>
          </label>
        </div>

        <div className="px-4 sm:px-6 py-3 border-t bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="flex-1 border rounded-xl py-2 hover:bg-white disabled:opacity-60"
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
            className="flex-1 bg-blue-600 text-white rounded-xl py-2 disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
          >
            {isCreating ? "Đang tạo..." : "Xác nhận"}
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
  formatCurrency, // giữ prop để tương thích (không bắt buộc dùng)
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

  // ✅ Defer refresh tới lúc đóng modal success
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
      if (!payload?.priceShipDos || Number(payload.priceShipDos) <= 0) {
        toast.error("Vui lòng nhập giá vận chuyển nội địa hợp lệ");
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
        toast.success("Tạo thanh toán thành công!");

        // defer refresh
        setPendingAfterClose(() => () => onSuccess?.(data));
      } catch (err) {
        toast.error(getErrorMessage(err));
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
        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {isCreating ? "Đang tạo..." : "Tạo thanh toán"}
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
