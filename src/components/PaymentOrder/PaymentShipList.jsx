// src/Components/Payment/PaymentShipList.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Package,
  Layers,
  DollarSign,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { getPaymentShipByShipCode } from "../../Services/Payment/paymentShipService";
import CreatePaymentShip from "./CreatePaymentShip";
import { getApiErrorMessage } from "../../Utils/getApiErrorMessage";
import AccountSearch from "../Order/AccountSearch";

const PAGE_SIZES = [10, 50, 100];

const formatCurrency = (amount) => {
  const n = Number(amount);
  if (amount == null || Number.isNaN(n)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
};

const num = (n) => {
  const v = Number(n || 0);
  return Number.isFinite(v) ? v : 0;
};

const sumBy = (arr, key) => (arr || []).reduce((s, x) => s + num(x?.[key]), 0);

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

const ListSkeleton = () => (
  <div className="space-y-3 p-4 animate-pulse">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="bg-white border border-gray-200 rounded-xl p-5 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-48 bg-gray-200 rounded" />
          </div>
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

/* ===================== Main Component ===================== */
const PaymentShipList = () => {
  const [sp, setSp] = useSearchParams();

  const [keyword, setKeyword] = useState(sp.get("keyword") || "");
  const [payment, setPayment] = useState(sp.get("payment") === "true");
  const [page, setPage] = useState(Number(sp.get("page") || 0));
  const [size, setSize] = useState(Number(sp.get("size") || 10));

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const accountId = sp.get("accountId") || null;

  // ✅ sync URL: keyword, payment, page, size, accountId
  const syncUrl = useCallback(
    (next = {}) => {
      const params = new URLSearchParams(sp);

      if ("keyword" in next) {
        const kw = String(next.keyword || "").trim();
        kw ? params.set("keyword", kw) : params.delete("keyword");
      }
      if ("payment" in next) {
        params.set("payment", String(next.payment));
      }
      if ("page" in next) params.set("page", String(next.page));
      if ("size" in next) params.set("size", String(next.size));

      if ("accountId" in next) {
        const id = next.accountId ? String(next.accountId) : "";
        id ? params.set("accountId", id) : params.delete("accountId");
      }

      setSp(params, { replace: true });
    },
    [sp, setSp],
  );

  const fetchData = async (opts = {}) => {
    const kw = String("keyword" in opts ? opts.keyword : keyword).trim();
    const pm = "payment" in opts ? opts.payment : payment;
    const p = "page" in opts ? opts.page : page;
    const s = "size" in opts ? opts.size : size;

    try {
      setLoading(true);

      // ✅ Gọi API với keyword, payment, page, size
      const data = await getPaymentShipByShipCode(kw, pm, p, s);

      let content;
      if (Array.isArray(data)) {
        content = data;
        setRows(data);
        setTotalPages(null);
      } else {
        content = data?.content || data?.data || [];
        setRows(Array.isArray(content) ? content : []);
        setTotalPages(
          Number.isFinite(Number(data?.totalPages))
            ? Number(data.totalPages)
            : null,
        );
      }

      setHasSearched(true);

      // ✅ sync URL
      syncUrl({
        keyword: kw,
        payment: pm,
        page: p,
        size: s,
        accountId: sp.get("accountId") || null,
      });

      if (kw && (content || []).length === 0) {
        toast(`Không tìm thấy dữ liệu cho "${kw}"`, {
          duration: 4000,
          style: { background: "#f63b3b", color: "#fff" },
        });
      }
    } catch (e) {
      console.error(e);
      toast.error(getApiErrorMessage(e, "Lỗi tải danh sách payment ship"));
      setRows([]);
      setTotalPages(null);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Auto load từ URL params
  useEffect(() => {
    const initialKeyword = sp.get("keyword") || "";
    const initialPayment = sp.get("payment") === "true";
    const initialPage = Number(sp.get("page") || 0);
    const initialSize = Number(sp.get("size") || 10);

    setKeyword(initialKeyword);
    setPayment(initialPayment);
    setPage(initialPage);
    setSize(initialSize);

    fetchData({
      keyword: initialKeyword,
      payment: initialPayment,
      page: initialPage,
      size: initialSize,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const totalShip = rows.length;
    const totalPackages = rows.reduce(
      (s, r) => s + (r?.warehouseShips?.length || 0),
      0,
    );
    const totalPrice = rows.reduce((s, r) => s + num(r?.totalPriceShip), 0);
    return { totalShip, totalPackages, totalPrice };
  }, [rows]);

  const canPrev = page > 0 && !loading;
  const canNext =
    !loading &&
    (totalPages == null ? rows.length === size : page < totalPages - 1);

  const handlePaymentSuccess = (data) => {
    console.log("Payment created successfully:", data);
    setPage(0);
    fetchData({ page: 0 });
  };

  const handlePaymentError = (error) => {
    console.error("Payment creation failed:", error);
    toast.error(getApiErrorMessage(error, "Tạo thanh toán thất bại"));
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* ===================== Header ===================== */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Package size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Danh Sách Thanh Toán Vận Chuyển
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== Payment Status Tabs ===================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPayment(false);
                setPage(0);
                fetchData({ payment: false, page: 0 });
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                !payment
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              type="button"
            >
              <Clock size={18} />
              Chưa Thanh Toán
            </button>
            <button
              onClick={() => {
                setPayment(true);
                setPage(0);
                fetchData({ payment: true, page: 0 });
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                payment
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              type="button"
            >
              <CheckCircle2 size={18} />
              Đã Thanh Toán
            </button>
          </div>
        </div>

        {/* ===================== Statistics Cards ===================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {loading && !hasSearched ? (
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
                      Số ShipCode
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.totalShip}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Layers className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Tổng Kiện
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.totalPackages}
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
                      Tổng Tiền Ship
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(stats.totalPrice)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ===================== Search Section ===================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-3">
            {/* AccountSearch */}
            <div className="relative flex-1">
              <AccountSearch
                value={keyword}
                placeholder="Tìm kiếm hoặc nhập mã khách hàng..."
                disabled={loading}
                onChange={(e) => {
                  setKeyword(e.target.value);
                }}
                onSelectAccount={(acc) => {
                  const code = String(acc?.customerCode || "").trim();
                  setKeyword(code);

                  const accId = acc?.accountId ?? acc?.id ?? null;
                  syncUrl({ accountId: accId });

                  setPage(0);
                  fetchData({ keyword: code, page: 0 });
                }}
                onClear={() => {
                  setKeyword("");
                  setPage(0);
                  syncUrl({ keyword: "", page: 0, accountId: null });
                  fetchData({ keyword: "", page: 0 });
                }}
              />
            </div>

            {/* Search Button */}
            <button
              onClick={() => {
                setPage(0);
                fetchData({ page: 0 });
              }}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
              type="button"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Đang tải...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Tìm kiếm
                </>
              )}
            </button>

            {/* Page Size Buttons */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
              {PAGE_SIZES.map((pageSize) => (
                <button
                  key={pageSize}
                  onClick={() => {
                    setSize(pageSize);
                    setPage(0);
                    fetchData({ size: pageSize, page: 0 });
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    size === pageSize
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  type="button"
                >
                  {pageSize}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===================== List Section ===================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              Danh Sách {payment ? "Đã Thanh Toán" : "Chưa Thanh Toán"}
              <span className="ml-2 text-xl font-normal text-blue-100">
                ({rows.length} kết quả)
              </span>
            </h2>
          </div>

          {/* Content */}
          {loading ? (
            <ListSkeleton />
          ) : rows.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  {payment ? (
                    <CheckCircle2 className="w-10 h-10 text-gray-400" />
                  ) : (
                    <Clock className="w-10 h-10 text-gray-400" />
                  )}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {hasSearched ? "Không có dữ liệu" : "Chưa tải dữ liệu"}
              </h3>
              <p className="text-gray-500">
                {hasSearched
                  ? `Không có shipment ${payment ? "đã thanh toán" : "chưa thanh toán"}.`
                  : "Bấm tìm để tải dữ liệu."}
              </p>
            </div>
          ) : (
            <div className="p-4">
              <div className="space-y-3">
                {rows.map((item, index) => {
                  const code = item?.shipCode || "-";
                  const list = item?.warehouseShips || [];

                  const sumNet = sumBy(list, "netWeight");
                  const sumW = sumBy(list, "weight");
                  const sumPrice = sumBy(list, "priceship");

                  return (
                    <div
                      key={`${code}-${index}`}
                      className={`border-2 rounded-xl overflow-hidden transition-all ${
                        index % 2 === 0
                          ? "bg-white border-gray-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      {/* Row header */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap mb-3">
                              <h3 className="text-lg font-bold text-gray-900">
                                {code}
                              </h3>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                {list.length} kiện
                              </span>
                              {payment && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                  <CheckCircle2 size={12} />
                                  Đã thanh toán
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div className="flex items-center text-gray-600">
                                <span className="font-semibold">Cân thu:</span>
                                <span className="ml-2 text-gray-900 font-medium">
                                  {sumNet.toFixed(3)} kg
                                </span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <span className="font-semibold">Cân thực:</span>
                                <span className="ml-2 text-gray-900 font-medium">
                                  {sumW.toFixed(3)} kg
                                </span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <span className="font-semibold">Giá:</span>
                                <span className="ml-2 font-bold text-gray-900">
                                  {formatCurrency(sumPrice)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right space-y-3">
                            <div>
                              <div className="text-xs text-gray-500 font-medium mb-1">
                                Tổng tiền ship
                              </div>
                              <div className="text-xl font-bold text-blue-600">
                                {formatCurrency(item?.totalPriceShip)}
                              </div>
                            </div>

                            {/* Chỉ hiện button CreatePaymentShip khi chưa thanh toán */}
                            {!payment && (
                              <CreatePaymentShip
                                shipCode={code}
                                totalAmount={item?.totalPriceShip || 0}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                                disabled={loading || !code || code === "-"}
                                accountId={accountId}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Detail table */}
                      <div className="border-t-2 border-gray-200 bg-gray-50/50 p-5">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="border-b-2 border-gray-200">
                                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                  #
                                </th>
                                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                  Shipment Code
                                </th>
                                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                  Net (kg)
                                </th>
                                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                  Weight (kg)
                                </th>
                                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                  Dài
                                </th>
                                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                  Rộng
                                </th>
                                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                  Cao
                                </th>
                                <th className="py-3 px-3 text-right text-xs font-semibold text-gray-600 uppercase">
                                  Priceship
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {list.map((w, idx) => (
                                <tr
                                  key={`${code}-${w?.shipmentCode}-${idx}`}
                                  className="border-b border-gray-200 hover:bg-blue-50/50 transition-colors"
                                >
                                  <td className="py-3 px-3 text-gray-600">
                                    {idx + 1}
                                  </td>
                                  <td className="py-3 px-3 font-semibold text-gray-900">
                                    {w?.shipmentCode || "-"}
                                  </td>
                                  <td className="py-3 px-3 text-gray-900">
                                    {num(w?.netWeight).toFixed(3)}
                                  </td>
                                  <td className="py-3 px-3 text-gray-900">
                                    {num(w?.weight).toFixed(3)}
                                  </td>
                                  <td className="py-3 px-3 text-gray-900">
                                    {num(w?.length)}
                                  </td>
                                  <td className="py-3 px-3 text-gray-900">
                                    {num(w?.width)}
                                  </td>
                                  <td className="py-3 px-3 text-gray-900">
                                    {num(w?.height)}
                                  </td>
                                  <td className="py-3 px-3 text-right font-medium text-gray-900">
                                    {formatCurrency(w?.priceship)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pagination */}
          {rows.length > 0 && (
            <div className="border-t-2 border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-gray-600">
                  Trang{" "}
                  <span className="font-semibold text-gray-900">
                    {page + 1}
                  </span>
                  {totalPages != null && (
                    <>
                      {" "}
                      /{" "}
                      <span className="font-semibold text-gray-900">
                        {totalPages}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setPage(0);
                      fetchData({ page: 0 });
                    }}
                    disabled={!canPrev}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    type="button"
                    title="Trang đầu"
                  >
                    <ChevronsLeft size={18} />
                  </button>

                  <button
                    onClick={() => {
                      const next = Math.max(0, page - 1);
                      setPage(next);
                      fetchData({ page: next });
                    }}
                    disabled={!canPrev}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    type="button"
                    title="Trang trước"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span className="px-4 py-2 text-sm font-medium text-gray-700">
                    {page + 1}
                  </span>

                  <button
                    onClick={() => {
                      const next = page + 1;
                      setPage(next);
                      fetchData({ page: next });
                    }}
                    disabled={!canNext}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    type="button"
                    title="Trang sau"
                  >
                    <ChevronRight size={18} />
                  </button>

                  <button
                    onClick={() => {
                      const next =
                        totalPages != null
                          ? Math.max(0, totalPages - 1)
                          : page + 1;
                      setPage(next);
                      fetchData({ page: next });
                    }}
                    disabled={loading || totalPages == null}
                    className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    type="button"
                    title={
                      totalPages == null
                        ? "API chưa trả totalPages"
                        : "Trang cuối"
                    }
                  >
                    <ChevronsRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentShipList;
