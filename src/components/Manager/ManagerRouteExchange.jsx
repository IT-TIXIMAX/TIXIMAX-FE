// import React, { useState, useEffect } from "react";
// import routesService from "../../Services/Manager/managerRoutesService";
// import {
//   Search,
//   Plus,
//   TrendingUp,
//   FileText,
//   CheckCircle2,
//   Trash2,
//   AlertTriangle,
//   X,
// } from "lucide-react";
// import toast from "react-hot-toast";

// const ManagerRouteExchange = () => {
//   // ===== STATE =====
//   const [routes, setRoutes] = useState([]);

//   const [searchRouteId, setSearchRouteId] = useState("");
//   const [date, setDate] = useState("");

//   const [listData, setListData] = useState([]);
//   const [effectiveData, setEffectiveData] = useState(null);

//   const [createRouteId, setCreateRouteId] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [exchangeRate, setExchangeRate] = useState("");
//   const [note, setNote] = useState("");

//   const [loading, setLoading] = useState(false);

//   // ===== CONFIRM DIALOG STATE =====
//   const [confirmDialog, setConfirmDialog] = useState({
//     isOpen: false,
//     type: "", // "create" or "delete"
//     title: "",
//     message: "",
//     onConfirm: null,
//     itemToDelete: null,
//   });

//   // ===== LOAD ROUTES =====
//   useEffect(() => {
//     const loadRoutes = async () => {
//       try {
//         const res = await routesService.getRoutes();
//         setRoutes(res || []);
//       } catch {
//         toast.error("Không thể tải danh sách tuyến");
//       }
//     };
//     loadRoutes();
//   }, []);

//   // ===== FORMAT NUMBER =====
//   const formatNumber = (val) => {
//     if (!val) return "";
//     const clean = val.toString().replace(/[^\d.]/g, "");
//     const parts = clean.split(".");
//     parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//     return parts.join(".");
//   };

//   const parseNumber = (val) => val.replace(/,/g, "");

//   const handleExchangeRateChange = (e) => {
//     const raw = e.target.value.replace(/[^\d.,]/g, "").replace(/,/g, "");
//     setExchangeRate(formatNumber(raw));
//   };

//   // ===== CONFIRM DIALOG FUNCTIONS =====
//   const openConfirmDialog = (type, onConfirm, itemToDelete = null) => {
//     const configs = {
//       create: {
//         title: "Xác nhận tạo tỷ giá",
//         message: `Bạn có chắc muốn tạo tỷ giá mới từ ${startDate} đến ${endDate}?`,
//       },
//       delete: {
//         title: "Xác nhận xóa",
//         message:
//           "Bạn có chắc muốn xóa tỷ giá này? Hành động này không thể hoàn tác.",
//       },
//     };

//     setConfirmDialog({
//       isOpen: true,
//       type,
//       ...configs[type],
//       onConfirm,
//       itemToDelete,
//     });
//   };

//   const closeConfirmDialog = () => {
//     setConfirmDialog({
//       isOpen: false,
//       type: "",
//       title: "",
//       message: "",
//       onConfirm: null,
//       itemToDelete: null,
//     });
//   };

//   const handleConfirm = async () => {
//     if (confirmDialog.onConfirm) {
//       await confirmDialog.onConfirm();
//     }
//     closeConfirmDialog();
//   };

//   // ===== SEARCH =====
//   const handleSearch = async () => {
//     if (!searchRouteId) {
//       toast.error("Vui lòng chọn tuyến");
//       return;
//     }

//     setLoading(true);
//     try {
//       const [listRes, effRes] = await Promise.all([
//         routesService.getRouteExchangeByRouteId(searchRouteId),
//         date
//           ? routesService.getEffectiveRouteExchange(searchRouteId, date)
//           : Promise.resolve(null),
//       ]);

//       setListData(listRes || []);
//       setEffectiveData(effRes);
//       setCreateRouteId(searchRouteId);
//     } catch {
//       toast.error("Không thể tải tỷ giá");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ===== CREATE =====
//   const handleCreate = async () => {
//     if (!createRouteId || !startDate || !endDate || !exchangeRate) {
//       toast.error("Vui lòng điền đầy đủ thông tin");
//       return;
//     }

