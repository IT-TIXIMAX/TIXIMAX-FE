import React, { useState } from "react";
import {
  ShoppingCart,
  Truck,
  Zap,
  Package,
  FileCheck,
  Target,
} from "lucide-react";

const services = [
  {
    id: 1,
    domain: "tiximaxindo.com",
    country:
      "https://upload.wikimedia.org/wikipedia/commons/9/9f/Flag_of_Indonesia.svg",
    market: "Indonesia",
    description:
      "Cung cấp dịch vụ vận chuyển - đấu giá - mua hộ 2 chiều Indonesia - Việt Nam.",
    specialties: [
      { name: "Mua hộ", icon: ShoppingCart },
      // { name: "Vận chuyển", icon: Truck },
      { name: "Đấu giá", icon: Zap },
      { name: "Ký gửi kho", icon: Package },
      // { name: "Thông quan hộ", icon: FileCheck },
      { name: "Fulfillment", icon: Target },
    ],
    estimatedTime: "5-7 ngày",
  },
  {
    id: 2,
    domain: "tiximax.jp",
    country: "https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg",
    market: "Japan",
    description:
      "Cung cấp dịch vụ vận chuyển - đấu giá - mua hộ 2 chiều từ Nhật Bản về Việt Nam.",
    specialties: [
      { name: "Mua hộ", icon: ShoppingCart },
      { name: "Vận chuyển", icon: Truck },
      { name: "Đấu giá", icon: Zap },
      { name: "Fulfillment", icon: Package },
      // { name: "Thông quan hộ", icon: FileCheck },
      // { name: "Fulfillment", icon: Target },
    ],
    estimatedTime: "7-10 ngày",
  },
  {
    id: 3,
    domain: "tiximax.kr",
    country:
      "https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg",
    market: "South Korea",
    description:
      "Chuyên vận chuyển - đấu giá - mua hộ từ Hàn Quốc về Việt Nam.",
    specialties: [
      { name: "Mua hộ", icon: ShoppingCart },
      { name: "Vận chuyển", icon: Truck },
      { name: "Fulfillment", icon: Zap },
      { name: "Ký gửi kho", icon: Package },
      // { name: "Thông quan hộ", icon: FileCheck },
      // { name: "Fulfillment", icon: Target },
    ],
    estimatedTime: "6-9 ngày",
  },
  {
    id: 4,
    domain: "tiximax.us",
    country:
      "https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg",
    market: "USA",
    description: "Chuyên vận chuyển - đấu giá - mua hộ từ Mỹ về Việt Nam.",
    specialties: [
      { name: "Mua hộ", icon: ShoppingCart },
      { name: "Vận chuyển", icon: Truck },
      { name: "Đấu giá", icon: Zap },
      { name: "Fulfillment", icon: Package },
      // { name: "Thông quan hộ", icon: FileCheck },
      // { name: "Fulfillment", icon: Target },
    ],
    estimatedTime: "10-14 ngày",
  },
];

