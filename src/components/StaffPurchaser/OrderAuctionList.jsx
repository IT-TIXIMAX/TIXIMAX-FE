// // src/Components/StaffPurchase/OrderAuctionList.jsx
// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Search,
//   Gavel,
//   Package,
//   ChevronLeft,
//   ChevronRight,
//   RefreshCw,
//   Eye,
//   Plus,
//   ChevronDown,
//   ChevronUp,
//   XCircle,
//   Star,
//   StarOff,
//   CheckSquare,
//   Square,
//   AlertCircle,
//   FileText,
//   User,
// } from "lucide-react";
// import toast from "react-hot-toast";
// import orderlinkService from "../../Services/StaffPurchase/orderlinkService";
// import DetailOrderLink from "./DetailOrderLink";
// import CreateAuctionPurchase from "./CreateAuctionPurchase";
// import CancelPurchase from "./CancelPurchase";
// import PinOrder from "./PinOrder";

// const OrderAuctionList = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedLinkId, setSelectedLinkId] = useState(null);
//   const [expandedOrders, setExpandedOrders] = useState({});
//   const [pagination, setPagination] = useState({
//     pageNumber: 0,
//     pageSize: 20,
//     totalPages: 0,
//     totalElements: 0,
//     first: true,
//     last: true,
//   });
//   const [showCreatePurchase, setShowCreatePurchase] = useState(false);
//   const [selectedOrderForPurchase, setSelectedOrderForPurchase] =
//     useState(null);

//   // ✅ Input states (đang gõ)
//   const [orderCodeSearch, setOrderCodeSearch] = useState("");
//   const [customerCodeSearch, setCustomerCodeSearch] = useState("");

//   // ✅ Applied filters (chỉ đổi khi bấm Search)
//   const [appliedFilters, setAppliedFilters] = useState({
//     orderCode: "",
//     customerCode: "",
//   });

//   // Selected links for auction purchase
//   const [selectedLinksForPurchase, setSelectedLinksForPurchase] = useState({});

//   // Cancel Purchase
//   const [showCancelPurchase, setShowCancelPurchase] = useState(false);
//   const [selectedLinkForCancel, setSelectedLinkForCancel] = useState(null);

//   // Pin Order
//   const [showPin, setShowPin] = useState(false);
//   const [pinCtx, setPinCtx] = useState(null);

//   // Calculate total price of selected links
//   const getSelectedTotal = (orderId, orderLinks) => {
//     const selections = selectedLinksForPurchase[orderId] || {};
//     const selectedLinkIds = Object.keys(selections);
//     if (selectedLinkIds.length === 0) return 0;

//     const selectedLinks = orderLinks.filter((link) =>
//       selectedLinkIds.includes(link.linkId.toString())
//     );

//     return selectedLinks.reduce(
//       (total, link) => total + (link.priceWeb || 0),
//       0
//     );
//   };

//   // ✅ fetchOrders nhận applied filters
//   const fetchOrders = useCallback(
//     async (page = 0, size = 20, filtersArg = {}) => {
//       try {
//         setLoading(true);
//         setError(null);

//         const filters = { orderType: "DAU_GIA" };

//         const orderCode = (filtersArg.orderCode || "").trim();
//         const customerCode = (filtersArg.customerCode || "").trim();

//         if (orderCode) filters.orderCode = orderCode;
//         if (customerCode) filters.customerCode = customerCode;

//         const response = await orderlinkService.getOrdersWithLinks(
//           page,
//           size,
//           filters
//         );

//         if (response?.content) {
//           setOrders(response.content);
//           setPagination({
//             pageNumber: response.number ?? page,
//             pageSize: response.size ?? size,
//             totalPages: response.totalPages ?? 0,
//             totalElements: response.totalElements ?? 0,
//             first: response.first ?? page === 0,
//             last: response.last ?? true,
//           });
//         } else {
//           setOrders([]);
//           setPagination((prev) => ({
//             ...prev,
//             pageNumber: page,
//             pageSize: size,
//             totalElements: 0,
//             totalPages: 0,
//             first: page === 0,
//             last: true,
//           }));
//         }
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//         const errorMessage =
//           error?.response?.data?.message ||
//           error?.message ||
//           "Unable to load auction orders.";
//         setError(errorMessage);
//         setOrders([]);
//       } finally {
//         setLoading(false);
//       }
//     },
//     []
//   );

//   // ✅ initial load (default list)
//   useEffect(() => {
//     fetchOrders(0, pagination.pageSize, { orderCode: "", customerCode: "" });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ✅ Auto load lại default khi 2 ô input trống
//   //    (nhập thì không search, chỉ bấm Search mới search)
//   useEffect(() => {
//     const inputsEmpty = !orderCodeSearch.trim() && !customerCodeSearch.trim();

//     const appliedHasSomething =
//       !!appliedFilters.orderCode.trim() || !!appliedFilters.customerCode.trim();

//     if (inputsEmpty && appliedHasSomething) {
//       const reset = { orderCode: "", customerCode: "" };
//       setAppliedFilters(reset);
//       fetchOrders(0, pagination.pageSize, reset);
//     }
//   }, [
//     orderCodeSearch,
//     customerCodeSearch,
//     appliedFilters,
//     fetchOrders,
//     pagination.pageSize,
//   ]);

//   // ✅ page change dùng appliedFilters (không dùng input đang gõ)
//   const handlePageChange = useCallback(
//     (newPage) => {
//       if (
//         newPage >= 0 &&
//         newPage < pagination.totalPages &&
//         newPage !== pagination.pageNumber
//       ) {
//         fetchOrders(newPage, pagination.pageSize, appliedFilters);
//       }
//     },
//     [
//       fetchOrders,
//       pagination.pageNumber,
//       pagination.pageSize,
//       pagination.totalPages,
//       appliedFilters,
//     ]
//   );

//   // ✅ bấm Search mới áp filter
//   const handleSearch = () => {
//     const next = {
//       orderCode: orderCodeSearch.trim(),
//       customerCode: customerCodeSearch.trim(),
//     };

//     const allEmpty = !next.orderCode && !next.customerCode;
//     const applied = allEmpty ? { orderCode: "", customerCode: "" } : next;

//     setAppliedFilters(applied);
//     fetchOrders(0, pagination.pageSize, applied);
//   };

