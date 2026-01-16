import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Package,
  ExternalLink,
  ShoppingCart,
  DollarSign,
  Calendar,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import managerOrderService from "../../Services/Manager/managerOrderService";
import UpdateOrderLink from "./UpdateOrderLink";

const ORDER_TYPE_LABELS = {
  MUA_HO: "Mua hộ",
  KY_GUI: "Ký gửi",
  DICH_VU: "Dịch vụ",
};

const STATUS_LABELS = {
  CHO_XAC_NHAN: "Chờ xác nhận",
  DA_XAC_NHAN: "Đã xác nhận",
  CHO_MUA: "Chờ mua",
  DANG_MUA: "Đang mua",
  DA_MUA: "Đã mua",
  DANG_VE: "Đang về",
  DA_VE: "Đã về",
  HOAN_THANH: "Hoàn thành",
  HUY: "Hủy",
};

const LINK_STATUS_LABELS = {
  CHO_MUA: "Chờ mua",
  DANG_MUA: "Đang mua",
  DA_MUA: "Đã mua",
  DANG_VE: "Đang về",
  DA_VE: "Đã về",
  HUY: "Hủy",
};

const STATUS_COLORS = {
  CHO_XAC_NHAN: "bg-yellow-100 text-yellow-700",
  DA_XAC_NHAN: "bg-blue-100 text-blue-700",
  CHO_MUA: "bg-orange-100 text-orange-700",
  DANG_MUA: "bg-purple-100 text-purple-700",
  DA_MUA: "bg-green-100 text-green-700",
  DANG_VE: "bg-indigo-100 text-indigo-700",
  DA_VE: "bg-teal-100 text-teal-700",
  HOAN_THANH: "bg-emerald-100 text-emerald-700",
  HUY: "bg-red-100 text-red-700",
};

