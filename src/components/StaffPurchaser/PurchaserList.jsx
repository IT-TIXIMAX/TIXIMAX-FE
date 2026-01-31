// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Package,
//   Truck,
//   Loader2,
//   AlertCircle,
//   CheckCircle2,
//   RefreshCw,
//   Search,
//   XCircle,
//   Calendar,
//   User,
//   ShoppingCart,
//   Eye,
//   Edit3,
//   FileText, // ✅ THÊM
//   Ship, // ✅ THÊM
// } from "lucide-react";
// import toast from "react-hot-toast";
// import orderlinkService from "../../Services/StaffPurchase/orderlinkService";
// import CancelPurchase from "./CancelPurchase";
// import DetailPurchase from "./DetailPurchase";
// import UpdatePurchase from "./UpdatePurchase";

// // Normalize shipment code
// const normalizeShipmentCode = (code) => {
//   if (!code) return "";
//   if (typeof code === "string") {
//     return code.replace(/^"+|"+$/g, "").trim();
//   }
//   return String(code).trim();
// };

// // Status configuration
// const STATUS_CONFIG = {
//   DA_MUA: {
//     label: "Purchased",
//     color: "bg-green-100 text-green-800 border-green-200",
//     dotColor: "bg-green-500",
//   },
//   DAU_GIA_THANH_CONG: {
//     label: "Auction won",
//     color: "bg-purple-100 text-purple-800 border-purple-200",
//     dotColor: "bg-purple-500",
//   },
//   DA_NHAP_KHO_NN: {
//     label: "Overseas warehouse",
//     color: "bg-blue-100 text-blue-800 border-blue-200",
//     dotColor: "bg-blue-500",
//   },
//   DA_HUY: {
//     label: "Cancelled",
//     color: "bg-red-100 text-red-800 border-red-200",
//     dotColor: "bg-red-500",
//   },
// };

// const filters = [
//   { value: "", label: "All", icon: Package },
//   { value: "DA_MUA", label: "Purchased", icon: CheckCircle2 },
//   { value: "DAU_GIA_THANH_CONG", label: "Auction won", icon: ShoppingCart },
//   { value: "DA_NHAP_KHO_NN", label: "Overseas WH", icon: Truck },
//   { value: "DA_HUY", label: "Cancelled", icon: XCircle },
// ];

// /** Skeleton card */
// const CardSkeleton = () => (
//   <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
//     <div className="animate-pulse">
//       <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
//         <div className="flex flex-wrap items-center justify-between gap-4">
//           <div className="flex flex-wrap items-center gap-3">
//             <div className="h-7 w-28 rounded-lg bg-white/70 border border-blue-100" />
//             <div className="h-4 w-24 rounded bg-blue-100/70" />
//           </div>
//           <div className="flex gap-3">
//             <div className="h-3 w-20 rounded bg-blue-100/70" />
//             <div className="h-3 w-28 rounded bg-blue-100/70" />
//           </div>
//         </div>
//       </div>
//       <div className="p-6 space-y-3">
//         <div className="h-4 w-3/4 rounded bg-gray-100" />
//         <div className="h-4 w-2/3 rounded bg-gray-100" />
//         <div className="h-4 w-1/2 rounded bg-gray-100" />
//       </div>
//     </div>
//   </div>
// );

// const PurchaserList = () => {
//   const [purchases, setPurchases] = useState([]);
//   const [page, setPage] = useState(1);
//   const [size, setSize] = useState(50);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalElements, setTotalElements] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");

//   // ✅ THÊM: Backend search states
//   const [orderCodeSearch, setOrderCodeSearch] = useState("");
//   const [customerCodeSearch, setCustomerCodeSearch] = useState("");
//   const [shipmentCodeSearch, setShipmentCodeSearch] = useState("");

//   const [cancelModal, setCancelModal] = useState({
//     open: false,
//     orderId: null,
//     linkId: null,
//     orderCode: "",
//     linkInfo: null,
//   });

//   const [detailModal, setDetailModal] = useState({
//     open: false,
//     purchaseId: null,
//   });

//   const [updateModal, setUpdateModal] = useState({
//     open: false,
//     purchase: null,
//   });

//   // 🔥 Helper: Optimistic update purchase
//   const updatePurchaseInState = (purchaseId, updatedFields) => {
//     setPurchases((prev) =>
//       prev.map((p) => {
//         if (p.purchaseId === purchaseId) {
//           const updated = {
//             ...p,
//             ...updatedFields,
//           };

//           if (updatedFields.shipmentCode !== undefined) {
//             updated.pendingLinks = p.pendingLinks.map((link) => ({
//               ...link,
//               shipmentCode: updatedFields.shipmentCode,
//             }));
//           }

//           if (updatedFields.imagePurchased !== undefined) {
//             updated.purchaseImage = updatedFields.imagePurchased;
//           }

//           return updated;
//         }
//         return p;
//       })
//     );
//   };
//   // 🔥 Helper: Cancel link
//   const cancelLinkInState = (orderId, linkId) => {
//     setPurchases((prev) =>
//       prev.map((p) => {
//         if (p.orderId === orderId) {
//           return {
//             ...p,
//             pendingLinks: p.pendingLinks.map((link) =>
//               link.linkId === linkId ? { ...link, status: "DA_HUY" } : link
//             ),
//           };
//         }
//         return p;
//       })
//     );
//   };

