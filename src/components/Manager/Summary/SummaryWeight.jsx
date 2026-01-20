// // pages/Manager/Dashboard/SummaryWeight.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import dashboardService from "../../../Services/Dashboard/dashboardService";
// import toast from "react-hot-toast";
// import {
//   ArrowLeft,
//   Scale,
//   TrendingUp,
//   TrendingDown,
//   Award,
//   AlertCircle,
//   Calendar,
//   Package,
//   Layers,
//   ChevronRight,
// } from "lucide-react";

// const FILTER_OPTIONS = [
//   { label: "Hôm nay", value: "DAY" },
//   { label: "Tháng này", value: "MONTH" },
//   { label: "Quý này", value: "QUARTER" },
//   { label: "6 tháng", value: "HALF_YEAR" },
//   { label: "Tùy chỉnh", value: "CUSTOM" },
// ];

// const SummaryWeight = () => {
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
//       const res = await dashboardService.getRoutesWeightSummary({
//         filterType,
//         startDate,
//         endDate,
//       });
//       setData(res.data);
//     } catch (err) {
//       console.error(err);
//       setError(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Lỗi khi tải dữ liệu khối lượng",
//       );
//       toast.error("Lỗi khi tải dữ liệu khối lượng");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSummary();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filterType]);

//   const formatKg = (value) =>
//     Number(value || 0).toLocaleString("vi-VN", {
//       minimumFractionDigits: 1,
//       maximumFractionDigits: 1,
//     });

//   const metrics = useMemo(() => {
//     if (!data || !Array.isArray(data) || data.length === 0) return null;

//     const totalWeight = data.reduce(
//       (sum, item) => sum + (item.totalWeight || 0),
//       0,
//     );
//     const totalNetWeight = data.reduce(
//       (sum, item) => sum + (item.totalNetWeight || 0),
//       0,
//     );
//     const totalRoutes = data.length;
//     const totalDifference = totalNetWeight - totalWeight;

//     const topRoute = [...data].sort(
//       (a, b) => (b.totalNetWeight || 0) - (a.totalNetWeight || 0),
//     )[0];

//     const avgWeightPerRoute = totalRoutes > 0 ? totalWeight / totalRoutes : 0;
//     const avgNetWeightPerRoute =
//       totalRoutes > 0 ? totalNetWeight / totalRoutes : 0;

//     return {
//       totalWeight,
//       totalNetWeight,
//       totalRoutes,
//       totalDifference,
//       topRoute,
//       avgWeightPerRoute,
//       avgNetWeightPerRoute,
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

//   const getRouteColor = (index) => {
//     const colors = [
//       "from-blue-50 to-blue-200 border-blue-200",
//       "from-green-50 to-green-200 border-green-200",
//       "from-purple-50 to-purple-200 border-purple-200",
//       "from-amber-50 to-amber-200 border-amber-200",
//       "from-pink-50 to-pink-200 border-pink-200",
//       "from-indigo-50 to-indigo-200 border-indigo-200",
//     ];
//     return colors[index % colors.length];
//   };

//   const getRouteIconColor = (index) => {
//     const colors = [
//       "text-blue-600",
//       "text-green-600",
//       "text-purple-600",
//       "text-amber-600",
//       "text-pink-600",
//       "text-indigo-600",
//     ];
//     return colors[index % colors.length];
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
//             Khối lượng theo tuyến
//           </span>
//         </div>

//         {/* ✅ Header gọn */}
//         <div className="mb-6 rounded-2xl border border-gray-200 bg-sky-300 px-6 py-4 shadow-sm">
//           <div className="flex flex-col gap-4">
//             {/* Top row */}
//             <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
//                   <Scale className="h-5 w-5 text-sky-600" />
//                 </div>
//                 <div>
//                   <h1 className="text-lg md:text-xl font-semibold text-black">
//                     Thống kê khối lượng theo tuyến
//                   </h1>
//                 </div>
//               </div>

