import React, { useState } from "react";
import { X, Package, Truck } from "lucide-react";
import toast from "react-hot-toast";
import draftWarehouseService from "../../Services/Warehouse/darftWarehouseService";

const CreateExportWarehouse = ({ isOpen, onClose, shipment, onSuccess }) => {
  const [trackingCode, setTrackingCode] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!trackingCode.trim()) {
      toast.error("Vui lòng nhập mã vận đơn VNPost");
      return;
    }

    try {
      setLoading(true);
      await draftWarehouseService.scanVNPost(
        trackingCode.trim(),
        shipment.shipCode
      );
      toast.success("Xuất kho thành công!");
      setTrackingCode("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error exporting:", error);
      const errorMessage =
        error?.response?.data?.error || "Xuất kho thất bại. Vui lòng thử lại!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTrackingCode("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Truck size={22} className="text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Xuất Kho Đơn Hàng
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors disabled:opacity-50"
              type="button"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Shipment Info */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="text-blue-600" size={18} />
                <span className="text-sm font-medium text-gray-600">
                  Mã giao hàng:
                </span>
                <span className="font-semibold text-blue-700">
                  {shipment?.shipCode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Khách hàng:
                </span>
                <span className="font-medium text-gray-900">
                  {shipment?.customerName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Số lượng đơn:
                </span>
                <span className="font-medium text-gray-900">
                  {shipment?.shippingList?.length || 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Trọng lượng:
                </span>
                <span className="font-medium text-gray-900">
                  {shipment?.weight} kg
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mã vận đơn VNPost <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Nhập mã vận đơn VNPost..."
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all disabled:bg-gray-100"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Nhập mã vận đơn VNPost để xác nhận xuất kho
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || !trackingCode.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Truck size={18} />
                    Xác nhận xuất kho
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateExportWarehouse;
