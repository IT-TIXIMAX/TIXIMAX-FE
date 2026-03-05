// // pages/Manager/Dashboard/SummaryRevenue.jsx
// import React, { useState, useEffect, useMemo, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import dashboardService from "../../../Services/Dashboard/dashboardService";
// import toast from "react-hot-toast";
// import {
//   ArrowLeft,
//   Banknote,
//   TrendingUp,
//   DollarSign,
//   Award,
//   AlertCircle,
//   Calendar,
//   Layers,
//   CheckCircle,
//   Clock,
//   Truck,
//   RotateCcw,
//   ChevronRight,
//   X,
//   BarChart3,
// } from "lucide-react";

// const FILTER_OPTIONS = [
//   { label: "Hôm nay", value: "DAY" },
//   { label: "Tuần này", value: "WEEK" },
//   { label: "Tháng này", value: "MONTH" },
//   { label: "Quý này", value: "QUARTER" },
//   { label: "6 tháng", value: "HALF_YEAR" },
//   { label: "Tùy chỉnh", value: "CUSTOM" },
// ];

// const STATUS_OPTIONS = [
//   { label: "Đã TT", value: "DA_THANH_TOAN", icon: CheckCircle },
//   { label: "Chờ TT", value: "CHO_THANH_TOAN", icon: Clock },
//   { label: "Chờ TT Ship", value: "CHO_THANH_TOAN_SHIP", icon: Truck },
//   { label: "Đã TT Ship", value: "DA_THANH_TOAN_SHIP", icon: CheckCircle },
//   { label: "Hoàn tiền", value: "DA_HOAN_TIEN", icon: RotateCcw },
// ];

// /* ===================== Skeleton Components ===================== */
// const Skeleton = ({ className = "" }) => (
//   <div className={`animate-pulse bg-gray-300 rounded ${className}`} />
// );

// const SummaryCardSkeleton = ({ bgGradient = "from-gray-200 to-gray-300" }) => (
//   <div className="bg-white rounded-xl shadow-md overflow-hidden border-1 border-black">
//     <div className={`p-5 md:p-6 bg-gradient-to-br ${bgGradient}`}>
//       <div className="flex items-center justify-between mb-4">
//         <Skeleton className="h-4 w-24" />
//         <Skeleton className="h-10 w-10 rounded-lg" />
//       </div>
//       <Skeleton className="h-10 md:h-12 w-32" />
//     </div>
//   </div>
// );

// const RouteCardSkeleton = () => (
//   <div className="bg-white rounded-xl border-1 border-black shadow-md overflow-hidden animate-pulse">
//     <div className="p-4 md:p-5 bg-gradient-to-br from-gray-200 to-gray-300 border-b-2 border-black">
//       <div className="flex items-center justify-between gap-3">
//         <div className="flex items-center gap-2 min-w-0 flex-1">
//           <Skeleton className="w-7 h-7 rounded-lg" />
//           <Skeleton className="h-5 flex-1 max-w-[150px]" />
//         </div>
//         <Skeleton className="w-8 h-8 rounded-lg" />
//       </div>
//     </div>
//     <div className="p-4 md:p-5 bg-white">
//       <div className="flex items-center justify-between gap-3">
//         <Skeleton className="h-4 w-20" />
//         <Skeleton className="h-4 w-24" />
//       </div>
//     </div>
//   </div>
// );

// /* ===================== Main Component ===================== */
// const SummaryRevenue = () => {
//   const navigate = useNavigate();

//   const [filterType, setFilterType] = useState("MONTH");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [status, setStatus] = useState("CHO_THANH_TOAN");

//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const isCustom = filterType === "CUSTOM";

//   const formatCurrency = (value) => {
//     const n = Number(value || 0);
//     return n.toLocaleString("vi-VN");
//   };

//   const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

