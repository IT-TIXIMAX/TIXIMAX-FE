// import React, { useState, useEffect } from "react";
// import {
//   Search,
//   PlaneTakeoff,
//   ChevronLeft,
//   ChevronRight,
//   Calendar,
//   RefreshCw,
//   CheckCircle,
//   Package,
//   Download,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import packingsService from "../../Services/Warehouse/packingsService";
// import receivePackingService from "../../Services/Warehouse/receivepackingService";
// import * as XLSX from "xlsx";

// const PackingFlyingList = () => {
//   const [packings, setPackings] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [pageSize, setPageSize] = useState(20);
//   const [totalPackings, setTotalPackings] = useState(0);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterDate, setFilterDate] = useState("");
//   const [selectedPackings, setSelectedPackings] = useState([]);
//   const [exportLoading, setExportLoading] = useState(false);

//   // Helper function to extract error message from backend response
//   const getErrorMessage = (error) => {
//     if (error.response) {
//       const backendError =
//         error.response.data?.error ||
//         error.response.data?.message ||
//         error.response.data?.detail ||
//         error.response.data?.errors;

//       if (backendError) {
//         if (typeof backendError === "object" && !Array.isArray(backendError)) {
//           const errorMessages = Object.entries(backendError)
//             .map(([field, msg]) => `${field}: ${msg}`)
//             .join(", ");
//           return `Lỗi validation: ${errorMessages}`;
//         } else if (Array.isArray(backendError)) {
//           return backendError.join(", ");
//         } else {
//           return backendError;
//         }
//       } else {
//         return `Lỗi ${error.response.status}: ${
//           error.response.statusText || "Không xác định"
//         }`;
//       }
//     } else if (error.request) {
//       return "Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.";
//     } else {
//       return error.message || "Đã xảy ra lỗi không xác định";
//     }
//   };

//   // Load packings with pagination
//   const loadPackings = async (page = 0, limit = 20) => {
//     setLoading(true);
//     try {
//       const response = await packingsService.getFlyingAwayOrders(page, limit);
//       setPackings(response.content || []);
//       setTotalPackings(response.totalElements || 0);
//       setCurrentPage(page);
//     } catch (err) {
//       const errorMessage = getErrorMessage(err);
//       toast.error(errorMessage, { duration: 5000 });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get total products for a packing
//   const getTotalProducts = (packingList) => {
//     return packingList.length;
//   };

//   // Handle checkbox selection - DÙNG packingId
//   const handleSelectPacking = (packingId) => {
//     setSelectedPackings((prev) =>
//       prev.includes(packingId)
//         ? prev.filter((id) => id !== packingId)
//         : [...prev, packingId]
//     );
//   };

//   // Handle select all - DÙNG packingId
//   const handleSelectAll = () => {
//     if (selectedPackings.length === filteredPackings.length) {
//       setSelectedPackings([]);
//     } else {
//       setSelectedPackings(filteredPackings.map((p) => p.packingId));
//     }
//   };

//   // Handle confirm receipt
//   const handleConfirmReceipt = async () => {
//     if (selectedPackings.length === 0) {
//       toast.error("Vui lòng chọn ít nhất một đơn hàng để xác nhận nhận");
//       return;
//     }
//     setLoading(true);
//     try {
//       const note = "Đã nhận tại kho nội địa";

//       // Map packingId → packingCode nếu API cần packingCode
//       const packingCodes = packings
//         .filter((p) => selectedPackings.includes(p.packingId))
//         .map((p) => p.packingCode);

//       await receivePackingService.confirmReceipt(packingCodes, note);
//       toast.success("Xác nhận nhận hàng thành công!");
//       setSelectedPackings([]);
//       await loadPackings(currentPage, pageSize);
//     } catch (err) {
//       const errorMessage = getErrorMessage(err);
//       toast.error(`Không thể xác nhận nhận hàng: ${errorMessage}`, {
//         duration: 5000,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle Export Excel - DÙNG packingId
//   const handleExportSelected = async () => {
//     if (selectedPackings.length === 0) {
//       toast.error("Vui lòng chọn ít nhất một kiện hàng để xuất!");
//       return;
//     }

//     setExportLoading(true);
//     try {
//       // Gửi array of packingId
//       const data = await packingsService.exportPackings(selectedPackings);