//   const fetchData = async (
//     customPage = page,
//     customSize = size,
//     customFilter = filter
//   ) => {
//     try {
//       setLoading(true);
//       setError(null);

//       // ✅ THÊM: Build filters object
//       const filters = {};

//       if (customFilter) {
//         filters.status = customFilter;
//       }

//       if (orderCodeSearch.trim()) {
//         filters.orderCode = orderCodeSearch.trim();
//       }

//       if (customerCodeSearch.trim()) {
//         filters.customerCode = customerCodeSearch.trim();
//       }

//       if (shipmentCodeSearch.trim()) {
//         filters.shipmentCode = shipmentCodeSearch.trim();
//       }

//       const res = await orderlinkService.getAllPurchases(
//         customPage - 1,
//         customSize,
//         filters // ✅ THÊM: Pass filters object thay vì customFilter string
//       );

//       // Remove duplicates based on purchaseId
//       const uniquePurchases = (res?.content || []).reduce((acc, current) => {
//         const exists = acc.find(
//           (item) => item.purchaseId === current.purchaseId
//         );
//         if (!exists) acc.push(current);
//         return acc;
//       }, []);

//       setPurchases(uniquePurchases);
//       setTotalPages(res?.totalPages || 1);
//       setTotalElements(res?.totalElements || 0);
//     } catch (e) {
//       console.error(e);
//       setError("Could not load purchase list.");
//       toast.error("Error while loading purchase data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData(page, size, filter);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     page,
//     filter,
//     size,
//     orderCodeSearch,
//     customerCodeSearch,
//     shipmentCodeSearch,
//   ]); // ✅ THÊM: dependencies

//   const filteredPurchases = useMemo(() => {
//     if (!searchTerm.trim()) return purchases;

//     const term = searchTerm.toLowerCase();
//     return purchases.filter(
//       (p) =>
//         p.purchaseCode?.toLowerCase().includes(term) ||
//         p.orderCode?.toLowerCase().includes(term) ||
//         p.staffName?.toLowerCase().includes(term) ||
//         p.pendingLinks?.some(
//           (link) =>
//             link.productName?.toLowerCase().includes(term) ||
//             link.trackingCode?.toLowerCase().includes(term) ||
//             normalizeShipmentCode(link.shipmentCode)
//               .toLowerCase()
//               .includes(term)
//         )
//     );
//   }, [purchases, searchTerm]);

//   const stats = useMemo(() => {
//     let totalLinks = 0;
//     let needShipmentCode = 0;
//     let hasShipmentCode = 0;
//     let missingShipmentCode = 0;

//     purchases.forEach((p) => {
//       (p.pendingLinks || []).forEach((link) => {
//         totalLinks++;

//         if (link.status === "DA_MUA" || link.status === "DAU_GIA_THANH_CONG") {
//           needShipmentCode++;
//           const code = normalizeShipmentCode(link.shipmentCode);
//           if (code) hasShipmentCode++;
//           else missingShipmentCode++;
//         }
//       });
//     });

//     return {
//       totalLinks,
//       needShipmentCode,
//       hasShipmentCode,
//       missingShipmentCode,
//     };
//   }, [purchases]);

//   const handleRefresh = () => {
//     fetchData();
//     toast.success("Data refreshed.");
//   };

//   // ✅ THÊM: Search handlers
//   const handleSearch = () => {
//     setPage(1);
//     fetchData(1, size, filter);
//   };

//   const handleClearSearch = () => {
//     setOrderCodeSearch("");
//     setCustomerCodeSearch("");
//     setShipmentCodeSearch("");
//     setPage(1);
//   };

//   const openCancelModal = (purchase, link) => {
//     setCancelModal({
//       open: true,
//       orderId: purchase.orderId,
//       linkId: link.linkId,
//       orderCode: purchase.orderCode,
//       linkInfo: link,
//     });
//   };

//   const closeCancelModal = () => {
//     setCancelModal((prev) => ({ ...prev, open: false }));
//   };

//   const openDetailModal = (purchaseId) => {
//     setDetailModal({
//       open: true,
//       purchaseId,
//     });
//   };

//   const closeDetailModal = () => {
//     setDetailModal({
//       open: false,
//       purchaseId: null,
//     });
//   };

//   const openUpdateModal = (purchase) => {
//     setUpdateModal({
//       open: true,
//       purchase: {
//         ...purchase,
//         imagePurchased:
//           purchase.imagePurchased ||
//           purchase.purchaseImage ||
//           purchase.pendingLinks?.[0]?.purchaseImage ||
//           "",
//       },
//     });
//   };

//   const closeUpdateModal = () => {
//     setUpdateModal({
//       open: false,
//       purchase: null,
//     });
//   };

//   const handleFilterClick = (newFilter) => {
//     setFilter(newFilter);
//     setPage(1);
//   };

//   const needsShipmentCode = (status) => {
//     return status === "DA_MUA" || status === "DAU_GIA_THANH_CONG";
//   };

//   return (
//     <div className="min-h-screen px-4 py-6">
//       <div className="mx-auto">
//         {/* Header */}
//         <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
//           <div className="flex items-center justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
//                 <Package className="h-5 w-5 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-semibold text-white">
//                   Purchase Orders Management
//                 </h1>
//               </div>
//             </div>
//             <button
//               onClick={handleRefresh}
//               disabled={loading}
//               className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all hover:shadow-md"
//             >
//               <RefreshCw
//                 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
//               />
//               Refresh
//             </button>
//           </div>
//         </div>

