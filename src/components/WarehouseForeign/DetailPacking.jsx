import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  Calendar,
  Ruler,
  Weight,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";
import packingsService from "../../Services/Warehouse/packingsService";
import toast from "react-hot-toast";

const DetailPacking = ({ packingId, onClose }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchWarehouseDetails();
  }, [packingId]);

  const fetchWarehouseDetails = async () => {
    setLoading(true);
    try {
      const data = await packingsService.getPackingWarehouses(packingId);
      setWarehouses(data || []);
    } catch (error) {
      toast.error("Không thể tải chi tiết packing: " + error.message);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusText = (status) => {
    const statusMap = {
      DA_NHAP_KHO: "In Stock",
      CHUA_NHAP_KHO: "Not Yet Received",
      DANG_VAN_CHUYEN: "In Transit",
      DA_GIAO: "Delivered",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      DA_NHAP_KHO: "bg-green-100 text-green-800",
      CHUA_NHAP_KHO: "bg-gray-100 text-gray-800",
      DANG_VAN_CHUYEN: "bg-blue-100 text-blue-800",
      DA_GIAO: "bg-purple-100 text-purple-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Chi tiết Packing
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500/20 rounded-lg p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : warehouses.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không có dữ liệu warehouse</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {warehouses.map((warehouse, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                        warehouse.status
                      )}`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {getStatusText(warehouse.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ID: {warehouse.warehouseId}
                    </span>
                  </div>

                  {/* Tracking Code */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">
                      {warehouse.trackingCode}
                    </h3>
                  </div>

                  {/* Dimensions */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                        <span>Kích thước (cm)</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {warehouse.length} × {warehouse.width} ×{" "}
                        {warehouse.height}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                        <span>Thể tích (m³)</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {warehouse.dim.toFixed(4)}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                        <span>Trọng lượng (kg)</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {warehouse.weight}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                        <span>Trọng lượng thực (kg)</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {warehouse.netWeight}
                      </p>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-gray-600 text-xs mb-2">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Hình ảnh</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {warehouse.image && (
                        <div
                          onClick={() => setSelectedImage(warehouse.image)}
                          className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={warehouse.image}
                            alt="Warehouse"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white opacity-0 hover:opacity-100" />
                          </div>
                        </div>
                      )}
                      {warehouse.imageCheck && (
                        <div
                          onClick={() => setSelectedImage(warehouse.imageCheck)}
                          className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={warehouse.imageCheck}
                            alt="Check"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-white opacity-0 hover:opacity-100" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t border-gray-200">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Ngày tạo: {formatDate(warehouse.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Tổng số:{" "}
              <span className="font-semibold text-gray-900">
                {warehouses.length}
              </span>{" "}
              warehouse
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailPacking;