//   const handleViewDetail = useCallback((linkId) => {
//     setSelectedLinkId(linkId);
//   }, []);

//   const handleCloseDetail = useCallback(() => {
//     setSelectedLinkId(null);
//   }, []);

//   const toggleExpandOrder = useCallback((orderId) => {
//     setExpandedOrders((prev) => ({
//       ...prev,
//       [orderId]: !prev[orderId],
//     }));
//   }, []);

//   // Toggle select link for auction
//   const toggleSelectLink = (orderId, linkId, trackingCode) => {
//     const currentSelections = selectedLinksForPurchase[orderId] || {};
//     const isCurrentlySelected = currentSelections[linkId];

//     if (isCurrentlySelected) {
//       const { [linkId]: removed, ...rest } = currentSelections;
//       setSelectedLinksForPurchase((prev) => ({
//         ...prev,
//         [orderId]: rest,
//       }));
//       return;
//     }

//     setSelectedLinksForPurchase((prev) => ({
//       ...prev,
//       [orderId]: {
//         ...currentSelections,
//         [linkId]: trackingCode,
//       },
//     }));
//   };

//   // Select all links in order
//   const selectAllLinksInOrder = (order, selectAll) => {
//     if (!selectAll) {
//       setSelectedLinksForPurchase((prev) => {
//         const { [order.orderId]: removed, ...rest } = prev;
//         return rest;
//       });
//       return;
//     }

//     const availableLinks = order.orderLinks.filter(
//       (link) => !["DA_MUA", "HUY", "DA_HUY"].includes(link.status)
//     );

//     if (availableLinks.length === 0) return;

//     const selections = {};
//     availableLinks.forEach((link) => {
//       selections[link.linkId] = link.trackingCode;
//     });

//     setSelectedLinksForPurchase((prev) => ({
//       ...prev,
//       [order.orderId]: selections,
//     }));
//   };

//   const handleCreatePurchase = useCallback(
//     (order) => {
//       if (!order.orderLinks?.length) return;

//       const selectedCount = Object.keys(
//         selectedLinksForPurchase[order.orderId] || {}
//       ).length;

//       if (selectedCount === 0) {
//         toast.error(
//           "Please select at least one item to create auction purchase."
//         );
//         return;
//       }

//       setSelectedOrderForPurchase(order);
//       setShowCreatePurchase(true);
//     },
//     [selectedLinksForPurchase]
//   );

//   const handleCloseCreatePurchase = useCallback(() => {
//     setShowCreatePurchase(false);
//     setSelectedOrderForPurchase(null);
//   }, []);

//   const handlePurchaseSuccess = useCallback(() => {
//     if (selectedOrderForPurchase) {
//       setSelectedLinksForPurchase((prev) => {
//         const { [selectedOrderForPurchase.orderId]: removed, ...rest } = prev;
//         return rest;
//       });
//     }
//     fetchOrders(pagination.pageNumber, pagination.pageSize, appliedFilters);
//   }, [
//     fetchOrders,
//     pagination.pageNumber,
//     pagination.pageSize,
//     selectedOrderForPurchase,
//     appliedFilters,
//   ]);

//   const handleCancelPurchase = useCallback((order, link) => {
//     setSelectedLinkForCancel({
//       orderId: order.orderId,
//       linkId: link.linkId,
//       orderCode: order.orderCode,
//       linkInfo: {
//         productName: link.productName,
//         trackingCode: link.trackingCode,
//         status: link.status,
//       },
//     });
//     setShowCancelPurchase(true);
//   }, []);

//   const handleCloseCancelPurchase = useCallback(() => {
//     setShowCancelPurchase(false);
//     setSelectedLinkForCancel(null);
//   }, []);

//   const handleCancelSuccess = useCallback(() => {
//     fetchOrders(pagination.pageNumber, pagination.pageSize, appliedFilters);
//   }, [fetchOrders, pagination.pageNumber, pagination.pageSize, appliedFilters]);

//   const openPin = useCallback((order) => {
//     setPinCtx({
//       orderId: order.orderId,
//       orderCode: order.orderCode,
//       pinned: !!order.pinnedAt,
//     });
//     setShowPin(true);
//   }, []);

//   const closePin = useCallback(() => {
//     setShowPin(false);
//     setPinCtx(null);
//   }, []);

//   const handlePinSuccess = useCallback((orderId, desiredPin) => {
//     setOrders((prev) =>
//       prev.map((o) => {
//         if (o.orderId !== orderId) return o;
//         return {
//           ...o,
//           pinnedAt: desiredPin ? o.pinnedAt || new Date().toISOString() : null,
//         };
//       })
//     );
//   }, []);

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleDateString("en-GB", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     });
//   };

//   const formatCurrency = (amount) => {
//     if (!amount && amount !== 0) return "N/A";
//     return new Intl.NumberFormat("vi-VN").format(amount);
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       CHO_MUA: "bg-yellow-100 text-yellow-800",
//       DANG_MUA: "bg-blue-100 text-blue-800",
//       DA_MUA: "bg-emerald-600 text-white",
//       HUY: "bg-red-100 text-red-800",
//       DA_HUY: "bg-red-600 text-white",
//       HOAT_DONG: "bg-green-100 text-green-800",
//       DAU_GIA_THANH_CONG: "bg-emerald-600 text-white",
//     };
//     return colors[status] || "bg-gray-100 text-gray-800";
//   };

//   const getStatusText = (status) => {
//     const texts = {
//       CHO_MUA: "Waiting to buy",
//       DANG_MUA: "Buying",
//       DA_MUA: "Purchased",
//       HUY: "Cancelled",
//       DA_HUY: "Cancelled",
//       HOAT_DONG: "Active",
//       DAU_GIA_THANH_CONG: "Auction won",
//     };
//     return texts[status] || status;
//   };

//   const handlePageSizeChange = (e) => {
//     const newSize = parseInt(e.target.value);
//     setPagination((prev) => ({ ...prev, pageSize: newSize }));
//     fetchOrders(0, newSize, appliedFilters);
//   };

//   const hasActiveSearch =
//     (appliedFilters.orderCode || "").trim() ||
//     (appliedFilters.customerCode || "").trim();

