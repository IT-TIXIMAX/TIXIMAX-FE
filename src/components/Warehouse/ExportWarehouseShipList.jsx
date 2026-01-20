// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Search,
//   X,
//   Package,
//   MapPin,
//   Truck,
//   LogOut,
//   ChevronLeft,
//   ChevronRight,
//   ChevronsLeft,
//   ChevronsRight,
//   Filter,
// } from "lucide-react";
// import draftWarehouseService from "../../Services/Warehouse/darftWarehouseService";
// import CreateExportWarehouse from "./CreateExoportWarehouse";

// const PAGE_SIZES = [50, 100, 200];
// const CARRIER_OPTIONS = [
//   { value: "ALL", label: "Tất cả" },
//   { value: "VNPOST", label: "VNPost" },
//   { value: "OTHER", label: "Khác" },
// ];

// /* ===================== Skeletons ===================== */
// const StatCardSkeleton = () => (
//   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
//     <div className="flex items-center justify-between">
//       <div className="space-y-2">
//         <div className="h-4 w-28 bg-gray-200 rounded" />
//         <div className="h-8 w-20 bg-gray-200 rounded" />
//       </div>
//       <div className="h-12 w-12 bg-gray-200 rounded-lg" />
//     </div>
//   </div>
// );

// const TableSkeleton = ({ rows = 10 }) => (
//   <div className="p-4 animate-pulse">
//     <div className="h-12 bg-gray-100 rounded-lg mb-4" />
//     <div className="space-y-3">
//       {Array.from({ length: rows }).map((_, i) => (
//         <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
//           <div className="flex items-center gap-3">
//             <div className="h-4 w-20 bg-gray-200 rounded" />
//             <div className="h-4 w-36 bg-gray-200 rounded" />
//             <div className="h-4 w-28 bg-gray-200 rounded" />
//             <div className="h-4 flex-1 bg-gray-200 rounded hidden md:block" />
//           </div>
//         </div>
//       ))}
//     </div>
//   </div>
// );

// const ExportWarehouseShipList = () => {
//   const [shipments, setShipments] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [page, setPage] = useState(0);
//   const [pageSize, setPageSize] = useState(50);
//   const [totalCount, setTotalCount] = useState(0);

//   const [searchCustomerCode, setSearchCustomerCode] = useState("");
//   const [searchShipmentCode, setSearchShipmentCode] = useState("");

//   const [filterCustomerCode, setFilterCustomerCode] = useState("");
//   const [filterShipmentCode, setFilterShipmentCode] = useState("");
//   const [filterCarrier, setFilterCarrier] = useState("ALL"); // ✅ Thêm carrier filter

//   const [selectedShipment, setSelectedShipment] = useState(null);
//   const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

//   useEffect(() => {
//     fetchShipments();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, pageSize, filterCustomerCode, filterShipmentCode, filterCarrier]);

//   const fetchShipments = async () => {
//     try {
//       setLoading(true);

//       // ✅ Đổi từ lock: true sang status: "EXPORTED"
//       const params = { status: "EXPORTED" };

//       if (filterCustomerCode) params.customerCode = filterCustomerCode;
//       if (filterShipmentCode) params.shipmentCode = filterShipmentCode;
//       if (filterCarrier && filterCarrier !== "ALL")
//         params.carrier = filterCarrier; // ✅ Thêm carrier

//       const response = await draftWarehouseService.getShippingAddressList(
//         page,
//         pageSize,
//         params,
//       );

//       if (response?.content) {
//         setShipments(response.content);
//         setTotalCount(response.totalElements || 0);
//       } else {
//         setShipments(response || []);
//         setTotalCount(response?.length || 0);
//       }
//     } catch (error) {
//       console.error("Error fetching shipments:", error);
//       setShipments([]);
//       setTotalCount(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const totalPages = useMemo(
//     () => Math.max(1, Math.ceil(totalCount / pageSize)),
//     [totalCount, pageSize],
//   );

//   const handlePageSizeChange = (newSize) => {
//     setPageSize(newSize);
//     setPage(0);
//   };