//               {/* Quick info pill */}
//               <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 bg-white/70">
//                 <div className="p-1.5 rounded-lg bg-white text-blue-700">
//                   <Layers size={16} />
//                 </div>
//                 <div className="leading-tight">
//                   <div className="text-xs font-semibold text-gray-900">
//                     {metrics ? metrics.totalRoutes : 0} tuyến
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
//             <Scale className="h-12 w-12 text-gray-300 mx-auto mb-3" />
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
//               {/* Tổng KL thực */}
//               <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-5 shadow-sm border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
//                       Tổng KL thực
//                     </p>
//                     <p className="mt-2 text-2xl font-bold text-gray-900">
//                       {formatKg(metrics.totalWeight)}
//                       <span className="text-base font-normal ml-1">kg</span>
//                     </p>
//                     <p className="mt-1 text-xs text-gray-700">
//                       TB/tuyến: <b>{formatKg(metrics.avgWeightPerRoute)} kg</b>
//                     </p>
//                   </div>
//                   <div className="rounded-xl bg-white/70 p-3">
//                     <Package className="h-6 w-6 text-blue-600" />
//                   </div>
//                 </div>
//               </div>

//               {/* Tổng KL thu */}
//               <div className="rounded-2xl bg-gradient-to-br from-green-50 via-green-100 to-green-200 p-5 shadow-sm border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
//                       Tổng KL thu
//                     </p>
//                     <p className="mt-2 text-2xl font-bold text-gray-900">
//                       {formatKg(metrics.totalNetWeight)}
//                       <span className="text-base font-normal ml-1">kg</span>
//                     </p>
//                     <p className="mt-1 text-xs text-gray-700">
//                       TB/tuyến:{" "}
//                       <b>{formatKg(metrics.avgNetWeightPerRoute)} kg</b>
//                     </p>
//                   </div>
//                   <div className="rounded-xl bg-white/70 p-3">
//                     <Scale className="h-6 w-6 text-green-600" />
//                   </div>
//                 </div>
//               </div>

//               {/* Chênh lệch */}
//               <div
//                 className={`rounded-2xl bg-gradient-to-br ${
//                   metrics.totalDifference >= 0
//                     ? "from-amber-50 via-amber-100 to-amber-200"
//                     : "from-red-50 via-red-100 to-red-200"
//                 } p-5 shadow-sm border border-gray-100`}
//               >
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
//                       Chênh lệch
//                     </p>
//                     <p className="mt-2 text-2xl font-bold text-gray-900">
//                       {metrics.totalDifference >= 0 ? "+" : ""}
//                       {formatKg(metrics.totalDifference)}
//                       <span className="text-base font-normal ml-1">kg</span>
//                     </p>
//                     <p className="mt-1 text-xs text-gray-700">
//                       {metrics.totalWeight > 0
//                         ? `~ ${(
//                             (metrics.totalDifference / metrics.totalWeight) *
//                             100
//                           ).toFixed(1)}% so với KL thực`
//                         : "—"}
//                     </p>
//                   </div>
//                   <div className="rounded-xl bg-white/70 p-3">
//                     {metrics.totalDifference >= 0 ? (
//                       <TrendingUp className="h-6 w-6 text-amber-600" />
//                     ) : (
//                       <TrendingDown className="h-6 w-6 text-red-600" />
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Tuyến hàng đầu */}
//               <div className="rounded-2xl bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 p-5 shadow-sm border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1">
//                     <p className="text-xs font-medium uppercase tracking-wide text-gray-900 mb-1">
//                       Tuyến KL thu cao nhất
//                     </p>
//                     <p className="text-2xl font-bold text-gray-900">
//                       {metrics.topRoute?.routeName || "N/A"}
//                     </p>
//                     <p className="text-sm text-gray-700 mt-1 font-semibold">
//                       {formatKg(metrics.topRoute?.totalNetWeight || 0)} kg
//                     </p>
//                   </div>
//                   <div className="rounded-xl bg-white/70 p-3">
//                     <Award className="h-6 w-6 text-purple-600" />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* ROUTES GRID */}
//             <div>
//               <div className="flex items-end justify-between mb-4">
//                 <h3 className="text-sm font-bold text-gray-700 uppercase">
//                   Chi tiết theo từng tuyến
//                 </h3>
//                 <div className="text-xs text-gray-500">
//                   Tổng: <b className="text-gray-800">{metrics.totalRoutes}</b>{" "}
//                   tuyến
//                 </div>
//               </div>

