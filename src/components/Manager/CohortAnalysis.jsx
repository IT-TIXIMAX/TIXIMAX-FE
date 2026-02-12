import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  RefreshCw,
  Users,
  TrendingDown,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import dashboardService from "../../Services/Dashboard/dashboardService";

/* ===================== Helpers ===================== */
const formatMonth = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  // Full tháng tiếng Việt không viết tắt
  return d.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
};

/* ===================== Heat interpolation — đa màu sắc ===================== */
// Dải màu: xanh nhạt → vàng → cam → đỏ cam → xanh lá (giống heatmap chuyên nghiệp)
const getHeatStyle = (pct) => {
  if (pct === null || pct === undefined) return null;
  const p = Math.min(100, Math.max(0, pct));
  const stops = [
    { at: 0, r: 153, g: 27, b: 27 }, // đỏ đậm     — rất thấp
    { at: 17, r: 254, g: 202, b: 202 }, // đỏ nhạt    — thấp
    { at: 33, r: 253, g: 186, b: 116 }, // cam        — trung bình
    { at: 50, r: 253, g: 224, b: 71 }, // vàng       — khá tốt
    { at: 67, r: 37, g: 99, b: 235 }, // xanh biển  — tốt
    { at: 100, r: 22, g: 163, b: 74 }, // xanh lá    — rất tốt
  ];
  let lo = stops[0],
    hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (p >= stops[i].at && p <= stops[i + 1].at) {
      lo = stops[i];
      hi = stops[i + 1];
      break;
    }
  }
  const t = lo.at === hi.at ? 0 : (p - lo.at) / (hi.at - lo.at);
  const r = Math.round(lo.r + (hi.r - lo.r) * t);
  const g = Math.round(lo.g + (hi.g - lo.g) * t);
  const b = Math.round(lo.b + (hi.b - lo.b) * t);
  return {
    backgroundColor: `rgb(${r},${g},${b})`,
    color: p <= 17 || (p >= 33 && p <= 50) ? "#374151" : "#fff",
    borderColor: `rgba(${r},${g},${b},0.4)`,
  };
};

/* ===================== Build matrix ===================== */
const buildCohortMatrix = (rawData) => {
  if (!Array.isArray(rawData) || rawData.length === 0)
    return { cohorts: [], maxIndex: 0 };
  const map = {};
  rawData.forEach((row) => {
    const key = row.firstMonth;
    if (!map[key]) map[key] = { firstMonth: key, cells: {} };
    map[key].cells[row.monthIndex] = row.activeCustomers;
  });
  const cohorts = Object.values(map).sort(
    (a, b) => new Date(a.firstMonth) - new Date(b.firstMonth),
  );
  const maxIndex = Math.max(...rawData.map((r) => r.monthIndex), 0);
  return { cohorts, maxIndex };
};

/* ===================== Tooltip ===================== */
const Tooltip = ({ visible, x, y, content }) => {
  if (!visible || !content) return null;
  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: x + 12, top: y - 10 }}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 shadow-xl"
        style={{ minWidth: 160 }}
      >
        <p className="text-gray-400 text-xs mb-1">
          {content.cohort} · Tháng +{content.idx}
        </p>
        <p className="text-white text-base font-bold leading-tight">
          {content.pct !== null ? `${content.pct}%` : "—"}
        </p>
        <p className="text-blue-300 text-xs mt-1">
          {content.count?.toLocaleString("vi-VN")} khách hàng
        </p>
      </div>
    </div>
  );
};

/* ===================== Stat Card ===================== */
const StatCard = ({ label, value, sub, icon: Icon, color }) => {
  const colors = {
    blue: { bg: "bg-blue-100", icon: "text-blue-600", val: "text-blue-600" },
    cyan: { bg: "bg-cyan-100", icon: "text-cyan-600", val: "text-cyan-700" },
    emerald: {
      bg: "bg-emerald-100",
      icon: "text-emerald-600",
      val: "text-emerald-600",
    },
  }[color] || {
    bg: "bg-blue-100",
    icon: "text-blue-600",
    val: "text-blue-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${colors.val}`}>{value}</p>
          {sub && (
            <p className="text-2xs font-semibold text-black mt-1">{sub}</p>
          )}
        </div>
        <div className={`p-3 ${colors.bg} rounded-lg`}>
          <Icon size={22} className={colors.icon} />
        </div>
      </div>
    </div>
  );
};

