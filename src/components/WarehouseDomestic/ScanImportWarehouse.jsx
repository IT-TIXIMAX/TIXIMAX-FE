// ScanImportWarehouse.jsx
import React, { useMemo, useRef, useState } from "react";
import {
  Scan,
  RefreshCw,
  Trash2,
  Package,
  User,
  MapPin,
  CheckCircle,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import receivePackingService from "../../Services/Warehouse/receivepackingService";

const ScanImportWarehouse = () => {
  const [trackingCode, setTrackingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [checkInData, setCheckInData] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [hasError, setHasError] = useState(false);

  const inputRef = useRef(null);

  const normalizedCode = useMemo(() => trackingCode.trim(), [trackingCode]);
  const canCheck = normalizedCode.length > 0 && !loading && !checkInData;
  const canImport = !!checkInData?.trackingCode && !importing;

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

  const focusInput = () => setTimeout(() => inputRef.current?.focus(), 80);

  const handleCheckIn = async () => {
    if (!normalizedCode) {
      toast.error("Vui lòng nhập mã vận đơn.");
      return;
    }

    setLoading(true);
    setHasError(false);
    try {
      const res = await receivePackingService.checkInDomestic(normalizedCode);
      setCheckInData({
        ...res,
        trackingCode: normalizedCode,
        scannedAt: new Date().toISOString(),
      });
      toast.success("Đã tải thông tin vận đơn");
      setHasError(false);
    } catch (err) {
      toast.error(`Không thể kiểm tra: ${getErrorMessage(err)}`, {
        duration: 5000,
      });
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!checkInData?.trackingCode) return;

    setImporting(true);
    try {
      const res = await receivePackingService.scanImport(
        checkInData.trackingCode
      );

      const newEntry = {
        ...checkInData,
        importedAt: new Date().toISOString(),
        importResponse: res,
      };

      setImportHistory((prev) => [newEntry, ...prev]);
      toast.success(`Nhập kho thành công: ${checkInData.trackingCode}`, {
        duration: 3000,
      });

      setCheckInData(null);
      setTrackingCode("");
      setHasError(false);
      focusInput();
    } catch (err) {
      toast.error(`Không thể nhập kho: ${getErrorMessage(err)}`, {
        duration: 5000,
      });
    } finally {
      setImporting(false);
    }
  };

  const handleCancel = () => {
    setCheckInData(null);
    setTrackingCode("");
    setHasError(false);
    focusInput();
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (canCheck) return handleCheckIn();
      if (canImport) return handleImport();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      if (checkInData) handleCancel();
    }
  };

  const clearHistory = () => {
    if (window.confirm("Xóa tất cả lịch sử nhập kho?")) {
      setImportHistory([]);
      toast.success("Đã xóa lịch sử");
    }
  };

  const removeHistoryItem = (index) => {
    setImportHistory((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen  p-6">
      <Toaster position="top-right" />
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
      `}</style>

      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Scan className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="text-xl font-semibold text-white">Nhập kho</h1>
              </div>
            </div>

            {importHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-3 py-2 rounded-lg text-sm font-medium
                           bg-white/10 hover:bg-white/20 text-white
                           transition-colors"
              >
                Xóa lịch sử
              </button>
            )}
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Input row */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Scan size={16} className="text-blue-600" />
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  Nhập mã vận đơn
                </div>
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Đang kiểm tra...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                value={trackingCode}
                onChange={(e) => {
                  setTrackingCode(e.target.value);
                  setHasError(false);
                }}
                onKeyDown={onKeyDown}
                placeholder="Nhập hoặc quét mã vận đơn và nhấn Enter"
                autoFocus
                disabled={!!checkInData || loading}
                className="w-full h-12 px-4 pr-10 text-base border border-gray-300 rounded-xl
                           focus:ring-2 focus:ring-blue-200 focus:border-blue-600 outline-none
                           disabled:bg-gray-100 disabled:text-gray-600 transition-all"
              />

              {!!trackingCode && !loading && !checkInData && (
                <button
                  type="button"
                  onClick={() => {
                    if (hasError) {
                      setTrackingCode("");
                      setHasError(false);
                      focusInput();
                    } else {
                      handleCheckIn();
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  title={hasError ? "Xóa" : "Tìm kiếm"}
                >
                  {hasError ? (
                    <Trash2 size={18} className="text-red-500" />
                  ) : (
                    <Search size={18} className="text-blue-600" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Result / actions */}
          {checkInData ? (
            <div className="p-5 flex flex-col items-center">
              {/* CHỈ center phần show data */}
              <div className="w-full max-w-2xl space-y-4 animate-fade-in text-center">
                {/* Status banner */}
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4">
                  <div className="flex flex-col items-center gap-3">
                    <div>
                      <div className="text-xl font-medium text-blue-600 mb-0.5">
                        Mã vận đơn
                      </div>
                      <div className="text-xl font-bold text-black tracking-wide">
                        {checkInData.trackingCode}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Order info */}
                  <div className="rounded-xl bg-white border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Mã đơn hàng
                      </div>
                    </div>
                    <div className="text-base font-bold text-gray-900 mb-0.5">
                      {checkInData.orderCode || "—"}
                    </div>
                  </div>

                  {/* Customer info */}
                  <div className="rounded-xl bg-white border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Mã khách hàng
                      </div>
                    </div>
                    <div className="text-base font-bold text-gray-900 mb-0.5">
                      {checkInData.customerCode || "—"}
                    </div>
                  </div>

                  {/* Destination info */}
                  <div className="rounded-xl bg-white border border-gray-200 p-4 hover:shadow-md transition-shadow sm:col-span-2">
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Điểm đến
                      </div>
                    </div>
                    <div className="text-base font-bold text-gray-900">
                      {checkInData.destinationName || "—"}
                    </div>
                  </div>
                </div>

                {/* Inventory stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 p-4 shadow-sm">
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <div className="text-xl font-semibold text-red-700 uppercase tracking-wide">
                        Chờ nhập kho
                      </div>
                    </div>
                    <div className="flex items-baseline justify-center gap-2">
                      <div className="text-3xl font-extrabold text-red-900">
                        {checkInData.waitImport ?? "—"}
                      </div>
                      <div className="text-2xl font-medium text-red-700">
                        kiện
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 p-4 shadow-sm">
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <div className="text-xl font-semibold text-green-700 uppercase tracking-wide">
                        Đã nhập kho
                      </div>
                    </div>
                    <div className="flex items-baseline justify-center gap-2">
                      <div className="text-3xl font-extrabold text-green-900">
                        {checkInData.imported ?? "—"}
                      </div>
                      <div className="text-2xl font-medium text-green-700">
                        kiện
                      </div>
                    </div>
                  </div>
                </div>
                {/* Status banner */}
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4">
                  <div className="flex flex-col items-center gap-3">
                    <div>
                      <div className="text-xl font-medium text-blue-600 mb-0.5">
                        Tồn kho
                      </div>
                      <div className="text-xl font-bold text-black tracking-wide">
                        {checkInData.inventory || "—"}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={importing}
                    className="w-full sm:w-1/2 h-12 rounded-xl text-sm font-semibold border-2 border-gray-300 text-gray-700 
                               hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100
                               disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={!canImport}
                    className="w-full sm:w-1/2 h-12 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2
                               bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
                               hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800
                               disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed
                               shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                               transition-all"
                  >
                    {importing ? (
                      <>
                        <span>Đang nhập kho...</span>
                      </>
                    ) : (
                      <>
                        <span>Nhập kho</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5">
              <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 flex items-center justify-center">
                  <Scan size={24} className="text-blue-600" />
                </div>
                <div className="text-sm font-medium text-gray-900 mb-1">
                  Sẵn sàng quét mã vận đơn
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        {importHistory.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowHistory((v) => !v)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-gray-900">
                  Thành công
                </div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                  {importHistory.length}
                </span>
              </div>
              {showHistory ? (
                <ChevronUp size={18} className="text-gray-500" />
              ) : (
                <ChevronDown size={18} className="text-gray-500" />
              )}
            </button>

            {showHistory && (
              <div className="p-4 pt-0 space-y-2 max-h-[400px] overflow-y-auto">
                {importHistory.map((item, index) => (
                  <div
                    key={`${item.trackingCode}-${item.importedAt}-${index}`}
                    className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={16} className="text-green-600" />
                          </div>
                          <div className="font-bold text-gray-900 text-base truncate">
                            {item.trackingCode}
                          </div>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Đã nhập
                          </span>
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-10">
                          <div className="rounded-lg bg-gray-50 p-2">
                            <div className="text-xl text-gray-500 mb-0.5">
                              Đơn hàng
                            </div>
                            <div className="text-xl font-semibold text-gray-900 truncate">
                              {item.orderCode || "—"}
                            </div>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-2">
                            <div className="text-xl text-gray-500 mb-0.5">
                              Điểm đến
                            </div>
                            <div className="text-xl font-semibold text-gray-900 truncate">
                              {item.destinationName || "—"}
                            </div>
                          </div>
                          <div className="rounded-lg bg-red-50 p-2">
                            <div className="text-xl text-red-600 mb-0.5">
                              Chưa nhập
                            </div>
                            <div className="text-xl font-bold text-red-700">
                              {item.waitImport ?? "—"} kiện
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeHistoryItem(index)}
                        className="p-2 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                        title="Xóa"
                      >
                        <X size={18} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanImportWarehouse;
