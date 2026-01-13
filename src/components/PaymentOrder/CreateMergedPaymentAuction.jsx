// // /src/Components/Payment/CreateMergedPaymentOrder.jsx
// import React, { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import mergedPaymentService from "../../Services/Payment/mergedPaymentService";
// import { CreditCard as PaymentIcon, X, Info, Edit2, Check } from "lucide-react";
// import BankOrderList from "./BankOrderList";

// /** Helper: bóc tách lỗi backend */
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

// /** Modal cấu hình thanh toán gộp */
// const MergedPaymentConfigModal = ({
//   isOpen,
//   onClose,
//   onConfirm,
//   selectedCount,
//   totalAmount,
//   formatCurrency,
//   isCreating,
//   cachedBankAccounts = [], // ✅ THÊM prop
//   bankAccountsLoading = false, // ✅ THÊM prop
// }) => {
//   const [depositPercent, setDepositPercent] = useState(100);
//   const [isUseBalance, setIsUseBalance] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isEditingDeposit, setIsEditingDeposit] = useState(false);

//   // Bank chọn để thanh toán
//   const [bankId, setBankId] = useState(null);
//   const [bankLoading, setBankLoading] = useState(false);

//   // ✅ THÊM: Auto-set bank đầu tiên khi có cached data
//   useEffect(() => {
//     if (
//       cachedBankAccounts &&
//       cachedBankAccounts.length > 0 &&
//       !bankId &&
//       isOpen
//     ) {
//       setBankId(String(cachedBankAccounts[0].id));
//       // Clear error nếu có
//       if (errors.bankId) {
//         setErrors((p) => ({ ...p, bankId: undefined }));
//       }
//     }
//   }, [cachedBankAccounts, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

//   const validateForm = () => {
//     const newErrors = {};
//     const numValue = depositPercent === "" ? 0 : Number(depositPercent);

//     if (numValue < 0) newErrors.depositPercent = "Phần trăm cọc không thể âm";
//     if (numValue > 100)
//       newErrors.depositPercent = "Phần trăm cọc không thể vượt quá 100%";
//     if (!bankId) newErrors.bankId = "Vui lòng chọn tài khoản nhận cước";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = () => {
//     if (validateForm()) {
//       const finalDepositPercent =
//         depositPercent === "" ? 0 : Number(depositPercent);
//       onConfirm(finalDepositPercent, isUseBalance, bankId);
//       setIsEditingDeposit(false);
//     }
//   };

//   const handleDepositPercentChange = (e) => {
//     const value = e.target.value;
//     if (value === "") {
//       setDepositPercent("");
//     } else {
//       const numValue = parseInt(value, 10);
//       if (!isNaN(numValue)) setDepositPercent(numValue);
//     }
//     if (errors.depositPercent)
//       setErrors((p) => ({ ...p, depositPercent: undefined }));
//   };

//   const calculateDepositAmount = () =>
//     ((depositPercent === "" ? 0 : Number(depositPercent)) *
//       (totalAmount || 0)) /
//     100;

//   const handleClose = () => {
//     setIsEditingDeposit(false);
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
//         {/* Header */}
//         <div className="px-6 py-4 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-semibold text-gray-900">
//               Thanh toán {selectedCount > 1 ? "gộp" : ""}
//             </h3>
//             <button
//               onClick={handleClose}
//               disabled={isCreating}
//               className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="px-6 py-4">
//           {/* Info */}
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//             <div className="flex items-start">
//               <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
//               <div className="text-sm text-blue-800">
//                 <p className="font-semibold mb-1">
//                   Bạn đã chọn {selectedCount} đơn hàng
//                 </p>
//                 <p>
//                   Tổng giá trị: {formatCurrency?.(totalAmount) ?? totalAmount}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Deposit percent */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
//               <span>
//                 Phần trăm tiền cọc <span className="text-red-500">*</span>
//               </span>
//               <button
//                 type="button"
//                 onClick={() => setIsEditingDeposit((v) => !v)}
//                 disabled={isCreating}
//                 className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs transition-colors ${
//                   isEditingDeposit
//                     ? "bg-green-100 text-green-700 hover:bg-green-200"
//                     : "bg-blue-100 text-blue-700 hover:bg-blue-200"
//                 } disabled:opacity-50`}
//                 title={isEditingDeposit ? "Xác nhận" : "Chỉnh sửa"}
//               >
//                 {isEditingDeposit ? (
//                   <>
//                     <Check className="w-3.5 h-3.5" />
//                     <span>Xác nhận</span>
//                   </>
//                 ) : (
//                   <>
//                     <Edit2 className="w-3.5 h-3.5" />
//                     <span>Sửa</span>
//                   </>
//                 )}
//               </button>
//             </label>
//             <div className="relative">
//               <input
//                 type="number"
//                 min="0"
//                 max="100"
//                 value={depositPercent}
//                 onChange={handleDepositPercentChange}
//                 disabled={isCreating || !isEditingDeposit}
//                 className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
//                   !isEditingDeposit
//                     ? "bg-gray-50 cursor-not-allowed"
//                     : "bg-white"
//                 } ${isCreating ? "bg-gray-100 cursor-not-allowed" : ""} ${
//                   errors.depositPercent
//                     ? "border-red-300 focus:ring-red-500 focus:border-red-500"
//                     : "border-gray-300"
//                 }`}
//                 placeholder="Nhập phần trăm tiền cọc (0-100)"
//               />
//               <span className="absolute right-3 top-2.5 text-gray-500">%</span>
//             </div>
//             {errors.depositPercent && (
//               <p className="mt-1 text-sm text-red-600">
//                 {errors.depositPercent}
//               </p>
//             )}

