// src/pages/GuideTracking/GuideTracking.jsx
import React from "react";
import { ClipboardList, Truck } from "lucide-react";
import TrackingOrderCustomer from "./TrackingOrderCustomer";

const GuideTracking = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-amber-50/40">
      {/* HEADER HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <div className="space-y-5 text-white">
            <p className="text-xs md:text-sm font-semibold tracking-widest text-amber-300 uppercase">
              Hướng dẫn Tiximax
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
              Tra cứu tình trạng đơn hàng
            </h1>
            <p className="text-sm md:text-base text-gray-200 max-w-2xl leading-relaxed">
              Nhập số điện thoại để tra cứu tất cả đơn hàng của bạn. Xem chi
              tiết trạng thái, lộ trình vận chuyển và thông tin sản phẩm theo
              quy trình hoàn chỉnh.
            </p>
          </div>
        </div>
      </section>

      {/* TRACKING COMPONENT */}
      <section className="pt-20 lg:pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto -mt-6 md:-mt-12">
          <TrackingOrderCustomer />
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 pb-4 border-b-4 border-yellow-400 flex items-center gap-3">
              <ClipboardList className="w-7 h-7 text-yellow-600" />
              Câu hỏi thường gặp
            </h2>

            <div className="grid md:grid-cols-2 gap-10">
              <div className="border-l-4 border-yellow-500 pl-7 py-4">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Bao lâu tiến độ được cập nhật?
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Thông thường mỗi mốc xử lý sẽ được cập nhật trong vòng 1–3 giờ
                  làm việc; các mốc bay/đến sân bay phụ thuộc lịch của hãng vận
                  chuyển.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-7 py-4">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Quy trình vận chuyển gồm những bước nào?
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Đơn hàng trải qua 12 bước từ "Chờ mua" đến "Đã giao", bao gồm
                  mua hàng, nhập kho nước ngoài, vận chuyển về VN và giao hàng
                  nội địa.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-7 py-4">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Làm sao để xem đơn hàng theo từng trạng thái?
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Nhấn vào bất kỳ trạng thái nào trên timeline để lọc và xem chỉ
                  các đơn hàng thuộc trạng thái đó. Số hiển thị trên mỗi trạng
                  thái là tổng đơn.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-7 py-4">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  "Đã nhập kho VN" khác gì "Chờ giao"?
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  "Đã nhập kho VN" là hàng vừa về kho, còn "Chờ giao" là đã được
                  đơn vị giao nhận và chuẩn bị mang đến địa chỉ của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl p-8 md:p-12">
            <div className="mb-12 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-xl p-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
                TRA CỨU & THEO DÕI ĐƠN HÀNG
              </h2>
            </div>

            <div className="mb-12">
              <p className="text-lg text-gray-700 leading-relaxed">
                Khi nhập hàng từ nước ngoài về Việt Nam, việc theo dõi xem đơn
                đang ở đâu, đã rời kho, qua hải quan hay đang giao nội địa là
                điều rất quan trọng. TIXIMAX hỗ trợ khách hàng tra cứu và theo
                dõi đơn hàng trực tuyến, giúp bạn dễ dàng kiểm soát hành trình
                hàng hóa từ lúc xuất kho nước ngoài đến khi giao tận tay tại
                Việt Nam.
              </p>
            </div>

            <div className="mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 pb-3 border-b-4 border-yellow-400">
                QUY TRÌNH VẬN CHUYỂN HOÀN CHỈNH
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Chờ mua → Đã mua → Đấu giá / Mua sau
                    </h4>
                    <p className="text-gray-700">
                      Giai đoạn đặt hàng và mua sắm từ các shop nước ngoài
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Đã nhập kho nước ngoài
                    </h4>
                    <p className="text-gray-700">
                      Hàng đã được tiếp nhận tại kho nước ngoài (Nhật, Hàn,
                      Mỹ...)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Đã đóng gói
                    </h4>
                    <p className="text-gray-700">
                      Hàng được kiểm tra, đóng gói cẩn thận sẵn sàng vận chuyển
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Đang vận chuyển về Việt Nam
                    </h4>
                    <p className="text-gray-700">
                      Hàng đang trên chuyến bay/tàu về Việt Nam
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Đã nhập kho Việt Nam
                    </h4>
                    <p className="text-gray-700">
                      Hàng đã về đến kho TIXIMAX tại Việt Nam
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-lime-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                    6
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Chờ trung chuyển → Chờ giao → Đang giao
                    </h4>
                    <p className="text-gray-700">
                      Quá trình chuẩn bị và giao hàng nội địa đến tay khách
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      Đã giao hàng
                    </h4>
                    <p className="text-gray-700">
                      Hoàn tất! Đơn hàng đã được giao thành công
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 pb-3 border-b-4 border-yellow-400">
                LƯU Ý KHI TRA CỨU
              </h3>
              <ul className="list-disc pl-8 space-y-3 text-lg text-gray-700">
                <li>Sử dụng đúng số điện thoại đã đăng ký khi đặt hàng</li>
                <li>Lưu lại mã đơn hàng để tiện theo dõi và liên hệ hỗ trợ</li>
                <li>
                  Nếu trạng thái không cập nhật quá 24h, liên hệ CSKH để kiểm
                  tra
                </li>
                <li>
                  Kiểm tra thường xuyên để nắm bắt kịp thời trạng thái đơn hàng
                </li>
                <li>
                  Click vào từng trạng thái trên timeline để lọc và xem chi tiết
                  các đơn hàng
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default GuideTracking;
