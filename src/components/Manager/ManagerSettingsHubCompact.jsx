// Version 2: Compact Grid Layout
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiGlobe,
  FiGift,
  FiBox,
  FiMapPin,
  FiTrendingUp,
  FiCreditCard,
  FiMap,
  FiSettings,
} from "react-icons/fi";

const ManagerSettingsHubCompact = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Quản Lý Website",
      description: "Danh sách website TMĐT",
      icon: FiGlobe,
      path: "/manager/website",
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Chương Trình Khuyến Mãi",
      description: "Voucher & ưu đãi",
      icon: FiGift,
      path: "/manager/promotion",
      color: "from-pink-500 to-pink-600",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
    },
    {
      title: "Loại Sản Phẩm",
      description: "Phân loại & phí dịch vụ",
      icon: FiBox,
      path: "/manager/producttype",
      color: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Điểm Đến",
      description: "Điểm đến vận chuyển",
      icon: FiMapPin,
      path: "/manager/transfer",
      color: "from-emerald-500 to-emerald-600",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Tỷ Giá Vận Chuyển",
      description: "Tỷ giá theo tuyến",
      icon: FiTrendingUp,
      path: "/manager/exchange-routes",
      color: "from-indigo-500 to-indigo-600",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Tài Khoản Ngân Hàng",
      description: "Thông tin thanh toán",
      icon: FiCreditCard,
      path: "/manager/cost/paylater",
      color: "from-cyan-500 to-cyan-600",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
    },
    {
      title: "Tuyến Vận Chuyển",
      description: "Cấu hình tuyến đường",
      icon: FiMap,
      path: "/manager/routes",
      color: "from-teal-500 to-teal-600",
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-700 rounded-xl shadow-lg p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-1.5 h-10 md:h-12 bg-white/90 rounded-full shrink-0 shadow-sm" />
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md">
                <FiSettings className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                  Cấu Hình Hệ Thống
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(feature.path)}
                className="group bg-white border-2 border-slate-200 hover:border-blue-400 rounded-xl p-5 transition-all duration-200 shadow-sm hover:shadow-lg text-left"
              >
                <div className="flex flex-col h-full">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-sm`}
                  >
                    <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {feature.description}
                    </p>
                  </div>

                  {/* Gradient Line */}
                  <div
                    className={`h-1 w-full mt-4 rounded-full bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ManagerSettingsHubCompact;