//     if (new Date(startDate) > new Date(endDate)) {
//       toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
//       return;
//     }

//     // Mở confirm dialog thay vì tạo trực tiếp
//     openConfirmDialog("create", async () => {
//       try {
//         await routesService.createRouteExchange({
//           id: Number(createRouteId),
//           startDate,
//           endDate,
//           exchangeRate: Number(parseNumber(exchangeRate)),
//           note,
//         });

//         toast.success("Tạo tỷ giá thành công");

//         if (searchRouteId === createRouteId) {
//           const list =
//             await routesService.getRouteExchangeByRouteId(createRouteId);
//           setListData(list);
//         }

//         setStartDate("");
//         setEndDate("");
//         setExchangeRate("");
//         setNote("");
//       } catch {
//         toast.error("Tạo tỷ giá thất bại");
//       }
//     });
//   };

//   // ===== DELETE =====
//   const handleDelete = async (id) => {
//     openConfirmDialog(
//       "delete",
//       async () => {
//         try {
//           await routesService.deleteRouteExchange(id);
//           toast.success("Xóa thành công");

//           const list =
//             await routesService.getRouteExchangeByRouteId(searchRouteId);
//           setListData(list);
//         } catch {
//           toast.error("Xóa thất bại");
//         }
//       },
//       id,
//     );
//   };

//   return (
//     <div className="min-h-screen p-6 ">
//       <div className="mx-auto space-y-6">
//         {/* ===== HEADER ===== */}
//         <div className="bg-white border rounded-xl p-6">
//           <div className="flex items-center gap-3">
//             <div className="bg-blue-600 p-3 rounded-lg">
//               <TrendingUp className="w-6 h-6 text-white" />
//             </div>
//             <h1 className="text-2xl font-bold text-gray-800">Quản lý Tỷ giá</h1>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* ===== LEFT ===== */}
//           <div className="space-y-6">
//             {/* SEARCH */}
//             <div className="bg-white border rounded-xl">
//               <div className="p-4 border-b bg-blue-50 font-semibold">
//                 Tìm kiếm Tỷ giá
//               </div>
//               <div className="p-4 space-y-4">
//                 <select
//                   value={searchRouteId}
//                   onChange={(e) => setSearchRouteId(e.target.value)}
//                   className="w-full border rounded-lg px-3 py-2.5"
//                 >
//                   <option value="">-- Chọn tuyến --</option>
//                   {routes.map((r) => (
//                     <option key={r.routeId} value={r.routeId}>
//                       {r.name}
//                     </option>
//                   ))}
//                 </select>

//                 <input
//                   type="date"
//                   value={date}
//                   onChange={(e) => setDate(e.target.value)}
//                   className="w-full border rounded-lg px-3 py-2.5
//                              focus:border-blue-500 outline-none"
//                 />

//                 <button
//                   onClick={handleSearch}
//                   className="w-full bg-blue-600 text-white py-2.5 rounded-lg
//                              flex items-center justify-center gap-2"
//                 >
//                   <Search className="w-4 h-4" />
//                   Tìm kiếm
//                 </button>
//               </div>
//             </div>

//             {/* CREATE */}
//             <div className="bg-white border rounded-xl">
//               <div className="p-4 border-b bg-green-50 font-semibold">
//                 Tạo Tỷ giá mới
//               </div>
//               <div className="p-4 space-y-4">
//                 <select
//                   value={createRouteId}
//                   onChange={(e) => setCreateRouteId(e.target.value)}
//                   className="w-full border rounded-lg px-3 py-2.5"
//                 >
//                   <option value="">-- Chọn tuyến --</option>
//                   {routes.map((r) => (
//                     <option key={r.routeId} value={r.routeId}>
//                       {r.name}
//                     </option>
//                   ))}
//                 </select>

