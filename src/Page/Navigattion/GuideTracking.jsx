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

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl p-12">
            {/* Title Section */}
            <div className="-mx-32 mb-12">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-xl p-8">
                <h2 className="text-4xl font-bold text-gray-900 text-center">
                  TRA CỨU &amp; THEO DÕI ĐƠN HÀNG
                </h2>
              </div>
            </div>

            {/* Giới thiệu */}
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

            {/* Tra cứu là gì */}
            <div className="mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 pb-3 border-b-4 border-yellow-400">
                TRA CỨU VẬN ĐƠN TIXIMAX LÀ GÌ?
              </h3>
              <p className="mb-5 text-lg text-gray-700">
                Tra cứu vận đơn là cách giúp bạn biết:
              </p>
              <ul className="list-disc pl-8 space-y-3 text-lg text-gray-700 mb-6">
                <li>
                  Đơn hàng đang ở khu vực nào (kho nước ngoài, đang bay, đang
                  làm thủ tục hải quan, kho Việt Nam, giao nội địa…)
                </li>
                <li>
                  Đơn đã được tiếp nhận, đang xử lý hay đã hoàn tất giao hàng
                </li>
                <li>
                  Có phát sinh tình trạng bất thường hay không (kẹt hải quan,
                  thiếu chứng từ, khách vắng mặt khi giao…)
                </li>
              </ul>
              <p className="mb-4 text-lg text-gray-700">
                Thông thường, mỗi đơn hàng với TIXIMAX sẽ có:
              </p>
              <ul className="list-disc pl-8 space-y-3 text-lg text-gray-700">
                <li>
                  <span className="bg-yellow-200 px-3 py-1 font-semibold rounded">
                    Mã đơn hàng TIXIMAX
                  </span>{" "}
                  (mã do hệ thống TIXIMAX tạo ra)
                </li>
                <li>
                  <span className="bg-yellow-200 px-3 py-1 font-semibold rounded">
                    Mã vận đơn của đối tác vận chuyển
                  </span>{" "}
                  (nếu có), dùng để theo dõi chặng bay hoặc chặng giao nội địa
                </li>
              </ul>
            </div>

            {/* Cách tra cứu */}
            <div className="mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 pb-3 border-b-4 border-yellow-400">
                CÁCH TRA CỨU ĐƠN HÀNG TIXIMAX TRÊN WEBSITE
              </h3>

              <div className="mb-8">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 mb-6">
                  <h4 className="text-2xl font-bold text-gray-900">
                    Bước 1: Mở trang Tra cứu
                  </h4>
                </div>
                <div className="pl-8">
                  <ul className="list-disc pl-8 space-y-3 text-lg text-gray-700">
                    <li>
                      Truy cập website TIXIMAX (
                      <span className="font-semibold">
                        https://tiximax.net/
                      </span>
                      )
                    </li>
                    <li>
                      Trên thanh menu, chọn{" "}
                      <span className="bg-yellow-200 px-3 py-1 font-semibold rounded">
                        "Tra cứu đơn hàng"
                      </span>{" "}
                      hoặc{" "}
                      <span className="bg-yellow-200 px-3 py-1 font-semibold rounded">
                        "Tra cứu vận đơn"
                      </span>
                    </li>
                    <li>
                      Trang tra cứu sẽ hiển thị ô để bạn nhập thông tin đơn
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mb-8">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 mb-6">
                  <h4 className="text-2xl font-bold text-gray-900">
                    Bước 2: Nhập thông tin tra cứu
                  </h4>
                </div>
                <div className="pl-8">
                  <p className="mb-4 text-lg text-gray-700">
                    Tại form tra cứu, điền đúng loại thông tin hệ thống yêu cầu,
                    ví dụ:
                  </p>
                  <ul className="list-disc pl-8 space-y-3 text-lg text-gray-700 mb-5">
                    <li>Mã đơn / mã vận đơn mà TIXIMAX đã cung cấp</li>
                    <li>
                      Số điện thoại / email dùng khi đặt hàng (nếu form yêu cầu
                      kiểu này)
                    </li>
                  </ul>
                  <p className="text-lg text-gray-700 mb-4">
                    Rồi nhấn{" "}
                    <span className="bg-yellow-200 px-3 py-1 font-semibold rounded">
                      Tra cứu
                    </span>
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5">
                    <p className="text-base text-gray-700">
                      <span className="font-semibold">Mẹo nhỏ:</span> nên
                      copy–paste mã đơn để tránh nhầm giữa số 0 và chữ O, số 1
                      và chữ I,…
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 mb-6">
                  <h4 className="text-2xl font-bold text-gray-900">
                    Bước 3: Xem kết quả
                  </h4>
                </div>
                <div className="pl-8">
                  <p className="mb-4 text-lg text-gray-700">
                    Sau khi tra cứu, hệ thống sẽ hiển thị:
                  </p>
                  <ul className="list-disc pl-8 space-y-3 text-lg text-gray-700">
                    <li>Thông tin cơ bản của đơn hàng</li>
                    <li>Trạng thái hiện tại và các cập nhật mới nhất</li>
                    <li>
                      Từ đó, bạn biết được đơn mình đang trong giai đoạn nào và
                      ước chừng thời gian nhận hàng
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Trạng thái */}
            <div className="mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 pb-3 border-b-4 border-yellow-400">
                MỘT SỐ TRẠNG THÁI ĐƠN HÀNG THƯỜNG GẶP
              </h3>
              <p className="mb-6 text-lg text-gray-700">
                Tùy từng loại dịch vụ và chặng vận chuyển, trạng thái hiển thị
                có thể khác nhau, nhưng thường sẽ xoay quanh các nhóm sau:
              </p>

              <div className="space-y-5">
                <div className="border-l-4 border-blue-600 pl-6 py-3">
                  <h4 className="font-bold text-xl text-gray-900 mb-1">
                    Đã tiếp nhận / Đã tạo đơn
                  </h4>
                  <p className="text-lg text-gray-700">
                    TIXIMAX đã ghi nhận yêu cầu, đơn đang chờ xử lý.
                  </p>
                </div>

                <div className="border-l-4 border-purple-600 pl-6 py-3">
                  <h4 className="font-bold text-xl text-gray-900 mb-1">
                    Đang xử lý / Đang mua hàng
                  </h4>
                  <p className="text-lg text-gray-700">
                    Đơn vị đang tiến hành mua hộ, xác nhận với nhà cung cấp,
                    chuẩn bị nhận hàng tại kho.
                  </p>
                </div>

                <div className="border-l-4 border-orange-600 pl-6 py-3">
                  <h4 className="font-bold text-xl text-gray-900 mb-1">
                    Đang vận chuyển quốc tế / Đang trên đường về Việt Nam
                  </h4>
                  <p className="text-lg text-gray-700">
                    Hàng đã rời kho nước ngoài và đang di chuyển về Việt Nam.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-600 pl-6 py-3">
                  <h4 className="font-bold text-xl text-gray-900 mb-1">
                    Đang thông quan / Chờ thông quan
                  </h4>
                  <p className="text-lg text-gray-700">
                    Hàng đang được làm thủ tục tại hải quan.
                  </p>
                </div>

                <div className="border-l-4 border-teal-600 pl-6 py-3">
                  <h4 className="font-bold text-xl text-gray-900 mb-1">
                    Đã về kho Việt Nam / Đang giao nội địa
                  </h4>
                  <p className="text-lg text-gray-700">
                    Hàng đã về kho tại Việt Nam và được bàn giao cho đơn vị giao
                    trong nước.
                  </p>
                </div>

                <div className="border-l-4 border-green-600 pl-6 py-3">
                  <h4 className="font-bold text-xl text-gray-900 mb-1">
                    Giao thành công
                  </h4>
                  <p className="text-lg text-gray-700">
                    Đơn hàng đã giao tới địa chỉ nhận.
                  </p>
                </div>

                <div className="border-l-4 border-red-600 pl-6 py-3">
                  <h4 className="font-bold text-xl text-gray-900 mb-1">
                    Giao không thành công / Khách vắng mặt
                  </h4>
                  <p className="text-lg text-gray-700">
                    Đơn vị giao không thể giao hàng (lý do thường được ghi rõ),
                    bạn nên liên hệ lại để sắp xếp giao lần sau.
                  </p>
                </div>
              </div>
            </div>

            {/* Khi nào liên hệ */}
            <div className="mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 pb-3 border-b-4 border-yellow-400">
                KHI NÀO NÊN LIÊN HỆ TIXIMAX?
              </h3>
              <p className="mb-5 text-lg text-gray-700">
                Bạn nên chủ động liên hệ TIXIMAX trong những trường hợp:
              </p>
              <ul className="list-disc pl-8 space-y-3 text-lg text-gray-700 mb-6">
                <li>Tra cứu nhiều lần nhưng không thấy đơn dù đã đặt hàng</li>
                <li>
                  Trạng thái đứng yên quá lâu so với thời gian dự kiến TIXIMAX
                  thông báo
                </li>
                <li>
                  Hệ thống báo giao không thành công nhưng bạn không nhận cuộc
                  gọi / thông tin từ đơn vị giao
                </li>
                <li>
                  Cần điều chỉnh gấp: đổi địa chỉ nhận, đổi người nhận, hỗ trợ
                  thêm giấy tờ…
                </li>
              </ul>
              <p className="font-semibold text-lg text-gray-900 mb-4">
                Khi liên hệ, bạn nên chuẩn bị sẵn:
              </p>
              <ul className="list-disc pl-8 space-y-2 text-lg text-gray-700">
                <li>Mã đơn / mã vận đơn (nếu có)</li>
                <li>Họ tên &amp; số điện thoại đã dùng khi đặt hàng</li>
              </ul>
              <p className="mt-5 text-lg text-gray-700">
                Đội ngũ TIXIMAX sẽ kiểm tra trên hệ thống và phản hồi chi tiết
                cho bạn.
              </p>
            </div>

            {/* Lưu ý thêm */}
            <div className="mb-0">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 pb-3 border-b-4 border-yellow-400">
                MỘT SỐ LƯU Ý ĐỂ TRA CỨU ĐƠN TIỆN HƠN
              </h3>
              <ul className="list-disc pl-8 space-y-3 text-lg text-gray-700">
                <li>Luôn lưu lại mã đơn khi TIXIMAX gửi lần đầu</li>
                <li>
                  Theo dõi đơn định kỳ, đặc biệt trước các mốc quan trọng như:
                  dự kiến hàng về, chuẩn bị giao cho khách, chạy chương trình
                  khuyến mãi…
                </li>
                <li>
                  Nếu đặt nhiều đơn cùng lúc, nên ghi chú riêng cho từng mã để
                  khỏi nhầm
                </li>
                <li>
                  Đối với chủ shop, có thể gửi kèm hướng dẫn tra cứu cho khách
                  (hoặc hỗ trợ khách tra giúp) để tăng độ tin tưởng
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
