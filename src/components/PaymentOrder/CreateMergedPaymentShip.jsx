// // src/Components/Payment/CreateMergedPaymentShip.jsx
// import React, { useState } from "react";
// import toast from "react-hot-toast";
// import { X, Info, Truck } from "lucide-react";
// import createPaymentShipService from "../../Services/Payment/createPaymentShipService";
// import CustomerVoucherPayment from "./CustomerVoucherPayment";
// import BankShipList from "./BankShipList";

// /** Helper: Bóc tách lỗi backend để hiện toast dễ hiểu */
// const getErrorMessage = (error) => {
//   if (error?.response) {
//     const backendError =
//       error.response.data?.error ||
//       error.response.data?.message ||
//       error.response.data?.detail ||
//       error.response.data?.errors;

//     if (backendError) {
//       if (typeof backendError === "object" && !Array.isArray(backendError)) {
//         const errorMessages = Object.entries(backendError)
//           .map(([field, msg]) => `${field}: ${msg}`)
//           .join(", ");
//         return `Lỗi validation: ${errorMessages}`;
//       } else if (Array.isArray(backendError)) {
//         return backendError.join(", ");
//       } else {
//         return backendError;
//       }
//     }
//     return `Lỗi ${error.response.status}: ${
//       error.response.statusText || "Không xác định"
//     }`;
//   } else if (error?.request) {
//     return "Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.";
//   }
//   return error?.message || "Đã xảy ra lỗi không xác định";
// };

// /* =========================
//  * Modal cấu hình tạo thanh toán ship (gộp)
//  * ========================= */
// const MergedPaymentShipConfigModal = ({
//   isOpen,
//   onClose,
//   onConfirm,
//   selectedCount,
//   totalAmount,
//   formatCurrency,
//   isCreating,
//   accountId, // nhận từ cha để show voucher theo account
// }) => {
//   const [customerVoucherId, setCustomerVoucherId] = useState(null);
//   const [isUseBalance, setIsUseBalance] = useState(true);

//   // 🔹 Theo dõi trạng thái tải voucher từ component con
//   const [voucherLoading, setVoucherLoading] = useState(false);

//   // 🔹 NEW: chọn ngân hàng để thanh toán (Revenue)
//   const [bankId, setBankId] = useState(null);
//   const [bankLoading, setBankLoading] = useState(false);

//   const handleSubmit = () => {
//     // Bắt buộc phải chọn bank
//     if (!bankId) return;
//     onConfirm(customerVoucherId ?? null, isUseBalance, bankId);
//   };

//   if (!isOpen) return null;

//   const confirmDisabled =
//     isCreating ||
//     (Boolean(accountId) && voucherLoading) ||
//     bankLoading ||
//     !bankId; // ⬅️ cần có bankId mới cho confirm

//   return (
//     <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
//         {/* Header */}
//         <div className="px-6 py-4 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-gray-900">
//               Thanh toán vận chuyển
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
//           {/* Thông tin tổng quan */}
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//             <div className="flex items-start">
//               <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
//               <div className="text-sm text-blue-800">
//                 <p className="font-semibold mb-1">
//                   Bạn đã chọn {selectedCount} đơn hàng vận chuyển
//                 </p>
//                 <p>Tổng phí vận chuyển: {formatCurrency(totalAmount)}</p>
//               </div>
//             </div>
//           </div>

//           {/* Voucher theo account */}
//           <CustomerVoucherPayment
//             accountId={accountId}
//             disabled={isCreating}
//             value={customerVoucherId}
//             onChange={setCustomerVoucherId}
//             className="mb-4"
//             onLoadingChange={setVoucherLoading}
//           />

//           {Boolean(accountId) && voucherLoading && (
//             <div className="text-xs text-gray-500 -mt-2 mb-2">
//               Đang tải voucher... vui lòng chờ.
//             </div>
//           )}

