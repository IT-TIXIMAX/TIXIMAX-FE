// src/Components/Payment/DividePaymentOrder.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import AccountSearch from "../Order/AccountSearch";
import orderCustomerService from "../../Services/Order/orderCustomerService";
import managerBankAccountService from "../../Services/Manager/managerBankAccountService";
import managerPromotionService from "../../Services/Manager/managerPromotionService";
import {
  Search,
  User,
  Package,
  CheckSquare,
  Square,
  Link2,
  RefreshCw,
  Loader2,
  DollarSign,
  Boxes,
} from "lucide-react";
import CreateDividePaymentShip from "./CreateDividePaymentShip";

/* ---------------- helpers ---------------- */
const getErrorMessage = (error) => {
  if (error?.response) {
    const be =
      error.response.data?.error ||
      error.response.data?.message ||
      error.response.data?.detail ||
      error.response.data?.errors;

    if (be) {
      if (typeof be === "object" && !Array.isArray(be)) {
        return Object.entries(be)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
      }
      if (Array.isArray(be)) return be.join(", ");
      return be;
    }
    return `Lỗi ${error.response.status}: ${
      error.response.statusText || "Không xác định"
    }`;
  }
  if (error?.request) return "Không thể kết nối tới server.";
  return error?.message || "Đã xảy ra lỗi không xác định";
};

const STATUS_MAP = {
  DA_NHAP_KHO_VN: {
    label: "Đã nhập kho VN",
    color: "bg-green-100 text-green-800",
  },
  DANG_VAN_CHUYEN: {
    label: "Đang vận chuyển",
    color: "bg-blue-100 text-blue-800",
  },
  CHO_THANH_TOAN: {
    label: "Chờ thanh toán",
    color: "bg-orange-100 text-orange-800",
  },
  DA_THANH_TOAN: {
    label: "Đã thanh toán",
    color: "bg-green-100 text-green-800",
  },
  DA_GIAO: {
    label: "Đã giao",
    color: "bg-purple-100 text-purple-800",
  },
  HUY: {
    label: "Hủy",
    color: "bg-red-100 text-red-800",
  },
};

const formatStatus = (status) =>
  STATUS_MAP[status] || {
    label: status,
    color: "bg-gray-100 text-gray-800",
  };

const safeText = (v, fallback = "—") =>
  v == null || v === "" ? fallback : String(v);

const formatKg = (v) => {
  const n = Number(v);
  if (v == null || Number.isNaN(n)) return "—";
  return `${n.toFixed(2)} kg`;
};

