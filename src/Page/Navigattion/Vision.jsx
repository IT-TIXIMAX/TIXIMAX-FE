import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PICCEO from "../../assets/PICCEO.png";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const labelAnim = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const Vision = () => {
  return (
    <main className="bg-gradient-to-b from-white via-gray-50 to-white py-16 sm:py-20 lg:py-28">
      <div className="px-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="h-1 w-20 bg-gradient-to-r from-yellow-400 to-yellow-500 mx-auto mb-4 rounded-full"></div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-gray-900">
            Hiểu Thêm Về <span className="text-yellow-400">Chúng Tôi</span>
          </h1>
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mt-6 text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed"
        >
          Chúng tôi tin rằng một doanh nghiệp bền vững không chỉ dựa vào lợi
          nhuận, mà dựa vào con người và những giá trị cốt lõi. Tiximax mang sứ
          mệnh kết nối thế giới bằng logistics,thanh toán toàn cầu.
        </motion.p>
      </div>

      <section className="relative max-w-5xl mx-auto mt-12 sm:mt-16 lg:mt-20 px-4">
        {/* Ảnh CEO */}
        <div className="flex justify-center">
          <img
            src={PICCEO}
            alt="CEO"
            className="
              w-[240px] h-[240px]
              sm:w-[320px] sm:h-[320px]
              lg:w-[430px] lg:h-[430px]
              object-cover rounded-full
            "
          />
        </div>

        {/* ===== MOBILE: text grid ===== */}
        <div className="mt-10 grid grid-cols-2 gap-8 sm:hidden">
          <motion.div
            variants={labelAnim}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="font-black text-gray-900 text-xl uppercase tracking-tight mb-3">
              Tầm Nhìn
            </h3>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-yellow-500 font-bold text-sm transition-all duration-300 group"
            >
              <span>Xem thêm</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </motion.div>

          <motion.div
            variants={labelAnim}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="font-black text-gray-900 text-xl uppercase tracking-tight mb-3">
              Sứ Mệnh
            </h3>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-yellow-500 font-bold text-sm transition-all duration-300 group"
            >
              <span>Xem thêm</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </motion.div>

          <motion.div
            variants={labelAnim}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="font-black text-gray-900 text-xl uppercase tracking-tight mb-3">
              Giá Trị Cốt Lõi
            </h3>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-yellow-500 font-bold text-sm transition-all duration-300 group"
            >
              <span>Xem thêm</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </motion.div>

          <motion.div
            variants={labelAnim}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="font-black text-gray-900 text-xl uppercase tracking-tight mb-3">
              Cam Kết
            </h3>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-yellow-500 font-bold text-sm transition-all duration-300 group"
            >
              <span>Xem thêm</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* ===== TABLET/DESKTOP: absolute text ===== */}
        <div className="hidden sm:block">
          {/* Top Left */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="
              absolute left-0 top-0
              -translate-x-2 -translate-y-8
              lg:-translate-x-6 lg:-translate-y-10
              text-center
            "
          >
            <h3 className="font-black text-gray-900 text-2xl lg:text-3xl uppercase tracking-tight mb-3">
              Tầm Nhìn
            </h3>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-yellow-500 font-bold text-base transition-all duration-300 group"
            >
              <span>Xem thêm</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-2 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </motion.div>

          {/* Top Right */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="
              absolute right-0 top-0
              translate-x-2 -translate-y-8
              lg:translate-x-6 lg:-translate-y-10
              text-center
            "
          >
            <h3 className="font-black text-gray-900 text-2xl lg:text-3xl uppercase tracking-tight mb-3">
              Sứ Mệnh
            </h3>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-yellow-500 font-bold text-base transition-all duration-300 group"
            >
              <span>Xem thêm</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-2 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </motion.div>

          {/* Bottom Left */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="
              absolute left-0 bottom-0
              -translate-x-2 translate-y-8
              lg:-translate-x-6 lg:translate-y-10
              text-center
            "
          >
            <h3 className="font-black text-gray-900 text-2xl lg:text-3xl uppercase tracking-tight mb-3">
              Giá Trị Cốt Lõi
            </h3>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-yellow-500 font-bold text-base transition-all duration-300 group"
            >
              <span>Xem thêm</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-2 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </motion.div>

          {/* Bottom Right */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="
              absolute right-0 bottom-0
              translate-x-2 translate-y-8
              lg:translate-x-6 lg:translate-y-10
              text-center
            "
          >
            <h3 className="font-black text-gray-900 text-2xl lg:text-3xl uppercase tracking-tight mb-3">
              Cam Kết
            </h3>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-yellow-500 font-bold text-base transition-all duration-300 group"
            >
              <span>Xem thêm</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-2 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Vision;