//             {(depositPercent === "" || depositPercent > 0) && (
//               <div className="mt-2 p-3 bg-gray-50 rounded-lg">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Số tiền cọc:</span>
//                   <span className="font-semibold text-gray-900">
//                     {formatCurrency?.(calculateDepositAmount()) ??
//                       calculateDepositAmount()}
//                   </span>
//                 </div>
//                 <div className="flex justify-between text-sm mt-1">
//                   <span className="text-gray-600">Còn lại:</span>
//                   <span className="font-semibold text-gray-900">
//                     {formatCurrency?.(totalAmount - calculateDepositAmount()) ??
//                       totalAmount - calculateDepositAmount()}
//                   </span>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Bank select (Revenue) */}
//           <div className="mb-4">
//             <BankOrderList
//               disabled={isCreating}
//               value={bankId}
//               onChange={setBankId}
//               label="Chọn tài khoản nhận cước (bắt buộc)"
//               className="mb-2"
//               onLoadingChange={setBankLoading}
//               autoSelectFirst={true}
//               cachedAccounts={cachedBankAccounts} // ✅ THÊM: Truyền cached data
//               initialLoading={bankAccountsLoading} // ✅ THÊM: Loading từ parent
//             />
//             {(errors.bankId || bankLoading) && (
//               <div className="text-xs mt-1">
//                 {bankLoading ? (
//                   <span className="text-gray-500">
//                     Đang tải tài khoản ngân hàng…
//                   </span>
//                 ) : (
//                   <span className="text-amber-600">{errors.bankId}</span>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Use balance */}
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
//               Thông tin xác nhận:
//             </h4>
//             <div className="space-y-1 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Số đơn hàng:</span>
//                 <span className="font-medium">{selectedCount}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Phần trăm cọc:</span>
//                 <span className="font-medium">
//                   {depositPercent === "" ? 0 : depositPercent}%
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
//             onClick={handleClose}
//             disabled={isCreating}
//             className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Hủy
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={isCreating || bankLoading || !bankId}
//             className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
//             title={
//               isCreating
//                 ? "Đang tạo…"
//                 : bankLoading
//                 ? "Đang tải tài khoản ngân hàng…"
//                 : !bankId
//                 ? "Vui lòng chọn tài khoản nhận cước"
//                 : "Xác nhận tạo thanh toán"
//             }
//           >
//             {isCreating ? (
//               <>
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                 Đang tạo...
//               </>
//             ) : (
//               `Xác nhận tạo thanh toán${selectedCount > 1 ? " gộp" : ""}`
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /** Nút tạo thanh toán gộp */
// const CreateMergedPaymentAuction = ({
//   selectedOrders,
//   totalAmount,
//   formatCurrency,
//   onSuccess,
//   onError,
//   disabled = false,
//   cachedBankAccounts = [],
//   bankAccountsLoading = false,
// }) => {
//   const [showConfigModal, setShowConfigModal] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);

//   const handleOpenConfigModal = () => {
//     if (!selectedOrders || selectedOrders.length < 1) {
//       toast.error("Vui lòng chọn ít nhất 1 đơn hàng để tạo thanh toán");
//       return;
//     }
//     setShowConfigModal(true);
//   };

//   const handleConfirmMergedPayment = async (
//     depositPercent,
//     isUseBalance,
//     bankId
//   ) => {
//     try {
//       setIsCreating(true);

//       const result = await mergedPaymentService.mergePaymentAuction(
//         depositPercent,
//         isUseBalance,
//         bankId,
//         selectedOrders
//       );
//       toast.success(
//         `Tạo thanh toán ${
//           selectedOrders.length > 1 ? "gộp " : ""
//         }thành công! Mã thanh toán: ${
//           result?.paymentCode || result?.id || "N/A"
//         }`
//       );