//       if (!data || data.length === 0) {
//         toast.error("Không có dữ liệu để xuất!");
//         return;
//       }

//       // Helper function to ensure array
//       const ensureArray = (value) => {
//         if (Array.isArray(value)) return value;
//         if (value === null || value === undefined || value === "") return [];
//         return [value];
//       };

//       // Create header
//       const excelData = [
//         [
//           "STT",
//           "Mã kiện hàng",
//           "Mã chuyến bay",
//           "Mã đơn hàng",
//           "Mã tracking",
//           "Tên sản phẩm",
//           "Số lượng",
//           "Giá tiền",
//           "Link sản phẩm",
//           "Phân loại",
//           "Chiều cao",
//           "Chiều dài",
//           "Chiều rộng",
//           "Trọng lượng",
//           "Dim",
//           "Net Weight",
//           "Mã khách hàng",
//           "Tên khách hàng",
//           "Điểm đến",
//           "Nhân viên",
//         ],
//         // [
//         //   "No.",
//         //   "Package Code",
//         //   "Flight Code",
//         //   "Order Code",
//         //   "Tracking Code",
//         //   "Product Name",
//         //   "Quantity",
//         //   "Price",
//         //   "Product Link",
//         //   "Category",
//         //   "Height (cm)",
//         //   "Length (cm)",
//         //   "Width (cm)",
//         //   "Volume (m³)",
//         //   "Weight (kg)",
//         //   "Customer Code",
//         //   "Customer Name",
//         //   "Destination",
//         //   "Staff",
//         // ],
//       ];

//       let stt = 1;

//       // Process each packing
//       data.forEach((packing) => {
//         // Convert to arrays
//         const productNames = ensureArray(packing.productNames);
//         const quantities = ensureArray(packing.quantities);
//         const productLinks = ensureArray(packing.productLink);

//         // Handle price - có thể là number hoặc array
//         let prices = [];
//         if (Array.isArray(packing.price)) {
//           prices = packing.price;
//         } else if (
//           typeof packing.price === "number" ||
//           typeof packing.price === "string"
//         ) {
//           const priceValue = packing.price;
//           const itemCount = Math.max(productNames.length, quantities.length, 1);
//           prices = Array(itemCount).fill(priceValue);
//         } else {
//           prices = [];
//         }

//         // Find max length
//         const maxLength = Math.max(
//           productNames.length,
//           quantities.length,
//           prices.length,
//           productLinks.length,
//           1
//         );

//         // Create a row for each product
//         for (let i = 0; i < maxLength; i++) {
//           excelData.push([
//             stt,
//             packing.packingCode || "",
//             packing.flightCode || "",
//             packing.orderCode || "",
//             packing.trackingCode || "",
//             productNames[i] || "",
//             quantities[i] || "",
//             prices[i] !== undefined && prices[i] !== null ? prices[i] : "",
//             productLinks[i] || "",
//             packing.classify || "",
//             packing.height || "",
//             packing.length || "",
//             packing.width || "",
//             packing.weight ? Number(packing.weight).toFixed(4) : "",
//             packing.dim ? Number(packing.dim).toFixed(4) : "",
//             packing.netWeight ? Number(packing.netWeight).toFixed(2) : "",
//             packing.customerCode || "",
//             packing.customerName || "",
//             packing.destination || "",
//             packing.staffName || "",
//           ]);
//           stt++;
//         }
//       });

//       // Create worksheet
//       const ws = XLSX.utils.aoa_to_sheet(excelData);

//       // Column widths
//       ws["!cols"] = [
//         { wch: 5 }, // STT
//         { wch: 18 }, // Mã kiện hàng
//         { wch: 15 }, // Mã chuyến bay
//         { wch: 15 }, // Mã đơn hàng
//         { wch: 15 }, // Mã tracking
//         { wch: 30 }, // Tên sản phẩm
//         { wch: 10 }, // Số lượng
//         { wch: 15 }, // Giá tiền
//         { wch: 50 }, // Link sản phẩm
//         { wch: 18 }, // Phân loại
//         { wch: 12 }, // Chiều cao
//         { wch: 12 }, // Chiều dài
//         { wch: 12 }, // Chiều rộng
//         { wch: 12 }, // Thể tích
//         { wch: 15 }, // Trọng lượng
//         { wch: 15 }, // Mã khách hàng
//         { wch: 20 }, // Tên khách hàng
//         { wch: 15 }, // Điểm đến
//         { wch: 20 }, // Nhân viên
//       ];