//   const handleSearch = () => {
//     setFilterCustomerCode(searchCustomerCode.trim());
//     setFilterShipmentCode(searchShipmentCode.trim());
//     setPage(0);
//   };

//   const handleExport = (shipment) => {
//     setSelectedShipment(shipment);
//     setIsExportDialogOpen(true);
//   };

//   const handleFirstPage = () => setPage(0);
//   const handlePrevPage = () => setPage((p) => Math.max(0, p - 1));
//   const handleNextPage = () => setPage((p) => Math.min(totalPages - 1, p + 1));
//   const handleLastPage = () => setPage(totalPages - 1);

//   const showingFrom = totalCount ? page * pageSize + 1 : 0;
//   const showingTo = Math.min((page + 1) * pageSize, totalCount);

//   const totalWeight = useMemo(() => {
//     return shipments.reduce((sum, item) => sum + (item.weight || 0), 0);
//   }, [shipments]);

//   const totalShipmentCodes = useMemo(() => {
//     return shipments.reduce(
//       (sum, item) => sum + (item.shippingList?.length || 0),
//       0,
//     );
//   }, [shipments]);

//   return (
//     <div className="min-h-screen">
//       <div className="mx-auto p-6">
//         {/* Header */}
//         <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
//           <div className="flex items-center justify-between">
//             {/* Left: Title */}
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
//                 <Truck size={22} className="text-white" />
//               </div>
//               <h1 className="text-xl font-semibold text-white">
//                 Danh Sách Đơn Hàng Đã Xuất Kho
//               </h1>
//             </div>

//             {/* Right: Action Button */}
//             <button
//               onClick={fetchShipments}
//               disabled={loading}
//               className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               type="button"
//             >
//               Tải lại
//             </button>
//           </div>
//         </div>

//         {/* Statistics Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           {loading ? (
//             <>
//               <StatCardSkeleton />
//               <StatCardSkeleton />
//               <StatCardSkeleton />
//             </>
//           ) : (
//             <>
//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600 mb-1">
//                       Tổng Đơn Hàng
//                     </p>
//                     <p className="text-3xl font-bold text-blue-600">
//                       {totalCount}
//                     </p>
//                   </div>
//                   <div className="p-3 bg-blue-100 rounded-lg">
//                     <MapPin className="text-blue-600" size={24} />
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600 mb-1">
//                       Tổng Mã Vận Đơn
//                     </p>
//                     <p className="text-3xl font-bold text-green-600">
//                       {totalShipmentCodes}
//                     </p>
//                   </div>
//                   <div className="p-3 bg-green-100 rounded-lg">
//                     <Package className="text-green-600" size={24} />
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-gray-600 mb-1">
//                       Tổng Trọng Lượng
//                     </p>
//                     <p className="text-3xl font-bold text-orange-600">
//                       {totalWeight.toFixed(1)} kg
//                     </p>
//                   </div>
//                   <div className="p-3 bg-orange-100 rounded-lg">
//                     <Truck className="text-orange-600" size={24} />
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>

//         {/* Filter & Search Section */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//           <div className="flex flex-col gap-4">
//             {/* Search Inputs */}
//             <div className="flex flex-col lg:flex-row gap-3">
//               <div className="flex-1">
//                 <div className="relative">
//                   <Search
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                     size={20}
//                   />
//                   <input
//                     type="text"
//                     placeholder="Tìm kiếm mã khách hàng ..."
//                     value={searchCustomerCode}
//                     onChange={(e) => setSearchCustomerCode(e.target.value)}
//                     onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                     className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
//                   />
//                   {searchCustomerCode && (
//                     <button
//                       onClick={() => {
//                         setSearchCustomerCode("");
//                         setFilterCustomerCode("");
//                         setPage(0);
//                       }}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                       type="button"
//                     >
//                       <X size={18} />
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div className="flex-1">
//                 <div className="relative">
//                   <Search
//                     className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//                     size={20}
//                   />
//                   <input
//                     type="text"
//                     placeholder="Tìm kiếm mã vận đơn ..."
//                     value={searchShipmentCode}
//                     onChange={(e) => setSearchShipmentCode(e.target.value)}
//                     onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                     className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
//                   />
//                   {searchShipmentCode && (
//                     <button
//                       onClick={() => {
//                         setSearchShipmentCode("");
//                         setFilterShipmentCode("");
//                         setPage(0);
//                       }}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                       type="button"
//                     >
//                       <X size={18} />
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 <button
//                   onClick={handleSearch}
//                   disabled={loading}
//                   className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
//                   type="button"
//                 >
//                   <Search size={18} />
//                   Tìm kiếm
//                 </button>
//               </div>
//             </div>

