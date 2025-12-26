// // src/Components/Payment/CreateDividePaymentShip.jsx
// import React, { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import { X, Info, Scissors } from "lucide-react";
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
//       } else if (Array.isArray(be)) return be.join(", ");
//       return be;
//     }
//     return `Lỗi ${error.response.status}: ${
//       error.response.statusText || "Không xác định"
//     }`;
//   } else if (error?.request) return "Không thể kết nối tới server.";
//   return error?.message || "Đã xảy ra lỗi không xác định";
// };

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
//   cachedVouchers = [], // ✅ THÊM
//   vouchersLoading = false, // ✅ THÊM
// }) => {
//   const [customerVoucherId, setCustomerVoucherId] = useState(null);
//   const [isUseBalance, setIsUseBalance] = useState(true);
//   const [voucherLoading, setVoucherLoading] = useState(false);
//   const [availableVouchers, setAvailableVouchers] = useState([]);

//   const [bankId, setBankId] = useState(null);
//   const [bankLoading, setBankLoading] = useState(false);

//   const [priceShipDos, setPriceShipDos] = useState("");
//   const [priceError, setPriceError] = useState("");

//   // Auto-set bank đầu tiên khi có cached data
//   useEffect(() => {
//     if (
//       cachedBankAccounts &&
//       cachedBankAccounts.length > 0 &&
//       !bankId &&
//       isOpen
//     ) {
//       setBankId(String(cachedBankAccounts[0].id));
//     }
//   }, [cachedBankAccounts, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

//   const handlePriceChange = (e) => {
//     let value = e.target.value;

//     if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
//       return;
//     }

//     setPriceShipDos(value);

//     if (value === "") {
//       setPriceError("Giá ship là bắt buộc");
//       return;
//     }

//     if (value === ".") {
//       setPriceError("Vui lòng nhập số hợp lệ");
//       return;
//     }

//     const num = parseFloat(value);
//     if (isNaN(num)) {
//       setPriceError("Vui lòng nhập số hợp lệ");
//     } else if (num < 0) {
//       setPriceError("Giá không được âm");
//     } else if (num === 0) {
//       setPriceError("Giá phải lớn hơn 0");
//     } else {
//       setPriceError("");
//     }
//   };

//   const handleVouchersChange = (vouchers) => {
//     setAvailableVouchers(vouchers || []);
//   };

//   const confirmDisabled =
//     isCreating ||
//     (Boolean(accountId) && voucherLoading) ||
//     bankLoading ||
//     !bankId ||
//     !priceShipDos ||
//     priceError !== "" ||
//     isNaN(parseFloat(priceShipDos)) ||
//     parseFloat(priceShipDos) <= 0;

//   const hasVouchers = availableVouchers.length > 0;

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-gray-900">
//               Tạo thanh toán vận chuyển (tách đơn)
//             </h3>
//             <button
//               onClick={onClose}
//               disabled={isCreating}
//               className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
//               aria-label="Đóng"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="px-6 py-4">
//           {/* Info */}
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//             <div className="text-sm text-blue-800">
//               <div className="flex items-center mb-2">
//                 <p className="font-semibold">
//                   Bạn đã chọn {selectedCount} đơn hàng
//                 </p>
//               </div>
//               <p className="flex items-center">
//                 Tổng phí ước tính: {formatCurrency(totalAmount)}
//               </p>
//             </div>
//           </div>

//           {/* Input Giá ship DOS */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Giá vận chuyển nội địa <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={priceShipDos}
//               onChange={handlePriceChange}
//               disabled={isCreating}
//               placeholder="0000"
//               className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
//                 priceError
//                   ? "border-red-300 focus:ring-red-500"
//                   : "border-gray-300 focus:ring-blue-500"
//               }`}
//             />
//             {priceError && (
//               <p className="text-xs text-red-600 mt-1">{priceError}</p>
//             )}
//           </div>

//           {/* Voucher */}
//           {Boolean(accountId) && (
//             <>
//               <CustomerVoucherPayment
//                 accountId={accountId}
//                 disabled={isCreating || !hasVouchers}
//                 value={customerVoucherId}
//                 onChange={setCustomerVoucherId}
//                 className="mb-4"
//                 onLoadingChange={setVoucherLoading}
//                 onVouchersChange={handleVouchersChange}
//                 cachedVouchers={cachedVouchers} // ✅ THÊM
//                 initialLoading={vouchersLoading} // ✅ THÊM
//               />
//               {voucherLoading && (
//                 <div className="text-xs text-gray-500 -mt-2 mb-2">
//                   Đang tảivoucher...
//                 </div>
//               )}
//             </>
//           )}
//           {/* Bank */}
//           <BankShipList
//             disabled={isCreating}
//             value={bankId}
//             onChange={setBankId}
//             className="mb-4"
//             label="Chọn tài khoản nhận cước "
//             onLoadingChange={setBankLoading}
//             onAccountsChange={() => {}}
//             autoSelectFirst={true}
//             cachedAccounts={cachedBankAccounts}
//             initialLoading={bankAccountsLoading}
//           />

