// import React from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Wallet,
//   Receipt,
//   RotateCcw,
//   BarChart2,
//   FileText,
//   TrendingUp,
//   ChevronRight,
// } from "lucide-react";

// // import ManagerExpense from "./ManagerExpense";
// // import RefundOrder from "./RefundOrder";
// // import ManagerChartPayment from "./ManagerChartPayment";
// // import PaymentOrderList from "./PaymentOrderList";
// // import DashboardManagerProfit from "./DashboardManagerProfit";

// const FEATURES = [
//   {
//     key: "expense",
//     label: "Quản Lý Chi Phí",
//     description: "Theo dõi và kiểm soát các khoản chi phí phát sinh",
//     icon: Receipt,
//     path: "expense",
//     barColor: "#f59e0b",
//     borderHover: "#fcd34d",
//   },
//   {
//     key: "refund",
//     label: "Hoàn Tiền Đơn Hàng",
//     description: "Xử lý các yêu cầu hoàn tiền và tra cứu lịch sử hoàn trả",
//     icon: RotateCcw,
//     path: "refund",
//     barColor: "#f43f5e",
//     borderHover: "#fda4af",
//   },
//   {
//     key: "payment-analytics",
//     label: "Phân Tích Thanh Toán",
//     description: "Biểu đồ và báo cáo tổng hợp doanh thu theo thời gian",
//     icon: BarChart2,
//     path: "payment-analytics",
//     barColor: "#3b82f6",
//     borderHover: "#93c5fd",
//   },
//   {
//     key: "quote",
//     label: "Danh Sách Báo Giá",
//     description: "Quản lý các đơn báo giá và trạng thái thanh toán",
//     icon: FileText,
//     path: "quote",
//     barColor: "#10b981",
//     borderHover: "#6ee7b7",
//   },
//   {
//     key: "profit",
//     label: "Báo Cáo Công Nợ",
//     description: "Thống kê công nợ theo kỳ và so sánh hiệu quả kinh doanh",
//     icon: TrendingUp,
//     path: "profit",
//     barColor: "#8b5cf6",
//     borderHover: "#c4b5fd",
//   },
// ];

// const FinanceHub = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen">
//       <div className="mx-auto p-6">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 mb-6">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
//               <Wallet size={20} className="text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-semibold text-white">
//                 Quản Lý Tài Chính
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

// export default FinanceHub;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  Receipt,
  RotateCcw,
  BarChart2,
  FileText,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

// import ManagerExpense from "./ManagerExpense";
// import RefundOrder from "./RefundOrder";
// import ManagerChartPayment from "./ManagerChartPayment";
// import PaymentOrderList from "./PaymentOrderList";
// import DashboardManagerProfit from "./DashboardManagerProfit";

const FEATURES = [
  {
    key: "expense",
    label: "Quản Lý Chi Phí",
    description: "Theo dõi và kiểm soát các khoản chi phí phát sinh",
    icon: Receipt,
    path: "expense",
    barColor: "#f59e0b",
    borderHover: "#fcd34d",
  },
  {
    key: "refund",
    label: "Hoàn Tiền Đơn Hàng",
    description: "Xử lý các yêu cầu hoàn tiền và tra cứu lịch sử hoàn trả",
    icon: RotateCcw,
    path: "refund",
    barColor: "#f43f5e",
    borderHover: "#fda4af",
  },
  {
    key: "payment-analytics",
    label: "Phân Tích Thanh Toán",
    description: "Biểu đồ và báo cáo tổng hợp doanh thu theo thời gian",
    icon: BarChart2,
    path: "payment-analytics",
    barColor: "#3b82f6",
    borderHover: "#93c5fd",
  },
  {
    key: "quote",
    label: "Danh Sách Báo Giá",
    description: "Quản lý các đơn báo giá và trạng thái thanh toán",
    icon: FileText,
    path: "quote",
    barColor: "#10b981",
    borderHover: "#6ee7b7",
  },
  {
    key: "profit",
    label: "Báo Cáo Công Nợ",
    description: "Thống kê công nợ theo kỳ và so sánh hiệu quả kinh doanh",
    icon: TrendingUp,
    path: "profit",
    barColor: "#8b5cf6",
    borderHover: "#c4b5fd",
  },
];

const FinanceHub = () => {
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
          Quản Lý Tài Chính
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

export default FinanceHub;
