// src/components/TrackingOrderCustomer/TrackingOrderCustomer.jsx
import React, { useState, useMemo } from "react";
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
  PackageCheck,
  ArrowRight,
  Filter,
  Box,
} from "lucide-react";
import trackingCustomerService from "../../Services/Customer/trackingCustomerService";

const STATUS_CONFIG = {
  CHO_MUA: {
    label: "Chờ mua",
    color: "bg-amber-500",
    gradient: "from-amber-400 to-amber-600",
    // desc: "Đơn hàng đang chờ được mua hoặc đấu giá",
    icon: Clock,
    order: 1,
  },
  DA_MUA: {
    label: "Đã mua",
    color: "bg-purple-500",
    gradient: "from-purple-400 to-purple-600",
    // desc: "Đã mua hàng từ shop",
    icon: ShoppingCart,
    order: 2,
  },
  DAU_GIA_THANH_CONG: {
    label: "Đấu giá thành công",
    color: "bg-purple-500",
    gradient: "from-purple-400 to-purple-600",
    // desc: "Đấu giá thành công",
    icon: ShoppingCart,
    order: 2,
  },
  DA_NHAP_KHO_NN: {
    label: "Đã về kho NN",
    color: "bg-indigo-500",
    gradient: "from-indigo-400 to-indigo-600",
    // desc: "Hàng đã về kho nước ngoài",
    icon: Warehouse,
    order: 3,
  },
  DANG_CHUYEN_VN: {
    label: "Đang về VN",
    color: "bg-blue-500",
    gradient: "from-blue-400 to-blue-600",
    // desc: "Đang vận chuyển về Việt Nam",
    icon: Ship,
    order: 4,
  },
  DA_NHAP_KHO_VN: {
    label: "Đã về kho VN",
    color: "bg-cyan-500",
    gradient: "from-cyan-400 to-cyan-600",
    // desc: "Hàng đã về kho Việt Nam",
    icon: PackageCheck,
    order: 5,
  },
  DANG_GIAO: {
    label: "Đang giao nội địa",
    color: "bg-orange-500",
    gradient: "from-orange-400 to-orange-600",
    // desc: "Đang giao hàng đến địa chỉ của bạn",
    icon: Truck,
    order: 6,
  },
  DA_GIAO: {
    label: "Đã giao",
    color: "bg-green-500",
    gradient: "from-green-400 to-green-600",
    // desc: "Giao hàng thành công",
    icon: CheckCircle2,
    order: 7,
  },
  DA_HUY: {
    label: "Đã hủy",
    color: "bg-red-500",
    gradient: "from-red-400 to-red-600",
    // desc: "Đơn hàng đã bị hủy",
    icon: XCircle,
    order: 0,
  },
};

const STATUS_GROUPS = {
  CHO_MUA: {
    displayLabel: "Chờ mua",
    statuses: ["CHO_MUA"],
    color: "bg-amber-500",
    gradient: "from-amber-400 to-amber-600",
    icon: Clock,
    order: 1,
  },
  DA_MUA_GROUP: {
    displayLabel: "Đã mua",
    statuses: ["DA_MUA", "DAU_GIA_THANH_CONG"],
    color: "bg-purple-500",
    gradient: "from-purple-400 to-purple-600",
    icon: ShoppingCart,
    order: 2,
  },
  DA_NHAP_KHO_NN: {
    displayLabel: "Đã về kho NN",
    statuses: ["DA_NHAP_KHO_NN"],
    color: "bg-indigo-500",
    gradient: "from-indigo-400 to-indigo-600",
    icon: Warehouse,
    order: 3,
  },
  DANG_CHUYEN_VN: {
    displayLabel: "Đang về VN",
    statuses: ["DANG_CHUYEN_VN"],
    color: "bg-blue-500",
    gradient: "from-blue-400 to-blue-600",
    icon: Ship,
    order: 4,
  },
  DA_NHAP_KHO_VN: {
    displayLabel: "Đã về kho VN",
    statuses: ["DA_NHAP_KHO_VN"],
    color: "bg-cyan-500",
    gradient: "from-cyan-400 to-cyan-600",
    icon: PackageCheck,
    order: 5,
  },
  DANG_GIAO: {
    displayLabel: "Đang giao nội địa",
    statuses: ["DANG_GIAO"],
    color: "bg-orange-500",
    gradient: "from-orange-400 to-orange-600",
    icon: Truck,
    order: 6,
  },
  DA_GIAO: {
    displayLabel: "Đã giao",
    statuses: ["DA_GIAO"],
    color: "bg-green-500",
    gradient: "from-green-400 to-green-600",
    icon: CheckCircle2,
    order: 7,
  },
};

