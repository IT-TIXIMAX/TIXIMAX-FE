import React, { useState } from "react";
import { Link } from "react-router-dom";

const QuestionPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    from: "",
    to: "",
    note: "",
  });

  const [openFAQ, setOpenFAQ] = useState(null);

  const faqData = [
    {
      id: 1,
      question: "Thời gian vận chuyển hàng hóa là bao lâu?",
      answer: (
        <>
          Tùy thuộc vào từng tuyến mà thời gian vận chuyển hàng có thể từ 7 - 15
          ngày. Hãy{" "}
          <Link
            to="/services/shipping"
            className="text-yellow-600 hover:text-yellow-700 font-semibold underline"
          >
            liên hệ với Tiximax
          </Link>{" "}
          để được tư vấn rõ thời gian xử lý đơn hàng của bạn.
        </>
      ),
    },
    {
      id: 2,
      question: "Chi phí vận chuyển được tính như thế nào?",
      answer: (
        <>
          Với mỗi một tuyến, Tiximax sẽ có một mức chi phí khác nhau. Dao động
          từ 145.000 VNĐ đến 245.000 VNĐ/KG, để{" "}
          <Link
            to="/services/shipping"
            className="text-yellow-600 hover:text-yellow-700 font-semibold underline"
          >
            tìm hiểu chi tiết
          </Link>{" "}
          hãy nhắn tin để nhân viên chúng tôi hỗ trợ tư vấn.
        </>
      ),
    },
    {
      id: 3,
      question: "Hàng hóa có được bảo hiểm không?",
      answer: (
        <>
          Tiximax có cung cấp gói bảo hiểm hàng hóa với mức đền bù lên đến 100%
          cho khách hàng. Nếu mua sắm các hàng hóa giá trị cao, hàng dễ vỡ thông
          qua dịch vụ{" "}
          <Link
            to="/services/auction"
            className="text-yellow-600 hover:text-yellow-700 font-semibold underline"
          >
            đấu giá
          </Link>
          ,{" "}
          <Link
            to="/services/purchase"
            className="text-yellow-600 hover:text-yellow-700 font-semibold underline"
          >
            mua hộ
          </Link>{" "}
          hoặc{" "}
          <Link
            to="/services/storage"
            className="text-yellow-600 hover:text-yellow-700 font-semibold underline"
          >
            kho hàng
          </Link>
          , chúng tôi khuyên bạn nên lựa chọn gói bảo hiểm này để được đảm bảo.
        </>
      ),
    },
    {
      id: 4,
      question: "Làm thế nào để theo dõi đơn hàng của tôi?",
      answer: (
        <>
          Hiện Tiximax có{" "}
          <Link
            to="/tracking"
            className="text-yellow-600 hover:text-yellow-700 font-semibold underline"
          >
            hệ thống Tracking
          </Link>{" "}
          - cho phép khách hàng theo dõi đơn hàng dựa trên mã vận đơn của mình.
          Bạn có thể truy cập vào website tiximax.net và nhấn nút{" "}
          <Link
            to="/tracking"
            className="text-yellow-600 hover:text-yellow-700 font-semibold underline"
          >
            Tracking đơn hàng
          </Link>{" "}
          trên thanh menu để tiến hành tra cứu thông tin.
        </>
      ),
    },
  ];

  const cities = ["Indonesia", "Hàn Quốc", "Mỹ", "Nhật Bản", "Việt Nam"];
  const destination = ["Indonesia", "Việt Nam"];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.phone || !formData.from || !formData.to) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    console.log("Form Data:", formData);
    alert("Yêu cầu báo giá đã được gửi! Chúng tôi sẽ liên hệ bạn sớm.");
    setFormData({ name: "", phone: "", from: "", to: "", note: "" });
  };

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="bg-gray-50 py-12">
      {/* Header Section */}
      <div className="container mx-auto px-4 sm:px-6 mb-12">
        <div className="flex items-center justify-center">
          {/* Giữ nguyên style desktop, chỉ thêm padding mobile */}
          <div className="flex-1 bg-gray-900 text-white py-6 px-4 sm:px-8 text-right rounded-l-lg">
            <h2 className="text-2xl md:text-3xl font-bold uppercase">
              Nhận báo giá ngay
            </h2>
          </div>

          {/* Giữ nguyên kích thước icon (w-20 h-20) */}
          <div className="flex-shrink-0 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg -mx-4 z-10">
            <svg
              className="w-10 h-10 text-gray-800"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          </div>

          <div className="flex-1 bg-yellow-400 text-gray-900 py-6 px-4 sm:px-8 text-left rounded-r-lg">
            <h2 className="text-2xl md:text-3xl font-bold uppercase">
              Các câu hỏi thường gặp
            </h2>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {/* Giữ nguyên desktop: px-12 lg:px-24, chỉ thêm px-4 cho mobile */}
      <main className="container mx-auto px-4 sm:px-12 lg:px-24">
        {/* bỏ container lồng container không cần thiết */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Form */}
          <div>
            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="HỌ TÊN"
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white text-gray-800 placeholder-gray-500 font-medium"
                />
              </div>

              <div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="SỐ ĐIỆN THOẠI"
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white text-gray-800 placeholder-gray-500 font-medium"
                />
              </div>

              {/* Mobile: 1 cột, Desktop giữ 2 cột như cũ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    name="from"
                    value={formData.from}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white text-gray-800 font-medium appearance-none cursor-pointer"
                  >
                    <option value="">CHUYỂN TỪ</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none"
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
                </div>

                <div className="relative">
                  <select
                    name="to"
                    value={formData.to}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white text-gray-800 font-medium appearance-none cursor-pointer"
                  >
                    <option value="">ĐẾN</option>
                    {destination.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none"
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
                </div>
              </div>

              <div>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="GHI CHÚ CỤ THỂ"
                  rows="5"
                  className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white text-gray-800 placeholder-gray-500 font-medium resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="mt-12 text-center">
                <p className="text-gray-700 mb-4 leading-relaxed px-4">
                  Để được báo giá cụ thể nhất, hãy điền đầy đủ thông tin yêu cầu
                </p>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-8 h-0.5 bg-yellow-400"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-8 h-0.5 bg-yellow-400"></div>
                </div>

                {/* Mobile full width, desktop như cũ */}
                <button
                  onClick={handleSubmit}
                  className="w-full sm:w-auto px-12 py-4 bg-gray-900 text-white font-bold uppercase rounded-lg hover:bg-gray-800 transition-colors duration-300 shadow-lg"
                >
                  Yêu cầu báo giá
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - FAQ */}
          <div>
            <div className="space-y-4">
              {faqData.map((faq) => (
                <div
                  key={faq.id}
                  className={`border-2 rounded-lg overflow-hidden transition-all duration-300 ${
                    openFAQ === faq.id
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-4 sm:px-6 py-5 flex items-start sm:items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-700 font-semibold uppercase text-sm pr-4 leading-relaxed">
                      {faq.question}
                    </span>

                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded flex items-center justify-center transition-all duration-300 ${
                        openFAQ === faq.id
                          ? "bg-yellow-400 text-gray-900 rotate-45"
                          : "bg-gray-800 text-white"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFAQ === faq.id ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <div className="px-4 sm:px-6 pb-5 pt-2">
                      <div className="w-12 h-0.5 bg-yellow-400 mb-3"></div>
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-12 text-center">
              <p className="text-gray-700 mb-4 leading-relaxed px-4">
                Nếu bạn cần được tư vấn cụ thể hơn, hãy liên hệ với
                TixiLogistics để được hỗ trợ.
              </p>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-0.5 bg-yellow-400"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-8 h-0.5 bg-yellow-400"></div>
              </div>

              {/* Mobile full width, desktop như cũ */}
              <Link
                to="/services"
                className="inline-block w-full sm:w-auto text-center px-10 py-3 bg-yellow-400 text-gray-900 font-bold uppercase rounded-lg hover:bg-yellow-500 transition-colors duration-300 shadow-lg"
              >
                Liên hệ ngay
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionPage;