//   const fetchSummary = useCallback(async () => {
//     if (filterType === "CUSTOM") {
//       if (!startDate || !endDate) {
//         toast.error("Vui lòng chọn ngày bắt đầu và kết thúc");
//         return;
//       }
//       if (startDate > endDate) {
//         toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
//         return;
//       }
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const params = { filterType, status };
//       if (filterType === "CUSTOM") {
//         params.startDate = startDate;
//         params.endDate = endDate;
//       }

//       const res = await dashboardService.getRoutesRevenueSummary(params);
//       setData(res?.data || []);
//     } catch (err) {
//       console.error(err);
//       const msg =
//         err?.response?.data?.message ||
//         err?.message ||
//         "Lỗi khi tải dữ liệu doanh thu";
//       setError(msg);
//       toast.error("Không tải được dữ liệu doanh thu");
//     } finally {
//       setLoading(false);
//     }
//   }, [filterType, status, startDate, endDate]);

//   useEffect(() => {
//     if (filterType !== "CUSTOM") {
//       fetchSummary();
//     }
//   }, [filterType, status, fetchSummary]);

//   const getFilterLabel = () => {
//     const type = FILTER_OPTIONS.find((t) => t.value === filterType);
//     let label = type?.label || "Tháng này";

//     if (filterType === "CUSTOM" && startDate && endDate) {
//       label = `${startDate} đến ${endDate}`;
//     }
//     return label;
//   };

//   const getStatusLabel = () => {
//     const statusOpt = STATUS_OPTIONS.find((s) => s.value === status);
//     return statusOpt?.label || "Chờ TT";
//   };

//   const metrics = useMemo(() => {
//     if (!data || !Array.isArray(data)) return null;

//     const totalRevenue = data.reduce(
//       (sum, item) => sum + (item.totalRevenue || 0),
//       0,
//     );
//     const totalRoutes = data.length;

//     const topRoute =
//       data.length > 0
//         ? [...data].sort(
//             (a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0),
//           )[0]
//         : null;

//     const avgRevenuePerRoute = totalRoutes > 0 ? totalRevenue / totalRoutes : 0;

//     return { totalRevenue, totalRoutes, topRoute, avgRevenuePerRoute };
//   }, [data]);

//   const skeletonRouteCount = Math.max(2, Math.min(8, data?.length || 4));

//   return (
//     <div className="min-h-screen">
//       <div className="mx-auto p-4 md:p-6 lg:p-8">
//         {/* ✅ Breadcrumb Navigation */}
//         <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-gray-700">
//           <button
//             onClick={() => navigate("/manager/dashboard")}
//             className="px-2.5 py-1.5 text-black rounded-lg bg-white border-2 border-black hover:bg-yellow-300 transition-colors flex items-center gap-1 shadow-sm"
//           >
//             <ArrowLeft size={14} />
//             Dashboard
//           </button>
//           <ChevronRight className="w-4 h-4 text-gray-400" />
//           <span className="px-2.5 py-1.5 text-black rounded-lg bg-yellow-300 border-2 border-black shadow-sm">
//             Doanh thu theo tuyến
//           </span>
//         </div>

//         {/* ✅ Header - Yellow Gradient */}
//         <div className="mb-6 md:mb-8">
//           <div className="bg-gradient-to-r from-yellow-300 via-yellow-300 to-yellow-300 border-[1px] border-black rounded-xl shadow-lg p-4 md:p-5">
//             <div className="flex flex-col gap-4">
//               {/* Top row */}
//               <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
//                 <div className="flex items-center gap-3 min-w-0">
//                   <div className="w-1.5 h-8 md:h-9 bg-black rounded-full shrink-0 shadow-sm" />
//                   <div className="min-w-0">
//                     <h1 className="text-lg md:text-xl font-bold text-black leading-tight truncate">
//                       Thống Kê Doanh Thu Theo Tuyến
//                     </h1>
//                     <div className="flex items-center gap-2 mt-1 flex-wrap">
//                       <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-sm">
//                         <Calendar className="w-4 h-4 text-black" />
//                         <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
//                           {getFilterLabel()}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-sm">
//                         <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
//                           TT: {getStatusLabel()}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right: Filter buttons inline */}
//                 <div className="flex flex-col gap-2">
//                   {/* Time Filters */}
//                   <div className="flex flex-wrap items-center gap-2">
//                     {FILTER_OPTIONS.map((opt) => {
//                       const active = opt.value === filterType;
//                       return (
//                         <button
//                           key={opt.value}
//                           onClick={() => setFilterType(opt.value)}
//                           disabled={loading}
//                           className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all border-2 border-yellow-600 shadow-sm ${
//                             active
//                               ? "bg-yellow-400 text-black"
//                               : "bg-white text-black hover:bg-gray-100"
//                           } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
//                         >
//                           {opt.label}
//                         </button>
//                       );
//                     })}
//                   </div>

