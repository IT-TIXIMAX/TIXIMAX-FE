import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import managerOrderService from "../../Services/Manager/managerOrderService";

const UpdateOrderLink = ({ orderId, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    priceShip: 0,
    exchangeRate: 1.7,
    checkRequired: false,
    note: "",
    orderLinks: [],
  });

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderData();
    }
  }, [isOpen, orderId]);

  const fetchOrderData = async () => {
    try {
      setLoadingData(true);
      const data = await managerOrderService.getOrderDetails(orderId);

      setFormData({
        priceShip: data.priceShip || 0,
        exchangeRate: data.exchangeRate || 1.7,
        checkRequired: data.checkRequired || false,
        note: data.note || "",
        orderLinks:
          data.orderLinks?.map((link) => ({
            orderLinkId: link.linkId,
            productLink: link.productLink || "",
            productName: link.productName || "",
            quantity: link.quantity || 0,
            priceWeb: link.priceWeb || 0,
            shipWeb: link.shipWeb || 0,
            purchaseFee: link.purchaseFee || 0,
            extraCharge: link.extraCharge || 0,
            purchaseImage: link.purchaseImage || "",
            website: link.website || "",
            note: link.note || "",
            classify: link.classify || "",
            groupTag: link.groupTag || "",
          })) || [],
      });
    } catch (error) {
      console.error("Error fetching order data:", error);
      toast.error("Không thể tải dữ liệu đơn hàng");
    } finally {
      setLoadingData(false);
    }
  };

  if (!isOpen) return null;

  // Helper function để parse số từ string
  const parseNumber = (value, defaultValue = 0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  const parseInt = (value, defaultValue = 0) => {
    const parsed = Number.parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLinkChange = (index, field, value) => {
    setFormData((prev) => {
      const newLinks = [...prev.orderLinks];
      newLinks[index] = {
        ...newLinks[index],
        [field]: value,
      };
      return {
        ...prev,
        orderLinks: newLinks,
      };
    });
  };

  const handleAddLink = () => {
    setFormData((prev) => ({
      ...prev,
      orderLinks: [
        ...prev.orderLinks,
        {
          orderLinkId: null,
          productLink: "",
          productName: "",
          quantity: 1,
          priceWeb: 0,
          shipWeb: 0,
          purchaseFee: 0,
          extraCharge: 0,
          purchaseImage: "",
          website: "",
          note: "",
          classify: "",
          groupTag: "",
        },
      ],
    }));
  };

  const handleRemoveLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      orderLinks: prev.orderLinks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.orderLinks.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 sản phẩm");
      return;
    }

    for (let i = 0; i < formData.orderLinks.length; i++) {
      const link = formData.orderLinks[i];
      if (!link.productName?.trim()) {
        toast.error(`Sản phẩm ${i + 1}: Thiếu tên sản phẩm`);
        return;
      }
      const quantity = parseNumber(link.quantity, 0);
      if (quantity <= 0) {
        toast.error(`Sản phẩm ${i + 1}: Số lượng phải lớn hơn 0`);
        return;
      }
    }

    try {
      setLoading(true);

      // Convert string numbers to actual numbers before sending
      const dataToSend = {
        ...formData,
        priceShip: parseNumber(formData.priceShip),
        exchangeRate: parseNumber(formData.exchangeRate),
        orderLinks: formData.orderLinks.map((link) => ({
          ...link,
          quantity: parseInt(link.quantity),
          priceWeb: parseNumber(link.priceWeb),
          shipWeb: parseNumber(link.shipWeb),
          purchaseFee: parseNumber(link.purchaseFee),
          extraCharge: parseNumber(link.extraCharge),
        })),
      };

      await managerOrderService.updateOrder(orderId, dataToSend);
      toast.success("Cập nhật đơn hàng thành công!");
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating order:", error);
      const errorMessage =
        error?.response?.data?.error || "Không thể cập nhật đơn hàng";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Package className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Cập Nhật Đơn Hàng #{orderId}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto max-h-[calc(95vh-140px)]"
        >
          {loadingData ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông Tin Đơn Hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phí Ship (KRW)
                    </label>
                    <input
                      type="text"
                      value={formData.priceShip}
                      onChange={(e) =>
                        handleChange("priceShip", e.target.value)
                      }
                      placeholder="0"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tỷ Giá <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.exchangeRate}
                      onChange={(e) =>
                        handleChange("exchangeRate", e.target.value)
                      }
                      placeholder="1.7"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-8">
                    <input
                      type="checkbox"
                      id="checkRequired"
                      checked={formData.checkRequired}
                      onChange={(e) =>
                        handleChange("checkRequired", e.target.checked)
                      }
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-0 focus:ring-offset-0"
                    />
                    <label
                      htmlFor="checkRequired"
                      className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                    >
                      Yêu cầu kiểm tra hàng
                    </label>
                  </div>
                </div>
              </div>

              {/* Order Links */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Danh Sách Sản Phẩm ({formData.orderLinks.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Thêm sản phẩm
                  </button>
                </div>

                {formData.orderLinks.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                    <AlertCircle
                      className="mx-auto text-gray-400 mb-2"
                      size={48}
                    />
                    <p className="text-gray-600 font-medium">
                      Chưa có sản phẩm nào
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Nhấn "Thêm sản phẩm" để bắt đầu
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.orderLinks.map((link, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-blue-300 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                              #{index + 1}
                            </span>
                            {link.orderLinkId && (
                              <span className="text-xs text-gray-500">
                                ID: {link.orderLinkId}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Product Link */}
                          <div className="lg:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Link Sản Phẩm
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={link.productLink}
                                onChange={(e) =>
                                  handleLinkChange(
                                    index,
                                    "productLink",
                                    e.target.value
                                  )
                                }
                                placeholder="https://..."
                                className="w-full px-4 py-2.5 pr-10 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                              />
                              {link.productLink && (
                                <a
                                  href={link.productLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700"
                                >
                                  <ExternalLink size={18} />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Website - Changed to text input */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Website
                            </label>
                            <input
                              type="text"
                              value={link.website}
                              onChange={(e) =>
                                handleLinkChange(
                                  index,
                                  "website",
                                  e.target.value
                                )
                              }
                              placeholder="joongonara, bunjang..."
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                            />
                          </div>

                          {/* Product Name */}
                          <div className="lg:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Tên Sản Phẩm{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={link.productName}
                              onChange={(e) =>
                                handleLinkChange(
                                  index,
                                  "productName",
                                  e.target.value
                                )
                              }
                              placeholder="Nhập tên sản phẩm..."
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                            />
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Số Lượng <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={link.quantity}
                              onChange={(e) =>
                                handleLinkChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              placeholder="1"
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                            />
                          </div>

                          {/* Price Web */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Giá Web (KRW)
                            </label>
                            <input
                              type="text"
                              value={link.priceWeb}
                              onChange={(e) =>
                                handleLinkChange(
                                  index,
                                  "priceWeb",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                            />
                          </div>

                          {/* Ship Web */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Ship Web (KRW)
                            </label>
                            <input
                              type="text"
                              value={link.shipWeb}
                              onChange={(e) =>
                                handleLinkChange(
                                  index,
                                  "shipWeb",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                            />
                          </div>

                          {/* Purchase Fee */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Phí Mua Hộ (KRW)
                            </label>
                            <input
                              type="text"
                              value={link.purchaseFee}
                              onChange={(e) =>
                                handleLinkChange(
                                  index,
                                  "purchaseFee",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                            />
                          </div>

                          {/* Extra Charge */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Phụ Thu (KRW)
                            </label>
                            <input
                              type="text"
                              value={link.extraCharge}
                              onChange={(e) =>
                                handleLinkChange(
                                  index,
                                  "extraCharge",
                                  e.target.value
                                )
                              }
                              placeholder="0"
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                            />
                          </div>

                          {/* Classify */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Phân Loại
                            </label>
                            <input
                              type="text"
                              value={link.classify}
                              onChange={(e) =>
                                handleLinkChange(
                                  index,
                                  "classify",
                                  e.target.value
                                )
                              }
                              placeholder="Size, màu..."
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                            />
                          </div>

                          {/* Group Tag */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Tag Nhóm
                            </label>
                            <input
                              type="text"
                              value={link.groupTag}
                              onChange={(e) =>
                                handleLinkChange(
                                  index,
                                  "groupTag",
                                  e.target.value
                                )
                              }
                              placeholder="Tag..."
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                            />
                          </div>

                          {/* Purchase Image */}
                          <div className="lg:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Link Ảnh Mua Hàng
                            </label>
                            <input
                              type="text"
                              value={link.purchaseImage}
                              onChange={(e) =>
                                handleLinkChange(
                                  index,
                                  "purchaseImage",
                                  e.target.value
                                )
                              }
                              placeholder="https://..."
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                            />
                          </div>

                          {/* Note */}
                          <div className="lg:col-span-3">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Ghi Chú Sản Phẩm
                            </label>
                            <textarea
                              value={link.note}
                              onChange={(e) =>
                                handleLinkChange(index, "note", e.target.value)
                              }
                              placeholder="Nhập ghi chú..."
                              rows={2}
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </form>

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
            onClick={handleSubmit}
            disabled={loading || loadingData}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Save size={18} />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrderLink;
