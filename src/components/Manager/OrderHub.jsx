import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ClipboardList,
  PackageCheck,
  XCircle,
  ChevronRight,
} from "lucide-react";

// import OrderList from "./OrderList";
// import ManagerOrder from "./ManagerOrder";
// import OrderListCancel from "./OrderListCancel";

const FEATURES = [
  {
    key: "list-orders",
    label: "Danh Sách Đơn Hàng",
    description: "Xem và quản lý toàn bộ đơn hàng trong hệ thống",
    icon: ClipboardList,
    path: "list-orders",
    barColor: "#3b82f6",
    borderHover: "#93c5fd",
  },
  {
    key: "status-orders",
    label: "Trạng Thái Đơn Hàng",
    description: "Theo dõi và cập nhật trạng thái xử lý từng đơn hàng",
    icon: PackageCheck,
    path: "status-orders",
    barColor: "#10b981",
    borderHover: "#6ee7b7",
  },
  {
    key: "cancel-orders",
    label: "Đơn Hàng Đã Huỷ",
    description: "Danh sách các đơn hàng đã bị huỷ và lý do huỷ",
    icon: XCircle,
    path: "cancel-orders",
    barColor: "#f43f5e",
    borderHover: "#fda4af",
  },
];

const OrderHub = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                Quản Lý Đơn Hàng
              </h1>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.key}
                type="button"
                onClick={() => navigate(feature.path)}
                className="bg-white rounded-xl overflow-hidden text-left w-full group shadow-sm hover:shadow-md transition-shadow duration-200"
                style={{ border: "1px solid #e5e7eb", borderTop: "none" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = `2px solid ${feature.borderHover}`;
                  e.currentTarget.style.borderTop = "none";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid #e5e7eb";
                  e.currentTarget.style.borderTop = "none";
                }}
              >
                {/* Colored top accent bar */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: feature.barColor }}
                />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        backgroundColor: `${feature.barColor}18`,
                        color: feature.barColor,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-300 group-hover:translate-x-0.5 transition-all duration-200 mt-1"
                    />
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {feature.label}
                  </h3>
                  <p className="text-2xs font-semibold text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderHub;
