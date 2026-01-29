// src/Components/Warehouse/ListExportCustomer.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  Package,
  RefreshCw,
  Calendar as CalendarIcon,
  Truck,
} from "lucide-react";
import toast from "react-hot-toast";
import draftWarehouseService from "../../Services/Warehouse/darftWarehouseService";

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
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 flex-1 bg-gray-200 rounded hidden md:block" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ===================== Helpers ===================== */
const toISODate = (d) => {
  try {
    const x = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(x.getTime())) return "";
    return x.toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

const formatWeight = (n) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0";
  return x % 1 === 0 ? String(x) : x.toLocaleString("vi-VN");
};

const getErrorMessage = (error) => {
  if (error?.response) {
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
      }
      if (Array.isArray(backendError)) return backendError.join(", ");
      return backendError;
    }
    return `Lỗi ${error.response.status}: ${
      error.response.statusText || "Không xác định"
    }`;
  }
  if (error?.request)
    return "Không thể kết nối tới server. Vui lòng kiểm tra mạng.";
  return error?.message || "Đã xảy ra lỗi không xác định";
};

const ensureArray = (v) => {
  if (Array.isArray(v)) return v;
  if (v === null || v === undefined || v === "") return [];
  return [v];
};

/* ===================== Component ===================== */
const ListExportCustomer = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // inputs (not applied)
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState(toISODate(new Date()));
  const [searchCarrier, setSearchCarrier] = useState("VNPOST");

  // applied filters
  const [filterTerm, setFilterTerm] = useState("");
  const [filterDate, setFilterDate] = useState(toISODate(new Date()));
  const [filterCarrier, setFilterCarrier] = useState("VNPOST");

  const loadExportCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await draftWarehouseService.getLockedDrafts(
        filterDate,
        filterCarrier,
      );
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getErrorMessage(err), { duration: 5000 });
    } finally {
      setLoading(false);
    }
  }, [filterDate, filterCarrier]);

  useEffect(() => {
    loadExportCustomers();
  }, [loadExportCustomers]);

  const handleSearch = () => {
    setFilterTerm(searchTerm.trim());
    setFilterDate(searchDate);
    setFilterCarrier(searchCarrier);
  };

  const handleQuickFilter = (carrier) => {
    setSearchCarrier(carrier);
    setFilterCarrier(carrier);
    setFilterTerm(searchTerm.trim());
    setFilterDate(searchDate);
  };

  const filtered = useMemo(() => {
    const kw = filterTerm.trim().toLowerCase();
    return (items || []).filter((it) => {
      const shippingText = ensureArray(it.shippingList).join(" ");
      const hay = [
        it.id,
        it.customerName,
        it.phoneNumber,
        it.address,
        it.shipCode,
        it.staffCode,
        it.vnpostTrackingCode,
        shippingText,
      ]
        .map((x) => (x == null ? "" : String(x)))
        .join(" ")
        .toLowerCase();

      return !kw || hay.includes(kw);
    });
  }, [items, filterTerm]);

  const statistics = useMemo(() => {
    const totalShippingCodes = filtered.reduce(
      (sum, x) => sum + ensureArray(x.shippingList).length,
      0,
    );
    const totalWeight = filtered.reduce((sum, x) => {
      const w = Number(x.weight);
      return sum + (Number.isFinite(w) ? w : 0);
    }, 0);
    return {
      totalDrafts: filtered.length,
      totalShippingCodes,
      totalWeight,
    };
  }, [filtered]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Truck size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Danh sách xuất hàng khách
              </h1>
            </div>
            <button
              onClick={loadExportCustomers}
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
                      Tổng Draft
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {statistics.totalDrafts}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Carrier:{" "}
                      <span className="font-medium">{filterCarrier}</span>
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng mã (shippingList)
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {statistics.totalShippingCodes}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tổng weight:{" "}
                      <span className="font-semibold text-gray-900">
                        {formatWeight(statistics.totalWeight)} kg
                      </span>
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <RefreshCw className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Ngày xuất
                    </p>
                    <p className="text-xl font-bold text-orange-600">
                      {filterDate || "-"}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <CalendarIcon className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filter - Compact Version */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    type="button"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="w-full md:w-44">
              <div className="relative">
                <CalendarIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleQuickFilter("VNPOST")}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm ${
                  filterCarrier === "VNPOST"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                type="button"
              >
                <Truck size={16} />
                VNPOST
              </button>

              <button
                onClick={() => handleQuickFilter("OTHER")}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm ${
                  filterCarrier === "OTHER"
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                type="button"
              >
                <Truck size={16} />
                OTHER
              </button>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                type="button"
              >
                <Search size={16} />
                Tìm
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <TableSkeleton rows={10} />
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">
                Không có dữ liệu xuất hàng
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Ship Code
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Khách hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      SĐT
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Địa chỉ
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Staff
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Số mã
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Danh sách mã
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Trọng lượng (kg)
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Carrier
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((it, index) => {
                    const list = ensureArray(it.shippingList);

                    return (
                      <tr
                        key={it.id}
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-4">
                          <span className="font-semibold text-blue-700 whitespace-nowrap">
                            {it.shipCode || "-"}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: <span className="font-medium">{it.id}</span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900 whitespace-nowrap">
                            {it.customerName || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-700 whitespace-nowrap">
                            {it.phoneNumber || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-700 whitespace-pre-line line-clamp-3">
                            {it.address || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200 font-medium">
                            {it.staffCode || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="font-semibold text-gray-900">
                            {list.length}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {list.length > 0 ? (
                              list.slice(0, 6).map((code, idx) => (
                                <div
                                  key={`${it.id}-${code}-${idx}`}
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
                            {list.length > 6 && (
                              <div className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm font-semibold">
                                +{list.length - 6}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="font-medium text-gray-900">
                            {formatWeight(it.weight)}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border font-medium ${
                              filterCarrier === "VNPOST"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : "bg-purple-100 text-purple-700 border-purple-200"
                            }`}
                          >
                            <Truck size={14} />
                            {filterCarrier}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListExportCustomer;