//         {/* ✅ THÊM: Backend Search Section */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
//           <div className="flex flex-col gap-3">
//             {/* Row 1: Search inputs */}
//             <div className="flex flex-col sm:flex-row gap-3">
//               <div className="relative flex-1">
//                 <FileText className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input
//                   type="text"
//                   placeholder="Search by Order Code (e.g., MH-90272)..."
//                   value={orderCodeSearch}
//                   onChange={(e) => setOrderCodeSearch(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleSearch()}
//                   className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="relative flex-1">
//                 <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input
//                   type="text"
//                   placeholder="Search by Customer Code (e.g., C032)..."
//                   value={customerCodeSearch}
//                   onChange={(e) => setCustomerCodeSearch(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleSearch()}
//                   className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="relative flex-1">
//                 <Ship className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <input
//                   type="text"
//                   placeholder="Search by Shipment Code (e.g., SPX-90272)..."
//                   value={shipmentCodeSearch}
//                   onChange={(e) => setShipmentCodeSearch(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleSearch()}
//                   className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             {/* Row 2: Action buttons */}
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleSearch}
//                 disabled={loading}
//                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
//               >
//                 <Search className="w-4 h-4" />
//                 Search
//               </button>

//               {(orderCodeSearch ||
//                 customerCodeSearch ||
//                 shipmentCodeSearch) && (
//                 <button
//                   onClick={handleClearSearch}
//                   className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
//                 >
//                   <XCircle className="w-4 h-4" />
//                   Clear
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Search & Filter */}
//         <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           {/* <div className="relative flex-1 max-w-md">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search by purchase code, order code, product..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
//             />
//           </div> */}

//           <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
//             {filters.map((f) => {
//               const Icon = f.icon;
//               return (
//                 <button
//                   key={f.value}
//                   onClick={() => handleFilterClick(f.value)}
//                   className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all ${
//                     filter === f.value
//                       ? "bg-white text-blue-700 shadow-md border border-blue-200"
//                       : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
//                   }`}
//                 >
//                   <Icon className="h-4 w-4" />
//                   {f.label}
//                 </button>
//               );
//             })}

//             {/* Page Size Selector - Moved here */}
//             <select
//               value={size}
//               onChange={(e) => {
//                 setSize(Number(e.target.value));
//                 setPage(1);
//               }}
//               className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
//             >
//               <option value={10}>10 / page</option>
//               <option value={20}>20 / page</option>
//               <option value={50}>50 / page</option>
//               <option value={100}>100 / page</option>
//               <option value={200}>200 / page</option>
//             </select>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           <div className="rounded-2xl bg-gradient-to-br from-sky-200 to-blue-400 p-5 shadow-sm border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
//                   Total purchases
//                 </p>
//                 <p className="mt-2 text-3xl font-bold text-gray-900">
//                   {purchases.length}
//                 </p>
//               </div>
//               <div className="rounded-xl bg-gray-100 p-3">
//                 <Package className="h-6 w-6 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-300 p-5 shadow-sm border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
//                   Total links
//                 </p>
//                 <p className="mt-2 text-3xl font-bold text-gray-900">
//                   {stats.totalLinks}
//                 </p>
//               </div>
//               <div className="rounded-xl bg-gray-100 p-3">
//                 <Truck className="h-6 w-6 text-yellow-500" />
//               </div>
//             </div>
//           </div>

//           <div className="rounded-2xl bg-gradient-to-br from-green-200 to-emerald-100 p-5 shadow-sm border border-green-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-medium uppercase tracking-wide text-gray-800">
//                   With shipment code
//                 </p>
//                 <p className="mt-2 text-3xl font-bold text-gray-900">
//                   {stats.hasShipmentCode}
//                   <span className="text-lg font-medium text-gray-700">
//                     /{stats.needShipmentCode}
//                   </span>
//                 </p>
//               </div>
//               <div className="rounded-xl bg-gray-100 p-3">
//                 <CheckCircle2 className="h-6 w-6 text-green-600" />
//               </div>
//             </div>
//           </div>

//           <div className="rounded-2xl bg-gradient-to-br from-red-200 to-rose-100 p-5 shadow-sm border border-red-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs font-medium uppercase tracking-wide text-gray-800">
//                   Missing shipment code
//                 </p>
//                 <p className="mt-2 text-3xl font-bold text-gray-900">
//                   {stats.missingShipmentCode}
//                   <span className="text-lg font-medium text-gray-700">
//                     /{stats.needShipmentCode}
//                   </span>
//                 </p>
//               </div>
//               <div className="rounded-xl bg-gray-100 p-3">
//                 <AlertCircle className="h-6 w-6 text-red-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Error Alert */}
//         {error && (
//           <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
//             <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
//             <span>{error}</span>
//           </div>
//         )}