const STATUS_ORDER = [
  "CHO_MUA",
  "DA_MUA",
  "DAU_GIA_THANH_CONG",
  "DA_NHAP_KHO_NN",
  "DANG_CHUYEN_VN",
  "DA_NHAP_KHO_VN",
  "DANG_GIAO",
  "DA_GIAO",
];

const GROUP_ORDER = [
  "CHO_MUA",
  "DA_MUA_GROUP",
  "DA_NHAP_KHO_NN",
  "DANG_CHUYEN_VN",
  "DA_NHAP_KHO_VN",
  "DANG_GIAO",
  "DA_GIAO",
];

const percentageFromStatus = (status) => {
  if (status === "DA_HUY") return 0;
  if (status === "DA_GIAO") return 100;

  const index = STATUS_ORDER.indexOf(status);
  if (index === -1) return 0;

  const totalSteps = STATUS_ORDER.length;
  const currentStep = index + 1;
  return Math.round((currentStep / totalSteps) * 100);
};

const TrackingOrderCustomer = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [selectedStatusGroup, setSelectedStatusGroup] = useState(null);

  const onSearch = async () => {
    setError("");
    setSearched(false);

    const cleanPhone = phoneNumber.trim().replace(/\s+/g, "");

    if (!cleanPhone) {
      setError("Vui lòng nhập số điện thoại");
      setShipments([]);
      return;
    }

    if (!/^(0|\+84)[3|5|7|8|9]\d{8}$/.test(cleanPhone.replace(/\+84/, "0"))) {
      setError("Số điện thoại không hợp lệ. Vui lòng nhập số Việt Nam (10 số)");
      setShipments([]);
      return;
    }

    setLoading(true);
    setShipments([]);
    setExpandedOrders(new Set());
    setSelectedStatusGroup(null);

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

  const resetSearch = () => {
    setPhoneNumber("");
    setShipments([]);
    setError("");
    setSearched(false);
    setExpandedOrders(new Set());
    setSelectedStatusGroup(null);
  };

  const getStatusStyle = (status) => {
    return (
      STATUS_CONFIG[status] || {
        label: status,
        color: "bg-gray-500",
        gradient: "from-gray-400 to-gray-600",
        desc: "Trạng thái không xác định",
        icon: Package,
        order: 0,
      }
    );
  };

  const groupCounts = useMemo(() => {
    if (!searched || shipments.length === 0) return {};

    const counts = {};

    Object.keys(STATUS_GROUPS).forEach((groupKey) => {
      counts[groupKey] = 0;
    });
    counts["DA_HUY"] = 0;

    shipments.forEach((shipment) => {
      if (shipment.status === "DA_HUY") {
        counts["DA_HUY"]++;
        return;
      }

      for (const [groupKey, groupConfig] of Object.entries(STATUS_GROUPS)) {
        if (groupConfig.statuses.includes(shipment.status)) {
          counts[groupKey]++;
          break;
        }
      }
    });

    return counts;
  }, [shipments, searched]);

  const filteredShipments = useMemo(() => {
    if (!selectedStatusGroup) return shipments;

    if (selectedStatusGroup === "DA_HUY") {
      return shipments.filter((s) => s.status === "DA_HUY");
    }

    const groupConfig = STATUS_GROUPS[selectedStatusGroup];
    if (!groupConfig) return shipments;

    return shipments.filter((s) => groupConfig.statuses.includes(s.status));
  }, [shipments, selectedStatusGroup]);

  const activeGroups = useMemo(() => {
    return GROUP_ORDER.filter((groupKey) => groupCounts[groupKey] > 0);
  }, [groupCounts]);

  return (
    <div className="min-h-screen  py-4 px-3">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* HEADER */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg mb-2">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Tra cứu đơn hàng
          </h1>
          <p className="text-sm text-gray-600">
            Theo dõi hành trình vận chuyển của bạn
          </p>
        </div>

        {/* SEARCH BOX */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Phone className="w-4 h-4 text-yellow-500" />
                </div>
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập số điện thoại (10 số)"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all placeholder:text-gray-400"
                  type="tel"
                  maxLength={11}
                />
              </div>
              <button
                onClick={onSearch}
                disabled={loading}
                className="px-5 py-2.5 rounded-lg text-white font-semibold text-sm bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-1.5 min-w-[110px]"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Đang tìm...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Tra cứu
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <CircleAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* RESULTS */}
        {!searched ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Bắt đầu tra cứu
              </h3>
              <p className="text-sm text-gray-600">
                Nhập số điện thoại để xem trạng thái đơn hàng
              </p>
            </div>
          </div>
        ) : shipments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-200 p-5">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CircleAlert className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Không tìm thấy đơn hàng
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  Không có đơn hàng nào với số điện thoại{" "}
                  <strong className="text-yellow-600">{phoneNumber}</strong>
                </p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p className="flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                    Kiểm tra lại số điện thoại
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                    Thử số điện thoại khác đã đăng ký
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-yellow-500 rounded-full"></span>
                    Liên hệ CSKH:{" "}
                    <a
                      href="tel:1900xxxx"
                      className="text-yellow-600 font-semibold hover:underline"
                    >
                      1900 xxxx
                    </a>
                  </p>
                </div>
              </div>
              <button
                onClick={resetSearch}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-semibold rounded-lg flex items-center gap-1.5 text-xs shadow-md hover:shadow-lg transition-all"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> Tra cứu lại
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl shadow-lg p-3.5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-yellow-100">
                      Số điện thoại tra cứu
                    </p>
                    <p className="text-base font-bold">{phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-yellow-100">
                      Tổng số đơn hàng
                    </p>
                    <p className="text-base font-bold">
                      {shipments.length} đơn
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetSearch}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-lg flex items-center gap-1.5 transition-all text-xs"
                >
                  <RefreshCcw className="w-3.5 h-3.5" /> Tra cứu mới
                </button>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3.5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-4 h-4 text-yellow-600" />
                  </div>
                  Quy trình vận chuyển
                </h3>
              </div>

              {/* Desktop Timeline */}
              <div className="hidden lg:block">
                <div className="relative px-2 py-4">
                  <div className="grid grid-cols-7 gap-1 relative">
                    {GROUP_ORDER.map((groupKey, index) => {
                      const groupConfig = STATUS_GROUPS[groupKey];
                      const Icon = groupConfig.icon;
                      const count = groupCounts[groupKey] || 0;
                      const isActive = count > 0;
                      const isSelected = selectedStatusGroup === groupKey;

                      return (
                        <div key={groupKey} className="relative">
                          <button
                            onClick={() =>
                              setSelectedStatusGroup(
                                isSelected ? null : groupKey
                              )
                            }
                            disabled={!isActive}
                            className={`w-full flex flex-col items-center transition-all ${
                              isActive
                                ? "cursor-pointer"
                                : "opacity-30 cursor-not-allowed"
                            }`}
                          >
                            <div
                              className={`relative w-11 h-11 rounded-lg bg-gradient-to-br ${
                                groupConfig.gradient
                              } flex items-center justify-center shadow-md z-10 transform transition-all ${
                                isActive && "hover:scale-105"
                              } ${
                                isSelected
                                  ? "ring-2 ring-yellow-300 scale-105"
                                  : ""
                              }`}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </div>

                            <p className="mt-1.5 text-xs font-semibold text-gray-900 text-center leading-tight">
                              {groupConfig.displayLabel}
                            </p>

                            {count > 0 && (
                              <div className="mt-1 min-w-[24px] h-5 px-2 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                                {count}
                              </div>
                            )}
                          </button>

                          {index < GROUP_ORDER.length - 1 && (
                            <div className="absolute top-5 -right-0.5 z-0">
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mobile Timeline */}
              <div className="lg:hidden space-y-1.5">
                {activeGroups.map((groupKey) => {
                  const groupConfig = STATUS_GROUPS[groupKey];
                  const Icon = groupConfig.icon;
                  const count = groupCounts[groupKey];
                  const isSelected = selectedStatusGroup === groupKey;

                  return (
                    <button
                      key={groupKey}
                      onClick={() =>
                        setSelectedStatusGroup(isSelected ? null : groupKey)
                      }
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-all ${
                        isSelected
                          ? "bg-yellow-50 ring-2 ring-yellow-400 shadow-sm"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${groupConfig.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-semibold text-gray-900">
                          {groupConfig.displayLabel}
                        </p>
                        <p className="text-[10px] text-gray-600">
                          {groupConfig.statuses.length > 1
                            ? `${groupConfig.statuses.length} trạng thái`
                            : STATUS_CONFIG[groupConfig.statuses[0]]?.desc ||
                              ""}
                        </p>
                      </div>
                      <div className="min-w-[28px] h-7 px-2 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                        {count}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Cancelled Orders */}
              {groupCounts["DA_HUY"] > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() =>
                      setSelectedStatusGroup(
                        selectedStatusGroup === "DA_HUY" ? null : "DA_HUY"
                      )
                    }
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-all ${
                      selectedStatusGroup === "DA_HUY"
                        ? "bg-red-50 ring-2 ring-red-400 shadow-sm"
                        : "bg-gray-50 hover:bg-red-50"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-sm">
                      <XCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs font-semibold text-gray-900">
                        Đơn hàng đã hủy
                      </p>
                    </div>
                    <div className="min-w-[28px] h-7 px-2 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                      {groupCounts["DA_HUY"]}
                    </div>
                  </button>
                </div>
              )}

              {/* Filter Info */}
              {selectedStatusGroup && (
                <div className="mt-3 p-2.5 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-yellow-600" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">
                          Đang lọc:{" "}
                          {selectedStatusGroup === "DA_HUY"
                            ? "Đã hủy"
                            : STATUS_GROUPS[selectedStatusGroup]?.displayLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedStatusGroup(null)}
                      className="text-[10px] text-yellow-600 hover:text-yellow-700 font-semibold underline"
                    >
                      Xem tất cả
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Shipments List - Grouped by Status */}
            {filteredShipments.length > 0 ? (
              <div className="space-y-3">
                {(() => {
                  const groupedShipments = {};

                  filteredShipments.forEach((shipment) => {
                    const status = shipment.status;
                    if (!groupedShipments[status]) {
                      groupedShipments[status] = [];
                    }
                    groupedShipments[status].push(shipment);
                  });

                  const sortedGroups = Object.entries(groupedShipments).sort(
                    ([statusA], [statusB]) => {
                      const orderA = STATUS_CONFIG[statusA]?.order || 0;
                      const orderB = STATUS_CONFIG[statusB]?.order || 0;
                      return orderB - orderA;
                    }
                  );

                  return sortedGroups.map(([status, shipmentsInGroup]) => {
                    const statusStyle = getStatusStyle(status);
                    const StatusIcon = statusStyle.icon;

                    return (
                      <div
                        key={status}
                        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                      >
                        {/* Status Group Header */}
                        <div
                          className={`p-3 bg-gradient-to-r ${statusStyle.gradient}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                <StatusIcon className="w-4 h-4 text-white" />
                              </div>
                              <div className="text-white">
                                <h3 className="text-sm font-bold">
                                  {statusStyle.label}
                                </h3>
                                <p className="text-[10px] text-white/90">
                                  {statusStyle.desc}
                                </p>
                              </div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                              <span className="text-white font-bold text-xs">
                                {shipmentsInGroup.length} đơn
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Shipments List */}
                        <div className="divide-y divide-gray-100">
                          {shipmentsInGroup.map((shipment) => {
                            const isExpanded = expandedOrders.has(
                              shipment.orderCode
                            );
                            const progress = percentageFromStatus(
                              shipment.status
                            );

                            return (
                              <div key={shipment.orderCode}>
                                {/* Shipment Row */}
                                <div
                                  className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                  onClick={() =>
                                    toggleExpanded(shipment.orderCode)
                                  }
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      {/* Order Code */}
                                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <h4 className="text-sm font-bold text-gray-900">
                                          {shipment.orderCode}
                                        </h4>
                                        {shipment.shipmentCode && (
                                          <div className="flex items-center gap-1 text-gray-600">
                                            <MapPin className="w-3 h-3 text-yellow-500" />
                                            <span className="text-xs font-medium">
                                              {shipment.shipmentCode}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Progress Bar */}
                                      <div className="mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-[10px] font-semibold text-gray-600">
                                            Tiến độ vận chuyển
                                          </span>
                                          <span className="text-xs font-bold text-yellow-600">
                                            {progress}%
                                          </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                          />
                                        </div>
                                      </div>

                                      {/* Product Count */}
                                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-700">
                                        <Package className="w-3 h-3" />
                                        {shipment.products?.length || 0} sản
                                        phẩm
                                      </div>
                                    </div>

                                    {/* Expand Button */}
                                    <button className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
                                      {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-gray-600" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                  <div className="px-3 pb-3 bg-gradient-to-br from-gray-50 to-white">
                                    {/* Products */}
                                    {shipment.products &&
                                      shipment.products.length > 0 && (
                                        <div className="pt-2">
                                          <h5 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                                            <Package className="w-3.5 h-3.5 text-yellow-600" />
                                            Danh sách sản phẩm (
                                            {shipment.products.length})
                                          </h5>
                                          <div className="space-y-1.5">
                                            {shipment.products.map(
                                              (product, index) => (
                                                <div
                                                  key={index}
                                                  className="bg-white rounded-lg p-2 border border-gray-200 hover:border-yellow-300 hover:shadow-sm transition-all"
                                                >
                                                  <div className="flex items-start gap-2">
                                                    <div className="w-6 h-6 rounded bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center flex-shrink-0">
                                                      <span className="text-[10px] font-bold text-yellow-700">
                                                        {index + 1}
                                                      </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                      <p className="font-semibold text-gray-900 text-xs mb-1">
                                                        {product.productName}
                                                      </p>
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
                                                          className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                                        >
                                                          <ExternalLink className="w-3 h-3" />
                                                          Xem sản phẩm
                                                        </a>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">
                  Không có đơn hàng trong trạng thái này
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TrackingOrderCustomer;