//                   {/* Status Filters */}
//                   <div className="flex flex-wrap items-center gap-2">
//                     {STATUS_OPTIONS.map((opt) => {
//                       const active = opt.value === status;
//                       const Icon = opt.icon;
//                       return (
//                         <button
//                           key={opt.value}
//                           onClick={() => setStatus(opt.value)}
//                           disabled={loading}
//                           className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all border-2 border-yellow-600 shadow-sm flex items-center gap-1.5 ${
//                             active
//                               ? "bg-yellow-400 text-black"
//                               : "bg-white text-black hover:bg-gray-100"
//                           } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
//                         >
//                           <Icon className="w-3.5 h-3.5" />
//                           {opt.label}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>

//               {/* Custom date row */}
//               {isCustom && (
//                 <div className="pt-4 border-t-2 border-black">
//                   <div className="mb-2 text-xs font-bold text-black uppercase tracking-wide">
//                     Khoảng thời gian tùy chỉnh
//                   </div>
//                   <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
//                     <div className="flex flex-wrap items-center gap-3">
//                       <div className="flex items-center gap-2">
//                         <Calendar className="h-4 w-4 text-black" />
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-semibold text-black">
//                           Từ
//                         </span>
//                         <input
//                           type="date"
//                           value={startDate}
//                           onChange={(e) => setStartDate(e.target.value)}
//                           className="border-2 border-black rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
//                         />
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-semibold text-black">
//                           Đến
//                         </span>
//                         <input
//                           type="date"
//                           value={endDate}
//                           onChange={(e) => setEndDate(e.target.value)}
//                           className="border-2 border-black rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
//                         />
//                       </div>
//                     </div>

//                     <button
//                       onClick={fetchSummary}
//                       disabled={loading}
//                       className="bg-yellow-400 text-black border-2 border-yellow-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
//                     >
//                       {loading ? "Đang tải..." : "Tìm kiếm"}
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* ✅ Error State */}
//         {error && (
//           <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
//             <div className="flex items-start gap-3">
//               <div className="p-2 bg-red-100 rounded-lg">
//                 <X className="w-5 h-5 text-red-600" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <h3 className="text-sm font-bold text-red-800 mb-1">
//                   Có lỗi xảy ra
//                 </h3>
//                 <p className="text-sm text-red-700 break-words">{error}</p>
//               </div>
//               <button
//                 onClick={() => setError(null)}
//                 className="p-1 hover:bg-red-100 rounded transition-colors"
//               >
//                 <X className="w-4 h-4 text-red-600" />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ✅ Summary Cards */}
//         <div className="mb-6 md:mb-8">
//           <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
//             Tổng quan
//           </h3>