//         {/* Loading: skeleton list */}
//         {loading ? (
//           <div className="space-y-4">
//             {Array.from({ length: Math.min(size, 10) }).map((_, idx) => (
//               <CardSkeleton key={idx} />
//             ))}
//           </div>
//         ) : (
//           <>
//             {/* Empty State */}
//             {!error && filteredPurchases.length === 0 && (
//               <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
//                 <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
//                   <Package className="h-12 w-12 text-gray-400" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                   No purchase found
//                 </h3>
//                 <p className="text-sm text-gray-500">
//                   {searchTerm
//                     ? "Try searching with a different keyword."
//                     : "There is no purchase record yet."}
//                 </p>
//               </div>
//             )}

//             {/* Purchase List */}
//             {!error && filteredPurchases.length > 0 && (
//               <div className="space-y-4">
//                 {filteredPurchases.map((purchase) => (
//                   <div
//                     key={purchase.purchaseId}
//                     className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
//                   >
//                     {/* Purchase Header */}
//                     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
//                       <div className="flex flex-wrap items-center justify-between gap-4">
//                         <div className="flex flex-wrap items-center gap-3">
//                           <span className="inline-flex items-center gap-2 rounded-lg bg-white border border-blue-200 px-3 py-1.5 text-sm font-bold text-blue-900 shadow-sm">
//                             <ShoppingCart className="h-4 w-4" />
//                             {purchase.purchaseCode}
//                           </span>
//                         </div>

//                         <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
//                           <div className="flex items-center gap-1.5">
//                             <User className="h-3.5 w-3.5" />
//                             <span className="font-medium text-gray-900">
//                               {purchase.staffName}
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-1.5">
//                             <Calendar className="h-3.5 w-3.5" />
//                             <span className="text-gray-900">
//                               {purchase.purchaseTime
//                                 ? new Date(
//                                     purchase.purchaseTime
//                                   ).toLocaleString("vi-VN", {
//                                     dateStyle: "short",
//                                   })
//                                 : "—"}
//                             </span>
//                           </div>

//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() =>
//                                 openDetailModal(purchase.purchaseId)
//                               }
//                               className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-900"
//                             >
//                               <Eye className="h-3.5 w-3.5" />
//                               View detail
//                             </button>

//                             <button
//                               onClick={() => openUpdateModal(purchase)}
//                               className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700"
//                             >
//                               <Edit3 className="h-3.5 w-3.5" />
//                               Edit
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Pending Links */}
//                     <div className="p-6">
//                       <div className="space-y-3">
//                         {(purchase.pendingLinks || []).map((link, index) => {
//                           const normalizedCode = normalizeShipmentCode(
//                             link.shipmentCode
//                           );
//                           const hasCode = !!normalizedCode;
//                           const statusConfig = STATUS_CONFIG[link.status] || {
//                             label: link.status,
//                             color: "bg-gray-100 text-gray-800 border-gray-200",
//                             dotColor: "bg-gray-500",
//                           };
//                           const requiresShipmentCode = needsShipmentCode(
//                             link.status
//                           );

//                           return (
//                             <div
//                               key={`${purchase.purchaseId}-${link.linkId}-${index}`}
//                               className="group rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-white hover:shadow-sm transition-all"
//                             >
//                               <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//                                 <div className="flex-1 space-y-2">
//                                   <div className="flex flex-wrap items-center gap-2">
//                                     <h4 className="font-semibold text-gray-900">
//                                       {link.productName}
//                                     </h4>
//                                     <span
//                                       className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig.color}`}
//                                     >
//                                       <span
//                                         className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`}
//                                       />
//                                       {statusConfig.label}
//                                     </span>
//                                   </div>

//                                   <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
//                                     {link.website && (
//                                       <span>
//                                         Website:{" "}
//                                         <span className="font-medium text-gray-900">
//                                           {link.website}
//                                         </span>
//                                       </span>
//                                     )}
//                                     <span>
//                                       Qty:{" "}
//                                       <span className="font-medium text-gray-900">
//                                         {link.quantity}
//                                       </span>
//                                     </span>
//                                     {purchase.orderCode && (
//                                       <span className="flex items-center gap-1">
//                                         OrderCode:{" "}
//                                         <span className="font-medium text-blue-600">
//                                           {purchase.orderCode}
//                                         </span>
//                                       </span>
//                                     )}
//                                     {link.classify && (
//                                       <span>
//                                         Category:{" "}
//                                         <span className="font-medium text-gray-900">
//                                           {link.classify}
//                                         </span>
//                                       </span>
//                                     )}
//                                     {purchase.purchaseCode && (
//                                       <span>
//                                         Price purchase:{" "}
//                                         <span className="font-medium text-gray-900">
//                                           {purchase.finalPriceOrder}
//                                         </span>
//                                       </span>
//                                     )}
//                                   </div>
//                                 </div>
//                                 <div className="flex flex-col items-start gap-3 lg:items-end">
//                                   {requiresShipmentCode && (
//                                     <div className="flex items-center gap-2">
//                                       <Truck className="h-4 w-4 text-gray-400" />
//                                       {hasCode ? (
//                                         <div className="flex items-center gap-2">
//                                           <span className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-mono font-semibold text-green-800">
//                                             {normalizedCode}
//                                           </span>
//                                           <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
//                                             <CheckCircle2 className="h-3.5 w-3.5" />
//                                             Has code
//                                           </span>
//                                         </div>
//                                       ) : (
//                                         <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700">
//                                           <AlertCircle className="h-3.5 w-3.5" />
//                                           Missing shipment code
//                                         </span>
//                                       )}
//                                     </div>
//                                   )}

