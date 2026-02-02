// src/pages/Manager/Dashboard/DetailDashboardDomestic.jsx
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, ChevronLeft, ChevronRight, Package } from "lucide-react";
import dashboardWarehouseService from "../../Services/Dashboard/dashboardwarehouseService";

// Constants
const PAGE_SIZE = 100;

// Utility function for number formatting
const formatNumber = (num, decimals = 0) => {
  if (typeof num !== "number") return "0";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const DetailDashboardDomestic = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await dashboardWarehouseService.getCustomerInventory({
        page: 0,
        size: 100,
        month,
      });
      setData(res?.data?.content || []);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      toast.error("Không lấy được dữ liệu tồn kho");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setPage(0);
  }, [month]);

  // Memoized filtered data
  const filteredData = useMemo(() => {
    if (!keyword.trim()) return data;
    const lowerKeyword = keyword.toLowerCase();
    return data.filter(
      (item) =>
        item.customerName?.toLowerCase().includes(lowerKeyword) ||
        item.customerCode?.toLowerCase().includes(lowerKeyword),
    );
  }, [data, keyword]);

  // Memoized paginated data
  const paginatedData = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, page]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  // Memoized summary totals
  const totalSummary = useMemo(() => {
    return filteredData.reduce(
      (acc, cur) => {
        const inv = cur.inventoryQuantity || {};
        acc.exportedCode += inv.exportedCode || 0;
        acc.exportedWeightKg += inv.exportedWeightKg || 0;
        acc.remainingCode += inv.remainingCode || 0;
        acc.remainingWeightKg += inv.remainingWeightKg || 0;
        return acc;
      },
      {
        exportedCode: 0,
        exportedWeightKg: 0,
        remainingCode: 0,
        remainingWeightKg: 0,
      },
    );
  }, [filteredData]);

  // Loading skeleton rows
  const skeletonRows = Array.from({ length: PAGE_SIZE }).map((_, idx) => (
    <tr key={idx} className="border-t border-gray-100">
      {Array.from({ length: 7 }).map((_, cellIdx) => (
        <td key={cellIdx} className="p-3 md:p-4">
          <div className="animate-pulse bg-gray-200 h-4 rounded w-full" />
        </td>
      ))}
    </tr>
  ));

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 md:h-10 bg-gradient-to-b from-blue-600 to-blue-700 rounded-full" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Chi tiết tồn kho khách hàng
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg w-fit">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">
              Tháng {month}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 flex flex-wrap items-center gap-4">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border-0 ring-1 ring-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm font-medium"
            aria-label="Chọn tháng"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[260px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0);
              }}
              placeholder="Tìm mã / tên khách hàng"
              className="pl-10 ring-1 ring-gray-300 px-4 py-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm"
              aria-label="Tìm kiếm khách hàng"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
          <table className="w-full text-sm divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr className="text-blue-800 font-semibold text-sm md:text-base">
                <th className="p-3 md:p-4 text-left">Mã KH</th>
                <th className="p-3 md:p-4 text-left">Tên KH</th>
                <th className="p-3 md:p-4 text-left">Nhân viên</th>
                <th className="p-3 md:p-4 text-right">Đã xuất (mã)</th>
                <th className="p-3 md:p-4 text-right">Đã xuất (kg)</th>
                <th className="p-3 md:p-4 text-right">Còn lại (mã)</th>
                <th className="p-3 md:p-4 text-right">Còn lại (kg)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                skeletonRows
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center p-6 md:p-8 text-gray-500 font-medium text-sm md:text-base"
                  >
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  const inv = item.inventoryQuantity || {};
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 md:p-4 font-medium text-gray-900 text-sm md:text-base">
                        {item.customerCode}
                      </td>
                      <td className="p-3 md:p-4 text-gray-700 text-sm md:text-base">
                        {item.customerName}
                      </td>
                      <td className="p-3 md:p-4 text-gray-700 text-sm md:text-base">
                        {item.staffName}
                      </td>
                      <td className="p-3 md:p-4 text-right text-gray-700 text-sm md:text-base">
                        {formatNumber(inv.exportedCode || 0)}
                      </td>
                      <td className="p-3 md:p-4 text-right text-gray-700 text-sm md:text-base">
                        {formatNumber(inv.exportedWeightKg || 0, 2)}
                      </td>
                      <td className="p-3 md:p-4 text-right text-gray-700 text-sm md:text-base">
                        {formatNumber(inv.remainingCode || 0)}
                      </td>
                      <td className="p-3 md:p-4 text-right text-gray-700 text-sm md:text-base">
                        {formatNumber(inv.remainingWeightKg || 0, 2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Footer Summary */}
            <tfoot className="bg-blue-100 font-bold text-blue-900">
              <tr>
                <td
                  colSpan={3}
                  className="p-3 md:p-4 text-right text-sm md:text-base"
                >
                  Tổng
                </td>
                <td className="p-3 md:p-4 text-right text-sm md:text-base">
                  {formatNumber(totalSummary.exportedCode)}
                </td>
                <td className="p-3 md:p-4 text-right text-sm md:text-base">
                  {formatNumber(totalSummary.exportedWeightKg, 2)}
                </td>
                <td className="p-3 md:p-4 text-right text-sm md:text-base">
                  {formatNumber(totalSummary.remainingCode)}
                </td>
                <td className="p-3 md:p-4 text-right text-sm md:text-base">
                  {formatNumber(totalSummary.remainingWeightKg, 2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center gap-3">
          <button
            disabled={page === 0 || loading}
            onClick={() => setPage((prev) => prev - 1)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Trang trước"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-sm font-semibold text-gray-700">
            Trang {page + 1} / {totalPages || 1}
          </span>

          <button
            disabled={page + 1 >= totalPages || loading}
            onClick={() => setPage((prev) => prev + 1)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Trang sau"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailDashboardDomestic;