//           <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
//             {loading ? (
//               <>
//                 <SummaryCardSkeleton bgGradient="from-yellow-200 to-yellow-300" />
//                 <SummaryCardSkeleton bgGradient="from-red-200 to-red-300" />
//                 <SummaryCardSkeleton bgGradient="from-green-200 to-green-300" />
//                 <SummaryCardSkeleton bgGradient="from-blue-200 to-blue-300" />
//               </>
//             ) : metrics ? (
//               <>
//                 {/* Tổng doanh thu - VÀNG */}
//                 <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-1 border-black min-h-[150px]">
//                   <div className="p-5 md:p-6 bg-gradient-to-br from-yellow-200 to-yellow-300 h-full">
//                     <div className="flex items-center justify-between mb-4 min-w-0">
//                       <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
//                         Tổng doanh thu
//                       </span>
//                       <div className="p-2.5 rounded-lg bg-purple-500 shrink-0">
//                         <Banknote className="w-6 h-6 md:w-7 md:h-7 text-white" />
//                       </div>
//                     </div>

//                     <div className="flex items-baseline gap-2 min-w-0">
//                       <span className="text-2xl md:text-3xl font-bold text-gray-900 leading-none break-words tabular-nums">
//                         {formatCurrency(metrics.totalRevenue)}
//                       </span>
//                       <span className="text-sm md:text-base text-black font-medium shrink-0">
//                         đ
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Số tuyến - ĐỎ */}
//                 <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-1 border-black min-h-[150px]">
//                   <div className="p-5 md:p-6 bg-gradient-to-br from-red-200 to-red-300 h-full">
//                     <div className="flex items-center justify-between mb-4 min-w-0">
//                       <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
//                         Số tuyến
//                       </span>
//                       <div className="p-2.5 rounded-lg bg-red-500 shrink-0">
//                         <Layers className="w-6 h-6 md:w-7 md:h-7 text-white" />
//                       </div>
//                     </div>

//                     <div className="flex items-baseline gap-2 min-w-0">
//                       <span className="text-2xl md:text-3xl font-bold text-gray-900 leading-none break-words tabular-nums">
//                         {formatNumber(metrics.totalRoutes)}
//                       </span>
//                     </div>

//                     <div className="mt-3 text-xs md:text-sm text-black font-medium">
//                       Tuyến hoạt động
//                     </div>
//                   </div>
//                 </div>

//                 {/* Tuyến hàng đầu - XANH LÁ */}
//                 <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-1 border-black min-h-[150px]">
//                   <div className="p-5 md:p-6 bg-gradient-to-br from-green-200 to-green-300 h-full">
//                     <div className="flex items-center justify-between mb-4 min-w-0">
//                       <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
//                         Tuyến hàng đầu
//                       </span>
//                       <div className="p-2.5 rounded-lg bg-green-600 shrink-0">
//                         <Award className="w-6 h-6 md:w-7 md:h-7 text-white" />
//                       </div>
//                     </div>

//                     <div className="min-w-0">
//                       <div className="text-lg md:text-xl font-bold text-gray-900 truncate leading-none mb-2">
//                         {metrics.topRoute?.routeName || "N/A"}
//                       </div>
//                       <div className="text-sm md:text-base font-bold text-black tabular-nums">
//                         {formatCurrency(metrics.topRoute?.totalRevenue || 0)} đ
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* TB / tuyến - XANH DƯƠNG */}
//                 <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-1 border-black min-h-[150px]">
//                   <div className="p-5 md:p-6 bg-gradient-to-br from-blue-200 to-blue-300 h-full">
//                     <div className="flex items-center justify-between mb-4 min-w-0">
//                       <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
//                         TB / tuyến
//                       </span>
//                       <div className="p-2.5 rounded-lg bg-blue-600 shrink-0">
//                         <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-white" />
//                       </div>
//                     </div>

//                     <div className="flex items-baseline gap-2 min-w-0">
//                       <span className="text-2xl md:text-3xl font-bold text-gray-900 leading-none break-words tabular-nums">
//                         {formatCurrency(metrics.avgRevenuePerRoute)}
//                       </span>
//                       <span className="text-sm md:text-base text-black font-medium shrink-0">
//                         đ
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             ) : null}
//           </div>
//         </div>