//                                   {link.status !== "DA_HUY" && (
//                                     <button
//                                       onClick={() =>
//                                         openCancelModal(purchase, link)
//                                       }
//                                       className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
//                                     >
//                                       <XCircle className="h-3.5 w-3.5" />
//                                       Cancel link
//                                     </button>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         )}

//         {/* Pagination */}
//         {!loading && filteredPurchases.length > 0 && (
//           <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white border border-gray-200 px-6 py-4 shadow-sm">
//             <div className="text-sm text-gray-600">
//               Page <span className="font-semibold text-gray-900">{page}</span>{" "}
//               of{" "}
//               <span className="font-semibold text-gray-900">{totalPages}</span>
//               <span className="ml-2 text-gray-400">
//                 ({totalElements} purchases)
//               </span>
//             </div>
//             <div className="flex items-center gap-3">
//               <button
//                 disabled={page <= 1 || loading}
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//               >
//                 Previous
//               </button>
//               <button
//                 disabled={page >= totalPages || loading}
//                 onClick={() => setPage((p) => p + 1)}
//                 className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Cancel purchase modal */}
//       <CancelPurchase
//         isOpen={cancelModal.open}
//         onClose={closeCancelModal}
//         orderId={cancelModal.orderId}
//         linkId={cancelModal.linkId}
//         orderCode={cancelModal.orderCode}
//         linkInfo={cancelModal.linkInfo}
//         onSuccess={() => {
//           // 🔥 Optimistic update: cancel link
//           cancelLinkInState(cancelModal.orderId, cancelModal.linkId);
//           toast.success("Order link cancelled successfully.");
//         }}
//       />

//       {/* Detail purchase modal */}
//       {detailModal.open && (
//         <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
//           <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto">
//             <DetailPurchase
//               purchaseId={detailModal.purchaseId}
//               onClose={closeDetailModal}
//             />
//           </div>
//         </div>
//       )}

//       {/* Update purchase modal */}
//       {updateModal.open && updateModal.purchase && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
//           <UpdatePurchase
//             purchase={updateModal.purchase}
//             onClose={closeUpdateModal}
//             onUpdated={(updatedFields) => {
//               // 🔥 Optimistic update: merge updated fields
//               updatePurchaseInState(
//                 updateModal.purchase.purchaseId,
//                 updatedFields
//               );
//               toast.success("Purchase updated successfully!");
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// };
// export default PurchaserList;

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Package,
  Truck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  XCircle,
  Calendar,
  User,
  ShoppingCart,
  Eye,
  Edit3,
  FileText,
  Ship,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import toast from "react-hot-toast";
import orderlinkService from "../../Services/StaffPurchase/orderlinkService";
import CancelPurchase from "./CancelPurchase";
import DetailPurchase from "./DetailPurchase";
import UpdatePurchase from "./UpdatePurchase";

const PAGE_SIZES = [10, 20, 50, 100];

// Normalize shipment code
const normalizeShipmentCode = (code) => {
  if (!code) return "";
  if (typeof code === "string") {
    return code.replace(/^"+|"+$/g, "").trim();
  }
  return String(code).trim();
};

// Status configuration
const STATUS_CONFIG = {
  DA_MUA: {
    label: "Purchased",
    color: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
  },
  DAU_GIA_THANH_CONG: {
    label: "Auction won",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    dotColor: "bg-purple-500",
  },
  DA_NHAP_KHO_NN: {
    label: "Overseas warehouse",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    dotColor: "bg-blue-500",
  },
  DA_HUY: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    dotColor: "bg-red-500",
  },
};

const filters = [
  { value: "", label: "All", icon: Package },
  { value: "DA_MUA", label: "Purchased", icon: CheckCircle2 },
  { value: "DAU_GIA_THANH_CONG", label: "Auction won", icon: ShoppingCart },
  { value: "DA_NHAP_KHO_NN", label: "Overseas WH", icon: Truck },
  { value: "DA_HUY", label: "Cancelled", icon: XCircle },
];

/* ===================== Skeletons ===================== */
const CardSkeleton = () => (
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="animate-pulse">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-7 w-28 rounded-lg bg-white/70 border border-blue-100" />
            <div className="h-4 w-24 rounded bg-blue-100/70" />
          </div>
          <div className="flex gap-3">
            <div className="h-3 w-20 rounded bg-blue-100/70" />
            <div className="h-3 w-28 rounded bg-blue-100/70" />
          </div>
        </div>
      </div>
      <div className="p-6 space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-100" />
        <div className="h-4 w-2/3 rounded bg-gray-100" />
        <div className="h-4 w-1/2 rounded bg-gray-100" />
      </div>
    </div>
  </div>
);

