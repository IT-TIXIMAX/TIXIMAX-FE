// // src/Components/Payment/CreateMergedPaymentShip.jsx
// import React, { useState } from "react";
// import toast from "react-hot-toast";
// import { X, Loader2, Truck } from "lucide-react";
// import createPaymentShipService from "../../Services/Payment/createPaymentShipService";
// import CustomerVoucherPayment from "./CustomerVoucherPayment";
// import BankShipList from "./BankShipList";

// /** Helper: Bóc tách lỗi backend */
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

// /* Modal cấu hình tạo thanh toán ship (gộp) */
// const MergedPaymentShipConfigModal = ({
//   isOpen,
//   onClose,
//   onConfirm,
//   selectedCount,
//   totalAmount,
//   formatCurrency,
//   isCreating,
//   accountId,
// }) => {
//   const [customerVoucherId, setCustomerVoucherId] = useState(null);
//   const [isUseBalance, setIsUseBalance] = useState(true);
//   const [priceShipDos, setPriceShipDos] = useState("");

//   const [voucherLoading, setVoucherLoading] = useState(false);
//   const [bankId, setBankId] = useState(null);
//   const [bankLoading, setBankLoading] = useState(false);

//   const handleSubmit = () => {
//     if (!bankId) {
//       toast.error("Vui lòng chọn tài khoản nhận cước");
//       return;
//     }

//     const priceShipDosValue = parseFloat(priceShipDos);
//     if (!priceShipDos || isNaN(priceShipDosValue) || priceShipDosValue < 0) {
//       toast.error("Vui lòng nhập phí ship nội địa hợp lệ (>= 0)");
//       return;
//     }

//     onConfirm(
//       customerVoucherId ?? null,
//       isUseBalance,
//       bankId,
//       priceShipDosValue
//     );
//   };

//   const handlePriceShipDosChange = (e) => {
//     const value = e.target.value;
//     const normalizedValue = value.replace(",", ".");

//     if (normalizedValue === "" || /^\d*\.?\d{0,2}$/.test(normalizedValue)) {
//       setPriceShipDos(normalizedValue);
//     }
//   };

//   const handleClose = () => {
//     if (!isCreating) onClose();
//   };

//   if (!isOpen) return null;

//   const priceShipDosValue = parseFloat(priceShipDos);
//   const isPriceShipDosValid =
//     priceShipDos !== "" && !isNaN(priceShipDosValue) && priceShipDosValue >= 0;

//   const confirmDisabled =
//     isCreating ||
//     (Boolean(accountId) && voucherLoading) ||
//     bankLoading ||
//     !bankId ||
//     !isPriceShipDosValid;

//   return (
//     <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
//         {/* Header - Gradient Blue */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl sticky top-0 z-10">
//           <div className="flex items-center justify-between">
//             <h3 className="text-xl font-semibold text-white">
//               Cấu Hình Thanh Toán Vận Chuyển
//             </h3>
//             <button
//               onClick={handleClose}
//               disabled={isCreating}
//               className="text-white/80 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               type="button"
//               aria-label="Đóng"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="px-6 py-6 space-y-5">
//           {/* Summary Info */}
//           <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className="text-sm text-blue-700 mb-1">Số đơn hàng</p>
//                 <p className="text-2xl font-bold text-blue-900">
//                   {selectedCount}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm text-blue-700 mb-1">
//                   Tổng phí vận chuyển
//                 </p>
//                 <p className="text-xl font-bold text-blue-900">
//                   {formatCurrency?.(totalAmount) ?? totalAmount}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Phí Ship Nội Địa */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-900 mb-2">
//               Phí ship nội địa <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <input
//                 type="text"
//                 value={priceShipDos}
//                 onChange={handlePriceShipDosChange}
//                 disabled={isCreating}
//                 placeholder="Nhập phí ship nội địa (VNĐ)"
//                 className={`w-full px-4 py-2.5 pr-10 border-2 rounded-lg text-lg font-medium transition-all
//                   ${
//                     isCreating
//                       ? "bg-gray-100 cursor-not-allowed"
//                       : "bg-white hover:border-blue-400"
//                   }
//                   ${
//                     priceShipDos && !isPriceShipDosValid
//                       ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
//                       : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   }
//                 `}
//               />
//               <span className="absolute right-4 top-2.5 text-xl font-semibold text-gray-500">
//                 ₫
//               </span>
//             </div>
//             {priceShipDos && isPriceShipDosValid && (
//               <p className="mt-1.5 text-sm font-medium text-green-600">
//                 ✓ {formatCurrency?.(priceShipDosValue) ?? priceShipDosValue}
//                 {priceShipDosValue % 1 !== 0 && " (có số lẻ)"}
//               </p>
//             )}
//             {priceShipDos && !isPriceShipDosValid && (
//               <p className="mt-1.5 text-sm font-medium text-red-600">
//                 Vui lòng nhập số tiền hợp lệ (≥ 0)
//               </p>
//             )}
//           </div>

//           {/* Voucher */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-900 mb-2">
//               Voucher khách hàng
//             </label>
//             <CustomerVoucherPayment
//               accountId={accountId}
//               disabled={isCreating}
//               value={customerVoucherId}
//               onChange={setCustomerVoucherId}
//               onLoadingChange={setVoucherLoading}
//             />
//             {Boolean(accountId) && voucherLoading && (
//               <p className="mt-1.5 text-sm font-medium text-gray-500">
//                 Đang tải voucher...
//               </p>
//             )}
//           </div>