//                 <input
//                   type="date"
//                   value={startDate}
//                   onChange={(e) => setStartDate(e.target.value)}
//                   className="w-full border rounded-lg px-3 py-2.5
//                              focus:border-green-500 outline-none"
//                 />

//                 <input
//                   type="date"
//                   value={endDate}
//                   onChange={(e) => setEndDate(e.target.value)}
//                   className="w-full border rounded-lg px-3 py-2.5
//                              focus:border-green-500 outline-none"
//                 />

//                 {/* IMPORTANT FIELD */}
//                 <input
//                   type="text"
//                   value={exchangeRate}
//                   onChange={handleExchangeRateChange}
//                   placeholder="1,000,000"
//                   className="w-full border rounded-lg px-3 py-2.5
//                              resize-none focus:border-green-500 outline-none"
//                 />

//                 <textarea
//                   rows={3}
//                   value={note}
//                   onChange={(e) => setNote(e.target.value)}
//                   placeholder="Ghi chú"
//                   className="w-full border rounded-lg px-3 py-2.5
//                              resize-none focus:border-green-500 outline-none"
//                 />

//                 <button
//                   onClick={handleCreate}
//                   className="w-full bg-green-600 text-white py-2.5 rounded-lg
//                              flex items-center justify-center gap-2"
//                 >
//                   <Plus className="w-4 h-4" />
//                   Tạo mới
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* ===== RIGHT ===== */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* EFFECTIVE */}
//             {effectiveData && (
//               <div className="bg-blue-50 border-2 border-blue-300 rounded-xl">
//                 <div className="p-4 bg-blue-600 rounded-t-xl text-white flex gap-2">
//                   <CheckCircle2 className="w-5 h-5" />
//                   Tỷ giá hiệu lực
//                 </div>
//                 <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="bg-white p-3 rounded">
//                     <p className="text-xs text-gray-500">Tuyến</p>
//                     <p className="font-semibold">{effectiveData.routeName}</p>
//                   </div>
//                   <div className="bg-white p-3 rounded">
//                     <p className="text-xs text-gray-500">Tỷ giá</p>
//                     <p className="font-bold text-blue-600 text-xl">
//                       {formatNumber(effectiveData.exchangeRate)}
//                     </p>
//                   </div>
//                   <div className="bg-white p-3 rounded">
//                     <p className="text-xs text-gray-500">Bắt đầu</p>
//                     <p>{effectiveData.startDate}</p>
//                   </div>
//                   <div className="bg-white p-3 rounded">
//                     <p className="text-xs text-gray-500">Kết thúc</p>
//                     <p>{effectiveData.endDate}</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* TABLE */}
//             <div className="bg-white border rounded-xl">
//               <div className="p-4 border-b flex gap-2 font-semibold">
//                 <FileText className="w-5 h-5 text-gray-600" />
//                 Danh sách Tỷ giá
//               </div>

//               <table className="w-full">
//                 <thead className="bg-gray-50 text-sm">
//                   <tr>
//                     <th className="p-3 text-left">Bắt đầu</th>
//                     <th className="p-3 text-left">Kết thúc</th>
//                     <th className="p-3 text-left">Tỷ giá</th>
//                     <th className="p-3 text-center">Xóa</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td colSpan={4} className="p-6 text-center">
//                         Đang tải...
//                       </td>
//                     </tr>
//                   ) : listData.length === 0 ? (
//                     <tr>
//                       <td colSpan={4} className="p-6 text-center text-gray-400">
//                         Chưa có dữ liệu
//                       </td>
//                     </tr>
//                   ) : (
//                     listData.map((item) => (
//                       <tr key={item.id} className="border-t">
//                         <td className="p-3">{item.startDate}</td>
//                         <td className="p-3">{item.endDate}</td>
//                         <td className="p-3 font-bold text-blue-600">
//                           {formatNumber(item.exchangeRate)}
//                         </td>
//                         <td className="p-3 text-center">
//                           <button
//                             onClick={() => handleDelete(item.id)}
//                             className="text-red-600 hover:text-red-800"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* ===== CONFIRM DIALOG ===== */}
//         {confirmDialog.isOpen && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
//               {/* Header */}
//               <div
//                 className={`p-4 rounded-t-xl flex items-center gap-3 ${
//                   confirmDialog.type === "delete" ? "bg-red-600" : "bg-blue-600"
//                 }`}
//               >
//                 <AlertTriangle className="w-6 h-6 text-white" />
//                 <h3 className="text-lg font-semibold text-white flex-1">
//                   {confirmDialog.title}
//                 </h3>
//                 <button
//                   onClick={closeConfirmDialog}
//                   className="text-white hover:bg-white/20 rounded p-1"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               {/* Body */}
//               <div className="p-6">
//                 <p className="text-gray-700 text-base leading-relaxed">
//                   {confirmDialog.message}
//                 </p>
//               </div>