const formatCurrency = (amount) => {
  const n = Number(amount);
  if (amount == null || Number.isNaN(n)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
};

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

const ItemsListSkeleton = () => (
  <div className="p-4 animate-pulse">
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="h-5 w-5 bg-gray-200 rounded" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-5 w-32 bg-gray-200 rounded" />
                <div className="h-5 w-24 bg-gray-200 rounded-full" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-4 w-28 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ---------------- component ---------------- */
const DividePaymentOrder = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedSet, setSelectedSet] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [cachedBankAccounts, setCachedBankAccounts] = useState([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false);

  const [cachedVouchers, setCachedVouchers] = useState([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);

  // Prefetch bank accounts
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setBankAccountsLoading(true);
        const data = await managerBankAccountService.getProxyAccounts();
        if (mounted) setCachedBankAccounts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to prefetch bank accounts:", error);
      } finally {
        if (mounted) setBankAccountsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Prefetch vouchers
  useEffect(() => {
    let mounted = true;

    (async () => {
      const accountId = selectedCustomer?.accountId ?? selectedCustomer?.id;
      if (!accountId) {
        setCachedVouchers([]);
        return;
      }

      try {
        setVouchersLoading(true);
        const data = await managerPromotionService.getVouchersByCustomer(
          accountId
        );
        if (mounted) setCachedVouchers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to prefetch vouchers:", error);
        if (mounted) setCachedVouchers([]);
      } finally {
        if (mounted) setVouchersLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedCustomer]);

  const fetchPartialOrders = useCallback(async (customer) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("Vui lòng đăng nhập lại.");
        return;
      }

      const data = await orderCustomerService.getPartialOrdersByCustomer(
        customer.customerCode,
        token
      );

      setItems(Array.isArray(data) ? data : []);
      setHasSearched(true);
      setSelectedSet(new Set());

      if (!data || data.length === 0) {
        toast(`Không tìm thấy ${customer.customerCode}`, {
          duration: 4000,
          style: {
            background: "#f63b3b",
            color: "#fff",
          },
        });
      } else {
        toast.success(
          `Tìm thấy ${data.length} sản phẩm cho khách hàng ${customer.customerCode}`
        );
      }
    } catch (e) {
      console.error(e);
      toast.error(getErrorMessage(e));
      setItems([]);
      setSelectedSet(new Set());
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setItems([]);
    setSelectedSet(new Set());
    setHasSearched(false);
    setCachedVouchers([]);
    await fetchPartialOrders(customer);
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    setItems([]);
    setSelectedSet(new Set());
    setHasSearched(false);
    setCachedVouchers([]);
  };

  const toggleSelectItem = useCallback((linkId) => {
    setSelectedSet((prev) => {
      const next = new Set(prev);
      next.has(linkId) ? next.delete(linkId) : next.add(linkId);
      return next;
    });
  }, []);

  const selectedCount = selectedSet.size;
  const allSelected = items.length > 0 && selectedCount === items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedSet(new Set());
      return;
    }
    setSelectedSet(new Set(items.map((it) => it.linkId)));
  };

  const selectedTotal = useMemo(() => {
    if (selectedSet.size === 0) return 0;
    let sum = 0;
    for (const it of items) {
      if (selectedSet.has(it.linkId)) sum += it.finalPriceShip || 0;
    }
    return sum;
  }, [items, selectedSet]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, it) => sum + (it.finalPriceShip || 0), 0);
  }, [items]);

  const totalWeight = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.netWeight) || 0), 0);
  }, [items]);

  const selectedShipmentCodes = useMemo(() => {
    if (selectedSet.size === 0) return [];
    const s = new Set();
    for (const it of items) {
      if (selectedSet.has(it.linkId) && it.shipmentCode) s.add(it.shipmentCode);
    }
    return Array.from(s);
  }, [items, selectedSet]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Boxes size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Thanh Toán Chia Nhỏ
              </h1>
            </div>

            <button
              onClick={() => {
                if (selectedCustomer) {
                  fetchPartialOrders(selectedCustomer);
                }
              }}
              disabled={loading || !selectedCustomer}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              type="button"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Tải lại
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {loading && !hasSearched ? (
            <>
              <StatCardSkeleton />
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
                      Tổng Sản Phẩm
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {items.length}
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
                      Đã Chọn
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {selectedCount}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CheckSquare className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng Giá Trị
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(totalAmount)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng Cân Nặng
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {totalWeight.toFixed(2)} kg
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Boxes className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Customer Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Tìm Kiếm Khách Hàng
            </h2>
          </div>

          <div className="max-w-2xl">
            <AccountSearch
              onSelectAccount={handleSelectCustomer}
              onClear={handleClear}
              value={
                selectedCustomer
                  ? `${selectedCustomer.customerCode} - ${selectedCustomer.name}`
                  : ""
              }
            />
          </div>

          {/* Selected Customer Info */}
          {selectedCustomer && (
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">
                      {selectedCustomer.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-blue-900 mb-2">
                    {selectedCustomer.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-blue-800">
                        Mã KH:
                      </span>
                      <span className="text-blue-700">
                        {selectedCustomer.customerCode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-blue-800">
                        Email:
                      </span>
                      <span className="text-blue-700 truncate">
                        {selectedCustomer.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-blue-800">SĐT:</span>
                      <span className="text-blue-700">
                        {selectedCustomer.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-red-200 border-2 border-red-300 rounded-lg px-3 py-1.5 shadow-sm">
                      <span className="text-sm font-semibold text-black">
                        Số dư:
                      </span>
                      <span className="text-sm font-bold text-black">
                        {new Intl.NumberFormat("vi-VN").format(
                          selectedCustomer.balance
                        )}{" "}
                        ₫
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Items List Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header with Bulk Actions */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-semibold text-white flex items-center">
                Danh Sách Sản Phẩm
                <span className="ml-2 text-xl font-normal text-blue-100">
                  ({items.length} sản phẩm)
                </span>
              </h2>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  disabled={items.length === 0}
                  className="flex items-center text-sm text-white/90 hover:text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 mr-1" />
                  ) : (
                    <Square className="w-4 h-4 mr-1" />
                  )}
                  {allSelected ? "Chọn tất cả" : "Chọn tất cả"}
                </button>

                <div
                  className={`flex items-center space-x-3 bg-white/50 px-4 py-2 rounded-lg transition-opacity ${
                    selectedCount > 0 ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <span className="text-xl font-bold text-black">
                    Đã chọn: {selectedCount}
                  </span>
                  <span className="text-xl font-bold text-black">
                    {formatCurrency(selectedTotal)}
                  </span>

                  <CreateDividePaymentShip
                    selectedShipmentCodes={selectedShipmentCodes}
                    totalAmount={selectedTotal}
                    formatCurrency={formatCurrency}
                    accountId={
                      selectedCustomer?.accountId ?? selectedCustomer?.id
                    }
                    cachedBankAccounts={cachedBankAccounts}
                    bankAccountsLoading={bankAccountsLoading}
                    cachedVouchers={cachedVouchers}
                    vouchersLoading={vouchersLoading}
                    disabled={selectedCount === 0}
                    onSuccess={() => {
                      setSelectedSet(new Set());
                      toast.success("Thanh toán thành công!");
                    }}
                    onError={(e) => {
                      console.error("Error:", e);
                      toast.error(getErrorMessage(e));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Content */}
          {loading ? (
            <ItemsListSkeleton />
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {hasSearched ? "Không Có Sản Phẩm" : "Chưa Tìm Kiếm Khách Hàng"}
              </h3>
              <p className="text-gray-500">
                {hasSearched
                  ? "Khách hàng này chưa có sản phẩm nào cần thanh toán"
                  : "Vui lòng tìm kiếm và chọn khách hàng ở trên để xem danh sách sản phẩm"}
              </p>
            </div>
          ) : (
            <div className="p-4">
              <div className="space-y-3">
                {items.map((item, index) => {
                  const status = formatStatus(item.status);
                  const isSelected = selectedSet.has(item.linkId);

                  return (
                    <div
                      key={item.linkId}
                      className={`border-2 rounded-xl p-5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 border-blue-500 shadow-md"
                          : index % 2 === 0
                          ? "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                          : "bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                      onClick={() => toggleSelectItem(item.linkId)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectItem(item.linkId);
                          }}
                          className="mt-1 text-blue-600 hover:text-blue-800 transition-colors"
                          type="button"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-lg font-bold text-gray-900">
                                {safeText(item.shipmentCode)}
                              </h3>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                              >
                                {status.label}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                x{safeText(item.quantity, 0)}
                              </span>
                            </div>

                            <div className="text-right ml-4">
                              <div className="text-xl font-bold text-blue-600">
                                {formatCurrency(item.finalPriceShip)}
                              </div>
                              <div className="text-xs text-gray-500 font-medium">
                                Phí vận chuyển
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center text-gray-600">
                              <span className="font-semibold">Tracking:</span>
                              <span className="ml-2 text-gray-900">
                                {safeText(item.trackingCode)}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <span className="font-semibold">Cân nặng:</span>
                              <span className="ml-2 text-gray-900">
                                {formatKg(item.netWeight)}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <span className="font-semibold">Website:</span>
                              <span className="ml-2 text-gray-900">
                                {safeText(item.website)}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <span className="font-semibold">Tổng web:</span>
                              <span className="ml-2 font-bold text-gray-900">
                                {formatCurrency(item.totalWeb)}
                              </span>
                            </div>
                          </div>

                          {(item.productName || item.productLink) && (
                            <div className="mt-3 flex items-center gap-4 flex-wrap">
                              {item.productName && (
                                <span className="text-sm text-gray-600">
                                  <span className="font-semibold">SP:</span>{" "}
                                  <span className="text-gray-900">
                                    {safeText(item.productName)}
                                  </span>
                                </span>
                              )}
                              {item.productLink && (
                                <a
                                  href={item.productLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  <Link2 className="w-4 h-4" />
                                  Xem link sản phẩm
                                </a>
                              )}
                            </div>
                          )}

                          {item.note && (
                            <div className="mt-3 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                <span className="font-semibold">Ghi chú:</span>{" "}
                                {item.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DividePaymentOrder;