//       // Style header row
//       const range = XLSX.utils.decode_range(ws["!ref"]);
//       for (let col = range.s.c; col <= range.e.c; col++) {
//         const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
//         if (!ws[cellAddress]) continue;

//         ws[cellAddress].s = {
//           fill: {
//             fgColor: { rgb: "2563EB" },
//           },
//           font: {
//             color: { rgb: "FFFFFF" },
//             bold: true,
//             sz: 12,
//           },
//           alignment: {
//             horizontal: "center",
//             vertical: "center",
//           },
//           border: {
//             top: { style: "thin", color: { rgb: "000000" } },
//             bottom: { style: "thin", color: { rgb: "000000" } },
//             left: { style: "thin", color: { rgb: "000000" } },
//             right: { style: "thin", color: { rgb: "000000" } },
//           },
//         };
//       }

//       // Format price columns as number with thousand separator
//       for (let row = 1; row < excelData.length; row++) {
//         const priceCell = XLSX.utils.encode_cell({ r: row, c: 7 });
//         if (ws[priceCell] && typeof ws[priceCell].v === "number") {
//           ws[priceCell].z = "#,##0";
//         }
//       }

//       // Create workbook and export
//       const wb = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(wb, ws, "Packings");

//       const fileName = `packings_flying_export_${
//         new Date().toISOString().split("T")[0]
//       }.xlsx`;
//       XLSX.writeFile(wb, fileName);

//       toast.success(
//         `Xuất thành công ${data.length} kiện hàng (${stt - 1} dòng chi tiết)!`
//       );
//     } catch (error) {
//       console.error("Export error:", error);
//       toast.error(error.message || "Export thất bại!");
//     } finally {
//       setExportLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadPackings(0, pageSize);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pageSize]);

//   const handlePageChange = (newPage) => {
//     loadPackings(newPage, pageSize);
//   };

//   const handlePageSizeChange = (e) => {
//     const newSize = parseInt(e.target.value);
//     setPageSize(newSize);
//     setCurrentPage(0);
//   };

//   // Filter packings based on search term and date
//   const filteredPackings = packings.filter(
//     (packing) =>
//       packing.packingCode.toLowerCase().includes(searchTerm.toLowerCase()) &&
//       (!filterDate || packing.packedDate.split("T")[0] === filterDate)
//   );

//   const totalPages = Math.ceil(totalPackings / pageSize);

//   return (
//     <div className="p-6 min-h-screen">
//       <div className="mx-auto">
//         {/* Header */}
//         <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-4">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
//               <PlaneTakeoff size={22} className="text-white" />
//             </div>
//             <h1 className="text-xl font-semibold text-white">
//               Tổng kiện đang vận chuyển
//             </h1>
//           </div>
//         </div>

//         {/* Controls */}
//         <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1 relative">
//               <Search
//                 className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
//                 size={18}
//               />
//               <input
//                 type="text"
//                 placeholder="Tìm mã đóng gói..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
//               />
//             </div>

//             <div className="relative">
//               <Calendar
//                 className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
//                 size={18}
//               />
//               <input
//                 type="date"
//                 value={filterDate}
//                 onChange={(e) => setFilterDate(e.target.value)}
//                 className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
//               />
//             </div>

//             <select
//               value={pageSize}
//               onChange={handlePageSizeChange}
//               disabled={loading}
//               className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
//             >
//               <option value={10}>10 / trang</option>
//               <option value={20}>20 / trang</option>
//               <option value={30}>30 / trang</option>
//               <option value={50}>50 / trang</option>
//               <option value={100}>100 / trang</option>
//             </select>

//             {/* Export Button */}
//             <button
//               onClick={handleExportSelected}
//               disabled={selectedPackings.length === 0 || exportLoading}
//               className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
//                 selectedPackings.length === 0 || exportLoading
//                   ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                   : "bg-green-600 text-white hover:bg-green-700"
//               }`}
//             >
//               {exportLoading ? (
//                 <>
//                   <RefreshCw className="w-4 h-4 animate-spin" />
//                   Đang xuất...
//                 </>
//               ) : (
//                 <>
//                   <Download size={18} />
//                   Xuất Excel ({selectedPackings.length})
//                 </>
//               )}
//             </button>

