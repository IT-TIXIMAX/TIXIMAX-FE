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
    <main className="bg-gray-50 py-14 sm:py-16 lg:py-20">
      <div className="px-4">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-wide text-gray-900"
        >
          Hiểu Thêm Về Chúng Tôi
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mt-5 sm:mt-6 text-gray-600 text-base sm:text-lg leading-relaxed"
        >
          Chúng tôi tin rằng một doanh nghiệp bền vững không chỉ dựa vào lợi
          nhuận, mà dựa vào con người và những giá trị cốt lõi. Tiximax mang sứ
          mệnh kết nối thế giới bằng logistics, thanh toán và mua bán toàn cầu.
        </motion.p>
      </div>

      <section className="relative max-w-5xl mx-auto mt-12 sm:mt-16 lg:mt-20 px-4">
        {/* Ảnh: không bg, không blur, không ring */}
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

        {/* ===== MOBILE: text grid (không bg) ===== */}
        <div className="mt-8 grid grid-cols-2 gap-6 sm:hidden">
          <motion.div
            variants={labelAnim}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="font-bold text-gray-900 text-lg uppercase">
              Tầm Nhìn
            </h3>
            <Link
              to="/about#vision"
              className="mt-2 inline-block text-amber-600 font-semibold text-sm hover:text-amber-700 transition-colors"
            >
              Xem thêm &gt;&gt;
            </Link>
          </motion.div>

          <motion.div
            variants={labelAnim}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="font-bold text-gray-900 text-lg uppercase">
              Sứ Mệnh
            </h3>
            <Link
              to="/about#mission"
              className="mt-2 inline-block text-amber-600 font-semibold text-sm hover:text-amber-700 transition-colors"
            >
              Xem thêm &gt;&gt;
            </Link>
          </motion.div>

          <motion.div
            variants={labelAnim}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="font-bold text-gray-900 text-lg uppercase">
              Giá Trị Cốt Lõi
            </h3>
            <Link
              to="/about#core-values"
              className="mt-2 inline-block text-amber-600 font-semibold text-sm hover:text-amber-700 transition-colors"
            >
              Xem thêm &gt;&gt;
            </Link>
          </motion.div>

          <motion.div
            variants={labelAnim}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="font-bold text-gray-900 text-lg uppercase">
              Cam Kết
            </h3>
            <Link
              to="/about#commitments"
              className="mt-2 inline-block text-amber-600 font-semibold text-sm hover:text-amber-700 transition-colors"
            >
              Xem thêm &gt;&gt;
            </Link>
          </motion.div>
        </div>

        {/* ===== TABLET/DESKTOP: absolute text (không bg) ===== */}
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
            <h3 className="font-bold text-gray-900 text-2xl uppercase">
              Tầm Nhìn
            </h3>
            <Link
              to="/about#vision"
              className="text-amber-600 font-semibold text-base inline-block hover:text-amber-700 transition-colors"
            >
              Xem thêm &gt;&gt;
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
            <h3 className="font-bold text-gray-900 text-2xl uppercase">
              Sứ Mệnh
            </h3>
            <Link
              to="/about#mission"
              className="text-amber-600 font-semibold text-base inline-block hover:text-amber-700 transition-colors"
            >
              Xem thêm &gt;&gt;
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
            <h3 className="font-bold text-gray-900 text-2xl uppercase">
              Giá Trị Cốt Lõi
            </h3>
            <Link
              to="/about#core-values"
              className="text-amber-600 font-semibold text-base inline-block hover:text-amber-700 transition-colors"
            >
              Xem thêm &gt;&gt;
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
            <h3 className="font-bold text-gray-900 text-2xl uppercase">
              Cam Kết
            </h3>
            <Link
              to="/about#commitments"
              className="text-amber-600 font-semibold text-base inline-block hover:text-amber-700 transition-colors"
            >
              Xem thêm &gt;&gt;
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Vision;
