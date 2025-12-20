import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Facebook,
  MessageCircle,
  Instagram,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      className="relative text-gray-100 py-16 overflow-hidden border-t-4 border-yellow-400"
      style={{
        backgroundImage:
          "url('https://www.shutterstock.com/image-photo/closeup-detail-view-cargo-cart-600nw-2423113091.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Lớp phủ đen mờ */}
      <div className="absolute inset-0 bg-black/75"></div>

      {/* Hiệu ứng trang trí */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-yellow-400 rotate-45"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-yellow-400 rounded-full"></div>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12 text-white">
          {/* --- Cột 1 & 2: Logo & giới thiệu --- */}
          <div className="md:col-span-2">
            <div className="mb-6 relative inline-block">
              <h2 className="text-4xl font-bold text-yellow-500 px-4 py-2 ">
                TixiLogistics
              </h2>
              <div className="absolute -bottom-2 left-0 w-24 h-0.5 bg-yellow-400"></div>
            </div>

            <p className="leading-relaxed mb-6 max-w-md text-gray-200 mt-6">
              Tiximax Logistics là công ty chuyên cung cấp giải pháp Mua hộ -
              Vận chuyển - Thanh toán xuyên biên giới tuyến Mỹ, Nhật, Hàn,
              Indonesia về Việt Nam. Với nền tảng Tử Tế là cốt lõi, Tiximax cam
              kết mang lại dịch vụ minh bạch, nhanh chóng và đồng hành cùng
              khách hàng phát triển bền vững.
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
              {[
                "ISO 9001:2015",
                "24/7 Support",
                "Nationwide Coverage",
                "Tech-Driven Solutions",
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          {/* --- Cột 3: Thông tin --- */}
          <div>
            <div className="relative mb-6 inline-block">
              <h3 className=" text-xl font-bold text-yellow-500 px-3 py-1 ">
                Thông tin
              </h3>
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-yellow-400"></div>
            </div>

            {/* Nội dung thông tin - nền đen */}
            <div className=" text-gray-200">
              <ul className="space-y-3 text-sm mt-1">
                <li>
                  <a
                    href="/about"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Giới thiệu Tiximax
                  </a>
                </li>
                <li>
                  <a
                    href="/policies"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Quy định chung
                  </a>
                </li>
                <li>
                  <a
                    href="/security"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Chính sách bảo mật
                  </a>
                </li>
                <li>
                  <a
                    href="/careers"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Tuyển dụng
                  </a>
                </li>
                <li>
                  <a
                    href="/qa"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Câu hỏi thường gặp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* --- Cột 4: Dịch vụ --- */}
          {/* --- Cột 4: Dịch vụ --- */}
          <div>
            <div className="relative mb-6 inline-block">
              <h3 className="text-xl font-bold text-yellow-500 px-3 py-1">
                Dịch vụ
              </h3>
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-yellow-400"></div>
            </div>

            {/* Nội dung dịch vụ - nền đen */}
            <div className="text-gray-200">
              <ul className="space-y-3 text-sm mt-1">
                <li>
                  <a
                    href="/services/shipping"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Dịch vụ vận chuyển
                  </a>
                </li>
                <li>
                  <a
                    href="/services/purchase"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Dịch vụ mua hộ
                  </a>
                </li>
                <li>
                  <a
                    href="/services/auction"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Dịch vụ đấu giá
                  </a>
                </li>
                <li>
                  <a
                    href="/services/customs"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Dịch vụ thông quan hộ
                  </a>
                </li>
                <li>
                  <a
                    href="/services/storage"
                    className="hover:text-yellow-400 transition-colors"
                  >
                    Dịch vụ ký gửi kho
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* --- Cột 5: Liên hệ --- */}
          <div>
            <div className="relative mb-6 inline-block">
              <h3 className="text-xl font-bold text-yellow-500 px-3 py-1 ">
                Liên hệ
              </h3>
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-yellow-400"></div>
            </div>

            {/* Nội dung liên hệ - nền đen */}
            <div className=" text-gray-200 ">
              <div className="space-y-4 text-sm mt-1">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-400">Địa chỉ:</p>
                    <p>
                      65 Đ. 9, Hiệp Bình Phước, Thủ Đức, Thành phố Hồ Chí Minh
                      100000.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-400">Hotline:</p>
                    <p className="text-white font-bold text-lg">
                      +84 901 834 283
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-400">Email:</p>
                    <p className="break-all">global.trans@tiximax.net</p>
                  </div>
                </div>
              </div>

              {/* --- Mạng xã hội --- */}
              <div className="mt-6">
                <p className="text-gray-400 text-xs mb-3">
                  Kết nối với chúng tôi:
                </p>
                <div className="flex space-x-3 flex-wrap gap-2">
                  <a
                    href="https://www.linkedin.com/company/tiximax-joint-stock-company"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    title="LinkedIn"
                  >
                    <svg
                      className="w-4 h-4 text-blue-700"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/tiximax.logistics"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    title="Facebook"
                  >
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/tiximax.logistics/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    title="Instagram"
                  >
                    <svg
                      className="w-4 h-4 text-pink-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/@tiximax.logistics"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    title="TikTok"
                  >
                    <svg
                      className="w-4 h-4 text-black"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Phần dưới --- */}
        <div className="border-t border-yellow-400/30 pt-8 text-gray-300">
          <div className="flex justify-center">
            <div className="text-center text-sm max-w-3xl">
              © {new Date().getFullYear()}{" "}
              <span className="text-yellow-400 font-semibold">
                TIXIMAX LOGISTICS
              </span>
              . All rights reserved. |{" "}
              <span className="ml-1">Công ty TNHH TIXIMAX LOGISTICS</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