const DetailOrderLink = ({ orderId, isOpen, onClose }) => {
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const data = await managerOrderService.getOrderDetails(orderId);
      setOrderDetail(data);
    } catch (error) {
      console.error("Error fetching order detail:", error);
      toast.error("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isOpen && orderId) fetchOrderDetail();
  }, [isOpen, orderId, fetchOrderDetail]);

  // ✅ Chỉ cho chỉnh sửa khi: status = DA_XAC_NHAN và orderType = MUA_HO
  const canEdit = useMemo(() => {
    if (!orderDetail) return false;
    return (
      orderDetail.status === "DA_XAC_NHAN" && orderDetail.orderType === "MUA_HO"
    );
  }, [orderDetail]);

  const handleOpenUpdate = () => {
    if (!orderDetail) return;

    if (orderDetail.orderType !== "MUA_HO") {
      toast.error("Chỉ được chỉnh sửa với loại đơn: Mua hộ (MUA_HO)");
      return;
    }
    if (orderDetail.status !== "DA_XAC_NHAN") {
      toast.error("Chỉ được chỉnh sửa khi đơn ở trạng thái: Đã xác nhận");
      return;
    }

    setIsUpdateOpen(true);
  };

  const handleUpdateSuccess = () => {
    fetchOrderDetail();
    toast.success("Đã cập nhật thành công!");
  };

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(Number(amount) || 0);
  };

  const formatKRW = (amount) => {
    if (amount === null || amount === undefined) return "0 ₩";
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(Number(amount) || 0);
  };

  const editDisabledReason = useMemo(() => {
    if (!orderDetail) return "";
    if (orderDetail.orderType !== "MUA_HO")
      return "Chỉ chỉnh sửa với loại đơn: Mua hộ (MUA_HO)";
    if (orderDetail.status !== "DA_XAC_NHAN")
      return "Chỉ chỉnh sửa khi trạng thái: Đã xác nhận";
    return "";
  }, [orderDetail]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Package className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Chi Tiết Đơn Hàng
                </h2>
                {orderDetail && (
                  <p className="text-sm text-blue-100">
                    {orderDetail.orderCode}
                  </p>
                )}
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
          <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : !orderDetail ? (
              <div className="p-12 text-center">
                <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">Không có dữ liệu</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="text-blue-600" size={18} />
                      <span className="text-sm font-medium text-gray-600">
                        Loại đơn
                      </span>
                    </div>
                    <p className="text-lg font-bold text-blue-700">
                      {ORDER_TYPE_LABELS[orderDetail.orderType] ||
                        orderDetail.orderType}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="text-green-600" size={18} />
                      <span className="text-sm font-medium text-gray-600">
                        Tổng tiền
                      </span>
                    </div>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(orderDetail.finalPriceOrder)}
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="text-purple-600" size={18} />
                      <span className="text-sm font-medium text-gray-600">
                        Tỷ giá
                      </span>
                    </div>
                    <p className="text-lg font-bold text-purple-700">
                      1 : {orderDetail.exchangeRate}
                    </p>
                  </div>

                  <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="text-orange-600" size={18} />
                      <span className="text-sm font-medium text-gray-600">
                        Trạng thái
                      </span>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        STATUS_COLORS[orderDetail.status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {STATUS_LABELS[orderDetail.status] || orderDetail.status}
                    </span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Ngày tạo:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {formatDate(orderDetail.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">
                        Kiểm tra hàng:
                      </span>
                      <span className="ml-2">
                        {orderDetail.checkRequired ? (
                          <span className="text-green-600 font-semibold">
                            Có
                          </span>
                        ) : (
                          <span className="text-gray-500">Không</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Links Table */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Danh Sách Sản Phẩm ({orderDetail.orderLinks?.length || 0})
                  </h3>

                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                            <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">
                              STT
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold">
                              Tên Sản Phẩm
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">
                              Website
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">
                              SL
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold whitespace-nowrap">
                              Giá Web
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold whitespace-nowrap">
                              Ship Web
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold whitespace-nowrap">
                              Tổng Web
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold whitespace-nowrap">
                              Thành Tiền (VNĐ)
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">
                              Mã Tracking
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap">
                              Trạng Thái
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold whitespace-nowrap">
                              Link
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {orderDetail.orderLinks?.map((link, index) => (
                            <tr
                              key={link.linkId}
                              className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }`}
                            >
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {index + 1}
                              </td>

                              <td className="px-4 py-3">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {link.productName}
                                  </p>
                                  {link.classify && (
                                    <p className="text-xs text-gray-500">
                                      {link.classify}
                                    </p>
                                  )}
                                  {link.groupTag &&
                                    link.groupTag !== "string" && (
                                      <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                        {link.groupTag}
                                      </span>
                                    )}
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                  {link.website}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-center">
                                <span className="font-semibold text-gray-900">
                                  {link.quantity}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-right text-sm text-gray-700 whitespace-nowrap">
                                {formatKRW(link.priceWeb)}
                              </td>

                              <td className="px-4 py-3 text-right text-sm text-gray-700 whitespace-nowrap">
                                {formatKRW(link.shipWeb)}
                              </td>

                              <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 whitespace-nowrap">
                                {formatKRW(link.totalWeb)}
                              </td>

                              <td className="px-4 py-3 text-right text-sm font-bold text-green-600 whitespace-nowrap">
                                {formatCurrency(link.finalPriceVnd)}
                              </td>

                              <td className="px-4 py-3">
                                {link.trackingCode ? (
                                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                                    {link.trackingCode}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400 italic">
                                    Chưa có
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                    STATUS_COLORS[link.status] ||
                                    "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {LINK_STATUS_LABELS[link.status] ||
                                    link.status}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-center">
                                {link.productLink && (
                                  <a
                                    href={link.productLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                    title="Mở link"
                                  >
                                    <ExternalLink size={16} />
                                  </a>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={handleOpenUpdate}
              disabled={loading || !orderDetail || !canEdit}
              title={canEdit ? "Chỉnh sửa đơn hàng" : editDisabledReason}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              type="button"
            >
              Chỉnh sửa đơn hàng
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-all"
              type="button"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      <UpdateOrderLink
        orderId={orderId}
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        onSuccess={handleUpdateSuccess}
      />
    </>
  );
};

export default DetailOrderLink;
