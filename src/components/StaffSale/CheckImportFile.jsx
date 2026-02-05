import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  PlaneTakeoff,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  CheckCircle,
  Package,
  Download,
  Truck,
  Calendar as CalendarIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import packingsService from "../../Services/Warehouse/packingsService";
import * as XLSX from "xlsx";

const PAGE_SIZES = [50, 100, 200];

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

const TableSkeleton = ({ rows = 10 }) => (
  <div className="p-4 animate-pulse">
    <div className="h-12 bg-gray-100 rounded-lg mb-4" />
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 flex-1 bg-gray-200 rounded hidden md:block" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const CheckImportFile = () => {
  const [packings, setPackings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalPackings, setTotalPackings] = useState(0);

  // Search inputs (not yet applied)
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");

  // Applied filters
  const [filterTerm, setFilterTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [selectedPackings, setSelectedPackings] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);

  // Helper function to extract error message
  const getErrorMessage = (error) => {
    if (error.response) {
      const backendError =
        error.response.data?.error ||
        error.response.data?.message ||
        error.response.data?.detail ||
        error.response.data?.errors;

      if (backendError) {
        if (typeof backendError === "object" && !Array.isArray(backendError)) {
          const errorMessages = Object.entries(backendError)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(", ");
          return `Lỗi validation: ${errorMessages}`;
        } else if (Array.isArray(backendError)) {
          return backendError.join(", ");
        } else {
          return backendError;
        }
      } else {
        return `Lỗi ${error.response.status}: ${
          error.response.statusText || "Không xác định"
        }`;
      }
    } else if (error.request) {
      return "Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.";
    } else {
      return error.message || "Đã xảy ra lỗi không xác định";
    }
  };

  // Load packings
  const loadPackings = async () => {
    setLoading(true);
    try {
      const response = await packingsService.getFlyingAwayOrders(
        page,
        pageSize,
      );
      setPackings(response.content || []);
      setTotalPackings(response.totalElements || 0);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalPackings / pageSize)),
    [totalPackings, pageSize],
  );

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(0);
  };

  const handleSearch = () => {
    setFilterTerm(searchTerm.trim());
    setFilterDate(searchDate);
    setPage(0);
  };

  const handleFirstPage = () => setPage(0);
  const handlePrevPage = () => setPage((p) => Math.max(0, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages - 1, p + 1));
  const handleLastPage = () => setPage(totalPages - 1);

  const showingFrom = totalPackings ? page * pageSize + 1 : 0;
  const showingTo = Math.min((page + 1) * pageSize, totalPackings);

  // Filter packings
  const filteredPackings = useMemo(() => {
    return packings.filter((packing) => {
      const matchesTerm =
        !filterTerm ||
        packing.packingCode.toLowerCase().includes(filterTerm.toLowerCase());
      const matchesDate =
        !filterDate || packing.packedDate.split("T")[0] === filterDate;
      return matchesTerm && matchesDate;
    });
  }, [packings, filterTerm, filterDate]);

  // Statistics
  const statistics = useMemo(() => {
    const totalProducts = filteredPackings.reduce(
      (sum, p) => sum + (p.packingList?.length || 0),
      0,
    );
    return {
      totalPackings: filteredPackings.length,
      totalProducts,
      selected: selectedPackings.length,
    };
  }, [filteredPackings, selectedPackings]);

  // Checkbox handlers
  const handleSelectPacking = (packingId) => {
    setSelectedPackings((prev) =>
      prev.includes(packingId)
        ? prev.filter((id) => id !== packingId)
        : [...prev, packingId],
    );
  };

  const handleSelectAll = () => {
    if (selectedPackings.length === filteredPackings.length) {
      setSelectedPackings([]);
    } else {
      setSelectedPackings(filteredPackings.map((p) => p.packingId));
    }
  };

  // Export Excel
  const handleExportSelected = async () => {
    if (selectedPackings.length === 0) {
      toast.error("Vui lòng chọn ít nhất một kiện hàng để xuất!");
      return;
    }

    setExportLoading(true);
    try {
      const data = await packingsService.exportPackings(selectedPackings);

      if (!data || data.length === 0) {
        toast.error("Không có dữ liệu để xuất!");
        return;
      }

      const ensureArray = (value) => {
        if (Array.isArray(value)) return value;
        if (value === null || value === undefined || value === "") return [];
        return [value];
      };

      const excelData = [
        [
          "STT",
          "Mã kiện hàng",
          "Mã chuyến bay",
          "Mã đơn hàng",
          "Mã tracking",
          "Tên sản phẩm",
          "Số lượng",
          "Giá tiền",
          "Link sản phẩm",
          "Phân loại",
          "Chiều cao",
          "Chiều dài",
          "Chiều rộng",
          "Trọng lượng",
          "Dim",
          "Net Weight",
          "Mã khách hàng",
          "Tên khách hàng",
          "Điểm đến",
          "Nhân viên",
        ],
      ];

      let stt = 1;

      data.forEach((packing) => {
        const productNames = ensureArray(packing.productNames);
        const quantities = ensureArray(packing.quantities);
        const productLinks = ensureArray(packing.productLink);

        let prices = [];
        if (Array.isArray(packing.price)) {
          prices = packing.price;
        } else if (
          typeof packing.price === "number" ||
          typeof packing.price === "string"
        ) {
          const priceValue = packing.price;
          const itemCount = Math.max(productNames.length, quantities.length, 1);
          prices = Array(itemCount).fill(priceValue);
        } else {
          prices = [];
        }

        const maxLength = Math.max(
          productNames.length,
          quantities.length,
          prices.length,
          productLinks.length,
          1,
        );

        for (let i = 0; i < maxLength; i++) {
          excelData.push([
            stt,
            packing.packingCode || "",
            packing.flightCode || "",
            packing.orderCode || "",
            packing.trackingCode || "",
            productNames[i] || "",
            quantities[i] || "",
            prices[i] !== undefined && prices[i] !== null ? prices[i] : "",
            productLinks[i] || "",
            packing.classify || "",
            packing.height || "",
            packing.length || "",
            packing.width || "",
            packing.weight ? Number(packing.weight).toFixed(4) : "",
            packing.dim ? Number(packing.dim).toFixed(4) : "",
            packing.netWeight ? Number(packing.netWeight).toFixed(2) : "",
            packing.customerCode || "",
            packing.customerName || "",
            packing.destination || "",
            packing.staffName || "",
          ]);
          stt++;
        }
      });

      const ws = XLSX.utils.aoa_to_sheet(excelData);

      ws["!cols"] = [
        { wch: 5 },
        { wch: 18 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 30 },
        { wch: 10 },
        { wch: 15 },
        { wch: 50 },
        { wch: 18 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 20 },
      ];

      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
          fill: { fgColor: { rgb: "2563EB" } },
          font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }

      for (let row = 1; row < excelData.length; row++) {
        const priceCell = XLSX.utils.encode_cell({ r: row, c: 7 });
        if (ws[priceCell] && typeof ws[priceCell].v === "number") {
          ws[priceCell].z = "#,##0";
        }
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Packings");

      const fileName = `packings_flying_export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(
        `Xuất thành công ${data.length} kiện hàng (${stt - 1} dòng chi tiết)!`,
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.message || "Export thất bại!");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <PlaneTakeoff size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Tổng Kiện Đang Vận Chuyển
              </h1>
            </div>
            <button
              onClick={loadPackings}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              Tải lại
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {loading ? (
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
                      Tổng Kiện Hàng
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {statistics.totalPackings}
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
                      Tổng Sản Phẩm
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {statistics.totalProducts}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Truck className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Đã Chọn
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                      {statistics.selected}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <CheckCircle className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filter & Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Inputs */}
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search Term */}
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm mã đóng gói ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Date Filter */}
              <div className="flex-1">
                <div className="relative">
                  <CalendarIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  type="button"
                >
                  <Search size={18} />
                  Tìm kiếm
                </button>

                <button
                  onClick={handleExportSelected}
                  disabled={selectedPackings.length === 0 || exportLoading}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  type="button"
                >
                  {exportLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Đang xuất...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Xuất Excel ({selectedPackings.length})
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Hiển thị:
              </span>
              <div className="flex gap-2">
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handlePageSizeChange(size)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      pageSize === size
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    type="button"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <TableSkeleton rows={10} />
          ) : filteredPackings.length === 0 ? (
            <div className="p-12 text-center">
              <PlaneTakeoff className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">
                Không có kiện hàng nào
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedPackings.length === filteredPackings.length &&
                          filteredPackings.length > 0
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-white/30 bg-white/10 focus:ring-white/50"
                      />
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Mã Đóng Gói
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Chuyến Bay
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Tổng Số Kiện
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold">
                      Danh Sách Sản Phẩm
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Ngày Đóng Gói
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Trạng Thái
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPackings.map((packing, index) => (
                    <tr
                      key={packing.packingId}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } ${
                        selectedPackings.includes(packing.packingId)
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPackings.includes(packing.packingId)}
                          onChange={() =>
                            handleSelectPacking(packing.packingId)
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-semibold text-blue-700 whitespace-nowrap">
                          {packing.packingCode}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900 whitespace-nowrap">
                          {packing.flightCode}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="font-medium text-gray-900">
                          {packing.packingList?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {packing.packingList?.length > 0 ? (
                            packing.packingList.slice(0, 6).map((code, idx) => (
                              <div
                                key={`${packing.packingId}-${code}-${idx}`}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg border border-blue-200"
                              >
                                <span className="text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded-full font-semibold min-w-[20px] text-center">
                                  {idx + 1}
                                </span>
                                <span className="text-sm font-mono text-gray-800">
                                  {code}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              Không có
                            </span>
                          )}
                          {packing.packingList?.length > 6 && (
                            <div className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm font-semibold">
                              +{packing.packingList.length - 6}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-700 whitespace-nowrap">
                          {new Date(packing.packedDate).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200 font-medium">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                          Đang bay
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && !loading && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
              <div className="px-6 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Info */}
                  <div className="text-sm text-gray-600">
                    Hiển thị{" "}
                    <span className="font-semibold text-gray-900">
                      {showingFrom}
                    </span>{" "}
                    -{" "}
                    <span className="font-semibold text-gray-900">
                      {showingTo}
                    </span>{" "}
                    trong tổng số{" "}
                    <span className="font-semibold text-gray-900">
                      {totalPackings}
                    </span>{" "}
                    kiện hàng
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFirstPage}
                      disabled={page === 0}
                      className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Trang đầu"
                      type="button"
                    >
                      <ChevronsLeft size={18} className="text-gray-700" />
                    </button>

                    <button
                      onClick={handlePrevPage}
                      disabled={page === 0}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      type="button"
                    >
                      <ChevronLeft size={18} className="text-gray-700" />
                      <span className="text-sm font-medium text-gray-700">
                        Trước
                      </span>
                    </button>

                    <div className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                      <span className="text-sm font-semibold">
                        {page + 1} / {totalPages}
                      </span>
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={page >= totalPages - 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      type="button"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        Sau
                      </span>
                      <ChevronRight size={18} className="text-gray-700" />
                    </button>

                    <button
                      onClick={handleLastPage}
                      disabled={page >= totalPages - 1}
                      className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      title="Trang cuối"
                      type="button"
                    >
                      <ChevronsRight size={18} className="text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckImportFile;
