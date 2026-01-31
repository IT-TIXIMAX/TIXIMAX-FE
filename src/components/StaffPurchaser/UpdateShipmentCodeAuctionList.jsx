import React, { useCallback, useEffect, useMemo, useState } from "react";
import orderlinkService from "../../Services/StaffPurchase/orderlinkService";
import {
  RefreshCw,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Copy,
  Search,
  AlertTriangle,
  Barcode,
  Package,
  X,
  Filter,
  Clock,
  Globe,
  Truck,
  User,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import UpdateShipmentCode from "./UpdateShipmentCode";
import UpdateAuctionShip from "./UpdateAuctionShip";
import toast from "react-hot-toast";

const PAGE_SIZE_DEFAULT = 10;

const StatusBadge = ({ status, count }) => {
  if (status === "missing") {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 border border-red-100">
        <div className="h-2 w-2 rounded-full bg-red-500" />
        <span className="text-sm font-medium text-red-700">
          {count} orders without shipment code
        </span>
      </div>
    );
  }
  if (status === "completed") {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 border border-emerald-100">
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-sm font-medium text-emerald-700">
          {count} orders with shipment code
        </span>
      </div>
    );
  }
  return null;
};

const hasShipWebZero = (p) => {
  const links = Array.isArray(p.pendingLinks) ? p.pendingLinks : [];
  return links.some((l) => Number(l.shipWeb) === 0);
};

const RowSkeleton = () => (
  <div className="rounded-lg border border-slate-200 bg-white">
    <div className="animate-pulse p-4">
      <div className="flex items-center gap-4">
        <div className="h-5 w-32 rounded bg-slate-200" />
        <div className="h-5 w-24 rounded bg-slate-100" />
        <div className="flex-1" />
        <div className="h-8 w-24 rounded bg-slate-200" />
      </div>
    </div>
  </div>
);

