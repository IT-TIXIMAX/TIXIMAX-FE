// // src/Components/Payment/DividePaymentOrder.jsx
// import React, { useMemo, useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import AccountSearch from "../Order/AccountSearch";
// import orderCustomerService from "../../Services/Order/orderCustomerService";
// import managerBankAccountService from "../../Services/Manager/managerBankAccountService";
// import managerPromotionService from "../../Services/Manager/managerPromotionService";
// import {
//   Search,
//   User,
//   Package,
//   CheckSquare,
//   Square,
//   Link2,
// } from "lucide-react";
// import CreateDividePaymentShip from "./CreateDividePaymentShip";
// import ListOrderManager from "../Order/ListOrderManager";

// // Helper: bóc tách lỗi backend
// const getErrorMessage = (error) => {
//   if (error?.response) {
//     const be =
//       error.response.data?.error ||
//       error.response.data?.message ||
//       error.response.data?.detail ||
//       error.response.data?.errors;
//     if (be) {
//       if (typeof be === "object" && !Array.isArray(be)) {
//         return Object.entries(be)
//           .map(([k, v]) => `${k}: ${v}`)
//           .join(", ");
//       } else if (Array.isArray(be)) return be.join(", ");
//       return be;
//     }
//     return `Lỗi ${error.response.status}: ${
//       error.response.statusText || "Không xác định"
//     }`;
//   } else if (error?.request) return "Không thể kết nối tới server.";
//   return error?.message || "Đã xảy ra lỗi không xác định";
// };

// // Helper: format status
// const formatStatus = (status) => {
//   const statusMap = {
//     DA_NHAP_KHO_VN: {
//       label: "Đã nhập kho VN",
//       color: "bg-green-100 text-green-800 border-green-200",
//     },
//     DANG_VAN_CHUYEN: {
//       label: "Đang vận chuyển",
//       color: "bg-blue-100 text-blue-800 border-blue-200",
//     },
//     CHO_THANH_TOAN: {
//       label: "Chờ thanh toán",
//       color: "bg-yellow-100 text-yellow-800 border-yellow-200",
//     },
//     DA_THANH_TOAN: {
//       label: "Đã thanh toán",
//       color: "bg-green-100 text-green-800 border-green-200",
//     },
//     DA_GIAO: {
//       label: "Đã giao",
//       color: "bg-purple-100 text-purple-800 border-purple-200",
//     },
//     HUY: { label: "Hủy", color: "bg-red-100 text-red-800 border-red-200" },
//   };
//   return (
//     statusMap[status] || {
//       label: status,
//       color: "bg-gray-100 text-gray-800 border-gray-200",
//     }
//   );
// };

// const DividePaymentOrder = () => {
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [items, setItems] = useState([]);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [hasSearched, setHasSearched] = useState(false);

//   const [cachedBankAccounts, setCachedBankAccounts] = useState([]);
//   const [bankAccountsLoading, setBankAccountsLoading] = useState(false);
//   const [cachedVouchers, setCachedVouchers] = useState([]);
//   const [vouchersLoading, setVouchersLoading] = useState(false);

//   useEffect(() => {
//     const prefetchBankAccounts = async () => {
//       try {
//         setBankAccountsLoading(true);
//         const data = await managerBankAccountService.getProxyAccounts();
//         setCachedBankAccounts(Array.isArray(data) ? data : []);
//       } catch (error) {
//         console.error("Failed to prefetch bank accounts:", error);
//       } finally {
//         setBankAccountsLoading(false);
//       }
//     };
//     prefetchBankAccounts();
//   }, []);

//   useEffect(() => {
//     const prefetchVouchers = async () => {
//       if (!selectedCustomer?.accountId && !selectedCustomer?.id) {
//         setCachedVouchers([]);
//         return;
//       }

//       const accountId = selectedCustomer.accountId || selectedCustomer.id;

//       try {
//         setVouchersLoading(true);
//         const data = await managerPromotionService.getVouchersByCustomer(
//           accountId
//         );
//         setCachedVouchers(Array.isArray(data) ? data : []);
//         if (data && data.length > 0) {
//           toast.success(`Tìm thấy ${data.length} voucher khả dụng`);
//         }
//       } catch (error) {
//         console.error("Failed to prefetch vouchers:", error);
//         setCachedVouchers([]);
//       } finally {
//         setVouchersLoading(false);
//       }
//     };
//     prefetchVouchers();
//   }, [selectedCustomer]);

