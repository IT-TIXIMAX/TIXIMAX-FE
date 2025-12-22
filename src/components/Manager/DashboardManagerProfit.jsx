import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plane,
  Search,
  Package,
  Weight,
} from "lucide-react";
import dashboardService from "../../Services/Dashboard/dashboardService";
import managerRoutesService from "../../Services/Manager/managerRoutesService"; // ✅ lấy routes từ đây
import toast from "react-hot-toast";

const inputBaseClass = `
  w-full px-3 py-2 rounded-lg
  border border-gray-800
  focus:outline-none
  focus:border-blue-500
  focus:ring-1 focus:ring-blue-500
`;

/** ✅ Count-up hook: luôn chạy từ 0 -> target khi resetKey đổi */
const useCountUp = (
  targetValue,
  shouldAnimate = true,
  duration = 3000,
  resetKey = 0
) => {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const target = Number(targetValue) || 0;

    if (!shouldAnimate) {
      setDisplayValue(target);
      return;
    }

    const startValue = 0;
    const diff = target - startValue;
    startTimeRef.current = performance.now();

    const animate = (t) => {
      const elapsed = t - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = startValue + diff * ease;

      setDisplayValue(Math.round(current));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetValue, shouldAnimate, duration, resetKey]);

  return displayValue;
};

/** ✅ Animated number helper */
const AnimatedNumber = ({
  value,
  format = (n) => String(n),
  shouldAnimate = true,
  resetKey = 0,
  duration = 3000,
  className = "",
}) => {
  const v = useCountUp(value, shouldAnimate, duration, resetKey);
  return <span className={className}>{format(v)}</span>;
};