//             {/* Receive Button */}
//             <button
//               onClick={handleConfirmReceipt}
//               disabled={loading || selectedPackings.length === 0}
//               className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
//             >
//               <CheckCircle size={18} />
//               Nhận hàng ({selectedPackings.length})
//             </button>
//           </div>
//         </div>

//         {/* Loading State */}
//         {loading && (
//           <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
//             <RefreshCw
//               size={32}
//               className="animate-spin text-blue-600 mx-auto mb-3"
//             />
//             <p className="text-gray-700 text-sm font-medium">
//               Đang tải dữ liệu...
//             </p>
//           </div>
//         )}

//         {/* Empty State */}
//         {!loading && filteredPackings.length === 0 && (
//           <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
//             <PlaneTakeoff size={40} className="text-gray-300 mx-auto mb-3" />
//             <h3 className="text-base font-semibold text-gray-800 mb-1">
//               Không có đơn hàng nào
//             </h3>
//             <p className="text-gray-500 text-sm">
//               {searchTerm
//                 ? "Không tìm thấy kết quả phù hợp."
//                 : "Hiện tại không có đơn hàng nào đang vận chuyển."}
//             </p>
//             {(searchTerm || filterDate) && (
//               <button
//                 onClick={() => {
//                   setSearchTerm("");
//                   setFilterDate("");
//                 }}
//                 className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Xóa bộ lọc
//               </button>
//             )}
//           </div>
//         )}

//         {/* Table */}
//         {filteredPackings.length > 0 && (
//           <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
//             {/* Table Header Info */}
//             <div className="px-6 py-3 bg-blue-200 border-b border-blue-100">
//               <div className="flex items-center justify-between text-sm">
//                 <label className="flex items-center gap-2 cursor-pointer font-medium text-black-900">
//                   <input
//                     type="checkbox"
//                     checked={
//                       selectedPackings.length === filteredPackings.length &&
//                       filteredPackings.length > 0
//                     }
//                     onChange={handleSelectAll}
//                     className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   Chọn tất cả ({filteredPackings.length} đơn)
//                 </label>
//                 <span className="text-blue-700">
//                   Trang {currentPage + 1} / {totalPages}
//                 </span>
//               </div>
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-blue-50">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12">
//                       Chọn
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                       Mã Đóng Gói
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                       Chuyến Bay
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                       Sản Phẩm
//                     </th>
//                     <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                       Tổng SP
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                       Ngày Đóng Gói
//                     </th>
//                     <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                       Trạng Thái
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-100">
//                   {filteredPackings.map((packing) => (
//                     <tr
//                       key={packing.packingId}
//                       className={`hover:bg-blue-50/60 transition-colors ${
//                         selectedPackings.includes(packing.packingId)
//                           ? "bg-blue-50/60"
//                           : ""
//                       }`}
//                     >
//                       {/* Checkbox */}
//                       <td className="px-4 py-3">
//                         <input
//                           type="checkbox"
//                           checked={selectedPackings.includes(packing.packingId)}
//                           onChange={() =>
//                             handleSelectPacking(packing.packingId)
//                           }
//                           className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                         />
//                       </td>

//                       {/* Packing Code */}
//                       <td className="px-6 py-3 text-gray-900 font-medium">
//                         {packing.packingCode}
//                       </td>

//                       {/* Flight Code */}
//                       <td className="px-4 py-3 text-gray-700">
//                         {packing.flightCode}
//                       </td>

//                       {/* Packing List */}
//                       <td className="px-4 py-3">
//                         <div className="flex flex-wrap gap-1 max-w-md">
//                           {packing.packingList.slice(0, 2).map((item, idx) => (
//                             <span
//                               key={idx}
//                               className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100"
//                             >
//                               {item}
//                             </span>
//                           ))}
//                           {packing.packingList.length > 2 && (
//                             <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
//                               +{packing.packingList.length - 2}
//                             </span>
//                           )}
//                         </div>
//                       </td>

//                       {/* Total Products */}
//                       <td className="px-4 py-3 text-center text-gray-900">
//                         {getTotalProducts(packing.packingList)}
//                       </td>

//                       {/* Packed Date */}
//                       <td className="px-4 py-3 text-xs text-gray-500">
//                         {new Date(packing.packedDate).toLocaleDateString(
//                           "vi-VN"
//                         )}
//                       </td>

