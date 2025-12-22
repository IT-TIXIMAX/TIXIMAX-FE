// DashboardManager.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import dashboardService from "../../Services/Dashboard/dashboardService";
import { useWebSocket } from "../../hooks/useWebSocket";
import {
  AlertCircle,
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
} from "lucide-react";

// IMPROVED: Custom Hook với better state management
const useCountAnimation = (
  targetValue,
  shouldAnimate = true,
  duration = 800
) => {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const prevTargetRef = useRef(targetValue);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const startValueRef = useRef(targetValue);

  useEffect(() => {
    const numTarget = Number(targetValue) || 0;
    const numPrev = Number(prevTargetRef.current) || 0;

    // Nếu giá trị không đổi hoặc không animate → set trực tiếp
    if (numTarget === numPrev || !shouldAnimate) {
      setDisplayValue(numTarget);
      prevTargetRef.current = numTarget;
      return;
    }

    // Bắt đầu animation
    const startValue = numPrev;
    const difference = numTarget - startValue;
    startValueRef.current = startValue;
    startTimeRef.current = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: easeOutQuart - smooth và natural
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, shouldAnimate, duration]);

  return displayValue;
};

// ✨ Component hiển thị số với animation
const AnimatedNumber = ({
  value,
  suffix = "",
  shouldAnimate = true,
  className = "",
}) => {
  const animatedValue = useCountAnimation(value || 0, shouldAnimate, 800);

  const formatNumber = (val) => {
    return Number(val).toLocaleString("vi-VN");
  };

  return (
    <span className={className}>
      {formatNumber(animatedValue)}
      {suffix}
    </span>
  );
};