//             {/* ✅ Carrier Filter + Page Size */}
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//               {/* Carrier Filter */}
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
//                     Đơn vị vận chuyển:
//                   </span>
//                 </div>
//                 <div className="flex gap-2">
//                   {CARRIER_OPTIONS.map((option) => (
//                     <button
//                       key={option.value}
//                       onClick={() => {
//                         setFilterCarrier(option.value);
//                         setPage(0);
//                       }}
//                       className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                         filterCarrier === option.value
//                           ? "bg-blue-600 text-white shadow-sm"
//                           : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       }`}
//                       type="button"
//                     >
//                       {option.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Page Size Selector */}
//               <div className="flex items-center gap-3">
//                 <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
//                   Hiển thị:
//                 </span>
//                 <div className="flex gap-2">
//                   {PAGE_SIZES.map((size) => (
//                     <button
//                       key={size}
//                       onClick={() => handlePageSizeChange(size)}
//                       className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                         pageSize === size
//                           ? "bg-blue-600 text-white shadow-sm"
//                           : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       }`}
//                       type="button"
//                     >
//                       {size}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Table Section */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           {loading ? (
//             <TableSkeleton rows={10} />
//           ) : shipments.length === 0 ? (
//             <div className="p-12 text-center">
//               <Truck className="mx-auto text-gray-400 mb-4" size={48} />
//               <p className="text-gray-600 font-medium">Không có đơn hàng nào</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
//                     <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
//                       Mã Giao Hàng
//                     </th>
//                     <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
//                       Khách Hàng
//                     </th>
//                     <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
//                       Số Điện Thoại
//                     </th>
//                     <th className="px-4 py-4 text-left text-sm font-semibold">
//                       Địa Chỉ
//                     </th>
//                     <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
//                       Đơn Vị Vận Chuyển
//                     </th>
//                     <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
//                       Trọng Lượng
//                     </th>
//                     <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
//                       Mã Vận Đơn VNPost
//                     </th>
//                     <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
//                       Thao Tác
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {shipments.map((item, index) => (
//                     <tr
//                       key={item.id}
//                       className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
//                         index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                       }`}
//                     >
//                       <td className="px-4 py-4">
//                         <span className="font-semibold text-blue-700 whitespace-nowrap">
//                           {item.shipCode}
//                         </span>
//                       </td>

//                       <td className="px-4 py-4">
//                         <span className="font-medium text-gray-900">
//                           {item.customerName}
//                         </span>
//                       </td>

//                       <td className="px-4 py-4">
//                         <span className="text-sm text-gray-700 whitespace-nowrap">
//                           {item.phoneNumber}
//                         </span>
//                       </td>

//                       <td className="px-4 py-4">
//                         <span className="text-sm text-gray-700">
//                           {item.address}
//                         </span>
//                       </td>
//                       <td className="px-4 py-4">
//                         <div className="flex flex-wrap gap-2">
//                           {item.shippingList?.length > 0 ? (
//                             item.shippingList.slice(0, 6).map((code, idx) => (
//                               <div
//                                 key={`${item.id}-${code}-${idx}`}
//                                 className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg border border-blue-200"
//                               >
//                                 <span className="text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded-full font-semibold min-w-[20px] text-center">
//                                   {idx + 1}
//                                 </span>
//                                 <span className="text-sm font-mono text-gray-800">
//                                   {code}
//                                 </span>
//                               </div>
//                             ))
//                           ) : (
//                             <span className="text-sm text-gray-400 italic">
//                               Không có
//                             </span>
//                           )}
//                           {item.shippingList?.length > 6 && (
//                             <div className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm font-semibold">
//                               +{item.shippingList.length - 6}
//                             </div>
//                           )}
//                         </div>
//                       </td>

//                       <td className="px-4 py-4">
//                         <span className="font-medium text-gray-900 whitespace-nowrap">
//                           {item.weight} kg
//                         </span>
//                       </td>

//                       <td className="px-4 py-4">
//                         {filterCarrier === "VNPOST" ? (
//                           <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold inline-flex items-center gap-1">
//                             VNPOST
//                           </span>
//                         ) : filterCarrier === "OTHER" ? (
//                           <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-semibold inline-flex items-center gap-1">
//                             OTHER
//                           </span>
//                         ) : (
//                           <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
//                             Tất cả
//                           </span>
//                         )}
//                       </td>

//                       <td className="px-4 py-4">
//                         <button
//                           onClick={() => handleExport(item)}
//                           className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all flex items-center gap-2 mx-auto"
//                           type="button"
//                         >
//                           <LogOut size={16} />
//                           Xuất
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Pagination Footer */}
//           {totalPages > 1 && !loading && (
//             <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
//               <div className="px-6 py-4">
//                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//                   {/* Info */}
//                   <div className="text-sm text-gray-600">
//                     Hiển thị{" "}
//                     <span className="font-semibold text-gray-900">
//                       {showingFrom}
//                     </span>{" "}
//                     -{" "}
//                     <span className="font-semibold text-gray-900">
//                       {showingTo}
//                     </span>{" "}
//                     trong tổng số{" "}
//                     <span className="font-semibold text-gray-900">
//                       {totalCount}
//                     </span>{" "}
//                     đơn hàng
//                   </div>

//                   {/* Navigation Buttons */}
//                   <div className="flex items-center gap-2">
//                     {/* First Page */}
//                     <button
//                       onClick={handleFirstPage}
//                       disabled={page === 0}
//                       className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                       title="Trang đầu"
//                       type="button"
//                     >
//                       <ChevronsLeft size={18} className="text-gray-700" />
//                     </button>

//                     {/* Previous Page */}
//                     <button
//                       onClick={handlePrevPage}
//                       disabled={page === 0}
//                       className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
//                       type="button"
//                     >
//                       <ChevronLeft size={18} className="text-gray-700" />
//                       <span className="text-sm font-medium text-gray-700">
//                         Trước
//                       </span>
//                     </button>

//                     {/* Current Page Info */}
//                     <div className="px-4 py-2 bg-blue-600 text-white rounded-lg">
//                       <span className="text-sm font-semibold">
//                         {page + 1} / {totalPages}
//                       </span>
//                     </div>

//                     {/* Next Page */}
//                     <button
//                       onClick={handleNextPage}
//                       disabled={page >= totalPages - 1}
//                       className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
//                       type="button"
//                     >
//                       <span className="text-sm font-medium text-gray-700">
//                         Sau
//                       </span>
//                       <ChevronRight size={18} className="text-gray-700" />
//                     </button>

//                     {/* Last Page */}
//                     <button
//                       onClick={handleLastPage}
//                       disabled={page >= totalPages - 1}
//                       className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//                       title="Trang cuối"
//                       type="button"
//                     >
//                       <ChevronsRight size={18} className="text-gray-700" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Export Dialog */}
//       <CreateExportWarehouse
//         isOpen={isExportDialogOpen}
//         onClose={() => {
//           setIsExportDialogOpen(false);
//           setSelectedShipment(null);
//         }}
//         shipment={selectedShipment}
//         carrier={filterCarrier === "ALL" ? "VNPOST" : filterCarrier}
//         onSuccess={fetchShipments}
//       />
//     </div>
//   );
// };

// export default ExportWarehouseShipList;

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  Package,
  MapPin,
  Truck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from "lucide-react";
import draftWarehouseService from "../../Services/Warehouse/darftWarehouseService";
import CreateExportWarehouse from "./CreateExoportWarehouse";

const PAGE_SIZES = [50, 100, 200];
const CARRIER_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "VNPOST", label: "VNPost" },
  { value: "OTHER", label: "Khác" },
];