//                       {/* Status */}
//                       <td className="px-4 py-3 text-center">
//                         <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
//                           <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
//                           Đang bay
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Pagination */}
//         {filteredPackings.length > 0 && (
//           <div className="bg-white border border-gray-200 rounded-xl px-6 py-3 mt-4">
//             <div className="flex items-center justify-between text-sm">
//               <button
//                 onClick={() => handlePageChange(currentPage - 1)}
//                 disabled={currentPage === 0}
//                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
//                   currentPage === 0
//                     ? "text-gray-400 cursor-not-allowed"
//                     : "text-gray-700 hover:bg-blue-50"
//                 }`}
//               >
//                 <ChevronLeft size={18} />
//                 Trước
//               </button>

//               <div className="font-medium text-gray-700">
//                 Trang {currentPage + 1} / {totalPages}
//               </div>

//               <button
//                 onClick={() => handlePageChange(currentPage + 1)}
//                 disabled={currentPage >= totalPages - 1}
//                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
//                   currentPage >= totalPages - 1
//                     ? "text-gray-400 cursor-not-allowed"
//                     : "text-gray-700 hover:bg-blue-50"
//                 }`}
//               >
//                 Sau
//                 <ChevronRight size={18} />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PackingFlyingList;

import React, { useState, useEffect } from "react";
import {
  Search,
  PlaneTakeoff,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RefreshCw,
  CheckCircle,
  Package,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import packingsService from "../../Services/Warehouse/packingsService";
import receivePackingService from "../../Services/Warehouse/receivepackingService";
import * as XLSX from "xlsx";

const PackingFlyingList = () => {
  const [packings, setPackings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPackings, setTotalPackings] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selectedPackings, setSelectedPackings] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);

  // Helper function to extract error message from backend response
  const getErrorMessage = (error) => {
    if (error.response) {
      const backendError =
        error.response.data?.error ||
        error.response.data?.message ||
        error.response.data?.detail ||
        error.response.data?.errors;

      if (backendError) {
        if (typeof backendError === "object" && !Array.isArray(backendError)) {
          const errorMessages = Object.entries(backendError)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(", ");
          return `Lỗi validation: ${errorMessages}`;
        } else if (Array.isArray(backendError)) {
          return backendError.join(", ");
        } else {
          return backendError;
        }
      } else {
        return `Lỗi ${error.response.status}: ${
          error.response.statusText || "Không xác định"
        }`;
      }
    } else if (error.request) {
      return "Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.";
    } else {
      return error.message || "Đã xảy ra lỗi không xác định";
    }
  };

  // Load packings with pagination
  const loadPackings = async (page = 0, limit = 20) => {
    setLoading(true);
    try {
      const response = await packingsService.getFlyingAwayOrders(page, limit);
      setPackings(response.content || []);
      setTotalPackings(response.totalElements || 0);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  // Get total products for a packing
  const getTotalProducts = (packingList) => {
    return packingList.length;
  };

  // Handle checkbox selection - DÙNG packingId
  const handleSelectPacking = (packingId) => {
    setSelectedPackings((prev) =>
      prev.includes(packingId)
        ? prev.filter((id) => id !== packingId)
        : [...prev, packingId]
    );
  };

  // Handle select all - DÙNG packingId
  const handleSelectAll = () => {
    if (selectedPackings.length === filteredPackings.length) {
      setSelectedPackings([]);
    } else {
      setSelectedPackings(filteredPackings.map((p) => p.packingId));
    }
  };

  // Handle confirm receipt
  const handleConfirmReceipt = async () => {
    if (selectedPackings.length === 0) {
      toast.error("Vui lòng chọn ít nhất một đơn hàng để xác nhận nhận");
      return;
    }
    setLoading(true);
    try {
      const note = "Đã nhận tại kho nội địa";

      // Map packingId → packingCode nếu API cần packingCode
      const packingCodes = packings
        .filter((p) => selectedPackings.includes(p.packingId))
        .map((p) => p.packingCode);

      await receivePackingService.confirmReceipt(packingCodes, note);
      toast.success("Xác nhận nhận hàng thành công!");
      setSelectedPackings([]);
      await loadPackings(currentPage, pageSize);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(`Không thể xác nhận nhận hàng: ${errorMessage}`, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Export Excel - DÙNG packingId
  const handleExportSelected = async () => {
    if (selectedPackings.length === 0) {
      toast.error("Vui lòng chọn ít nhất một kiện hàng để xuất!");
      return;
    }

    setExportLoading(true);
    try {
      // Gửi array of packingId
      const data = await packingsService.exportPackings(selectedPackings);

      if (!data || data.length === 0) {
        toast.error("Không có dữ liệu để xuất!");
        return;
      }

      // Helper function to ensure array
      const ensureArray = (value) => {
        if (Array.isArray(value)) return value;
        if (value === null || value === undefined || value === "") return [];
        return [value];
      };

      // Create header
      const excelData = [
        [
          "STT",
          "Mã kiện hàng",
          "Mã chuyến bay",
          "Mã đơn hàng",
          "Mã tracking",
          "Tên sản phẩm",
          "Số lượng",
          "Giá tiền",
          "Link sản phẩm",
          "Phân loại",
          "Chiều cao",
          "Chiều dài",
          "Chiều rộng",
          "Trọng lượng",
          "Dim",
          "Net Weight",
          "Mã khách hàng",
          "Tên khách hàng",
          "Điểm đến",
          "Nhân viên",
        ],
      ];

      let stt = 1;

      // Process each packing
      data.forEach((packing) => {
        // Convert to arrays
        const productNames = ensureArray(packing.productNames);
        const quantities = ensureArray(packing.quantities);
        const productLinks = ensureArray(packing.productLink);

        // Handle price - có thể là number hoặc array
        let prices = [];
        if (Array.isArray(packing.price)) {
          prices = packing.price;
        } else if (
          typeof packing.price === "number" ||
          typeof packing.price === "string"
        ) {
          const priceValue = packing.price;
          const itemCount = Math.max(productNames.length, quantities.length, 1);
          prices = Array(itemCount).fill(priceValue);
        } else {
          prices = [];
        }

        // Find max length
        const maxLength = Math.max(
          productNames.length,
          quantities.length,
          prices.length,
          productLinks.length,
          1
        );

        // Create a row for each product
        for (let i = 0; i < maxLength; i++) {
          excelData.push([
            stt,
            packing.packingCode || "",
            packing.flightCode || "",
            packing.orderCode || "",
            packing.trackingCode || "",
            productNames[i] || "",
            quantities[i] || "",
            prices[i] !== undefined && prices[i] !== null ? prices[i] : "",
            productLinks[i] || "",
            packing.classify || "",
            packing.height || "",
            packing.length || "",
            packing.width || "",
            packing.weight ? Number(packing.weight).toFixed(4) : "",
            packing.dim ? Number(packing.dim).toFixed(4) : "",
            packing.netWeight ? Number(packing.netWeight).toFixed(2) : "",
            packing.customerCode || "",
            packing.customerName || "",
            packing.destination || "",
            packing.staffName || "",
          ]);
          stt++;
        }
      });

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Column widths
      ws["!cols"] = [
        { wch: 5 }, // STT
        { wch: 18 }, // Mã kiện hàng
        { wch: 15 }, // Mã chuyến bay
        { wch: 15 }, // Mã đơn hàng
        { wch: 15 }, // Mã tracking
        { wch: 30 }, // Tên sản phẩm
        { wch: 10 }, // Số lượng
        { wch: 15 }, // Giá tiền
        { wch: 50 }, // Link sản phẩm
        { wch: 18 }, // Phân loại
        { wch: 12 }, // Chiều cao
        { wch: 12 }, // Chiều dài
        { wch: 12 }, // Chiều rộng
        { wch: 12 }, // Thể tích
        { wch: 15 }, // Trọng lượng
        { wch: 15 }, // Mã khách hàng
        { wch: 20 }, // Tên khách hàng
        { wch: 15 }, // Điểm đến
        { wch: 20 }, // Nhân viên
      ];

      // Style header row
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
          fill: {
            fgColor: { rgb: "2563EB" },
          },
          font: {
            color: { rgb: "FFFFFF" },
            bold: true,
            sz: 12,
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }

      // Format price columns as number with thousand separator
      for (let row = 1; row < excelData.length; row++) {
        const priceCell = XLSX.utils.encode_cell({ r: row, c: 7 });
        if (ws[priceCell] && typeof ws[priceCell].v === "number") {
          ws[priceCell].z = "#,##0";
        }
      }

      // Create workbook and export
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Packings");

      const fileName = `packings_flying_export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(
        `Xuất thành công ${data.length} kiện hàng (${stt - 1} dòng chi tiết)!`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.message || "Export thất bại!");
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    loadPackings(0, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const handlePageChange = (newPage) => {
    loadPackings(newPage, pageSize);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(0);
  };

  // Filter packings based on search term and date
  const filteredPackings = packings.filter(
    (packing) =>
      packing.packingCode.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!filterDate || packing.packedDate.split("T")[0] === filterDate)
  );

  const totalPages = Math.ceil(totalPackings / pageSize);

  return (
    <div className="p-6 min-h-screen">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <PlaneTakeoff size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-semibold text-white">
              Tổng kiện đang vận chuyển
            </h1>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm mã đóng gói..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="relative">
              <Calendar
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              disabled={loading}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={30}>30 / trang</option>
              <option value={50}>50 / trang</option>
              <option value={100}>100 / trang</option>
            </select>

            {/* Export Button */}
            <button
              onClick={handleExportSelected}
              disabled={selectedPackings.length === 0 || exportLoading}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                selectedPackings.length === 0 || exportLoading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {exportLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Xuất Excel ({selectedPackings.length})
                </>
              )}
            </button>

            {/* Receive Button */}
            <button
              onClick={handleConfirmReceipt}
              disabled={loading || selectedPackings.length === 0}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle size={18} />
              Nhận hàng ({selectedPackings.length})
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Skeleton Header */}
            <div className="px-6 py-3 bg-blue-200 border-b border-blue-100">
              <div className="h-5 bg-blue-300 rounded w-48 animate-pulse"></div>
            </div>

            {/* Skeleton Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </th>
                    <th className="px-4 py-3 text-center">
                      <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </th>
                    <th className="px-4 py-3 text-center">
                      <div className="h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {[...Array(8)].map((_, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-8 mx-auto animate-pulse"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-6 bg-gray-200 rounded-full w-20 mx-auto animate-pulse"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPackings.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <PlaneTakeoff size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              Không có đơn hàng nào
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? "Không tìm thấy kết quả phù hợp."
                : "Hiện tại không có đơn hàng nào đang vận chuyển."}
            </p>
            {(searchTerm || filterDate) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterDate("");
                }}
                className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && filteredPackings.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Table Header Info */}
            <div className="px-6 py-3 bg-blue-200 border-b border-blue-100">
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-black-900">
                  <input
                    type="checkbox"
                    checked={
                      selectedPackings.length === filteredPackings.length &&
                      filteredPackings.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  Chọn tất cả ({filteredPackings.length} đơn)
                </label>
                <span className="text-blue-700">
                  Trang {currentPage + 1} / {totalPages}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12">
                      Chọn
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Mã Đóng Gói
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Chuyến Bay
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Sản Phẩm
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Tổng SP
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Ngày Đóng Gói
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Trạng Thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredPackings.map((packing) => (
                    <tr
                      key={packing.packingId}
                      className={`hover:bg-blue-50/60 transition-colors ${
                        selectedPackings.includes(packing.packingId)
                          ? "bg-blue-50/60"
                          : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedPackings.includes(packing.packingId)}
                          onChange={() =>
                            handleSelectPacking(packing.packingId)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>

                      {/* Packing Code */}
                      <td className="px-6 py-3 text-gray-900 font-medium">
                        {packing.packingCode}
                      </td>

                      {/* Flight Code */}
                      <td className="px-4 py-3 text-gray-700">
                        {packing.flightCode}
                      </td>

                      {/* Packing List */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {packing.packingList.slice(0, 2).map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100"
                            >
                              {item}
                            </span>
                          ))}
                          {packing.packingList.length > 2 && (
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
                              +{packing.packingList.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Products */}
                      <td className="px-4 py-3 text-center text-gray-900">
                        {getTotalProducts(packing.packingList)}
                      </td>

                      {/* Packed Date */}
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(packing.packedDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          Đang bay
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredPackings.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-3 mt-4">
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  currentPage === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <ChevronLeft size={18} />
                Trước
              </button>

              <div className="font-medium text-gray-700">
                Trang {currentPage + 1} / {totalPages}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  currentPage >= totalPages - 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                Sau
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackingFlyingList;