const PurchaserList = () => {
  const [purchases, setPurchases] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [orderCodeSearch, setOrderCodeSearch] = useState("");
  const [customerCodeSearch, setCustomerCodeSearch] = useState("");
  const [shipmentCodeSearch, setShipmentCodeSearch] = useState("");
  const [filterOrderCode, setFilterOrderCode] = useState("");
  const [filterCustomerCode, setFilterCustomerCode] = useState("");
  const [filterShipmentCode, setFilterShipmentCode] = useState("");

  const [cancelModal, setCancelModal] = useState({
    open: false,
    orderId: null,
    linkId: null,
    orderCode: "",
    linkInfo: null,
  });

  const [detailModal, setDetailModal] = useState({
    open: false,
    purchaseId: null,
  });

  const [updateModal, setUpdateModal] = useState({
    open: false,
    purchase: null,
  });

  // Helper: Optimistic update purchase
  const updatePurchaseInState = (purchaseId, updatedFields) => {
    setPurchases((prev) =>
      prev.map((p) => {
        if (p.purchaseId === purchaseId) {
          const updated = {
            ...p,
            ...updatedFields,
          };

          if (updatedFields.shipmentCode !== undefined) {
            updated.pendingLinks = p.pendingLinks.map((link) => ({
              ...link,
              shipmentCode: updatedFields.shipmentCode,
            }));
          }

          if (updatedFields.imagePurchased !== undefined) {
            updated.purchaseImage = updatedFields.imagePurchased;
          }

          return updated;
        }
        return p;
      }),
    );
  };

  // Helper: Cancel link
  const cancelLinkInState = (orderId, linkId) => {
    setPurchases((prev) =>
      prev.map((p) => {
        if (p.orderId === orderId) {
          return {
            ...p,
            pendingLinks: p.pendingLinks.map((link) =>
              link.linkId === linkId ? { ...link, status: "DA_HUY" } : link,
            ),
          };
        }
        return p;
      }),
    );
  };

  // ✅ FIXED: Fetch function with empty dependencies
  const fetchData = useCallback(
    async (
      customPage = 1,
      customSize = 50,
      customFilter = "",
      filters = {},
    ) => {
      try {
        setLoading(true);
        setError(null);

        const requestFilters = {};

        if (customFilter) {
          requestFilters.status = customFilter;
        }

        if (filters.orderCode) {
          requestFilters.orderCode = filters.orderCode;
        }

        if (filters.customerCode) {
          requestFilters.customerCode = filters.customerCode;
        }

        if (filters.shipmentCode) {
          requestFilters.shipmentCode = filters.shipmentCode;
        }

        const res = await orderlinkService.getAllPurchases(
          customPage - 1,
          customSize,
          requestFilters,
        );

        // Remove duplicates based on purchaseId
        const uniquePurchases = (res?.content || []).reduce((acc, current) => {
          const exists = acc.find(
            (item) => item.purchaseId === current.purchaseId,
          );
          if (!exists) acc.push(current);
          return acc;
        }, []);

        setPurchases(uniquePurchases);
        setTotalPages(res?.totalPages || 1);
        setTotalElements(res?.totalElements || 0);
      } catch (e) {
        console.error(e);
        setError("Could not load purchase list.");
        toast.error("Error while loading purchase data.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ✅ FIXED: Only run ONCE on component mount
  useEffect(() => {
    fetchData(1, 50, "", {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPurchases = useMemo(() => {
    if (!searchTerm.trim()) return purchases;

    const term = searchTerm.toLowerCase();
    return purchases.filter(
      (p) =>
        p.purchaseCode?.toLowerCase().includes(term) ||
        p.orderCode?.toLowerCase().includes(term) ||
        p.staffName?.toLowerCase().includes(term) ||
        p.pendingLinks?.some(
          (link) =>
            link.productName?.toLowerCase().includes(term) ||
            link.trackingCode?.toLowerCase().includes(term) ||
            normalizeShipmentCode(link.shipmentCode)
              .toLowerCase()
              .includes(term),
        ),
    );
  }, [purchases, searchTerm]);

  const stats = useMemo(() => {
    let totalLinks = 0;
    let needShipmentCode = 0;
    let hasShipmentCode = 0;
    let missingShipmentCode = 0;

    purchases.forEach((p) => {
      (p.pendingLinks || []).forEach((link) => {
        totalLinks++;

        if (link.status === "DA_MUA" || link.status === "DAU_GIA_THANH_CONG") {
          needShipmentCode++;
          const code = normalizeShipmentCode(link.shipmentCode);
          if (code) hasShipmentCode++;
          else missingShipmentCode++;
        }
      });
    });

    return {
      totalLinks,
      needShipmentCode,
      hasShipmentCode,
      missingShipmentCode,
    };
  }, [purchases]);

  const handleRefresh = () => {
    const filters = {};
    if (filterOrderCode) filters.orderCode = filterOrderCode;
    if (filterCustomerCode) filters.customerCode = filterCustomerCode;
    if (filterShipmentCode) filters.shipmentCode = filterShipmentCode;
    fetchData(page, size, filter, filters);
    toast.success("Data refreshed.");
  };

  const handleSearch = () => {
    setFilterOrderCode(orderCodeSearch.trim());
    setFilterCustomerCode(customerCodeSearch.trim());
    setFilterShipmentCode(shipmentCodeSearch.trim());

    const filters = {};
    if (orderCodeSearch.trim()) filters.orderCode = orderCodeSearch.trim();
    if (customerCodeSearch.trim())
      filters.customerCode = customerCodeSearch.trim();
    if (shipmentCodeSearch.trim())
      filters.shipmentCode = shipmentCodeSearch.trim();

    setPage(1);
    fetchData(1, size, filter, filters);
  };

  const handleClearSearch = () => {
    setOrderCodeSearch("");
    setCustomerCodeSearch("");
    setShipmentCodeSearch("");
    setFilterOrderCode("");
    setFilterCustomerCode("");
    setFilterShipmentCode("");
    setPage(1);
    fetchData(1, size, filter, {});
  };

  const openCancelModal = (purchase, link) => {
    setCancelModal({
      open: true,
      orderId: purchase.orderId,
      linkId: link.linkId,
      orderCode: purchase.orderCode,
      linkInfo: link,
    });
  };

  const closeCancelModal = () => {
    setCancelModal((prev) => ({ ...prev, open: false }));
  };

  const openDetailModal = (purchaseId) => {
    setDetailModal({
      open: true,
      purchaseId,
    });
  };

  const closeDetailModal = () => {
    setDetailModal({
      open: false,
      purchaseId: null,
    });
  };

  const openUpdateModal = (purchase) => {
    setUpdateModal({
      open: true,
      purchase: {
        ...purchase,
        imagePurchased:
          purchase.imagePurchased ||
          purchase.purchaseImage ||
          purchase.pendingLinks?.[0]?.purchaseImage ||
          "",
      },
    });
  };

  const closeUpdateModal = () => {
    setUpdateModal({
      open: false,
      purchase: null,
    });
  };

  const handleFilterClick = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    const filters = {};
    if (filterOrderCode) filters.orderCode = filterOrderCode;
    if (filterCustomerCode) filters.customerCode = filterCustomerCode;
    if (filterShipmentCode) filters.shipmentCode = filterShipmentCode;
    fetchData(1, size, newFilter, filters);
  };

  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setPage(1);
    const filters = {};
    if (filterOrderCode) filters.orderCode = filterOrderCode;
    if (filterCustomerCode) filters.customerCode = filterCustomerCode;
    if (filterShipmentCode) filters.shipmentCode = filterShipmentCode;
    fetchData(1, newSize, filter, filters);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      const filters = {};
      if (filterOrderCode) filters.orderCode = filterOrderCode;
      if (filterCustomerCode) filters.customerCode = filterCustomerCode;
      if (filterShipmentCode) filters.shipmentCode = filterShipmentCode;
      fetchData(newPage, size, filter, filters);
    }
  };

  const handleFirstPage = () => handlePageChange(1);
  const handlePrevPage = () => handlePageChange(page - 1);
  const handleNextPage = () => handlePageChange(page + 1);
  const handleLastPage = () => handlePageChange(totalPages);

  const needsShipmentCode = (status) => {
    return status === "DA_MUA" || status === "DAU_GIA_THANH_CONG";
  };

  const showingFrom = totalElements ? (page - 1) * size + 1 : 0;
  const showingTo = Math.min(page * size, totalElements);

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Package size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Purchase Orders Management
              </h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-red-200 p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Inputs Row */}
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by Order Code..."
                    value={orderCodeSearch}
                    onChange={(e) => setOrderCodeSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {orderCodeSearch && (
                    <button
                      onClick={() => setOrderCodeSearch("")}
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
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by Customer Code..."
                    value={customerCodeSearch}
                    onChange={(e) => setCustomerCodeSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {customerCodeSearch && (
                    <button
                      onClick={() => setCustomerCodeSearch("")}
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
                  <Ship
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by Shipment Code..."
                    value={shipmentCodeSearch}
                    onChange={(e) => setShipmentCodeSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {shipmentCodeSearch && (
                    <button
                      onClick={() => setShipmentCodeSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                type="button"
              >
                <Search size={18} />
                Search
              </button>

              {(orderCodeSearch ||
                customerCodeSearch ||
                shipmentCodeSearch) && (
                <button
                  onClick={handleClearSearch}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all flex items-center gap-2"
                  type="button"
                >
                  <XCircle size={18} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter & Page Size Section */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {filters.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.value}
                    onClick={() => handleFilterClick(f.value)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      filter === f.value
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Display:
              </span>
              <div className="flex gap-2">
                {PAGE_SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handlePageSizeChange(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      size === s
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    type="button"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-sky-200 to-blue-400 p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                  Total purchases
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {purchases.length}
                </p>
              </div>
              <div className="rounded-xl bg-gray-100 p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-300 p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                  Total links
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.totalLinks}
                </p>
              </div>
              <div className="rounded-xl bg-gray-100 p-3">
                <Truck className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-green-200 to-emerald-100 p-5 shadow-sm border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-800">
                  With shipment code
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.hasShipmentCode}
                  <span className="text-lg font-medium text-gray-700">
                    /{stats.needShipmentCode}
                  </span>
                </p>
              </div>
              <div className="rounded-xl bg-gray-100 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-red-200 to-rose-100 p-5 shadow-sm border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-800">
                  Missing shipment code
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.missingShipmentCode}
                  <span className="text-lg font-medium text-gray-700">
                    /{stats.needShipmentCode}
                  </span>
                </p>
              </div>
              <div className="rounded-xl bg-gray-100 p-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading: skeleton list */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: Math.min(size, 10) }).map((_, idx) => (
              <CardSkeleton key={idx} />
            ))}
          </div>
        ) : (
          <>
            {/* Empty State */}
            {!error && filteredPurchases.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Package className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 font-medium">No purchase found</p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm
                    ? "Try searching with a different keyword."
                    : "There is no purchase record yet."}
                </p>
              </div>
            )}

            {/* Purchase List */}
            {!error && filteredPurchases.length > 0 && (
              <div className="space-y-4">
                {filteredPurchases.map((purchase) => (
                  <div
                    key={purchase.purchaseId}
                    className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Purchase Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-white border border-blue-200 px-3 py-1.5 text-sm font-bold text-blue-900 shadow-sm">
                            <ShoppingCart className="h-4 w-4" />
                            {purchase.purchaseCode}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            <span className="font-medium text-gray-900">
                              {purchase.staffName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-gray-900">
                              {purchase.purchaseTime
                                ? new Date(
                                    purchase.purchaseTime,
                                  ).toLocaleString("vi-VN", {
                                    dateStyle: "short",
                                  })
                                : "—"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                openDetailModal(purchase.purchaseId)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-900"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View detail
                            </button>

                            <button
                              onClick={() => openUpdateModal(purchase)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pending Links */}
                    <div className="p-6">
                      <div className="space-y-3">
                        {(purchase.pendingLinks || []).map((link, index) => {
                          const normalizedCode = normalizeShipmentCode(
                            link.shipmentCode,
                          );
                          const hasCode = !!normalizedCode;
                          const statusConfig = STATUS_CONFIG[link.status] || {
                            label: link.status,
                            color: "bg-gray-100 text-gray-800 border-gray-200",
                            dotColor: "bg-gray-500",
                          };
                          const requiresShipmentCode = needsShipmentCode(
                            link.status,
                          );

                          return (
                            <div
                              key={`${purchase.purchaseId}-${link.linkId}-${index}`}
                              className="group rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-white hover:shadow-sm transition-all"
                            >
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-semibold text-gray-900">
                                      {link.productName}
                                    </h4>
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig.color}`}
                                    >
                                      <span
                                        className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`}
                                      />
                                      {statusConfig.label}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                    {link.website && (
                                      <span>
                                        Website:{" "}
                                        <span className="font-medium text-gray-900">
                                          {link.website}
                                        </span>
                                      </span>
                                    )}
                                    <span>
                                      Qty:{" "}
                                      <span className="font-medium text-gray-900">
                                        {link.quantity}
                                      </span>
                                    </span>
                                    {purchase.orderCode && (
                                      <span className="flex items-center gap-1">
                                        OrderCode:{" "}
                                        <span className="font-medium text-blue-600">
                                          {purchase.orderCode}
                                        </span>
                                      </span>
                                    )}
                                    {link.classify && (
                                      <span>
                                        Category:{" "}
                                        <span className="font-medium text-gray-900">
                                          {link.classify}
                                        </span>
                                      </span>
                                    )}
                                    {purchase.purchaseCode && (
                                      <span>
                                        Price purchase:{" "}
                                        <span className="font-medium text-gray-900">
                                          {purchase.finalPriceOrder}
                                        </span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-start gap-3 lg:items-end">
                                  {requiresShipmentCode && (
                                    <div className="flex items-center gap-2">
                                      <Truck className="h-4 w-4 text-gray-400" />
                                      {hasCode ? (
                                        <div className="flex items-center gap-2">
                                          <span className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-mono font-semibold text-green-800">
                                            {normalizedCode}
                                          </span>
                                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Has code
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700">
                                          <AlertCircle className="h-3.5 w-3.5" />
                                          Missing shipment code
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {link.status !== "DA_HUY" && (
                                    <button
                                      onClick={() =>
                                        openCancelModal(purchase, link)
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                      Cancel link
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl mt-6">
            <div className="px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Info */}
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {showingFrom}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-gray-900">
                    {showingTo}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {totalElements}
                  </span>{" "}
                  purchases
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFirstPage}
                    disabled={page === 1}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="First page"
                    type="button"
                  >
                    <ChevronsLeft size={18} className="text-gray-700" />
                  </button>

                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    type="button"
                  >
                    <ChevronLeft size={18} className="text-gray-700" />
                    <span className="text-sm font-medium text-gray-700">
                      Previous
                    </span>
                  </button>

                  <div className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    <span className="text-sm font-semibold">
                      {page} / {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={page >= totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    type="button"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      Next
                    </span>
                    <ChevronRight size={18} className="text-gray-700" />
                  </button>

                  <button
                    onClick={handleLastPage}
                    disabled={page >= totalPages}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="Last page"
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

      {/* Cancel purchase modal */}
      <CancelPurchase
        isOpen={cancelModal.open}
        onClose={closeCancelModal}
        orderId={cancelModal.orderId}
        linkId={cancelModal.linkId}
        orderCode={cancelModal.orderCode}
        linkInfo={cancelModal.linkInfo}
        onSuccess={() => {
          cancelLinkInState(cancelModal.orderId, cancelModal.linkId);
          toast.success("Order link cancelled successfully.");
        }}
      />

      {/* Detail purchase modal */}
      {detailModal.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto">
            <DetailPurchase
              purchaseId={detailModal.purchaseId}
              onClose={closeDetailModal}
            />
          </div>
        </div>
      )}

      {/* Update purchase modal */}
      {updateModal.open && updateModal.purchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <UpdatePurchase
            purchase={updateModal.purchase}
            onClose={closeUpdateModal}
            onUpdated={(updatedFields) => {
              updatePurchaseInState(
                updateModal.purchase.purchaseId,
                updatedFields,
              );
              toast.success("Purchase updated successfully!");
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PurchaserList;
