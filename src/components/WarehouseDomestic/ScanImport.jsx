// ScanImport.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  Scan,
  User,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import receivePackingService from "../../Services/Warehouse/receivepackingService";

const ScanImport = ({ isOpen, onClose, trackingData, onImportSuccess }) => {
  const [step, setStep] = useState(1); // 1: check-in, 2: confirm
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [checkInData, setCheckInData] = useState(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen && trackingData) {
      setStep(1);
      setCheckInData(null);
      handleCheckIn();
    }
  }, [isOpen, trackingData]);

  const getErrorMessage = (error) => {
    if (error?.response) {
      const backendError =
        error.response.data?.error ||
        error.response.data?.message ||
        error.response.data?.detail ||
        error.response.data?.errors;

      if (backendError) {
        if (typeof backendError === "object" && !Array.isArray(backendError)) {
          return (
            "Lỗi validation: " +
            Object.entries(backendError)
              .map(([field, msg]) => `${field}: ${msg}`)
              .join(", ")
          );
        }
        if (Array.isArray(backendError)) return backendError.join(", ");
        return backendError;
      }
      return `Lỗi ${error.response.status}: ${
        error.response.statusText || "Không xác định"
      }`;
    }
    if (error?.request) return "Không thể kết nối tới server.";
    return error?.message || "Đã xảy ra lỗi không xác định";
  };

  // Step 1: Check-in
  const handleCheckIn = async () => {
    if (!trackingData?.trackingCode) return;

    setLoading(true);
    try {
      const response = await receivePackingService.checkInDomestic(
        trackingData.trackingCode
      );

      setCheckInData(response);
      setStep(2);
      toast.success("✓ Đã tải thông tin vận đơn");
    } catch (err) {
      toast.error(`Không thể kiểm tra: ${getErrorMessage(err)}`, {
        duration: 5000,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Import to warehouse
  const handleImport = async () => {
    if (!trackingData?.trackingCode) return;

    setImporting(true);
    try {
      const response = await receivePackingService.scanImport(
        trackingData.trackingCode
      );

      toast.success(`✓ Nhập kho thành công: ${trackingData.trackingCode}`, {
        duration: 3000,
      });

      if (onImportSuccess) {
        onImportSuccess({ ...checkInData, importResponse: response });
      }

      onClose();
    } catch (err) {
      toast.error(`Không thể nhập kho: ${getErrorMessage(err)}`, {
        duration: 5000,
      });
    } finally {
      setImporting(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Nhập kho tracking code
              </h2>
              <p className="text-sm text-blue-100">
                {trackingData?.trackingCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading || importing}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              {/* Step 1 */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    step >= 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > 1 ? <CheckCircle size={16} /> : "1"}
                </div>
                <span
                  className={`text-sm font-medium ${
                    step >= 1 ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  Kiểm tra
                </span>
              </div>

              {/* Divider */}
              <div className="w-12 h-0.5 bg-gray-200"></div>

              {/* Step 2 */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    step >= 2
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-sm font-medium ${
                    step >= 2 ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  Nhập kho
                </span>
              </div>
            </div>
          </div>

          {/* Step 1: Loading */}
          {step === 1 && loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw
                size={40}
                className="text-blue-600 animate-spin mb-4"
              />
              <p className="text-sm text-gray-600">
                Đang kiểm tra thông tin...
              </p>
            </div>
          )}

          {/* Step 2: Check-in Data */}
          {step === 2 && checkInData && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Order Code */}
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Package size={16} className="text-blue-600" />
                      <span className="text-xs text-gray-600 font-medium">
                        Mã đơn hàng
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {checkInData.orderCode}
                    </div>
                  </div>

                  {/* Shipment Code */}
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Scan size={16} className="text-blue-600" />
                      <span className="text-xs text-gray-600 font-medium">
                        Mã vận đơn
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {checkInData.shipmentCode}
                    </div>
                  </div>

                  {/* Customer Code */}
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={16} className="text-blue-600" />
                      <span className="text-xs text-gray-600 font-medium">
                        Mã khách hàng
                      </span>
                    </div>
                    <div className="font-medium text-gray-900 text-sm">
                      {checkInData.customerCode}
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-blue-600" />
                      <span className="text-xs text-gray-600 font-medium">
                        Điểm đến
                      </span>
                    </div>
                    <div className="font-medium text-gray-900 text-sm">
                      {checkInData.destinationName}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">
                      Chờ nhập kho
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle size={18} className="text-yellow-600" />
                      <span className="text-lg font-bold text-yellow-600">
                        {checkInData.waitImport}
                      </span>
                      <span className="text-xs text-gray-500">kiện</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">
                      Đã trong kho
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-600" />
                      <span className="text-lg font-bold text-green-600">
                        {checkInData.inventory}
                      </span>
                      <span className="text-xs text-gray-500">kiện</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Source Info */}
              {trackingData?.packingCode && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Từ thùng:</span>
                    <span className="font-medium text-gray-900">
                      {trackingData.packingCode}
                    </span>
                  </div>
                  {trackingData?.timestamp && (
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-gray-600">Thời gian quét:</span>
                      <span className="font-medium text-gray-900">
                        {formatTime(trackingData.timestamp)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={importing}
                  className="flex-1 h-11 px-4 rounded-xl text-sm font-medium
                           border-2 border-gray-300 text-gray-700 hover:bg-gray-50
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors"
                >
                  Hủy
                </button>

                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing}
                  className="flex-1 h-11 px-4 rounded-xl text-sm font-medium inline-flex items-center justify-center gap-2
                           bg-green-600 text-white hover:bg-green-700
                           disabled:bg-gray-400 disabled:cursor-not-allowed
                           transition-colors"
                >
                  {importing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Đang nhập kho...
                    </>
                  ) : (
                    <>
                      <ArrowRight size={16} />
                      Xác nhận nhập kho
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanImport;