//               <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
//                 {data.map((route, index) => {
//                   const totalWeight = route.totalWeight || 0;
//                   const totalNetWeight = route.totalNetWeight || 0;

//                   const difference = totalNetWeight - totalWeight;
//                   const percentDiff =
//                     totalWeight > 0 ? (difference / totalWeight) * 100 : 0;

//                   const percentOfTotalNet =
//                     metrics.totalNetWeight > 0
//                       ? (totalNetWeight / metrics.totalNetWeight) * 100
//                       : 0;

//                   return (
//                     <div
//                       key={`${route.routeName}-${index}`}
//                       className={`rounded-xl bg-gradient-to-br ${getRouteColor(
//                         index,
//                       )} p-4 shadow-sm border transition-all hover:shadow-lg hover:-translate-y-1`}
//                     >
//                       {/* Header */}
//                       <div className="flex items-center justify-between mb-3">
//                         <div className="flex items-center gap-2">
//                           <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-gray-200 font-bold text-gray-900 text-xs">
//                             {index + 1}
//                           </div>
//                           <h4 className="text-lg font-bold text-gray-900">
//                             {route.routeName}
//                           </h4>
//                         </div>
//                         <div
//                           className={`p-1.5 bg-white/70 rounded-lg ${getRouteIconColor(
//                             index,
//                           )}`}
//                         >
//                           <Scale className="h-4 w-4" />
//                         </div>
//                       </div>

//                       {/* KL thực / thu */}
//                       <div className="space-y-2">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-1.5">
//                             <Package className="h-3.5 w-3.5 text-gray-600" />
//                             <span className="text-xs font-medium text-gray-700">
//                               KL thực
//                             </span>
//                           </div>
//                           <span className="text-base font-bold text-gray-900">
//                             {formatKg(totalWeight)} kg
//                           </span>
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-1.5">
//                             <Scale className="h-3.5 w-3.5 text-gray-600" />
//                             <span className="text-xs font-medium text-gray-700">
//                               KL thu
//                             </span>
//                           </div>
//                           <span className="text-base font-bold text-gray-900">
//                             {formatKg(totalNetWeight)} kg
//                           </span>
//                         </div>

//                         {/* Chênh lệch */}
//                         <div className="pt-2 border-t border-gray-300">
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-1.5">
//                               {difference >= 0 ? (
//                                 <TrendingUp className="h-3.5 w-3.5 text-green-600" />
//                               ) : (
//                                 <TrendingDown className="h-3.5 w-3.5 text-red-600" />
//                               )}
//                               <span className="text-xs font-medium text-gray-700">
//                                 Chênh lệch
//                               </span>
//                             </div>

//                             <div className="text-right">
//                               <span
//                                 className={`text-base font-bold ${
//                                   difference >= 0
//                                     ? "text-green-700"
//                                     : "text-red-700"
//                                 }`}
//                               >
//                                 {difference >= 0 ? "+" : ""}
//                                 {formatKg(difference)}
//                               </span>
//                               <div
//                                 className={`text-xs font-semibold ${
//                                   difference >= 0
//                                     ? "text-green-600"
//                                     : "text-red-600"
//                                 }`}
//                               >
//                                 ({difference >= 0 ? "+" : ""}
//                                 {percentDiff.toFixed(1)}%)
//                               </div>
//                             </div>
//                           </div>

//                           {/* % tổng KL thu + bar */}
//                           <div className="mt-3">
//                             <div className="flex items-center justify-between text-xs">
//                               <span className="text-gray-600">
//                                 % tổng KL thu
//                               </span>
//                               <span className="font-bold text-gray-900">
//                                 {percentOfTotalNet.toFixed(1)}%
//                               </span>
//                             </div>
//                             <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
//                               <div
//                                 className="bg-green-600 h-1.5 rounded-full transition-all"
//                                 style={{
//                                   width: `${Math.min(100, percentOfTotalNet)}%`,
//                                 }}
//                               />
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Footer summary */}
//               <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
//                 <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
//                   <div className="p-3 rounded-lg bg-gray-50">
//                     <p className="text-xs text-gray-500 uppercase font-medium mb-1">
//                       Tổng tuyến
//                     </p>
//                     <p className="text-xl font-bold text-gray-900">
//                       {metrics.totalRoutes}
//                     </p>
//                   </div>