//           {/* Bank Select */}
//           <div>
//             <label className="block text-sm font-semibold text-gray-900 mb-2">
//               Tài khoản nhận cước <span className="text-red-500">*</span>
//             </label>
//             <BankShipList
//               disabled={isCreating}
//               value={bankId}
//               onChange={setBankId}
//               onLoadingChange={setBankLoading}
//               onAccountsChange={() => {}}
//             />
//             {(bankLoading || !bankId) && (
//               <p className="mt-1.5 text-sm font-medium">
//                 {bankLoading ? (
//                   <span className="text-gray-500">
//                     Đang tải tài khoản ngân hàng...
//                   </span>
//                 ) : (
//                   <span className="text-red-600">
//                     Vui lòng chọn tài khoản nhận cước
//                   </span>
//                 )}
//               </p>
//             )}
//           </div>

//           {/* Use Balance Checkbox */}
//           <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
//             <label className="flex items-start space-x-3 cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={isUseBalance}
//                 onChange={(e) => setIsUseBalance(e.target.checked)}
//                 disabled={isCreating}
//                 className="w-5 h-5 mt-0.5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//               />
//               <div className="flex-1">
//                 <span className="text-sm font-semibold text-gray-900 block">
//                   Sử dụng số dư tài khoản
//                 </span>
//                 <p className="text-xs text-gray-600 mt-1">
//                   Tự động trừ số dư khách hàng để thanh toán đơn hàng
//                 </p>
//               </div>
//             </label>
//           </div>

//           {/* Confirmation Summary */}
//           <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
//             <h4 className="text-sm font-bold text-blue-900 mb-3">
//               Xác nhận thông tin:
//             </h4>
//             <div className="space-y-2">
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-blue-700">Số đơn hàng:</span>
//                 <span className="text-sm font-bold text-blue-900">
//                   {selectedCount}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-blue-700">
//                   Tổng phí vận chuyển:
//                 </span>
//                 <span className="text-sm font-bold text-blue-900">
//                   {formatCurrency?.(totalAmount) ?? totalAmount}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-blue-700">Phí ship nội địa:</span>
//                 <span
//                   className={`text-sm font-bold ${
//                     isPriceShipDosValid ? "text-green-600" : "text-red-600"
//                   }`}
//                 >
//                   {isPriceShipDosValid
//                     ? formatCurrency?.(priceShipDosValue) ?? priceShipDosValue
//                     : "Chưa nhập"}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-blue-700">Voucher:</span>
//                 <span className="text-sm font-bold text-blue-900">
//                   {customerVoucherId ? "Có" : "Không"}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-blue-700">
//                   Tài khoản nhận cước:
//                 </span>
//                 <span
//                   className={`text-sm font-bold ${
//                     bankId ? "text-green-600" : "text-red-600"
//                   }`}
//                 >
//                   {bankId ? "Đã chọn" : "Chưa chọn"}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm text-blue-700">Sử dụng số dư:</span>
//                 <span className="text-sm font-bold text-blue-900">
//                   {isUseBalance ? "Có" : "Không"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-200 rounded-b-xl flex justify-end space-x-3 sticky bottom-0">
//           <button
//             onClick={handleClose}
//             disabled={isCreating}
//             className="px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//             type="button"
//           >
//             Hủy
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={confirmDisabled}
//             className="px-6 py-2.5 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center shadow-sm"
//             type="button"
//             title={
//               confirmDisabled
//                 ? bankLoading
//                   ? "Đang tải tài khoản ngân hàng..."
//                   : voucherLoading
//                   ? "Đang tải voucher..."
//                   : !bankId
//                   ? "Vui lòng chọn tài khoản nhận cước"
//                   : !isPriceShipDosValid
//                   ? "Vui lòng nhập phí ship nội địa hợp lệ"
//                   : "Không thể xác nhận lúc này"
//                 : "Xác nhận tạo thanh toán"
//             }
//           >
//             {isCreating ? (
//               <>
//                 <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                 Đang tạo...
//               </>
//             ) : (
//               `Xác nhận thanh toán (${selectedCount})`
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* Nút tạo thanh toán ship (gộp) */
// const CreateMergedPaymentShip = ({
//   selectedOrders,
//   totalAmount,
//   formatCurrency,
//   onSuccess,
//   onError,
//   disabled = false,
//   accountId,
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

//   const handleConfirmMergedPayment = async (
//     customerVoucherId,
//     isUseBalance,
//     bankId,
//     priceShipDos
//   ) => {
//     setShowConfigModal(false);

//     try {
//       setIsCreating(true);

//       const result = await createPaymentShipService.createPaymentShipping(
//         isUseBalance,
//         customerVoucherId ?? null,
//         bankId,
//         priceShipDos,
//         selectedOrders
//       );

//       toast.success(
//         `Tạo thanh toán vận chuyển ${
//           selectedOrders.length > 1 ? "gộp " : ""
//         }thành công! Mã: ${result?.paymentCode || result?.id || "N/A"}`,
//         { duration: 4000 }
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
//         className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center shadow-sm"
//         type="button"
//         title={
//           buttonDisabled
//             ? "Hãy chọn ít nhất một đơn để tạo thanh toán"
//             : "Tạo thanh toán vận chuyển"
//         }
//       >
//         {isCreating ? (
//           <>
//             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//             Đang tạo...
//           </>
//         ) : (
//           <>Tạo thanh toán ({selectedOrders?.length || 0})</>
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