/* ===================== Skeletons ===================== */
const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-12 w-12 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

const TableSkeleton = ({ rows = 10 }) => (
  <div className="p-4 animate-pulse">
    <div className="h-12 bg-gray-100 rounded-lg mb-4" />
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-36 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 flex-1 bg-gray-200 rounded hidden md:block" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ExportWarehouseShipList = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  const [searchCustomerCode, setSearchCustomerCode] = useState("");
  const [searchShipmentCode, setSearchShipmentCode] = useState("");

  const [filterCustomerCode, setFilterCustomerCode] = useState("");
  const [filterShipmentCode, setFilterShipmentCode] = useState("");
  const [filterCarrier, setFilterCarrier] = useState("ALL");

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  useEffect(() => {
    fetchShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filterCustomerCode, filterShipmentCode, filterCarrier]);

  const fetchShipments = async () => {
    try {
      setLoading(true);

      const params = { status: "EXPORTED" };

      if (filterCustomerCode) params.customerCode = filterCustomerCode;
      if (filterShipmentCode) params.shipmentCode = filterShipmentCode;
      if (filterCarrier && filterCarrier !== "ALL")
        params.carrier = filterCarrier;

      const response = await draftWarehouseService.getShippingAddressList(
        page,
        pageSize,
        params,
      );

      if (response?.content) {
        setShipments(response.content);
        setTotalCount(response.totalElements || 0);
      } else {
        setShipments(response || []);
        setTotalCount(response?.length || 0);
      }
    } catch (message) {
      console.error("Error fetching shipments:", message);
      setShipments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize],
  );

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(0);
  };

  const handleSearch = () => {
    setFilterCustomerCode(searchCustomerCode.trim());
    setFilterShipmentCode(searchShipmentCode.trim());
    setPage(0);
  };

  const handleExport = (shipment) => {
    setSelectedShipment(shipment);
    setIsExportDialogOpen(true);
  };

  // ✅ Hàm xử lý khi xuất kho thành công
  const handleExportSuccess = () => {
    // Xóa shipment đã xuất khỏi danh sách
    setShipments((prev) =>
      prev.filter((s) => s.shipCode !== selectedShipment?.shipCode),
    );
    setTotalCount((prev) => prev - 1);

    // Đóng dialog
    setIsExportDialogOpen(false);
    setSelectedShipment(null);
  };

  const handleFirstPage = () => setPage(0);
  const handlePrevPage = () => setPage((p) => Math.max(0, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages - 1, p + 1));
  const handleLastPage = () => setPage(totalPages - 1);

  const showingFrom = totalCount ? page * pageSize + 1 : 0;
  const showingTo = Math.min((page + 1) * pageSize, totalCount);

  const totalWeight = useMemo(() => {
    return shipments.reduce((sum, item) => sum + (item.weight || 0), 0);
  }, [shipments]);

  const totalShipmentCodes = useMemo(() => {
    return shipments.reduce(
      (sum, item) => sum + (item.shippingList?.length || 0),
      0,
    );
  }, [shipments]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Truck size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Danh Sách Đơn Hàng Đã Xuất Kho
              </h1>
            </div>

            {/* Right: Action Button */}
            <button
              onClick={fetchShipments}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              Tải lại
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng Đơn Hàng
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {totalCount}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <MapPin className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng Mã Vận Đơn
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {totalShipmentCodes}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Package className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng Trọng Lượng
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {totalWeight.toFixed(1)} kg
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Truck className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filter & Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Inputs */}
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã khách hàng ..."
                    value={searchCustomerCode}
                    onChange={(e) => setSearchCustomerCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchCustomerCode && (
                    <button
                      onClick={() => {
                        setSearchCustomerCode("");
                        setFilterCustomerCode("");
                        setPage(0);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã vận đơn ..."
                    value={searchShipmentCode}
                    onChange={(e) => setSearchShipmentCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchShipmentCode && (
                    <button
                      onClick={() => {
                        setSearchShipmentCode("");
                        setFilterShipmentCode("");
                        setPage(0);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  type="button"
                >
                  <Search size={18} />
                  Tìm kiếm
                </button>
              </div>
            </div>

            {/* Carrier Filter + Page Size */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Carrier Filter */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Đơn vị vận chuyển:
                  </span>
                </div>
                <div className="flex gap-2">
                  {CARRIER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterCarrier(option.value);
                        setPage(0);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filterCarrier === option.value
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Hiển thị:
                </span>
                <div className="flex gap-2">
                  {PAGE_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => handlePageSizeChange(size)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        pageSize === size
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      type="button"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <TableSkeleton rows={10} />
          ) : shipments.length === 0 ? (
            <div className="p-12 text-center">
              <Truck className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">Không có đơn hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã Giao Hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Khách Hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Số Điện Thoại
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Địa Chỉ
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Đơn Vị Vận Chuyển
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Trọng Lượng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã Vận Đơn VNPost
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Thao Tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {shipments.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-4">
                        <span className="font-semibold text-blue-700 whitespace-nowrap">
                          {item.shipCode}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900">
                          {item.customerName}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-700 whitespace-nowrap">
                          {item.phoneNumber}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-700">
                          {item.address}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {item.shippingList?.length > 0 ? (
                            item.shippingList.slice(0, 6).map((code, idx) => (
                              <div
                                key={`${item.id}-${code}-${idx}`}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg border border-blue-200"
                              >
                                <span className="text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded-full font-semibold min-w-[20px] text-center">
                                  {idx + 1}
                                </span>
                                <span className="text-sm font-mono text-gray-800">
                                  {code}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              Không có
                            </span>
                          )}
                          {item.shippingList?.length > 6 && (
                            <div className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm font-semibold">
                              +{item.shippingList.length - 6}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900 whitespace-nowrap">
                          {item.weight} kg
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {filterCarrier === "VNPOST" ? (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold inline-flex items-center gap-1">
                            VNPOST
                          </span>
                        ) : filterCarrier === "OTHER" ? (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-semibold inline-flex items-center gap-1">
                            OTHER
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                            Tất cả
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleExport(item)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all flex items-center gap-2 mx-auto"
                          type="button"
                        >
                          <LogOut size={16} />
                          Xuất
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && !loading && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
              <div className="px-6 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Info */}
                  <div className="text-sm text-gray-600">
                    Hiển thị{" "}
                    <span className="font-semibold text-gray-900">
                      {showingFrom}
                    </span>{" "}
                    -{" "}
                    <span className="font-semibold text-gray-900">
                      {showingTo}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-semibold text-gray-900">
                      {totalCount}
                    </span>{" "}
                    đơn hàng
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-2">
                    {/* First Page */}
                    <button
                      onClick={handleFirstPage}
                      disabled={page === 0}
                      className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Trang đầu"
                      type="button"
                    >
                      <ChevronsLeft size={18} className="text-gray-700" />
                    </button>

                    {/* Previous Page */}
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 0}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      type="button"
                    >
                      <ChevronLeft size={18} className="text-gray-700" />
                      <span className="text-sm font-medium text-gray-700">
                        Trước
                      </span>
                    </button>

                    {/* Current Page Info */}
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                      <span className="text-sm font-semibold">
                        {page + 1} / {totalPages}
                      </span>
                    </div>

                    {/* Next Page */}
                    <button
                      onClick={handleNextPage}
                      disabled={page >= totalPages - 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      type="button"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        Sau
                      </span>
                      <ChevronRight size={18} className="text-gray-700" />
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={handleLastPage}
                      disabled={page >= totalPages - 1}
                      className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Trang cuối"
                      type="button"
                    >
                      <ChevronsRight size={18} className="text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Export Dialog - Truyền handleExportSuccess */}
      <CreateExportWarehouse
        isOpen={isExportDialogOpen}
        onClose={() => {
          setIsExportDialogOpen(false);
          setSelectedShipment(null);
        }}
        shipment={selectedShipment}
        carrier={filterCarrier === "ALL" ? "VNPOST" : filterCarrier}
        onSuccess={handleExportSuccess}
      />
    </div>
  );
};

export default ExportWarehouseShipList;