//         {/* ✅ No Data State */}
//         {!loading && (!data || data.length === 0) && (
//           <div className="bg-white rounded-xl border-1 border-black p-12 md:p-16 text-center shadow-lg">
//             <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
//               <BarChart3 className="w-10 h-10 text-gray-400" />
//             </div>
//             <p className="text-gray-800 text-base md:text-lg font-bold mb-2">
//               Không có dữ liệu
//             </p>
//             <p className="text-gray-600 text-sm">
//               Vui lòng thử lại với bộ lọc khác
//             </p>
//           </div>
//         )}

//         {/* ✅ Routes Grid */}
//         {loading ? (
//           <div>
//             <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
//               Chi tiết theo từng tuyến
//             </h3>
//             <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
//               {Array.from({ length: skeletonRouteCount }).map((_, i) => (
//                 <RouteCardSkeleton key={i} />
//               ))}
//             </div>
//           </div>
//         ) : (
//           data &&
//           data.length > 0 &&
//           metrics && (
//             <div>
//               <div className="flex items-end justify-between mb-4">
//                 <h3 className="text-xl font-bold text-gray-800 uppercase">
//                   Chi tiết theo từng tuyến
//                 </h3>
//                 <div className="text-xs text-gray-600">
//                   Tổng:{" "}
//                   <b className="text-black tabular-nums">
//                     {metrics.totalRoutes}
//                   </b>{" "}
//                   tuyến
//                 </div>
//               </div>

//               <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
//                 {data.map((route, index) => (
//                   <div
//                     key={`${route.routeName}-${index}`}
//                     className="bg-white rounded-xl border-1 border-black shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
//                   >
//                     {/* Header */}
//                     <div className="p-4 md:p-5 bg-gradient-to-br from-gray-200 to-gray-300 border-b-2 border-black">
//                       <div className="flex items-center justify-between gap-3">
//                         <div className="flex items-center gap-2 min-w-0 flex-1">
//                           <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border-2 border-black font-bold text-black text-xs shrink-0">
//                             {index + 1}
//                           </div>
//                           <h4 className="text-base md:text-lg font-bold text-black truncate">
//                             {route.routeName}
//                           </h4>
//                         </div>

//                         <div className="p-2 rounded-lg bg-white shrink-0">
//                           <DollarSign className="h-4 w-4 text-black" />
//                         </div>
//                       </div>
//                     </div>

//                     {/* Body */}
//                     <div className="p-4 md:p-5 bg-white">
//                       <div className="flex items-center justify-between gap-3">
//                         <div className="flex items-center gap-2 min-w-0">
//                           <span className="text-xs md:text-sm font-semibold text-gray-700 truncate">
//                             Doanh thu
//                           </span>
//                         </div>
//                         <span className="text-sm md:text-base font-bold text-gray-900 tabular-nums whitespace-nowrap">
//                           {formatCurrency(route.totalRevenue)} đ
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Footer Summary */}
//               <div className="mt-6 bg-white rounded-xl border-1 border-black p-4 shadow-lg">
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
//                   <div className="p-3 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-black">
//                     <p className="text-xs text-black uppercase font-semibold mb-1">
//                       Tổng tuyến
//                     </p>
//                     <p className="text-xl font-bold text-gray-900 tabular-nums">
//                       {formatNumber(metrics.totalRoutes)}
//                     </p>
//                   </div>

//                   <div className="p-3 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-black">
//                     <p className="text-xs text-black uppercase font-semibold mb-1">
//                       Tổng doanh thu
//                     </p>
//                     <p className="text-base font-bold text-gray-900 tabular-nums break-words">
//                       {formatCurrency(metrics.totalRevenue)} đ
//                     </p>
//                   </div>

//                   <div className="p-3 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-black">
//                     <p className="text-xs text-black uppercase font-semibold mb-1">
//                       TB / tuyến
//                     </p>
//                     <p className="text-base font-bold text-gray-900 tabular-nums break-words">
//                       {formatCurrency(metrics.avgRevenuePerRoute)} đ
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )
//         )}
//       </div>
//     </div>
//   );
// };

