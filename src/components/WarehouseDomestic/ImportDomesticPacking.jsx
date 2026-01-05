// ImportDomesticPacking.jsx
import React, { useMemo, useState, useRef } from "react";
import {
  Package,
  CheckCircle,
  RefreshCw,
  Trash2,
  X,
  Download,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Search,
  Hash,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import receivePackingService from "../../Services/Warehouse/receivepackingService";
import ScanImport from "./ScanImport";

const ImportDomesticPacking = () => {
  const [packingCode, setPackingCode] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [importHistory, setImportHistory] = useState([]);

  // Modal state
  const [selectedTracking, setSelectedTracking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Table state
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState(new Set());

  const inputRef = useRef(null);

  const normalizedCode = useMemo(() => packingCode.trim(), [packingCode]);
  const canSubmit = normalizedCode.length > 0 && !loading;

  // Filter history based on search
  const filteredHistory = useMemo(() => {
    if (!searchTerm) return importHistory;
    const lower = searchTerm.toLowerCase();
    return importHistory.filter(
      (item) =>
        item.packingCode.toLowerCase().includes(lower) ||
        item.note?.toLowerCase().includes(lower) ||
        item.trackingCode?.some((code) => code.toLowerCase().includes(lower))
    );
  }, [importHistory, searchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredHistory.length;
    const totalTracking = filteredHistory.reduce(
      (sum, item) => sum + (item.trackingCode?.length || 0),
      0
    );
    return { total, totalTracking };
  }, [filteredHistory]);

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

  const handleSubmit = async () => {
    if (!normalizedCode) {
      toast.error("Vui lòng nhập mã thùng (packingCode).");
      return;
    }

    setLoading(true);
    try {
      const response = await receivePackingService.confirmReceipt(
        [normalizedCode],
        note?.trim() || ""
      );

      const packingList =
        response?.data?.packingRecieveList ||
        response?.packingRecieveList ||
        [];

      if (packingList.length > 0) {
        const newEntries = packingList.map((item) => ({
          ...item,
          timestamp: new Date().toISOString(),
          note: note?.trim() || "",
        }));

        setImportHistory((prev) => [...newEntries, ...prev]);

        const totalTracking = packingList.reduce(
          (sum, p) => sum + (p.trackingCode?.length || 0),
          0
        );
        toast.success(
          `✓ Nhập thành công: ${normalizedCode}\n${totalTracking} mã tracking`,
          { duration: 3000 }
        );
      } else {
        toast.success(`Nhập thành công: ${normalizedCode}`);
      }

      setPackingCode("");
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      toast.error(`Không thể nhập: ${getErrorMessage(err)}`, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (canSubmit) handleSubmit();
    }
  };

  const clearHistory = () => {
    if (window.confirm("Xóa tất cả danh sách nhập?")) {
      setImportHistory([]);
      setSelectedItems(new Set());
      setExpandedRows(new Set());
      toast.success("Đã xóa lịch sử");
    }
  };

  const removeHistoryItem = (index) => {
    setImportHistory((prev) => prev.filter((_, i) => i !== index));
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const toggleRowExpand = (index) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleSelectItem = (index) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredHistory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredHistory.map((_, index) => index)));
    }
  };

  const handleTrackingClick = (trackingCode, packingItem) => {
    setSelectedTracking({
      trackingCode,
      packingCode: packingItem.packingCode,
      timestamp: packingItem.timestamp,
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTracking(null);
  };

  const handleImportSuccess = (importData) => {
    toast.success(" Đã nhập kho tracking code thành công!");
    handleModalClose();
  };

  // Export to Excel - Keep 1 row per packing code
  const exportToExcel = () => {
    if (importHistory.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    try {
      // Prepare data: 1 row = 1 packing code with all tracking codes in one cell
      const excelData = importHistory.map((item, index) => ({
        STT: index + 1,
        "Mã thùng": item.packingCode,
        "Danh sách tracking": item.trackingCode?.join(", ") || "",
        "Ghi chú": item.note || "",
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws["!cols"] = [
        { wch: 5 }, // STT
        { wch: 15 }, // Mã thùng
        { wch: 70 }, // Danh sách tracking (wide for multiple codes)
        { wch: 30 }, // Ghi chú
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách nhập hàng ");

      // Generate file name with timestamp
      const fileName = `Lich_su_nhap_hang_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);

      toast.success(`✓ Đã xuất file: ${fileName}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Lỗi khi xuất file Excel");
    }
  };

  // Export selected items
  const exportSelectedToExcel = () => {
    if (selectedItems.size === 0) {
      toast.error("Vui lòng chọn ít nhất 1 dòng để xuất");
      return;
    }

    const selectedData = Array.from(selectedItems)
      .map((index) => importHistory[index])
      .filter(Boolean);

    if (selectedData.length === 0) return;

    try {
      const excelData = selectedData.map((item, index) => ({
        STT: index + 1,
        "Mà thùng": item.packingCode,
        "Danh sách tracking": item.trackingCode?.join(", ") || "",
        "Ghi chú": item.note || "",
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      ws["!cols"] = [{ wch: 5 }, { wch: 15 }, { wch: 70 }, { wch: 30 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Dữ liệu đã chọn");

      const fileName = `Lich_su_nhap_hang_${selectedItems.size}_dong_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;

      XLSX.writeFile(wb, fileName);

      toast.success(`✓ Đã xuất ${selectedItems.size} dòng: ${fileName}`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Lỗi khi xuất file Excel");
    }
  };

  return (
    <div className="p-6 min-h-screen ">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center">
                <Package size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Nhập nhận hàng kho nội địa
                </h1>
              </div>
            </div>

            {importHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Packing code */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Mã thùng (PackingCode)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    value={packingCode}
                    onChange={(e) => setPackingCode(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Nhập mã thùng cần nhập kho"
                    autoFocus
                    className="w-full h-11 px-4 pr-10 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-600 outline-none"
                  />
                  {!!packingCode && !loading && (
                    <button
                      type="button"
                      onClick={() => {
                        setPackingCode("");
                        inputRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100"
                      title="Xóa"
                    >
                      <Trash2 size={16} className="text-gray-500" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="h-11 px-6 rounded-xl text-sm font-medium inline-flex items-center gap-2
                           bg-blue-600 text-white hover:bg-blue-700
                           disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed
                           transition-colors"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Đang nhập...
                    </>
                  ) : (
                    <>Nhập hàng</>
                  )}
                </button>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Người nhận hàng
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập người nhận hàng "
                className="w-full h-11 px-4 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* History Table */}
        {importHistory.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Table Header with Search and Stats */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-semibold border-l-4 border-blue-600 pl-4 text-gray-800">
                    Danh sách nhập hàng
                  </h2>
                  <div className="flex items-center gap-4 mt-1 bg-green-100 inline-block px-3 py-1 rounded-full">
                    <span className="text-xl text-black font-semibold flex items-center gap-1.5">
                      Tổng mã nhận {stats.totalTracking}
                    </span>
                  </div>
                </div>
              </div>

              {/* Search and Export Buttons Row */}
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm mã thùng, tracking, ghi chú..."
                    className="w-full h-10 pl-10 pr-4 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-600 outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100"
                    >
                      <X size={14} className="text-gray-500" />
                    </button>
                  )}
                </div>

                {/* Export Buttons */}
                {selectedItems.size > 0 && (
                  <button
                    onClick={exportSelectedToExcel}
                    className="h-10 px-4 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <FileSpreadsheet size={16} />
                    Xuất đã chọn ({selectedItems.size})
                  </button>
                )}

                <button
                  onClick={exportToExcel}
                  className="h-10 px-4 rounded-xl text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Download size={16} />
                  Xuất Excel
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedItems.size === filteredHistory.length &&
                          filteredHistory.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-200"
                      />
                    </th>
                    <th className="px-4 py-3 text-left w-12">
                      <span className="text-xs font-semibold text-gray-600 uppercase">
                        STT
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1.5">
                        <Package size={14} />
                        Mã thùng
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase">
                        Danh sách Tracking
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1.5">
                        <MessageSquare size={14} />
                        Ghi chú
                      </span>
                    </th>
                    <th className="px-4 py-3 text-center w-24">
                      <span className="text-xs font-semibold text-gray-600 uppercase">
                        Thao tác
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredHistory.map((item, index) => {
                    const isExpanded = expandedRows.has(index);
                    const isSelected = selectedItems.has(index);
                    const trackingCount = item.trackingCode?.length || 0;
                    const hasTracking = trackingCount > 0;

                    return (
                      <tr
                        key={`${item.packingCode}-${item.timestamp}-${index}`}
                        className={`hover:bg-gray-50 transition-colors ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectItem(index)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-200"
                          />
                        </td>

                        {/* STT */}
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-700">
                            {index + 1}
                          </span>
                        </td>

                        {/* Packing Code */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <CheckCircle
                                size={16}
                                className="text-green-600"
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {item.packingCode}
                            </span>
                          </div>
                        </td>

                        {/* Tracking List */}
                        <td className="px-4 py-3">
                          {hasTracking ? (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1.5">
                                {(isExpanded
                                  ? item.trackingCode
                                  : item.trackingCode.slice(0, 8)
                                ).map((code, idx) => (
                                  <button
                                    key={`${code}-${idx}`}
                                    onClick={() =>
                                      handleTrackingClick(code, item)
                                    }
                                    className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-100 
                                             hover:bg-blue-100 hover:border-blue-200 transition-all cursor-pointer
                                             active:scale-95"
                                    title="Click để nhập kho"
                                  >
                                    {code}
                                  </button>
                                ))}
                              </div>

                              {trackingCount > 8 && (
                                <button
                                  onClick={() => toggleRowExpand(index)}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp size={14} />
                                      Thu gọn
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown size={14} />
                                      Xem thêm {trackingCount - 8} mã (
                                      {trackingCount} tổng)
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Không có tracking
                            </span>
                          )}
                        </td>

                        {/* Note */}
                        <td className="px-4 py-3">
                          {item.note ? (
                            <span className="text-sm text-gray-700">
                              {item.note}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              -
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeHistoryItem(index)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            {filteredHistory.length > 0 && (
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    Hiển thị {filteredHistory.length} / {importHistory.length}{" "}
                    kết quả
                  </div>
                  {selectedItems.size > 0 && (
                    <div className="text-blue-600 font-medium">
                      Đã chọn: {selectedItems.size} dòng
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {importHistory.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Chưa có dữ liệu
            </h3>
          </div>
        )}

        {/* No Results State */}
        {importHistory.length > 0 && filteredHistory.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Không tìm thấy kết quả
            </h3>
            <p className="text-xs text-gray-500">
              Thử tìm kiếm với từ khóa khác
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Scan Import Modal */}
      <ScanImport
        isOpen={isModalOpen}
        onClose={handleModalClose}
        trackingData={selectedTracking}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default ImportDomesticPacking;
