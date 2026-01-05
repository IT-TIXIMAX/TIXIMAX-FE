import React, { useState, useEffect } from "react";
import dashboardService from "../../Services/Dashboard/dashboardService";
import routesService from "../../Services/Manager/managerRoutesService";
import {
  Truck,
  DollarSign,
  Weight,
  Users,
  Calendar,
  BarChart3,
  Loader2,
  Filter,
  X,
  Trophy,
} from "lucide-react";

const DashboardKPI = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  const [filters, setFilters] = useState({
    routeId: "",
    filterType: "MONTH",
    startDate: "",
    endDate: "",
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });

  const filterTypes = [
    { value: "DAY", label: "Hôm nay" },
    { value: "MONTH", label: "Tháng này" },
    { value: "QUARTER", label: "Quý này" },
    { value: "HALF_YEAR", label: "6 tháng" },
    { value: "CUSTOM", label: "Tùy chỉnh" },
  ];

  useEffect(() => {
    fetchRoutes();
    fetchKPI();
  }, []);

  const fetchRoutes = async () => {
    try {
      const data = await routesService.getRoutes();
      setRoutes(data || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  const fetchKPI = async () => {
    setLoading(true);
    try {
      const params = { filterType: filters.filterType };

      if (filters.filterType === "CUSTOM") {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
      }

      if (filters.routeId) {
        params.routeId = filters.routeId;
      }

      const res = await dashboardService.getRoutesKPI(params);
      setData(res.data || {});
    } catch (error) {
      console.error("Error fetching KPI:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFilterDialog = () => {
    setTempFilters({ ...filters });
    setShowFilterDialog(true);
  };

  const handleCloseFilterDialog = () => {
    setShowFilterDialog(false);
  };

  const handleTempFilterChange = (key, value) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilter = () => {
    setFilters({ ...tempFilters });
    setShowFilterDialog(false);
    // Fetch sẽ được gọi qua useEffect khi filters thay đổi
    setTimeout(() => fetchKPI(), 100);
  };

  const handleResetFilter = () => {
    const defaultFilters = {
      routeId: "",
      filterType: "MONTH",
      startDate: "",
      endDate: "",
    };
    setTempFilters(defaultFilters);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const getFilterLabel = () => {
    const type = filterTypes.find((t) => t.value === filters.filterType);
    const route = routes.find((r) => r.routeId === filters.routeId);

    let label = type?.label || "Tháng này";
    if (route) {
      label += ` - ${route.name}`;
    }
    if (
      filters.filterType === "CUSTOM" &&
      filters.startDate &&
      filters.endDate
    ) {
      label = `${filters.startDate} đến ${filters.endDate}`;
      if (route) label += ` - ${route.name}`;
    }
    return label;
  };

  const calculateTotals = () => {
    let totalGoods = 0;
    let totalWeight = 0;
    let totalStaff = 0;

    Object.values(data).forEach((route) => {
      route.staffPerformances?.forEach((staff) => {
        totalGoods += staff.totalGoods || 0;
        totalWeight += staff.totalNetWeight || 0;
      });
      totalStaff += route.staffPerformances?.length || 0;
    });

    return { totalGoods, totalWeight, totalStaff };
  };

  const totals = calculateTotals();

  const getPerformanceColor = (value, max) => {
    const percent = (value / max) * 100;
    if (percent >= 70) return "bg-green-500";
    if (percent >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const maxValues = Object.values(data).reduce(
    (acc, route) => {
      const routeTotal = route.staffPerformances?.reduce(
        (sum, staff) => ({
          goods: sum.goods + (staff.totalGoods || 0),
          weight: sum.weight + (staff.totalNetWeight || 0),
        }),
        { goods: 0, weight: 0 }
      );
      return {
        goods: Math.max(acc.goods, routeTotal?.goods || 0),
        weight: Math.max(acc.weight, routeTotal?.weight || 0),
      };
    },
    { goods: 0, weight: 0 }
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-4 md:p-6">
        {/* Modern Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 md:h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Thống kê hiệu suất nhân viên
              </h1>
            </div>

            {/* Filter Button */}
            <button
              onClick={handleOpenFilterDialog}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-semibold">
                Bộ lọc
              </span>
            </button>
          </div>

          {/* Active Filter Display */}
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{getFilterLabel()}</span>
          </div>
        </div>

        {/* Filter Dialog */}
        {showFilterDialog && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
              onClick={handleCloseFilterDialog}
            ></div>

            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Dialog Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-white" />
                    <h2 className="text-xl font-bold text-white">
                      Bộ lọc dữ liệu
                    </h2>
                  </div>
                  <button
                    onClick={handleCloseFilterDialog}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Dialog Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  <div className="space-y-5">
                    {/* Route Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Chọn tuyến
                      </label>
                      <select
                        value={tempFilters.routeId}
                        onChange={(e) =>
                          handleTempFilterChange("routeId", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                      >
                        <option value="">Tất cả tuyến</option>
                        {routes.map((route) => (
                          <option key={route.routeId} value={route.routeId}>
                            {route.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Time Range Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Khoảng thời gian
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {filterTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() =>
                              handleTempFilterChange("filterType", type.value)
                            }
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                              tempFilters.filterType === type.value
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Date Range */}
                    {tempFilters.filterType === "CUSTOM" && (
                      <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-900">
                            Chọn khoảng thời gian tùy chỉnh
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Từ ngày
                            </label>
                            <input
                              type="date"
                              value={tempFilters.startDate}
                              onChange={(e) =>
                                handleTempFilterChange(
                                  "startDate",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Đến ngày
                            </label>
                            <input
                              type="date"
                              value={tempFilters.endDate}
                              onChange={(e) =>
                                handleTempFilterChange(
                                  "endDate",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dialog Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between gap-3">
                  <button
                    onClick={handleResetFilter}
                    className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
                  >
                    Đặt lại
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCloseFilterDialog}
                      className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleApplyFilter}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg text-sm font-semibold"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Modern Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="p-4 md:p-5 bg-gradient-to-br from-blue-500 to-blue-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-xs md:text-sm font-medium">
                  Tổng tuyến
                </span>
                <Truck className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">
                {Object.keys(data).length}
              </div>
              <div className="text-blue-100 text-xs mt-1">Đang hoạt động</div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="p-4 md:p-5 bg-gradient-to-br from-green-500 to-green-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100 text-xs md:text-sm font-medium">
                  Tổng giá trị
                </span>
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">
                {formatCurrency(totals.totalGoods)}
              </div>
              <div className="text-green-100 text-xs mt-1">VNĐ</div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="p-4 md:p-5 bg-gradient-to-br from-orange-500 to-orange-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-100 text-xs md:text-sm font-medium">
                  Trọng lượng
                </span>
                <Weight className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">
                {totals.totalWeight.toFixed(2)}
              </div>
              <div className="text-orange-100 text-xs mt-1">Kilogram</div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="p-4 md:p-5 bg-gradient-to-br from-purple-500 to-purple-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100 text-xs md:text-sm font-medium">
                  Nhân viên
                </span>
                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">
                {totals.totalStaff}
              </div>
              <div className="text-purple-100 text-xs mt-1">Tổng số</div>
            </div>
          </div>
        </div>

        {/* Routes Comparison Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-12 md:py-20">
            <div className="relative">
              <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-blue-600 animate-spin" />
            </div>
            <p className="text-gray-600 mt-4 font-medium text-sm md:text-base">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : Object.keys(data).length === 0 ? (
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-8 md:p-12 text-center border border-gray-100">
            <BarChart3 className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-base md:text-lg font-medium">
              Không có dữ liệu
            </p>
            <p className="text-gray-400 text-xs md:text-sm mt-2">
              Vui lòng thử lại với bộ lọc khác
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {Object.entries(data).map(([routeKey, routeData]) => {
              const routeTotal = routeData.staffPerformances?.reduce(
                (acc, staff) => ({
                  goods: acc.goods + (staff.totalGoods || 0),
                  weight: acc.weight + (staff.totalNetWeight || 0),
                }),
                { goods: 0, weight: 0 }
              );

              const maxGoodsInRoute = Math.max(
                ...(routeData.staffPerformances?.map((s) => s.totalGoods) || [
                  1,
                ])
              );

              const goodsPercent =
                maxValues.goods > 0
                  ? (routeTotal.goods / maxValues.goods) * 100
                  : 0;
              const weightPercent =
                maxValues.weight > 0
                  ? (routeTotal.weight / maxValues.weight) * 100
                  : 0;

              const topPerformer = routeData.staffPerformances
                ?.filter((s) => s.totalGoods > 0)
                .sort((a, b) => b.totalGoods - a.totalGoods)[0];

              return (
                <div
                  key={routeKey}
                  className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Simple Route Header */}
                  <div className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Truck className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      <h2 className="text-lg md:text-xl font-bold text-white">
                        {routeData.routeName}
                      </h2>
                    </div>
                  </div>

                  {/* Route Statistics */}
                  <div className="p-4 md:p-6 bg-gray-50">
                    <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">
                          Nhân viên
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-gray-800">
                          {routeData.staffPerformances?.length || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">
                          Giá trị
                        </div>
                        <div className="text-base md:text-lg font-bold text-gray-800 break-words">
                          {formatCurrency(routeTotal.goods)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">Số kg</div>
                        <div className="text-xl md:text-2xl font-bold text-gray-800">
                          {routeTotal.weight.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* Comparison Bars */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>So sánh giá trị</span>
                          <span className="font-semibold">
                            {goodsPercent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                            style={{ width: `${goodsPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>So sánh trọng lượng</span>
                          <span className="font-semibold">
                            {weightPercent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                            style={{ width: `${weightPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Top Performer */}
                    {topPerformer && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Trophy className="w-4 h-4 text-yellow-600" />
                          <span className="text-xl font-semibold text-yellow-800">
                            Nhân viên xuất sắc
                          </span>
                        </div>
                        <div className="text-xl font-medium text-gray-800">
                          {topPerformer.name}
                        </div>
                        <div className="text-2xs text-black font-semibold mt-1">
                          {formatCurrency(topPerformer.totalGoods)} VNĐ
                        </div>
                        <div className="text-2xs text-black font-semibold mt-1">
                          {topPerformer.totalNetWeight.toFixed(2)} kg
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Staff Details Table */}
                  <div className="border-t border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-600">
                              #
                            </th>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-600">
                              Mã NV
                            </th>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs font-medium text-gray-600">
                              Tên
                            </th>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-right text-xs font-medium text-gray-600">
                              Giá trị
                            </th>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-right text-xs font-medium text-gray-600">
                              KL
                            </th>
                            <th className="px-2 md:px-4 py-2 md:py-3 text-center text-xs font-medium text-gray-600">
                              %
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {routeData.staffPerformances
                            ?.sort((a, b) => b.totalGoods - a.totalGoods)
                            .map((staff, index) => {
                              const performancePercent =
                                maxGoodsInRoute > 0
                                  ? (staff.totalGoods / maxGoodsInRoute) * 100
                                  : 0;

                              return (
                                <tr
                                  key={staff.staffCode}
                                  className="hover:bg-blue-50 transition-colors"
                                >
                                  <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-700">
                                    {index + 1}
                                  </td>
                                  <td className="px-2 md:px-4 py-2 md:py-3">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold whitespace-nowrap">
                                      {staff.staffCode}
                                    </span>
                                  </td>
                                  <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-900">
                                    {staff.name}
                                  </td>
                                  <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-right font-semibold text-gray-900">
                                    {formatCurrency(staff.totalGoods)}
                                  </td>
                                  <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-right text-gray-600">
                                    {staff.totalNetWeight.toFixed(2)}
                                  </td>
                                  <td className="px-2 md:px-4 py-2 md:py-3">
                                    <div className="flex items-center justify-center gap-1 md:gap-2">
                                      <div className="w-12 md:w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full ${getPerformanceColor(
                                            performancePercent,
                                            100
                                          )} transition-all duration-500`}
                                          style={{
                                            width: `${performancePercent}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-xs font-semibold text-gray-600 w-8 md:w-10 text-right">
                                        {performancePercent.toFixed(0)}%
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardKPI;
