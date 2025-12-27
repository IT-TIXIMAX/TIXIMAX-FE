import React, { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import userService from "../../Services/Manager/userService";

const PAGE_SIZE_OPTIONS = [50, 100, 200];

const CustomerList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* paging */
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  /* search */
  const [search, setSearch] = useState("");

  /* ================= FETCH ================= */
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getCustomerAccounts(page, size);
      setData(res?.content || []);
      setTotalPages(res?.totalPages || 0);
      setTotalElements(res?.totalElements || 0);
    } catch (e) {
      setError(e.message || "Failed to load customers");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  /* ================= SEARCH (client-side) ================= */
  const filteredData = data.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(s) ||
      c.customerCode?.toLowerCase().includes(s) ||
      c.phone?.includes(s) ||
      c.email?.toLowerCase().includes(s)
    );
  });

  /* ================= HANDLERS ================= */
  const handlePageSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0); // reset page
  };

  return (
    <div className="p-6 space-y-4">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Customer Management
        </h1>
        <p className="text-sm text-gray-500">List of customers in the system</p>
      </div>

      {/* SEARCH + PAGE SIZE */}
      <div className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, phone..."
            className="w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Page size */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Show</span>
          <select
            value={size}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAGE_SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <span className="text-gray-600">rows</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              filteredData.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {c.name || "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {c.email || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono text-blue-600">
                    {c.customerCode}
                  </td>

                  <td className="px-4 py-3">{c.phone || "-"}</td>

                  <td className="px-4 py-3 max-w-xs truncate">
                    {c.addresses?.length
                      ? c.addresses.map((a) => a.addressName).join(", ")
                      : "-"}
                  </td>

                  <td className="px-4 py-3 text-xs">{c.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER: PAGINATION INFO */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="text-gray-600">
            Showing{" "}
            <span className="font-medium">
              {page * size + 1} - {Math.min((page + 1) * size, totalElements)}
            </span>{" "}
            of <span className="font-medium">{totalElements}</span>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 px-3 py-2 border rounded-md disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>

              <span className="text-gray-600">
                Page {page + 1} / {totalPages}
              </span>

              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 px-3 py-2 border rounded-md disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}
    </div>
  );
};

export default CustomerList;