//           {/* Checkbox dùng số dư */}
//           <div className="mb-4">
//             <label className="flex items-center space-x-3 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={isUseBalance}
//                 onChange={(e) => setIsUseBalance(e.target.checked)}
//                 disabled={isCreating}
//                 className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
//               />
//               <div>
//                 <span className="text-sm font-medium text-gray-700">
//                   Sử dụng số dư tài khoản
//                 </span>
//               </div>
//             </label>
//           </div>

//           {/* Summary */}
//           <div className="border-t pt-4">
//             <h4 className="text-sm font-semibold text-gray-700 mb-2">
//               Xác nhận:
//             </h4>
//             <div className="space-y-1 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Giá vận chuyển nội địa:</span>
//                 <span className="font-medium">
//                   {priceShipDos && !isNaN(parseFloat(priceShipDos))
//                     ? formatCurrency(parseFloat(priceShipDos))
//                     : "Chưa nhập"}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Tổng phí ước tính:</span>
//                 <span className="font-medium">
//                   {formatCurrency(totalAmount)}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Voucher áp dụng:</span>
//                 <span className="font-medium">
//                   {customerVoucherId ? "Có" : "Không"}
//                 </span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="text-gray-600">Sử dụng số dư:</span>
//                 <span className="font-medium">
//                   {isUseBalance ? "Có" : "Không"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white">
//           <button
//             onClick={onClose}
//             disabled={isCreating}
//             className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
//           >
//             Hủy
//           </button>
//           <button
//             onClick={() =>
//               !confirmDisabled &&
//               onConfirm({
//                 customerVoucherId: customerVoucherId ?? null,
//                 isUseBalance,
//                 bankId,
//                 priceShipDos: parseFloat(priceShipDos),
//               })
//             }
//             disabled={confirmDisabled}
//             className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//             title={
//               confirmDisabled
//                 ? !priceShipDos
//                   ? "Vui lòng nhập giá ship DOS"
//                   : priceError
//                   ? priceError
//                   : bankLoading
//                   ? "Đang tải tài khoản ngân hàng…"
//                   : !bankId
//                   ? "Vui lòng chọn tài khoản nhận cước"
//                   : "Vui lòng điền đầy đủ thông tin"
//                 : "Xác nhận tạo thanh toán tách đơn"
//             }
//           >
//             {isCreating ? "Đang tạo..." : "Xác nhận tạo thanh toán"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
// // ========== Main Button Component ==========
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
//   cachedVouchers = [], // ✅ THÊM
//   vouchersLoading = false, // ✅ THÊM
// }) => {
//   const [showConfigModal, setShowConfigModal] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const openModal = () => {
//     if (!selectedShipmentCodes || selectedShipmentCodes.length < 1) {
//       toast.error("Vui lòng chọn ít nhất 1 tracking để tách đơn");
//       return;
//     }
//     setShowConfigModal(true);
//   };
//   const closeModal = () => {
//     if (!isCreating) setShowConfigModal(false);
//   };
//   const handleConfirmDividePayment = async ({
//     customerVoucherId,
//     isUseBalance,
//     bankId,
//     priceShipDos,
//   }) => {
//     setShowConfigModal(false);
//     try {
//       setIsCreating(true);
//       const result = await createPaymentShipService.createPartialShipment(
//         isUseBalance,
//         bankId,
//         customerVoucherId ?? null,
//         priceShipDos,
//         selectedShipmentCodes
//       );

//       toast.success(
//         `Tạo thanh toán tách đơn thành công! Mã: ${
//           result?.paymentCode || result?.id || "N/A"
//         }`
//       );
//       onSuccess?.(result);
//     } catch (error) {
//       const msg = getErrorMessage(error);
//       toast.error(`Không thể tạo thanh toán tách đơn: ${msg}`, {
//         duration: 5000,
//       });
//       onError?.(error);
//     } finally {
//       setIsCreating(false);
//     }
//   };
//   const buttonDisabled =
//     disabled ||
//     isCreating ||
//     !selectedShipmentCodes ||
//     selectedShipmentCodes.length < 1;
//   return (
//     <>
//       <button
//         onClick={openModal}
//         disabled={buttonDisabled}
//         className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
//         title={
//           buttonDisabled
//             ? "Hãy chọn ít nhất một tracking để tách đơn"
//             : "Tạo thanh toán vận chuyển (tách đơn)"
//         }
//       >
//         {isCreating ? (
//           <>
//             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//             Đang tạo...
//           </>
//         ) : (
//           <>
//             <Scissors className="w-4 h-4 mr-2" />
//             Tạo thanh toán tách đơn
//           </>
//         )}
//       </button>
//       <DividePaymentShipConfigModal
//         isOpen={showConfigModal}
//         onClose={closeModal}
//         onConfirm={handleConfirmDividePayment}
//         selectedCount={selectedShipmentCodes?.length || 0}
//         totalAmount={totalAmount || 0}
//         formatCurrency={formatCurrency || ((v) => v)}
//         isCreating={isCreating}
//         accountId={accountId}
//         cachedBankAccounts={cachedBankAccounts}
//         bankAccountsLoading={bankAccountsLoading}
//         cachedVouchers={cachedVouchers} // ✅ THÊM
//         vouchersLoading={vouchersLoading} // ✅ THÊM
//       />
//     </>
//   );
// };
// export default CreateDividePaymentShip;