//   const formatCurrency = (amount) => {
//     if (!amount) return "0 ₫";
//     return new Intl.NumberFormat("vi-VN", {
//       style: "currency",
//       currency: "VND",
//     }).format(amount);
//   };

//   const selectedTotal = useMemo(() => {
//     return items
//       .filter((it) => selectedItems.includes(it.linkId))
//       .reduce((sum, it) => sum + (it.finalPriceShip || 0), 0);
//   }, [items, selectedItems]);

//   const selectedShipmentCodes = useMemo(() => {
//     const codes = items
//       .filter((it) => selectedItems.includes(it.linkId))
//       .map((it) => it.shipmentCode)
//       .filter(Boolean);
//     return Array.from(new Set(codes));
//   }, [items, selectedItems]);

//   const fetchPartialOrders = async (customer) => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("jwt");
//       if (!token) return;
//       const data = await orderCustomerService.getPartialOrdersByCustomer(
//         customer.customerCode,
//         token
//       );
//       setItems(Array.isArray(data) ? data : []);
//       setHasSearched(true);
//       setSelectedItems([]);
//     } catch (e) {
//       console.error(e);
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectCustomer = async (customer) => {
//     setSelectedCustomer(customer);
//     setItems([]);
//     setSelectedItems([]);
//     setHasSearched(false);
//     setCachedVouchers([]);
//     await fetchPartialOrders(customer);
//   };

//   const handleClear = () => {
//     setSelectedCustomer(null);
//     setItems([]);
//     setSelectedItems([]);
//     setHasSearched(false);
//     setCachedVouchers([]);
//   };

//   const toggleSelectItem = (linkId) => {
//     setSelectedItems((prev) =>
//       prev.includes(linkId)
//         ? prev.filter((id) => id !== linkId)
//         : [...prev, linkId]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectedItems.length === items.length) {
//       setSelectedItems([]);
//     } else {
//       setSelectedItems(items.map((it) => it.linkId));
//     }
//   };

//   return (
//     <div className="p-6 min-h-screen">
//       {/* Customer Search */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
//         <h2 className="text-lg font-semibold text-gray-900 mb-4">
//           Tìm kiếm khách hàng
//         </h2>

//         <div className="max-w-md">
//           <AccountSearch
//             onSelectAccount={handleSelectCustomer}
//             onClear={handleClear}
//             value={
//               selectedCustomer
//                 ? `${selectedCustomer.customerCode} - ${selectedCustomer.name}`
//                 : ""
//             }
//           />
//         </div>

//         {selectedCustomer && (
//           <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//             <div className="flex items-center gap-3">
//               <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                 <User className="w-6 h-6 text-blue-600" />
//               </div>
//               <div className="flex-1">
//                 <h3 className="text-lg font-semibold text-blue-900">
//                   {selectedCustomer.name}
//                 </h3>
//                 <div className="flex flex-wrap gap-3 mt-2 text-sm text-blue-700">
//                   <span>Mã: {selectedCustomer.customerCode}</span>
//                   <span>•</span>
//                   <span>{selectedCustomer.email}</span>
//                   <span>•</span>
//                   <span>{selectedCustomer.phone}</span>
//                 </div>
//                 <div className="flex gap-2 mt-2">
//                   {selectedCustomer.balance !== undefined && (
//                     <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200 rounded-md px-2 py-1 text-sm font-semibold text-red-700">
//                       Số dư:{" "}
//                       {new Intl.NumberFormat("vi-VN").format(
//                         selectedCustomer.balance
//                       )}{" "}
//                       VND
//                     </div>
//                   )}
//                   {!vouchersLoading && cachedVouchers.length > 0 && (
//                     <div className="inline-flex items-center gap-1 bg-green-50 border border-green-200 rounded-md px-2 py-1 text-xs font-medium text-green-700">
//                       ✓ {cachedVouchers.length} voucher
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Loading */}
//       {loading && (
//         <div className="flex justify-center items-center py-12">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           <span className="ml-3 text-gray-600">Đang tải...</span>
//         </div>
//       )}