//       setShowConfigModal(false);
//       onSuccess?.(result);
//     } catch (error) {
//       const errorMessage = getErrorMessage(error);
//       toast.error(`Không thể tạo thanh toán: ${errorMessage}`, {
//         duration: 5000,
//       });
//       onError?.(error);
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   return (
//     <>
//       <button
//         onClick={handleOpenConfigModal}
//         disabled={
//           disabled || isCreating || !selectedOrders || selectedOrders.length < 1
//         }
//         className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
//       >
//         {isCreating ? (
//           <>
//             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//             Đang tạo...
//           </>
//         ) : (
//           <>
//             {selectedOrders?.length > 1 ? "Tạo thanh toán" : "Tạo thanh toán"}
//           </>
//         )}
//       </button>

//       <MergedPaymentConfigModal
//         isOpen={showConfigModal}
//         onClose={() => !isCreating && setShowConfigModal(false)}
//         onConfirm={handleConfirmMergedPayment}
//         selectedCount={selectedOrders?.length || 0}
//         totalAmount={totalAmount || 0}
//         formatCurrency={formatCurrency || ((v) => v)}
//         isCreating={isCreating}
//         cachedBankAccounts={cachedBankAccounts}
//         bankAccountsLoading={bankAccountsLoading}
//       />
//     </>
//   );
// };

// export default CreateMergedPaymentAuction;

// /src/Components/Payment/CreateMergedPaymentAuction.jsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import mergedPaymentService from "../../Services/Payment/mergedPaymentService";
import { X, Loader2, Gavel } from "lucide-react";
import BankOrderList from "./BankOrderList";

/** Helper: bóc tách lỗi backend */
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

/** Modal cấu hình thanh toán đấu giá */
const MergedPaymentConfigModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  totalAmount,
  formatCurrency,
  isCreating,
  cachedBankAccounts = [],
  bankAccountsLoading = false,
}) => {
  const [depositPercent, setDepositPercent] = useState(100);
  const [isUseBalance, setIsUseBalance] = useState(false);
  const [errors, setErrors] = useState({});

  const [bankId, setBankId] = useState(null);
  const [bankLoading, setBankLoading] = useState(false);

  // Auto-set bank đầu tiên khi có cached data
  useEffect(() => {
    if (
      cachedBankAccounts &&
      cachedBankAccounts.length > 0 &&
      !bankId &&
      isOpen
    ) {
      setBankId(String(cachedBankAccounts[0].id));
      if (errors.bankId) {
        setErrors((p) => ({ ...p, bankId: undefined }));
      }
    }
  }, [cachedBankAccounts, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateForm = () => {
    const newErrors = {};
    const numValue = depositPercent === "" ? 0 : Number(depositPercent);

    if (numValue < 0) newErrors.depositPercent = "Phần trăm cọc không thể âm";
    if (numValue > 100)
      newErrors.depositPercent = "Phần trăm cọc không thể vượt quá 100%";
    if (!bankId) newErrors.bankId = "Vui lòng chọn tài khoản nhận cước";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const finalDepositPercent =
        depositPercent === "" ? 0 : Number(depositPercent);
      onConfirm(finalDepositPercent, isUseBalance, bankId);
    }
  };

  const handleDepositPercentChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setDepositPercent("");
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) setDepositPercent(numValue);
    }
    if (errors.depositPercent)
      setErrors((p) => ({ ...p, depositPercent: undefined }));
  };

  const calculateDepositAmount = () =>
    ((depositPercent === "" ? 0 : Number(depositPercent)) *
      (totalAmount || 0)) /
    100;

  const handleClose = () => {
    if (!isCreating) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header - Gradient Blue với Gavel icon */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-white" />
              <h3 className="text-xl font-semibold text-white">
                Cấu Hình Thanh Toán Đấu Giá
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
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-purple-700 mb-1">Số đơn đấu giá</p>
                <p className="text-2xl font-bold text-purple-900">
                  {selectedCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-purple-700 mb-1">Tổng giá trị</p>
                <p className="text-xl font-bold text-purple-900">
                  {formatCurrency?.(totalAmount) ?? totalAmount}
                </p>
              </div>
            </div>
          </div>

          {/* Deposit Percent */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Phần trăm tiền cọc <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={depositPercent}
                onChange={handleDepositPercentChange}
                disabled={isCreating}
                className={`w-full px-4 py-2.5 pr-10 border-2 rounded-lg text-lg font-medium transition-all
                  ${
                    isCreating
                      ? "bg-gray-100 cursor-not-allowed"
                      : "bg-white hover:border-blue-400"
                  }
                  ${
                    errors.depositPercent
                      ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }
                `}
                placeholder="0-100"
              />
              <span className="absolute right-4 top-2.5 text-xl font-semibold text-gray-500">
                %
              </span>
            </div>
            {errors.depositPercent && (
              <p className="mt-1.5 text-sm text-red-600 font-medium">
                {errors.depositPercent}
              </p>
            )}

            {/* Calculation Display */}
            {(depositPercent === "" || depositPercent > 0) && (
              <div className="mt-3 bg-gray-50 border-2 border-gray-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Số tiền cọc:
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatCurrency?.(calculateDepositAmount()) ??
                      calculateDepositAmount()}
                  </span>
                </div>
                <div className="h-px bg-gray-300"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Còn lại:
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency?.(totalAmount - calculateDepositAmount()) ??
                      totalAmount - calculateDepositAmount()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bank Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tài khoản nhận cước <span className="text-red-500">*</span>
            </label>
            <BankOrderList
              disabled={isCreating}
              value={bankId}
              onChange={setBankId}
              onLoadingChange={setBankLoading}
              autoSelectFirst={true}
              cachedAccounts={cachedBankAccounts}
              initialLoading={bankAccountsLoading}
            />
            {(errors.bankId || bankLoading) && (
              <p className="mt-1.5 text-sm font-medium">
                {bankLoading ? (
                  <span className="text-gray-500">
                    Đang tải tài khoản ngân hàng...
                  </span>
                ) : (
                  <span className="text-red-600">{errors.bankId}</span>
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
                  Tự động trừ số dư khách hàng để thanh toán đơn đấu giá
                </p>
              </div>
            </label>
          </div>

          {/* Confirmation Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-purple-900 mb-3">
              Xác nhận thông tin:
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-700">Số đơn đấu giá:</span>
                <span className="text-sm font-bold text-purple-900">
                  {selectedCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-700">Phần trăm cọc:</span>
                <span className="text-sm font-bold text-purple-900">
                  {depositPercent === "" ? 0 : depositPercent}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-700">
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
                <span className="text-sm text-purple-700">Sử dụng số dư:</span>
                <span className="text-sm font-bold text-purple-900">
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
            onClick={handleSubmit}
            disabled={isCreating || bankLoading || !bankId}
            className="px-6 py-2.5 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center shadow-sm"
            type="button"
            title={
              isCreating
                ? "Đang tạo..."
                : bankLoading
                ? "Đang tải tài khoản ngân hàng..."
                : !bankId
                ? "Vui lòng chọn tài khoản nhận cước"
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

/** Nút tạo thanh toán đấu giá */
const CreateMergedPaymentAuction = ({
  selectedOrders,
  totalAmount,
  formatCurrency,
  onSuccess,
  onError,
  disabled = false,
  cachedBankAccounts = [],
  bankAccountsLoading = false,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleOpenConfigModal = () => {
    if (!selectedOrders || selectedOrders.length < 1) {
      toast.error("Vui lòng chọn ít nhất 1 đơn hàng để tạo thanh toán");
      return;
    }
    setShowConfigModal(true);
  };

  const handleConfirmMergedPayment = async (
    depositPercent,
    isUseBalance,
    bankId
  ) => {
    try {
      setIsCreating(true);

      const result = await mergedPaymentService.mergePaymentAuction(
        depositPercent,
        isUseBalance,
        bankId,
        selectedOrders
      );

      toast.success(
        `Tạo thanh toán đấu giá ${
          selectedOrders.length > 1 ? "gộp " : ""
        }thành công! Mã: ${result?.paymentCode || result?.id || "N/A"}`,
        { duration: 4000 }
      );

      setShowConfigModal(false);
      onSuccess?.(result);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(`Không thể tạo thanh toán: ${errorMessage}`, {
        duration: 5000,
      });
      onError?.(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenConfigModal}
        disabled={
          disabled || isCreating || !selectedOrders || selectedOrders.length < 1
        }
        className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center shadow-sm"
        type="button"
      >
        {isCreating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang tạo...
          </>
        ) : (
          <>Tạo thanh toán ({selectedOrders?.length || 0})</>
        )}
      </button>

      <MergedPaymentConfigModal
        isOpen={showConfigModal}
        onClose={() => !isCreating && setShowConfigModal(false)}
        onConfirm={handleConfirmMergedPayment}
        selectedCount={selectedOrders?.length || 0}
        totalAmount={totalAmount || 0}
        formatCurrency={formatCurrency || ((v) => v)}
        isCreating={isCreating}
        cachedBankAccounts={cachedBankAccounts}
        bankAccountsLoading={bankAccountsLoading}
      />
    </>
  );
};

export default CreateMergedPaymentAuction;