const FILTER_OPTIONS = [
  { value: "DAY", label: "Hôm nay" },
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
  const [filterType, setFilterType] = useState("DAY");

  // API tổng (filter)
  const [stats, setStats] = useState(DEFAULT_STATS);

  // 4 API con
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

  // ✨ NEW: Counter để force re-animation mỗi lần WS update
  const [animationKey, setAnimationKey] = useState(0);

  // ✨ Connect WebSocket
  const { messages, isConnected } = useWebSocket("/topic/Tiximax");

  const formatNumber = (value) => {
    if (value == null) return 0;
    return Number(value).toLocaleString("vi-VN");
  };

  const fetchOverview = async (currentFilter) => {
    setLoadingOverview(true);
    setError(null);
    try {
      const filterRes = await dashboardService.getDashboardFilter(
        currentFilter
      );
      setStats(filterRes?.data || DEFAULT_STATS);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Đã xảy ra lỗi khi tải dữ liệu Tổng quan."
      );
      setStats(DEFAULT_STATS);
    } finally {
      setLoadingOverview(false);
    }
  };

  // ✅ UPDATE: Simplified logic
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

      // ✨ Set data như bình thường
      setWeights(weightsRes?.data || { totalNetWeight: 0, totalWeight: 0 });
      setPayments(
        paymentsRes?.data || {
          totalCollectedAmount: 0,
          totalShipAmount: 0,
        }
      );
      setOrders(
        ordersRes?.data || {
          newOrderLinks: 0,
          newOrders: 0,
        }
      );
      setCustomers(customersRes?.data || { newCustomers: 0 });

      // ✨ Nếu là silent (WS update) → trigger animation bằng cách tăng key
      if (silent) {
        // Dùng setTimeout nhỏ để đảm bảo state đã update
        setTimeout(() => {
          setAnimationKey((prev) => prev + 1);
        }, 50);
      }

      setHasLoadedDetailsOnce(true);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Đã xảy ra lỗi khi tải dữ liệu Chi tiết."
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

  // Load data theo filter
  useEffect(() => {
    fetchOverview(filterType);
    fetchDetails(filterType, false);
  }, [filterType]);

  // ✅ WebSocket: refresh Chi tiết
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

  // Skeleton
  const SkeletonCard = () => (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-24 rounded bg-gray-100" />
          <div className="h-6 w-16 rounded bg-gray-100" />
        </div>
        <div className="h-8 w-32 rounded bg-gray-100" />
      </div>
    </div>
  );

  const SkeletonSubCard = () => (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-28 rounded bg-gray-100" />
          <div className="h-6 w-10 rounded bg-gray-100" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-3/4 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );

  // ✨ Determine nên animate hay không (chỉ khi có animationKey > 0)
  const shouldAnimate = animationKey > 0;

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-sky-300 px-6 py-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-black mb-1">
                <span>Dashboard</span>
                <span className="h-1 w-1 rounded-full bg-black-300" />
                <span>Doanh thu & đơn hàng</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <Banknote className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-semibold text-black">
                    Thống kê doanh thu & đơn hàng
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 md:items-end">
              <span className="text-xs font-medium uppercase tracking-wide text-black-500">
                Khoảng thời gian
              </span>

              <div className="inline-flex rounded-xl bg-gray-100 p-1">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilterType(opt.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      filterType === opt.value
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tổng quan */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">
            Tổng quan
          </h3>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
            {loadingOverview ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                {/* Tổng doanh thu */}
                <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200 p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                        Tổng doanh thu
                      </p>
                      <p className="mt-2 text-xl font-bold text-gray-900">
                        {formatNumber(stats.totalRevenue)} đ
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3">
                      <Banknote className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Tổng tiền nhập */}
                <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200 p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                        Tổng tiền nhập
                      </p>
                      <p className="mt-2 text-xl font-bold text-gray-900">
                        {formatNumber(stats.totalPurchase)} đ
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3">
                      <ShoppingBag className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Tổng phí ship */}
                <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200 p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                        Tổng phí ship
                      </p>
                      <p className="mt-2 text-xl font-bold text-gray-900">
                        {formatNumber(stats.totalShip)} đ
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3">
                      <Truck className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Tổng đơn hàng */}
                <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200 p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                        Tổng đơn hàng
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {formatNumber(stats.totalOrders)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3">
                      <ClipboardList className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Tổng link đơn */}
                <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200 p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                        Tổng link đơn
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {formatNumber(stats.totalLinks)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3">
                      <LinkIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Khách hàng mới (tổng) */}
                <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200 p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                        Khách hàng mới (tổng)
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {formatNumber(stats.newCustomers)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3">
                      <UserPlus className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Tổng khối lượng */}
                <div className="rounded-2xl bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200 p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-900">
                        Tổng khối lượng thực | Thu
                      </p>
                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        {formatNumber(stats.totalWeight)} kg |{" "}
                        {formatNumber(stats.totalNetWeight)} kg
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3">
                      <Scale className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chi tiết theo nhóm - ✨ VỚI ANIMATION */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700 uppercase">
              Chi tiết theo từng nhóm
            </h3>

            <div className="flex items-center gap-2">
              {isConnected && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 border border-green-200"
                  title="WebSocket đã kết nối - Tự động cập nhật chi tiết"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-700 font-medium">
                    Live
                  </span>
                </div>
              )}

              {refreshingDetails && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 border border-blue-200"
                  title="Đang cập nhật dữ liệu chi tiết..."
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span className="text-xs text-blue-700 font-medium">
                    Updating
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {!hasLoadedDetailsOnce && loadingDetails ? (
              <>
                <SkeletonCard />
                <SkeletonSubCard />
                <SkeletonSubCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                {/* ✨ Weights - VỚI ANIMATION */}
                <div className="rounded-2xl bg-gradient-to-br from-blue-100 to-blue-300 p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-700">
                      Cân nặng
                    </p>
                    <div className="rounded-xl bg-white/70 p-3">
                      <Scale className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-2 text-base text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Khối lượng thu</span>
                      <span className="text-xl font-bold text-gray-900">
                        <AnimatedNumber
                          key={`weight-net-${animationKey}`}
                          value={weights.totalNetWeight}
                          suffix=" kg"
                          shouldAnimate={shouldAnimate}
                        />
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Khối lượng thực</span>
                      <span className="text-xl font-bold text-gray-900">
                        <AnimatedNumber
                          key={`weight-total-${animationKey}`}
                          value={weights.totalWeight}
                          suffix=" kg"
                          shouldAnimate={shouldAnimate}
                        />
                      </span>
                    </div>
                  </div>
                </div>

                {/* ✨ Payments - VỚI ANIMATION */}
                <div className="rounded-2xl bg-gradient-to-br from-purple-100 to-purple-300 p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-700">
                      Thanh toán
                    </p>
                    <div className="rounded-xl bg-white/70 p-3">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="space-y-2 text-base text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Tổng tiền thu</span>
                      <span className="text-xl font-bold text-gray-900">
                        <AnimatedNumber
                          key={`payment-collected-${animationKey}`}
                          value={payments.totalCollectedAmount}
                          suffix=" đ"
                          shouldAnimate={shouldAnimate}
                        />
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Tổng phí ship</span>
                      <span className="text-xl font-bold text-gray-900">
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

                {/* ✨ Orders - VỚI ANIMATION */}
                <div className="rounded-2xl bg-gradient-to-br from-green-100 to-green-300 p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-700">
                      Đơn hàng
                    </p>
                    <div className="rounded-xl bg-white/70 p-3">
                      <ShoppingBag className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-2 text-base text-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Link đơn mới</span>
                      <span className="text-xl font-bold text-gray-900">
                        <AnimatedNumber
                          key={`order-links-${animationKey}`}
                          value={orders.newOrderLinks}
                          shouldAnimate={shouldAnimate}
                        />
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Đơn mới</span>
                      <span className="text-xl font-bold text-gray-900">
                        <AnimatedNumber
                          key={`order-new-${animationKey}`}
                          value={orders.newOrders}
                          shouldAnimate={shouldAnimate}
                        />
                      </span>
                    </div>
                  </div>
                </div>

                {/* ✨ Customers - VỚI ANIMATION */}
                <div className="rounded-2xl bg-gradient-to-br from-yellow-100 to-yellow-300 p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-700">
                      Khách hàng
                    </p>
                    <div className="rounded-xl bg-white/70 p-3">
                      <Users className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-gray-900">
                    <AnimatedNumber
                      key={`customer-new-${animationKey}`}
                      value={customers.newCustomers}
                      shouldAnimate={shouldAnimate}
                    />
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Số khách hàng mới trong khoảng thời gian chọn
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardManager;
