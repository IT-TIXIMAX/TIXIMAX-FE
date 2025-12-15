import React from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const GuideOrder = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-amber-50/40">
      {/* HEADER HERO ĐỒNG BỘ VỚI ServiceList */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/25 via-transparent to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="space-y-5 text-white"
          >
            <p className="text-xs md:text-sm font-semibold tracking-[0.25em] text-amber-300 uppercase">
              Hướng dẫn Tiximax
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
              Hướng dẫn sử dụng dịch vụ &amp; tra cứu đơn hàng
            </h1>
            <p className="text-sm md:text-base text-gray-200 max-w-2xl leading-relaxed">
              Từng bước đặt hàng, thanh toán và theo dõi đơn với TIXIMAX
              Logistics – quy trình rõ ràng, chi phí minh bạch, dễ hiểu cho cả
              khách lẻ và chủ shop.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto pb-12">
        {/* Content - Đặt Hàng */}
        <div className="bg-white rounded-2xl p-12 mb-12">
          {/* Title Section */}
          <div className="-mx-32 mb-12">
            {/* Negative margin để vượt ra ngoài padding */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-xl p-8">
              <h2 className="text-4xl font-bold text-gray-900 text-center">
                HƯỚNG DẪN ĐẶT HÀNG
              </h2>
            </div>
          </div>

          {/* Giới thiệu */}
          <div className="mb-12">
            <p className="text-lg text-gray-700 leading-relaxed">
              TIXIMAX LOGISTICS là đơn vị cung cấp dịch vụ logistics trọn gói,
              hỗ trợ mua hộ, vận chuyển và nhập khẩu hàng quốc tế với quy trình
              rõ ràng, chi phí minh bạch, đảm bảo an toàn hàng hóa.
            </p>
          </div>

          {/* Quy trình */}
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 pb-3 border-b-4 border-yellow-400">
              QUY TRÌNH ĐẶT HÀNG TẠI TIXIMAX
            </h3>

            {/* Bước 1 */}
            <div className="mb-10">
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 mb-6">
                <h4 className="text-2xl font-bold text-gray-900">
                  Bước 1: Gửi yêu cầu cho TIXIMAX
                </h4>
              </div>
              <div className="pl-8">
                <p className="font-semibold text-lg text-gray-900 mb-4">
                  Bạn chuẩn bị:
                </p>
                <ul className="list-disc pl-8 space-y-3 mb-6 text-lg text-gray-700">
                  <li>
                    Link sản phẩm từ các website nước ngoài (Indonesia, Nhật,
                    Hàn, Mỹ…)
                  </li>
                  <li>
                    Thông tin chi tiết:
                    <ul className="list-circle pl-8 mt-2 space-y-2">
                      <li>
                        <span className="bg-yellow-200 px-3 py-1 font-semibold rounded">
                          Màu sắc / size / dung tích
                        </span>
                      </li>
                      <li>
                        <span className="bg-yellow-200 px-3 py-1 font-semibold rounded">
                          Số lượng
                        </span>
                      </li>
                      <li>
                        <span className="bg-yellow-200 px-3 py-1 font-semibold rounded">
                          Phiên bản / model cụ thể
                        </span>{" "}
                        (nếu có)
                      </li>
                    </ul>
                  </li>
                </ul>
                <p className="font-semibold text-lg text-gray-900 mb-4">
                  Sau đó, gửi cho TIXIMAX qua:
                </p>
                <ul className="list-disc pl-8 space-y-2 text-lg text-gray-700">
                  <li>Form "Nhận báo giá" / "Gửi yêu cầu" trên website</li>
                  <li>Các kênh tư vấn: Messenger, Zalo, hotline</li>
                </ul>
              </div>
            </div>

            {/* Bước 2 */}
            <div className="mb-10">
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 mb-6">
                <h4 className="text-2xl font-bold text-gray-900">
                  Bước 2: TIXIMAX kiểm tra &amp; báo giá
                </h4>
              </div>
              <div className="pl-8">
                <p className="mb-4 text-lg text-gray-700">
                  Sau khi nhận yêu cầu, TIXIMAX sẽ:
                </p>
                <ul className="list-disc pl-8 space-y-3 mb-6 text-lg text-gray-700">
                  <li>
                    Kiểm tra thông tin sản phẩm, độ uy tín của nhà cung cấp
                  </li>
                  <li>
                    Tư vấn nếu có lựa chọn phù hợp hơn (giá tốt hơn, phí ship rẻ
                    hơn, seller uy tín hơn…)
                  </li>
                  <li>
                    Gửi lại báo giá chi tiết, bao gồm:
                    <ul className="list-circle pl-8 mt-2 space-y-2">
                      <li>
                        <span className="bg-yellow-200 px-3 py-1 font-semibold rounded">
                          Giá sản phẩm gốc
                        </span>
                      </li>
                      <li>
                        <span className="bg-yellow-200 px-3 py-1 font-semibold rounded">
                          Phí vận chuyển quốc tế &amp; nội địa
                        </span>
                      </li>
                      <li>
                        <span className="bg-yellow-200 px-3 py-1 font-semibold rounded">
                          Thuế, phí dự kiến
                        </span>{" "}
                        (nếu có)
                      </li>
                    </ul>
                  </li>
                </ul>
                <p className="mb-4 text-lg text-gray-700">
                  Bạn chỉ cần xem lại:
                </p>
                <ul className="list-disc pl-8 space-y-2 text-lg text-gray-700">
                  <li>Thông tin sản phẩm đã đúng chưa</li>
                  <li>Tổng chi phí</li>
                  <li>Thời gian dự kiến hàng về</li>
                </ul>
                <p className="mt-4 text-lg text-gray-700">
                  Nếu đồng ý, bạn xác nhận đặt hàng.
                </p>
              </div>
            </div>

            {/* Bước 3 */}
            <div className="mb-10">
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 mb-6">
                <h4 className="text-2xl font-bold text-gray-900">
                  Bước 3: Xác nhận &amp; thanh toán
                </h4>
              </div>
              <div className="pl-8">
                <ul className="list-disc pl-8 space-y-3 text-lg text-gray-700">
                  <li>
                    Bạn có thể thanh toán cho TIXIMAX bằng{" "}
                    <span className="bg-yellow-200 px-3 py-1 font-semibold rounded">
                      chuyển khoản ngân hàng trong nước
                    </span>{" "}
                    hoặc phương thức thanh toán quốc tế
                  </li>
                  <li>
                    Bạn{" "}
                    <span className="bg-yellow-200 px-3 py-1 font-semibold rounded">
                      KHÔNG cần dùng thẻ Visa/Mastercard
                    </span>{" "}
                    hay tự thanh toán trên website nước ngoài
                  </li>
                  <li>Tất cả giao dịch quốc tế sẽ do TIXIMAX thực hiện</li>
                  <li>
                    Sau khi nhận được thanh toán/xác nhận cọc, TIXIMAX sẽ tiến
                    hành mua hàng theo đúng yêu cầu của bạn
                  </li>
                </ul>
              </div>
            </div>

            {/* Bước 4 */}
            <div className="mb-10">
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 mb-6">
                <h4 className="text-2xl font-bold text-gray-900">
                  Bước 4: Vận chuyển &amp; giao hàng tận tay
                </h4>
              </div>
              <div className="pl-8">
                <p className="mb-4 text-lg text-gray-700">TIXIMAX sẽ:</p>
                <ul className="list-disc pl-8 space-y-3 mb-6 text-lg text-gray-700">
                  <li>Nhận hàng tại kho nước ngoài</li>
                  <li>Đóng gói, sắp xếp vận chuyển quốc tế về Việt Nam</li>
                  <li>
                    Thực hiện các thủ tục hải quan, thuế, giấy tờ liên quan
                  </li>
                  <li>
                    Giao cho đơn vị vận chuyển nội địa và ship đến tận địa chỉ
                    bạn cung cấp
                  </li>
                </ul>
                <p className="font-semibold text-lg text-gray-900 mb-4">
                  Khi nhận hàng, bạn nên:
                </p>
                <ul className="list-disc pl-8 space-y-2 text-lg text-gray-700">
                  <li>
                    <span className="bg-yellow-200 px-3 py-1 font-semibold rounded">
                      Kiểm tra kiện hàng bên ngoài
                    </span>
                  </li>
                  <li>
                    <span className="bg-yellow-200 px-3 py-1 font-semibold rounded">
                      Mở hàng, kiểm tra đúng mẫu, đúng số lượng, đúng phiên bản
                    </span>
                  </li>
                  <li>
                    Nếu có sai sót hoặc hư hỏng, liên hệ ngay TIXIMAX để được hỗ
                    trợ
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Lưu ý */}
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 pb-3 border-b-4 border-yellow-400">
              MỘT SỐ LƯU Ý KHI ĐẶT HÀNG QUA TIXIMAX
            </h3>
            <p className="mb-5 text-lg text-gray-700">
              Để đơn hàng được xử lý nhanh và chính xác, bạn nên:
            </p>
            <ul className="list-disc pl-8 space-y-3 text-lg text-gray-700">
              <li>Gửi link sản phẩm rõ ràng, hạn chế dùng hình ảnh mơ hồ</li>
              <li>Ghi đầy đủ: màu – size – số lượng – phiên bản</li>
              <li>Yêu cầu báo giá trước khi chốt đơn để nắm rõ chi phí</li>
              <li>
                Lên kế hoạch nhập hàng sớm trước các dịp sale lớn, lễ Tết… để
                tránh trễ tiến độ
              </li>
              <li>
                Ưu tiên chọn sản phẩm từ nhà cung cấp uy tín, có nhiều đánh giá
                tốt
              </li>
            </ul>
          </div>

          {/* Ưu điểm */}
          <div className="mb-0">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 pb-3 border-b-4 border-yellow-400">
              VÌ SAO NÊN ĐẶT HÀNG QUA TIXIMAX?
            </h3>

            <div className="space-y-6">
              <div className="border-l-4 border-yellow-500 pl-6 py-2">
                <h4 className="font-bold text-xl text-gray-900 mb-2">
                  Tất cả các chi phí đều rõ ràng
                </h4>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Giá hàng, phí mua hộ, phí vận chuyển quốc tế, thuế/phí… đều
                  được thể hiện rõ trong báo giá. Không chi phí ẩn, không phát
                  sinh mập mờ.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-6 py-2">
                <h4 className="font-bold text-xl text-gray-900 mb-2">
                  Lộ trình minh bạch
                </h4>
                <p className="text-lg text-gray-700 leading-relaxed">
                  TIXIMAX thiết kế lộ trình vận chuyển rõ ràng, thời gian cam
                  kết theo từng thị trường, giúp bạn chủ động kế hoạch kinh
                  doanh.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-6 py-2">
                <h4 className="font-bold text-xl text-gray-900 mb-2">
                  Quy trình đơn giản
                </h4>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Gửi yêu cầu – nhận báo giá – xác nhận &amp; thanh toán – nhận
                  hàng. Bạn không cần hiểu quá sâu về thủ tục logistics, TIXIMAX
                  đã làm thay bạn.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-6 py-2">
                <h4 className="font-bold text-xl text-gray-900 mb-2">
                  Hỗ trợ tận tâm
                </h4>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Đội ngũ TIXIMAX luôn sẵn sàng tư vấn về sản phẩm, seller, cách
                  tối ưu chi phí, lựa chọn phương án vận chuyển phù hợp với từng
                  loại hàng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GuideOrder;
