import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Users,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import userService from "../../Services/Manager/userService";

/* ===================== Helpers ===================== */
const calcInactiveDays = (lastOrderDate) => {
  if (!lastOrderDate) return "--";
  const last = new Date(lastOrderDate);
  const now = new Date();
  return Math.floor((now - last) / (1000 * 60 * 60 * 24));
};

const getInactiveBadgeColor = (days) => {
  if (days >= 60) return "bg-red-100 text-red-700";
  if (days >= 30) return "bg-orange-100 text-orange-700";
  return "bg-green-100 text-green-700";
};

/* ===================== Skeleton ===================== */
const TableSkeleton = ({ rows = 8 }) => (
  <div className="p-6 animate-pulse space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4"
      >
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded hidden md:block" />
        <div className="h-4 w-24 bg-gray-200 rounded ml-auto" />
      </div>
    ))}
  </div>
);

const PAGE_SIZE_OPTIONS = [50, 100, 200];

const RemindCustomer = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 🔍 Search FE-only
  const [searchInput, setSearchInput] = useState("");

  /* ===================== Fetch ===================== */
  const fetchData = useCallback(
    async (pageIndex = 0, size = pageSize) => {
      try {
        setLoading(true);
        const res = await userService.getInactiveCustomers(pageIndex, size);

        setList(res?.content || []);
        setTotalPages(res?.totalPages || 0);
        setTotalElements(res?.totalElements || 0);
        setPage(pageIndex);
      } catch {
        toast.error("Không tải được danh sách khách hàng inactive");
      } finally {
        setLoading(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    fetchData(0, pageSize);
  }, [fetchData, pageSize]);

  /* ===================== Search filter (FE) ===================== */
  const filteredList = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    if (!term) return list;

    return list.filter(
      (c) =>
        c.customerName?.toLowerCase().includes(term) ||
        c.staffName?.toLowerCase().includes(term) ||
        String(c.customerId || "").includes(term),
    );
  }, [list, searchInput]);

  /* ===================== Pagination info ===================== */
  const showingFrom = totalElements ? page * pageSize + 1 : 0;
  const showingTo = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* ================= Header ================= */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="text-white" size={22} />
            </div>
            <h1 className="text-xl font-semibold text-white">
              Khách Hàng Cần Nhắc Lại
            </h1>
          </div>
        </div>

        {/* ================= Search + Page size ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm tên khách hàng, nhân viên..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Page size */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 mr-2">Hiển thị:</span>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setPageSize(size);
                    setPage(0);
                    fetchData(0, size);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition
                    ${
                      pageSize === size
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  type="button"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= Table ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <TableSkeleton />
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center">
              <UserCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">
                Không có khách hàng cần nhắc
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Khách hàng
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Nhân viên phụ trách
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Đơn gần nhất
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold">
                      Chưa đặt đơn
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold">
                      Tổng đơn
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredList.map((c, i) => {
                    const inactiveDays = calcInactiveDays(c.lastOrderDate);

                    return (
                      <tr
                        key={c.customerId}
                        className={`border-b border-gray-200 hover:bg-blue-50 ${
                          i % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {c.customerName?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {c.customerName}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          {c.staffName || "—"}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {c.lastOrderDate
                            ? new Date(c.lastOrderDate).toLocaleDateString(
                                "vi-VN",
                              )
                            : "—"}
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getInactiveBadgeColor(
                              inactiveDays,
                            )}`}
                          >
                            {inactiveDays} ngày
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center font-medium">
                          {c.numberOfOrders}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ================= Pagination ================= */}
          {totalPages > 1 && !loading && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Hiển thị <b>{showingFrom}</b> - <b>{showingTo}</b> /{" "}
                <b>{totalElements}</b> khách hàng
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchData(page - 1)}
                  disabled={page === 0}
                  className="p-2 border rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                  {page + 1} / {totalPages}
                </span>

                <button
                  onClick={() => fetchData(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="p-2 border rounded-lg disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemindCustomer;
