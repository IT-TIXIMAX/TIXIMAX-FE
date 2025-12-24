// src/Components/StaffPurchase/CreateExchangeMoney.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import createPurchaseService from "../../Services/StaffPurchase/createPurchaseService";
import UploadImg from "../../common/UploadImg";
import { ArrowRightLeft, Image as ImageIcon, FileText } from "lucide-react";

const getBackendErrorMessage = (error) => {
  const data = error?.response?.data;
  if (data) {
    const be =
      data.error || data.message || data.detail || data.errors || data.title;
    if (be) {
      if (typeof be === "object" && !Array.isArray(be)) {
        return Object.entries(be)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
      }
      if (Array.isArray(be)) return be.join(", ");
      return String(be);
    }
  }
  if (error?.response?.status) return `Lỗi ${error.response.status}`;
  return "Không thể kết nối tới server.";
};

const CreateExchangeMoney = ({ isOpen, onClose, orderCode, onSuccess }) => {
  const [data, setData] = useState({ image: "", note: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setData({ image: "", note: "" });
  }, [isOpen]);

  const handleClose = () => {
    setData({ image: "", note: "" });
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!orderCode) {
      toast.error("Order code không hợp lệ");
      return;
    }
    if (!data.image || data.image === "string") {
      toast.error("Vui lòng upload ảnh");
      return;
    }

    setLoading(true);
    try {
      await createPurchaseService.createMoneyExchangePurchase(orderCode, {
        image: data.image,
        note: data.note || "",
      });

      toast.success("Tạo đơn mua chuyển tiền thành công!");
      handleClose();
      onSuccess?.();
    } catch (error) {
      toast.error(getBackendErrorMessage(error), { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span className="inline-block w-1 h-6 bg-blue-600 rounded" />
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                Money Exchange Purchase
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Order Code: <span className="font-semibold">{orderCode}</span>
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <UploadImg
              imageUrl={data.image}
              onImageUpload={(url) =>
                setData((prev) => ({ ...prev, image: url }))
              }
              onImageRemove={() => setData((prev) => ({ ...prev, image: "" }))}
              label="Exchange Image"
              required={true}
              maxSizeMB={3}
            />

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <FileText className="w-4 h-4" />
                Ghi chú (optional)
              </label>
              <textarea
                value={data.note}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, note: e.target.value }))
                }
                rows={3}
                className="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:border-black focus:ring-0 outline-none"
                placeholder="Nhập ghi chú..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || !data.image}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              )}
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExchangeMoney;