const ServicesPage = () => {
  const [showAll, setShowAll] = useState(false);
  const needsToggle = services.length > 8;
  const displayedServices =
    needsToggle && !showAll ? services.slice(0, 8) : services;

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-block">
          <h3 className="text-gray-500 text-sm md:text-base font-medium uppercase tracking-widest mb-3">
            Mạng lưới toàn cầu
          </h3>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">
            DỊCH VỤ QUỐC TẾ <span className="text-yellow-400">TIXIMAX</span>
          </h2>
          <div className="h-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 w-40 mx-auto mb-6 rounded-full"></div>
        </div>

        <p className="text-gray-600 max-w-3xl mx-auto px-4 text-lg leading-relaxed">
          Kết nối toàn cầu - Giao hàng tận nơi với mạng lưới dịch vụ chuyên
          nghiệp thị trường lớn
        </p>
      </div>

      {/* Main Grid */}
      <main className="container mx-auto px-6 sm:px-12 lg:px-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {displayedServices.map((service) => (
            <a
              key={service.id}
              href={`https://${service.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-2xl shadow-lg transition-all duration-500 cursor-pointer block transform hover:-translate-y-2"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-yellow-500/0 group-hover:from-yellow-400/5 group-hover:to-yellow-500/10 transition-all duration-500"></div>

              {/* Card Content */}
              <div className="relative p-8">
                {/* Flag & Market */}
                <div className="mb-6">
                  {/* Flag */}
                  <div className="flex justify-center mb-5">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full"></div>
                      <img
                        src={service.country}
                        alt={`${service.market} flag`}
                        className="relative w-20 h-14 rounded-xl shadow-lg object-cover border-2 border-white ring-2 ring-gray-100"
                      />
                    </div>
                  </div>

                  {/* Market Badge */}
                  <div className="text-center">
                    <span className="inline-block bg-gradient-to-r from-yellow-500 to-yellow-400 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-md">
                      {service.market}
                    </span>
                  </div>
                </div>

                {/* Title */}
                {/* <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center group-hover:text-yellow-600 transition-colors">
                  {service.market}
                </h3> */}

                {/* Description */}
                <p className="text-gray-600 leading-relaxed text-sm mb-6 text-center">
                  {service.description}
                </p>

                {/* Specialties Section - NEW DESIGN */}
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2 mb-5">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 rounded-full border border-yellow-400/50">
                      <svg
                        className="w-3.5 h-3.5 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Chuyên môn
                      </span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  </div>

                  {/* Specialty Grid - với Lucide icons */}
                  <div className="grid grid-cols-2 gap-3">
                    {service.specialties.map((specialty, index) => {
                      const IconComponent = specialty.icon;
                      return (
                        <div
                          key={index}
                          className="group/item relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-xl p-3 border border-gray-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg"
                        >
                          {/* Glow effect on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-yellow-500/0 group-hover/item:from-yellow-400/10 group-hover/item:to-yellow-500/5 transition-all duration-300"></div>

                          {/* Content */}
                          <div className="relative flex items-center gap-2.5">
                            {/* Icon with stronger background */}
                            <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 rounded-lg flex items-center justify-center shadow-md group-hover/item:scale-110 group-hover/item:shadow-lg transition-all duration-300">
                              <IconComponent className="w-4.5 h-4.5 text-white stroke-[2.5]" />
                            </div>

                            {/* Text */}
                            <span className="text-xs font-semibold text-gray-700 leading-tight group-hover/item:text-gray-900 transition-colors">
                              {specialty.name}
                            </span>
                          </div>

                          {/* Bottom accent line */}
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 transform scale-x-0 group-hover/item:scale-x-100 transition-transform duration-300"></div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Estimated Time */}
                <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <svg
                        className="w-5 h-5 text-yellow-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      Thời gian
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 text-base">
                    {service.estimatedTime}
                  </span>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </a>
          ))}
        </div>

        {/* Toggle Button */}
        {needsToggle && (
          <div className="flex justify-center mb-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-3 px-10 py-4 bg-white hover:bg-gray-50 border-2 border-gray-900 text-gray-900 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {showAll ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  <span>Ẩn bớt dịch vụ</span>
                </>
              ) : (
                <>
                  <span>Xem tất cả dịch vụ</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div className="relative overflow-hidden border-2 border-gray-900 rounded-2xl p-10 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #000 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left side */}
            <div className="text-center md:text-left">
              <div className="inline-block mb-3">
                <div className="h-1.5 w-20 bg-gradient-to-r from-yellow-400 to-yellow-500 mb-4 rounded-full"></div>
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
                Cần tư vấn dịch vụ phù hợp?
              </h3>
              <p className="text-gray-600 text-lg">
                Đội ngũ nhân viên sẵn sàng hỗ trợ 24/7
              </p>
            </div>

            {/* Right side - Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/contact"
                className="inline-flex items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-10 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Liên hệ tư vấn
              </a>

              <a
                href="/tracking"
                className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-10 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Tra cứu đơn hàng
              </a>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
};

export default ServicesPage;
