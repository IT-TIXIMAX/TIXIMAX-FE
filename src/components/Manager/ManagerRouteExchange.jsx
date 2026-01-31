import React, { useState, useEffect } from "react";
import routesService from "../../Services/Manager/managerRoutesService";
import {
  Search,
  Plus,
  TrendingUp,
  FileText,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const ManagerRouteExchange = () => {
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

    // Mở confirm dialog thay vì tạo trực tiếp
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

  return (
    <div className="min-h-screen p-6 ">
      <div className="mx-auto space-y-6">
        {/* ===== HEADER ===== */}
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Tỷ giá</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ===== LEFT ===== */}
          <div className="space-y-6">
            {/* SEARCH */}
            <div className="bg-white border rounded-xl">
              <div className="p-4 border-b bg-blue-50 font-semibold">
                Tìm kiếm Tỷ giá
              </div>
              <div className="p-4 space-y-4">
                <select
                  value={searchRouteId}
                  onChange={(e) => setSearchRouteId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5"
                >
                  <option value="">-- Chọn tuyến --</option>
                  {routes.map((r) => (
                    <option key={r.routeId} value={r.routeId}>
                      {r.name}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5
                             focus:border-blue-500 outline-none"
                />

                <button
                  onClick={handleSearch}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg
                             flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Tìm kiếm
                </button>
              </div>
            </div>

            {/* CREATE */}
            <div className="bg-white border rounded-xl">
              <div className="p-4 border-b bg-green-50 font-semibold">
                Tạo Tỷ giá mới
              </div>
              <div className="p-4 space-y-4">
                <select
                  value={createRouteId}
                  onChange={(e) => setCreateRouteId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5"
                >
                  <option value="">-- Chọn tuyến --</option>
                  {routes.map((r) => (
                    <option key={r.routeId} value={r.routeId}>
                      {r.name}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5
                             focus:border-green-500 outline-none"
                />

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5
                             focus:border-green-500 outline-none"
                />

                {/* IMPORTANT FIELD */}
                <input
                  type="text"
                  value={exchangeRate}
                  onChange={handleExchangeRateChange}
                  placeholder="1,000,000"
                  className="w-full border rounded-lg px-3 py-2.5
                             resize-none focus:border-green-500 outline-none"
                />

                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú"
                  className="w-full border rounded-lg px-3 py-2.5
                             resize-none focus:border-green-500 outline-none"
                />

                <button
                  onClick={handleCreate}
                  className="w-full bg-green-600 text-white py-2.5 rounded-lg
                             flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tạo mới
                </button>
              </div>
            </div>
          </div>

          {/* ===== RIGHT ===== */}
          <div className="lg:col-span-2 space-y-6">
            {/* EFFECTIVE */}
            {effectiveData && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl">
                <div className="p-4 bg-blue-600 rounded-t-xl text-white flex gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Tỷ giá hiệu lực
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-500">Tuyến</p>
                    <p className="font-semibold">{effectiveData.routeName}</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-500">Tỷ giá</p>
                    <p className="font-bold text-blue-600 text-xl">
                      {formatNumber(effectiveData.exchangeRate)}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-500">Bắt đầu</p>
                    <p>{effectiveData.startDate}</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-500">Kết thúc</p>
                    <p>{effectiveData.endDate}</p>
                  </div>
                </div>
              </div>
            )}

            {/* TABLE */}
            <div className="bg-white border rounded-xl">
              <div className="p-4 border-b flex gap-2 font-semibold">
                <FileText className="w-5 h-5 text-gray-600" />
                Danh sách Tỷ giá
              </div>

              <table className="w-full">
                <thead className="bg-gray-50 text-sm">
                  <tr>
                    <th className="p-3 text-left">Bắt đầu</th>
                    <th className="p-3 text-left">Kết thúc</th>
                    <th className="p-3 text-left">Tỷ giá</th>
                    <th className="p-3 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center">
                        Đang tải...
                      </td>
                    </tr>
                  ) : listData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-400">
                        Chưa có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    listData.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-3">{item.startDate}</td>
                        <td className="p-3">{item.endDate}</td>
                        <td className="p-3 font-bold text-blue-600">
                          {formatNumber(item.exchangeRate)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ===== CONFIRM DIALOG ===== */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div
                className={`p-4 rounded-t-xl flex items-center gap-3 ${
                  confirmDialog.type === "delete" ? "bg-red-600" : "bg-blue-600"
                }`}
              >
                <AlertTriangle className="w-6 h-6 text-white" />
                <h3 className="text-lg font-semibold text-white flex-1">
                  {confirmDialog.title}
                </h3>
                <button
                  onClick={closeConfirmDialog}
                  className="text-white hover:bg-white/20 rounded p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-700 text-base leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 rounded-b-xl flex gap-3 justify-end">
                <button
                  onClick={closeConfirmDialog}
                  className="px-4 py-2 border border-gray-300 rounded-lg
                             hover:bg-gray-100 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded-lg text-white font-medium
                             transition-colors ${
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

export default ManagerRouteExchange;
