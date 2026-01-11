import React, { useState } from "react";
import { X, Plus, Trash2, Package } from "lucide-react";
import toast from "react-hot-toast";
import draftWarehouseService from "../../Services/Warehouse/darftWarehouseService";

const DeliveryAddressForm = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerCode: "",
    phoneNumber: "",
    address: "",
    isVNpost: true,
    shippingList: [],
  });
  const [shipmentInput, setShipmentInput] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddShipment = () => {
    const code = shipmentInput.trim();
    if (!code) {
      toast.error("Vui lòng nhập mã vận đơn");
      return;
    }
    if (formData.shippingList.includes(code)) {
      toast.error("Mã vận đơn đã tồn tại");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      shippingList: [...prev.shippingList, code],
    }));
    setShipmentInput("");
  };

  const handleRemoveShipment = (index) => {
    setFormData((prev) => ({
      ...prev,
      shippingList: prev.shippingList.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.customerCode.trim()) {
      toast.error("Vui lòng nhập mã khách hàng");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("Vui lòng nhập địa chỉ");
      return;
    }
    if (formData.shippingList.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 mã vận đơn");
      return;
    }

    try {
      setLoading(true);
      await draftWarehouseService.addDeliveryAddress(formData);
      toast.success("Thêm địa chỉ giao hàng thành công!");
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding delivery address:", error);
      const errorMessage =
        error?.response?.data?.error || "Không thể thêm địa chỉ giao hàng";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      customerCode: "",
      phoneNumber: "",
      address: "",
      isVNpost: true,
      shippingList: [],
    });
    setShipmentInput("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Package className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Thêm Địa Chỉ Giao Hàng
            </h2>
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
            {/* Customer Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mã Khách Hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customerCode"
                value={formData.customerCode}
                onChange={handleChange}
                placeholder="VD: C00001"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Số Điện Thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="VD: +84367427630"
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Địa Chỉ <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ giao hàng"
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all resize-none"
              />
            </div>

            {/* Is VNPost */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isVNpost"
                id="isVNpost"
                checked={formData.isVNpost}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-0 focus:ring-offset-0"
              />
              <label
                htmlFor="isVNpost"
                className="text-sm font-medium text-gray-700 cursor-pointer select-none"
              >
                Giao qua VNPost
              </label>
            </div>

            {/* Shipping List */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Danh Sách Mã Vận Đơn <span className="text-red-500">*</span>
              </label>

              {/* Add Shipment Input */}
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
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddShipment}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2"
                >
                  <Plus size={18} />
                  Thêm
                </button>
              </div>

              {/* Shipment List */}
              {formData.shippingList.length > 0 ? (
                <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Đã thêm {formData.shippingList.length} mã vận đơn:
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {formData.shippingList.map((code, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full font-semibold min-w-[28px] text-center">
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
                    Chưa có mã vận đơn nào
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
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Thêm Địa Chỉ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryAddressForm;