//           {/* NEW: Chọn tài khoản ngân hàng (Revenue) */}
//           <BankShipList
//             disabled={isCreating}
//             value={bankId}
//             onChange={setBankId}
//             className="mb-4"
//             label="Chọn tài khoản nhận cước (bắt buộc)"
//             onLoadingChange={setBankLoading}
//             onAccountsChange={() => {}}
//           />
//           {!bankId && (
//             <div className="text-xs text-amber-600 -mt-3 mb-3">
//               Vui lòng chọn tài khoản nhận cước để tiếp tục.
//             </div>
//           )}

//           {/* Checkbox dùng số dư */}
//           <div className="mb-4">
//             <label className="flex items-center space-x-3 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={isUseBalance}
//                 onChange={(e) => setIsUseBalance(e.target.checked)}
//                 disabled={isCreating}
//                 className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//               />
//               <div>
//                 <span className="text-sm font-medium text-gray-700">
//                   Sử dụng số dư tài khoản
//                 </span>
//                 <p className="text-xs text-gray-500 mt-0.5">
//                   Sử dụng số dư có sẵn trong tài khoản để thanh toán
//                 </p>
//               </div>
//             </label>
//           </div>

//           {/* Summary */}
//           <div className="border-t pt-4">
//             <h4 className="text-sm font-semibold text-gray-700 mb-2">
//               Xác nhận đơn hàng:
//             </h4>
//             <div className="space-y-1 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Số đơn hàng:</span>
//                 <span className="font-medium">{selectedCount}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Tổng phí vận chuyển:</span>
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
//                 <span className="text-gray-600">Tài khoản nhận cước:</span>
//                 <span className="font-medium">
//                   {bankId ? "Đã chọn" : "Chưa chọn"}
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
//         <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
//           <button
//             onClick={onClose}
//             disabled={isCreating}
//             className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Hủy
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={confirmDisabled}
//             className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
//             title={
//               confirmDisabled
//                 ? bankLoading
//                   ? "Đang tải tài khoản ngân hàng…"
//                   : voucherLoading
//                   ? "Đang tải voucher…"
//                   : !bankId
//                   ? "Vui lòng chọn tài khoản nhận cước"
//                   : "Không thể xác nhận lúc này"
//                 : "Xác nhận tạo thanh toán"
//             }
//           >
//             {isCreating ? (
//               <>
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                 Đang tạo...
//               </>
//             ) : (
//               "Xác nhận tạo thanh toán"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* =========================
//  * Nút/Tác vụ tạo thanh toán ship (gộp)
//  * ========================= */
// const CreateMergedPaymentShip = ({
//   selectedOrders, // mảng orderCode
//   totalAmount,
//   formatCurrency,
//   onSuccess,
//   onError,
//   disabled = false,
//   accountId, // nhận từ cha để show voucher theo account
// }) => {
//   const [showConfigModal, setShowConfigModal] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);

//   const openModal = () => {
//     if (!selectedOrders || selectedOrders.length < 1) {
//       toast.error("Vui lòng chọn ít nhất 1 đơn hàng để tạo thanh toán");
//       return;
//     }
//     setShowConfigModal(true);
//   };

//   const closeModal = () => {
//     if (!isCreating) setShowConfigModal(false);
//   };

//   // Xác nhận từ modal: gọi API tạo thanh toán
//   const handleConfirmMergedPayment = async (
//     customerVoucherId, // number|string|null
//     isUseBalance,
//     bankId // ⬅️ NEW
//   ) => {
//     setShowConfigModal(false);

//     try {
//       setIsCreating(true);

//       // Gọi API tạo thanh toán ship (gộp) — đã truyền bankId
//       const result = await createPaymentShipService.createPaymentShipping(
//         isUseBalance,
//         customerVoucherId ?? null,
//         bankId,
//         selectedOrders
//       );

