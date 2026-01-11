import React, { useState, useEffect } from "react";
import { X, Package, CheckCircle2, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import draftWarehouseService from "../../Services/Warehouse/darftWarehouseService";

const ConfirmDeliveryDialog = ({
  isOpen,
  onClose,
  selectedDeliveries,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [editableDeliveries, setEditableDeliveries] = useState([]);

  useEffect(() => {
    if (isOpen && selectedDeliveries.length > 0) {
      // Initialize editable data với selected shipments
      setEditableDeliveries(
        selectedDeliveries.map((delivery) => ({
          ...delivery,
          selectedShipments: [...(delivery.shipmentCode || [])],
          isEditing: false,
        }))
      );
    }
  }, [isOpen, selectedDeliveries]);

  if (!isOpen) return null;

  const handleToggleShipment = (deliveryIndex, shipmentCode) => {
    setEditableDeliveries((prev) => {
      const updated = [...prev];
      const selectedShipments = updated[deliveryIndex].selectedShipments;

      if (selectedShipments.includes(shipmentCode)) {
        updated[deliveryIndex].selectedShipments = selectedShipments.filter(
          (code) => code !== shipmentCode
        );
      } else {
        updated[deliveryIndex].selectedShipments = [
          ...selectedShipments,
          shipmentCode,
        ];
      }

      return updated;
    });
  };

  const handleToggleEdit = (deliveryIndex) => {
    setEditableDeliveries((prev) => {
      const updated = [...prev];
      updated[deliveryIndex].isEditing = !updated[deliveryIndex].isEditing;
      return updated;
    });
  };

  const handleFieldChange = (deliveryIndex, field, value) => {
    setEditableDeliveries((prev) => {
      const updated = [...prev];
      updated[deliveryIndex][field] = value;
      return updated;
    });
  };

  const handleSubmit = async () => {
    // Validation
    for (const delivery of editableDeliveries) {
      if (delivery.selectedShipments.length === 0) {
        toast.error(
          `${delivery.customerCode}: Vui lòng chọn ít nhất 1 mã vận đơn`
        );
        return;
      }
      if (!delivery.customerName?.trim()) {
        toast.error(`${delivery.customerCode}: Vui lòng nhập tên khách hàng`);
        return;
      }
      if (!delivery.phoneNumber?.trim()) {
        toast.error(`${delivery.customerCode}: Vui lòng nhập số điện thoại`);
        return;
      }
      if (!delivery.address?.trim()) {
        toast.error(`${delivery.customerCode}: Vui lòng nhập địa chỉ`);
        return;
      }
    }

    try {
      setLoading(true);

      // Submit each delivery
      for (const delivery of editableDeliveries) {
        const payload = {
          customerCode: delivery.customerCode,
          phoneNumber: delivery.phoneNumber,
          address: delivery.address,
          isVNpost: delivery.isVNpost ?? true,
          shippingList: delivery.selectedShipments,
        };

        await draftWarehouseService.addDeliveryAddress(payload);
      }

      toast.success(
        `Xác nhận thành công ${editableDeliveries.length} địa chỉ giao hàng!`
      );
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error confirming deliveries:", error);
      const errorMessage =
        error?.response?.data?.error || "Không thể xác nhận địa chỉ giao hàng";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const totalSelectedShipments = editableDeliveries.reduce(
    (sum, d) => sum + d.selectedShipments.length,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Xác Nhận Địa Chỉ Giao Hàng
              </h2>
              <p className="text-sm text-white/80 mt-0.5">
                {editableDeliveries.length} địa chỉ • {totalSelectedShipments}{" "}
                mã vận đơn
              </p>
            </div>
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
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          <div className="space-y-6">
            {editableDeliveries.map((delivery, deliveryIndex) => (
              <div
                key={deliveryIndex}
                className="bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden"
              >
                {/* Delivery Header */}
                <div className="bg-blue-600 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 bg-white/20 text-white rounded-full font-semibold">
                      {deliveryIndex + 1}
                    </span>
                    <span className="font-semibold text-white">
                      {delivery.customerCode}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleEdit(deliveryIndex)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors"
                    type="button"
                  >
                    <Edit2 size={16} />
                    {delivery.isEditing ? "Xong" : "Sửa thông tin"}
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Tên Khách Hàng
                      </label>
                      {delivery.isEditing ? (
                        <input
                          type="text"
                          value={delivery.customerName || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              deliveryIndex,
                              "customerName",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">
                          {delivery.customerName || "—"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Số Điện Thoại
                      </label>
                      {delivery.isEditing ? (
                        <input
                          type="text"
                          value={delivery.phoneNumber || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              deliveryIndex,
                              "phoneNumber",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">
                          {delivery.phoneNumber || "—"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        VNPost
                      </label>
                      <div className="flex items-center gap-2 h-10">
                        <input
                          type="checkbox"
                          checked={delivery.isVNpost ?? true}
                          onChange={(e) =>
                            handleFieldChange(
                              deliveryIndex,
                              "isVNpost",
                              e.target.checked
                            )
                          }
                          disabled={!delivery.isEditing}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-700">
                          Giao qua VNPost
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Địa Chỉ
                    </label>
                    {delivery.isEditing ? (
                      <textarea
                        value={delivery.address || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            deliveryIndex,
                            "address",
                            e.target.value
                          )
                        }
                        rows={2}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all resize-none"
                      />
                    ) : (
                      <p className="text-gray-900">{delivery.address || "—"}</p>
                    )}
                  </div>

                  {/* Shipment Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Chọn Mã Vận Đơn ({delivery.selectedShipments.length}/
                      {delivery.shipmentCode?.length || 0})
                    </label>
                    <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {delivery.shipmentCode?.map((code, idx) => {
                          const isSelected =
                            delivery.selectedShipments.includes(code);
                          return (
                            <label
                              key={idx}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-blue-50 border-blue-500"
                                  : "bg-white border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  handleToggleShipment(deliveryIndex, code)
                                }
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
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Tổng:{" "}
            <span className="font-semibold text-gray-900">
              {editableDeliveries.length} địa chỉ
            </span>
            {" • "}
            <span className="font-semibold text-gray-900">
              {totalSelectedShipments} mã vận đơn
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || totalSelectedShipments === 0}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle2 size={18} />
              {loading ? "Đang xử lý..." : "Xác nhận tất cả"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeliveryDialog;