//   return (
//     <div className="min-h-screen px-4 py-6">
//       <div className="mx-auto">
//         {/* Header Section */}
//         <div className="mb-4">
//           <div className="bg-blue-600 rounded-xl shadow-sm p-4 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
//                 <Gavel className="h-5 w-5 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-white">
//                   Auction Orders (Links)
//                 </h1>
//               </div>
//             </div>
//             <button
//               onClick={() =>
//                 fetchOrders(
//                   pagination.pageNumber,
//                   pagination.pageSize,
//                   appliedFilters
//                 )
//               }
//               disabled={loading}
//               className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 disabled:opacity-60"
//             >
//               <RefreshCw
//                 className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
//               />
//               Refresh
//             </button>
//           </div>
//         </div>

//         {/* Error Messages */}
//         {error && (
//           <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
//             <div className="flex items-center">
//               <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
//               <div>
//                 <p className="text-red-700 text-sm">{error}</p>
//                 <button
//                   onClick={() =>
//                     fetchOrders(0, pagination.pageSize, appliedFilters)
//                   }
//                   className="text-red-600 hover:text-red-800 text-xs underline mt-1"
//                 >
//                   Try again
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Search Section */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
//           <div className="flex items-center gap-3">
//             <div className="relative flex-1">
//               <FileText className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//               <input
//                 type="text"
//                 placeholder="Search by Order Code (e.g., DG-001)..."
//                 value={orderCodeSearch}
//                 onChange={(e) => setOrderCodeSearch(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                 className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//               />
//             </div>

//             <div className="relative flex-1">
//               <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//               <input
//                 type="text"
//                 placeholder="Search by Customer Code (e.g., CH-0192)..."
//                 value={customerCodeSearch}
//                 onChange={(e) => setCustomerCodeSearch(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                 className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//               />
//             </div>

//             <button
//               onClick={handleSearch}
//               disabled={loading}
//               className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
//             >
//               <Search className="w-4 h-4" />
//               Search
//             </button>

//             <select
//               value={pagination.pageSize}
//               onChange={handlePageSizeChange}
//               disabled={loading}
//               className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 whitespace-nowrap"
//             >
//               <option value={20}>20 / page</option>
//               <option value={50}>50 / page</option>
//               <option value={100}>100 / page</option>
//               <option value={200}>200 / page</option>
//             </select>
//           </div>
//         </div>

//         {/* Loading State */}
//         {loading && (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
//             <div className="inline-flex items-center px-3 py-2 font-semibold leading-5 text-sm text-blue-600">
//               <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" />
//               Loading auction orders...
//             </div>
//           </div>
//         )}

//         {/* Empty State */}
//         {!loading && !error && orders.length === 0 && (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
//             <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//             <h3 className="text-base font-medium text-gray-900 mb-2">
//               No auction orders found
//             </h3>
//             <p className="text-gray-500 text-sm">
//               {hasActiveSearch
//                 ? "No orders match your search criteria."
//                 : "There are no auction orders in the system right now."}
//             </p>
//           </div>
//         )}

//         {/* Orders List */}
//         {orders.length > 0 && (
//           <div className="space-y-3">
//             {orders.map((order, index) => {
//               const isPinned = !!order.pinnedAt;
//               const availableLinks =
//                 order.orderLinks?.filter(
//                   (link) => !["DA_MUA", "HUY", "DA_HUY"].includes(link.status)
//                 ) || [];
//               const selectedCount = Object.keys(
//                 selectedLinksForPurchase[order.orderId] || {}
//               ).length;
//               const selectedTotal = getSelectedTotal(
//                 order.orderId,
//                 order.orderLinks || []
//               );
//               const isAllSelected =
//                 availableLinks.length > 0 &&
//                 availableLinks.every(
//                   (link) =>
//                     selectedLinksForPurchase[order.orderId]?.[link.linkId]
//                 );

//               return (
//                 <div
//                   key={order.orderId}
//                   className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
//                 >
//                   {/* Order Header */}
//                   <div
//                     className={`px-4 py-3 border-b border-gray-200 ${
//                       isPinned ? "bg-yellow-50" : "bg-gray-50"
//                     }`}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
//                           <span className="text-xs font-semibold text-blue-600">
//                             {pagination.pageNumber * pagination.pageSize +
//                               index +
//                               1}
//                           </span>
//                         </div>
//                         <div>
//                           <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
//                             {order.orderCode}
//                             <button
//                               onClick={() => openPin(order)}
//                               className={`inline-flex items-center justify-center rounded-full p-1 transition-colors ${
//                                 isPinned
//                                   ? "text-amber-600 hover:text-amber-700"
//                                   : "text-gray-400 hover:text-gray-600"
//                               }`}
//                               title={isPinned ? "Unpin order" : "Pin order"}
//                             >
//                               {isPinned ? (
//                                 <Star className="w-4 h-4" />
//                               ) : (
//                                 <StarOff className="w-4 h-4" />
//                               )}
//                             </button>
//                           </h3>
//                           <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
//                             <span className="font-medium">
//                               {formatDate(order.createdAt)}
//                             </span>
//                             <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
//                               Auction
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="text-right flex items-center gap-3">
//                         <div>
//                           <div className="text-base font-bold text-gray-900 flex items-center gap-1">
//                             {formatCurrency(order.finalPriceOrder)}
//                           </div>
//                           <div className="text-xs text-gray-500 font-semibold">
//                             Order total
//                           </div>
//                         </div>
//                         {availableLinks.length > 0 && (
//                           <button
//                             onClick={() => handleCreatePurchase(order)}
//                             disabled={selectedCount === 0}
//                             className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-medium hover:from-blue-600 hover:to-blue-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                           >
//                             <Plus className="w-3 h-3" />
//                             Auction purchase ({selectedCount})
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Selected Summary */}
//                   {selectedCount > 0 && (
//                     <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-50 border-b border-blue-200">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-2 text-sm">
//                           <span className="font-medium text-blue-900">
//                             Selected {selectedCount} auction item
//                             {selectedCount > 1 ? "s" : ""}
//                           </span>
//                         </div>
//                         <div className="text-right">
//                           <div className="text-xs text-gray-700 font-medium">
//                             Selected total:
//                           </div>
//                           <div className="text-lg font-bold text-blue-900">
//                             {formatCurrency(selectedTotal)}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Order Content */}
//                   <div className="p-4">
//                     {order.orderLinks?.length > 0 ? (
//                       <div>
//                         <div className="flex items-center justify-between mb-3">
//                           <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
//                             <Package className="w-3 h-3" />
//                             Items ({order.orderLinks.length})
//                           </h4>
//                           <div className="flex items-center gap-3">
//                             {availableLinks.length > 0 && (
//                               <button
//                                 onClick={() =>
//                                   selectAllLinksInOrder(order, !isAllSelected)
//                                 }
//                                 className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
//                               >
//                                 {isAllSelected ? (
//                                   <>
//                                     <CheckSquare className="w-3 h-3" />
//                                     Unselect all
//                                   </>
//                                 ) : (
//                                   <>
//                                     <Square className="w-3 h-3" />
//                                     Select all
//                                   </>
//                                 )}
//                               </button>
//                             )}
//                             {order.orderLinks.length > 2 && (
//                               <button
//                                 onClick={() => toggleExpandOrder(order.orderId)}
//                                 className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
//                               >
//                                 {expandedOrders[order.orderId] ? (
//                                   <>
//                                     <ChevronUp className="w-3 h-3" />
//                                     Show less
//                                   </>
//                                 ) : (
//                                   <>
//                                     <ChevronDown className="w-3 h-3" />
//                                     Show all
//                                   </>
//                                 )}
//                               </button>
//                             )}
//                           </div>
//                         </div>

