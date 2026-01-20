// // pages/Manager/Dashboard/SummaryCustomer.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import dashboardService from "../../../Services/Dashboard/dashboardService";
// import toast from "react-hot-toast";
// import {
//   ArrowLeft,
//   Users,
//   UserPlus,
//   TrendingUp,
//   Award,
//   AlertCircle,
//   Calendar,
//   Medal,
//   Crown,
//   ChevronRight,
//   Layers,
// } from "lucide-react";

// const FILTER_OPTIONS = [
//   { label: "Hôm nay", value: "DAY" },
//   { label: "Tháng này", value: "MONTH" },
//   { label: "Quý này", value: "QUARTER" },
//   { label: "6 tháng", value: "HALF_YEAR" },
//   { label: "Tùy chỉnh", value: "CUSTOM" },
// ];

// const SummaryCustomer = () => {
//   const navigate = useNavigate();
//   const [filterType, setFilterType] = useState("MONTH");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchSummary = async () => {
//     if (filterType === "CUSTOM" && (!startDate || !endDate)) {
//       toast.error("Vui lòng chọn ngày bắt đầu và kết thúc");
//       return;
//     }
//     if (filterType === "CUSTOM" && startDate > endDate) {
//       toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     try {
//       const response = await dashboardService.getStaffCustomersSummary({
//         filterType,
//         startDate,
//         endDate,
//       });
//       setData(response.data);
//     } catch (err) {
//       console.error(err);
//       setError(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Lỗi khi tải dữ liệu khách hàng"
//       );
//       toast.error("Lỗi khi tải dữ liệu khách hàng");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSummary();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filterType]);

//   const formatNumber = (value) => {
//     if (value == null) return "0";
//     return Number(value).toLocaleString("vi-VN");
//   };

//   const metrics = useMemo(() => {
//     if (!data || !Array.isArray(data) || data.length === 0) return null;

//     const totalCustomers = data.reduce(
//       (sum, item) => sum + (item.newCustomerCount || 0),
//       0
//     );
//     const totalStaff = data.length;

//     // giả định API đã sort desc theo newCustomerCount
//     const topPerformer = data[0] || null;

//     const avgCustomersPerStaff =
//       totalStaff > 0 ? totalCustomers / totalStaff : 0;

//     return {
//       totalCustomers,
//       totalStaff,
//       topPerformer,
//       avgCustomersPerStaff,
//     };
//   }, [data]);

//   const SkeletonCard = () => (
//     <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-200">
//       <div className="animate-pulse">
//         <div className="flex items-center justify-between mb-3">
//           <div className="h-4 w-24 rounded bg-gray-100" />
//           <div className="h-10 w-10 rounded-xl bg-gray-100" />
//         </div>
//         <div className="h-8 w-32 rounded bg-gray-100" />
//       </div>
//     </div>
//   );

//   const getMedalIcon = (index) => {
//     if (index === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
//     if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
//     if (index === 2) return <Medal className="h-5 w-5 text-amber-700" />;
//     return null;
//   };

//   const getRankBgColor = (index) => {
//     if (index === 0)
//       return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
//     if (index === 1)
//       return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
//     if (index === 2)
//       return "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200";
//     return "bg-white border-gray-200";
//   };

//   const isCustom = filterType === "CUSTOM";

//   return (
//     <div className="min-h-screen px-4 py-6">
//       <div className="mx-auto">
//         {/* ✅ Breadcrumb tách riêng */}
//         <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-gray-700">
//           <button
//             onClick={() => navigate("/manager/dashboard")}
//             className="px-2 py-1 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200 transition-colors flex items-center gap-1"
//           >
//             <ArrowLeft size={14} />
//             Dashboard
//           </button>
//           <ChevronRight className="w-4 h-4 text-gray-400" />
//           <span className="px-2 py-1 rounded-lg bg-white border border-gray-200">
//             Khách hàng mới theo nhân viên
//           </span>
//         </div>