// src/Components/Payment/CreateDividePaymentShip.jsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, DollarSign, CreditCard, Tag } from "lucide-react";
import createPaymentShipService from "../../Services/Payment/createPaymentShipService";
import CustomerVoucherPayment from "./CustomerVoucherPayment";
import BankShipList from "./BankShipList";

/** Helper: bóc tách lỗi backend */
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
      } else if (Array.isArray(be)) return be.join(", ");
      return be;
    }
    return `Lỗi ${error.response.status}: ${
      error.response.statusText || "Không xác định"
    }`;
  } else if (error?.request) return "Không thể kết nối tới server.";
  return error?.message || "Đã xảy ra lỗi không xác định";
};

const DividePaymentShipConfigModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  totalAmount,
  formatCurrency,
  isCreating,
  accountId,
  cachedBankAccounts = [],
  bankAccountsLoading = false,
  cachedVouchers = [],
  vouchersLoading = false,
}) => {
  const [customerVoucherId, setCustomerVoucherId] = useState(null);
  const [isUseBalance, setIsUseBalance] = useState(true);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState([]);

  const [bankId, setBankId] = useState(null);
  const [bankLoading, setBankLoading] = useState(false);

  const [priceShipDos, setPriceShipDos] = useState("");
  const [priceError, setPriceError] = useState("");

  // Auto-set bank đầu tiên
  useEffect(() => {
    if (
      cachedBankAccounts &&
      cachedBankAccounts.length > 0 &&
      !bankId &&
      isOpen
    ) {
      setBankId(String(cachedBankAccounts[0].id));
    }
  }, [cachedBankAccounts, isOpen]);

  // Format number với dấu phẩy
  const formatNumber = (val) => {
    if (!val) return "";
    const clean = val.toString().replace(/[^\d]/g, "");
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Parse number (loại bỏ dấu phẩy)
  const parseNumber = (val) => val.replace(/,/g, "");

  const handlePriceChange = (e) => {
    let value = e.target.value;

    // Chỉ cho phép số và dấu phẩy
    if (value !== "" && !/^[\d,]*$/.test(value)) {
      return;
    }

    // Loại bỏ dấu phẩy để validate
    const rawValue = value.replace(/,/g, "");

    if (rawValue === "") {
      setPriceShipDos("");
      setPriceError("Giá ship là bắt buộc");
      return;
    }

    // Format với dấu phẩy
    const formatted = formatNumber(rawValue);
    setPriceShipDos(formatted);

    // Validate
    const num = parseFloat(rawValue);
    if (isNaN(num)) {
      setPriceError("Vui lòng nhập số hợp lệ");
    } else if (num < 0) {
      setPriceError("Giá không được âm");
    } else if (num === 0) {
      setPriceError("Giá phải lớn hơn 0");
    } else {
      setPriceError("");
    }
  };

  const handleVouchersChange = (vouchers) => {
    setAvailableVouchers(vouchers || []);
  };

  const confirmDisabled =
    isCreating ||
    (Boolean(accountId) && voucherLoading) ||
    bankLoading ||
    !bankId ||
    !priceShipDos ||
    priceError !== "" ||
    isNaN(parseFloat(parseNumber(priceShipDos))) ||
    parseFloat(parseNumber(priceShipDos)) <= 0;

  const hasVouchers = availableVouchers.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Tạo thanh toán tách đơn
            </h3>
            <button
              onClick={onClose}
              disabled={isCreating}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-5">
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-700">Số đơn đã chọn</span>
              <span className="text-xl font-bold text-gray-900">
                {selectedCount}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-blue-200">
              <span className="text-sm text-gray-700">Tổng phí ước tính</span>
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Giá ship DOS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá vận chuyển nội địa <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={priceShipDos}
                onChange={handlePriceChange}
                disabled={isCreating}
                placeholder="000"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  priceError
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
            </div>
          </div>

          {/* Voucher */}
          {Boolean(accountId) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voucher giảm giá
                {!hasVouchers && (
                  <span className="text-xs text-gray-500 ml-1">(Không có)</span>
                )}
              </label>
              <CustomerVoucherPayment
                accountId={accountId}
                disabled={isCreating || !hasVouchers}
                value={customerVoucherId}
                onChange={setCustomerVoucherId}
                onLoadingChange={setVoucherLoading}
                onVouchersChange={handleVouchersChange}
                cachedVouchers={cachedVouchers}
                initialLoading={vouchersLoading}
              />
              {voucherLoading && (
                <p className="text-xs text-gray-500 mt-1">
                  Đang tải voucher...
                </p>
              )}
            </div>
          )}

          {/* Bank */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tài khoản nhận cước <span className="text-red-500">*</span>
            </label>
            <BankShipList
              disabled={isCreating}
              value={bankId}
              onChange={setBankId}
              onLoadingChange={setBankLoading}
              onAccountsChange={() => {}}
              autoSelectFirst={true}
              cachedAccounts={cachedBankAccounts}
              initialLoading={bankAccountsLoading}
            />
            {bankLoading && (
              <p className="text-xs text-gray-500 mt-1">
                Đang tải tài khoản...
              </p>
            )}
          </div>

          {/* Checkbox dùng số dư */}
          <div className="border border-gray-200 rounded-lg p-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isUseBalance}
                onChange={(e) => setIsUseBalance(e.target.checked)}
                disabled={isCreating}
                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Sử dụng số dư tài khoản
                </span>
              </div>
            </label>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Thông tin thanh toán
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Giá vận chuyển:</span>
                <span className="font-semibold text-gray-900">
                  {priceShipDos && !isNaN(parseFloat(parseNumber(priceShipDos)))
                    ? formatCurrency(parseFloat(parseNumber(priceShipDos)))
                    : "Chưa nhập"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng phí ước tính:</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Voucher:</span>
                <span className="font-medium text-gray-900">
                  {customerVoucherId ? "Đã chọn" : "Không"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dùng số dư:</span>
                <span className="font-medium text-gray-900">
                  {isUseBalance ? "Có" : "Không"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Sticky */}
        <div className="px-4 sm:px-6 py-3 border-t bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={() =>
                !confirmDisabled &&
                onConfirm({
                  customerVoucherId: customerVoucherId ?? null,
                  isUseBalance,
                  bankId,
                  priceShipDos: parseFloat(parseNumber(priceShipDos)),
                })
              }
              disabled={confirmDisabled}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang tạo...
                </span>
              ) : (
                "Xác nhận"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== Main Button Component ==========
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

  const openModal = () => {
    if (!selectedShipmentCodes || selectedShipmentCodes.length < 1) {
      toast.error("Vui lòng chọn ít nhất 1 tracking để tách đơn");
      return;
    }
    setShowConfigModal(true);
  };

  const closeModal = () => {
    if (!isCreating) setShowConfigModal(false);
  };

  const handleConfirmDividePayment = async ({
    customerVoucherId,
    isUseBalance,
    bankId,
    priceShipDos,
  }) => {
    setShowConfigModal(false);
    try {
      setIsCreating(true);
      const result = await createPaymentShipService.createPartialShipment(
        isUseBalance,
        bankId,
        customerVoucherId ?? null,
        priceShipDos,
        selectedShipmentCodes
      );

      toast.success(
        `Tạo thanh toán tách đơn thành công! Mã: ${
          result?.paymentCode || result?.id || "N/A"
        }`
      );
      onSuccess?.(result);
    } catch (error) {
      const msg = getErrorMessage(error);
      toast.error(`Không thể tạo thanh toán tách đơn: ${msg}`, {
        duration: 5000,
      });
      onError?.(error);
    } finally {
      setIsCreating(false);
    }
  };

  const buttonDisabled =
    disabled ||
    isCreating ||
    !selectedShipmentCodes ||
    selectedShipmentCodes.length < 1;

  return (
    <>
      <button
        onClick={openModal}
        disabled={buttonDisabled}
        className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {isCreating ? (
          <span className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span className="hidden sm:inline">Đang tạo...</span>
          </span>
        ) : (
          <span>Tạo thanh toán</span>
        )}
      </button>

      <DividePaymentShipConfigModal
        isOpen={showConfigModal}
        onClose={closeModal}
        onConfirm={handleConfirmDividePayment}
        selectedCount={selectedShipmentCodes?.length || 0}
        totalAmount={totalAmount || 0}
        formatCurrency={formatCurrency || ((v) => v)}
        isCreating={isCreating}
        accountId={accountId}
        cachedBankAccounts={cachedBankAccounts}
        bankAccountsLoading={bankAccountsLoading}
        cachedVouchers={cachedVouchers}
        vouchersLoading={vouchersLoading}
      />
    </>
  );
};

export default CreateDividePaymentShip;
