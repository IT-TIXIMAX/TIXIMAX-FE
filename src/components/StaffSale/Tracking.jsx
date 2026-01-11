import React, { useMemo, useState, useCallback } from "react";
import {
  FaSearch,
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaDownload,
  FaFilter,
  FaMapMarkerAlt,
  FaTimes,
} from "react-icons/fa";

const STATUS_META = {
  Processing: {
    label: "Đang xử lý",
    icon: FaClock,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    chip: "bg-amber-100 text-amber-700",
    bar: "bg-amber-500",
  },
  "In Transit": {
    label: "Đang vận chuyển",
    icon: FaTruck,
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    chip: "bg-blue-100 text-blue-700",
    bar: "bg-blue-600",
  },
  Delivered: {
    label: "Đã giao",
    icon: FaCheckCircle,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    chip: "bg-emerald-100 text-emerald-700",
    bar: "bg-emerald-600",
  },
  Delayed: {
    label: "Chậm trễ",
    icon: FaExclamationTriangle,
    badge: "bg-red-50 text-red-700 border-red-200",
    chip: "bg-red-100 text-red-700",
    bar: "bg-red-600",
  },
};

const formatDate = (d) => (d ? d : "—");

const Tracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock tracking data
  const trackingData = [
    {
      id: "ORD001",
      customerName: "Nguyễn Văn An",
      product: "iPhone 15 Pro Max",
      status: "In Transit",
      currentLocation: "Warehouse Hà Nội",
      estimatedDelivery: "2024-09-10",
      trackingCode: "TRK12345678",
      route: "US → VN → HN",
      progress: 75,
      timeline: [
        {
          status: "Order Placed",
          date: "2024-09-01",
          location: "Online",
          completed: true,
        },
        {
          status: "Processing",
          date: "2024-09-02",
          location: "US Warehouse",
          completed: true,
        },
        {
          status: "Shipped",
          date: "2024-09-03",
          location: "Los Angeles",
          completed: true,
        },
        {
          status: "In Transit",
          date: "2024-09-06",
          location: "Hà Nội Warehouse",
          completed: true,
        },
        {
          status: "Out for Delivery",
          date: "2024-09-10",
          location: "Local Hub",
          completed: false,
        },
        {
          status: "Delivered",
          date: "2024-09-10",
          location: "Customer Address",
          completed: false,
        },
      ],
    },
    {
      id: "ORD002",
      customerName: "Trần Thị Bình",
      product: "MacBook Air M3",
      status: "Processing",
      currentLocation: "US Warehouse",
      estimatedDelivery: "2024-09-15",
      trackingCode: "TRK23456789",
      route: "US → VN → HCM",
      progress: 25,
      timeline: [
        {
          status: "Order Placed",
          date: "2024-09-05",
          location: "Online",
          completed: true,
        },
        {
          status: "Processing",
          date: "2024-09-06",
          location: "US Warehouse",
          completed: true,
        },
        { status: "Shipped", date: "", location: "", completed: false },
        { status: "In Transit", date: "", location: "", completed: false },
        {
          status: "Out for Delivery",
          date: "",
          location: "",
          completed: false,
        },
        { status: "Delivered", date: "", location: "", completed: false },
      ],
    },
    {
      id: "ORD003",
      customerName: "Lê Minh Châu",
      product: "AirPods Pro 2",
      status: "Delivered",
      currentLocation: "Delivered",
      estimatedDelivery: "2024-09-01",
      trackingCode: "TRK34567890",
      route: "US → VN → DN",
      progress: 100,
      timeline: [
        {
          status: "Order Placed",
          date: "2024-08-25",
          location: "Online",
          completed: true,
        },
        {
          status: "Processing",
          date: "2024-08-26",
          location: "US Warehouse",
          completed: true,
        },
        {
          status: "Shipped",
          date: "2024-08-27",
          location: "Los Angeles",
          completed: true,
        },
        {
          status: "In Transit",
          date: "2024-08-30",
          location: "Đà Nẵng Hub",
          completed: true,
        },
        {
          status: "Out for Delivery",
          date: "2024-09-01",
          location: "Local Delivery",
          completed: true,
        },
        {
          status: "Delivered",
          date: "2024-09-01",
          location: "Customer Address",
          completed: true,
        },
      ],
    },
    {
      id: "ORD004",
      customerName: "Phạm Quốc Đạt",
      product: "iPad Pro 12.9",
      status: "Delayed",
      currentLocation: "Customs",
      estimatedDelivery: "2024-09-12",
      trackingCode: "TRK45678901",
      route: "US → VN → HCM",
      progress: 60,
      timeline: [
        {
          status: "Order Placed",
          date: "2024-08-28",
          location: "Online",
          completed: true,
        },
        {
          status: "Processing",
          date: "2024-08-29",
          location: "US Warehouse",
          completed: true,
        },
        {
          status: "Shipped",
          date: "2024-08-30",
          location: "Los Angeles",
          completed: true,
        },
        {
          status: "In Transit",
          date: "2024-09-04",
          location: "Customs Clearance",
          completed: true,
        },
        {
          status: "Out for Delivery",
          date: "",
          location: "",
          completed: false,
        },
        { status: "Delivered", date: "", location: "", completed: false },
      ],
    },
  ];

  const stats = useMemo(() => {
    const s = { Processing: 0, "In Transit": 0, Delivered: 0, Delayed: 0 };
    trackingData.forEach((o) => (s[o.status] = (s[o.status] || 0) + 1));
    return s;
  }, [trackingData]);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return trackingData.filter((order) => {
      const matchesSearch =
        !term ||
        order.id.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.trackingCode.toLowerCase().includes(term) ||
        order.product.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [trackingData, searchTerm, statusFilter]);

  const StatusBadge = useCallback(({ status }) => {
    const meta = STATUS_META[status];
    const Icon = meta?.icon || FaBox;
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
          meta?.badge || "bg-gray-50 text-gray-700 border-gray-200"
        }`}
      >
        <Icon />
        {meta?.label || status}
      </span>
    );
  }, []);

  return (
    <div className="min-h-screen ">
      <div className="mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Theo dõi đơn hàng
              </h1>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Đang xử lý"
            value={stats["Processing"]}
            icon={FaClock}
            tone="amber"
          />
          <StatCard
            title="Đang vận chuyển"
            value={stats["In Transit"]}
            icon={FaTruck}
            tone="blue"
          />
          <StatCard
            title="Đã giao"
            value={stats["Delivered"]}
            icon={FaCheckCircle}
            tone="emerald"
          />
          <StatCard
            title="Chậm trễ"
            value={stats["Delayed"]}
            icon={FaExclamationTriangle}
            tone="red"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn, tracking, khách hàng, sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-2.5 border border-slate-300 rounded-xl">
                <FaFilter className="text-slate-400 text-sm" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent outline-none text-sm text-slate-700"
                >
                  <option value="All">Tất cả trạng thái</option>
                  <option value="Processing">Đang xử lý</option>
                  <option value="In Transit">Đang vận chuyển</option>
                  <option value="Delivered">Đã giao</option>
                  <option value="Delayed">Chậm trễ</option>
                </select>
              </div>

              {(searchTerm || statusFilter !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All");
                  }}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-800">
              Danh sách đơn hàng{" "}
              <span className="text-slate-500 font-medium">
                ({filteredOrders.length})
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <Th>Đơn hàng</Th>
                  <Th>Khách hàng</Th>
                  <Th>Vị trí hiện tại</Th>
                  <Th>Tiến độ</Th>
                  <Th>Trạng thái</Th>
                  <Th>Dự kiến giao</Th>
                  <Th className="text-right pr-6">Thao tác</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredOrders.map((order) => {
                  const meta = STATUS_META[order.status];
                  const bar = meta?.bar || "bg-slate-500";
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Order */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {order.id}
                            </span>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
                              {order.trackingCode}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-1">
                            {order.product}
                          </p>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                            <span className="text-blue-700 font-semibold text-xs">
                              {order.customerName?.charAt(0) || "K"}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {order.customerName}
                            </p>
                            <p className="text-sm text-slate-500 truncate">
                              {order.route}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-slate-800">
                          <FaMapMarkerAlt className="text-blue-600 text-sm" />
                          <span className="truncate max-w-[240px]">
                            {order.currentLocation}
                          </span>
                        </div>
                      </td>

                      {/* Progress */}
                      <td className="py-4 px-4">
                        <div className="space-y-2 min-w-[180px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">
                              Tiến độ
                            </span>
                            <span className="text-slate-800 font-semibold">
                              {order.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className={`${bar} h-2 rounded-full transition-all duration-300`}
                              style={{ width: `${order.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* ETA */}
                      <td className="py-4 px-4 text-sm text-slate-800">
                        {formatDate(order.estimatedDelivery)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-4 pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition-colors inline-flex items-center gap-2 text-sm"
                            title="Xem chi tiết"
                            type="button"
                          >
                            <FaEye className="text-sm" />
                            Chi tiết
                          </button>

                          <button
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-200 text-slate-600 hover:text-emerald-700 transition-colors"
                            title="Tải xuống"
                            type="button"
                          >
                            <FaDownload className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 mx-auto flex items-center justify-center mb-3">
                  <FaBox className="text-slate-300 text-3xl" />
                </div>
                <p className="text-slate-600 font-medium">
                  Không tìm thấy đơn hàng nào
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Thử đổi từ khóa tìm kiếm hoặc trạng thái lọc.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh]">
              {/* Modal header */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Chi tiết đơn hàng {selectedOrder.id}
                  </h3>
                  <p className="text-sm text-blue-100 mt-0.5 font-mono">
                    {selectedOrder.trackingCode}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
                  type="button"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-72px)]">
                {/* Quick summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500 font-medium mb-1">
                      Khách hàng
                    </p>
                    <p className="font-semibold text-slate-900">
                      {selectedOrder.customerName}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500 font-medium mb-1">
                      Sản phẩm
                    </p>
                    <p className="font-semibold text-slate-900 line-clamp-1">
                      {selectedOrder.product}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs text-slate-500 font-medium mb-1">
                      Trạng thái
                    </p>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                          STATUS_META[selectedOrder.status]?.badge ||
                          "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        {React.createElement(
                          STATUS_META[selectedOrder.status]?.icon || FaBox,
                          { className: "mr-2" }
                        )}
                        {STATUS_META[selectedOrder.status]?.label ||
                          selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="rounded-2xl border border-slate-200 p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-900">
                      Tiến độ vận chuyển
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {selectedOrder.progress}%
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className={`${
                        STATUS_META[selectedOrder.status]?.bar || "bg-slate-600"
                      } h-2.5 rounded-full`}
                      style={{ width: `${selectedOrder.progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Vị trí hiện tại:{" "}
                      <b className="text-slate-700">
                        {selectedOrder.currentLocation}
                      </b>
                    </span>
                    <span>
                      Dự kiến giao:{" "}
                      <b className="text-slate-700">
                        {formatDate(selectedOrder.estimatedDelivery)}
                      </b>
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="rounded-2xl border border-slate-200 p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">
                    Lịch trình vận chuyển
                  </h4>
                  <div className="space-y-4">
                    {selectedOrder.timeline.map((step, idx) => {
                      const isDone = !!step.completed;
                      return (
                        <div key={idx} className="flex items-start gap-4">
                          <div className="relative">
                            <div
                              className={`w-4 h-4 rounded-full mt-1 border ${
                                isDone
                                  ? "bg-emerald-500 border-emerald-500"
                                  : "bg-white border-slate-300"
                              }`}
                            />
                            {idx !== selectedOrder.timeline.length - 1 && (
                              <div className="absolute left-1/2 -translate-x-1/2 top-6 w-px h-10 bg-slate-200" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <p
                                className={`font-semibold ${
                                  isDone ? "text-slate-900" : "text-slate-500"
                                }`}
                              >
                                {step.status}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatDate(step.date)}
                              </p>
                            </div>
                            {step.location ? (
                              <p className="text-sm text-slate-600 mt-0.5">
                                {step.location}
                              </p>
                            ) : (
                              <p className="text-sm text-slate-400 mt-0.5">
                                Chưa cập nhật
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer actions */}
                <div className="mt-6 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors inline-flex items-center gap-2"
                  >
                    <FaDownload />
                    Tải báo cáo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** --------- Small UI helpers --------- */
const Th = ({ children, className = "" }) => (
  <th
    className={`text-left py-3 px-4 font-semibold text-slate-700 text-sm ${className}`}
  >
    {children}
  </th>
);

const StatCard = ({ title, value, icon: Icon, tone = "blue" }) => {
  const toneMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-700", ring: "border-blue-200" },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      ring: "border-amber-200",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      ring: "border-emerald-200",
    },
    red: { bg: "bg-red-50", text: "text-red-700", ring: "border-red-200" },
  };
  const t = toneMap[tone] || toneMap.blue;

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${t.text}`}>{value}</p>
        </div>
        <div
          className={`w-11 h-11 ${t.bg} ${t.ring} border rounded-2xl flex items-center justify-center`}
        >
          <Icon className={`${t.text}`} />
        </div>
      </div>
    </div>
  );
};

export default Tracking;
