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
import DomesticService from "../../Services/Warehouse/domesticService";

const PAGE_SIZES = [50, 100, 200];

const getShipmentCodes = (d) => {
  const codes = d?.shipmemtCode ?? d?.shipmentCode ?? d?.shippingList ?? [];
  return Array.isArray(codes) ? codes : [];
};

const getAddress = (d) => d?.address ?? d?.toAddress ?? d?.to ?? "-";

const PendingWarehouse = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ input đang gõ
  const [searchInput, setSearchInput] = useState("");
  // ✅ term đã apply (chỉ set khi bấm Search)
  const [appliedSearch, setAppliedSearch] = useState("");

  // paging server-side
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await DomesticService.getDeliveryList(page, pageSize, {
        status: "CHUA_DU_DIEU_KIEN",
      });

      setDeliveries(res?.content ?? []);
      setTotalPages(res?.totalPages ?? 0);
      setTotalElements(res?.totalElements ?? 0);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // ✅ chỉ lọc theo appliedSearch
  const filteredDeliveries = useMemo(() => {
    const termRaw = appliedSearch.trim();
    const term = termRaw.toLowerCase();
    if (!term) return deliveries;

    return deliveries.filter((d) => {
      const customerName = (d?.customerName ?? "").toLowerCase();
      const customerCode = (d?.customerCode ?? "").toLowerCase();
      const phone = String(d?.phoneNumber ?? "");

      return (
        customerName.includes(term) ||
        customerCode.includes(term) ||
        phone.includes(termRaw) // số điện thoại dùng raw
      );
    });
  }, [deliveries, appliedSearch]);

  const totalOrdersOnPage = deliveries.length;
  const totalOrdersFiltered = filteredDeliveries.length;

  const totalShipmentsFiltered = useMemo(() => {
    return filteredDeliveries.reduce(
      (sum, d) => sum + getShipmentCodes(d).length,
      0
    );
  }, [filteredDeliveries]);

  const showingFrom = totalElements ? page * pageSize + 1 : 0;
  const showingTo = totalElements
    ? Math.min((page + 1) * pageSize, totalElements)
    : 0;

  // ✅ bấm Search mới apply
  const handleSearch = useCallback(() => {
    const v = searchInput.trim();
    setAppliedSearch(v);
    setPage(0);
  }, [searchInput]);

  const handleClear = useCallback(() => {
    setSearchInput("");
    setAppliedSearch("");
    setPage(0);
  }, []);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <TruckIcon className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                ĐH Chưa Thanh Toán Vận Chuyển
              </h1>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Tổng Đơn
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {totalOrdersOnPage}
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
                  Đang Hiển Thị
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {totalOrdersFiltered}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Search className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Tổng Mã Vận Đơn
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {totalShipmentsFiltered}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search + Page size */}
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
                    placeholder="Tìm theo mã khách hàng..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none
                               focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => setSearchInput("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      aria-label="Clear input"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all
                             flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <Search size={18} />
                  Tìm kiếm
                </button>

                {appliedSearch && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all whitespace-nowrap"
                  >
                    Xóa lọc
                  </button>
                )}
              </div>

              {appliedSearch && (
                <div className="mt-2 text-sm text-gray-600">
                  Đang lọc theo:{" "}
                  <span className="font-semibold text-gray-900">
                    {appliedSearch}
                  </span>
                </div>
              )}
            </div>

            {/* Page size */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Hiển thị:
              </span>
              <div className="flex gap-2">
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPageSize(size);
                      setPage(0);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      pageSize === size
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
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
              <p className="text-gray-700 font-semibold">
                Không có đơn hàng nào
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Thử đổi từ khóa, bấm tìm kiếm hoặc chuyển trang.
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
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Thông Tin KH
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Địa Chỉ
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Nhân Viên
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Số Đơn
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Danh sách mã vận đơn
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDeliveries.map((d, index) => {
                    const shipmentCodes = getShipmentCodes(d);
                    const address = getAddress(d);

                    return (
                      <tr
                        key={`${d?.customerCode ?? "x"}-${index}`}
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-4 align-top">
                          <span className="font-semibold text-blue-700 whitespace-nowrap">
                            {d?.customerCode || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {d?.customerName || "-"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-700 whitespace-nowrap">
                                {d?.phoneNumber || "Chưa có"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="flex items-start gap-2">
                            <span className="text-sm text-gray-700">
                              {address}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium whitespace-nowrap">
                            {d?.staffName || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center align-top">
                          <span className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 bg-blue-100 text-blue-700 rounded-lg font-bold text-sm">
                            {shipmentCodes.length}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-top">
                          {shipmentCodes.length === 0 ? (
                            <span className="text-sm text-gray-500">-</span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {shipmentCodes.map((code, idx) => (
                                <div
                                  key={`${code}-${idx}`}
                                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg border border-blue-200"
                                >
                                  <span className="text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded-full font-semibold min-w-[20px] text-center">
                                    {idx + 1}
                                  </span>
                                  <span className="text-sm font-mono text-gray-800">
                                    {code}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  {totalElements ? (
                    <>
                      Hiển thị{" "}
                      <span className="font-semibold text-gray-900">
                        {showingFrom}
                      </span>{" "}
                      -{" "}
                      <span className="font-semibold text-gray-900">
                        {showingTo}
                      </span>{" "}
                      /{" "}
                      <span className="font-semibold text-gray-900">
                        {totalElements}
                      </span>{" "}
                      • Trang{" "}
                      <span className="font-semibold text-gray-900">
                        {page + 1}
                      </span>{" "}
                      /{" "}
                      <span className="font-semibold text-gray-900">
                        {totalPages}
                      </span>
                    </>
                  ) : (
                    <>
                      Trang{" "}
                      <span className="font-semibold text-gray-900">
                        {page + 1}
                      </span>{" "}
                      /{" "}
                      <span className="font-semibold text-gray-900">
                        {totalPages}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(0)}
                    disabled={!canPrev || loading}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Đầu
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={!canPrev || loading}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Trước
                  </button>

                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                    {page + 1}
                  </span>

                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={!canNext || loading}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Sau
                  </button>
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    disabled={!canNext || loading}
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

        {/* ✅ Gợi ý: nếu muốn “Search toàn hệ thống” thì phải truyền keyword lên API (mình làm giúp được) */}
      </div>
    </div>
  );
};

export default PendingWarehouse;