//                         <div className="space-y-2">
//                           {(order.orderLinks.length <= 2 ||
//                           expandedOrders[order.orderId]
//                             ? order.orderLinks
//                             : order.orderLinks.slice(0, 2)
//                           ).map((link) => {
//                             const isDisabled = [
//                               "DA_MUA",
//                               "HUY",
//                               "DA_HUY",
//                             ].includes(link.status);
//                             const isSelected =
//                               selectedLinksForPurchase[order.orderId]?.[
//                                 link.linkId
//                               ];

//                             return (
//                               <div
//                                 key={link.linkId}
//                                 className={`border rounded-lg p-3 transition-all ${
//                                   isSelected
//                                     ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
//                                     : "bg-gradient-to-r from-gray-50 to-gray-50 border-gray-200"
//                                 } ${isDisabled ? "opacity-60" : ""}`}
//                               >
//                                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
//                                   {/* Checkbox Column */}
//                                   <div className="lg:col-span-1 flex items-center justify-center">
//                                     {!isDisabled ? (
//                                       <button
//                                         onClick={() =>
//                                           toggleSelectLink(
//                                             order.orderId,
//                                             link.linkId,
//                                             link.trackingCode
//                                           )
//                                         }
//                                         className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
//                                       >
//                                         {isSelected ? (
//                                           <CheckSquare className="w-6 h-6 text-blue-600" />
//                                         ) : (
//                                           <Square className="w-6 h-6 text-gray-400" />
//                                         )}
//                                         <span className="text-xs text-gray-600 font-medium">
//                                           {isSelected ? "Selected" : "Select"}
//                                         </span>
//                                       </button>
//                                     ) : (
//                                       <div className="flex flex-col items-center gap-2 p-2">
//                                         <XCircle className="w-6 h-6 text-gray-300" />
//                                         <span className="text-xs text-gray-400 text-center font-medium">
//                                           Not available
//                                         </span>
//                                       </div>
//                                     )}
//                                   </div>

//                                   {/* Product Info */}
//                                   <div className="lg:col-span-1">
//                                     <div className="font-medium text-black mb-1 text-xls">
//                                       {link.productName !== "string"
//                                         ? link.productName
//                                         : "Product name"}
//                                     </div>
//                                     <div className="space-y-0.5 text-xls text-black-600">
//                                       <div>
//                                         {link.website !== "string"
//                                           ? link.website
//                                           : "N/A"}
//                                       </div>
//                                       <div className="text-blue-600 font-medium">
//                                         {link.trackingCode}
//                                       </div>
//                                     </div>
//                                   </div>

//                                   {/* Pricing Info */}
//                                   <div className="lg:col-span-1">
//                                     <div className="space-y-0.5 text-xls">
//                                       <div className="text-black">
//                                         Qty:{" "}
//                                         <span className="font-medium">
//                                           {link.quantity}
//                                         </span>
//                                       </div>
//                                       <div className="text-black">
//                                         Item price:{" "}
//                                         <span className="font-medium">
//                                           {link.priceWeb?.toLocaleString() || 0}
//                                         </span>
//                                       </div>
//                                       <div className="text-black">
//                                         Shipping:{" "}
//                                         <span className="font-medium">
//                                           {link.shipWeb?.toLocaleString() || 0}
//                                         </span>
//                                       </div>
//                                     </div>
//                                   </div>

//                                   {/* Additional Info */}
//                                   <div className="lg:col-span-1">
//                                     <div className="space-y-0.5 text-xls text-black">
//                                       <div>
//                                         Variant:{" "}
//                                         <span className="font-medium">
//                                           {link.classify !== "string"
//                                             ? link.classify
//                                             : "N/A"}
//                                         </span>
//                                       </div>
//                                       <div>
//                                         Note:{" "}
//                                         <span className="font-medium">
//                                           {link.note || "N/A"}
//                                         </span>
//                                       </div>
//                                     </div>
//                                   </div>

//                                   {/* Actions & Status */}
//                                   <div className="lg:col-span-1 text-right">
//                                     <div className="text-sm font-semibold text-gray-900 mb-2">
//                                       {formatCurrency(link.priceWeb)}
//                                     </div>
//                                     <div className="flex flex-col gap-1.5 items-end">
//                                       <span
//                                         className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
//                                           link.status
//                                         )}`}
//                                       >
//                                         {getStatusText(link.status)}
//                                       </span>
//                                       <div className="flex gap-1.5">
//                                         <button
//                                           onClick={() =>
//                                             handleViewDetail(link.linkId)
//                                           }
//                                           className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-md text-xs hover:bg-blue-700 transition-colors"
//                                         >
//                                           <Eye className="w-2.5 h-2.5" />
//                                           Details
//                                         </button>

