// src/Components/Packing/RemoveShipmentList.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Eye,
  PackageSearch,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  PackageX,
  X,
} from "lucide-react";
import packingsService from "../../Services/Warehouse/packingsService";
import RemoveShipment from "./RemoveShipment";
import AddShipment from "./AddShipment";

const RemoveShipmentList = () => {
  const [packings, setPackings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPacking, setSelectedPacking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [packingCache, setPackingCache] = useState({});
  const [pageSize, setPageSize] = useState(20);

  // Status mapping
  const renderStatusLabel = (status) => {
    if (!status) return "—";
    if (status === "CHO_BAY") return "AwaitFly";
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
      // ✅ Removed success toast
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

  // Loading Skeleton Components
  const SkeletonStats = () => (
    <div className="grid grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-2 h-3 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-16 animate-pulse rounded bg-gray-300" />
        </div>
      ))}
    </div>
  );

  const SkeletonTableRow = () => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-300" />
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-20 animate-pulse rounded-lg bg-gray-300" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 w-8 animate-pulse rounded bg-gray-300" />
      </td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-9 w-full animate-pulse rounded-lg bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="h-9 flex-1 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-9 flex-1 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
      </td>
    </tr>
  );

  const SkeletonTable = () => (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow">
      {/* Header */}
      <div className="border-b border-gray-300 bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-300" />
          <div className="flex items-center gap-3">
            <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 w-12 animate-pulse rounded-lg bg-gray-300"
                />
              ))}
            </div>
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-300 bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">
                <div className="h-3 w-24 animate-pulse rounded bg-gray-300" />
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 w-24 animate-pulse rounded bg-gray-300" />
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-300" />
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-300" />
              </th>
              <th className="px-6 py-3 text-left">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-300" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <SkeletonTableRow key={i} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="border-t border-gray-300 bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-300" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-300" />
          <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-300" />
        </div>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <SkeletonStats />
      <SkeletonTable />
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
                      Packing Date
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
    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-10 text-center">
      <PackageX className="mx-auto mb-3 h-12 w-12 text-gray-400" />
      <h3 className="mb-2 text-lg font-bold text-gray-900">
        No Packings Found
      </h3>
      <p className="mb-6 text-sm text-gray-600">
        There are currently no packings in the "Awaiting Flight" status.
      </p>
      <button
        onClick={() => fetchAwaiting(page, pageSize)}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        <RefreshCw className="h-4 w-4" />
        Reload Data
      </button>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto ">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PackageSearch className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Packing Management
                </h1>
              </div>
            </div>

            <button
              onClick={() => fetchAwaiting(page, pageSize)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Reload
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && <LoadingSkeleton />}

        {/* Content */}
        {!loading &&
          (packings.length > 0 ? (
            <div className="space-y-6">
              {/* Stats Cards - Chỉ 2 cards */}
              <div className="grid grid-cols-2 gap-4">
                {/* Total Packings */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
                  <p className="mb-1 text-xs font-semibold uppercase text-blue-700">
                    Total Packings
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {packings.length}
                  </p>
                </div>

                {/* Current Page */}
                <div className="rounded-lg border border-green-200 bg-green-50 p-5">
                  <p className="mb-1 text-xs font-semibold uppercase text-green-700">
                    Current Page
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {page + 1}
                    <span className="text-xl text-gray-600">
                      /{Math.max(totalPages, 1)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow">
                {/* Table Header Info */}
                <div className="border-b border-gray-300 bg-gray-50 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      Total: {packings.length} packings
                    </span>

                    {/* Page Size Selector */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-600">
                        Show:
                      </span>
                      <div className="flex items-center gap-2">
                        {[20, 50, 100].map((size) => (
                          <button
                            key={size}
                            onClick={() => handlePageSizeChange(size)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                              pageSize === size
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-600">
                        per page
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-gray-600">
                      Page {page + 1} / {Math.max(totalPages, 1)}
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-300 bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-700">
                          Packing Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-700">
                          Packing Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-700">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-700">
                          Total Shipments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {packings.map((item) => (
                        <tr key={item.packingId} className="hover:bg-gray-50">
                          {/* Packing Code */}
                          <td className="px-6 py-4">
                            <span className="font-mono font-bold text-gray-900">
                              {item.packingCode}
                            </span>
                          </td>

                          {/* Packing Date */}
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700">
                              {item.packedDate
                                ? new Date(item.packedDate).toLocaleString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )
                                : "—"}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block rounded-lg border px-3 py-1 text-xs font-bold ${getStatusStyle(
                                item.status
                              )}`}
                            >
                              {renderStatusLabel(item.status)}
                            </span>
                          </td>

                          {/* Shipments Count */}
                          <td className="px-6 py-4">
                            <span className="font-semibold text-gray-900">
                              {item.packingList?.length || 0}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {/* View Details */}
                              <button
                                onClick={() => handleViewDetail(item.packingId)}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                                Details
                              </button>

                              {/* Add Shipment */}
                              <AddShipment
                                packingCode={item.packingCode}
                                onSuccess={reloadAwaitingList}
                              />

                              {/* Remove Shipment */}
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

                {/* Pagination */}
                <div className="border-t border-gray-300 bg-gray-50 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                      disabled={page === 0}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold ${
                        page === 0
                          ? "cursor-not-allowed bg-gray-200 text-gray-400"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <span className="text-sm font-semibold text-gray-700">
                      Page {page + 1} / {Math.max(totalPages, 1)}
                    </span>

                    <button
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages - 1))
                      }
                      disabled={totalPages === 0 || page >= totalPages - 1}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold ${
                        totalPages === 0 || page >= totalPages - 1
                          ? "cursor-not-allowed bg-gray-200 text-gray-400"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState />
          ))}
      </div>

      {/* Detail Modal */}
      <DetailModal />
    </div>
  );
};

export default RemoveShipmentList;