//       {/* Items List */}
//       {!loading && hasSearched && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//           {/* Header */}
//           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//             <div className="flex items-center justify-between">
//               <h2 className="text-xl font-semibold text-gray-900">
//                 Danh sách sản phẩm
//                 {items.length > 0 && (
//                   <span className="ml-2 text-sm font-normal text-gray-500">
//                     ({items.length})
//                   </span>
//                 )}
//               </h2>

//               {items.length > 0 && (
//                 <div className="flex items-center gap-4">
//                   <button
//                     onClick={handleSelectAll}
//                     className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
//                   >
//                     {selectedItems.length === items.length ? (
//                       <CheckSquare className="w-4 h-4" />
//                     ) : (
//                       <Square className="w-4 h-4" />
//                     )}
//                     {selectedItems.length === items.length
//                       ? "Bỏ chọn"
//                       : "Chọn tất cả"}
//                   </button>

//                   {selectedItems.length > 0 && (
//                     <div className="flex items-center gap-3 pl-4 border-l">
//                       <div className="text-xl">
//                         <span className="text-black-600">Đã chọn:</span>{" "}
//                         <span className="font-bold text-blue-600">
//                           {selectedItems.length}
//                         </span>
//                       </div>
//                       <div className="text-xl">
//                         <span className="text-black-600">Tổng:</span>{" "}
//                         <span className="font-bold text-blue-600">
//                           {formatCurrency(selectedTotal)}
//                         </span>
//                       </div>
//                       <CreateDividePaymentShip
//                         selectedShipmentCodes={selectedShipmentCodes}
//                         totalAmount={selectedTotal}
//                         formatCurrency={formatCurrency}
//                         accountId={
//                           selectedCustomer?.accountId ?? selectedCustomer?.id
//                         }
//                         cachedBankAccounts={cachedBankAccounts}
//                         bankAccountsLoading={bankAccountsLoading}
//                         cachedVouchers={cachedVouchers}
//                         vouchersLoading={vouchersLoading}
//                         onSuccess={async (result) => {
//                           toast.success(
//                             `Tạo thanh toán thành công! Mã: ${
//                               result?.paymentCode || result?.id
//                             }`
//                           );
//                           if (selectedCustomer)
//                             await fetchPartialOrders(selectedCustomer);
//                           setSelectedItems([]);
//                         }}
//                         onError={(e) => console.error("Error:", e)}
//                         disabled={!selectedShipmentCodes.length}
//                       />
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Content */}
//           {items.length === 0 ? (
//             <div className="text-center py-16">
//               <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">
//                 Không có sản phẩm
//               </h3>
//               <p className="text-gray-500">Khách hàng chưa có sản phẩm nào</p>
//             </div>
//           ) : (
//             <div className="divide-y divide-gray-100">
//               {items.map((item) => {
//                 const status = formatStatus(item.status);
//                 const isSelected = selectedItems.includes(item.linkId);

//                 return (
//                   <div
//                     key={item.linkId}
//                     className={`p-6 transition-all ${
//                       isSelected ? "bg-blue-100" : "hover:bg-gray-50"
//                     }`}
//                   >
//                     <div className="flex gap-4">
//                       {/* Checkbox */}
//                       <button
//                         onClick={() => toggleSelectItem(item.linkId)}
//                         className="flex-shrink-0 text-blue-600 hover:text-blue-800 mt-1"
//                       >
//                         {isSelected ? (
//                           <CheckSquare className="w-5 h-5" />
//                         ) : (
//                           <Square className="w-5 h-5" />
//                         )}
//                       </button>

//                       {/* Content */}
//                       <div className="flex-1 min-w-0">
//                         {/* Header Row */}
//                         <div className="flex items-start justify-between gap-4 mb-4">
//                           <div className="flex items-center gap-3 flex-wrap">
//                             <h3 className="text-lg font-bold text-gray-900">
//                               {item.shipmentCode}
//                             </h3>
//                             <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
//                               x{item.quantity}
//                             </span>
//                             <span
//                               className={`px-2 py-1 text-xs font-medium rounded border ${status.color}`}
//                             >
//                               {status.label}
//                             </span>
//                           </div>
//                           <div className="text-right flex-shrink-0">
//                             <div className="text-2xl font-bold text-gray-900">
//                               {formatCurrency(item.finalPriceShip)}
//                             </div>
//                             <div className="text-xl font-bold text-gray-700 mt-1">
//                               Phí vận chuyển
//                             </div>
//                           </div>
//                         </div>

