import React, { useState, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import managerRoutesService from "../../Services/Manager/managerRoutesService";

const FilterRoute = ({
  value = "",
  onChange,
  label = "Tuyến đường",
  showIcon = true,
  showLabel = true,
  placeholder = "Tất cả tuyến đường",
  className = "",
  selectClassName = "",
  disabled = false,
  showNote = true,
}) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await managerRoutesService.getRoutes();
      setRoutes(data);
    } catch (err) {
      console.error("Error fetching routes:", err);
      setError("Không thể tải danh sách tuyến");
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const selectedValue = e.target.value;
    if (onChange) {
      onChange(selectedValue);
    }
  };

  return (
    <div className={className}>
      {showLabel && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          {showIcon && <MapPin className="w-4 h-4 text-blue-600" />}
          {label}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled || loading}
          className={`w-full h-12 pl-4 pr-10 rounded-xl border-2 border-gray-200 bg-white text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${selectClassName}`}
        >
          <option value="">
            {loading ? "Đang tải..." : error ? error : placeholder}
          </option>
          {routes.map((route) => (
            <option key={route.routeId} value={route.routeId}>
              {route.name}
              {showNote && route.note ? ` - ${route.note}` : ""}
            </option>
          ))}
        </select>
        <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {error && !loading && (
        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1.5">
          <span>⚠️</span>
          {error}
        </p>
      )}

      {!loading && !error && routes.length === 0 && (
        <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1.5">
          <span>⚠️</span>
          Chưa có tuyến nào được tạo
        </p>
      )}
    </div>
  );
};

export default FilterRoute;