//         {/* ✅ Header gọn */}
//         <div className="mb-6 rounded-2xl border border-gray-200 bg-sky-300 px-6 py-4 shadow-sm">
//           <div className="flex flex-col gap-4">
//             {/* Top row */}
//             <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
//                   <Users className="h-5 w-5 text-sky-600" />
//                 </div>
//                 <div>
//                   <h1 className="text-lg md:text-xl font-semibold text-black">
//                     Thống kê khách hàng mới
//                   </h1>
//                 </div>
//               </div>

//               {/* Quick info pill */}
//               <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 bg-white/70">
//                 <div className="p-1.5 rounded-lg bg-white text-purple-700">
//                   <Layers size={16} />
//                 </div>
//                 <div className="leading-tight">
//                   <div className="text-xs font-semibold text-gray-900">
//                     {metrics ? metrics.totalStaff : 0} nhân viên
//                   </div>
//                   <div className="text-[11px] text-gray-600">Đang thống kê</div>
//                 </div>
//               </div>
//             </div>

//             {/* Filters row */}
//             <div className="pt-4 border-t border-sky-400">
//               <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/70">
//                 Khoảng thời gian
//               </div>

//               <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
//                 <div className="inline-flex flex-wrap rounded-xl bg-gray-100 p-1">
//                   {FILTER_OPTIONS.map((opt) => (
//                     <button
//                       key={opt.value}
//                       onClick={() => setFilterType(opt.value)}
//                       disabled={loading}
//                       className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
//                         filterType === opt.value
//                           ? "bg-white text-blue-700 shadow-sm"
//                           : "text-gray-600 hover:text-gray-900"
//                       } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
//                     >
//                       {opt.label}
//                     </button>
//                   ))}
//                 </div>

//                 {/* Custom range bar */}
//                 {isCustom && (
//                   <div className="w-full lg:w-auto">
//                     <div className="rounded-xl bg-white/70 border border-gray-200 p-3">
//                       <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
//                         <div className="flex flex-wrap items-center gap-3">
//                           <div className="flex items-center gap-2">
//                             <Calendar className="h-4 w-4 text-gray-800" />
//                             <span className="text-sm font-semibold text-gray-900">
//                               Tùy chỉnh:
//                             </span>
//                           </div>

//                           <div className="flex items-center gap-2">
//                             <span className="text-sm font-medium text-gray-700">
//                               Từ
//                             </span>
//                             <input
//                               type="date"
//                               value={startDate}
//                               onChange={(e) => setStartDate(e.target.value)}
//                               className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                             />
//                           </div>

//                           <div className="flex items-center gap-2">
//                             <span className="text-sm font-medium text-gray-700">
//                               Đến
//                             </span>
//                             <input
//                               type="date"
//                               value={endDate}
//                               onChange={(e) => setEndDate(e.target.value)}
//                               className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                             />
//                           </div>
//                         </div>

//                         <button
//                           onClick={fetchSummary}
//                           disabled={loading}
//                           className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                         >
//                           {loading ? "Đang tải..." : "Tìm kiếm"}
//                         </button>
//                       </div>

//                       <p className="mt-2 text-xs text-gray-600">
//                         Chọn ngày rồi bấm <b>Tìm kiếm</b> để cập nhật dữ liệu.
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ERROR */}
//         {error && (
//           <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
//             <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
//             <span>{error}</span>
//           </div>
//         )}

//         {/* LOADING */}
//         {loading && (
//           <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
//             <SkeletonCard />
//             <SkeletonCard />
//             <SkeletonCard />
//             <SkeletonCard />
//           </div>
//         )}

//         {/* NO DATA */}
//         {!loading && (!data || data.length === 0) && (
//           <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
//             <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//             <p className="text-gray-600 text-sm font-semibold mb-1">
//               Không có dữ liệu
//             </p>
//             <p className="text-gray-500 text-sm">
//               Thử đổi khoảng thời gian khác.
//             </p>
//           </div>
//         )}

//         {/* DATA */}
//         {!loading && data && data.length > 0 && metrics && (
//           <>
//             {/* SUMMARY CARDS */}
//             <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
//               {/* Tổng KH mới */}
//               <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-5 shadow-sm border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
//                       Tổng KH mới
//                     </p>
//                     <p className="mt-2 text-3xl font-bold text-gray-900">
//                       {formatNumber(metrics.totalCustomers)}
//                     </p>
//                     <p className="mt-1 text-xs text-gray-700">
//                       TB/NV: <b>{metrics.avgCustomersPerStaff.toFixed(1)}</b>
//                     </p>
//                   </div>
//                   <div className="rounded-xl bg-white/70 p-3">
//                     <UserPlus className="h-6 w-6 text-blue-600" />
//                   </div>
//                 </div>
//               </div>