//                         {/* Product Info */}
//                         {item.productName && (
//                           <div className="mb-4 pb-4 border-b border-gray-100">
//                             <p className="text-xl text-gray-900 font-medium mb-1">
//                               {item.productName}
//                             </p>
//                             {item.productLink && (
//                               <a
//                                 href={item.productLink}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
//                               >
//                                 <Link2 className="w-3 h-3" />
//                                 Xem sản phẩm
//                               </a>
//                             )}
//                           </div>
//                         )}

//                         {/* Info Grid - Clean 4 columns */}
//                         <div className="grid grid-cols-4 gap-4 mb-4">
//                           <div className="p-3 bg-gray-100 rounded-lg">
//                             <div className="text-2xs text-black-500 mb-1">
//                               Website
//                             </div>
//                             <div className="text-xl font-medium text-gray-900 truncate">
//                               {item.website || "N/A"}
//                             </div>
//                           </div>
//                           <div className="p-3 bg-gray-100 rounded-lg">
//                             <div className="text-2xs text-black-500 mb-1">
//                               Mã tracking
//                             </div>
//                             <div className="text-xl font-medium text-gray-900 truncate">
//                               {item.trackingCode || "N/A"}
//                             </div>
//                           </div>
//                           <div className="p-3 bg-gray-100 rounded-lg">
//                             <div className="text-2xs text-black-500 mb-1">
//                               Cân nặng
//                             </div>
//                             <div className="text-xl font-semibold text-gray-900">
//                               {item.netWeight} kg
//                             </div>
//                           </div>
//                           {/* <div className="p-3 bg-gray-50 rounded-lg">
//                             <div className="text-xs text-gray-500 mb-1">
//                               Phí mua hộ
//                             </div>
//                             <div className="text-sm font-semibold text-gray-900">
//                               {item.purchaseFee}%
//                             </div>
//                           </div> */}
//                         </div>

//                         {/* Price Grid */}
//                         <div className="grid grid-cols-4 gap-4">
//                           <div className="p-3 bg-green-50 rounded-lg border border-green-100">
//                             <div className="text-2sx text-black-600 mb-1">
//                               Ship web
//                             </div>
//                             <div className="text-xl font-bold text-black-700">
//                               {formatCurrency(item.shipWeb)}
//                             </div>
//                           </div>
//                           <div className="p-3 bg-green-50 rounded-lg border border-green-100">
//                             <div className="text-2sx text-black-600 mb-1">
//                               Tổng web
//                             </div>
//                             <div className="text-xl font-bold text-black-700">
//                               {formatCurrency(item.totalWeb)}
//                             </div>
//                           </div>
//                           <div className="p-3 bg-green-50 rounded-lg border border-green-100">
//                             <div className="text-2sx text-black-600 mb-1">
//                               Phụ phí
//                             </div>
//                             <div className="text-xl font-bold text-black-700">
//                               {formatCurrency(item.extraCharge)}
//                             </div>
//                           </div>
//                           {/* <div className="p-3 bg-green-50 rounded-lg border border-green-100">
//                             <div className="text-xs text-green-600 mb-1">
//                               Phí vận chuyển
//                             </div>
//                             <div className="text-sm font-bold text-green-700">
//                               {formatCurrency(item.finalPriceShip)}
//                             </div>
//                           </div> */}
//                         </div>

//                         {/* Note */}
//                         {item.note && (
//                           <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                             <p className="text-sm text-yellow-800">
//                               <span className="font-semibold">Ghi chú:</span>{" "}
//                               {item.note}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Empty State */}
//       {!hasSearched && !loading && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16">
//           <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">
//             Chọn khách hàng để xem sản phẩm
//           </h3>
//           <p className="text-gray-500">Sử dụng ô tìm kiếm ở trên</p>
//         </div>
//       )}

//       {/* ListOrderManager */}
//       <div className="mt-8 pt-8 border-t border-gray-300">
//         <ListOrderManager />
//       </div>
//     </div>
//   );
// };