const DashboardManagerProfit = () => {
  const [debtsData, setDebtsData] = useState({
    totalPayable: 0,
    totalReceivable: 0,
  });
  const [loading, setLoading] = useState(true);

  const [flightParams, setFlightParams] = useState({
    flightCode: "",
    inputCost: "",
    minWeight: "",
  });

  // null = chưa có kết quả thật
  const [flightRevenue, setFlightRevenue] = useState(null);
  const [loadingRevenue, setLoadingRevenue] = useState(false);

  // ✅ keys để trigger animation
  const [debtsAnimKey, setDebtsAnimKey] = useState(0);
  const [flightAnimKey, setFlightAnimKey] = useState(0);

  // =========================
  // ✅ Profit (Estimated/Actual)
  // =========================
  const [profitParams, setProfitParams] = useState({
    startDate: "",
    endDate: "",
    exchangeRateActual: "", // ✅ nhập 1 lần
    routeId: "", // ✅ dropdown chọn tuyến
  });

  const [estimatedProfit, setEstimatedProfit] = useState(0);
  const [actualProfit, setActualProfit] = useState(0);
  const [loadingProfit, setLoadingProfit] = useState(false);
  const [profitAnimKey, setProfitAnimKey] = useState(0);
  const [profitLoaded, setProfitLoaded] = useState(false); // ✅ animate cả khi profit=0

  // ✅ ROUTES for dropdown
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  useEffect(() => {
    fetchDebtsTotal();
    fetchRoutesForDropdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDebtsTotal = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getDebtsTotal();
      setDebtsData(res?.data ?? { totalPayable: 0, totalReceivable: 0 });
      setDebtsAnimKey((k) => k + 1);
    } catch {
      toast.error("Lỗi khi tải dữ liệu công nợ");
    } finally {
      setLoading(false);
    }
  };

  /** ✅ Fetch routes for dropdown (dùng API thật của ManagerRoutes) */
  const fetchRoutesForDropdown = async () => {
    try {
      setLoadingRoutes(true);

      const data = await managerRoutesService.getRoutes();
      console.log("getRoutes raw:", data);

      // Bắt nhiều kiểu response:
      // - array
      // - { data: array }
      // - axios response { data: array } hoặc { data: { data: array } }
      const list = data?.data?.data ?? data?.data ?? data ?? [];

      setRoutes(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("getRoutes error:", err);
      toast.error("Lỗi khi tải danh sách tuyến");
      setRoutes([]);
    } finally {
      setLoadingRoutes(false);
    }
  };

  // 1000 -> "1.000"
  const formatNumberInput = (value) => {
    if (!value) return "";
    const num = value.toString().replace(/\D/g, "");
    if (!num) return "";
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // "1.000" -> 1000
  const parseNumberInput = (value) => {
    if (!value) return 0;
    const raw = value.toString().replace(/\./g, "").replace(/\D/g, "");
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  // Khi đổi input: reset kết quả về null => UI hiển thị 0
  const setField = (field, value) => {
    setFlightParams((prev) => ({ ...prev, [field]: value }));
    setFlightRevenue(null);
  };

  const handleNumberChange = (field, value) => {
    setField(field, formatNumberInput(value));
  };

  const canCalculate = useMemo(() => {
    const codeOk = !!flightParams.flightCode.trim();
    const costOk = parseNumberInput(flightParams.inputCost) > 0;
    const weightOk = parseNumberInput(flightParams.minWeight) > 0;
    return codeOk && costOk && weightOk;
  }, [flightParams]);

  const handleFlightRevenueSearch = async () => {
    if (!canCalculate) {
      setFlightRevenue(null);
      toast.error("Vui lòng nhập đầy đủ thông tin hợp lệ");
      return;
    }

    const flightCode = flightParams.flightCode.trim();
    const inputCost = parseNumberInput(flightParams.inputCost);
    const minWeight = parseNumberInput(flightParams.minWeight);

    try {
      setLoadingRevenue(true);
      const res = await dashboardService.getFlightRevenue(
        flightCode,
        inputCost,
        minWeight
      );
      setFlightRevenue(res?.data ?? null);
      setFlightAnimKey((k) => k + 1);
    } catch {
      setFlightRevenue(null);
      toast.error("Lỗi khi tính toán doanh thu chuyến bay");
    } finally {
      setLoadingRevenue(false);
    }
  };

  // ✅ Profit helpers: reset when input changes
  const setProfitField = (field, value) => {
    setProfitParams((p) => ({ ...p, [field]: value }));
    setProfitLoaded(false);
    setEstimatedProfit(0);
    setActualProfit(0);
  };

  // ✅ Profit fetch
  const fetchProfitData = async () => {
    const { startDate, endDate, exchangeRateActual, routeId } = profitParams;

    if (!startDate || !endDate || !exchangeRateActual || !routeId) {
      toast.error("Vui lòng nhập đầy đủ thông tin lợi nhuận");
      return;
    }

    const rate = Number(exchangeRateActual);
    if (!Number.isFinite(rate) || rate <= 0) {
      toast.error("Tỷ giá không hợp lệ");
      return;
    }

    const rid = Number(routeId);
    if (!Number.isFinite(rid) || rid <= 0) {
      toast.error("Tuyến không hợp lệ");
      return;
    }

    try {
      setLoadingProfit(true);

      const [estimatedRes, actualRes] = await Promise.all([
        dashboardService.getEstimatedProfit({
          startDate,
          endDate,
          exchangeRate: rate,
          routeId: rid,
        }),
        dashboardService.getActualProfit({
          startDate,
          endDate,
          exchangeRate: rate,
          routeId: rid,
        }),
      ]);

      setEstimatedProfit(estimatedRes?.data?.profit || 0);
      setActualProfit(actualRes?.data?.profit || 0);

      setProfitLoaded(true);
      setProfitAnimKey((k) => k + 1);
    } catch (err) {
      console.error("profit error:", err);
      toast.error("Lỗi khi tải dữ liệu lợi nhuận");
      setEstimatedProfit(0);
      setActualProfit(0);
      setProfitLoaded(true);
      setProfitAnimKey((k) => k + 1);
    } finally {
      setLoadingProfit(false);
    }
  };

  const onEnterToCalculate = (e) => {
    if (e.key === "Enter") handleFlightRevenueSearch();
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Number(n || 0));

  const formatWeight = (n) =>
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
      Number(n || 0)
    );

  const netBalance = useMemo(() => {
    const r = Number(debtsData.totalReceivable || 0);
    const p = Number(debtsData.totalPayable || 0);
    return r - p;
  }, [debtsData]);

  // ✅ Luôn có object để render (chưa tính => 0)
  const displayRevenue = useMemo(() => {
    return (
      flightRevenue ?? {
        inputCost: 0,
        totalRevenue: 0,
        netProfit: 0,
        totalChargeableWeight: 0,
        totalActualGrossWeight: 0,
      }
    );
  }, [flightRevenue]);

  // ✅ only animate when data is real
  const shouldAnimateDebts = !loading;
  const shouldAnimateFlight = flightRevenue !== null;
  const shouldAnimateProfit = profitLoaded && !loadingProfit;

  const COUNT_DURATION = 3000;

  const profitDiff = useMemo(() => {
    return Number(actualProfit || 0) - Number(estimatedProfit || 0);
  }, [actualProfit, estimatedProfit]);

  const profitDiffAbs = Math.abs(profitDiff);

  return (
    <div className="p-6 space-y-6">
      {/* Debts Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Tổng quan công nợ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng phải thu</p>
                <p className="text-xl font-bold text-gray-900">
                  {loading ? (
                    "..."
                  ) : (
                    <AnimatedNumber
                      value={debtsData.totalReceivable}
                      format={formatCurrency}
                      shouldAnimate={shouldAnimateDebts}
                      resetKey={debtsAnimKey}
                      duration={COUNT_DURATION}
                    />
                  )}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng phải trả</p>
                <p className="text-xl font-bold text-gray-900">
                  {loading ? (
                    "..."
                  ) : (
                    <AnimatedNumber
                      value={debtsData.totalPayable}
                      format={formatCurrency}
                      shouldAnimate={shouldAnimateDebts}
                      resetKey={debtsAnimKey}
                      duration={COUNT_DURATION}
                    />
                  )}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div
            className={`bg-white rounded-lg shadow p-4 border-l-4 ${
              netBalance >= 0 ? "border-green-500" : "border-orange-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Chênh lệch</p>
                <p
                  className={`text-xl font-bold ${
                    netBalance >= 0 ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {loading ? (
                    "..."
                  ) : (
                    <AnimatedNumber
                      value={Math.abs(netBalance)}
                      format={formatCurrency}
                      shouldAnimate={shouldAnimateDebts}
                      resetKey={debtsAnimKey}
                      duration={COUNT_DURATION}
                    />
                  )}
                </p>
              </div>
              <DollarSign
                className={`w-8 h-8 ${
                  netBalance >= 0 ? "text-green-500" : "text-orange-500"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Flight Revenue Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Doanh thu chuyến bay
        </h2>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã chuyến bay
              </label>
              <input
                type="text"
                value={flightParams.flightCode}
                onChange={(e) => setField("flightCode", e.target.value)}
                onKeyDown={onEnterToCalculate}
                placeholder="Flight code"
                className={inputBaseClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chi phí đầu vào (VNĐ)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={flightParams.inputCost}
                onChange={(e) =>
                  handleNumberChange("inputCost", e.target.value)
                }
                onKeyDown={onEnterToCalculate}
                placeholder="000"
                className={inputBaseClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trọng lượng tối thiểu (kg)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={flightParams.minWeight}
                onChange={(e) =>
                  handleNumberChange("minWeight", e.target.value)
                }
                onKeyDown={onEnterToCalculate}
                placeholder="000"
                className={inputBaseClass}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleFlightRevenueSearch}
                disabled={loadingRevenue}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                {loadingRevenue ? "Đang tính..." : "Tính toán"}
              </button>
            </div>
          </div>

          {/* ✅ LUÔN SHOW 5 Ô KẾT QUẢ - CHƯA TÍNH THÌ = 0 */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <p className="text-sm text-gray-600">Chi phí đầu vào</p>
                </div>
                <p className="text-lg font-bold text-gray-800">
                  <AnimatedNumber
                    value={displayRevenue.inputCost}
                    format={formatCurrency}
                    shouldAnimate={shouldAnimateFlight}
                    resetKey={flightAnimKey}
                    duration={COUNT_DURATION}
                  />
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Plane className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-gray-600">Tổng doanh thu</p>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  <AnimatedNumber
                    value={displayRevenue.totalRevenue}
                    format={formatCurrency}
                    shouldAnimate={shouldAnimateFlight}
                    resetKey={flightAnimKey}
                    duration={COUNT_DURATION}
                  />
                </p>
              </div>

              <div
                className={`rounded-lg p-4 ${
                  Number(displayRevenue.netProfit) >= 0
                    ? "bg-green-50"
                    : "bg-red-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp
                    className={`w-4 h-4 ${
                      Number(displayRevenue.netProfit) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  />
                  <p className="text-sm text-gray-600">Lợi nhuận ròng</p>
                </div>
                <p
                  className={`text-lg font-bold ${
                    Number(displayRevenue.netProfit) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  <AnimatedNumber
                    value={displayRevenue.netProfit}
                    format={formatCurrency}
                    shouldAnimate={shouldAnimateFlight}
                    resetKey={flightAnimKey}
                    duration={COUNT_DURATION}
                  />
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Weight className="w-4 h-4 text-purple-600" />
                  <p className="text-sm text-gray-600">KL tính phí</p>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  <AnimatedNumber
                    value={displayRevenue.totalChargeableWeight}
                    format={(n) => `${formatWeight(n)} g`}
                    shouldAnimate={shouldAnimateFlight}
                    resetKey={flightAnimKey}
                    duration={COUNT_DURATION}
                  />
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-orange-600" />
                  <p className="text-sm text-gray-600">KL thực tế</p>
                </div>
                <p className="text-lg font-bold text-orange-600">
                  <AnimatedNumber
                    value={displayRevenue.totalActualGrossWeight}
                    format={(n) => `${formatWeight(n)} g`}
                    shouldAnimate={shouldAnimateFlight}
                    resetKey={flightAnimKey}
                    duration={COUNT_DURATION}
                  />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Profit Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Lợi nhuận theo tuyến
        </h2>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start date
              </label>
              <input
                type="date"
                className={inputBaseClass}
                value={profitParams.startDate}
                onChange={(e) => setProfitField("startDate", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End date
              </label>
              <input
                type="date"
                className={inputBaseClass}
                value={profitParams.endDate}
                onChange={(e) => setProfitField("endDate", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tỷ giá (nhập 1 lần)
              </label>
              <input
                type="text"
                className={inputBaseClass}
                value={profitParams.exchangeRateActual}
                onChange={(e) =>
                  setProfitField("exchangeRateActual", e.target.value)
                }
                placeholder="000"
              />
            </div>

            {/* ✅ Dropdown tuyến: show tên tuyến */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tuyến
              </label>
              <select
                className={inputBaseClass}
                value={profitParams.routeId}
                onChange={(e) => setProfitField("routeId", e.target.value)}
                disabled={loadingRoutes}
              >
                <option value="">
                  {loadingRoutes ? "Đang tải tuyến..." : "Chọn tuyến"}
                </option>

                {routes.map((r) => (
                  <option key={r.routeId} value={String(r.routeId)}>
                    {r.note || r.name || `Route #${r.routeId}`}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={fetchRoutesForDropdown}
                className="mt-2 text-xs text-gray-600 hover:text-gray-900 underline"
                disabled={loadingRoutes}
              ></button>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchProfitData}
                disabled={loadingProfit}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loadingProfit ? "Đang tính..." : "Tính lợi nhuận"}
              </button>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Plane className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-gray-600">Lợi nhuận ước tính</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  <AnimatedNumber
                    value={estimatedProfit}
                    format={(n) => formatCurrency(n)}
                    shouldAnimate={shouldAnimateProfit}
                    resetKey={profitAnimKey}
                    duration={COUNT_DURATION}
                  />
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-gray-600">Lợi nhuận thực tế</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  <AnimatedNumber
                    value={actualProfit}
                    format={(n) => formatCurrency(n)}
                    shouldAnimate={shouldAnimateProfit}
                    resetKey={profitAnimKey}
                    duration={COUNT_DURATION}
                  />
                </p>
              </div>

              <div
                className={`rounded-lg p-4 ${
                  profitDiff >= 0 ? "bg-emerald-50" : "bg-orange-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign
                    className={`w-4 h-4 ${
                      profitDiff >= 0 ? "text-emerald-600" : "text-orange-600"
                    }`}
                  />
                  <p className="text-sm text-gray-600">Chênh lệch</p>
                </div>
                <p
                  className={`text-2xl font-bold ${
                    profitDiff >= 0 ? "text-emerald-600" : "text-orange-600"
                  }`}
                >
                  <AnimatedNumber
                    value={profitDiffAbs}
                    format={(n) => formatCurrency(n)}
                    shouldAnimate={shouldAnimateProfit}
                    resetKey={profitAnimKey}
                    duration={COUNT_DURATION}
                  />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardManagerProfit;