//               {/* Số nhân viên */}
//               <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 p-5 shadow-sm border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
//                       Số nhân viên
//                     </p>
//                     <p className="mt-2 text-3xl font-bold text-gray-900">
//                       {formatNumber(metrics.totalStaff)}
//                     </p>
//                     <p className="mt-1 text-xs text-gray-700">
//                       Có dữ liệu theo lọc
//                     </p>
//                   </div>
//                   <div className="rounded-xl bg-white/70 p-3">
//                     <Users className="h-6 w-6 text-purple-600" />
//                   </div>
//                 </div>
//               </div>

//               {/* Top performer */}
//               <div className="rounded-2xl bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 p-5 shadow-sm border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1 min-w-0">
//                     <p className="text-xs font-medium uppercase tracking-wide text-gray-900 mb-1">
//                       Nhân viên xuất sắc
//                     </p>
//                     <p className="text-sm font-semibold text-gray-900 truncate">
//                       {metrics.topPerformer?.staffName || "N/A"}
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900 mt-1">
//                       {formatNumber(
//                         metrics.topPerformer?.newCustomerCount || 0
//                       )}{" "}
//                       <span className="text-base font-normal">KH</span>
//                     </p>
//                   </div>
//                   <div className="rounded-xl bg-white/70 p-3">
//                     <Award className="h-6 w-6 text-yellow-600" />
//                   </div>
//                 </div>
//               </div>

