import React, { useEffect, useState } from "react";

const services = [
  {
    id: 1,
    title: "Dịch Vụ Vận Chuyển",
    path: "/services/shipping",
    description:
      "Dịch vụ vận chuyển quốc tế trọn gói tuyến Mỹ, Nhật, Hàn, Indonesia về Việt Nam. Tiximax cam kết quy trình minh bạch, tối ưu cước phí và thời gian vận chuyển nhanh chóng. Chúng tôi đảm bảo hàng hóa đến tay bạn an toàn và đúng hẹn, giúp bạn tiết kiệm chi phí logistics tối đa.",
    image:
      "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500&q=80",
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Dịch Vụ Mua Hộ",
    path: "/services/purchase",
    description:
      "Cần mua hộ hàng Mỹ, Nhật, Hàn, Indonesia? Đội ngũ Tiximax giúp bạn mua sắm tại mọi website. Cam kết mua đúng link, đúng sản phẩm với mức phí ưu đãi nhất. Sử dụng dịch vụ mua hộ để tiếp cận hàng hóa toàn cầu chính hãng mà không cần thẻ quốc tế phức tạp.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&q=80",
    // brands: ["Amazon", "eBay", "Walmart", "Zara"],
  },
  {
    id: 3,
    title: "Dịch Vụ Đấu Giá",
    path: "/services/auction",
    description:
      "Thỏa sức săn hàng độc và giá trị cao từ các sàn đấu giá eBay, Yahoo Auction. Dịch vụ đấu giá hộ Tiximax giúp bạn tham gia đấu giá an toàn, dễ dàng, tăng cơ hội thắng với mức phí cạnh tranh. Nhận tư vấn chi tiết quy trình và thủ tục nhanh chóng.",
    image:
      "https://images.unsplash.com/photo-1505778276668-26b3ff7af103?w=500&q=80",
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Dịch Vụ Thông Quan Hộ",
    path: "/services/customs",
    description:
      "Giải pháp thông quan hải quan chuyên nghiệp cho hàng hóa xuất nhập khẩu số lượng lớn. Tiximax giúp bạn xử lý toàn bộ thủ tục pháp lý, hồ sơ hải quan nhanh gọn, tránh rủi ro và phạt. Đảm bảo lô hàng được thông quan suôn sẻ, đúng luật và tối ưu thời gian.",
    image:
      "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=500&q=80",
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
    ),
  },
  {
    id: 5,
    title: "Dịch Vụ Ký Gửi Kho",
    path: "/services/storage",
    description:
      "Dịch vụ ký gửi kho hàng và gom hàng tại Mỹ, Nhật, Hàn miễn phí trong thời gian quy định. Tiximax cung cấp địa chỉ kho uy tín, hỗ trợ kiểm đếm, đóng gói chuẩn quốc tế. Tận dụng ký gửi kho để tối ưu chi phí vận chuyển và gom đơn hàng tiện lợi.",
    image:
      "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&q=80",
    icon: (
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

const Service = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      const maxIndex = services.length - itemsPerView;
      return prev >= maxIndex ? 0 : prev + 1;
    });
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      const maxIndex = services.length - itemsPerView;
      return prev === 0 ? maxIndex : prev - 1;
    });
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const goToSlide = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const maxIndicator = Math.max(1, services.length - itemsPerView + 1);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 uppercase">
            CÁC DỊCH VỤ CỦA TIXIMAX
          </h2>

          {/* Decorative underline */}
          <div className="flex items-center justify-center">
            <div className="w-32 h-1 bg-yellow-400"></div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-7xl mx-auto">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-12 h-24 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors duration-300 shadow-lg"
            aria-label="Previous"
            type="button"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Services Carousel */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-600 ease-in-out"
              style={{
                transform: `translateX(-${
                  (currentIndex * 100) / itemsPerView
                }%)`,
              }}
            >
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex-shrink-0 px-3"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  {/* Entire card is clickable (href) */}
                  <a
                    href={service.path}
                    className="flex flex-col items-center text-center group cursor-pointer"
                    aria-label={service.title}
                    title={service.title}
                  >
                    {/* Image Container */}
                    <div className="relative mb-6 w-full">
                      <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-gray-200 group-hover:border-yellow-400 transition-colors duration-300 shadow-lg">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        {/* Overlay with icon */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                          <div className="text-white">
                            {service.icon || null}
                          </div>
                        </div>
                      </div>

                      {/* Brands badges (optional) */}
                      {service.brands && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-wrap gap-2 justify-center max-w-xs">
                          {service.brands.map((brand, index) => (
                            <span
                              key={index}
                              className="bg-white px-2 py-1 rounded text-xs font-semibold text-gray-700 shadow-md"
                            >
                              {brand}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="px-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-12 h-24 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors duration-300 shadow-lg"
            aria-label="Next"
            type="button"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: maxIndicator }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`transition-all duration-300 disabled:cursor-not-allowed ${
                currentIndex === index
                  ? "w-8 h-2 bg-yellow-400"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              } rounded-full`}
              aria-label={`Go to slide ${index + 1}`}
              type="button"
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <a
            href="/services"
            className="inline-flex bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Xem tất cả dịch vụ
          </a>
        </div>
      </div>
    </section>
  );
};

export default Service;
