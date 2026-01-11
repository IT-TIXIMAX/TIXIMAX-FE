import React, { useState } from "react";
import { X, Trash2, Package } from "lucide-react";
import toast from "react-hot-toast";
import draftWarehouseService from "../../Services/Warehouse/darftWarehouseService";

const RemoveShipmentDelivery = ({ isOpen, onClose, address, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [selectedShipments, setSelectedShipments] = useState([]);

  if (!isOpen) return null;

  const handleToggleShipment = (code) => {
    setSelectedShipments((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedShipments.length === address?.shippingList?.length) {
      setSelectedShipments([]);
    } else {
      setSelectedShipments([...(address?.shippingList || [])]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedShipments.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 mã vận đơn để xóa");
      return;
    }

    try {
      setLoading(true);
      await draftWarehouseService.removeShipmentsFromAddress(
        address.id,
        selectedShipments
      );
      toast.success(
        `Đã xóa ${selectedShipments.length} mã vận đơn thành công!`
      );
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error removing shipments:", error);
      const errorMessage =
        error?.response?.data?.error || "Không thể xóa mã vận đơn";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedShipments([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Trash2 className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Xóa Mã Vận Đơn
              </h2>
              <p className="text-sm text-white/80 mt-0.5">
                {address?.shipCode} - {address?.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div className="p-6 space-y-5">
            {/* Info */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Lưu ý:</strong> Chọn các mã vận đơn bạn muốn xóa khỏi
                địa chỉ giao hàng này.
              </p>
            </div>

            {/* Shipment Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Chọn mã vận đơn cần xóa ({selectedShipments.length}/
                  {address?.shippingList?.length || 0})
                </label>
                {address?.shippingList?.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {selectedShipments.length === address?.shippingList?.length
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả"}
                  </button>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4 max-h-96 overflow-y-auto">
                {address?.shippingList?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {address.shippingList.map((code, idx) => {
                      const isSelected = selectedShipments.includes(code);
                      return (
                        <label
                          key={idx}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "bg-red-100 border-red-500"
                              : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleShipment(code)}
                            className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-0 focus:ring-offset-0"
                          />
                          <span className="text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded-full font-semibold min-w-[20px] text-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-mono text-gray-800 flex-1">
                            {code}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-500">Không có mã vận đơn</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || selectedShipments.length === 0}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Trash2 size={18} />
              {loading ? "Đang xử lý..." : `Xóa ${selectedShipments.length} mã`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RemoveShipmentDelivery;
