import React, { useState, useEffect } from "react";
import {
  Search,
  Package,
  Plane,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RefreshCw,
  Download,
  Eye,
} from "lucide-react";
import packingsService from "../../Services/Warehouse/packingsService";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import DetailPacking from "./DetailPacking";

const PackingAwaitList = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPackings, setSelectedPackings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [flightCode, setFlightCode] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [assignSuccess, setAssignSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  // Detail modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPackingId, setSelectedPackingId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await packingsService.getAwaitingFlightOrders(
          page,
          limit
        );
        setOrders(response.content || []);
        setSelectedPackings([]);
      } catch (err) {
        setError(err.message || "Failed to load shipments waiting for flight.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, limit]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage((prev) => prev - 1);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setLimit(newSize);
    setPage(0);
  };

  const handleSelectPacking = (packingId) => {
    setSelectedPackings((prev) =>
      prev.includes(packingId)
        ? prev.filter((id) => id !== packingId)
        : [...prev, packingId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPackings.length === filteredOrders.length) {
      setSelectedPackings([]);
    } else {
      setSelectedPackings(filteredOrders.map((order) => order.packingId));
    }
  };

  const handleAssignFlight = async () => {
    if (!flightCode.trim()) {
      setAssignError("Please enter a flight code.");
      return;
    }

    setAssignLoading(true);
    setAssignError(null);
    setAssignSuccess(null);

    try {
      await packingsService.assignFlight(selectedPackings, flightCode);
      setAssignSuccess(
        `Successfully assigned ${selectedPackings.length} packages to flight ${flightCode}.`
      );

      const response = await packingsService.getAwaitingFlightOrders(
        page,
        limit
      );
      setOrders(response.content || []);
      setSelectedPackings([]);
      setFlightCode("");
      setShowModal(false);
    } catch (err) {
      setAssignError(
        err.response?.status === 405
          ? "Method Not Allowed: Please check if the API supports this method."
          : err.message || "Failed to assign flight."
      );
    } finally {
      setAssignLoading(false);
    }
  };

  // const handleExportSelected = async () => {
  //   if (selectedPackings.length === 0) {
  //     toast.error("Vui lòng chọn ít nhất một kiện hàng để xuất!");
  //     return;
  //   }

  //   setExportLoading(true);
  //   try {
  //     const data = await packingsService.exportPackings(selectedPackings);

  //     if (data && data.length > 0) {
  //       const excelData = [
  //         [
  //           "STT",
  //           "Mã kiện hàng",
  //           "Mã chuyến bay",
  //           "Mã đơn hàng",
  //           "Mã tracking",
  //           "Tên sản phẩm",
  //           "Giá tiền",
  //           "Link sản phẩm",
  //           "Phân loại",
  //           "Chiều cao (cm)",
  //           "Chiều dài (cm)",
  //           "Chiều rộng (cm)",
  //           "Thể tích (m³)",
  //           "Trọng lượng (kg)",
  //           "Mã khách hàng",
  //           "Tên khách hàng",
  //           "Điểm đến",
  //           "Nhân viên",
  //         ],
  //         ...data.map((packing, index) => [
  //           index + 1,
  //           packing.packingCode || "",
  //           packing.flightCode || "",
  //           packing.orderCode || "",
  //           packing.trackingCode || "",
  //           packing.productNames || "",
  //           packing.price || "",
  //           packing.productLink || "",
  //           packing.classify || "",
  //           packing.height || "",
  //           packing.length || "",
  //           packing.width || "",
  //           packing.dim ? packing.dim.toFixed(4) : "",
  //           packing.netWeight ? packing.netWeight.toFixed(2) : "",
  //           packing.customerCode || "",
  //           packing.customerName || "",
  //           packing.destination || "",
  //           packing.staffName || "",
  //         ]),
  //       ];

  //       const ws = XLSX.utils.aoa_to_sheet(excelData);

  //       ws["!cols"] = [
  //         { wch: 5 },
  //         { wch: 18 },
  //         { wch: 15 },
  //         { wch: 15 },
  //         { wch: 15 },
  //         { wch: 15 },
  //         { wch: 15 },
  //         { wch: 15 },
  //         { wch: 18 },
  //         { wch: 15 },
  //         { wch: 20 },
  //         { wch: 15 },
  //         { wch: 20 },
  //       ];

  //       const range = XLSX.utils.decode_range(ws["!ref"]);
  //       for (let col = range.s.c; col <= range.e.c; col++) {
  //         const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
  //         if (!ws[cellAddress]) continue;

  //         ws[cellAddress].s = {
  //           fill: {
  //             fgColor: { rgb: "2563EB" },
  //           },
  //           font: {
  //             color: { rgb: "FFFFFF" },
  //             bold: true,
  //             sz: 12,
  //           },
  //           alignment: {
  //             horizontal: "center",
  //             vertical: "center",
  //           },
  //           border: {
  //             top: { style: "thin", color: { rgb: "000000" } },
  //             bottom: { style: "thin", color: { rgb: "000000" } },
  //             left: { style: "thin", color: { rgb: "000000" } },
  //             right: { style: "thin", color: { rgb: "000000" } },
  //           },
  //         };
  //       }

  //       const wb = XLSX.utils.book_new();
  //       XLSX.utils.book_append_sheet(wb, ws, "Packings");
  //       XLSX.writeFile(
  //         wb,
  //         `packings_export_${new Date().toISOString().split("T")[0]}.xlsx`
  //       );

  //       toast.success(`Xuất thành công ${data.length} kiện hàng!`);
  //     }
  //   } catch (error) {
  //     toast.error(error.message || "Export thất bại!");
  //   } finally {
  //     setExportLoading(false);
  //   }
  // };
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

      // Helper function to ensure array
      const ensureArray = (value) => {
        if (Array.isArray(value)) return value;
        if (value === null || value === undefined || value === "") return [];
        return [value];
      };

      // Create header
      const excelData = [
        // [
        //   "STT",
        //   "Mã kiện hàng",
        //   "Mã chuyến bay",
        //   "Mã đơn hàng",
        //   "Mã tracking",
        //   "Tên sản phẩm",
        //   "Số lượng",
        //   "Giá tiền",
        //   "Link sản phẩm",
        //   "Phân loại",
        //   "Chiều cao (cm)",
        //   "Chiều dài (cm)",
        //   "Chiều rộng (cm)",
        //   "Thể tích (m³)",
        //   "Trọng lượng (kg)",
        //   "Mã khách hàng",
        //   "Tên khách hàng",
        //   "Điểm đến",
        //   "Nhân viên",
        // ],
        [
          "No.",
          "Package Code",
          "Flight Code",
          "Order Code",
          "Tracking Code",
          "Product Name",
          "Quantity",
          "Price",
          "Product Link",
          "Category",
          "Height (cm)",
          "Length (cm)",
          "Width (cm)",
          "Dim (m³)",
          "Weight (kg)",
          "Customer Code",
          "Customer Name",
          "Destination",
          "Staff",
        ],
      ];

      let stt = 1;

      // Process each packing
      data.forEach((packing) => {
        // Convert to arrays
        const productNames = ensureArray(packing.productNames);
        const quantities = ensureArray(packing.quantities);
        const productLinks = ensureArray(packing.productLink);

        // Handle price - có thể là number hoặc array
        let prices = [];
        if (Array.isArray(packing.price)) {
          prices = packing.price;
        } else if (
          typeof packing.price === "number" ||
          typeof packing.price === "string"
        ) {
          // Nếu price là number hoặc string, tạo array với cùng số lượng items
          const priceValue = packing.price;
          const itemCount = Math.max(productNames.length, quantities.length, 1);
          prices = Array(itemCount).fill(priceValue);
        } else {
          prices = [];
        }

        // Find max length
        const maxLength = Math.max(
          productNames.length,
          quantities.length,
          prices.length,
          productLinks.length,
          1 // At least 1 row per packing
        );

        // Create a row for each product
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

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Column widths
      ws["!cols"] = [
        { wch: 5 }, // STT
        { wch: 18 }, // Mã kiện hàng
        { wch: 15 }, // Mã chuyến bay
        { wch: 15 }, // Mã đơn hàng
        { wch: 15 }, // Mã tracking
        { wch: 30 }, // Tên sản phẩm
        { wch: 10 }, // Số lượng
        { wch: 15 }, // Giá tiền (tăng width để hiển thị số lớn)
        { wch: 50 }, // Link sản phẩm
        { wch: 18 }, // Phân loại
        { wch: 12 }, // Chiều cao
        { wch: 12 }, // Chiều dài
        { wch: 12 }, // Chiều rộng
        { wch: 12 }, // Thể tích
        { wch: 15 }, // Trọng lượng
        { wch: 15 }, // Mã khách hàng
        { wch: 20 }, // Tên khách hàng
        { wch: 15 }, // Điểm đến
        { wch: 20 }, // Nhân viên
      ];

      // Style header row
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
          fill: {
            fgColor: { rgb: "2563EB" },
          },
          font: {
            color: { rgb: "FFFFFF" },
            bold: true,
            sz: 12,
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }

      // Format price columns as number with thousand separator
      for (let row = 1; row < excelData.length; row++) {
        const priceCell = XLSX.utils.encode_cell({ r: row, c: 7 }); // Column H (Giá tiền)
        if (ws[priceCell] && typeof ws[priceCell].v === "number") {
          ws[priceCell].z = "#,##0"; // Format số với dấu phẩy
        }
      }

      // Create workbook and export
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Packings");

      const fileName = `packings_export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(
        `Xuất thành công ${data.length} kiện hàng (${stt - 1} dòng chi tiết)!`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.message || "Export thất bại!");
    } finally {
      setExportLoading(false);
    }
  };

  const handleViewDetail = (packingId) => {
    setSelectedPackingId(packingId);
    setShowDetailModal(true);
  };

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      order.packingCode.toLowerCase().includes(term) ||
      order.packingId.toLowerCase?.().includes(term);

    const matchesDate =
      !filterDate ||
      new Date(order.packedDate).toDateString() ===
        new Date(filterDate).toDateString();

    return matchesSearch && matchesDate;
  });

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Plane size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                Packages Waiting for Flight
              </h1>
            </div>
          </div>
        </div>

        {/* Success/Error Messages (Assign Flight) */}
        {assignSuccess && (
          <div className="mb-3 p-2.5 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-400 mr-2" />
              <p className="text-green-700 text-sm">{assignSuccess}</p>
            </div>
          </div>
        )}

        {assignError && (
          <div className="mb-3 p-2.5 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <div className="flex items-center">
              <X className="w-4 h-4 text-red-400 mr-2" />
              <p className="text-red-700 text-sm">{assignError}</p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search packing code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Date Filter */}
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Page Size */}
              <select
                value={limit}
                onChange={handlePageSizeChange}
                disabled={loading}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={30}>30 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
                {/* <option value={200}>200 / page</option> */}
                <option value={200}>200 / page</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Export Button */}
              <button
                onClick={handleExportSelected}
                disabled={selectedPackings.length === 0 || exportLoading}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPackings.length === 0 || exportLoading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 hover:shadow-md"
                }`}
              >
                {exportLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export ({selectedPackings.length})
                  </>
                )}
              </button>

              {/* Assign Flight Button */}
              <button
                onClick={() => setShowModal(true)}
                disabled={selectedPackings.length === 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPackings.length === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                }`}
              >
                <Plane className="w-4 h-4" />
                Assign Flight ({selectedPackings.length})
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center px-3 py-2 font-semibold leading-5 text-sm text-blue-600">
              <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" />
              Loading data...
            </div>
          </div>
        )}

        {/* Error State (Fetch) */}
        {error && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
            <X className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-2">
              An error occurred
            </h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-2">
              No packages found
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm || filterDate
                ? "No matching results."
                : "There are currently no packages waiting for flight assignment."}
            </p>
          </div>
        )}

        {/* Table */}
        {filteredOrders.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      selectedPackings.length === filteredOrders.length &&
                      filteredOrders.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-700">
                    Select all ({filteredOrders.length})
                  </span>
                </label>
                <span className="text-gray-500">
                  Selected: {selectedPackings.length} packages
                </span>
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left w-12">
                      <span className="sr-only">Checkbox</span>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        Packing Code
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package List
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Packing Date
                      </div>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.packingId}
                      className={`hover:bg-blue-50 transition-colors ${
                        selectedPackings.includes(order.packingId)
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedPackings.includes(order.packingId)}
                          onChange={() => handleSelectPacking(order.packingId)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>

                      {/* Packing Code */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {order.packingCode}
                        </span>
                      </td>

                      {/* Packing List */}
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {order.packingList && order.packingList.length > 0 ? (
                            <>
                              {order.packingList
                                .slice(0, 2)
                                .map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                                  >
                                    {item}
                                  </span>
                                ))}
                              {order.packingList.length > 2 && (
                                <span className="inline-block px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded font-medium">
                                  +{order.packingList.length - 2}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </div>
                      </td>

                      {/* Packed Date */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="text-xs text-gray-600">
                          {formatDate(order.packedDate)}
                        </span>
                      </td>

                      {/* Flight Status */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {order.flightCode ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            {order.flightCode}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            Waiting for flight
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2.5 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleViewDetail(order.packingId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="flex items-center justify-between mt-3 bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-2.5">
            <button
              onClick={handlePrevPage}
              disabled={page === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                page === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Page</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                {page + 1}
              </span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={orders.length < limit}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                orders.length < limit
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Assign Flight Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Plane className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Assign Flight
                  </h3>
                </div>

                <div className="mb-5">
                  <p className="text-gray-600 text-sm mb-3">
                    Assign a flight to{" "}
                    <span className="font-semibold text-blue-600">
                      {selectedPackings.length}
                    </span>{" "}
                    selected packages.
                  </p>

                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Flight code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={flightCode}
                    onChange={(e) => setFlightCode(e.target.value)}
                    placeholder="E.g.: FL123, VN456"
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />

                  {assignError && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {assignError}
                    </p>
                  )}
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setFlightCode("");
                      setAssignError(null);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignFlight}
                    disabled={assignLoading || !flightCode.trim()}
                    className={`flex-1 px-4 py-2.5 text-sm rounded-lg font-medium transition-all ${
                      assignLoading || !flightCode.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {assignLoading ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <RefreshCw className="animate-spin h-3.5 w-3.5" />
                        Processing...
                      </span>
                    ) : (
                      "Confirm"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedPackingId && (
          <DetailPacking
            packingId={selectedPackingId}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedPackingId(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PackingAwaitList;
