// src/components/TrackingOrderCustomer/TrackingOrderCustomer.jsx
import React, { useState } from "react";
import {
  Search,
  Package,
  Phone,
  ClipboardList,
  ShoppingCart,
  Warehouse,
  Ship,
  Truck,
  CheckCircle2,
  XCircle,
  CircleAlert,
  MapPin,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  Loader,
  ExternalLink,
  Clock,
  DollarSign,
  PackageCheck,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import trackingCustomerService from "../../Services/Customer/trackingCustomerService";

const STATUS_CONFIG = {
  CHO_MUA: {
    label: "Chờ mua",
    color: "bg-gray-600",
    desc: "Đơn hàng đang chờ được mua",
    icon: Clock,
    order: 1,
  },
  DA_MUA: {
    label: "Đã mua",
    color: "bg-purple-600",
    desc: "Đã mua hàng từ shop",
    icon: ShoppingCart,
    order: 2,
  },
  DAU_GIA_THANH_CONG: {
    label: "Đấu giá OK",
    color: "bg-pink-600",
    desc: "Đấu giá thành công",
    icon: TrendingUp,
    order: 3,
  },
  MUA_SAU: {
    label: "Mua sau",
    color: "bg-orange-600",
    desc: "Đơn hàng sẽ mua sau",
    icon: DollarSign,
    order: 4,
  },
  DA_NHAP_KHO_NN: {
    label: "Nhập kho NN",
    color: "bg-indigo-600",
    desc: "Đã nhập kho nước ngoài",
    icon: Warehouse,
    order: 5,
  },
  DA_DONG_GOI: {
    label: "Đã đóng gói",
    color: "bg-teal-600",
    desc: "Đã đóng gói sẵn sàng vận chuyển",
    icon: Package,
    order: 6,
  },
  DANG_CHUYEN_VN: {
    label: "Đang về VN",
    color: "bg-yellow-600",
    desc: "Đang vận chuyển về Việt Nam",
    icon: Ship,
    order: 7,
  },
  DA_NHAP_KHO_VN: {
    label: "Nhập kho VN",
    color: "bg-cyan-600",
    desc: "Đã về kho Việt Nam",
    icon: Warehouse,
    order: 8,
  },
  CHO_TRUNG_CHUYEN: {
    label: "Chờ trung chuyển",
    color: "bg-lime-600",
    desc: "Chờ được trung chuyển",
    icon: PackageCheck,
    order: 9,
  },
  CHO_GIAO: {
    label: "Chờ giao",
    color: "bg-blue-600",
    desc: "Chuẩn bị giao hàng",
    icon: Truck,
    order: 10,
  },
  DANG_GIAO: {
    label: "Đang giao",
    color: "bg-sky-600",
    desc: "Đang giao hàng cho khách",
    icon: Truck,
    order: 11,
  },
  DA_GIAO: {
    label: "Đã giao",
    color: "bg-green-600",
    desc: "Đã giao thành công",
    icon: CheckCircle2,
    order: 12,
  },
  DA_HUY: {
    label: "Đã hủy",
    color: "bg-red-600",
    desc: "Đơn hàng đã bị hủy",
    icon: XCircle,
    order: 0,
  },
};

const STATUS_ORDER = [
  "CHO_MUA",
  "DA_MUA",
  "DAU_GIA_THANH_CONG",
  "MUA_SAU",
  "DA_NHAP_KHO_NN",
  "DA_DONG_GOI",
  "DANG_CHUYEN_VN",
  "DA_NHAP_KHO_VN",
  "CHO_TRUNG_CHUYEN",
  "CHO_GIAO",
  "DANG_GIAO",
  "DA_GIAO",
];

const percentageFromStatus = (status) => {
  const index = STATUS_ORDER.indexOf(status);
  if (index === -1) return 0;
  if (status === "DA_HUY") return 0;
  if (status === "DA_GIAO") return 100;

  const pct = ((index + 1) / STATUS_ORDER.length) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
};

const TrackingOrderCustomer = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [selectedStatus, setSelectedStatus] = useState(null);

  const onSearch = async () => {
    setError("");
    setSearched(false);

    const cleanPhone = phoneNumber.trim().replace(/\s+/g, "");

    if (!cleanPhone) {
      setError("Vui lòng nhập số điện thoại");
      setShipments([]);
      return;
    }

    if (!/^[0-9]{10,11}$/.test(cleanPhone)) {
      setError("Số điện thoại không hợp lệ (10-11 chữ số)");
      setShipments([]);
      return;
    }

    setLoading(true);
    setShipments([]);
    setExpandedOrders(new Set());
    setSelectedStatus(null);

    try {
      const response = await trackingCustomerService.getShipmentsByPhone(
        cleanPhone
      );

      if (response.data && Array.isArray(response.data)) {
        setShipments(response.data);
        setSearched(true);
        if (response.data.length === 0) {
          setError("Không tìm thấy đơn hàng nào với số điện thoại này");
        }
      } else {
        setShipments([]);
        setSearched(true);
        setError("Không có dữ liệu trả về");
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearched(true);
      if (err.response?.status === 404) {
        setError("Không tìm thấy đơn hàng nào với số điện thoại này");
      } else {
        setError("Lỗi kết nối đến server. Vui lòng thử lại sau.");
      }
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  const toggleExpanded = (orderCode) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderCode)) {
      newExpanded.delete(orderCode);
    } else {
      newExpanded.add(orderCode);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusStyle = (status) => {
    return (
      STATUS_CONFIG[status] || {
        label: status,
        color: "bg-gray-600",
        desc: "Trạng thái không xác định",
        icon: Package,
        order: 0,
      }
    );
  };

  const getStatusCounts = () => {
    const counts = {};
    [...STATUS_ORDER, "DA_HUY"].forEach((status) => {
      counts[status] = 0;
    });

    shipments.forEach((shipment) => {
      if (counts.hasOwnProperty(shipment.status)) {
        counts[shipment.status]++;
      }
    });

    return counts;
  };

  const getFilteredShipments = () => {
    if (!selectedStatus) return shipments;
    return shipments.filter((s) => s.status === selectedStatus);
  };

  const statusCounts =
    searched && shipments.length > 0 ? getStatusCounts() : {};
  const filteredShipments = getFilteredShipments();

  return (
    <div className="space-y-6">
      {/* SEARCH BOX */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 px-3">
            <Phone className="w-7 h-7 text-yellow-600" />
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập số điện thoại (10-11 chữ số)"
              className="w-full text-lg md:text-xl outline-none placeholder:text-gray-400 bg-transparent"
              type="tel"
            />
          </div>
          <button
            onClick={onSearch}
            disabled={loading}
            className="w-full md:w-auto px-8 py-4 rounded-xl text-white font-bold text-lg bg-yellow-600 hover:bg-yellow-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Đang tìm...
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                Tra cứu
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 text-base md:text-lg text-red-700 flex items-center gap-2 justify-center">
            <CircleAlert className="w-5 h-5" /> {error}
          </div>
        )}
      </div>

      {/* RESULTS */}
      {!searched ? (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-10 text-center min-h-[200px] flex items-center justify-center">
          <div>
            <Package className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <p className="text-xl text-gray-700">
              Nhập số điện thoại để tra cứu đơn hàng
            </p>
          </div>
        </div>
      ) : shipments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-10 border-4 border-yellow-400">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <CircleAlert className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  Không tìm thấy đơn hàng
                </h3>
                <p className="text-gray-700 mt-2 text-lg">
                  Không có đơn hàng nào với số điện thoại{" "}
                  <strong>{phoneNumber}</strong>. Vui lòng kiểm tra lại hoặc
                  liên hệ CSKH.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setPhoneNumber("");
                setShipments([]);
                setError("");
                setSearched(false);
              }}
              className="px-7 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl flex items-center gap-2 text-base md:text-lg transition-colors"
            >
              <RefreshCcw className="w-5 h-5" /> Tra cứu lại
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-600">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại tra cứu</p>
                  <p className="text-xl font-bold text-gray-900">
                    {phoneNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Tổng số đơn hàng</p>
                  <p className="text-xl font-bold text-gray-900">
                    {shipments.length} đơn
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-yellow-600" />
              Quy trình vận chuyển
            </h3>

            {/* Desktop Timeline */}
            <div className="hidden lg:block overflow-x-auto">
              <div className="relative min-w-[1200px]">
                {/* Timeline Line */}
                <div className="absolute top-16 left-0 right-0 h-1 bg-gray-200"></div>

                <div className="grid grid-cols-6 gap-4 relative">
                  {STATUS_ORDER.map((status, index) => {
                    const config = STATUS_CONFIG[status];
                    const Icon = config.icon;
                    const count = statusCounts[status] || 0;
                    const isActive = count > 0;
                    const isSelected = selectedStatus === status;

                    return (
                      <div key={status} className="relative">
                        <button
                          onClick={() =>
                            setSelectedStatus(isSelected ? null : status)
                          }
                          className={`w-full flex flex-col items-center transition-all ${
                            isActive
                              ? "cursor-pointer hover:scale-105"
                              : "opacity-50"
                          }`}
                          disabled={!isActive}
                        >
                          {/* Icon Circle */}
                          <div
                            className={`w-14 h-14 rounded-full ${
                              config.color
                            } flex items-center justify-center mb-3 shadow-lg relative z-10 ${
                              isSelected ? "ring-4 ring-yellow-400" : ""
                            }`}
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </div>

                          {/* Status Label */}
                          <p className="text-xs font-semibold text-gray-900 text-center mb-1">
                            {config.label}
                          </p>

                          {/* Count Badge */}
                          {count > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-yellow-500 text-white text-sm font-bold rounded-full">
                              {count}
                            </span>
                          )}
                        </button>

                        {/* Arrow */}
                        {index < STATUS_ORDER.length - 1 && (
                          <ArrowRight className="absolute top-5 -right-5 w-6 h-6 text-gray-400 z-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cancelled Orders */}
              {statusCounts["DA_HUY"] > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() =>
                      setSelectedStatus(
                        selectedStatus === "DA_HUY" ? null : "DA_HUY"
                      )
                    }
                    className={`flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-all ${
                      selectedStatus === "DA_HUY"
                        ? "bg-red-50 ring-2 ring-red-300"
                        : ""
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">
                        Đơn hàng đã hủy
                      </p>
                      <p className="text-sm text-gray-600">
                        Các đơn không được xử lý
                      </p>
                    </div>
                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-3 bg-red-500 text-white text-base font-bold rounded-full">
                      {statusCounts["DA_HUY"]}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Timeline */}
            <div className="lg:hidden space-y-3">
              {STATUS_ORDER.map((status) => {
                const config = STATUS_CONFIG[status];
                const Icon = config.icon;
                const count = statusCounts[status] || 0;
                const isActive = count > 0;
                const isSelected = selectedStatus === status;

                if (!isActive && count === 0) return null;

                return (
                  <button
                    key={status}
                    onClick={() =>
                      setSelectedStatus(isSelected ? null : status)
                    }
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isSelected
                        ? "bg-yellow-50 ring-2 ring-yellow-400"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">
                        {config.label}
                      </p>
                      <p className="text-sm text-gray-600">{config.desc}</p>
                    </div>
                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-3 bg-yellow-500 text-white text-base font-bold rounded-full">
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* Cancelled Orders Mobile */}
              {statusCounts["DA_HUY"] > 0 && (
                <button
                  onClick={() =>
                    setSelectedStatus(
                      selectedStatus === "DA_HUY" ? null : "DA_HUY"
                    )
                  }
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                    selectedStatus === "DA_HUY"
                      ? "bg-red-50 ring-2 ring-red-300"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">Đã hủy</p>
                    <p className="text-sm text-gray-600">Đơn hàng đã bị hủy</p>
                  </div>
                  <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-3 bg-red-500 text-white text-base font-bold rounded-full">
                    {statusCounts["DA_HUY"]}
                  </span>
                </button>
              )}
            </div>

            {/* Filter Info */}
            {selectedStatus && (
              <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                <p className="text-sm font-medium text-gray-900">
                  Đang lọc:{" "}
                  <strong>{STATUS_CONFIG[selectedStatus].label}</strong>
                  <button
                    onClick={() => setSelectedStatus(null)}
                    className="ml-3 text-yellow-600 hover:text-yellow-700 underline"
                  >
                    Xem tất cả
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Shipments List */}
          {filteredShipments.length > 0 ? (
            <div className="space-y-4">
              {filteredShipments.map((shipment) => {
                const isExpanded = expandedOrders.has(shipment.orderCode);
                const statusStyle = getStatusStyle(shipment.status);
                const StatusIcon = statusStyle.icon;
                const progress = percentageFromStatus(shipment.status);

                return (
                  <div
                    key={shipment.orderCode}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100"
                  >
                    {/* Header - Clickable */}
                    <div
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleExpanded(shipment.orderCode)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Order Code & Status */}
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <h3 className="text-2xl font-bold text-gray-900">
                              {shipment.orderCode}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold ${statusStyle.color}`}
                            >
                              <StatusIcon className="w-5 h-5" />
                              {statusStyle.label}
                            </span>
                          </div>

                          {/* Shipment Code */}
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">Mã vận đơn:</span>
                            <span className="font-semibold text-gray-900">
                              {shipment.shipmentCode || "Chưa có"}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Tiến độ vận chuyển
                              </span>
                              <span className="text-lg font-bold text-yellow-600">
                                {progress}%
                              </span>
                            </div>
                            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Product Count */}
                          <div className="mt-3 text-sm text-gray-600">
                            <span className="font-medium">
                              {shipment.products?.length || 0}
                            </span>{" "}
                            sản phẩm
                          </div>
                        </div>

                        {/* Expand Icon */}
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="w-6 h-6 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t-2 border-gray-100">
                        <div className="p-6 bg-gray-50">
                          {/* Status Description */}
                          <div className="mb-6 p-4 bg-white rounded-lg border-l-4 border-yellow-600">
                            <p className="text-gray-700">{statusStyle.desc}</p>
                          </div>

                          {/* Products */}
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Package className="w-5 h-5 text-yellow-600" />
                              Danh sách sản phẩm (
                              {shipment.products?.length || 0})
                            </h4>
                            <div className="space-y-3">
                              {shipment.products?.map((product, index) => (
                                <div
                                  key={index}
                                  className="bg-white rounded-lg p-4 border border-gray-200"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                                          {index + 1}
                                        </span>
                                        <p className="font-semibold text-gray-900">
                                          {product.productName}
                                        </p>
                                      </div>
                                      {product.productLink && (
                                        <a
                                          href={
                                            product.productLink.startsWith(
                                              "http"
                                            )
                                              ? product.productLink
                                              : `https://${product.productLink}`
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          Xem sản phẩm
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                Không có đơn hàng trong trạng thái này
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrackingOrderCustomer;