//                                         {link.status !== "HUY" &&
//                                           link.status !== "DA_MUA" && (
//                                             <button
//                                               onClick={() =>
//                                                 handleCancelPurchase(
//                                                   order,
//                                                   link
//                                                 )
//                                               }
//                                               className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
//                                               title="Cancel this item"
//                                             >
//                                               <XCircle className="w-2.5 h-2.5" />
//                                               Cancel
//                                             </button>
//                                           )}
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                         <div className="flex items-center gap-2">
//                           <Package className="w-4 h-4 text-yellow-600" />
//                           <span className="text-xs text-yellow-800">
//                             This order has no items yet.
//                           </span>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Pagination */}
//         {orders.length > 0 && (
//           <div className="flex items-center justify-between mt-4 bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
//             <button
//               onClick={() => handlePageChange(pagination.pageNumber - 1)}
//               disabled={pagination.first}
//               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
//                 pagination.first
//                   ? "text-gray-400 cursor-not-allowed"
//                   : "text-gray-700 hover:bg-gray-100"
//               }`}
//             >
//               <ChevronLeft className="w-4 h-4" />
//               Previous
//             </button>

//             <div className="flex items-center gap-1.5">
//               <span className="text-xs text-gray-500">Page</span>
//               <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
//                 {pagination.pageNumber + 1}
//               </span>
//               <span className="text-xs text-gray-500">
//                 / {pagination.totalPages}
//               </span>
//             </div>

//             <button
//               onClick={() => handlePageChange(pagination.pageNumber + 1)}
//               disabled={pagination.last}
//               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
//                 pagination.last
//                   ? "text-gray-400 cursor-not-allowed"
//                   : "text-gray-700 hover:bg-gray-100"
//               }`}
//             >
//               Next
//               <ChevronRight className="w-4 h-4" />
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Modals */}
//       <CreateAuctionPurchase
//         isOpen={showCreatePurchase}
//         onClose={handleCloseCreatePurchase}
//         orderCode={selectedOrderForPurchase?.orderCode}
//         selectedTrackingCodes={
//           selectedOrderForPurchase
//             ? Object.values(
//                 selectedLinksForPurchase[selectedOrderForPurchase.orderId] || {}
//               )
//             : []
//         }
//         selectedProducts={
//           selectedOrderForPurchase
//             ? selectedOrderForPurchase.orderLinks.filter((link) =>
//                 Object.keys(
//                   selectedLinksForPurchase[selectedOrderForPurchase.orderId] ||
//                     {}
//                 ).includes(link.linkId.toString())
//               )
//             : []
//         }
//         onSuccess={handlePurchaseSuccess}
//       />

//       <CancelPurchase
//         isOpen={showCancelPurchase}
//         onClose={handleCloseCancelPurchase}
//         orderId={selectedLinkForCancel?.orderId}
//         linkId={selectedLinkForCancel?.linkId}
//         orderCode={selectedLinkForCancel?.orderCode}
//         linkInfo={selectedLinkForCancel?.linkInfo}
//         onSuccess={handleCancelSuccess}
//       />

//       <PinOrder
//         isOpen={showPin}
//         onClose={closePin}
//         orderId={pinCtx?.orderId}
//         orderCode={pinCtx?.orderCode}
//         pinned={pinCtx?.pinned}
//         onSuccess={handlePinSuccess}
//       />

//       {selectedLinkId && (
//         <DetailOrderLink linkId={selectedLinkId} onClose={handleCloseDetail} />
//       )}
//     </div>
//   );
// };

// export default OrderAuctionList;

// src/Components/StaffPurchase/OrderAuctionList.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Gavel,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Plus,
  ChevronDown,
  ChevronUp,
  XCircle,
  Star,
  StarOff,
  CheckSquare,
  Square,
  AlertCircle,
  FileText,
  User,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import orderlinkService from "../../Services/StaffPurchase/orderlinkService";
import DetailOrderLink from "./DetailOrderLink";
import CreateAuctionPurchase from "./CreateAuctionPurchase";
import CancelPurchase from "./CancelPurchase";
import PinOrder from "./PinOrder";

const PAGE_SIZES = [10, 20, 50, 100];