//               {/* Footer */}
//               <div className="p-4 bg-gray-50 rounded-b-xl flex gap-3 justify-end">
//                 <button
//                   onClick={closeConfirmDialog}
//                   className="px-4 py-2 border border-gray-300 rounded-lg
//                              hover:bg-gray-100 transition-colors font-medium"
//                 >
//                   Hủy
//                 </button>
//                 <button
//                   onClick={handleConfirm}
//                   className={`px-4 py-2 rounded-lg text-white font-medium
//                              transition-colors ${
//                                confirmDialog.type === "delete"
//                                  ? "bg-red-600 hover:bg-red-700"
//                                  : "bg-blue-600 hover:bg-blue-700"
//                              }`}
//                 >
//                   {confirmDialog.type === "delete" ? "Xóa" : "Xác nhận"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ManagerRouteExchange;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import routesService from "../../Services/Manager/managerRoutesService";
import {
  FiSearch,
  FiPlus,
  FiTrendingUp,
  FiFileText,
  FiCheckCircle,
  FiTrash2,
  FiAlertTriangle,
  FiX,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiArrowLeft,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const ManagerRouteExchange = () => {
  const navigate = useNavigate();

  // ===== STATE =====
  const [routes, setRoutes] = useState([]);

  const [searchRouteId, setSearchRouteId] = useState("");
  const [date, setDate] = useState("");

  const [listData, setListData] = useState([]);
  const [effectiveData, setEffectiveData] = useState(null);

  const [createRouteId, setCreateRouteId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);

  // ===== CONFIRM DIALOG STATE =====
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: "", // "create" or "delete"
    title: "",
    message: "",
    onConfirm: null,
    itemToDelete: null,
  });

  // ===== LOAD ROUTES =====
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const res = await routesService.getRoutes();
        setRoutes(res || []);
      } catch {
        toast.error("Không thể tải danh sách tuyến");
      }
    };
    loadRoutes();
  }, []);

  // ===== FORMAT NUMBER =====
  const formatNumber = (val) => {
    if (!val) return "";
    const clean = val.toString().replace(/[^\d.]/g, "");
    const parts = clean.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const parseNumber = (val) => val.replace(/,/g, "");

  const handleExchangeRateChange = (e) => {
    const raw = e.target.value.replace(/[^\d.,]/g, "").replace(/,/g, "");
    setExchangeRate(formatNumber(raw));
  };

  // ===== CONFIRM DIALOG FUNCTIONS =====
  const openConfirmDialog = (type, onConfirm, itemToDelete = null) => {
    const configs = {
      create: {
        title: "Xác nhận tạo tỷ giá",
        message: `Bạn có chắc muốn tạo tỷ giá mới từ ${startDate} đến ${endDate}?`,
      },
      delete: {
        title: "Xác nhận xóa",
        message:
          "Bạn có chắc muốn xóa tỷ giá này? Hành động này không thể hoàn tác.",
      },
    };

    setConfirmDialog({
      isOpen: true,
      type,
      ...configs[type],
      onConfirm,
      itemToDelete,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      type: "",
      title: "",
      message: "",
      onConfirm: null,
      itemToDelete: null,
    });
  };

  const handleConfirm = async () => {
    if (confirmDialog.onConfirm) {
      await confirmDialog.onConfirm();
    }
    closeConfirmDialog();
  };

  // ===== SEARCH =====
  const handleSearch = async () => {
    if (!searchRouteId) {
      toast.error("Vui lòng chọn tuyến");
      return;
    }

    setLoading(true);
    try {
      const [listRes, effRes] = await Promise.all([
        routesService.getRouteExchangeByRouteId(searchRouteId),
        date
          ? routesService.getEffectiveRouteExchange(searchRouteId, date)
          : Promise.resolve(null),
      ]);

      setListData(listRes || []);
      setEffectiveData(effRes);
      setCreateRouteId(searchRouteId);
    } catch {
      toast.error("Không thể tải tỷ giá");
    } finally {
      setLoading(false);
    }
  };

  // ===== CREATE =====
  const handleCreate = async () => {
    if (!createRouteId || !startDate || !endDate || !exchangeRate) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    openConfirmDialog("create", async () => {
      try {
        await routesService.createRouteExchange({
          id: Number(createRouteId),
          startDate,
          endDate,
          exchangeRate: Number(parseNumber(exchangeRate)),
          note,
        });

        toast.success("Tạo tỷ giá thành công");

        if (searchRouteId === createRouteId) {
          const list =
            await routesService.getRouteExchangeByRouteId(createRouteId);
          setListData(list);
        }

        setStartDate("");
        setEndDate("");
        setExchangeRate("");
        setNote("");
      } catch {
        toast.error("Tạo tỷ giá thất bại");
      }
    });
  };

  // ===== DELETE =====
  const handleDelete = async (id) => {
    openConfirmDialog(
      "delete",
      async () => {
        try {
          await routesService.deleteRouteExchange(id);
          toast.success("Xóa thành công");

          const list =
            await routesService.getRouteExchangeByRouteId(searchRouteId);
          setListData(list);
        } catch {
          toast.error("Xóa thất bại");
        }
      },
      id,
    );
  };

  // Skeleton rows
  const SkeletonRows = () =>
    [...Array(5)].map((_, i) => (
      <tr key={i} className="animate-pulse border-t border-slate-200">
        <td className="p-3">
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </td>
        <td className="p-3">
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </td>
        <td className="p-3">
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </td>
        <td className="p-3 flex justify-center">
          <div className="h-7 w-7 bg-slate-200 rounded" />
        </td>
      </tr>
    ));

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <Toaster position="top-right" />

      <div className="mx-auto space-y-6">
        {/* ✅ HEADER với nút Back - VERSION 1 */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-700 rounded-xl shadow-lg p-4 md:p-6">
            <div className="flex flex-col gap-4">
              {/* ✅ Back Button Row */}
              <div className="flex items-center">
                <button
                  onClick={() => navigate("/manager/settings")}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md border border-white/20"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Quay lại Cấu hình</span>
                </button>
              </div>

              {/* ✅ Title Row */}
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-1.5 h-10 md:h-12 bg-white/90 rounded-full shrink-0 shadow-sm" />
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md">
                  <FiTrendingUp className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                    Quản Lý Tỷ Giá
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ===== LEFT PANEL ===== */}
          <div className="space-y-6">
            {/* SEARCH CARD */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center gap-2">
                <FiSearch className="w-4 h-4 text-white" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Tìm kiếm Tỷ giá
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tuyến đường <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <select
                      value={searchRouteId}
                      onChange={(e) => setSearchRouteId(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">-- Chọn tuyến --</option>
                      {routes.map((r) => (
                        <option key={r.routeId} value={r.routeId}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ngày áp dụng
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <FiSearch className="w-4 h-4" />
                  Tìm kiếm
                </button>
              </div>
            </div>

            {/* CREATE CARD */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 flex items-center gap-2">
                <FiPlus className="w-4 h-4 text-white" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Tạo Tỷ giá mới
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tuyến đường <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <select
                      value={createRouteId}
                      onChange={(e) => setCreateRouteId(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                    >
                      <option value="">-- Chọn tuyến --</option>
                      {routes.map((r) => (
                        <option key={r.routeId} value={r.routeId}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tỷ giá <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      value={exchangeRate}
                      onChange={handleExchangeRateChange}
                      placeholder="1,000,000"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ghi chú
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ghi chú về tỷ giá..."
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <button
                  onClick={handleCreate}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <FiPlus className="w-4 h-4" />
                  Tạo mới
                </button>
              </div>
            </div>
          </div>

          {/* ===== RIGHT PANEL ===== */}
          <div className="lg:col-span-2 space-y-6">
            {/* EFFECTIVE RATE CARD */}
            {effectiveData && (
              <div className="bg-white border-2 border-blue-300 rounded-xl shadow-lg overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center gap-2">
                  <FiCheckCircle className="w-5 h-5 text-white" />
                  <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                    Tỷ giá hiệu lực
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                      Tuyến
                    </p>
                    <p className="font-bold text-slate-900">
                      {effectiveData.routeName}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                      Tỷ giá
                    </p>
                    <p className="font-bold text-blue-600 text-xl">
                      {formatNumber(effectiveData.exchangeRate)}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                      Bắt đầu
                    </p>
                    <p className="font-semibold text-slate-700">
                      {effectiveData.startDate}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                      Kết thúc
                    </p>
                    <p className="font-semibold text-slate-700">
                      {effectiveData.endDate}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TABLE CARD */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
              {/* Stats bar */}
              <div className="px-4 md:px-6 py-4 bg-slate-50 border-b border-slate-200">
                {loading ? (
                  <div className="h-4 w-56 bg-slate-200 rounded animate-pulse" />
                ) : (
                  <div className="text-sm md:text-base font-medium text-slate-700">
                    Hiển thị{" "}
                    <span className="text-lg font-bold text-blue-600">
                      {listData.length}
                    </span>{" "}
                    tỷ giá
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <tr>
                      <Th>Bắt đầu</Th>
                      <Th>Kết thúc</Th>
                      <Th>Tỷ giá</Th>
                      <Th className="text-center">Xóa</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading ? (
                      <SkeletonRows />
                    ) : listData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-16">
                          <div className="flex flex-col items-center gap-3">
                            <FiFileText className="w-16 h-16 text-slate-300" />
                            <h3 className="text-slate-500 font-medium text-lg">
                              Chưa có dữ liệu
                            </h3>
                            <p className="text-sm text-slate-400">
                              Chọn tuyến và tìm kiếm để xem danh sách
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      listData.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-blue-50/50 transition-colors"
                        >
                          <td className="p-3 font-medium text-slate-700">
                            {item.startDate}
                          </td>
                          <td className="p-3 font-medium text-slate-700">
                            {item.endDate}
                          </td>
                          <td className="p-3 font-bold text-blue-600 text-base">
                            {formatNumber(item.exchangeRate)}
                          </td>
                          <td className="p-3">
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all shadow-sm hover:shadow-md"
                                title="Xóa"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* CONFIRM DIALOG */}
        {confirmDialog.isOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeConfirmDialog}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        confirmDialog.type === "delete"
                          ? "bg-red-100"
                          : "bg-blue-100"
                      }`}
                    >
                      <FiAlertTriangle
                        className={`w-5 h-5 ${
                          confirmDialog.type === "delete"
                            ? "text-red-600"
                            : "text-blue-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-slate-900">
                        {confirmDialog.title}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={closeConfirmDialog}
                    className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors shrink-0"
                    title="Đóng"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <p className="text-slate-700 text-sm leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex gap-3 justify-end">
                <button
                  onClick={closeConfirmDialog}
                  className="px-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirm}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg text-white font-medium transition-colors shadow-md hover:shadow-lg ${
                    confirmDialog.type === "delete"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {confirmDialog.type === "delete" ? "Xóa" : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Table Header Component
const Th = ({ children, className = "" }) => (
  <th
    className={`px-3 py-3 text-left font-bold text-sm uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

export default ManagerRouteExchange;
