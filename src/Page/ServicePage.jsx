import React, { useState } from "react";

const services = [
  {
    id: 1,
    domain: "tiximaxindo.com",
    country:
      "https://upload.wikimedia.org/wikipedia/commons/9/9f/Flag_of_Indonesia.svg",
    vietnamFlag:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/250px-Flag_of_Vietnam.svg.png",
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
      "Fulfillment",
    ],
    estimatedTime: "5-7 ngày",
  },
  {
    id: 2,
    domain: "tiximax.jp",
    country: "https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg",
    vietnamFlag:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/250px-Flag_of_Vietnam.svg.png",
    market: "Japan - VietNam",
    description:
      "Cung cấp dịch vụ vận chuyển - đấu giá - mua hộ từ Nhật Bản về Việt Nam.",
    specialties: [
      "Mua hộ",
      "Vận chuyển",
      "Đấu giá",
      "Ký gửi kho",
      "Thông quan hộ",
      "Fulfillment",
    ],
    estimatedTime: "7-10 ngày",
  },
  {
    id: 3,
    domain: "tiximax.kr",
    country:
      "https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg",
    market: "South Korea - VietNam",
    description:
      "Chuyên vận chuyển - đấu giá - mua hộ từ Hàn Quốc về Việt Nam.",
    specialties: [
      "K-Beauty",
      "Thời trang",
      "Điện tử",
      "Chăm sóc da",
      "Thực phẩm chức năng",
      "Công nghệ",
      "Fulfillment",
    ],
    estimatedTime: "6-9 ngày",
  },
  {
    id: 4,
    domain: "tiximax.us",
    country:
      "https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg",
    market: "USA - VietNam",
    description: "Chuyên vận chuyển - đấu giá - mua hộ từ Mỹ về Việt Nam.",
    specialties: [
      "Công nghệ",
      "Thực phẩm chức năng",
      "Chăm sóc da",
      "Thời trang",
      "Đấu giá đồ cũ",
      "Fulfillment",
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
    <section className="bg-white py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-block">
          <h3 className="text-gray-600 text-sm md:text-base font-semibold uppercase tracking-wider mb-3">
            Mạng lưới toàn cầu
          </h3>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            DỊCH VỤ QUỐC TẾ <span className="text-yellow-400">TIXIMAX</span>
          </h2>
          {/* Yellow underline */}
          <div className="h-1 bg-yellow-400 w-32 mx-auto mb-6"></div>
        </div>

        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          Kết nối toàn cầu - Giao hàng tận nơi với mạng lưới dịch vụ chuyên
          nghiệp thị trường lớn
        </p>
      </div>

      {/* Main Grid */}
      <main className="container mx-auto px-6 sm:px-12 lg:px-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
          {displayedServices.map((service) => (
            <a
              key={service.id}
              href={`https://${service.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-lg border-2 border-gray-200 hover:border-yellow-400 transition-all duration-300 overflow-hidden hover:shadow-xl cursor-pointer block"
            >
              {/* Yellow top border */}
              <div className="h-1 bg-yellow-400"></div>

              {/* Card Content */}
              <div className="p-6">
                {/* Flag & Market */}
                <div className="mb-5 pb-5 border-b border-gray-200">
                  {/* Flags - 2 chiều hoặc 1 chiều */}
                  {service.vietnamFlag ? (
                    <div className="flex items-center justify-center gap-3 mb-4">
                      {/* Flag nguồn */}
                      <img
                        src={service.country}
                        alt={`${service.market} flag`}
                        className="w-16 h-11 rounded shadow-sm object-cover border border-gray-300"
                      />

                      {/* Arrow 2 chiều */}
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-5 h-5 text-yellow-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                          />
                        </svg>
                      </div>

                      {/* Flag Việt Nam */}
                      <img
                        src={service.vietnamFlag}
                        alt="Vietnam flag"
                        className="w-16 h-11 rounded shadow-sm object-cover border border-gray-300"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center mb-4">
                      <img
                        src={service.country}
                        alt={`${service.market} flag`}
                        className="w-16 h-11 rounded shadow-sm object-cover border border-gray-300"
                      />
                    </div>
                  )}

                  {/* Market Badge */}
                  <div className="text-center">
                    <span className="inline-block bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase">
                      {service.market}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors">
                  {service.market}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed text-sm mb-5">
                  {service.description}
                </p>

                {/* Specialties Section */}
                <div className="mb-5 pb-5 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-yellow-400"></div>
                    <span className="text-xs font-bold text-gray-700 uppercase">
                      Chuyên môn
                    </span>
                  </div>

                  {/* Specialty Tags */}
                  <div className="flex flex-wrap gap-2">
                    {service.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-xs font-medium border border-gray-300 hover:bg-yellow-50 hover:border-yellow-400 transition-all duration-200"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Estimated Time */}
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
                      <span className="text-sm text-gray-700 font-medium">
                        Thời gian
                      </span>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">
                      {service.estimatedTime}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="inline-flex items-center justify-center w-full bg-yellow-400 group-hover:bg-yellow-500 text-gray-900 px-4 py-3 rounded font-bold transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <span>Truy cập ngay</span>
                  <svg
                    className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>

                {/* Domain */}
                {/* <p className="text-center text-xs text-gray-500 mt-3 font-mono">
                  {service.domain}
                </p> */}
              </div>
            </a>
          ))}
        </div>

        {/* Toggle Button */}
        {needsToggle && (
          <div className="flex justify-center mb-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-3 px-8 py-3 bg-white hover:bg-gray-50 border-2 border-gray-900 text-gray-900 rounded font-bold transition-all duration-300"
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
        <div className="border-2 border-gray-900 rounded-lg p-8 bg-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left side */}
            <div className="text-center md:text-left">
              <div className="inline-block mb-2">
                <div className="h-1 w-16 bg-yellow-400 mb-3"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Cần tư vấn dịch vụ phù hợp?
              </h3>
              <p className="text-gray-600">
                Đội ngũ nhân viên sẵn sàng hỗ trợ 24/7
              </p>
            </div>

            {/* Right side - Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/contact"
                className="inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded font-bold transition-all duration-300 border-2 border-gray-900"
              >
                Liên hệ tư vấn
              </a>

              <a
                href="/tracking"
                className="inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 rounded font-bold transition-all duration-300 border-2 border-yellow-400"
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