//       toast.success(
//         `Tạo thanh toán vận chuyển ${
//           selectedOrders.length > 1 ? "gộp " : ""
//         }thành công! Mã thanh toán: ${
//           result?.paymentCode || result?.id || "N/A"
//         }`
//       );

//       onSuccess?.(result);
//     } catch (error) {
//       const errorMessage = getErrorMessage(error);
//       toast.error(`Không thể tạo thanh toán vận chuyển: ${errorMessage}`, {
//         duration: 5000,
//       });
//       onError?.(error);
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   const buttonDisabled =
//     disabled || isCreating || !selectedOrders || selectedOrders.length < 1;

//   return (
//     <>
//       <button
//         onClick={openModal}
//         disabled={buttonDisabled}
//         className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
//         title={
//           buttonDisabled
//             ? "Hãy chọn ít nhất một đơn để tạo thanh toán"
//             : "Tạo thanh toán vận chuyển"
//         }
//       >
//         {isCreating ? (
//           <>
//             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//             Đang tạo...
//           </>
//         ) : (
//           <>
//             <Truck className="w-4 h-4 mr-2" />
//             {selectedOrders?.length > 1
//               ? "Tạo thanh toán ship gộp"
//               : "Tạo thanh toán ship"}
//           </>
//         )}
//       </button>

//       <MergedPaymentShipConfigModal
//         isOpen={showConfigModal}
//         onClose={closeModal}
//         onConfirm={handleConfirmMergedPayment}
//         selectedCount={selectedOrders?.length || 0}
//         totalAmount={totalAmount || 0}
//         formatCurrency={formatCurrency || ((v) => v)}
//         isCreating={isCreating}
//         accountId={accountId}
//       />
//     </>
//   );
// };

// export default CreateMergedPaymentShip;

// src/Components/Payment/CreateMergedPaymentShip.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import { X, Info, Truck, DollarSign } from "lucide-react";
import createPaymentShipService from "../../Services/Payment/createPaymentShipService";
import CustomerVoucherPayment from "./CustomerVoucherPayment";
import BankShipList from "./BankShipList";

/** Helper: Bóc tách lỗi backend để hiện toast dễ hiểu */
const getErrorMessage = (error) => {
  if (error?.response) {
    const backendError =
      error.response.data?.error ||
      error.response.data?.message ||
      error.response.data?.detail ||
      error.response.data?.errors;

    if (backendError) {
      if (typeof backendError === "object" && !Array.isArray(backendError)) {
        const errorMessages = Object.entries(backendError)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(", ");
        return `Lỗi validation: ${errorMessages}`;
      } else if (Array.isArray(backendError)) {
        return backendError.join(", ");
      } else {
        return backendError;
      }
    }
    return `Lỗi ${error.response.status}: ${
      error.response.statusText || "Không xác định"
    }`;
  } else if (error?.request) {
    return "Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.";
  }
  return error?.message || "Đã xảy ra lỗi không xác định";
};

/* =========================
 * Modal cấu hình tạo thanh toán ship (gộp)
 * ========================= */
const MergedPaymentShipConfigModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  totalAmount,
  formatCurrency,
  isCreating,
  accountId,
}) => {
  const [customerVoucherId, setCustomerVoucherId] = useState(null);
  const [isUseBalance, setIsUseBalance] = useState(true);
  const [priceShipDos, setPriceShipDos] = useState("");

  // 🔹 Theo dõi trạng thái tải voucher từ component con
  const [voucherLoading, setVoucherLoading] = useState(false);

  // 🔹 Chọn ngân hàng để thanh toán (Revenue)
  const [bankId, setBankId] = useState(null);
  const [bankLoading, setBankLoading] = useState(false);

  const handleSubmit = () => {
    // Bắt buộc phải chọn bank
    if (!bankId) {
      toast.error("Vui lòng chọn tài khoản nhận cước");
      return;
    }

    // Validate phí ship nội địa
    const priceShipDosValue = parseFloat(priceShipDos);
    if (!priceShipDos || isNaN(priceShipDosValue) || priceShipDosValue < 0) {
      toast.error("Vui lòng nhập phí ship nội địa hợp lệ (>= 0)");
      return;
    }

    onConfirm(
      customerVoucherId ?? null,
      isUseBalance,
      bankId,
      priceShipDosValue
    );
  };

  // Format số khi nhập - cho phép số thập phân
  const handlePriceShipDosChange = (e) => {
    const value = e.target.value;
    // Cho phép: số, dấu chấm, dấu phẩy (tự động convert sang dấu chấm)
    // Regex: cho phép số nguyên, số thập phân với dấu chấm hoặc phẩy
    const normalizedValue = value.replace(",", "."); // Chuyển dấu phẩy thành dấu chấm

    if (normalizedValue === "" || /^\d*\.?\d{0,2}$/.test(normalizedValue)) {
      setPriceShipDos(normalizedValue);
    }
  };

  if (!isOpen) return null;

  const priceShipDosValue = parseFloat(priceShipDos);
  const isPriceShipDosValid =
    priceShipDos !== "" && !isNaN(priceShipDosValue) && priceShipDosValue >= 0;

  const confirmDisabled =
    isCreating ||
    (Boolean(accountId) && voucherLoading) ||
    bankLoading ||
    !bankId ||
    !isPriceShipDosValid;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Thanh toán vận chuyển
            </h3>
            <button
              onClick={onClose}
              disabled={isCreating}
              className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* Thông tin tổng quan */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">
                  Bạn đã chọn {selectedCount} đơn hàng vận chuyển
                </p>
                <p>Tổng phí vận chuyển: {formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* 🔹 NEW: Nhập phí ship nội địa */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phí ship nội địa (VNĐ) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"></div>
              <input
                type="text"
                value={priceShipDos}
                onChange={handlePriceShipDosChange}
                disabled={isCreating}
                placeholder="000.000"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            {priceShipDos && isPriceShipDosValid && (
              <p className="mt-1 text-xs text-green-600">
                Phí ship: {formatCurrency(priceShipDosValue)}{" "}
                {priceShipDosValue % 1 !== 0 && "(có số lẻ)"}
              </p>
            )}
            {priceShipDos && !isPriceShipDosValid && (
              <p className="mt-1 text-xs text-red-600">
                Vui lòng nhập số tiền hợp lệ (≥ 0)
              </p>
            )}
          </div>

          {/* Voucher theo account */}
          <CustomerVoucherPayment
            accountId={accountId}
            disabled={isCreating}
            value={customerVoucherId}
            onChange={setCustomerVoucherId}
            className="mb-4"
            onLoadingChange={setVoucherLoading}
          />

          {Boolean(accountId) && voucherLoading && (
            <div className="text-xs text-gray-500 -mt-2 mb-2">
              Đang tải voucher... vui lòng chờ.
            </div>
          )}

          {/* Chọn tài khoản ngân hàng (Revenue) */}
          <BankShipList
            disabled={isCreating}
            value={bankId}
            onChange={setBankId}
            className="mb-4"
            label="Chọn tài khoản nhận cước (bắt buộc)"
            onLoadingChange={setBankLoading}
            onAccountsChange={() => {}}
          />
          {!bankId && (
            <div className="text-xs text-amber-600 -mt-3 mb-3">
              Vui lòng chọn tài khoản nhận cước để tiếp tục.
            </div>
          )}

          {/* Checkbox dùng số dư */}
          <div className="mb-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isUseBalance}
                onChange={(e) => setIsUseBalance(e.target.checked)}
                disabled={isCreating}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Sử dụng số dư tài khoản
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Sử dụng số dư có sẵn trong tài khoản để thanh toán
                </p>
              </div>
            </label>
          </div>

          {/* Summary */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Xác nhận đơn hàng:
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Số đơn hàng:</span>
                <span className="font-medium">{selectedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng phí vận chuyển:</span>
                <span className="font-medium">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí ship nội địa:</span>
                <span
                  className={`font-medium ${
                    isPriceShipDosValid ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPriceShipDosValid
                    ? formatCurrency(priceShipDosValue)
                    : "Chưa nhập"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Voucher áp dụng:</span>
                <span className="font-medium">
                  {customerVoucherId ? "Có" : "Không"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tài khoản nhận cước:</span>
                <span className="font-medium">
                  {bankId ? "Đã chọn" : "Chưa chọn"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sử dụng số dư:</span>
                <span className="font-medium">
                  {isUseBalance ? "Có" : "Không"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={confirmDisabled}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            title={
              confirmDisabled
                ? bankLoading
                  ? "Đang tải tài khoản ngân hàng…"
                  : voucherLoading
                  ? "Đang tải voucher…"
                  : !bankId
                  ? "Vui lòng chọn tài khoản nhận cước"
                  : !isPriceShipDosValid
                  ? "Vui lòng nhập phí ship nội địa hợp lệ"
                  : "Không thể xác nhận lúc này"
                : "Xác nhận tạo thanh toán"
            }
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang tạo...
              </>
            ) : (
              "Xác nhận tạo thanh toán"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================
 * Nút/Tác vụ tạo thanh toán ship (gộp)
 * ========================= */
const CreateMergedPaymentShip = ({
  selectedOrders,
  totalAmount,
  formatCurrency,
  onSuccess,
  onError,
  disabled = false,
  accountId,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const openModal = () => {
    if (!selectedOrders || selectedOrders.length < 1) {
      toast.error("Vui lòng chọn ít nhất 1 đơn hàng để tạo thanh toán");
      return;
    }
    setShowConfigModal(true);
  };

  const closeModal = () => {
    if (!isCreating) setShowConfigModal(false);
  };

  const handleConfirmMergedPayment = async (
    customerVoucherId,
    isUseBalance,
    bankId,
    priceShipDos
  ) => {
    setShowConfigModal(false);

    try {
      setIsCreating(true);

      const result = await createPaymentShipService.createPaymentShipping(
        isUseBalance,
        customerVoucherId ?? null,
        bankId,
        priceShipDos,
        selectedOrders
      );

      toast.success(
        `Tạo thanh toán vận chuyển ${
          selectedOrders.length > 1 ? "gộp " : ""
        }thành công! Mã thanh toán: ${
          result?.paymentCode || result?.id || "N/A"
        }`
      );

      onSuccess?.(result);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(`Không thể tạo thanh toán vận chuyển: ${errorMessage}`, {
        duration: 5000,
      });
      onError?.(error);
    } finally {
      setIsCreating(false);
    }
  };

  const buttonDisabled =
    disabled || isCreating || !selectedOrders || selectedOrders.length < 1;

  return (
    <>
      <button
        onClick={openModal}
        disabled={buttonDisabled}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
        title={
          buttonDisabled
            ? "Hãy chọn ít nhất một đơn để tạo thanh toán"
            : "Tạo thanh toán vận chuyển"
        }
      >
        {isCreating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Đang tạo...
          </>
        ) : (
          <>
            <Truck className="w-4 h-4 mr-2" />
            {selectedOrders?.length > 1
              ? "Tạo thanh toán ship gộp"
              : "Tạo thanh toán ship"}
          </>
        )}
      </button>

      <MergedPaymentShipConfigModal
        isOpen={showConfigModal}
        onClose={closeModal}
        onConfirm={handleConfirmMergedPayment}
        selectedCount={selectedOrders?.length || 0}
        totalAmount={totalAmount || 0}
        formatCurrency={formatCurrency || ((v) => v)}
        isCreating={isCreating}
        accountId={accountId}
      />
    </>
  );
};

export default CreateMergedPaymentShip;