//                   <div className="p-3 rounded-lg bg-blue-50">
//                     <p className="text-xs text-gray-500 uppercase font-medium mb-1">
//                       Tổng KL thực
//                     </p>
//                     <p className="text-base font-bold text-gray-900">
//                       {formatKg(metrics.totalWeight)} kg
//                     </p>
//                   </div>

//                   <div className="p-3 rounded-lg bg-green-50">
//                     <p className="text-xs text-gray-500 uppercase font-medium mb-1">
//                       Tổng KL thu
//                     </p>
//                     <p className="text-base font-bold text-gray-900">
//                       {formatKg(metrics.totalNetWeight)} kg
//                     </p>
//                   </div>

//                   <div
//                     className={`p-3 rounded-lg ${
//                       metrics.totalDifference >= 0 ? "bg-amber-50" : "bg-red-50"
//                     }`}
//                   >
//                     <p className="text-xs text-gray-500 uppercase font-medium mb-1">
//                       Chênh lệch
//                     </p>
//                     <p
//                       className={`text-base font-bold ${
//                         metrics.totalDifference >= 0
//                           ? "text-green-700"
//                           : "text-red-700"
//                       }`}
//                     >
//                       {metrics.totalDifference >= 0 ? "+" : ""}
//                       {formatKg(metrics.totalDifference)} kg
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

// export default SummaryWeight;

// pages/Manager/Dashboard/SummaryWeight.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../../Services/Dashboard/dashboardService";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Scale,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle,
  Calendar,
  Package,
  Layers,
  ChevronRight,
} from "lucide-react";

const FILTER_OPTIONS = [
  { label: "Hôm nay", value: "DAY" },
  { label: "Tuần này", value: "WEEK" },
  { label: "Tháng này", value: "MONTH" },
  { label: "Quý này", value: "QUARTER" },
  { label: "6 tháng", value: "HALF_YEAR" },
  { label: "Tùy chỉnh", value: "CUSTOM" },
];