/* ===================== HELPERS ===================== */
const toNum = (v) => {
  if (v == null) return 0;
  const n = Number(String(v).trim().replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

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

const OrderCardSkeleton = ({ rows = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse"
      >
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-gray-200 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-8 w-32 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

const OrderAuctionList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: true,
  });

  const [showCreatePurchase, setShowCreatePurchase] = useState(false);
  const [selectedOrderForPurchase, setSelectedOrderForPurchase] =
    useState(null);

  const [orderCodeSearch, setOrderCodeSearch] = useState("");
  const [customerCodeSearch, setCustomerCodeSearch] = useState("");
  const [filterOrderCode, setFilterOrderCode] = useState("");
  const [filterCustomerCode, setFilterCustomerCode] = useState("");

  const [selectedLinksForPurchase, setSelectedLinksForPurchase] = useState({});

  const [showCancelPurchase, setShowCancelPurchase] = useState(false);
  const [selectedLinkForCancel, setSelectedLinkForCancel] = useState(null);

  const [showPin, setShowPin] = useState(false);
  const [pinCtx, setPinCtx] = useState(null);

  const getSelectedTotal = (orderId, orderLinks) => {
    const selections = selectedLinksForPurchase[orderId] || {};
    const selectedLinkIds = Object.keys(selections);
    if (selectedLinkIds.length === 0) return 0;

    const selectedLinks = orderLinks.filter((link) =>
      selectedLinkIds.includes(link.linkId.toString()),
    );

    return selectedLinks.reduce(
      (total, link) => total + (link.priceWeb || 0),
      0,
    );
  };

  // ✅ FIXED: Fetch function với empty dependencies
  const fetchOrders = useCallback(async (page = 0, size = 20, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const requestFilters = {
        orderType: "DAU_GIA",
        ...filters,
      };

      const response = await orderlinkService.getOrdersWithLinks(
        page,
        size,
        requestFilters,
      );

      if (response?.content) {
        setOrders(response.content);
        setPagination({
          pageNumber: response.number ?? page,
          pageSize: response.size ?? size,
          totalPages: response.totalPages ?? 0,
          totalElements: response.totalElements ?? 0,
          first: response.first ?? page === 0,
          last: response.last ?? true,
        });
      } else {
        setOrders([]);
        setPagination((prev) => ({
          ...prev,
          totalElements: 0,
          totalPages: 0,
        }));
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load auction orders.";
      setError(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Empty dependencies

  // ✅ FIXED: Only run ONCE on component mount
  useEffect(() => {
    fetchOrders(0, 20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Empty array - intentionally run only once

  // ❌ REMOVED: Complex second useEffect

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newSize }));
    const filters = {};
    if (filterOrderCode) filters.orderCode = filterOrderCode;
    if (filterCustomerCode) filters.customerCode = filterCustomerCode;
    fetchOrders(0, newSize, filters);
  };

  const handleSearch = () => {
    setFilterOrderCode(orderCodeSearch.trim());
    setFilterCustomerCode(customerCodeSearch.trim());
    const filters = {};
    if (orderCodeSearch.trim()) filters.orderCode = orderCodeSearch.trim();
    if (customerCodeSearch.trim())
      filters.customerCode = customerCodeSearch.trim();
    fetchOrders(0, pagination.pageSize, filters);
  };

  const handlePageChange = useCallback(
    (newPage) => {
      if (
        newPage >= 0 &&
        newPage < pagination.totalPages &&
        newPage !== pagination.pageNumber
      ) {
        const filters = {};
        if (filterOrderCode) filters.orderCode = filterOrderCode;
        if (filterCustomerCode) filters.customerCode = filterCustomerCode;
        fetchOrders(newPage, pagination.pageSize, filters);
      }
    },
    [
      fetchOrders,
      pagination.pageNumber,
      pagination.pageSize,
      pagination.totalPages,
      filterOrderCode,
      filterCustomerCode,
    ],
  );

  const handleFirstPage = () => handlePageChange(0);
  const handlePrevPage = () => handlePageChange(pagination.pageNumber - 1);
  const handleNextPage = () => handlePageChange(pagination.pageNumber + 1);
  const handleLastPage = () => handlePageChange(pagination.totalPages - 1);

  const handleViewDetail = useCallback((linkId) => {
    setSelectedLinkId(linkId);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedLinkId(null);
  }, []);

  const toggleExpandOrder = useCallback((orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  }, []);

  const toggleSelectLink = (orderId, linkId, trackingCode) => {
    const currentSelections = selectedLinksForPurchase[orderId] || {};
    const isCurrentlySelected = currentSelections[linkId];

    if (isCurrentlySelected) {
      const { [linkId]: _removed, ...rest } = currentSelections;
      setSelectedLinksForPurchase((prev) => ({
        ...prev,
        [orderId]: rest,
      }));
      return;
    }

    setSelectedLinksForPurchase((prev) => ({
      ...prev,
      [orderId]: {
        ...currentSelections,
        [linkId]: trackingCode,
      },
    }));
  };

  const selectAllLinksInOrder = (order, selectAll) => {
    if (!selectAll) {
      setSelectedLinksForPurchase((prev) => {
        const { [order.orderId]: _removed, ...rest } = prev;
        return rest;
      });
      return;
    }

    const availableLinks = order.orderLinks.filter(
      (link) => !["DA_MUA", "HUY", "DA_HUY"].includes(link.status),
    );
    if (availableLinks.length === 0) return;

    const selections = {};
    availableLinks.forEach((link) => {
      selections[link.linkId] = link.trackingCode;
    });

    setSelectedLinksForPurchase((prev) => ({
      ...prev,
      [order.orderId]: selections,
    }));
  };

  const handleCreatePurchase = useCallback(
    (order) => {
      if (!order?.orderLinks?.length) return;

      const selectedCount = Object.keys(
        selectedLinksForPurchase[order.orderId] || {},
      ).length;

      if (selectedCount === 0) {
        toast.error(
          "Please select at least one item to create auction purchase.",
        );
        return;
      }

      setSelectedOrderForPurchase(order);
      setShowCreatePurchase(true);
    },
    [selectedLinksForPurchase],
  );

  const handleCloseCreatePurchase = useCallback(() => {
    setShowCreatePurchase(false);
    setSelectedOrderForPurchase(null);
  }, []);

  const handlePurchaseSuccess = useCallback(() => {
    if (selectedOrderForPurchase) {
      setSelectedLinksForPurchase((prev) => {
        const { [selectedOrderForPurchase.orderId]: _removed, ...rest } = prev;
        return rest;
      });
    }
    const filters = {};
    if (filterOrderCode) filters.orderCode = filterOrderCode;
    if (filterCustomerCode) filters.customerCode = filterCustomerCode;
    fetchOrders(pagination.pageNumber, pagination.pageSize, filters);
  }, [
    fetchOrders,
    pagination.pageNumber,
    pagination.pageSize,
    selectedOrderForPurchase,
    filterOrderCode,
    filterCustomerCode,
  ]);

  const handleCancelPurchase = useCallback((order, link) => {
    setSelectedLinkForCancel({
      orderId: order.orderId,
      linkId: link.linkId,
      orderCode: order.orderCode,
      linkInfo: {
        productName: link.productName,
        trackingCode: link.trackingCode,
        status: link.status,
      },
    });
    setShowCancelPurchase(true);
  }, []);

  const handleCloseCancelPurchase = useCallback(() => {
    setShowCancelPurchase(false);
    setSelectedLinkForCancel(null);
  }, []);

  const handleCancelSuccess = useCallback(() => {
    const filters = {};
    if (filterOrderCode) filters.orderCode = filterOrderCode;
    if (filterCustomerCode) filters.customerCode = filterCustomerCode;
    fetchOrders(pagination.pageNumber, pagination.pageSize, filters);
  }, [
    fetchOrders,
    pagination.pageNumber,
    pagination.pageSize,
    filterOrderCode,
    filterCustomerCode,
  ]);

  const openPin = useCallback((order) => {
    setPinCtx({
      orderId: order.orderId,
      orderCode: order.orderCode,
      pinned: !!order.pinnedAt,
    });
    setShowPin(true);
  }, []);

  const closePin = useCallback(() => {
    setShowPin(false);
    setPinCtx(null);
  }, []);

  const handlePinSuccess = useCallback((orderId, desiredPin) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId !== orderId) return o;
        return {
          ...o,
          pinnedAt: desiredPin ? o.pinnedAt || new Date().toISOString() : null,
        };
      }),
    );
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      CHO_MUA: "bg-yellow-100 text-yellow-800",
      DANG_MUA: "bg-blue-100 text-blue-800",
      DA_MUA: "bg-emerald-600 text-white",
      HUY: "bg-red-100 text-red-800",
      DA_HUY: "bg-red-600 text-white",
      HOAT_DONG: "bg-green-100 text-green-800",
      DAU_GIA_THANH_CONG: "bg-emerald-600 text-white",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      CHO_MUA: "Waiting to buy",
      DANG_MUA: "Buying",
      DA_MUA: "Purchased",
      HUY: "Cancelled",
      DA_HUY: "Cancelled",
      HOAT_DONG: "Active",
      DAU_GIA_THANH_CONG: "Auction won",
    };
    return texts[status] || status;
  };

  const totalPages = Math.max(
    1,
    Math.ceil(pagination.totalElements / pagination.pageSize),
  );
  const showingFrom = pagination.totalElements
    ? pagination.pageNumber * pagination.pageSize + 1
    : 0;
  const showingTo = Math.min(
    (pagination.pageNumber + 1) * pagination.pageSize,
    pagination.totalElements,
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Gavel size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Auction Orders (Links)
              </h1>
            </div>

            <button
              onClick={() => {
                const filters = {};
                if (filterOrderCode) filters.orderCode = filterOrderCode;
                if (filterCustomerCode)
                  filters.customerCode = filterCustomerCode;
                fetchOrders(
                  pagination.pageNumber,
                  pagination.pageSize,
                  filters,
                );
              }}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              Reload
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
                  onClick={() => {
                    const filters = {};
                    if (filterOrderCode) filters.orderCode = filterOrderCode;
                    if (filterCustomerCode)
                      filters.customerCode = filterCustomerCode;
                    fetchOrders(0, pagination.pageSize, filters);
                  }}
                  className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Section */}
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
                      onClick={() => {
                        setOrderCodeSearch("");
                        setFilterOrderCode("");
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
                      onClick={() => {
                        setCustomerCodeSearch("");
                        setFilterCustomerCode("");
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
                  Search
                </button>
              </div>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center justify-end gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Display:
              </span>
              <div className="flex gap-2">
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handlePageSizeChange(size)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      pagination.pageSize === size
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

        {/* Loading State */}
        {loading && <OrderCardSkeleton rows={5} />}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Gavel className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 font-medium">No auction orders found</p>
            <p className="text-sm text-gray-500 mt-1">
              {orderCodeSearch || customerCodeSearch
                ? "No orders match your search criteria."
                : "There are no auction orders in the system."}
            </p>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const isPinned = !!order.pinnedAt;
              const availableLinks =
                order.orderLinks?.filter(
                  (link) => !["DA_MUA", "HUY", "DA_HUY"].includes(link.status),
                ) || [];
              const selectedCount = Object.keys(
                selectedLinksForPurchase[order.orderId] || {},
              ).length;

              const selectedTotal = getSelectedTotal(
                order.orderId,
                order.orderLinks || [],
              );

              const isAllSelected =
                availableLinks.length > 0 &&
                availableLinks.every(
                  (link) =>
                    selectedLinksForPurchase[order.orderId]?.[link.linkId],
                );

              return (
                <div
                  key={order.orderId}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Order Header */}
                  <div
                    className={`px-4 py-3 border-b border-gray-200 ${
                      isPinned ? "bg-yellow-50" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-600">
                            {pagination.pageNumber * pagination.pageSize +
                              index +
                              1}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            {order.orderCode}
                            <button
                              onClick={() => openPin(order)}
                              className={`inline-flex items-center justify-center rounded-full p-1 transition-colors ${
                                isPinned
                                  ? "text-amber-600 hover:text-amber-700"
                                  : "text-gray-400 hover:text-gray-600"
                              }`}
                              title={isPinned ? "Unpin order" : "Pin order"}
                            >
                              {isPinned ? (
                                <Star className="w-4 h-4" />
                              ) : (
                                <StarOff className="w-4 h-4" />
                              )}
                            </button>
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                            <span className="font-medium">
                              {formatDate(order.createdAt)}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              Auction
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-base font-bold text-gray-900">
                            {formatCurrency(order.finalPriceOrder)}
                          </div>
                          <div className="text-xs text-gray-500 font-semibold">
                            Order total
                          </div>
                        </div>
                        {availableLinks.length > 0 && (
                          <button
                            onClick={() => handleCreatePurchase(order)}
                            disabled={selectedCount === 0}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-medium hover:from-blue-600 hover:to-blue-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            <Plus className="w-3 h-3" />
                            Auction purchase ({selectedCount})
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Selected Summary */}
                  {selectedCount > 0 && (
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-50 border-b border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-blue-900">
                            Selected {selectedCount} auction item
                            {selectedCount > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-700 font-medium">
                            Selected total:
                          </div>
                          <div className="text-lg font-bold text-blue-900">
                            {formatCurrency(selectedTotal)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Content */}
                  <div className="p-4">
                    {order.orderLinks?.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                            <Package className="w-3 h-3" />
                            Items ({order.orderLinks.length})
                          </h4>
                          <div className="flex items-center gap-3">
                            {availableLinks.length > 0 && (
                              <button
                                onClick={() =>
                                  selectAllLinksInOrder(order, !isAllSelected)
                                }
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                              >
                                {isAllSelected ? (
                                  <>
                                    <CheckSquare className="w-3 h-3" />
                                    Unselect all
                                  </>
                                ) : (
                                  <>
                                    <Square className="w-3 h-3" />
                                    Select all
                                  </>
                                )}
                              </button>
                            )}
                            {order.orderLinks.length > 2 && (
                              <button
                                onClick={() => toggleExpandOrder(order.orderId)}
                                className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                              >
                                {expandedOrders[order.orderId] ? (
                                  <>
                                    <ChevronUp className="w-3 h-3" />
                                    Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3 h-3" />
                                    Show all
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {(order.orderLinks.length <= 2 ||
                          expandedOrders[order.orderId]
                            ? order.orderLinks
                            : order.orderLinks.slice(0, 2)
                          ).map((link) => {
                            const isDisabled = [
                              "DA_MUA",
                              "HUY",
                              "DA_HUY",
                            ].includes(link.status);
                            const isSelected =
                              selectedLinksForPurchase[order.orderId]?.[
                                link.linkId
                              ];

                            return (
                              <div
                                key={link.linkId}
                                className={`border rounded-lg p-3 transition-all ${
                                  isSelected
                                    ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                                    : "bg-gradient-to-r from-gray-50 to-gray-50 border-gray-200"
                                } ${isDisabled ? "opacity-60" : ""}`}
                              >
                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                                  {/* Checkbox Column */}
                                  <div className="lg:col-span-1 flex items-center justify-center">
                                    {!isDisabled ? (
                                      <button
                                        onClick={() =>
                                          toggleSelectLink(
                                            order.orderId,
                                            link.linkId,
                                            link.trackingCode,
                                          )
                                        }
                                        className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                      >
                                        {isSelected ? (
                                          <CheckSquare className="w-6 h-6 text-blue-600" />
                                        ) : (
                                          <Square className="w-6 h-6 text-gray-400" />
                                        )}
                                        <span className="text-xs text-gray-600 font-medium">
                                          {isSelected ? "Selected" : "Select"}
                                        </span>
                                      </button>
                                    ) : (
                                      <div className="flex flex-col items-center gap-2 p-2">
                                        <XCircle className="w-6 h-6 text-gray-300" />
                                        <span className="text-xs text-gray-400 text-center font-medium">
                                          Not available
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Product Info */}
                                  <div className="lg:col-span-1">
                                    <div className="font-medium text-black mb-1 text-sm">
                                      {link.productName !== "string"
                                        ? link.productName
                                        : "Product name"}
                                    </div>
                                    <div className="space-y-0.5 text-xs text-gray-600">
                                      <div>
                                        {link.website !== "string"
                                          ? link.website
                                          : "N/A"}
                                      </div>
                                      <div className="text-blue-600 font-medium">
                                        {link.trackingCode}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Pricing Info */}
                                  <div className="lg:col-span-1">
                                    <div className="space-y-0.5 text-xs text-gray-600">
                                      <div>
                                        Qty:{" "}
                                        <span className="font-medium">
                                          {link.quantity}
                                        </span>
                                      </div>
                                      <div>
                                        Item price:{" "}
                                        <span className="font-medium">
                                          {link.priceWeb?.toLocaleString() || 0}
                                        </span>
                                      </div>
                                      <div>
                                        Shipping:{" "}
                                        <span className="font-medium">
                                          {link.shipWeb?.toLocaleString() || 0}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Additional Info */}
                                  <div className="lg:col-span-1">
                                    <div className="space-y-0.5 text-xs text-gray-600">
                                      <div>
                                        Variant:{" "}
                                        <span className="font-medium">
                                          {link.classify !== "string"
                                            ? link.classify
                                            : "N/A"}
                                        </span>
                                      </div>
                                      <div>
                                        Note:{" "}
                                        <span className="font-medium">
                                          {link.note || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions & Status */}
                                  <div className="lg:col-span-1 text-right">
                                    <div className="text-sm font-semibold text-gray-900 mb-2">
                                      {formatCurrency(link.priceWeb)}
                                    </div>
                                    <div className="flex flex-col gap-1.5 items-end">
                                      <span
                                        className={`inline-block px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                          link.status,
                                        )}`}
                                      >
                                        {getStatusText(link.status)}
                                      </span>
                                      <div className="flex gap-1.5">
                                        <button
                                          onClick={() =>
                                            handleViewDetail(link.linkId)
                                          }
                                          className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-md text-xs hover:bg-blue-700 transition-colors"
                                        >
                                          <Eye className="w-2.5 h-2.5" />
                                          Details
                                        </button>

                                        {link.status !== "HUY" &&
                                          link.status !== "DA_MUA" && (
                                            <button
                                              onClick={() =>
                                                handleCancelPurchase(
                                                  order,
                                                  link,
                                                )
                                              }
                                              className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors"
                                              title="Cancel this item"
                                            >
                                              <XCircle className="w-2.5 h-2.5" />
                                              Cancel
                                            </button>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs text-yellow-800">
                            This order has no items yet.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
                    {pagination.totalElements}
                  </span>{" "}
                  orders
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFirstPage}
                    disabled={pagination.pageNumber === 0}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    title="First page"
                    type="button"
                  >
                    <ChevronsLeft size={18} className="text-gray-700" />
                  </button>

                  <button
                    onClick={handlePrevPage}
                    disabled={pagination.pageNumber === 0}
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
                      {pagination.pageNumber + 1} / {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={pagination.pageNumber >= totalPages - 1}
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
                    disabled={pagination.pageNumber >= totalPages - 1}
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

      {/* Modals */}
      <CreateAuctionPurchase
        isOpen={showCreatePurchase}
        onClose={handleCloseCreatePurchase}
        orderCode={selectedOrderForPurchase?.orderCode}
        selectedTrackingCodes={
          selectedOrderForPurchase
            ? Object.values(
                selectedLinksForPurchase[selectedOrderForPurchase.orderId] ||
                  {},
              )
            : []
        }
        selectedProducts={
          selectedOrderForPurchase
            ? selectedOrderForPurchase.orderLinks.filter((link) =>
                Object.keys(
                  selectedLinksForPurchase[selectedOrderForPurchase.orderId] ||
                    {},
                ).includes(link.linkId.toString()),
              )
            : []
        }
        onSuccess={handlePurchaseSuccess}
      />

      <CancelPurchase
        isOpen={showCancelPurchase}
        onClose={handleCloseCancelPurchase}
        orderId={selectedLinkForCancel?.orderId}
        linkId={selectedLinkForCancel?.linkId}
        orderCode={selectedLinkForCancel?.orderCode}
        linkInfo={selectedLinkForCancel?.linkInfo}
        onSuccess={handleCancelSuccess}
      />

      <PinOrder
        isOpen={showPin}
        onClose={closePin}
        orderId={pinCtx?.orderId}
        orderCode={pinCtx?.orderCode}
        pinned={pinCtx?.pinned}
        onSuccess={handlePinSuccess}
      />

      {selectedLinkId && (
        <DetailOrderLink linkId={selectedLinkId} onClose={handleCloseDetail} />
      )}
    </div>
  );
};

export default OrderAuctionList;
