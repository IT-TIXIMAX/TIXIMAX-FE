import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Warehouse, Globe, Home, Package, ChevronRight } from "lucide-react";

// import DashboardWarehouseForeign from "./DashboardWarehouseForeign";
// import DetailDashboardDomestic from "./DetailDashboardDomestic";
// import DashboardWarehouse from "./DashboardWarehouse";

const FEATURES = [
  {
    key: "warehouse-foreign",
    label: "Kho Hàng Ngoại",
    description: "Theo dõi và quản lý hàng hoá tại kho nước ngoài",
    icon: Globe,
    path: "warehouse-foreign",
    barColor: "#3b82f6",
    borderHover: "#93c5fd",
  },
  {
    key: "warehouse-domestic",
    label: "Kho Hàng Nội Địa",
    description: "Theo dõi và quản lý hàng hoá tại kho trong nước",
    icon: Home,
    path: "warehouse-domestic",
    barColor: "#10b981",
    borderHover: "#6ee7b7",
  },
  {
    key: "warehouse-inventory",
    label: "Tổng Quan Kho",
    description: "Báo cáo tổng hợp tồn kho xuất nhập hàng toàn hệ thống",
    icon: Package,
    path: "warehouse-inventory",
    barColor: "#f59e0b",
    borderHover: "#fcd34d",
  },
];

const WarehouseHub = () => {
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
          Quản Lý Kho Hàng
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

export default WarehouseHub;
