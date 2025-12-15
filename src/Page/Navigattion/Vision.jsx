import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PICCEO from "../../assets/PICCEO.png";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Vision = () => {
  return (
    <main className="bg-gray-50 py-20">
      {/* TITLE */}
      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="text-center text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-wide text-gray-900"
      >
        Hiểu Thêm Về Chúng Tôi
      </motion.h1>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto text-center mt-6 text-gray-600 text-lg leading-relaxed"
      >
        Chúng tôi tin rằng một doanh nghiệp bền vững không chỉ dựa vào lợi
        nhuận, mà dựa vào con người và những giá trị cốt lõi. Tiximax mang sứ
        mệnh kết nối thế giới bằng logistics, thanh toán và mua bán toàn cầu.
        <br />
      </motion.p>

      {/* PROFILE + TEXT AROUND */}
      <div className="relative max-w-4xl mx-auto mt-20">
        {/* PROFILE IMAGE - Bỏ animation */}
        <div className="flex justify-center">
          <img
            src={PICCEO}
            alt="CEO"
            className="w-[430px] h-[430px] object-cover rounded-full"
          />
        </div>

        {/* TEXT LABELS AROUND IMAGE */}
        {/* Top Left - Tầm Nhìn */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="absolute left-0 top-0 transform -translate-x-10 -translate-y-6 text-center"
        >
          <h3 className="font-bold text-gray-900 text-2xl uppercase">
            Tầm Nhìn
          </h3>

          <a
            href="/about#vision"
            className="text-amber-600 font-semibold text-base inline-block hover:text-amber-700 transition-colors"
          >
            Xem thêm &gt;&gt;
          </a>
        </motion.div>

        {/* Top Right - Sứ Mệnh */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="absolute right-0 top-0 transform translate-x-10 -translate-y-6 text-center"
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

        {/* Bottom Left - Giá Trị Cốt Lõi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="absolute left-0 bottom-0 transform -translate-x-10 translate-y-6 text-center"
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

        {/* Bottom Right - Cam Kết */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="absolute right-0 bottom-0 transform translate-x-10 translate-y-6 text-center"
        >
          <h3 className="font-bold text-gray-900 text-2xl uppercase">
            Cam Kết
          </h3>

          <a
            href="/about#commitments"
            className="text-amber-600 font-semibold text-base inline-block hover:text-amber-700 transition-colors"
          >
            Xem thêm &gt;&gt;
          </a>
        </motion.div>
      </div>
    </main>
  );
};

export default Vision;