//               {/* TB mỗi NV */}
//               <div className="rounded-2xl bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-5 shadow-sm border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
//                       TB mỗi NV
//                     </p>
//                     <p className="mt-2 text-3xl font-bold text-gray-900">
//                       {metrics.avgCustomersPerStaff.toFixed(1)}
//                     </p>
//                     <p className="mt-1 text-xs text-gray-700">KH / nhân viên</p>
//                   </div>
//                   <div className="rounded-xl bg-white/70 p-3">
//                     <TrendingUp className="h-6 w-6 text-green-600" />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* RANKING */}
//             <div className="bg-white rounded-2xl border border-gray-200 p-6">
//               <div className="flex items-end justify-between mb-4">
//                 <h3 className="text-sm font-bold text-gray-700 uppercase">
//                   Bảng xếp hạng nhân viên
//                 </h3>
//                 <div className="text-xs text-gray-500">
//                   Tổng:{" "}
//                   <b className="text-gray-800">
//                     {formatNumber(metrics.totalCustomers)}
//                   </b>{" "}
//                   KH mới
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 {data.map((staff, index) => {
//                   const percentOfTotal =
//                     metrics.totalCustomers > 0
//                       ? (staff.newCustomerCount / metrics.totalCustomers) * 100
//                       : 0;

//                   return (
//                     <div
//                       key={`${staff.staffName}-${index}`}
//                       className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border transition-all hover:shadow-md ${getRankBgColor(
//                         index
//                       )}`}
//                     >
//                       {/* Left */}
//                       <div className="flex items-center gap-4 flex-1 min-w-0">
//                         <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200 font-bold text-gray-900">
//                           {index <= 2 ? (
//                             getMedalIcon(index)
//                           ) : (
//                             <span className="text-sm">{index + 1}</span>
//                           )}
//                         </div>

//                         <div className="min-w-0">
//                           <p className="font-semibold text-gray-900 truncate">
//                             {staff.staffName}
//                           </p>
//                           <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
//                             {index === 0 && (
//                               <span className="font-semibold text-yellow-700">
//                                 🏆 Xuất sắc nhất
//                               </span>
//                             )}
//                             <span>{percentOfTotal.toFixed(1)}% tổng KH</span>
//                           </div>

//                           {/* Progress */}
//                           <div className="mt-2 w-full max-w-[360px] bg-gray-200 rounded-full h-1.5">
//                             <div
//                               className="bg-green-600 h-1.5 rounded-full transition-all"
//                               style={{
//                                 width: `${Math.min(100, percentOfTotal)}%`,
//                               }}
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       {/* Right */}
//                       <div className="text-right">
//                         <p className="text-2xl font-bold text-gray-900">
//                           {formatNumber(staff.newCustomerCount)}
//                         </p>
//                         <p className="text-xs text-gray-500 font-medium">
//                           khách hàng
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Footer */}
//               <div className="mt-6 pt-4 border-t border-gray-200">
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
//                   <div className="p-3 rounded-lg bg-gray-50">
//                     <p className="text-xs text-gray-500 uppercase font-medium mb-1">
//                       Tổng nhân viên
//                     </p>
//                     <p className="text-xl font-bold text-gray-900">
//                       {metrics.totalStaff}
//                     </p>
//                   </div>
//                   <div className="p-3 rounded-lg bg-blue-50">
//                     <p className="text-xs text-gray-500 uppercase font-medium mb-1">
//                       Tổng KH mới
//                     </p>
//                     <p className="text-xl font-bold text-gray-900">
//                       {formatNumber(metrics.totalCustomers)}
//                     </p>
//                   </div>
//                   <div className="p-3 rounded-lg bg-green-50">
//                     <p className="text-xs text-gray-500 uppercase font-medium mb-1">
//                       TB mỗi NV
//                     </p>
//                     <p className="text-xl font-bold text-gray-900">
//                       {metrics.avgCustomersPerStaff.toFixed(1)}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SummaryCustomer;

// pages/Manager/Dashboard/SummaryCustomer.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../../Services/Dashboard/dashboardService";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Users,
  UserPlus,
  TrendingUp,
  Award,
  AlertCircle,
  Calendar,
  Medal,
  Crown,
  ChevronRight,
  Layers,
} from "lucide-react";

const FILTER_OPTIONS = [
  { label: "Hôm nay", value: "DAY" },
  { label: "Tuần này", value: "WEEK" },
  { label: "Tháng này", value: "MONTH" },
  { label: "Quý này", value: "QUARTER" },
  { label: "6 tháng", value: "HALF_YEAR" },
  { label: "Tùy chỉnh", value: "CUSTOM" },
];

const SummaryCustomer = () => {
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState("MONTH");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isCustom = filterType === "CUSTOM";

  const fetchSummary = async (opts = {}) => {
    const nextFilter = opts.filterType ?? filterType;
    const nextStart = opts.startDate ?? startDate;
    const nextEnd = opts.endDate ?? endDate;

    if (nextFilter === "CUSTOM" && (!nextStart || !nextEnd)) {
      toast.error("Vui lòng chọn ngày bắt đầu và kết thúc");
      return;
    }
    if (nextFilter === "CUSTOM" && nextStart > nextEnd) {
      toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = { filterType: nextFilter };
      if (nextFilter === "CUSTOM") {
        params.startDate = nextStart;
        params.endDate = nextEnd;
      }

      const response = await dashboardService.getStaffCustomersSummary(params);
      setData(response?.data || []);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi khi tải dữ liệu khách hàng";
      setError(msg);
      toast.error("Lỗi khi tải dữ liệu khách hàng");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto fetch khi đổi filter nhanh; CUSTOM thì chờ bấm Tìm kiếm
  useEffect(() => {
    if (filterType !== "CUSTOM") fetchSummary({ filterType });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const formatNumber = (value) => {
    if (value == null) return "0";
    return Number(value || 0).toLocaleString("vi-VN");
  };

  const metrics = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    const totalCustomers = data.reduce(
      (sum, item) => sum + (item.newCustomerCount || 0),
      0,
    );
    const totalStaff = data.length;

    // chắc chắn top (sort ở FE)
    const sorted = [...data].sort(
      (a, b) => (b.newCustomerCount || 0) - (a.newCustomerCount || 0),
    );
    const topPerformer = sorted[0] || null;

    const avgCustomersPerStaff =
      totalStaff > 0 ? totalCustomers / totalStaff : 0;

    return {
      totalCustomers,
      totalStaff,
      topPerformer,
      avgCustomersPerStaff,
      sorted,
    };
  }, [data]);

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
      <div className="p-5 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-28 bg-gray-200 rounded" />
          <div className="h-10 w-10 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-10 w-44 bg-gray-200 rounded" />
        <div className="mt-3 h-3 w-28 bg-gray-100 rounded" />
      </div>
    </div>
  );

  const SectionTitle = ({ children }) => (
    <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">
      {children}
    </h3>
  );

  const FilterButton = ({ value, label }) => {
    const active = filterType === value;
    return (
      <button
        onClick={() => setFilterType(value)}
        disabled={loading}
        className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all border ${
          active
            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {label}
      </button>
    );
  };

  const RankIcon = ({ index }) => {
    if (index === 0)
      return (
        <div className="w-10 h-10 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center">
          <Crown className="w-5 h-5 text-yellow-600" />
        </div>
      );
    if (index === 1)
      return (
        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
          <Medal className="w-5 h-5 text-gray-500" />
        </div>
      );
    if (index === 2)
      return (
        <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Medal className="w-5 h-5 text-amber-700" />
        </div>
      );
    return (
      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-800">
        {index + 1}
      </div>
    );
  };

  return (
    <div className="min-h-screen ">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* ✅ Breadcrumb đồng bộ */}
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-gray-700">
          <button
            onClick={() => navigate("/manager/dashboard")}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-1 shadow-sm"
          >
            <ArrowLeft size={14} />
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm">
            Khách hàng mới theo nhân viên
          </span>
        </div>

        {/* ✅ Header đồng bộ (white card + filter inline) */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-5">
            <div className="flex flex-col gap-4">
              {/* Top row */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg md:text-xl font-bold text-gray-800 leading-tight truncate">
                      Thống kê khách hàng mới
                    </h1>
                  </div>
                </div>

                {/* Quick info pill */}
                <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                  <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-200">
                    <Layers size={16} className="text-gray-700" />
                  </div>
                  <div className="leading-tight">
                    <div className="text-xs font-bold text-gray-900 tabular-nums">
                      {metrics ? metrics.totalStaff : 0} nhân viên
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="pt-4 border-t border-gray-200">
                <div className="mb-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Khoảng thời gian
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    {FILTER_OPTIONS.map((opt) => (
                      <FilterButton
                        key={opt.value}
                        value={opt.value}
                        label={opt.label}
                      />
                    ))}
                  </div>

                  {/* Custom range bar */}
                  {isCustom && (
                    <div className="w-full lg:w-auto">
                      <div className="rounded-xl bg-white border border-gray-200 p-3 shadow-sm">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-700" />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">
                                Từ
                              </span>
                              <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">
                                Đến
                              </span>
                              <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              fetchSummary({
                                filterType: "CUSTOM",
                                startDate,
                                endDate,
                              })
                            }
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {loading ? "Đang tải..." : "Tìm kiếm"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* pill hiển thị filter hiện tại */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-xs md:text-sm font-semibold text-blue-800">
                      {FILTER_OPTIONS.find((f) => f.value === filterType)
                        ?.label || "—"}
                    </span>
                  </div>
                </div>
              </div>
              {/* end filters */}
            </div>
          </div>
        </div>

        {/* ✅ Error đồng bộ */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-red-800 mb-1">
                  Có lỗi xảy ra
                </h3>
                <p className="text-sm text-red-700 break-words">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Loading */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* ✅ No data */}
        {!loading && (!data || data.length === 0) && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 text-sm font-bold mb-1">
              Không có dữ liệu
            </p>
            <p className="text-gray-500 text-sm">
              Thử đổi khoảng thời gian khác.
            </p>
          </div>
        )}

        {/* ✅ Data */}
        {!loading && data && data.length > 0 && metrics && (
          <>
            {/* SUMMARY CARDS đồng bộ (tone xanh) */}
            <SectionTitle>Tổng quan</SectionTitle>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
              {/* Tổng KH mới */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 min-h-[150px]">
                <div className="p-5 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Tổng KH mới
                    </span>
                    <div className="p-2.5 rounded-lg bg-blue-600">
                      <UserPlus className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 leading-none tabular-nums">
                    {formatNumber(metrics.totalCustomers)}
                  </div>
                  <div className="mt-3 text-xs md:text-sm text-gray-600">
                    TB/NV:{" "}
                    <b className="text-gray-800 tabular-nums">
                      {metrics.avgCustomersPerStaff.toFixed(1)}
                    </b>
                  </div>
                </div>
              </div>

              {/* Số nhân viên */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 min-h-[150px]">
                <div className="p-5 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Số nhân viên
                    </span>
                    <div className="p-2.5 rounded-lg bg-blue-600">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 leading-none tabular-nums">
                    {formatNumber(metrics.totalStaff)}
                  </div>
                  <div className="mt-3 text-xs md:text-sm text-gray-600">
                    Có dữ liệu theo lọc
                  </div>
                </div>
              </div>

              {/* Nhân viên xuất sắc */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 min-h-[150px]">
                <div className="p-5 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Nhân viên xuất sắc
                    </span>
                    <div className="p-2.5 rounded-lg bg-blue-600">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-base md:text-lg font-bold text-gray-800 truncate">
                      {metrics.topPerformer?.staffName || "N/A"}
                    </div>
                    <div className="mt-2 text-2xl md:text-3xl font-bold text-blue-600 tabular-nums">
                      {formatNumber(
                        metrics.topPerformer?.newCustomerCount || 0,
                      )}
                      <span className="text-sm md:text-base font-semibold text-gray-600 ml-1">
                        KH
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TB mỗi NV */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 min-h-[150px]">
                <div className="p-5 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      TB mỗi NV
                    </span>
                    <div className="p-2.5 rounded-lg bg-blue-600">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 leading-none tabular-nums">
                    {metrics.avgCustomersPerStaff.toFixed(1)}
                  </div>
                  <div className="mt-3 text-xs md:text-sm text-gray-600">
                    KH / nhân viên
                  </div>
                </div>
              </div>
            </div>

            {/* RANKING đồng bộ (white card + row items) */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-4">
                <div>
                  <SectionTitle>Bảng xếp hạng nhân viên</SectionTitle>
                  <p className="text-xs md:text-sm text-gray-500 -mt-2">
                    Xếp hạng theo số khách hàng mới
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  Tổng:{" "}
                  <b className="text-gray-800 tabular-nums">
                    {formatNumber(metrics.totalCustomers)}
                  </b>{" "}
                  KH mới
                </div>
              </div>

              <div className="space-y-3">
                {metrics.sorted.map((staff, index) => {
                  const count = Number(staff.newCustomerCount || 0);
                  const percentOfTotal =
                    metrics.totalCustomers > 0
                      ? (count / metrics.totalCustomers) * 100
                      : 0;

                  return (
                    <div
                      key={`${staff.staffName}-${index}`}
                      className="rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all p-4 md:p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {/* left */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <RankIcon index={index} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="font-bold text-gray-800 truncate">
                                {staff.staffName}
                              </p>
                              {index === 0 && (
                                <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-[11px] font-bold text-yellow-800">
                                  <Crown className="w-3.5 h-3.5" />
                                  Top 1
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                              <span className="truncate">
                                {percentOfTotal.toFixed(1)}% tổng KH
                              </span>
                              <span className="font-semibold text-gray-700 tabular-nums">
                                {formatNumber(count)} KH
                              </span>
                            </div>

                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, percentOfTotal)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* right */}
                        <div className="text-right sm:pl-4">
                          <div className="text-2xl md:text-3xl font-bold text-blue-600 tabular-nums">
                            {formatNumber(count)}
                          </div>
                          <div className="text-xs text-gray-500 font-semibold">
                            khách hàng
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer summary đồng bộ */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Tổng nhân viên
                    </p>
                    <p className="text-xl font-bold text-gray-800 tabular-nums">
                      {formatNumber(metrics.totalStaff)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Tổng KH mới
                    </p>
                    <p className="text-xl font-bold text-gray-800 tabular-nums">
                      {formatNumber(metrics.totalCustomers)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      TB mỗi NV
                    </p>
                    <p className="text-xl font-bold text-gray-800 tabular-nums">
                      {metrics.avgCustomersPerStaff.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SummaryCustomer;