// export default SummaryRevenue;

// pages/Manager/Dashboard/SummaryRevenue.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../../Services/Dashboard/dashboardService";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Banknote,
  TrendingUp,
  DollarSign,
  Award,
  AlertCircle,
  Calendar,
  Layers,
  CheckCircle,
  Clock,
  Truck,
  RotateCcw,
  ChevronRight,
  X,
  BarChart3,
} from "lucide-react";

const FILTER_OPTIONS = [
  { label: "Hôm nay", value: "DAY" },
  { label: "Tuần này", value: "WEEK" },
  { label: "Tháng này", value: "MONTH" },
  { label: "Quý này", value: "QUARTER" },
  { label: "6 tháng", value: "HALF_YEAR" },
  { label: "Tùy chỉnh", value: "CUSTOM" },
];

const STATUS_OPTIONS = [
  { label: "Đã TT", value: "DA_THANH_TOAN", icon: CheckCircle },
  { label: "Chờ TT", value: "CHO_THANH_TOAN", icon: Clock },
  { label: "Chờ TT Ship", value: "CHO_THANH_TOAN_SHIP", icon: Truck },
  { label: "Đã TT Ship", value: "DA_THANH_TOAN_SHIP", icon: CheckCircle },
  { label: "Hoàn tiền", value: "DA_HOAN_TIEN", icon: RotateCcw },
];

