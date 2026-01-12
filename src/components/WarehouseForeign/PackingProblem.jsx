// src/Components/Packing/RemoveShipmentList.jsx
import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Eye,
  PackageSearch,
  RefreshCw,
  PackageX,
  X,
  Package,
  Search,
} from "lucide-react";
import packingsService from "../../Services/Warehouse/packingsService";
import RemoveShipment from "./RemoveShipment";
import AddShipment from "./AddShipment";

const PAGE_SIZES = [50, 100, 200];

const RemoveShipmentList = () => {
  const [packings, setPackings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPacking, setSelectedPacking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [packingCache, setPackingCache] = useState({});
  const [pageSize, setPageSize] = useState(50);

  // ✅ FE search (packingCode)
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ✅ debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ✅ reset to first page when user changes search term
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  // Status mapping
  const renderStatusLabel = (status) => {
    if (!status) return "—";
    if (status === "CHO_BAY") return "Awaiting Flight";
    return status;
  };

  const getStatusStyle = (status) => {
    if (status === "CHO_BAY") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  const fetchAwaiting = async (pageIndex = page, size = pageSize) => {
    setLoading(true);
    try {
      const data = await packingsService.getAwaitingFlightOrders(
        pageIndex,
        size
      );
      setPackings(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch packings:", error);
      toast.error("Cannot load awaiting-flight packing list!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwaiting(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleViewDetail = async (packingId) => {
    if (packingCache[packingId]) {
      setSelectedPacking(packingCache[packingId]);
      setShowDetailModal(true);
      return;
    }

    try {
      const data = await packingsService.getPackingById(packingId);
      setSelectedPacking(data);
      setPackingCache((prev) => ({ ...prev, [packingId]: data }));
      setShowDetailModal(true);
    } catch (error) {
      console.error("Failed to fetch packing details:", error);
      toast.error("Cannot load packing details.");
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(0);
  };

  const reloadAwaitingList = () => {
    fetchAwaiting(page, pageSize);

    if (selectedPacking) {
      setPackingCache((prev) => {
        const next = { ...prev };
        delete next[selectedPacking.packingId];
        return next;
      });
      setSelectedPacking(null);
      setShowDetailModal(false);
    }
  };

  // ✅ FE filtered list (by packingCode)
  const filteredPackings = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return packings;
    return packings.filter((p) =>
      String(p?.packingCode ?? "")
        .toLowerCase()
        .includes(q)
    );
  }, [packings, debouncedSearch]);

  // Calculate total shipments (based on filtered list)
  const totalShipments = useMemo(() => {
    return filteredPackings.reduce(
      (sum, p) => sum + (p.packingList?.length || 0),
      0
    );
  }, [filteredPackings]);

  const showingFrom = totalElements ? page * pageSize + 1 : 0;
  const showingTo = totalElements
    ? Math.min((page + 1) * pageSize, totalElements)
    : 0;

  // Loading Skeleton Components
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
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
              <div className="h-9 flex-1 bg-gray-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Detail Modal
  const DetailModal = () => {
    if (!showDetailModal || !selectedPacking) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setShowDetailModal(false)}
        />

        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="relative w-full max-w-3xl">
            <div className="relative overflow-hidden rounded-xl bg-white shadow-xl">
              {/* Header */}
              <div className="bg-blue-600 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Packing Details
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="rounded-lg p-2 text-white hover:bg-white/10"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[70vh] overflow-y-auto p-6">
                {/* Info Grid */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  {/* Packing Code */}
                  <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-600">
                      Packing Code
                    </p>
                    <p className="font-mono text-lg font-bold text-gray-900">
                      {selectedPacking.packingCode}
                    </p>
                  </div>

                  {/* Packing Date */}
                  <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-600">
                      Packed Date
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPacking.packedDate
                        ? new Date(selectedPacking.packedDate).toLocaleString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" }
                          )
                        : "—"}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-600">
                      Status
                    </p>
                    <span
                      className={`inline-block rounded-lg border px-3 py-1 text-xs font-bold ${getStatusStyle(
                        selectedPacking.status
                      )}`}
                    >
                      {renderStatusLabel(selectedPacking.status)}
                    </span>
                  </div>

                  {/* Total Shipments */}
                  <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                    <p className="mb-1 text-xs font-semibold uppercase text-gray-600">
                      Total Shipments
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedPacking.packingList?.length || 0}
                    </p>
                  </div>
                </div>

                {/* Shipment List */}
                <div>
                  <div className="mb-3 flex items-center justify-between border-b border-gray-300 pb-2">
                    <h3 className="font-bold text-gray-900">Shipment List</h3>
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
                      {selectedPacking.packingList?.length || 0} items
                    </span>
                  </div>

                  <div className="rounded-lg border border-gray-300">
                    <div className="max-h-80 overflow-y-auto">
                      {selectedPacking.packingList?.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {selectedPacking.packingList.map((code, index) => (
                            <div
                              key={code}
                              className="flex items-center justify-between bg-white px-4 py-3 hover:bg-gray-50"
                            >
                              <span className="font-mono text-sm font-semibold text-gray-900">
                                {code}
                              </span>
                              <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                                #{index + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-6 py-10 text-center">
                          <PackageX className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                          <p className="text-sm text-gray-600">
                            No shipments in this packing
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-300 bg-gray-50 px-6 py-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full rounded-lg bg-gray-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Empty State
  const EmptyState = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <PackageX className="mx-auto text-gray-400 mb-4" size={48} />
      <p className="text-gray-700 font-semibold">No packings found</p>
      <p className="text-sm text-gray-500 mt-1">
        There are currently no packings in the “Awaiting Flight” status.
      </p>
      <button
        onClick={() => fetchAwaiting(page, pageSize)}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <RefreshCw size={16} />
        Reload
      </button>
    </div>
  );

  // ✅ Empty state for search result
  const SearchEmptyState = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <PackageX className="mx-auto text-gray-400 mb-4" size={48} />
      <p className="text-gray-700 font-semibold">No results</p>
      <p className="text-sm text-gray-500 mt-1">
        No packings match your search by Packing Code.
      </p>
      <button
        onClick={() => setSearchInput("")}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Clear search
      </button>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            {/* Left: Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <PackageSearch size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Packing Management — Awaiting Flight
              </h1>
            </div>

            {/* Right: Reload Button */}
            <button
              onClick={() => fetchAwaiting(page, pageSize)}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              Reload
            </button>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                      Total Packings
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
                      Total Shipments (shown)
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
                      Currently Showing
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {filteredPackings.length}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <PackageSearch className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {/* ✅ Search + Page Size Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Search */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by Packing Code..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-gray-100"
                    type="button"
                    aria-label="Clear"
                    title="Clear"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">
                  {debouncedSearch ? "Filtered" : "All"}:{" "}
                  <span className="text-gray-900">
                    {filteredPackings.length}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Page Size Selector */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Show:
              </span>
              <div className="flex gap-2">
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handlePageSizeChange(size)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pageSize === size
                        ? "bg-blue-600 text-white"
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
            <TableSkeleton rows={10} />
          ) : packings.length === 0 ? (
            <EmptyState />
          ) : filteredPackings.length === 0 ? (
            <SearchEmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Packing Code
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Packed Date
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Shipments
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPackings.map((item, index) => (
                    <tr
                      key={item.packingId}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-4 align-top">
                        <span className="font-mono font-semibold text-blue-700 whitespace-nowrap">
                          {item.packingCode}
                        </span>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <span className="text-sm text-gray-700 whitespace-nowrap">
                          {item.packedDate
                            ? new Date(item.packedDate).toLocaleString(
                                "en-US",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </span>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusStyle(
                            item.status
                          )}`}
                        >
                          {renderStatusLabel(item.status)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center align-top">
                        <span className="inline-flex items-center justify-center min-w-[36px] h-9 px-3 bg-blue-100 text-blue-700 rounded-lg font-bold text-sm">
                          {item.packingList?.length || 0}
                        </span>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(item.packingId)}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                            Details
                          </button>

                          <AddShipment
                            packingCode={item.packingCode}
                            onSuccess={reloadAwaitingList}
                          />

                          <RemoveShipment
                            packingCode={item.packingCode}
                            packingList={item.packingList || []}
                            onSuccess={reloadAwaitingList}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination (still server pagination) */}
          {totalPages > 1 && !loading && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {showingFrom}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-gray-900">
                    {showingTo}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {totalElements}
                  </span>{" "}
                  packings
                  {debouncedSearch ? (
                    <span className="ml-2 text-xs text-gray-500">
                      (FE filtered on this page:{" "}
                      <span className="font-semibold">
                        {filteredPackings.length}
                      </span>
                      )
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Prev
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
                    Next
                  </button>
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    type="button"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      {totalPages > 1 && !loading && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-white">
                Page <span className="font-bold">{page + 1}</span> /{" "}
                <span className="font-bold">{totalPages}</span> • Showing{" "}
                <span className="font-bold">
                  {showingFrom}-{showingTo}
                </span>{" "}
                / {totalElements} packings
                {debouncedSearch ? (
                  <span className="ml-2 text-white/80">
                    • FE filtered:{" "}
                    <span className="font-bold">{filteredPackings.length}</span>
                  </span>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  type="button"
                >
                  First
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  type="button"
                >
                  ← Prev
                </button>
                <span className="px-4 py-2 bg-white text-blue-700 rounded-lg text-sm font-bold">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  type="button"
                >
                  Next →
                </button>
                <button
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  type="button"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal />
    </div>
  );
};

export default RemoveShipmentList;
