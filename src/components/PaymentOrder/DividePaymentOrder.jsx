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

/* ---------------- helpers ---------------- */
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
      }
      if (Array.isArray(be)) return be.join(", ");
      return be;
    }
    return `Lỗi ${error.response.status}: ${
      error.response.statusText || "Không xác định"
    }`;
  }
  if (error?.request) return "Không thể kết nối tới server.";
  return error?.message || "Đã xảy ra lỗi không xác định";
};

const STATUS_MAP = {
  DA_NHAP_KHO_VN: {
    label: "Đã nhập kho VN",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  DANG_VAN_CHUYEN: {
    label: "Đang vận chuyển",
    color: "bg-blue-50 text-blue-800 border-blue-200",
  },
  CHO_THANH_TOAN: {
    label: "Chờ thanh toán",
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  DA_THANH_TOAN: {
    label: "Đã thanh toán",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  DA_GIAO: {
    label: "Đã giao",
    color: "bg-violet-50 text-violet-800 border-violet-200",
  },
  HUY: {
    label: "Hủy",
    color: "bg-rose-50 text-rose-800 border-rose-200",
  },
};

const formatStatus = (status) =>
  STATUS_MAP[status] || {
    label: status,
    color: "bg-slate-50 text-slate-800 border-slate-200",
  };

const safeText = (v, fallback = "—") =>
  v == null || v === "" ? fallback : String(v);

const formatKg = (v) => {
  const n = Number(v);
  if (v == null || Number.isNaN(n)) return "—";
  return `${n} kg`;
};

const formatCurrency = (amount) => {
  const n = Number(amount);
  if (amount == null || Number.isNaN(n)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
};

/* ---------------- component ---------------- */
const DividePaymentOrder = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedSet, setSelectedSet] = useState(() => new Set()); // ✅ tối ưu
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [cachedBankAccounts, setCachedBankAccounts] = useState([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false);

  const [cachedVouchers, setCachedVouchers] = useState([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);

  // Prefetch bank accounts (1 lần)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setBankAccountsLoading(true);
        const data = await managerBankAccountService.getProxyAccounts();
        if (mounted) setCachedBankAccounts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to prefetch bank accounts:", error);
      } finally {
        if (mounted) setBankAccountsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Prefetch vouchers khi đổi customer
  useEffect(() => {
    let mounted = true;

    (async () => {
      const accountId = selectedCustomer?.accountId ?? selectedCustomer?.id;
      if (!accountId) {
        setCachedVouchers([]);
        return;
      }

      try {
        setVouchersLoading(true);
        const data = await managerPromotionService.getVouchersByCustomer(
          accountId
        );
        if (mounted) setCachedVouchers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to prefetch vouchers:", error);
        if (mounted) setCachedVouchers([]);
      } finally {
        if (mounted) setVouchersLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedCustomer]);

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
      setSelectedSet(new Set());
    } catch (e) {
      console.error(e);
      toast.error(getErrorMessage(e));
      setItems([]);
      setSelectedSet(new Set());
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setItems([]);
    setSelectedSet(new Set());
    setHasSearched(false);
    setCachedVouchers([]);
    await fetchPartialOrders(customer);
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    setItems([]);
    setSelectedSet(new Set());
    setHasSearched(false);
    setCachedVouchers([]);
  };

  const toggleSelectItem = useCallback((linkId) => {
    setSelectedSet((prev) => {
      const next = new Set(prev);
      next.has(linkId) ? next.delete(linkId) : next.add(linkId);
      return next;
    });
  }, []);

  const selectedCount = selectedSet.size;

  const allSelected = items.length > 0 && selectedCount === items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedSet(new Set());
      return;
    }
    setSelectedSet(new Set(items.map((it) => it.linkId)));
  };

  const selectedTotal = useMemo(() => {
    if (selectedSet.size === 0) return 0;
    let sum = 0;
    for (const it of items) {
      if (selectedSet.has(it.linkId)) sum += it.finalPriceShip || 0;
    }
    return sum;
  }, [items, selectedSet]);

  const selectedShipmentCodes = useMemo(() => {
    if (selectedSet.size === 0) return [];
    const s = new Set();
    for (const it of items) {
      if (selectedSet.has(it.linkId) && it.shipmentCode) s.add(it.shipmentCode);
    }
    return Array.from(s);
  }, [items, selectedSet]);

  return (
    <div className="min-h-screen p-4 sm:p-6">
      {/* Customer Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 mb-5">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">
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

        {/* Selected Customer Info */}
        {selectedCustomer && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-blue-900">
                  {selectedCustomer.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-blue-700">
                  <div>
                    <span className="font-medium">Mã KH:</span>{" "}
                    {selectedCustomer.customerCode}
                  </div>

                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedCustomer.email}
                  </div>
                  <div>
                    <span className="font-medium">SĐT:</span>{" "}
                    {selectedCustomer.phone}
                  </div>
                  <div className="inline-flex items-center gap-1 bg-red-50 border border-red-200 rounded-md px-2 py-1 text-sm font-semibold text-red-700 shadow-sm w-auto max-w-max">
                    <span className="font-medium">Số dư:</span>{" "}
                    {new Intl.NumberFormat("vi-VN").format(
                      selectedCustomer.balance
                    )}{" "}
                    VND
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-blue-600" />
          <span className="ml-3 text-slate-600">Đang tải...</span>
        </div>
      )}

      {/* Items List */}
      {!loading && hasSearched && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Danh sách sản phẩm
                  {items.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      ({items.length})
                    </span>
                  )}
                </h2>

                {items.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    {allSelected ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    {allSelected ? "Chọn tất cả" : "Chọn tất cả"}
                  </button>
                )}
              </div>

              {items.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                    Đã chọn:{" "}
                    <span className="ml-1 font-bold text-blue-700">
                      {selectedCount}
                    </span>
                  </span>

                  <span className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                    Tổng:{" "}
                    <span className="ml-1 font-bold text-blue-700">
                      {formatCurrency(selectedTotal)}
                    </span>
                  </span>
                </div>
              )}

              {items.length > 0 && (
                <div className="lg:ml-auto">
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
                    disabled={selectedCount === 0}
                    onSuccess={() => {
                      // giữ behavior: success -> clear selection, không reload list
                      setSelectedSet(new Set());
                    }}
                    onError={(e) => {
                      console.error("Error:", e);
                      toast.error(getErrorMessage(e));
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-14">
              <Package className="w-14 h-14 text-slate-300 mx-auto mb-3" />
              <div className="text-base font-semibold text-slate-900">
                Không có sản phẩm
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const status = formatStatus(item.status);
                const isSelected = selectedSet.has(item.linkId);

                return (
                  <div
                    key={item.linkId}
                    className={`px-4 sm:px-5 py-4 transition ${
                      isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                    onClick={() => toggleSelectItem(item.linkId)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectItem(item.linkId);
                        }}
                        className="mt-0.5 text-blue-700 hover:text-blue-900"
                        aria-label="toggle"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="min-w-0 flex flex-wrap items-center gap-2">
                            <div className="font-bold text-slate-900 truncate">
                              {safeText(item.shipmentCode)}
                            </div>

                            <span
                              className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold ${status.color}`}
                            >
                              {status.label}
                            </span>

                            <span className="inline-flex items-center rounded-lg bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                              x{safeText(item.quantity, 0)}
                            </span>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            <div className="text-base sm:text-lg font-bold text-slate-900">
                              {formatCurrency(item.finalPriceShip)}
                            </div>
                            <div className="text-sm text-slate-600">
                              Phí vận chuyển
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                          <span>
                            <span className="text-black">Tracking:</span>{" "}
                            <span className="font-medium text-slate-800">
                              {safeText(item.trackingCode)}
                            </span>
                          </span>
                          <span>
                            <span className="text-black">Cân nặng:</span>{" "}
                            <span className="font-medium text-slate-800">
                              {formatKg(item.netWeight)}
                            </span>
                          </span>
                          <span>
                            <span className="text-black">Website:</span>{" "}
                            <span className="font-medium text-slate-800">
                              {safeText(item.website)}
                            </span>
                          </span>
                          <span>
                            <span className="text-black">Tổng web:</span>{" "}
                            <span className="font-semibold text-slate-900">
                              {formatCurrency(item.totalWeb)}
                            </span>
                          </span>

                          {item.productName && (
                            <span className="min-w-0">
                              <span className="text-black">SP:</span>{" "}
                              <span className="font-medium text-slate-800">
                                {safeText(item.productName)}
                              </span>
                            </span>
                          )}

                          {item.productLink && (
                            <a
                              href={item.productLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                            >
                              <Link2 className="h-4 w-4" />
                              Link
                            </a>
                          )}
                        </div>

                        {item.note && (
                          <div className="mt-2 text-sm text-slate-700">
                            <span className="font-semibold text-slate-500">
                              Ghi chú:
                            </span>{" "}
                            {item.note}
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 text-center py-14">
          <Search className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <div className="text-base font-semibold text-slate-900">
            Chọn khách hàng để xem sản phẩm
          </div>
        </div>
      )}
    </div>
  );
};

export default DividePaymentOrder;
