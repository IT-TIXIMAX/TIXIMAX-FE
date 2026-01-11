import React, { useState } from "react";
import { X, Plus, Trash2, Package } from "lucide-react";
import toast from "react-hot-toast";
import draftWarehouseService from "../../Services/Warehouse/darftWarehouseService";

const AddShipmentDelivery = ({ isOpen, onClose, address, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [shipmentInput, setShipmentInput] = useState("");
  const [shipmentList, setShipmentList] = useState([]);

  if (!isOpen) return null;

  const handleAddShipment = () => {
    const code = shipmentInput.trim();
    if (!code) {
      toast.error("Vui lòng nhập mã vận đơn");
      return;
    }
    if (shipmentList.includes(code)) {
      toast.error("Mã vận đơn đã tồn tại trong danh sách");
      return;
    }
    if (address?.shippingList?.includes(code)) {
      toast.error("Mã vận đơn đã có trong địa chỉ này");
      return;
    }
    setShipmentList((prev) => [...prev, code]);
    setShipmentInput("");
  };

  const handleRemoveShipment = (index) => {
    setShipmentList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (shipmentList.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 mã vận đơn");
      return;
    }

    try {
      setLoading(true);
      await draftWarehouseService.addShipmentsToAddress(
        address.id,
        shipmentList
      );
      toast.success(`Đã thêm ${shipmentList.length} mã vận đơn thành công!`);
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding shipments:", error);
      const errorMessage =
        error?.response?.data?.error || "Không thể thêm mã vận đơn";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShipmentInput("");
    setShipmentList([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Plus className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Thêm Mã Vận Đơn
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
            {/* Current Shipments */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mã vận đơn hiện tại ({address?.shippingList?.length || 0})
              </label>
              <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4">
                {address?.shippingList?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {address.shippingList.map((code, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-lg border border-blue-300"
                      >
                        <span className="text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded-full font-semibold min-w-[20px] text-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-mono text-gray-800">
                          {code}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Chưa có mã vận đơn
                  </p>
                )}
              </div>
            </div>

            {/* Add Shipment Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thêm mã vận đơn mới
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={shipmentInput}
                  onChange={(e) => setShipmentInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddShipment())
                  }
                  placeholder="Nhập mã vận đơn..."
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-green-500 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddShipment}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all flex items-center gap-2"
                >
                  <Plus size={18} />
                  Thêm
                </button>
              </div>

              {/* New Shipment List */}
              {shipmentList.length > 0 ? (
                <div className="bg-green-50 rounded-lg border-2 border-green-200 p-4">
                  <p className="text-sm font-semibold text-green-700 mb-3">
                    Sẽ thêm {shipmentList.length} mã vận đơn:
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {shipmentList.map((code, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white rounded-lg border border-green-300 px-4 py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-full font-semibold min-w-[28px] text-center">
                            {index + 1}
                          </span>
                          <span className="text-sm font-mono text-gray-800">
                            {code}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveShipment(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                  <Package className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-500">
                    Chưa có mã vận đơn nào để thêm
                  </p>
                </div>
              )}
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
              disabled={loading || shipmentList.length === 0}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={18} />
              {loading ? "Đang xử lý..." : `Thêm ${shipmentList.length} mã`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShipmentDelivery;
