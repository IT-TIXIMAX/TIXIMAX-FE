// DashboardManager.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import dashboardService from "../../Services/Dashboard/dashboardService";
import { useWebSocket } from "../../hooks/useWebSocket";
import {
  Banknote,
  ClipboardList,
  CreditCard,
  Link as LinkIcon,
  Scale,
  ShoppingBag,
  Truck,
  UserPlus,
  Users,
  Loader2,
  Calendar,
  X,
} from "lucide-react";

const useCountAnimation = (
  targetValue,
  shouldAnimate = true,
  duration = 800,
) => {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const prevTargetRef = useRef(targetValue);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(targetValue);

  useEffect(() => {
    const numTarget = Number(targetValue) || 0;
    const numPrev = Number(prevTargetRef.current) || 0;

    if (numTarget === numPrev || !shouldAnimate) {
      setDisplayValue(numTarget);
      prevTargetRef.current = numTarget;
      return;
    }

    const startValue = numPrev;
    const difference = numTarget - startValue;
    startValueRef.current = startValue;
    startTimeRef.current = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const current = startValueRef.current + difference * easeProgress;
      setDisplayValue(Math.round(current));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(numTarget);
        prevTargetRef.current = numTarget;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [targetValue, shouldAnimate, duration]);

  return displayValue;
};

const AnimatedNumber = ({
  value,
  suffix = "",
  shouldAnimate = true,
  className = "",
}) => {
  const animatedValue = useCountAnimation(value || 0, shouldAnimate, 800);
  const formatNumber = (val) => Number(val).toLocaleString("vi-VN");

  return (
    <span className={className}>
      {formatNumber(animatedValue)}
      {suffix}
    </span>
  );
};

const FILTER_OPTIONS = [
  { value: "DAY", label: "Hôm nay" },
  { value: "WEEK", label: "Tuần này" },
  { value: "MONTH", label: "Tháng này" },
  { value: "QUARTER", label: "Quý này" },
  { value: "HALF_YEAR", label: "6 tháng" },
];

const DEFAULT_STATS = {
  totalOrders: 0,
  totalRevenue: 0,
  totalPurchase: 0,
  totalShip: 0,
  newCustomers: 0,
  totalLinks: 0,
  totalWeight: 0,
  totalNetWeight: 0,
};

const DashboardManager = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("DAY");

  const [stats, setStats] = useState(DEFAULT_STATS);

  const [weights, setWeights] = useState({ totalNetWeight: 0, totalWeight: 0 });
  const [payments, setPayments] = useState({
    totalCollectedAmount: 0,
    totalShipAmount: 0,
  });
  const [orders, setOrders] = useState({
    newOrderLinks: 0,
    newOrders: 0,
  });
  const [customers, setCustomers] = useState({
    newCustomers: 0,
  });

  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [hasLoadedDetailsOnce, setHasLoadedDetailsOnce] = useState(false);
  const [error, setError] = useState(null);
  const [refreshingDetails, setRefreshingDetails] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const { messages, isConnected } = useWebSocket("/topic/Tiximax");

  const formatNumber = (value) => {
    if (value == null) return 0;
    return Number(value).toLocaleString("vi-VN");
  };

  const fetchOverview = async (currentFilter) => {
    setLoadingOverview(true);
    setError(null);
    try {
      const filterRes =
        await dashboardService.getDashboardFilter(currentFilter);
      setStats(filterRes?.data || DEFAULT_STATS);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Đã xảy ra lỗi khi tải dữ liệu Tổng quan.",
      );
      setStats(DEFAULT_STATS);
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchDetails = async (currentFilter, silent = false) => {
    try {
      if (!silent) {
        setLoadingDetails(true);
        setError(null);
      } else {
        setRefreshingDetails(true);
      }

      const [weightsRes, paymentsRes, ordersRes, customersRes] =
        await Promise.all([
          dashboardService.getWeights({ filterType: currentFilter }),
          dashboardService.getPayments({ filterType: currentFilter }),
          dashboardService.getOrders({ filterType: currentFilter }),
          dashboardService.getCustomers({ filterType: currentFilter }),
        ]);

      setWeights(weightsRes?.data || { totalNetWeight: 0, totalWeight: 0 });
      setPayments(
        paymentsRes?.data || { totalCollectedAmount: 0, totalShipAmount: 0 },
      );
      setOrders(ordersRes?.data || { newOrderLinks: 0, newOrders: 0 });
      setCustomers(customersRes?.data || { newCustomers: 0 });

      if (silent) {
        setTimeout(() => setAnimationKey((prev) => prev + 1), 50);
      }

      setHasLoadedDetailsOnce(true);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Đã xảy ra lỗi khi tải dữ liệu Chi tiết.",
      );

      if (!silent) {
        setWeights({ totalNetWeight: 0, totalWeight: 0 });
        setPayments({ totalCollectedAmount: 0, totalShipAmount: 0 });
        setOrders({ newOrderLinks: 0, newOrders: 0 });
        setCustomers({ newCustomers: 0 });
      }
    } finally {
      if (!silent) setLoadingDetails(false);
      setRefreshingDetails(false);
    }
  };

  useEffect(() => {
    fetchOverview(filterType);
    fetchDetails(filterType, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  const wsTimerRef = useRef(null);

  const latestMessage = useMemo(() => {
    if (!messages || messages.length === 0) return null;
    return messages[messages.length - 1];
  }, [messages]);

  useEffect(() => {
    if (!latestMessage) return;
    if (!isConnected) return;

    const ev = String(latestMessage?.event ?? "").toUpperCase();

    const shouldRefresh =
      ev === "DASHBOARD" ||
      ev === "UPDATE" ||
      ev === "INSERT" ||
      ev === "PAYMENT" ||
      ev === "ORDER" ||
      ev === "WEIGHT" ||
      ev === "CUSTOMER" ||
      ev === "";

    if (!shouldRefresh) return;

    if (wsTimerRef.current) clearTimeout(wsTimerRef.current);

    wsTimerRef.current = setTimeout(() => {
      fetchDetails(filterType, true);
    }, 400);

    return () => {
      if (wsTimerRef.current) clearTimeout(wsTimerRef.current);
    };
  }, [latestMessage, isConnected, filterType]);

  const getFilterLabel = () => {
    const type = FILTER_OPTIONS.find((t) => t.value === filterType);
    return type?.label || "Hôm nay";
  };

  // ✅ Skeleton
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 animate-pulse">
      <div className="p-5 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 bg-gray-300 rounded" />
          <div className="p-2.5 rounded-lg bg-gray-300 w-10 h-10" />
        </div>
        <div className="h-10 md:h-12 w-32 bg-gray-300 rounded" />
      </div>
    </div>
  );

  const SkeletonSubCard = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 animate-pulse">
      <div className="p-5 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 bg-gray-300 rounded" />
          <div className="p-2.5 rounded-lg bg-gray-300 w-10 h-10" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="h-5 w-20 bg-gray-300 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="h-5 w-20 bg-gray-300 rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  const shouldAnimate = animationKey > 0;

  // ✅ class chống bể form
  const cardTitleCls =
    "text-gray-700 text-xs md:text-sm font-semibold uppercase tracking-wide truncate";
  const bigNumberCls =
    "text-2xl md:text-3xl font-bold text-gray-900 leading-none break-words tabular-nums";
  const subBigNumberCls =
    "text-2xl md:text-3xl font-bold text-gray-900 leading-none break-words tabular-nums";
  const subValueCls =
    "text-sm md:text-base font-bold text-gray-900 whitespace-nowrap";

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6 lg:p-8">
        {/* ✅ Header + FILTER INLINE (không popup) */}
        <div className="mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-yellow-300 via-yellow-300 to-yellow-300 border-2 border-black rounded-xl shadow-lg p-4 md:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Left */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1.5 h-8 md:h-9 bg-black rounded-full shrink-0 shadow-sm" />
                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl font-bold text-black leading-tight truncate">
                    Thống Kê Doanh Thu & Đơn Hàng
                  </h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-sm">
                      <Calendar className="w-4 h-4 text-black" />
                      <span className="text-xs md:text-sm font-semibold text-black whitespace-nowrap">
                        {getFilterLabel()}
                      </span>
                    </div>

                    {isConnected && (
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-400 border-2 border-black shadow-sm"
                        title="WebSocket đã kết nối - Tự động cập nhật"
                      >
                        <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
                        <span className="text-[11px] text-black font-semibold">
                          Live
                        </span>
                      </div>
                    )}

                    {refreshingDetails && (
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-400 border-2 border-black shadow-sm"
                        title="Đang cập nhật dữ liệu..."
                      >
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                        <span className="text-[11px] text-black font-semibold">
                          Đang cập nhật
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Filter buttons inline */}
              <div className="flex flex-wrap items-center gap-2">
                {FILTER_OPTIONS.map((opt) => {
                  const active = opt.value === filterType;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setFilterType(opt.value)}
                      className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all border-2 border-black shadow-sm ${
                        active
                          ? "bg-black text-yellow-400"
                          : "bg-white text-black hover:bg-gray-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-red-800 mb-1">
                  Có lỗi xảy ra
                </h3>
                <p className="text-sm text-red-700 break-words">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-red-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        )}

        {/* ✅ Tổng quan */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
            Tổng quan
          </h3>

          {loadingOverview ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array(7)
                .fill(0)
                .map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {/* ✅ Tổng doanh thu */}
              <div
                onClick={() => navigate("/manager/dashboard/revenue")}
                className="cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-black min-h-[150px]"
              >
                <div className="p-5 md:p-6 bg-gradient-to-br from-gray-200 to-gray-300 h-full">
                  <div className="flex items-center justify-between mb-4 min-w-0">
                    <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Tổng doanh thu
                    </span>
                    <div className="p-2.5 rounded-lg bg-white shrink-0">
                      <Banknote className="w-6 h-6 md:w-7 md:h-7 text-black" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className={bigNumberCls}>
                      {formatNumber(stats.totalRevenue)}
                    </span>
                    <span className="text-sm md:text-base text-black font-medium shrink-0">
                      đ
                    </span>
                  </div>
                </div>
              </div>

              {/* ✅ Tổng tiền nhập */}
              <div
                onClick={() => navigate("/manager/dashboard/revenue")}
                className="cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-black min-h-[150px]"
              >
                <div className="p-5 md:p-6 bg-gradient-to-br from-gray-200 to-gray-300 h-full">
                  <div className="flex items-center justify-between mb-4 min-w-0">
                    <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Tổng tiền nhập
                    </span>
                    <div className="p-2.5 rounded-lg bg-white shrink-0">
                      <ShoppingBag className="w-6 h-6 md:w-7 md:h-7 text-black" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className={bigNumberCls}>
                      {formatNumber(stats.totalPurchase)}
                    </span>
                    <span className="text-sm md:text-base text-black font-medium shrink-0">
                      đ
                    </span>
                  </div>
                </div>
              </div>

              {/* ✅ Tổng phí ship */}
              <div
                onClick={() => navigate("/manager/dashboard/revenue")}
                className="cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-black min-h-[150px]"
              >
                <div className="p-5 md:p-6 bg-gradient-to-br from-gray-200 to-gray-300 h-full">
                  <div className="flex items-center justify-between mb-4 min-w-0">
                    <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Tổng phí ship
                    </span>
                    <div className="p-2.5 rounded-lg bg-white shrink-0">
                      <Truck className="w-6 h-6 md:w-7 md:h-7 text-black" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className={bigNumberCls}>
                      {formatNumber(stats.totalShip)}
                    </span>
                    <span className="text-sm md:text-base text-black font-medium shrink-0">
                      đ
                    </span>
                  </div>
                </div>
              </div>

              {/* ✅ Tổng đơn hàng */}
              <div
                onClick={() => navigate("/manager/dashboard/order")}
                className="cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-black min-h-[150px]"
              >
                <div className="p-5 md:p-6 bg-gradient-to-br from-gray-200 to-gray-300 h-full">
                  <div className="flex items-center justify-between mb-4 min-w-0">
                    <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Tổng đơn hàng
                    </span>
                    <div className="p-2.5 rounded-lg bg-white shrink-0">
                      <ClipboardList className="w-6 h-6 md:w-7 md:h-7 text-black" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className={bigNumberCls}>
                      {formatNumber(stats.totalOrders)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ✅ Tổng link đơn */}
              <div
                onClick={() => navigate("/manager/dashboard/order")}
                className="cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-black min-h-[150px]"
              >
                <div className="p-5 md:p-6 bg-gradient-to-br from-gray-200 to-gray-300 h-full">
                  <div className="flex items-center justify-between mb-4 min-w-0">
                    <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Tổng link đơn
                    </span>
                    <div className="p-2.5 rounded-lg bg-white shrink-0">
                      <LinkIcon className="w-6 h-6 md:w-7 md:h-7 text-black" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className={bigNumberCls}>
                      {formatNumber(stats.totalLinks)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ✅ Khách hàng mới */}
              <div
                onClick={() => navigate("/manager/dashboard/customer")}
                className="cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-black min-h-[150px]"
              >
                <div className="p-5 md:p-6 bg-gradient-to-br from-gray-200 to-gray-300 h-full">
                  <div className="flex items-center justify-between mb-4 min-w-0">
                    <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Khách hàng mới
                    </span>
                    <div className="p-2.5 rounded-lg bg-white shrink-0">
                      <UserPlus className="w-6 h-6 md:w-7 md:h-7 text-black" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className={bigNumberCls}>
                      {formatNumber(stats.newCustomers)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ✅ Khối lượng */}
              <div
                onClick={() => navigate("/manager/dashboard/weight")}
                className="cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-black"
              >
                <div className="p-5 md:p-6 bg-gradient-to-br from-gray-200 to-gray-300">
                  <div className="flex items-center justify-between mb-4 min-w-0">
                    <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Khối lượng
                    </span>
                    <div className="p-2.5 rounded-lg bg-white shrink-0">
                      <Scale className="w-6 h-6 md:w-7 md:h-7 text-black" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className={bigNumberCls}>
                        {formatNumber(stats.totalWeight)}
                      </span>
                      <span className="text-sm md:text-base text-black font-medium shrink-0">
                        kg
                      </span>
                    </div>

                    <div className="pt-4 border-t-2 border-black">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs md:text-sm text-black font-medium truncate">
                            Khối lượng thực
                          </span>
                          <span className="text-sm md:text-base font-bold text-black whitespace-nowrap">
                            {formatNumber(stats.totalWeight)} kg
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs md:text-sm text-black font-medium truncate">
                            Khối lượng thu
                          </span>
                          <span className="text-sm md:text-base font-bold text-black whitespace-nowrap">
                            {formatNumber(stats.totalNetWeight)} kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* end overview */}
            </div>
          )}
        </div>

        {/* ✅ Chi tiết theo nhóm */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 uppercase mb-3">
            Chi tiết theo từng nhóm
          </h3>

          {!hasLoadedDetailsOnce && loadingDetails ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <SkeletonSubCard key={i} />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* ✅ Weights - VÀNG */}
              <div
                onClick={() => navigate("/manager/dashboard/weight")}
                className="cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-black min-h-[220px]"
              >
                <div className="p-5 md:p-6 bg-gradient-to-br from-yellow-300 to-yellow-300 h-full">
                  <div className="flex items-center justify-between mb-4 min-w-0">
                    <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Cân nặng
                    </span>
                    <div className="p-2.5 rounded-lg bg-yellow-500 shrink-0">
                      <Scale className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className={subBigNumberCls}>
                        <AnimatedNumber
                          key={`weight-total-${animationKey}`}
                          value={weights.totalWeight}
                          shouldAnimate={shouldAnimate}
                        />
                      </span>
                      <span className="text-sm md:text-base text-black font-medium shrink-0">
                        kg
                      </span>
                    </div>

                    <div className="pt-4 border-t-2 border-black">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs md:text-sm text-black font-medium truncate">
                            Khối lượng thực
                          </span>
                          <span className="text-sm md:text-base font-bold text-black whitespace-nowrap">
                            <AnimatedNumber
                              key={`weight-total-detail-${animationKey}`}
                              value={weights.totalWeight}
                              suffix=" kg"
                              shouldAnimate={shouldAnimate}
                            />
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs md:text-sm text-black font-medium truncate">
                            Khối lượng thu
                          </span>
                          <span className="text-sm md:text-base font-bold text-black whitespace-nowrap">
                            <AnimatedNumber
                              key={`weight-net-${animationKey}`}
                              value={weights.totalNetWeight}
                              suffix=" kg"
                              shouldAnimate={shouldAnimate}
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ Payments - ĐỎ */}
              <div
                onClick={() => navigate("/manager/dashboard/revenue")}
                className="cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-black min-h-[220px]"
              >
                <div className="p-5 md:p-6 bg-gradient-to-br from-red-300 to-red-400 h-full">
                  <div className="flex items-center justify-between mb-4 min-w-0">
                    <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Thanh toán
                    </span>
                    <div className="p-2.5 rounded-lg bg-red-500 shrink-0">
                      <CreditCard className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className={subBigNumberCls}>
                        <AnimatedNumber
                          key={`payment-collected-${animationKey}`}
                          value={payments.totalCollectedAmount}
                          shouldAnimate={shouldAnimate}
                        />
                      </span>
                      <span className="text-sm md:text-base text-black font-medium shrink-0">
                        đ
                      </span>
                    </div>

                    <div className="pt-4 border-t-2 border-black">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs md:text-sm text-black font-medium truncate">
                            Tổng tiền thu
                          </span>
                          <span className="text-sm md:text-base font-bold text-black whitespace-nowrap">
                            <AnimatedNumber
                              key={`payment-collected-detail-${animationKey}`}
                              value={payments.totalCollectedAmount}
                              suffix=" đ"
                              shouldAnimate={shouldAnimate}
                            />
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs md:text-sm text-black font-medium truncate">
                            Tổng phí ship
                          </span>
                          <span className="text-sm md:text-base font-bold text-black whitespace-nowrap">
                            <AnimatedNumber
                              key={`payment-ship-${animationKey}`}
                              value={payments.totalShipAmount}
                              suffix=" đ"
                              shouldAnimate={shouldAnimate}
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ Orders - XANH LÁ */}
              <div
                onClick={() => navigate("/manager/dashboard/order")}
                className="cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-black min-h-[220px]"
              >
                <div className="p-5 md:p-6 bg-gradient-to-br from-green-300 to-green-400 h-full">
                  <div className="flex items-center justify-between mb-4 min-w-0">
                    <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Đơn hàng
                    </span>
                    <div className="p-2.5 rounded-lg bg-green-600 shrink-0">
                      <ShoppingBag className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className={subBigNumberCls}>
                        <AnimatedNumber
                          key={`order-new-${animationKey}`}
                          value={orders.newOrders}
                          shouldAnimate={shouldAnimate}
                        />
                      </span>
                    </div>

                    <div className="pt-4 border-t-2 border-black">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs md:text-sm text-black font-medium truncate">
                            Link đơn mới
                          </span>
                          <span className="text-sm md:text-base font-bold text-black whitespace-nowrap">
                            <AnimatedNumber
                              key={`order-links-${animationKey}`}
                              value={orders.newOrderLinks}
                              shouldAnimate={shouldAnimate}
                            />
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs md:text-sm text-black font-medium truncate">
                            Đơn mới
                          </span>
                          <span className="text-sm md:text-base font-bold text-black whitespace-nowrap">
                            <AnimatedNumber
                              key={`order-new-detail-${animationKey}`}
                              value={orders.newOrders}
                              shouldAnimate={shouldAnimate}
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ Customers - XANH DƯƠNG */}
              <div
                onClick={() => navigate("/manager/dashboard/customer")}
                className="cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-black min-h-[220px]"
              >
                <div className="p-5 md:p-6 bg-gradient-to-br from-blue-300 to-blue-400 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4 min-w-0">
                    <span className="text-black text-xs md:text-sm font-semibold uppercase tracking-wide truncate">
                      Khách hàng mới
                    </span>
                    <div className="p-2.5 rounded-lg bg-blue-600 shrink-0">
                      <Users className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                  </div>

                  {/* main value */}
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className={subBigNumberCls}>
                      <AnimatedNumber
                        key={`customer-new-${animationKey}`}
                        value={customers.newCustomers}
                        shouldAnimate={shouldAnimate}
                      />
                    </span>
                  </div>

                  {/* footer */}
                  <div className="mt-auto pt-4 border-t-2 border-black">
                    <p className="text-xs md:text-sm text-black font-medium truncate">
                      Trong hôm nay
                    </p>
                  </div>
                </div>
              </div>

              {/* end details */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardManager;