/* ===================== Skeleton ===================== */
const Skeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-gray-100 rounded-xl" />
      ))}
    </div>
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((r) => (
        <div key={r} className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((c) => (
            <div
              key={c}
              className="h-11 rounded-lg bg-gray-100"
              style={{ flex: c === 1 ? "0 0 130px" : 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

/* ===================== Main ===================== */
const CohortAnalysis = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.cohortAnalysis();
      setRawData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { cohorts, maxIndex } = useMemo(
    () => buildCohortMatrix(rawData),
    [rawData],
  );

  const totalNewCustomers = useMemo(
    () => cohorts.reduce((s, c) => s + (c.cells[0] ?? 0), 0),
    [cohorts],
  );

  const avgRetentionM1 = useMemo(() => {
    const rows = cohorts.filter(
      (c) => c.cells[0] > 0 && c.cells[1] !== undefined,
    );
    if (!rows.length) return null;
    return (
      rows.reduce((s, c) => s + (c.cells[1] / c.cells[0]) * 100, 0) /
      rows.length
    ).toFixed(1);
  }, [cohorts]);

  const bestCohort = useMemo(() => {
    if (cohorts.length < 2) return null;
    let best = null,
      bestPct = -1;
    cohorts.forEach((c) => {
      if (c.cells[0] > 0 && c.cells[1] !== undefined) {
        const pct = (c.cells[1] / c.cells[0]) * 100;
        if (pct > bestPct) {
          bestPct = pct;
          best = { label: formatMonth(c.firstMonth), pct: pct.toFixed(1) };
        }
      }
    });
    return best;
  }, [cohorts]);

  const showTooltip = (e, content) =>
    setTooltip({ visible: true, x: e.clientX, y: e.clientY, content });
  const moveTooltip = (e) =>
    setTooltip((t) => ({ ...t, x: e.clientX, y: e.clientY }));
  const hideTooltip = () => setTooltip((t) => ({ ...t, visible: false }));

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <TrendingDown size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Phân Tích Giữ Chân Khách Hàng
                </h1>
              </div>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors flex items-center gap-2"
              type="button"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Tải lại
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        {!loading && cohorts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard
              label="Tổng Khách Hàng Mới"
              value={totalNewCustomers.toLocaleString("vi-VN")}
              sub="trong tất cả các nhóm"
              icon={Users}
              color="blue"
            />
            <StatCard
              label="Trung Bình Giữ Chân Tháng 1"
              value={avgRetentionM1 !== null ? `${avgRetentionM1}%` : "—"}
              sub="trung bình các nhóm khách hàng"
              icon={TrendingDown}
              color="cyan"
            />
            <StatCard
              label="Nhóm Tốt Nhất"
              value={bestCohort ? `${bestCohort.pct}%` : "—"}
              sub={bestCohort ? bestCohort.label : "—"}
              icon={ArrowUpRight}
              color="emerald"
            />
          </div>
        )}

        {/* Body */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">
              <Skeleton />
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <Activity size={36} className="mx-auto text-red-300 mb-3" />
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <button
                onClick={fetchData}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                type="button"
              >
                Thử lại
              </button>
            </div>
          ) : cohorts.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Không có dữ liệu
            </div>
          ) : (
            <div className="p-5">
              {/* Chú thích màu sắc */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-xl text-blue-600 font-medium">
                  Mức độ giữ chân:
                </span>
                {[
                  { label: "Rất thấp (0–17%)", from: "#991b1b", to: "#fecaca" },
                  { label: "Thấp (17–33%)", from: "#fecaca", to: "#fdba74" },
                  {
                    label: "Trung bình (33–50%)",
                    from: "#fdba74",
                    to: "#fde047",
                  },
                  { label: "Khá tốt (50–67%)", from: "#fde047", to: "#2563eb" },
                  { label: "Tốt (67–84%)", from: "#2563eb", to: "#16a34a" },
                  {
                    label: "Rất tốt (84–100%)",
                    from: "#16a34a",
                    to: "#15803d",
                  },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-sm border border-gray-200"
                      style={{
                        background: `linear-gradient(135deg, ${l.from}, ${l.to})`,
                      }}
                    />
                    <span className="text-xl font-semibold text-black">
                      {l.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table
                  style={{
                    borderCollapse: "separate",
                    borderSpacing: "3px 3px",
                    minWidth: "max-content",
                    width: "100%",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        className="text-left px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 rounded-lg"
                        style={{ width: 160 }}
                      >
                        Nhóm Khách Hàng
                      </th>
                      <th
                        className="text-center px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 rounded-lg"
                        style={{ minWidth: 72 }}
                      >
                        Khách Mới
                      </th>
                      {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                        <th
                          key={idx}
                          className="text-center px-2 py-2 text-xs font-semibold text-gray-400 tracking-wide bg-gray-50 rounded-lg"
                          style={{ minWidth: 68 }}
                        >
                          Tháng {idx === 0 ? "Đầu" : `+${idx}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cohorts.map((cohort) => {
                      const base = cohort.cells[0] ?? 0;
                      return (
                        <tr key={cohort.firstMonth}>
                          {/* Nhóm label */}
                          <td className="px-3 py-1 text-xs font-semibold text-gray-700 whitespace-nowrap bg-gray-50 rounded-lg">
                            {formatMonth(cohort.firstMonth)}
                          </td>

                          {/* Số khách mới */}
                          <td className="p-1">
                            <div
                              className="flex flex-col items-center justify-center rounded-lg"
                              style={{
                                minWidth: 68,
                                height: 46,
                                background:
                                  "linear-gradient(135deg, #2563eb, #1d4ed8)",
                                border: "1px solid rgba(37,99,235,0.4)",
                                boxShadow: "0 2px 8px rgba(37,99,235,0.2)",
                              }}
                            >
                              <span className="text-white text-sm font-bold leading-tight">
                                {base.toLocaleString("vi-VN")}
                              </span>
                              <span className="text-blue-200 text-xs mt-0.5">
                                100%
                              </span>
                            </div>
                          </td>

                          {/* Ô tháng tiếp theo */}
                          {Array.from({ length: maxIndex + 1 }).map(
                            (_, idx) => {
                              const count = cohort.cells[idx];
                              if (count === undefined) {
                                return (
                                  <td key={idx} className="p-1">
                                    <div
                                      className="rounded-lg border border-dashed border-gray-200 bg-gray-50"
                                      style={{ minWidth: 68, height: 46 }}
                                    />
                                  </td>
                                );
                              }
                              const pct =
                                base > 0 ? Math.round((count / base) * 100) : 0;
                              const heatStyle = getHeatStyle(pct);

                              return (
                                <td key={idx} className="p-1">
                                  <div
                                    className="flex flex-col items-center justify-center rounded-lg border cursor-default"
                                    style={{
                                      minWidth: 68,
                                      height: 46,
                                      transition:
                                        "transform 0.15s, box-shadow 0.15s",
                                      ...heatStyle,
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform =
                                        "scale(1.08)";
                                      e.currentTarget.style.boxShadow =
                                        "0 4px 16px rgba(0,0,0,0.15)";
                                      showTooltip(e, {
                                        cohort: formatMonth(cohort.firstMonth),
                                        idx,
                                        pct,
                                        count,
                                      });
                                    }}
                                    onMouseMove={moveTooltip}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform =
                                        "scale(1)";
                                      e.currentTarget.style.boxShadow = "none";
                                      hideTooltip();
                                    }}
                                  >
                                    <span className="text-sm font-bold leading-tight">
                                      {pct}%
                                    </span>
                                    <span className="text-xs mt-0.5 opacity-80">
                                      {count.toLocaleString("vi-VN")}
                                    </span>
                                  </div>
                                </td>
                              );
                            },
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Thanh chú thích gradient */}
              <div className="flex items-center gap-3 mt-5">
                <span className="text-xs text-gray-400">0%</span>
                <div
                  className="flex-1 h-2 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #991b1b, #fecaca, #fdba74, #fde047, #2563eb, #16a34a)",
                  }}
                />
                <span className="text-xs text-gray-400">100%</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <Tooltip {...tooltip} />
    </div>
  );
};

export default CohortAnalysis;
