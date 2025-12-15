import React, { useMemo, useState } from "react";
import {
  Search,
  Barcode,
  ClipboardList,
  PlaneTakeoff,
  Plane,
  PlaneLanding,
  Truck,
  PackageSearch,
  CircleAlert,
  Clock,
  MapPin,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const DEMO_DATA = {
  TXM123456: {
    trackingNo: "TXM123456",
    route: "Chiba (JP) → Đà Nẵng (VN)",
    eta: "2025-11-14",
    status: "customs_vn",
    checkpoints: [
      {
        ts: "2025-11-09 10:15",
        code: "created",
        name: "Tạo mã kiện / received at JP hub",
        icon: PackageSearch,
      },
      {
        ts: "2025-11-10 09:05",
        code: "dep_origin",
        name: "Rời kho Chiba",
        icon: PlaneTakeoff,
      },
      {
        ts: "2025-11-10 14:10",
        code: "in_flight",
        name: "Đang bay (NRT → SGN)",
        icon: Plane,
      },
      {
        ts: "2025-11-10 18:45",
        code: "arr_vn",
        name: "Đến Việt Nam (SGN)",
        icon: PlaneLanding,
      },
      {
        ts: "2025-11-11 09:30",
        code: "customs_vn",
        name: "Đang thông quan VN",
        icon: ClipboardList,
      },
    ],
  },
  TXM987654: {
    trackingNo: "TXM987654",
    route: "Seoul (KR) → Hà Nội (VN)",
    eta: "2025-11-12",
    status: "arr_vn",
    checkpoints: [
      {
        ts: "2025-11-08 11:20",
        code: "created",
        name: "Tạo mã kiện / received at KR hub",
        icon: PackageSearch,
      },
      {
        ts: "2025-11-09 08:30",
        code: "dep_origin",
        name: "Rời kho Seoul",
        icon: PlaneTakeoff,
      },
      {
        ts: "2025-11-09 12:00",
        code: "in_flight",
        name: "Đang bay (ICN → HAN)",
        icon: Plane,
      },
      {
        ts: "2025-11-09 14:50",
        code: "arr_vn",
        name: "Đến Việt Nam (HAN)",
        icon: PlaneLanding,
      },
    ],
  },
};

const STATUS_ORDER = [
  "created",
  "dep_origin",
  "in_flight",
  "arr_vn",
  "customs_vn",
  "out_for_delivery",
  "delivered",
];

const STATUS_META = {
  created: {
    label: "Tạo mã kiện",
    color: "bg-gray-700",
    desc: "Đã nhận hàng tại kho nước ngoài",
  },
  dep_origin: {
    label: "Rời kho",
    color: "bg-yellow-600",
    desc: "Đã rời kho nước ngoài",
  },
  in_flight: {
    label: "Đang bay",
    color: "bg-yellow-500",
    desc: "Đang vận chuyển quốc tế",
  },
  arr_vn: {
    label: "Đến VN",
    color: "bg-yellow-700",
    desc: "Đã tới sân bay Việt Nam",
  },
  customs_vn: {
    label: "Thông quan",
    color: "bg-amber-700",
    desc: "Đang làm thủ tục hải quan",
  },
  out_for_delivery: {
    label: "Phát hàng",
    color: "bg-gray-900",
    desc: "Giao hàng nội địa",
  },
  delivered: {
    label: "Hoàn tất",
    color: "bg-green-600",
    desc: "Đã giao cho khách",
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const percentageFromStatus = (code) => {
  const idx = STATUS_ORDER.indexOf(code);
  const pct = ((idx + 1) / STATUS_ORDER.length) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
};

const GuideTracking = () => {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const onSearch = (e) => {
    e?.preventDefault?.();
    setError("");
    const key = code.trim().toUpperCase();
    if (!key) {
      setError("Nhập mã kiện/đơn ví dụ: TXM123456");
      setResult(null);
      return;
    }
    if (!/^TXM[0-9]{6,}$/i.test(key)) {
      setError("Định dạng mã không hợp lệ. Ví dụ đúng: TXM123456");
      setResult(null);
      return;
    }
    if (DEMO_DATA[key]) {
      setResult(DEMO_DATA[key]);
    } else {
      setResult({ trackingNo: key, notFound: true });
    }
  };

  const progress = useMemo(
    () => percentageFromStatus(result?.status || "created"),
    [result]
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-amber-50/40">
      {/* HEADER HERO – ĐỒNG BỘ VỚI ServiceList & GuideOrder */}
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
              Tra cứu tình trạng đơn hàng
            </h1>
            <p className="text-sm md:text-base text-gray-200 max-w-2xl leading-relaxed">
              Nhập mã kiện hoặc mã vận đơn TIXIMAX để xem lộ trình vận chuyển,
              trạng thái thông quan và tiến độ giao hàng một cách rõ ràng, dễ
              hiểu.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SEARCH BOX SECTION */}
      <section className="pt-20 lg:pt-28 pb-4 px-6">
        <div className="max-w-7xl mx-auto">
          <form
            onSubmit={onSearch}
            className="max-w-3xl mx-auto -mt-6 md:-mt-12"
          >
            <div className="bg-gray-50 rounded-2xl shadow-xl p-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center gap-3 px-3">
                <Barcode className="w-7 h-7 text-yellow-600" />
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Nhập mã: TXM123456"
                  className="w-full text-lg md:text-xl outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-4 rounded-xl text-white font-bold text-lg bg-yellow-400 hover:bg-yellow-600 transition-colors"
              >
                Tra cứu
              </button>
            </div>

            {error && (
              <div className="mt-4 text-base md:text-lg text-red-700 flex items-center gap-2 justify-center">
                <CircleAlert className="w-5 h-5" /> {error}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* RESULT SECTION */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          {!result ? (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-10 text-center min-h-[100px]" />
          ) : result.notFound ? (
            <div className="bg-white rounded-2xl shadow-xl p-10 border-4 border-yellow-400">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <CircleAlert className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                      Không tìm thấy thông tin
                    </h3>
                    <p className="text-gray-700 mt-2 text-lg">
                      Mã <strong>{result.trackingNo}</strong> không có trong hệ
                      thống. Vui lòng kiểm tra lại hoặc liên hệ CSKH.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCode("");
                    setResult(null);
                    setError("");
                  }}
                  className="px-7 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl flex items-center gap-2 text-base md:text-lg"
                >
                  <RefreshCcw className="w-5 h-5" /> Tra cứu lại
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-16">
              {/* Header Info */}
              <div className="mb-14 pb-10 border-b-4 border-yellow-400">
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-gray-600 text-base mb-2">Mã theo dõi</p>
                    <p className="text-3xl md:text-4xl font-black text-gray-900 break-all">
                      {result.trackingNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-base mb-2">Tuyến đường</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {result.route}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-base mb-2">ETA dự kiến</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {result.eta}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg md:text-xl font-bold text-gray-900">
                      Tiến độ vận chuyển
                    </span>
                    <span className="text-2xl md:text-3xl font-black text-yellow-600">
                      {progress}%
                    </span>
                  </div>
                  <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-block w-4 h-4 rounded-full ${
                        STATUS_META[result.status]?.color
                      }`}
                    ></span>
                    <span className="text-lg font-bold text-gray-900">
                      {STATUS_META[result.status]?.label}
                    </span>
                    <span className="text-gray-600 text-base">
                      - {STATUS_META[result.status]?.desc}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-14">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <ClipboardList className="w-7 h-7 text-yellow-600" />
                  Dòng thời gian chi tiết
                </h3>
                <ul className="space-y-10 pl-8">
                  {result.checkpoints.map((cp, idx) => {
                    const Icon = cp.icon || PackageSearch;
                    return (
                      <li key={cp.ts + cp.code} className="relative">
                        <div className="flex items-start gap-5">
                          <div className="relative">
                            <span
                              className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-white ${
                                STATUS_META[cp.code]?.color || "bg-gray-400"
                              }`}
                            >
                              <Icon className="w-6 h-6" />
                            </span>
                            {idx < result.checkpoints.length - 1 && (
                              <span className="absolute left-1/2 -translate-x-1/2 top-16 w-1 h-12 bg-gray-300"></span>
                            )}
                          </div>
                          <div className="flex-1 pt-1.5">
                            <div className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                              {cp.name}
                            </div>
                            <div className="text-base md:text-lg text-gray-600 flex items-center gap-2">
                              <Clock className="w-4 h-4" /> {cp.ts}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Status Legend */}
              <div className="mb-14">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-7 pb-3 border-b-4 border-yellow-400 flex items-center gap-3">
                  <PackageSearch className="w-7 h-7 text-yellow-600" />Ý nghĩa
                  các trạng thái
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  {STATUS_ORDER.map((code) => (
                    <div
                      key={code}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <span
                        className={`inline-block w-4 h-4 rounded-full ${STATUS_META[code].color}`}
                      ></span>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {STATUS_META[code].label}
                        </p>
                        <p className="text-gray-600 text-base">
                          {STATUS_META[code].desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-7 rounded-xl">
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-yellow-600" />
                  Mẹo tra cứu hiệu quả
                </h4>
                <ul className="space-y-3 text-lg text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <span>
                      Mã TIXIMAX có dạng <strong>TXM + số</strong> (ví dụ:
                      TXM123456)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <span>
                      Nếu trạng thái không cập nhật quá 24h, liên hệ CSKH để
                      kiểm tra
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">•</span>
                    <span>
                      Sau <strong>Thông quan</strong>, hàng sẽ được gán{" "}
                      <strong>Phát hàng</strong> và giao nội địa
                    </span>
                  </li>
                </ul>
              </div>

              {/* Note */}
              <div className="mt-7 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-yellow-600" />
                Thông tin demo chỉ mang tính minh họa
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10 pb-4 border-b-4 border-yellow-400 flex items-center gap-3">
              <Truck className="w-7 h-7 text-yellow-600" />
              Câu hỏi thường gặp
            </h2>

            <div className="grid md:grid-cols-2 gap-10">
              <motion.div
                className="border-l-4 border-yellow-500 pl-7 py-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.0 }}
              >
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Bao lâu tiến độ được cập nhật?
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Thông thường mỗi mốc xử lý sẽ được cập nhật trong vòng 1–3 giờ
                  làm việc; các mốc bay/đến sân bay phụ thuộc lịch của hãng vận
                  chuyển.
                </p>
              </motion.div>

              <motion.div
                className="border-l-4 border-yellow-500 pl-7 py-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Tôi có thể lấy số AWB/MAWB không?
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Có. Sau khi đơn được gán chuyến bay, bạn có thể yêu cầu cung
                  cấp số HAWB/MAWB để đối chiếu hoặc làm chứng từ.
                </p>
              </motion.div>

              <motion.div
                className="border-l-4 border-yellow-500 pl-7 py-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  ETA có thể thay đổi không?
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Có. ETA phụ thuộc lịch bay thực tế và tình trạng thông quan.
                  Nếu có thay đổi, hệ thống sẽ cập nhật lại thời gian dự kiến
                  sớm nhất có thể.
                </p>
              </motion.div>

              <motion.div
                className="border-l-4 border-yellow-500 pl-7 py-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  Hàng tôi tới VN nhưng lâu giao?
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Có thể đơn đang chờ thông quan hoặc chờ gom tuyến giao nội
                  địa. Bạn có thể liên hệ CSKH để được kiểm tra và ưu tiên phát
                  hàng nếu cần gấp.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== COPY "Content - Tra Cứu" TỪ GuideOrder: ĐẶT DƯỚI FAQ ====== */}
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
