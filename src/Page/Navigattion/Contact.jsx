import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import contact from "../../assets/contact.png";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Contact = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setLoading(false);
    setSent(true);

    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });

    setTimeout(() => setSent(false), 4000);
  };

  const handle = (key) => (e) => {
    setForm((s) => ({ ...s, [key]: e.target.value }));
  };

  // ✅ Social links (đổi lại đúng link nếu bạn có link khác)
  const socials = [
    {
      Icon: Facebook,
      href: "https://www.facebook.com/tiximaxlogistics",
      label: "Facebook",
    },
    {
      Icon: Instagram,
      href: "https://www.instagram.com/tiximaxlogistics",
      label: "Instagram",
    },
    {
      Icon: Linkedin,
      href: "https://www.linkedin.com/company/tiximax-joint-stock-company",
      label: "LinkedIn",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-amber-50/30 text-gray-900">
      {/* ========= HEADER – ĐỒNG BỘ VỚI CÁC PAGE KHÁC ========= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Vệt sáng amber giống các page khác */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/25 via-transparent to-transparent" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="space-y-5 text-white"
          >
            <p className="text-xs md:text-sm font-semibold tracking-[0.25em] text-amber-300 uppercase">
              Tiximax Logistics
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
              Liên hệ với Tiximax
            </h1>

            <p className="text-sm sm:text-base text-gray-200 max-w-2xl leading-relaxed">
              Tiximax luôn sẵn sàng hỗ trợ — tư vấn vận chuyển, mua hộ quốc tế
              và giải đáp mọi yêu cầu của bạn qua điện thoại, email hoặc form
              liên hệ.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========= MAIN CONTENT ========= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
        {/* TOP ROW */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          {/* LEFT — COMPANY INFO */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8 sm:p-10 min-h-[520px] flex flex-col"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="p-2 rounded-full bg-amber-100 text-amber-700">
                <MapPin className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-gray-900">
                Công ty Cổ phần TIXIMAX
              </h2>
            </div>

            <p className="text-base text-gray-600 leading-relaxed">
              Nếu cần tư vấn hoặc hỗ trợ tham khảo thêm thông tin, vui lòng liên
              hệ với chúng tôi theo các thông tin sau:
            </p>

            <div className="mt-8 space-y-5 text-base">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-gray-800">
                  +84 901 834 283
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-gray-600">
                  08:00 - 20:00 | Thứ Hai - Chủ Nhật
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-amber-600" />
                <span className="text-gray-600">global.trans@tiximax.net</span>
              </div>
            </div>

            {/* Address */}
            <div className="mt-10">
              <h3 className="text-base font-semibold uppercase tracking-wide text-gray-800">
                Địa chỉ văn phòng & kho hàng
              </h3>

              <div className="mt-5 space-y-4 text-base text-gray-600">
                {[
                  "Văn phòng: 65 Đ. 9, Hiệp Bình Phước, Thủ Đức, TP.HCM 100000.",
                  "Kho Indonesia: Alan Cinta No.2, Pulogadung, Jakarta Timur.",
                  "Kho Nhật Bản: 千葉県 白井市 復1449-8, Shiroi-shi, Chiba.",
                  "Kho Hàn Quốc: 부평구 부평동 284-136, 302호, Incheon.",
                  "Kho Mỹ: Woodstock, Georgia, United States.",
                ].map((addr, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <MapPin className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                    <span>{addr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social */}
            <div className="mt-10 pt-6 border-t border-amber-100">
              <p className="text-base font-semibold uppercase tracking-wide text-gray-800">
                Kết nối với Tiximax
              </p>

              <div className="mt-4 flex items-center gap-5">
                {socials.map(({ Icon, href, label }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-900 text-white hover:bg-amber-500 hover:text-gray-900 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT — BANNER */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden min-h-[520px]"
          >
            <img
              src={contact}
              alt="Contact Banner"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* BOTTOM ROW */}
        <div className="mt-14 grid lg:grid-cols-2 gap-10 lg:gap-14">
          {/* MAP */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden min-h-[520px]"
          >
            <iframe
              title="Map"
              src="https://maps.google.com/maps?q=65%20Đ.%209,%20Hiệp%20Bình%20Phước,%20Thủ%20Đức,%20Hồ%20Chí%20Minh&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full"
              loading="lazy"
            />
          </motion.div>

          {/* CONTACT FORM */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(245,158,11,0.25)] border border-amber-200 p-8 sm:p-10 min-h-[520px]"
          >
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-gray-900">
              Gửi yêu cầu nhận tư vấn
            </h2>

            <form onSubmit={onSubmit} className="mt-9 space-y-7">
              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {["firstName", "lastName"].map((key, i) => (
                  <div key={i}>
                    <label className="block text-sm font-semibold uppercase mb-2 text-gray-700">
                      {key === "firstName" ? "Tên" : "Họ"}
                    </label>
                    <input
                      value={form[key]}
                      onChange={handle(key)}
                      className="w-full border border-amber-200 rounded-lg px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all"
                      placeholder={key === "firstName" ? "Nhập tên" : "Nhập họ"}
                    />
                  </div>
                ))}
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {["email", "phone"].map((key, i) => (
                  <div key={i}>
                    <label className="block text-sm font-semibold uppercase mb-2 text-gray-700">
                      {key === "email" ? "Email" : "Số điện thoại"}
                    </label>
                    <input
                      value={form[key]}
                      onChange={handle(key)}
                      className="w-full border border-amber-200 rounded-lg px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all"
                      placeholder={
                        key === "email"
                          ? "email@example.com"
                          : "Nhập số điện thoại"
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold uppercase mb-2 text-gray-700">
                  Yêu cầu
                </label>
                <input
                  value={form.subject}
                  onChange={handle("subject")}
                  className="w-full border border-amber-200 rounded-lg px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all"
                  placeholder="Nhập chủ đề"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold uppercase mb-2 text-gray-700">
                  Ghi chú thêm
                </label>
                <textarea
                  rows="7"
                  value={form.message}
                  onChange={handle("message")}
                  className="w-full border border-amber-200 rounded-lg px-4 py-3 text-sm resize-none bg-white focus:ring-2 focus:ring-amber-400 focus:border-amber-500 transition-all"
                  placeholder="Nhập tin nhắn..."
                />
              </div>

              {/* Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-10 py-3 text-sm font-semibold uppercase rounded-lg bg-amber-500 text-white shadow-md hover:bg-amber-600 transition-all disabled:opacity-60"
                >
                  {loading ? "Đang gửi..." : "Gửi tin nhắn"}
                </button>
              </div>

              {sent && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  Cảm ơn bạn! Chúng tôi đã nhận được thông tin.
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