/* ===================== Skeleton Components ===================== */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const SummaryCardSkeleton = ({ bgGradient = "from-gray-50 to-gray-100" }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
    <div className={`p-5 md:p-6 bg-gradient-to-br ${bgGradient}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="h-10 md:h-12 w-32" />
    </div>
  </div>
);

const RouteCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden animate-pulse">
    <div className="p-4 md:p-5 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-5 flex-1 max-w-[150px]" />
        </div>
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    </div>
    <div className="p-4 md:p-5 bg-white">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  </div>
);

/* ===================== Main Component ===================== */
const SummaryRevenue = () => {
  const navigate = useNavigate();

  const [filterType, setFilterType] = useState("MONTH");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("CHO_THANH_TOAN");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isCustom = filterType === "CUSTOM";

  const formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN");
  const formatNumber = (value) => Number(value || 0).toLocaleString("vi-VN");

  const fetchSummary = useCallback(async () => {
    if (filterType === "CUSTOM") {
      if (!startDate || !endDate) {
        toast.error("Vui lòng chọn ngày bắt đầu và kết thúc");
        return;
      }
      if (startDate > endDate) {
        toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const params = { filterType, status };
      if (filterType === "CUSTOM") {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const res = await dashboardService.getRoutesRevenueSummary(params);
      setData(res?.data || []);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi khi tải dữ liệu doanh thu";
      setError(msg);
      toast.error("Không tải được dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  }, [filterType, status, startDate, endDate]);

  useEffect(() => {
    if (filterType !== "CUSTOM") fetchSummary();
  }, [filterType, status, fetchSummary]);

  const getFilterLabel = () => {
    if (filterType === "CUSTOM" && startDate && endDate)
      return `${startDate} đến ${endDate}`;
    return (
      FILTER_OPTIONS.find((t) => t.value === filterType)?.label || "Tháng này"
    );
  };

  const getStatusLabel = () =>
    STATUS_OPTIONS.find((s) => s.value === status)?.label || "Chờ TT";

  const metrics = useMemo(() => {
    if (!data || !Array.isArray(data)) return null;
    const totalRevenue = data.reduce(
      (sum, item) => sum + (item.totalRevenue || 0),
      0,
    );
    const totalRoutes = data.length;
    const topRoute =
      data.length > 0
        ? [...data].sort(
            (a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0),
          )[0]
        : null;
    const avgRevenuePerRoute = totalRoutes > 0 ? totalRevenue / totalRoutes : 0;
    return { totalRevenue, totalRoutes, topRoute, avgRevenuePerRoute };
  }, [data]);

  const skeletonRouteCount = Math.max(2, Math.min(8, data?.length || 4));

  // Shared button style helper
  const filterBtnStyle = (active) => ({
    padding: "3px 12px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    border: active ? "2px solid #ca8a04" : "1px solid #d1d5db",
    background: active ? "#fde68a" : "#fff",
    color: "#1e3a8a",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.6 : 1,
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    gap: 4,
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* ===== Header — chuẩn UI ===== */}
        <div
          className="bg-yellow-100 border-b-2 border-yellow-500"
          style={{
            margin: "-32px -32px 0 -32px",
            padding: "0 24px",
            minHeight: 40,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            borderRadius: 0,
          }}
        >
          {/* Title + badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              paddingTop: 6,
              paddingBottom: 6,
            }}
          >
            <button
              onClick={() => navigate("/manager/dashboard")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 10px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#1e3a8a",
                cursor: "pointer",
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

            <h1 className="text-xl font-bold text-blue-800 tracking-wide m-0">
              Thống Kê Doanh Thu Theo Tuyến
            </h1>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-yellow-400 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-blue-800" />
              <span className="text-xs font-semibold text-blue-800">
                {getFilterLabel()}
              </span>
            </div>

            <div className="px-2.5 py-1 bg-white border border-yellow-400 rounded-lg">
              <span className="text-xs font-semibold text-blue-800">
                TT: {getStatusLabel()}
              </span>
            </div>
          </div>

          {/* Filters: time + status stacked */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              paddingTop: 4,
              paddingBottom: 4,
            }}
          >
            {/* Time filters */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterType(opt.value)}
                  disabled={loading}
                  style={filterBtnStyle(opt.value === filterType)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {/* Status filters */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {STATUS_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    disabled={loading}
                    style={filterBtnStyle(opt.value === status)}
                  >
                    <Icon className="w-3 h-3" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* spacer */}
        <div style={{ marginTop: 24 }} />

        {/* ===== Custom date range ===== */}
        {isCustom && (
          <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Từ</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Đến</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                />
              </div>
              <button
                onClick={fetchSummary}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Đang tải..." : "Tìm kiếm"}
              </button>
            </div>
          </div>
        )}

        {/* ===== Error ===== */}
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
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-red-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        )}

        {/* ===== Summary Cards ===== */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
            Tổng quan
          </h3>
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <>
                <SummaryCardSkeleton bgGradient="from-yellow-50 to-yellow-100" />
                <SummaryCardSkeleton bgGradient="from-red-50 to-red-100" />
                <SummaryCardSkeleton bgGradient="from-green-50 to-green-100" />
                <SummaryCardSkeleton bgGradient="from-blue-50 to-blue-100" />
              </>
            ) : metrics ? (
              <>
                {/* Tổng doanh thu — VÀNG */}
                <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 min-h-[150px]">
                  <div className="p-5 md:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 h-full">
                    <div className="flex items-center justify-between mb-4 min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 truncate">
                        Tổng doanh thu
                      </span>
                      <div className="p-2.5 rounded-lg bg-yellow-500 shrink-0">
                        <Banknote className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 min-w-0">
                      <span className="text-2xl md:text-3xl font-bold text-gray-900 leading-none break-words tabular-nums">
                        {formatCurrency(metrics.totalRevenue)}
                      </span>
                      <span className="text-sm text-gray-500 font-medium shrink-0">
                        đ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Số tuyến — ĐỎ */}
                <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 min-h-[150px]">
                  <div className="p-5 md:p-6 bg-gradient-to-br from-red-50 to-red-100 h-full">
                    <div className="flex items-center justify-between mb-4 min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 truncate">
                        Số tuyến
                      </span>
                      <div className="p-2.5 rounded-lg bg-red-500 shrink-0">
                        <Layers className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 min-w-0">
                      <span className="text-2xl md:text-3xl font-bold text-gray-900 leading-none tabular-nums">
                        {formatNumber(metrics.totalRoutes)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 font-medium">
                      Tuyến hoạt động
                    </div>
                  </div>
                </div>

                {/* Tuyến hàng đầu — XANH LÁ */}
                <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 min-h-[150px]">
                  <div className="p-5 md:p-6 bg-gradient-to-br from-green-50 to-green-100 h-full">
                    <div className="flex items-center justify-between mb-4 min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 truncate">
                        Tuyến hàng đầu
                      </span>
                      <div className="p-2.5 rounded-lg bg-green-600 shrink-0">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg font-bold text-gray-900 truncate leading-none mb-1">
                        {metrics.topRoute?.routeName || "N/A"}
                      </div>
                      <div className="text-base font-bold text-gray-700 tabular-nums">
                        {formatCurrency(metrics.topRoute?.totalRevenue || 0)} đ
                      </div>
                    </div>
                  </div>
                </div>

                {/* TB / tuyến — XANH DƯƠNG */}
                <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 min-h-[150px]">
                  <div className="p-5 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 h-full">
                    <div className="flex items-center justify-between mb-4 min-w-0">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 truncate">
                        TB / tuyến
                      </span>
                      <div className="p-2.5 rounded-lg bg-blue-600 shrink-0">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 min-w-0">
                      <span className="text-2xl md:text-3xl font-bold text-gray-900 leading-none break-words tabular-nums">
                        {formatCurrency(metrics.avgRevenuePerRoute)}
                      </span>
                      <span className="text-sm text-gray-500 font-medium shrink-0">
                        đ
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* ===== No Data ===== */}
        {!loading && (!data || data.length === 0) && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 md:p-16 text-center shadow-sm">
            <BarChart3 className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-base font-semibold mb-2">
              Không có dữ liệu
            </p>
            <p className="text-gray-400 text-sm">
              Vui lòng thử lại với bộ lọc khác
            </p>
          </div>
        )}

        {/* ===== Routes Grid ===== */}
        {loading ? (
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
              Chi tiết theo từng tuyến
            </h3>
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: skeletonRouteCount }).map((_, i) => (
                <RouteCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          data &&
          data.length > 0 &&
          metrics && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  Chi tiết theo từng tuyến
                </h3>
                <span className="text-xs text-gray-400 font-medium">
                  Tổng: <b className="text-gray-700">{metrics.totalRoutes}</b>{" "}
                  tuyến
                </span>
              </div>

              <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {data.map((route, index) => (
                  <div
                    key={`${route.routeName}-${index}`}
                    className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    {/* Card header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white/20 font-bold text-white text-xs shrink-0">
                        {index + 1}
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">
                        {route.routeName}
                      </h4>
                      <div className="ml-auto shrink-0">
                        <DollarSign className="h-4 w-4 text-white/70" />
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-gray-500">
                          Doanh thu
                        </span>
                        <span className="text-sm font-bold text-gray-900 tabular-nums whitespace-nowrap">
                          {formatCurrency(route.totalRevenue)} đ
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer summary */}
              <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Tổng tuyến",
                      value: formatNumber(metrics.totalRoutes),
                      suffix: "",
                    },
                    {
                      label: "Tổng doanh thu",
                      value: formatCurrency(metrics.totalRevenue),
                      suffix: " đ",
                    },
                    {
                      label: "TB / tuyến",
                      value: formatCurrency(metrics.avgRevenuePerRoute),
                      suffix: " đ",
                    },
                  ].map(({ label, value, suffix }) => (
                    <div
                      key={label}
                      className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="text-xs text-gray-400 uppercase font-bold mb-2 tracking-wide">
                        {label}
                      </div>
                      <div className="text-xl font-black text-gray-900 tabular-nums break-words">
                        {value}
                        {suffix}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default SummaryRevenue;
