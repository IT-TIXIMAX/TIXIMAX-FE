import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  User,
  Phone,
  MapPin,
  TruckIcon,
  X,
} from "lucide-react";
// import toast from "react-hot-toast"; // nếu muốn toast lỗi
import DomesticService from "../../Services/Warehouse/domesticService";

import ExportShip from "./ExportShip";
const PAGE_SIZES = [50, 100, 200];

const ExportWarehouseShip = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  // input đang gõ
  const [searchInput, setSearchInput] = useState("");
  // term đã apply
  const [appliedTerm, setAppliedTerm] = useState("");
  // term gọi API
  const [activeSearch, setActiveSearch] = useState("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // ✅ modal state
  const [openExport, setOpenExport] = useState(false);
  const [selectedCustomerCode, setSelectedCustomerCode] = useState("");

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);

      const params = { status: "DU_DIEU_KIEN" };
      const keyword = activeSearch.trim();
      if (keyword) params.customerCode = keyword;

      const res = await DomesticService.getDeliveryList(page, pageSize, params);

      setDeliveries(res?.content ?? []);
      setTotalPages(res?.totalPages ?? 0);
      setTotalElements(res?.totalElements ?? 0);
    } catch (err) {
      console.error("Error fetching deliveries:", err);
      // toast.error(err?.response?.data?.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeSearch]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleSearch = useCallback(() => {
    const v = searchInput.trim();
    setAppliedTerm(v);
    setActiveSearch(v);
    setPage(0);
  }, [searchInput]);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setAppliedTerm("");
    setActiveSearch("");
    setPage(0);
  }, []);

  const handlePageSizeChange = useCallback((newSize) => {
    setPageSize(newSize);
    setPage(0);
  }, []);

  // nếu có activeSearch -> hiển thị list API; nếu không -> filter local theo appliedTerm
  const filteredDeliveries = useMemo(() => {
    if (activeSearch.trim()) return deliveries;

    const term = appliedTerm.trim();
    if (!term) return deliveries;

    const lower = term.toLowerCase();
    return deliveries.filter((d) => {
      const code = (d.customerCode ?? "").toLowerCase();
      const name = (d.customerName ?? "").toLowerCase();
      const staff = (d.staffName ?? "").toLowerCase();
      const phone = d.phoneNumber ?? "";
      return (
        code.includes(lower) ||
        name.includes(lower) ||
        staff.includes(lower) ||
        phone.includes(term)
      );
    });
  }, [deliveries, appliedTerm, activeSearch]);

  const totalShipments = useMemo(() => {
    return filteredDeliveries.reduce(
      (sum, d) => sum + (d.shipmemtCode?.length || 0),
      0
    );
  }, [filteredDeliveries]);

  const showingFrom = totalElements ? page * pageSize + 1 : 0;
  const showingTo = Math.min((page + 1) * pageSize, totalElements);

  // ✅ open modal export for a customer
  const openExportModal = useCallback((customerCode) => {
    setSelectedCustomerCode(customerCode || "");
    setOpenExport(true);
  }, []);

  const closeExportModal = useCallback(() => {
    setOpenExport(false);
    setSelectedCustomerCode("");
  }, []);

  // ✅ xuất thành công: đóng modal + refresh
  const handleExportSuccess = useCallback(() => {
    closeExportModal();
    fetchDeliveries();
  }, [closeExportModal, fetchDeliveries]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <TruckIcon className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Xuất Kho Vận Chuyển Nội Địa
              </h1>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Tổng Đơn Hàng
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {totalElements}
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
                  Tổng Kiện Hàng
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {totalShipments}
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
                  Đang Hiển Thị
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {filteredDeliveries.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TruckIcon className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã khách hàng ..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchInput && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

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

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600 font-medium">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">Không có đơn hàng nào</p>
              <p className="text-sm text-gray-500 mt-1">
                Thử thay đổi bộ lọc hoặc tìm kiếm
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã KH
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Tên Khách Hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Số Điện Thoại
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Địa Chỉ
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Nhân Viên
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Số Kiện
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Danh Sách Mã Vận Đơn
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDeliveries.map((delivery, index) => (
                    <tr
                      key={`${delivery.customerCode}-${index}`}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 rounded">
                            <Package size={16} className="text-blue-600" />
                          </div>
                          <span className="font-semibold text-blue-700 whitespace-nowrap">
                            {delivery.customerCode}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {delivery.customerName}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {delivery.phoneNumber ? (
                          <div className="flex items-center gap-2">
                            <Phone size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-700 whitespace-nowrap">
                              {delivery.phoneNumber}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Chưa có
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {delivery.address ? (
                          <div className="flex items-start gap-2">
                            <MapPin
                              size={16}
                              className="text-gray-400 mt-0.5 flex-shrink-0"
                            />
                            <span className="text-sm text-gray-700">
                              {delivery.address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Chưa có địa chỉ
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium whitespace-nowrap">
                          {delivery.staffName}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 bg-green-100 text-green-700 rounded-lg font-bold text-sm">
                          {delivery.shipmemtCode?.length || 0}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {delivery.shipmemtCode?.map((code, idx) => (
                            <div
                              key={`${delivery.customerCode}-${code}-${idx}`}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 px-3 py-1.5 rounded-lg border border-green-200"
                            >
                              <span className="font-mono text-xs font-medium text-gray-800">
                                {code}
                              </span>
                              <span className="text-xs px-1.5 py-0.5 bg-green-600 text-white rounded-full font-semibold min-w-[20px] text-center">
                                {idx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* ✅ Xuất kho theo từng khách */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => openExportModal(delivery.customerCode)}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700"
                        >
                          Xuất kho
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
                    {totalElements}
                  </span>{" "}
                  đơn hàng
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Đầu
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Sau
                  </button>
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Cuối
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal ExportShip */}
      {openExport && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeExportModal}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl overflow-hidden">
              <ExportShip
                customerCode={selectedCustomerCode}
                onClose={closeExportModal}
                onSuccess={handleExportSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportWarehouseShip;
