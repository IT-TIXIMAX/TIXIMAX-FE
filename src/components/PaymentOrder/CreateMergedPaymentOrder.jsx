// /src/Components/Payment/CreateMergedPaymentOrder.jsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import mergedPaymentService from "../../Services/Payment/mergedPaymentService";
import { X, Loader2 } from "lucide-react";
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

/** Modal cấu hình thanh toán gộp */
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

  // Bank chọn để thanh toán
  const [bankId, setBankId] = useState(null);
  const [bankLoading, setBankLoading] = useState(false);

  const clampPercent = (v) => {
    if (v === "" || v === null || v === undefined) return "";
    const n = Number(v);
    if (!Number.isFinite(n)) return 0;
    return Math.min(100, Math.max(0, Math.trunc(n)));
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cachedBankAccounts, isOpen]);

  const validateForm = (finalPercent) => {
    const newErrors = {};

    const numValue =
      finalPercent !== undefined
        ? Number(finalPercent)
        : depositPercent === ""
        ? 0
        : Number(depositPercent);

    if (numValue < 0) newErrors.depositPercent = "Phần trăm cọc không thể âm";
    if (numValue > 100)
      newErrors.depositPercent = "Phần trăm cọc không thể vượt quá 100%";
    if (!bankId) newErrors.bankId = "Vui lòng chọn tài khoản nhận cước";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    // ✅ clamp chắc chắn trước khi submit
    const finalDepositPercent =
      depositPercent === "" ? 0 : clampPercent(depositPercent);

    // đồng bộ lại state để UI hiển thị đúng
    setDepositPercent(finalDepositPercent);

    if (validateForm(finalDepositPercent)) {
      onConfirm(finalDepositPercent, isUseBalance, bankId);
    }
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header - Gradient Blue */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              Cấu Hình Thanh Toán
            </h3>
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
          {/* Summary Info - 1 hàng */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-blue-700">
                Tổng giá trị:
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency?.(totalAmount) ?? totalAmount}
              </p>
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
                inputMode="numeric"
                min={0}
                max={100}
                step={1}
                value={depositPercent}
                // ✅ chặn ký tự âm/float/scientific
                onKeyDown={(e) => {
                  if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                // ✅ clamp ngay khi nhập để không vượt 0-100
                onChange={(e) => {
                  const v = e.target.value;

                  // cho phép rỗng để user xóa rồi nhập lại
                  if (v === "") {
                    setDepositPercent("");
                    if (errors.depositPercent)
                      setErrors((p) => ({ ...p, depositPercent: undefined }));
                    return;
                  }

                  const next = clampPercent(v);
                  setDepositPercent(next);

                  if (errors.depositPercent)
                    setErrors((p) => ({ ...p, depositPercent: undefined }));
                }}
                // ✅ khi blur: nếu rỗng => 0, còn lại clamp
                onBlur={() => {
                  setDepositPercent((prev) =>
                    prev === "" ? 0 : clampPercent(prev)
                  );
                }}
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
                <span className="text-sm text-blue-700">Số đơn hàng:</span>
                <span className="text-sm font-bold text-blue-900">
                  {selectedCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Phần trăm cọc:</span>
                <span className="text-sm font-bold text-blue-900">
                  {depositPercent === "" ? 0 : depositPercent}%
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
        <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-200 rounded-b-xl flex justify-end space-x-3">
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

/** Nút tạo thanh toán gộp */
const CreateMergedPaymentOrder = ({
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

      const result = await mergedPaymentService.mergePayments(
        depositPercent,
        isUseBalance,
        bankId,
        selectedOrders
      );

      toast.success(
        `Tạo thanh toán ${
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

export default CreateMergedPaymentOrder;
