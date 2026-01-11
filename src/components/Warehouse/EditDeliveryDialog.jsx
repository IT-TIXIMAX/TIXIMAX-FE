import React, { useState, useEffect } from "react";
import { X, Package, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import draftWarehouseService from "../../Services/Warehouse/darftWarehouseService";

const EditDeliveryDialog = ({ isOpen, onClose, delivery, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerCode: "",
    customerName: "",
    phoneNumber: "",
    address: "",
    isVNpost: true,
    selectedShipments: [],
    availableShipments: [],
  });

  useEffect(() => {
    if (isOpen && delivery) {
      setFormData({
        customerCode: delivery.customerCode || "",
        customerName: delivery.customerName || "",
        phoneNumber: delivery.phoneNumber || "",
        address: delivery.address || "",
        isVNpost: true,
        selectedShipments: [],
        availableShipments: delivery.shipmentCode || [],
      });
    }
  }, [isOpen, delivery]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleShipment = (shipmentCode) => {
    setFormData((prev) => {
      const selectedShipments = prev.selectedShipments || [];

      if (selectedShipments.includes(shipmentCode)) {
        return {
          ...prev,
          selectedShipments: selectedShipments.filter(
            (code) => code !== shipmentCode
          ),
        };
      } else {
        return {
          ...prev,
          selectedShipments: [...selectedShipments, shipmentCode],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.customerCode?.trim()) {
      toast.error("Vui lòng nhập mã khách hàng");
      return;
    }
    if (!formData.phoneNumber?.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    if (!formData.address?.trim()) {
      toast.error("Vui lòng nhập địa chỉ");
      return;
    }
    if (formData.selectedShipments.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 mã vận đơn");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customerCode: formData.customerCode,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        isVNpost: formData.isVNpost,
        shippingList: formData.selectedShipments,
      };

      await draftWarehouseService.addDeliveryAddress(payload);
      toast.success("Thêm địa chỉ giao hàng thành công!");

      onClose();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
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
            onClick={onClose}
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
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mã Khách Hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerCode}
                  onChange={(e) => handleChange("customerCode", e.target.value)}
                  placeholder="VD: C00001"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên Khách Hàng
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  placeholder="Nhập tên khách hàng"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Phone & VNPost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số Điện Thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="VD: +84367427630"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Đơn vị vận chuyển
                </label>
                <div className="flex items-center gap-3 h-[42px]">
                  <input
                    type="checkbox"
                    id="isVNpost"
                    checked={formData.isVNpost}
                    onChange={(e) => handleChange("isVNpost", e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-0 focus:ring-offset-0"
                  />
                  <label
                    htmlFor="isVNpost"
                    className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                  >
                    Giao qua VNPost
                  </label>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Địa Chỉ <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Nhập địa chỉ giao hàng"
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all resize-none"
              />
            </div>

            {/* Shipment Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Chọn Mã Vận Đơn <span className="text-red-500">*</span>
                <span className="ml-2 text-blue-600">
                  ({formData.selectedShipments.length}/
                  {formData.availableShipments.length})
                </span>
              </label>
              <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4 max-h-64 overflow-y-auto">
                {formData.availableShipments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formData.availableShipments.map((code, idx) => {
                      const isSelected =
                        formData.selectedShipments.includes(code);
                      return (
                        <label
                          key={idx}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "bg-blue-100 border-blue-500"
                              : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleShipment(code)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-0 focus:ring-offset-0"
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
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle2 size={18} />
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDeliveryDialog;
