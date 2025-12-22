import React from "react";
import { Globe2, Truck, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Section = ({ title, bg = "white", children, noMotion = false }) => (
  <section
    className={`py-16 border-t border-amber-100 ${
      bg === "gray" ? "bg-gray-50" : "bg-white"
    }`}
  >
    <div className="max-w-7xl mx-auto px-6 lg:px-10">
      {noMotion ? (
        // KHÔNG hiệu ứng
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center">
            {title}
          </h2>
          <div className="mt-4 mb-10 h-[3px] w-20 mx-auto bg-amber-500 rounded-full" />
          <div className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-700 space-y-4">
            {children}
          </div>
        </div>
      ) : (
        // CÓ hiệu ứng
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center">
            {title}
          </h2>
          <div className="mt-4 mb-10 h-[3px] w-20 mx-auto bg-amber-500 rounded-full" />
          <div className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-700 space-y-4">
            {children}
          </div>
        </motion.div>
      )}
    </div>
  </section>
);

const ServicesShipping = () => {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-amber-50/40">
      {/* HERO – có hiệu ứng */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b border-amber-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/30 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 sm:py-20 lg:py-24 relative">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="space-y-8 text-white"
          >
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-amber-300 mb-2">
                <span>Tiximax vận chuyển hàng quốc tế</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight text-center">
              Tiximax vận chuyển hàng quốc tế – Giải pháp chuyên biệt cho SME và
              cá nhân
            </h1>

            <div className="mt-2 mb-2 h-[3px] w-24 mx-auto bg-amber-500 rounded-full" />

            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm sm:text-base font-semibold text-white bg-amber-600 hover:bg-amber-700"
              >
                Liên hệ tư vấn tuyến vận chuyển
              </Link>
              <Link
                to="/tracking"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm sm:text-base font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100"
              >
                Tracking đơn hàng
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION NÀY: KHÔNG HIỆU ỨNG */}
      <Section bg="white" noMotion>
        <>
          <p>
            Bạn là SME nhập hàng hoặc cá nhân cần gửi hàng quốc tế nhưng ngại
            chi phí cao, thủ tục rườm rà và rủi ro hỏng hóc?{" "}
            <strong>Tiximax vận chuyển hàng quốc tế</strong> sẽ giúp bạn với
            giải pháp tuyến chuyên biệt, tối ưu chi phí. Trước khi bắt đầu dịch
            vụ, mời bạn đọc qua bài viết này để hiểu rõ hơn Tiximax là ai, các
            tuyến vận chuyển, quy trình gửi hàng cũng như chính sách và lưu ý
            quan trọng khi gửi hàng từ Indonesia, Hàn Quốc, Nhật hay Mỹ về Việt
            Nam.
          </p>
        </>
      </Section>

      {/* TỪ SECTION SAU TRỞ ĐI VẪN CÓ HIỆU ỨNG */}

      <Section
        title="Tổng quan về dịch vụ Tiximax vận chuyển quốc tế"
        bg="white"
      >
        <>
          <p>
            Tiximax là nhà cung cấp dịch vụ logistics chuyên tuyến, phục vụ
            khách hàng cá nhân và SME cần vận chuyển giữa Việt Nam và các thị
            trường chính: Indonesia, Nhật Bản, Hàn Quốc và Mỹ. Điểm khác biệt
            của dịch vụ <strong>Tiximax vận chuyển hàng quốc tế</strong> là chọn{" "}
            <em>niche</em> nơi các hãng lớn ít tập trung — ví dụ như các chặng
            gom lẻ.
          </p>
          <div className="mt-2 space-y-2">
            <p className="font-semibold">Ưu điểm cốt lõi:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Chi phí thấp cho đơn hàng nhỏ hoặc gom lẻ.</li>
              <li>
                Quy trình thông quan đơn giản cho hàng phi mậu dịch (quà biếu,
                hàng cá nhân).
              </li>
              <li>Minh bạch giá và hỗ trợ thủ tục trọn gói.</li>
            </ul>
          </div>
          <p>
            Nếu bạn cần gửi hàng Indonesia - Việt Nam hai chiều, hoặc các tuyến
            khác về Việt Nam thì hãy cân nhắc lựa chọn Tiximax để tận dụng tuyến
            chuyên biệt và chi phí cạnh tranh.
          </p>
        </>
      </Section>

      <Section title="Tiximax là ai và chuyên về tuyến nào?" bg="gray">
        <>
          <p>
            Tiximax là công ty logistics có kinh nghiệm, hoạt động các tuyến Hàn
            - Việt, Indonesia - Việt, Nhật - Việt và Mỹ - Việt. Chúng tôi tập
            trung vào:
          </p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>Tuyến đường bộ/biển nơi chi phí thấp hơn đường hàng không.</li>
            <li>Tuyến gom lẻ giữa nhiều nhà bán lẻ và kho tập trung.</li>
            <li>
              Tuyến 2 chiều đặc thù như{" "}
              <strong>Tiximax vận chuyển hàng Indo Việt</strong> với dịch vụ
              nhận hàng tại kho Indonesia và giao tận tay ở Việt Nam.
            </li>
          </ul>
          <p>
            Tiximax cam kết: thông báo tiến độ, báo giá tách bạch và hỗ trợ khai
            báo hải quan. Nếu bạn là SME nhập số lượng vừa và nhỏ, chọn tuyến
            niche của Tiximax thường tiết kiệm hơn so với hãng lớn.
          </p>
        </>
      </Section>

      <Section
        title="Khi nào nên chọn Tiximax vận chuyển hàng quốc tế?"
        bg="white"
      >
        <>
          <p>Bạn nên chọn dịch vụ gửi hàng quốc tế Tiximax khi:</p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>
              Gửi hàng thương mại điện tử nhiều đơn nhỏ, muốn gom để giảm cước.
            </li>
            <li>Gửi hàng cá nhân, quà biếu cần thủ tục thông quan đơn giản.</li>
            <li>
              Muốn chi phí vận chuyển thấp hơn so với các hãng quốc tế lớn.
            </li>
          </ul>
          <p>
            Lý do thực tế: Các hãng lớn thường tối ưu cho container lớn và giá
            cao cho lô lẻ. Trong khi đó, Tiximax tối ưu cho lô gom, tiết kiệm
            chi phí và xử lý thủ tục cho hàng phi mậu dịch. Nếu bạn cần{" "}
            <strong>Tiximax gửi hàng Nhật Việt</strong> hoặc{" "}
            <strong>Tiximax gửi hàng Hàn Việt</strong> theo lô nhỏ, quy trình và
            giá sẽ phù hợp hơn.
          </p>
        </>
      </Section>

      <Section title="Quy trình vận chuyển hàng tối ưu của Tiximax" bg="gray">
        <>
          <p>
            Tiximax áp dụng quy trình 3 bước để giảm phức tạp cho khách hàng:{" "}
            <strong>
              Nêu yêu cầu cụ thể với nhân viên Tiximax → Cung cấp thông tin cần
              thiết về hàng hóa → Theo dõi &amp; nhận hàng.
            </strong>
          </p>
          <p>
            Mỗi bước đều có hướng dẫn chi tiết nhằm giúp bạn hoàn thành thao tác
            nhanh, giảm lỗi khai báo và tránh rủi ro hải quan.
          </p>
        </>
      </Section>

      <Section
        title="Khám phá 3 bước dịch vụ Tiximax vận chuyển hàng quốc tế"
        bg="white"
      >
        <>
          <div className="space-y-6">
            <div className="border border-amber-200 rounded-2xl p-6 bg-amber-100 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
                Bước 1 – Nêu yêu cầu cụ thể với nhân viên Tiximax
              </h3>
              <div className="mt-3 h-[2px] w-16 mx-auto bg-amber-500 rounded-full" />
              <p className="mt-3">
                Bạn có thể liên hệ và nhận tư vấn từ nhân viên Tiximax theo 3
                cách sau:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 mt-1">
                <li>Điền form liên hệ có trên website.</li>
                <li>Nhắn tin qua Fanpage Tiximax Logistics.</li>
                <li>Gọi hotline Tiximax 090 183 42 83.</li>
              </ul>
            </div>

            <div className="border border-amber-200 rounded-2xl p-6 bg-amber-100 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
                Bước 2 – Cung cấp thông tin cần thiết về hàng hóa theo hướng dẫn
              </h3>
              <div className="mt-3 h-[2px] w-16 mx-auto bg-amber-500 rounded-full" />
              <p className="mt-3">
                Để tạo đơn hàng vận chuyển quốc tế, thông tin về hàng hóa và
                giao nhận là không thể thiếu. Tùy vào loại hàng hóa bạn muốn
                gửi, Tiximax sẽ yêu cầu các thông tin cụ thể để có thể tiến hành
                lên đơn hàng. Bạn chỉ cần cung cấp thông tin theo hướng dẫn từ
                nhân viên để tạo đơn vận chuyển hàng hóa quốc tế.
              </p>
            </div>

            <div className="border border-amber-200 rounded-2xl p-6 bg-amber-100 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
                Bước 3 – Theo dõi &amp; Nhận hàng
              </h3>
              <div className="mt-3 h-[2px] w-16 mx-auto bg-amber-500 rounded-full" />
              <p className="mt-3">
                Ngoài việc theo dõi đơn hàng qua thông tin từ nhân viên Tiximax,
                bạn còn có thể tự thực hiện qua tiện ích Tracking đơn hàng trên
                website. Mỗi đơn hàng sẽ có một mã vận đơn riêng biệt. Chỉ cần
                chọn mục <strong>“Tracking đơn hàng”</strong> trên thanh menu và
                nhập mã này, bạn sẽ cập nhật được thông tin về đơn hàng của
                mình.
              </p>
            </div>
          </div>
        </>
      </Section>

      <Section
        title="Tiximax xử lý các case Logistics đặc biệt như thế nào?"
        bg="gray"
      >
        <>
          <p>
            Tiximax gom nhiều đơn nhỏ từ nhiều nhà cung cấp thành một lô duy
            nhất (consolidation) để tiết kiệm cước. Quy trình gom đơn hàng của
            chúng tôi bao gồm:
          </p>
          <p>
            <strong>
              Nhận hàng tại kho nước ngoài → Kiểm hàng, chụp ảnh → Gộp theo kiện
              tối ưu khối lượng/thể tích → Đóng gói lại (nếu cần) → Xuất lô.
            </strong>
          </p>
          <p>
            Lợi ích: giảm chi phí theo kg, giảm phí xử lý hải quan và ít rủi ro
            hơn so với gửi từng kiện nhỏ. Để quá trình vận đơn diễn ra suôn sẻ,
            tránh thất lạc hàng, bạn hãy ghi chú thông tin rõ ràng trước khi
            giao cho đơn vị vận chuyển.
          </p>
        </>
      </Section>

      <Section title="Những ưu điểm Tiximax vận chuyển hàng quốc tế" bg="white">
        <>
          <p>
            Ưu điểm lớn nhất của Tiximax chính là sự minh bạch trong chi phí.
            Chúng tôi có bảng giá theo tuyến, cùng nhiều chính sách và lưu ý rõ
            ràng. Khi bạn muốn sử dụng dịch vụ vận chuyển hàng quốc tế Tiximax,
            tùy vào tuyến mà nhân viên của chúng tôi sẽ hỗ trợ báo giá cụ thể
            cho bạn.
          </p>

          <div className="mt-6 border border-amber-200 rounded-2xl p-6 bg-amber-50 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
                Bảng giá cước tổng quan dịch vụ gửi hàng quốc tế Tiximax
              </h3>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-4 text-center">
              Bạn có thể tham khảo giá cước các tuyến của Tiximax theo bảng sau.
              Đây là giá tham khảo, để được tư vấn cụ thể vui lòng để lại thông
              tin để nhân viên Tiximax hỗ trợ bạn.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm sm:text-base md:text-lg text-gray-800 border border-amber-200">
                <thead className="bg-amber-100">
                  <tr>
                    <th className="px-3 py-2 border-b border-amber-200 text-left">
                      Tuyến vận chuyển
                    </th>
                    <th className="px-3 py-2 border-b border-amber-200 text-left">
                      Đơn vị
                    </th>
                    <th className="px-3 py-2 border-b border-amber-200 text-left">
                      Đơn giá (từ)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 border-t border-amber-200">
                      Indonesia - Việt Nam
                    </td>
                    <td className="px-3 py-2 border-t border-amber-200">
                      Kg (kilogram)
                    </td>
                    <td className="px-3 py-2 border-t border-amber-200">
                      Từ 290.000 VNĐ
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-t border-amber-200">
                      Việt Nam - Indonesia
                    </td>
                    <td className="px-3 py-2 border-t border-amber-200">
                      Kg (kilogram)
                    </td>
                    <td className="px-3 py-2 border-t border-amber-200">
                      Từ 145.000 VNĐ
                    </td>
                  </tr>
                  <tr className="bg-amber-50">
                    <td className="px-3 py-2 border-t border-amber-200">
                      Nhật Bản - Việt Nam
                    </td>
                    <td className="px-3 py-2 border-t border-amber-200">
                      Kg (kilogram)
                    </td>
                    <td className="px-3 py-2 border-t border-amber-200">
                      Từ 110.000 VNĐ (Miền Bắc) – Từ 120.000 VNĐ (Miền Nam)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 border-t border-amber-200">
                      Hàn Quốc - Việt Nam
                    </td>
                    <td className="px-3 py-2 border-t border-amber-200">
                      Kg (kilogram)
                    </td>
                    <td className="px-3 py-2 border-t border-amber-200">
                      Từ 135.000 VNĐ (Miền Bắc) – Từ 145.000 VNĐ (Miền Nam)
                    </td>
                  </tr>
                  <tr className="bg-amber-50">
                    <td className="px-3 py-2 border-t border-amber-200">
                      Mỹ - Việt Nam
                    </td>
                    <td className="px-3 py-2 border-t border-amber-200">
                      Kg (kilogram)
                    </td>
                    <td className="px-3 py-2 border-t border-amber-200">
                      Từ 235.000 VNĐ (Miền Bắc) – Từ 245.000 VNĐ (Miền Nam)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      </Section>

      <Section
        title="Minh bạch quy trình chính sách thuế và hải quan"
        bg="gray"
      >
        <>
          <p>
            Khi lựa chọn dịch vụ{" "}
            <strong>Tiximax vận chuyển hàng quốc tế</strong>, bạn được cung cấp
            đầy đủ thông tin về thuế và hải quan cần thiết. Chúng tôi sẽ giúp
            hoàn thiện chứng từ kiểm tra chuyên ngành khi cần (thực phẩm chức
            năng, mỹ phẩm...). Tiximax cam kết hỗ trợ trọn gói: nộp hồ sơ, nộp
            thuế, nhận kết quả thông quan.
          </p>
          <p>
            <strong>Lưu ý thực tế:</strong> nếu khai báo sai mục đích (bán vs cá
            nhân) sẽ phát sinh thuế và xử phạt. Để tránh phát sinh chi phí phụ,
            hãy cung cấp thông tin chính xác từ đầu.
          </p>
        </>
      </Section>

      <Section
        title="Tiximax có chính sách bảo hiểm và bồi thường cụ thể"
        bg="white"
      >
        <>
          <p>
            Tiximax cung cấp gói bảo hiểm tùy chọn với mức bồi thường tối đa có
            thể tới <strong>100% giá trị hàng hóa</strong> theo hóa đơn hợp lệ
            (điều kiện áp dụng nêu rõ trong hợp đồng). Về quy trình khiếu nại,
            bạn cần thông báo trong <strong>48 giờ</strong> kể từ khi nhận hàng,
            nộp ảnh/video và biên nhận. Tiximax sẽ xử lý khiếu nại trong{" "}
            <strong>15 - 30 ngày</strong> tùy mức độ.
          </p>
          <p>
            Với các hàng hóa có giá trị cao và dễ vỡ, chúng tôi khuyến nghị bạn
            nên mua gói bảo hiểm để được đảm bảo quyền lợi tốt nhất.
          </p>
        </>
      </Section>

      <Section
        title="Lưu ý về hàng hóa cấm, hàng hóa đặc biệt khi gửi hàng quốc tế Tiximax"
        bg="gray"
      >
        <>
          <p>
            Tiximax tuân thủ pháp luật Việt Nam và không vận chuyển hàng cấm.
            Đồng thời, với hàng đặc biệt như thực phẩm chức năng, pin lithium,
            có yêu cầu giấy tờ và đóng gói riêng. Để được tư vấn và hỗ trợ cụ
            thể về thủ tục đối với những hàng hóa đặc biệt, hãy liên hệ với nhân
            viên của Tiximax qua hotline hoặc Fanpage Tiximax Logistics.
          </p>
          <p className="font-semibold mt-2">
            Các mặt hàng Tiximax từ chối vận chuyển:
          </p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>Vũ khí, đạn dược, chất nổ, chất độc.</li>
            <li>Động vật hoang dã bị cấm, sản phẩm từ động vật bị cấm.</li>
            <li>
              Một số loại thuốc/hóa chất bị quản lý, hàng vi phạm pháp luật.
            </li>
          </ul>
          <p>
            Nếu sản phẩm có nghi vấn, hãy hỏi Tiximax trước khi gửi để tránh rủi
            ro bị hủy/tiêu huỷ.
          </p>
        </>
      </Section>

      <Section title="Tiximax hướng dẫn vận chuyển hàng đặc biệt" bg="white">
        <>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Thực phẩm chức năng &amp; mỹ phẩm:</strong> cung cấp giấy
              tờ xuất xứ, thành phần, hạn dùng; có thể cần giấy phép kiểm nghiệm
              chuyên ngành.
            </li>
            <li>
              <strong>Hàng điện tử có pin (lithium):</strong> tuân thủ quy định
              vận chuyển hàng không; cần đóng gói chống chập, đánh dấu nguy
              hiểm, đôi khi chuyển bằng đường biển để tiết kiệm chi phí.
            </li>
            <li>
              <strong>Hàng cồng kềnh/nội thất:</strong> đo kích thước thực tế để
              tính cước thể tích; khuyên dùng đóng kiện gỗ hoặc chống sốc.
            </li>
          </ul>
          <p>
            Tiximax sẽ hỗ trợ tư vấn chi tiết cho từng loại mặt hàng trước khi
            bạn gửi cho đơn vị vận chuyển.
          </p>
        </>
      </Section>

      <section className="py-16 border-t border-amber-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-sm"
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-[3px] w-20 bg-amber-500 rounded-full" />
            </div>

            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed text-center">
              Tiximax là giải pháp cân bằng giữa chi phí thấp, quy trình linh
              hoạt và độ tin cậy cao cho SME và cá nhân muốn gửi hàng quốc tế.
              Minh bạch về phí, hỗ trợ thủ tục trọn gói, hãy lựa chọn{" "}
              <strong>dịch vụ Tiximax vận chuyển hàng quốc tế</strong> để được
              hỗ trợ tốt nhất. Trước khi gửi, đừng quên yêu cầu báo giá chi
              tiết, chính sách bảo hiểm và checklist đóng gói để bảo vệ quyền
              lợi.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mt-2">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm sm:text-base font-semibold text-white bg-amber-600 hover:bg-amber-700"
              >
                Nhận tư vấn &amp; báo giá tuyến
              </Link>
              <Link
                to="/tracking"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm sm:text-base font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100"
              >
                Tra cứu &amp; tracking đơn hàng
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default ServicesShipping;
