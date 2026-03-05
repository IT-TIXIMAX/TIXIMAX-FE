// import React from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   ShoppingCart,
//   ClipboardList,
//   PackageCheck,
//   XCircle,
//   ChevronRight,
// } from "lucide-react";

// // import OrderList from "./OrderList";
// // import ManagerOrder from "./ManagerOrder";
// // import OrderListCancel from "./OrderListCancel";

// const FEATURES = [
//   {
//     key: "list-orders",
//     label: "Danh Sách Đơn Hàng",
//     description: "Xem và quản lý toàn bộ đơn hàng trong hệ thống",
//     icon: ClipboardList,
//     path: "list-orders",
//     barColor: "#3b82f6",
//     borderHover: "#93c5fd",
//   },
//   {
//     key: "status-orders",
//     label: "Trạng Thái Đơn Hàng",
//     description: "Theo dõi và cập nhật trạng thái xử lý từng đơn hàng",
//     icon: PackageCheck,
//     path: "status-orders",
//     barColor: "#10b981",
//     borderHover: "#6ee7b7",
//   },
//   {
//     key: "cancel-orders",
//     label: "Đơn Hàng Đã Huỷ",
//     description: "Danh sách các đơn hàng đã bị huỷ và lý do huỷ",
//     icon: XCircle,
//     path: "cancel-orders",
//     barColor: "#f43f5e",
//     borderHover: "#fda4af",
//   },
// ];

// const OrderHub = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen">
//       <div className="mx-auto p-6">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 mb-6">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
//               <ShoppingCart size={20} className="text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-semibold text-white">
//                 Quản Lý Đơn Hàng
//               </h1>
//             </div>
//           </div>
//         </div>

//         {/* Feature Cards Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {FEATURES.map((feature) => {
//             const Icon = feature.icon;
//             return (
//               <button
//                 key={feature.key}
//                 type="button"
//                 onClick={() => navigate(feature.path)}
//                 className="bg-white rounded-xl overflow-hidden text-left w-full group shadow-sm hover:shadow-md transition-shadow duration-200"
//                 style={{ border: "1px solid #e5e7eb", borderTop: "none" }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.border = `2px solid ${feature.borderHover}`;
//                   e.currentTarget.style.borderTop = "none";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.border = "1px solid #e5e7eb";
//                   e.currentTarget.style.borderTop = "none";
//                 }}
//               >
//                 {/* Colored top accent bar */}
//                 <div
//                   className="h-1.5 w-full"
//                   style={{ backgroundColor: feature.barColor }}
//                 />

//                 <div className="p-5">
//                   <div className="flex items-start justify-between mb-4">
//                     <div
//                       className="p-3 rounded-xl"
//                       style={{
//                         backgroundColor: `${feature.barColor}18`,
//                         color: feature.barColor,
//                       }}
//                     >
//                       <Icon size={20} />
//                     </div>
//                     <ChevronRight
//                       size={18}
//                       className="text-gray-300 group-hover:translate-x-0.5 transition-all duration-200 mt-1"
//                     />
//                   </div>

//                   <h3 className="text-xl font-semibold text-gray-900 mb-1">
//                     {feature.label}
//                   </h3>
//                   <p className="text-2xs font-semibold text-gray-500 leading-relaxed">
//                     {feature.description}
//                   </p>
//                 </div>
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrderHub;

import React, { useState } from "react";
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
  const [hoveredKey, setHoveredKey] = useState(null);

  return (
    <div className="min-h-screen">
      {/* Header — chuẩn UI */}
      <div
        className="bg-yellow-100 border-b-2 border-yellow-500"
        style={{
          margin: "-32px -32px 0 -32px",
          height: 40,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderRadius: 0,
        }}
      >
        <h1 className="text-xl font-bold text-blue-800 tracking-wide m-0">
          Quản Lý Đơn Hàng
        </h1>
      </div>

      {/* Cards Grid — chuẩn UI */}
      <div style={{ padding: "24px 0 0 0" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const isHovered = hoveredKey === feature.key;
            return (
              <button
                key={feature.key}
                type="button"
                onClick={() => navigate(feature.path)}
                onMouseEnter={() => setHoveredKey(feature.key)}
                onMouseLeave={() => setHoveredKey(null)}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  overflow: "hidden",
                  textAlign: "left",
                  width: "100%",
                  border: isHovered
                    ? `2px solid ${feature.borderHover}`
                    : "1px solid #e5e7eb",
                  borderTop: "none",
                  boxShadow: isHovered
                    ? "0 4px 16px rgba(0,0,0,0.08)"
                    : "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "box-shadow 0.2s, border 0.15s",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {/* Color top bar */}
                <div style={{ height: 5, backgroundColor: feature.barColor }} />

                <div style={{ padding: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        padding: 10,
                        borderRadius: 10,
                        backgroundColor: `${feature.barColor}18`,
                        color: feature.barColor,
                        display: "flex",
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <ChevronRight
                      size={18}
                      style={{
                        color: isHovered ? feature.barColor : "#d1d5db",
                        transform: isHovered ? "translateX(2px)" : "none",
                        transition: "all 0.2s",
                        marginTop: 4,
                      }}
                    />
                  </div>

                  <h3
                    style={{
                      fontSize: 24,
                      fontWeight: 600,
                      color: "#111827",
                      marginBottom: 4,
                      marginTop: 0,
                    }}
                  >
                    {feature.label}
                  </h3>
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 500,
                      color: "#6b7280",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
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
