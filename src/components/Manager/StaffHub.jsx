import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, BarChart2, UserPlus, ChevronRight } from "lucide-react";

// import StaffList from "./Staff/StaffList";
// import DashboardKPI from "./Staff/DashboardKPI";
// import CreateAccountStaff from "./Staff/CreateAccountStaff";

const FEATURES = [
  {
    key: "list-staff",
    label: "Danh Sách Nhân Viên",
    description: "Xem và quản lý toàn bộ tài khoản nhân viên trong hệ thống",
    icon: Users,
    path: "list-staff",
    barColor: "#3b82f6",
    borderHover: "#93c5fd",
  },
  {
    key: "performance-staff",
    label: "Hiệu Suất Nhân Viên",
    description: "Theo dõi KPI và đánh giá hiệu suất làm việc từng nhân viên",
    icon: BarChart2,
    path: "performance-staff",
    barColor: "#10b981",
    borderHover: "#6ee7b7",
  },
  {
    key: "create-staff",
    label: "Tạo Tài Khoản Nhân Viên",
    description: "Thêm mới tài khoản và phân quyền cho nhân viên",
    icon: UserPlus,
    path: "create-staff",
    barColor: "#8b5cf6",
    borderHover: "#c4b5fd",
  },
];

const StaffHub = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                Quản Lý Nhân Viên
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
                  <p className="text-2xs font-medium text-gray-500 leading-relaxed">
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

export default StaffHub;