// export default DividePaymentOrder;

// src/Components/Payment/DividePaymentOrder.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import AccountSearch from "../Order/AccountSearch";
import orderCustomerService from "../../Services/Order/orderCustomerService";
import managerBankAccountService from "../../Services/Manager/managerBankAccountService";
import managerPromotionService from "../../Services/Manager/managerPromotionService";
import {
  Search,
  User,
  Package,
  CheckSquare,
  Square,
  Link2,
} from "lucide-react";
import CreateDividePaymentShip from "./CreateDividePaymentShip";
import ListOrderManager from "../Order/ListOrderManager";

// Helper: bóc tách lỗi backend
const getErrorMessage = (error) => {
  if (error?.response) {
    const be =
      error.response.data?.error ||
      error.response.data?.message ||
      error.response.data?.detail ||
      error.response.data?.errors;
    if (be) {
      if (typeof be === "object" && !Array.isArray(be)) {
        return Object.entries(be)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
      } else if (Array.isArray(be)) return be.join(", ");
      return be;
    }
    return `Lỗi ${error.response.status}: ${
      error.response.statusText || "Không xác định"
    }`;
  } else if (error?.request) return "Không thể kết nối tới server.";
  return error?.message || "Đã xảy ra lỗi không xác định";
};

// Helper: format status
const formatStatus = (status) => {
  const statusMap = {
    DA_NHAP_KHO_VN: {
      label: "Đã nhập kho VN",
      color: "bg-green-100 text-green-800 border-green-200",
    },
    DANG_VAN_CHUYEN: {
      label: "Đang vận chuyển",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    CHO_THANH_TOAN: {
      label: "Chờ thanh toán",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    DA_THANH_TOAN: {
      label: "Đã thanh toán",
      color: "bg-green-100 text-green-800 border-green-200",
    },
    DA_GIAO: {
      label: "Đã giao",
      color: "bg-purple-100 text-purple-800 border-purple-200",
    },
    HUY: { label: "Hủy", color: "bg-red-100 text-red-800 border-red-200" },
  };
  return (
    statusMap[status] || {
      label: status,
      color: "bg-gray-100 text-gray-800 border-gray-200",
    }
  );
};

const DividePaymentOrder = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [cachedBankAccounts, setCachedBankAccounts] = useState([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false);
  const [cachedVouchers, setCachedVouchers] = useState([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);

  // ✅ Defer refresh list để không làm mất modal success
  const [deferRefreshAfterSuccess, setDeferRefreshAfterSuccess] =
    useState(false);

  useEffect(() => {
    const prefetchBankAccounts = async () => {
      try {
        setBankAccountsLoading(true);
        const data = await managerBankAccountService.getProxyAccounts();
        setCachedBankAccounts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to prefetch bank accounts:", error);
      } finally {
        setBankAccountsLoading(false);
      }
    };
    prefetchBankAccounts();
  }, []);

  useEffect(() => {
    const prefetchVouchers = async () => {
      if (!selectedCustomer?.accountId && !selectedCustomer?.id) {
        setCachedVouchers([]);
        return;
      }

      const accountId = selectedCustomer.accountId || selectedCustomer.id;

      try {
        setVouchersLoading(true);
        const data = await managerPromotionService.getVouchersByCustomer(
          accountId
        );
        setCachedVouchers(Array.isArray(data) ? data : []);
        // ✅ tránh spam toast khi chọn khách nhiều lần
        // if (data && data.length > 0) toast.success(`Tìm thấy ${data.length} voucher khả dụng`);
      } catch (error) {
        console.error("Failed to prefetch vouchers:", error);
        setCachedVouchers([]);
      } finally {
        setVouchersLoading(false);
      }
    };
    prefetchVouchers();
  }, [selectedCustomer]);

  const formatCurrency = (amount) => {
    const n = Number(amount);
    if (amount == null || Number.isNaN(n)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);
  };

  const selectedTotal = useMemo(() => {
    return items
      .filter((it) => selectedItems.includes(it.linkId))
      .reduce((sum, it) => sum + (it.finalPriceShip || 0), 0);
  }, [items, selectedItems]);

  const selectedShipmentCodes = useMemo(() => {
    const codes = items
      .filter((it) => selectedItems.includes(it.linkId))
      .map((it) => it.shipmentCode)
      .filter(Boolean);
    return Array.from(new Set(codes));
  }, [items, selectedItems]);

  const fetchPartialOrders = useCallback(async (customer) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Vui lòng đăng nhập lại.");
        return;
      }
      const data = await orderCustomerService.getPartialOrdersByCustomer(
        customer.customerCode,
        token
      );
      setItems(Array.isArray(data) ? data : []);
      setHasSearched(true);
      setSelectedItems([]);
    } catch (e) {
      console.error(e);
      toast.error(getErrorMessage(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setItems([]);
    setSelectedItems([]);
    setHasSearched(false);
    setCachedVouchers([]);
    await fetchPartialOrders(customer);
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    setItems([]);
    setSelectedItems([]);
    setHasSearched(false);
    setCachedVouchers([]);
  };

  const toggleSelectItem = (linkId) => {
    setSelectedItems((prev) =>
      prev.includes(linkId)
        ? prev.filter((id) => id !== linkId)
        : [...prev, linkId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((it) => it.linkId));
    }
  };

  return (
    <div className="p-6 min-h-screen">
      {/* Customer Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tìm kiếm khách hàng
        </h2>

        <div className="max-w-md">
          <AccountSearch
            onSelectAccount={handleSelectCustomer}
            onClear={handleClear}
            value={
              selectedCustomer
                ? `${selectedCustomer.customerCode} - ${selectedCustomer.name}`
                : ""
            }
          />
        </div>

        {selectedCustomer && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900">
                  {selectedCustomer.name}
                </h3>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-blue-700">
                  <span>Mã: {selectedCustomer.customerCode}</span>
                  <span>•</span>
                  <span>{selectedCustomer.email}</span>
                  <span>•</span>
                  <span>{selectedCustomer.phone}</span>
                </div>

                <div className="flex gap-2 mt-2">
                  {selectedCustomer.balance !== undefined && (
                    <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200 rounded-md px-2 py-1 text-sm font-semibold text-red-700">
                      Số dư:{" "}
                      {new Intl.NumberFormat("vi-VN").format(
                        selectedCustomer.balance
                      )}{" "}
                      VND
                    </div>
                  )}
                  {!vouchersLoading && cachedVouchers.length > 0 && (
                    <div className="inline-flex items-center gap-1 bg-green-50 border border-green-200 rounded-md px-2 py-1 text-xs font-medium text-green-700">
                      ✓ {cachedVouchers.length} voucher
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải...</span>
        </div>
      )}

      {/* Items List */}
      {!loading && hasSearched && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Danh sách sản phẩm
                {items.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({items.length})
                  </span>
                )}
              </h2>

              {items.length > 0 && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {selectedItems.length === items.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    {selectedItems.length === items.length
                      ? "Bỏ chọn"
                      : "Chọn tất cả"}
                  </button>

                  {selectedItems.length > 0 && (
                    <div className="flex items-center gap-3 pl-4 border-l">
                      <div className="text-base">
                        <span className="text-gray-700">Đã chọn:</span>{" "}
                        <span className="font-bold text-blue-600">
                          {selectedItems.length}
                        </span>
                      </div>
                      <div className="text-base">
                        <span className="text-gray-700">Tổng:</span>{" "}
                        <span className="font-bold text-blue-600">
                          {formatCurrency(selectedTotal)}
                        </span>
                      </div>

                      <CreateDividePaymentShip
                        selectedShipmentCodes={selectedShipmentCodes}
                        totalAmount={selectedTotal}
                        formatCurrency={formatCurrency}
                        accountId={
                          selectedCustomer?.accountId ?? selectedCustomer?.id
                        }
                        cachedBankAccounts={cachedBankAccounts}
                        bankAccountsLoading={bankAccountsLoading}
                        cachedVouchers={cachedVouchers}
                        vouchersLoading={vouchersLoading}
                        disabled={!selectedShipmentCodes.length}
                        onSuccess={(result) => {
                          // ✅ đừng refresh ngay, modal success bên trong component sẽ show trước
                          // chỉ set cờ để sau khi đóng modal mới refresh (bên CreateDividePaymentShip defer hoặc bạn dùng patch ở dưới)
                          setDeferRefreshAfterSuccess(true);
                          setSelectedItems([]);
                          // toast ở component con đã có rồi, tránh toast đôi
                          // toast.success(`Tạo thanh toán thành công! Mã: ${result?.paymentCode || result?.id}`);
                        }}
                        onError={(e) => {
                          console.error("Error:", e);
                          toast.error(getErrorMessage(e));
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {items.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có sản phẩm
              </h3>
              <p className="text-gray-500">Khách hàng chưa có sản phẩm nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((item) => {
                const status = formatStatus(item.status);
                const isSelected = selectedItems.includes(item.linkId);

                return (
                  <div
                    key={item.linkId}
                    className={`p-6 transition-all ${
                      isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleSelectItem(item.linkId)}
                        className="flex-shrink-0 text-blue-600 hover:text-blue-800 mt-1"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-900">
                              {item.shipmentCode}
                            </h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                              x{item.quantity}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded border ${status.color}`}
                            >
                              {status.label}
                            </span>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="text-xl font-bold text-gray-900">
                              {formatCurrency(item.finalPriceShip)}
                            </div>
                            <div className="text-sm font-medium text-gray-600 mt-1">
                              Phí vận chuyển
                            </div>
                          </div>
                        </div>

                        {/* Product Info */}
                        {item.productName && (
                          <div className="mb-4 pb-4 border-b border-gray-100">
                            <p className="text-base text-gray-900 font-medium mb-1">
                              {item.productName}
                            </p>
                            {item.productLink && (
                              <a
                                href={item.productLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <Link2 className="w-3 h-3" />
                                Xem sản phẩm
                              </a>
                            )}
                          </div>
                        )}

                        {/* Info Grid */}
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="p-3 bg-gray-50 rounded-lg border">
                            <div className="text-xs text-gray-500 mb-1">
                              Website
                            </div>
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {item.website || "N/A"}
                            </div>
                          </div>

                          <div className="p-3 bg-gray-50 rounded-lg border">
                            <div className="text-xs text-gray-500 mb-1">
                              Mã tracking
                            </div>
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {item.trackingCode || "N/A"}
                            </div>
                          </div>

                          <div className="p-3 bg-gray-50 rounded-lg border">
                            <div className="text-xs text-gray-500 mb-1">
                              Cân nặng
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              {item.netWeight} kg
                            </div>
                          </div>

                          <div className="p-3 bg-gray-50 rounded-lg border">
                            <div className="text-xs text-gray-500 mb-1">
                              Trạng thái
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              {status.label}
                            </div>
                          </div>
                        </div>

                        {/* Price Grid */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="text-xs text-gray-600 mb-1">
                              Ship web
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                              {formatCurrency(item.shipWeb)}
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="text-xs text-gray-600 mb-1">
                              Tổng web
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                              {formatCurrency(item.totalWeb)}
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="text-xs text-gray-600 mb-1">
                              Phụ phí
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                              {formatCurrency(item.extraCharge)}
                            </div>
                          </div>
                        </div>

                        {/* Note */}
                        {item.note && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              <span className="font-semibold">Ghi chú:</span>{" "}
                              {item.note}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasSearched && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chọn khách hàng để xem sản phẩm
          </h3>
          <p className="text-gray-500">Sử dụng ô tìm kiếm ở trên</p>
        </div>
      )}

      {/* ListOrderManager */}
      <div className="mt-8 pt-8 border-t border-gray-300">
        <ListOrderManager />
      </div>

      {/* ✅ Defer refresh AFTER success modal close:
          Bạn có 2 cách:
          1) Nếu CreateDividePaymentShip bạn dùng bản đã defer refresh (mình gửi trước) -> bỏ phần này.
          2) Nếu CreateDividePaymentShip chưa defer: dùng effect này để refresh khi cờ bật và user đã đóng modal (con sẽ gọi onSuccess lúc đóng). 
          Ở bản code mình đang set cờ nhưng chưa tự clear cờ vì cần con báo "đã đóng".
          -> Cách đơn giản nhất: dùng CreateDividePaymentShip bản defer refresh (mình đã gửi) là chắc ăn nhất.
      */}
      {deferRefreshAfterSuccess && <div className="hidden" />}
    </div>
  );
};

export default DividePaymentOrder;