const SummaryWeight = () => {
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

      const res = await dashboardService.getRoutesWeightSummary(params);
      setData(res?.data || []);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lỗi khi tải dữ liệu khối lượng";
      setError(msg);
      toast.error("Lỗi khi tải dữ liệu khối lượng");
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch khi chọn filter nhanh (không phải CUSTOM)
  useEffect(() => {
    if (filterType !== "CUSTOM") {
      fetchSummary({ filterType });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const formatKg = (value) =>
    Number(value || 0).toLocaleString("vi-VN", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

  const metrics = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    const totalWeight = data.reduce(
      (sum, item) => sum + (item.totalWeight || 0),
      0,
    );
    const totalNetWeight = data.reduce(
      (sum, item) => sum + (item.totalNetWeight || 0),
      0,
    );
    const totalRoutes = data.length;
    const totalDifference = totalNetWeight - totalWeight;

    const topRoute = [...data].sort(
      (a, b) => (b.totalNetWeight || 0) - (a.totalNetWeight || 0),
    )[0];

    const avgWeightPerRoute = totalRoutes > 0 ? totalWeight / totalRoutes : 0;
    const avgNetWeightPerRoute =
      totalRoutes > 0 ? totalNetWeight / totalRoutes : 0;

    return {
      totalWeight,
      totalNetWeight,
      totalRoutes,
      totalDifference,
      topRoute,
      avgWeightPerRoute,
      avgNetWeightPerRoute,
    };
  }, [data]);

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
      <div className="p-5 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-10 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded" />
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
            Khối lượng theo tuyến
          </span>
        </div>

        {/* ✅ Header đồng bộ DashboardManager (gọn + filter inline) */}
        <div className="mb-6 md:mb-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-5">
            <div className="flex flex-col gap-4">
              {/* Top row */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Scale className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg md:text-xl font-bold text-gray-800 leading-tight truncate">
                      Thống kê khối lượng theo tuyến
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-xs md:text-sm font-semibold text-blue-800">
                      {FILTER_OPTIONS.find((f) => f.value === filterType)
                        ?.label || "—"}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                    <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-200">
                      <Layers size={16} className="text-gray-700" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-xs font-bold text-gray-900">
                        {metrics ? metrics.totalRoutes : 0} tuyến
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters row */}
              <div className="pt-4 border-t border-gray-200">
                <div className="mb-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Khoảng thời gian
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  {/* inline filter buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {FILTER_OPTIONS.map((opt) => (
                      <FilterButton
                        key={opt.value}
                        value={opt.value}
                        label={opt.label}
                      />
                    ))}
                  </div>

                  {/* custom bar */}
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
              </div>
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
            <Scale className="h-12 w-12 text-gray-300 mx-auto mb-3" />
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
            {/* SUMMARY CARDS (đồng bộ style card DashboardManager) */}
            <SectionTitle>Tổng quan</SectionTitle>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
              {/* Tổng KL thực */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 min-h-[150px]">
                <div className="p-5 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Tổng KL thực
                    </span>
                    <div className="p-2.5 rounded-lg bg-blue-600">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 leading-none tabular-nums">
                      {formatKg(metrics.totalWeight)}
                    </span>
                    <span className="text-sm md:text-base text-gray-600 font-medium">
                      kg
                    </span>
                  </div>

                  <div className="mt-3 text-xs md:text-sm text-gray-600">
                    TB/tuyến:{" "}
                    <b className="text-gray-800">
                      {formatKg(metrics.avgWeightPerRoute)} kg
                    </b>
                  </div>
                </div>
              </div>

              {/* Tổng KL thu */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 min-h-[150px]">
                <div className="p-5 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Tổng KL thu
                    </span>
                    <div className="p-2.5 rounded-lg bg-blue-600">
                      <Scale className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 leading-none tabular-nums">
                      {formatKg(metrics.totalNetWeight)}
                    </span>
                    <span className="text-sm md:text-base text-gray-600 font-medium">
                      kg
                    </span>
                  </div>

                  <div className="mt-3 text-xs md:text-sm text-gray-600">
                    TB/tuyến:{" "}
                    <b className="text-gray-800">
                      {formatKg(metrics.avgNetWeightPerRoute)} kg
                    </b>
                  </div>
                </div>
              </div>

              {/* Chênh lệch */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 min-h-[150px]">
                <div className="p-5 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Chênh lệch
                    </span>
                    <div className="p-2.5 rounded-lg bg-blue-600">
                      {metrics.totalDifference >= 0 ? (
                        <TrendingUp className="w-6 h-6 text-white" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 leading-none tabular-nums">
                      {metrics.totalDifference >= 0 ? "+" : ""}
                      {formatKg(metrics.totalDifference)}
                    </span>
                    <span className="text-sm md:text-base text-gray-600 font-medium">
                      kg
                    </span>
                  </div>

                  <div className="mt-3 text-xs md:text-sm text-gray-600">
                    {metrics.totalWeight > 0 ? (
                      <>
                        ~{" "}
                        <b className="text-gray-800">
                          {(
                            (metrics.totalDifference / metrics.totalWeight) *
                            100
                          ).toFixed(1)}
                          %
                        </b>{" "}
                        so với KL thực
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              </div>

              {/* Tuyến hàng đầu */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 min-h-[150px]">
                <div className="p-5 md:p-6 bg-gradient-to-br from-blue-50 to-blue-100 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600 text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Tuyến KL thu cao nhất
                    </span>
                    <div className="p-2.5 rounded-lg bg-blue-600">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="text-lg md:text-xl font-bold text-gray-800 truncate">
                      {metrics.topRoute?.routeName || "N/A"}
                    </div>
                    <div className="mt-2 text-sm md:text-base font-bold text-blue-600 tabular-nums">
                      {formatKg(metrics.topRoute?.totalNetWeight || 0)} kg
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROUTES GRID */}
            <div className="mt-2">
              <div className="flex items-end justify-between mb-4">
                <SectionTitle>Chi tiết theo từng tuyến</SectionTitle>
                <div className="text-xs text-gray-500">
                  Tổng:{" "}
                  <b className="text-gray-800 tabular-nums">
                    {metrics.totalRoutes}
                  </b>{" "}
                  tuyến
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {data.map((route, index) => {
                  const totalWeight = route.totalWeight || 0;
                  const totalNetWeight = route.totalNetWeight || 0;

                  const difference = totalNetWeight - totalWeight;
                  const percentDiff =
                    totalWeight > 0 ? (difference / totalWeight) * 100 : 0;

                  const percentOfTotalNet =
                    metrics.totalNetWeight > 0
                      ? (totalNetWeight / metrics.totalNetWeight) * 100
                      : 0;

                  return (
                    <div
                      key={`${route.routeName}-${index}`}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                      {/* header */}
                      <div className="p-4 md:p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-b border-blue-100">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-gray-200 font-bold text-gray-900 text-xs shrink-0">
                              {index + 1}
                            </div>
                            <h4 className="text-base md:text-lg font-bold text-gray-800 truncate">
                              {route.routeName}
                            </h4>
                          </div>

                          <div className="p-2 rounded-lg bg-blue-600 shrink-0">
                            <Scale className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* body */}
                      <div className="p-4 md:p-5">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <Package className="h-4 w-4 text-gray-500 shrink-0" />
                              <span className="text-xs md:text-sm font-semibold text-gray-600 truncate">
                                KL thực
                              </span>
                            </div>
                            <span className="text-sm md:text-base font-bold text-gray-800 tabular-nums whitespace-nowrap">
                              {formatKg(totalWeight)} kg
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <Scale className="h-4 w-4 text-gray-500 shrink-0" />
                              <span className="text-xs md:text-sm font-semibold text-gray-600 truncate">
                                KL thu
                              </span>
                            </div>
                            <span className="text-sm md:text-base font-bold text-gray-800 tabular-nums whitespace-nowrap">
                              {formatKg(totalNetWeight)} kg
                            </span>
                          </div>
                        </div>

                        {/* difference */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              {difference >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600 shrink-0" />
                              )}
                              <span className="text-xs md:text-sm font-semibold text-gray-600 truncate">
                                Chênh lệch
                              </span>
                            </div>

                            <div className="text-right">
                              <div
                                className={`text-sm md:text-base font-bold tabular-nums ${
                                  difference >= 0
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {difference >= 0 ? "+" : ""}
                                {formatKg(difference)} kg
                              </div>
                              <div
                                className={`text-xs font-semibold tabular-nums ${
                                  difference >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                ({difference >= 0 ? "+" : ""}
                                {percentDiff.toFixed(1)}%)
                              </div>
                            </div>
                          </div>

                          {/* percent bar */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>% tổng KL thu</span>
                              <span className="font-bold text-gray-800 tabular-nums">
                                {percentOfTotalNet.toFixed(1)}%
                              </span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, percentOfTotalNet)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer summary đồng bộ */}
              <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Tổng tuyến
                    </p>
                    <p className="text-xl font-bold text-gray-800 tabular-nums">
                      {metrics.totalRoutes}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Tổng KL thực
                    </p>
                    <p className="text-base font-bold text-gray-800 tabular-nums">
                      {formatKg(metrics.totalWeight)} kg
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Tổng KL thu
                    </p>
                    <p className="text-base font-bold text-gray-800 tabular-nums">
                      {formatKg(metrics.totalNetWeight)} kg
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                      Chênh lệch
                    </p>
                    <p
                      className={`text-base font-bold tabular-nums ${
                        metrics.totalDifference >= 0
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {metrics.totalDifference >= 0 ? "+" : ""}
                      {formatKg(metrics.totalDifference)} kg
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

export default SummaryWeight;
