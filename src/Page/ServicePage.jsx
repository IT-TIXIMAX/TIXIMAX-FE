import React, { useState } from "react";

const services = [
  // {
  //   id: 7,
  //   domain: "tiximax.vn",
  //   country:
  //     "https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Vietnam.svg",
  //   market: "Vietnam",
  //   description:
  //     "Tuyến nội địa và đầu mối gom hàng toàn quốc, kết nối tất cả tuyến quốc tế.",
  //   specialties: ["Kho vận", "Giao hàng nội địa", "Hỗ trợ doanh nghiệp"],
  //   estimatedTime: "1–3 ngày",
  // },
  {
    id: 1,
    domain: "tiximaxindo.com",
    country:
      "https://upload.wikimedia.org/wikipedia/commons/9/9f/Flag_of_Indonesia.svg",
    market: "Indonesia - VietNam",
    description:
      "Cung cấp dịch vụ vận chuyển - đấu giá - mua hộ 2 chiều Indonesia - Việt Nam.",
    specialties: [
      "Mua hộ",
      "Vận chuyển",
      "Đấu giá",
      "Ký gửi kho",
      "Phụ tùng xe máy",
      "Thông quan hộ",
    ],
    estimatedTime: "5-7 ngày",
  },
  {
    id: 2,
    domain: "tiximax.jp",
    country: "https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg",
    market: "Japan - VietNam",
    description:
      "CCung cấp dịch vụ vận chuyển - đấu giá - mua hộ từ Nhật Bản về Việt Nam.",
    specialties: [
      "Mua hộ",
      "Vận chuyển",
      "Đấu giá",
      "Ký gửi kho",
      "Thông quan hộ",
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
      "Làm đẹp Hàn Quốc (K-Beauty)",
      "Thời trang",
      "Điện tử",
      "Chăm sóc da",
      "Thực phẩm chức năng",
      "Công nghệ",
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
      "Công nghệ",
      "Thực phẩm chức năng",
      "Sách",
      "Chăm sóc da",
      "Thời trang",
      "Đấu giá đồ cũ",
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
    <section className="bg-gray-50 py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <h3 className="text-gray-600 text-sm md:text-base font-semibold uppercase tracking-wider mb-3">
          Mạng lưới toàn cầu
        </h3>
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
          DỊCH VỤ QUỐC TẾ <span className="text-yellow-400">TIXIMAX</span>
        </h2>

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-24 h-0.5 bg-gray-300"></div>
          <div className="w-3 h-3 bg-yellow-400 rotate-45"></div>
          <div className="w-24 h-0.5 bg-gray-300"></div>
        </div>
      </div>

      {/* Main — căn lề theo PromotionPage */}
      <main className="container mx-auto px-12 lg:px-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {displayedServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-yellow-400 group"
            >
              {/* Flag & Market */}
              <div className="flex items-center justify-between mb-4">
                <img
                  src={service.country}
                  alt={`${service.market} flag`}
                  className="w-12 h-8 rounded shadow-sm object-cover border border-gray-200"
                />
                <span className="bg-yellow-400 text-gray-900 px-3 py-1.5 rounded-full text-xs font-bold uppercase min-w-[96px] text-center">
                  {service.market}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                {service.market}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm mb-4">
                {service.description}
              </p>

              {/* Specialties */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-gray-700 uppercase">
                    Chuyên môn
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {service.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div className="mb-5 pb-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-600"
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
                    <span className="text-sm text-gray-600 font-medium">
                      Thời gian:
                    </span>
                  </div>
                  <span className="font-bold text-yellow-600 text-sm">
                    {service.estimatedTime}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <a
                href={`https://${service.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 shadow hover:shadow-md group/btn"
              >
                <span>Truy cập ngay</span>
                <svg
                  className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <p className="text-center text-xs text-gray-400 mt-2 font-medium select-all">
                {service.domain}
              </p>
            </div>
          ))}
        </div>

        {/* Toggle nếu >8 */}
        {needsToggle && (
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-yellow-50 border-2 border-yellow-400 text-gray-900 rounded-full shadow-sm hover:shadow-md transition-all duration-300 font-bold"
            >
              {showAll ? (
                <>
                  <span>Ẩn bớt</span>
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
      </main>
    </section>
  );
};

export default ServicesPage;