const UpdateShipmentCodeAuctionList = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(PAGE_SIZE_DEFAULT);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [data, setData] = useState(null);
  const [q, setQ] = useState("");
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState("all");
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [debouncedQ, setDebouncedQ] = useState(q);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
      }),
    [],
  );
  const formatDate = (iso) => (iso ? dateFmt.format(new Date(iso)) : "-");

  const formatPrice = (num) => {
    if (!num && num !== 0) return "0";
    return Number(num).toLocaleString("en-US");
  };

  const fetchData = useCallback(
    async (p = page, s = size) => {
      setLoading(true);
      setErr(null);
      try {
        // luôn fix status
        const res = await orderlinkService.getPurchasesShipmentCode(
          p,
          s,
          "DAU_GIA_THANH_CONG",
        );
        setData(res);
      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Failed to load data.";
        setErr(msg);
      } finally {
        setLoading(false);
      }
    },
    [page, size],
  );

  useEffect(() => {
    setPage(0);
  }, [size, debouncedQ, purchaseStatusFilter, shipmentStatusFilter]);

  useEffect(() => {
    fetchData(page, size);
  }, [page, size, fetchData]);

  const allOnPage = Array.isArray(data?.content) ? data.content : [];

  const hasShipment = (p) => {
    const links = Array.isArray(p.pendingLinks) ? p.pendingLinks : [];
    if (links.length === 0) return false;
    return links.every(
      (l) => l.shipmentCode && l.shipmentCode.toString().trim() !== "",
    );
  };

  const getPurchaseStatus = (p) => {
    const links = Array.isArray(p.pendingLinks) ? p.pendingLinks : [];
    if (links.length === 0) return null;
    return links[0]?.status || null;
  };

  const items = useMemo(() => {
    let list = allOnPage;

    if (shipmentStatusFilter === "missing") {
      list = list.filter((p) => !hasShipment(p));
    } else if (shipmentStatusFilter === "has") {
      list = list.filter((p) => hasShipment(p));
    }

    const s = debouncedQ.trim().toLowerCase();
    if (!s) return list;
    return list.filter((it) => {
      const inOrder =
        it.orderCode?.toLowerCase().includes(s) ||
        it.staffName?.toLowerCase().includes(s) ||
        it.purchaseCode?.toLowerCase().includes(s) ||
        it.customer?.name?.toLowerCase().includes(s) ||
        it.customer?.customerCode?.toLowerCase().includes(s) ||
        it.customer?.email?.toLowerCase().includes(s);
      const inLinks = (it.pendingLinks || []).some((l) => {
        const lc = String(l.linkId).toLowerCase();
        return (
          lc.includes(s) ||
          l.productName?.toLowerCase().includes(s) ||
          l.trackingCode?.toLowerCase().includes(s) ||
          l.website?.toLowerCase().includes(s)
        );
      });
      return inOrder || inLinks;
    });
  }, [allOnPage, debouncedQ, shipmentStatusFilter]);

  const hasPrev = data?.first === false || page > 0;
  const hasNext =
    data?.last === false || (items.length === size && !debouncedQ);

  const missingCountOnPage = allOnPage.filter((p) => !hasShipment(p)).length;
  const completedCountOnPage = allOnPage.filter((p) => hasShipment(p)).length;

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Tracking copied.", { position: "top-right" });
    } catch {
      toast.error("Copy failed.", { position: "top-right" });
    }
  };

  const openShipmentModal = (purchase) => {
    setSelectedPurchase(purchase);
    setShowModal(true);
  };

  const closeShipmentModal = () => {
    setShowModal(false);
    setSelectedPurchase(null);
  };

  const openAuctionModal = (purchase) => {
    setSelectedPurchase(purchase);
    setShowAuctionModal(true);
  };

  const closeAuctionModal = () => {
    setShowAuctionModal(false);
    setSelectedPurchase(null);
  };

  const handleSaveSuccess = () => {
    fetchData();
  };

  const purchaseStatusLabel = (status) => {
    const labels = {
      DAU_GIA_THANH_CONG: "Auction won",
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                <Barcode className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Shipment Code Management
                </h1>
              </div>
            </div>
            <button
              onClick={() => fetchData(page, size)}
              disabled={loading}
              className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-60 flex items-center gap-2"
              title="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by Order code, Customer name, Purchase code, product..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-11 pr-10 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5">
                <Package className="h-4 w-4 text-slate-500" />
                <select
                  value={shipmentStatusFilter}
                  onChange={(e) => setShipmentStatusFilter(e.target.value)}
                  className="border-none bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
                >
                  <option value="all">All shipment status</option>
                  <option value="missing">Missing shipment code</option>
                  <option value="has">Has shipment code</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {missingCountOnPage > 0 && (
                <StatusBadge status="missing" count={missingCountOnPage} />
              )}
              {completedCountOnPage > 0 && (
                <StatusBadge status="completed" count={completedCountOnPage} />
              )}
            </div>
            {debouncedQ && (
              <div className="text-sm text-slate-600">
                Found <span className="font-medium">{items.length}</span>{" "}
                result(s)
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {err && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{err}</p>
          </div>
        )}

        {/* Content - List Layout */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white py-16">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="mb-2 text-base font-medium text-slate-900">
              No results found
            </h3>
            <p className="mb-4 text-sm text-slate-600">
              Try adjusting your filters or search keyword.
            </p>
            <button
              onClick={() => {
                setQ("");
                setPurchaseStatusFilter("all");
                setShipmentStatusFilter("all");
                fetchData(0, size);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" /> Reset filters
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((p) => {
                const isCompleted = hasShipment(p);
                const status = getPurchaseStatus(p);
                const isAuction = status === "DAU_GIA_THANH_CONG";
                const links = Array.isArray(p.pendingLinks)
                  ? p.pendingLinks
                  : [];
                const customer = p.customer || {};

                return (
                  <div
                    key={p.purchaseId}
                    className="rounded-lg border border-slate-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Header */}
                    <div
                      className={`p-4 border-b ${
                        isCompleted
                          ? isAuction
                            ? "bg-yellow-300 border-yellow-400"
                            : "bg-emerald-300 border-emerald-400"
                          : isAuction
                            ? "bg-yellow-300 border-yellow-400"
                            : "bg-rose-300 border-rose-400"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* Left - Purchase Info */}
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-lg font-semibold text-slate-900 mb-1">
                            {p.purchaseCode}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDate(p.purchaseTime)}
                            </span>
                            {p.orderCode && (
                              <>
                                <span>---</span>
                                <span className="font-medium text-black">
                                  Order: {p.orderCode}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Right - Status & Actions */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {status && (
                            <span
                              className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium ${
                                isAuction
                                  ? "bg-yellow-100 text-black border border-yellow-300"
                                  : "bg-blue-100 text-black border border-blue-300"
                              }`}
                            >
                              {purchaseStatusLabel(status)}
                            </span>
                          )}

                          {isCompleted ? (
                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700 border border-emerald-300">
                              <CheckCircle2 className="h-4 w-4" />
                              Completed
                            </div>
                          ) : hasShipWebZero(p) ? (
                            <button
                              onClick={() => openAuctionModal(p)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
                            >
                              <Truck className="h-4 w-4" />
                              Update shipping
                            </button>
                          ) : (
                            <button
                              onClick={() => openShipmentModal(p)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                            >
                              <Package className="h-4 w-4" />
                              Update shipment
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Left Column - Purchase Image (spans full height) */}
                        <div className="lg:col-span-1">
                          {p.purchaseImage ? (
                            <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3 h-full flex flex-col">
                              <div className="flex items-center gap-2 mb-2">
                                <ImageIcon className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-700">
                                  Purchase Image
                                </span>
                              </div>
                              <div className="flex-1 flex items-center justify-center">
                                <img
                                  src={p.purchaseImage}
                                  alt="Purchase"
                                  className="max-h-80 w-full rounded-lg border-2 border-slate-200 object-contain shadow-sm hover:scale-105 transition-transform cursor-pointer"
                                  onError={(e) => {
                                    e.target.parentElement.parentElement.parentElement.style.display =
                                      "none";
                                  }}
                                  onClick={() =>
                                    window.open(p.purchaseImage, "_blank")
                                  }
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 h-full flex items-center justify-center">
                              <div className="text-center">
                                <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">
                                  No image
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column - Product Links + Staff & Customer */}
                        <div className="lg:col-span-3 space-y-4">
                          {/* Product Links */}
                          <div>
                            <div className="mb-2">
                              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Product Links ({links.length})
                              </h4>
                            </div>

                            {links.length === 0 ? (
                              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                <p className="text-sm text-slate-500">
                                  No pending links.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {links.map((l) => (
                                  <div
                                    key={l.linkId}
                                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 hover:bg-white hover:border-blue-300 transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                      <h5 className="text-sm font-medium text-slate-900 flex-1 line-clamp-2">
                                        {l.productName}
                                      </h5>
                                      {l.trackingCode && (
                                        <button
                                          onClick={() => copy(l.trackingCode)}
                                          className="flex-shrink-0 rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100"
                                          title="Copy tracking"
                                        >
                                          <Copy className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-slate-600">
                                      <div className="flex items-center gap-1.5">
                                        <Globe className="h-3.5 w-3.5" />
                                        <span>{l.website}</span>
                                      </div>
                                      <div>
                                        <span className="font-medium">
                                          Qty:
                                        </span>{" "}
                                        {l.quantity}
                                      </div>
                                      {l.classify && (
                                        <div className="col-span-2">
                                          <span className="font-medium">
                                            Classify:
                                          </span>{" "}
                                          {l.classify}
                                        </div>
                                      )}
                                      <div className="col-span-2 flex items-start gap-1.5">
                                        <span className="font-medium">
                                          Shipment:
                                        </span>
                                        <span
                                          className={`flex-1 font-mono ${
                                            l.shipmentCode?.trim()
                                              ? "text-green-700 font-semibold"
                                              : "text-slate-400"
                                          }`}
                                        >
                                          {l.shipmentCode?.trim() ||
                                            "Not assigned yet"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Staff and Customer Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Staff Info */}
                            {p.staff && (
                              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-4 w-4 text-slate-600" />
                                  <span className="text-sm font-semibold text-blue-700">
                                    Staff Information
                                  </span>
                                </div>
                                <div className="space-y-1.5 text-sm text-slate-600">
                                  {p.staff.name && (
                                    <div className="flex justify-between">
                                      <span>Name:</span>
                                      <span className="font-medium text-slate-900">
                                        {p.staff.name}
                                      </span>
                                    </div>
                                  )}
                                  {p.staff.staffCode && (
                                    <div className="flex justify-between">
                                      <span>StaffCode:</span>
                                      <span className="font-medium text-slate-900">
                                        {p.staff.staffCode}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Customer Info */}
                            {customer.name && (
                              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-semibold text-blue-700">
                                    Customer Information
                                  </span>
                                </div>
                                <div className="space-y-1.5 text-sm text-blue-900">
                                  {customer.name && (
                                    <div className="flex justify-between">
                                      <span>Name:</span>
                                      <span className="font-medium">
                                        {customer.name}
                                      </span>
                                    </div>
                                  )}
                                  {customer.customerCode && (
                                    <div className="flex justify-between">
                                      <span>CustomerCode:</span>
                                      <span className="font-medium">
                                        {customer.customerCode}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div className="text-sm text-slate-600">
                Showing <span className="font-medium">{items.length}</span>{" "}
                result(s)
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(0)}
                  disabled={!hasPrev || loading}
                  className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="First page"
                >
                  <ChevronsLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={!hasPrev || loading}
                  className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="mx-2 flex h-8 min-w-[80px] items-center justify-center rounded-md bg-slate-50 px-3 text-sm font-medium text-slate-700">
                  Page {page + 1}
                </div>

                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext || loading}
                  className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    if (data?.totalPages) setPage(data.totalPages - 1);
                  }}
                  disabled={!hasNext || !data?.totalPages}
                  className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  title="Last page"
                >
                  <ChevronsRight className="h-5 w-5" />
                </button>

                <div className="ml-2 border-l border-slate-200 pl-2">
                  <select
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Modals */}
        <UpdateShipmentCode
          isOpen={showModal}
          onClose={closeShipmentModal}
          purchase={selectedPurchase}
          onSaveSuccess={handleSaveSuccess}
        />

        <UpdateAuctionShip
          isOpen={showAuctionModal}
          onClose={closeAuctionModal}
          purchase={selectedPurchase}
          onSaveSuccess={handleSaveSuccess}
        />
      </div>
    </div>
  );
};
export default UpdateShipmentCodeAuctionList;
