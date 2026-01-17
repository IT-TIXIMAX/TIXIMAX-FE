import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Search,
  Warehouse,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Eye,
  ImageIcon,
  Edit,
  X,
  ZoomIn,
  Weight,
} from "lucide-react";
import toast from "react-hot-toast";
import warehouseService from "../../Services/Warehouse/warehouseService";
import DetailWarehouse from "../Warehouse/DetailWarehouse";
import UpdateWarehouse from "./UpdateWarehouse";

/* ===================== Helpers ===================== */
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const formatKg = (v, digits = 3) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return "-";
  return n.toFixed(digits);
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/* ===================== Skeletons ===================== */
const TableSkeleton = ({ rows = 8 }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="h-12 bg-gray-100 border-b border-gray-200 animate-pulse" />
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="p-4 flex gap-4 animate-pulse">
          <div className="w-14 h-14 bg-gray-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-3 w-72 bg-gray-200 rounded" />
            <div className="h-3 w-56 bg-gray-200 rounded" />
          </div>
          <div className="w-40 space-y-2">
            <div className="h-8 bg-gray-200 rounded-lg" />
            <div className="h-8 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
    <div className="h-14 bg-gray-50 border-t border-gray-200 animate-pulse" />
  </div>
);

/* ===================== Image Modal (đồng bộ với màn kia) ===================== */
const ImageModal = React.memo(({ isOpen, onClose, imageUrl, title }) => {
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) setImageLoading(true);
  }, [isOpen, imageUrl]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ZoomIn className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {title || "Xem ảnh"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              </div>
            )}
            <img
              src={imageUrl}
              alt="Preview"
              className={`w-full h-auto rounded-lg shadow-lg transition-opacity ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                setImageLoading(false);
                e.target.src =
                  "https://via.placeholder.com/800x600?text=Image+Not+Available";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
ImageModal.displayName = "ImageModal";

/* ===================== Main ===================== */
const PAGE_SIZES = [50, 100, 200];

const WarehouseList = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [error, setError] = useState(null);

  // input (chưa apply)
  const [searchTerm, setSearchTerm] = useState("");
  // filter (đã apply)
  const [filterTerm, setFilterTerm] = useState("");

  // detail & update
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateData, setUpdateData] = useState(null);

  // image modal
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageUrl: "",
    title: "",
  });

  const abortRef = useRef(null);

  const fetchWarehouses = useCallback(
    async (term = filterTerm) => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        const t = (term || "").trim();
        const searchParams = t ? { trackingCode: t } : {};

        const data = await warehouseService.getReadyWarehouses(
          currentPage,
          pageSize,
          searchParams,
          abortRef.current.signal,
        );

        if (abortRef.current.signal.aborted) return;

        setWarehouses(data?.content || []);
        setTotalPages(data?.totalPages || 0);
        setTotalElements(data?.totalElements || 0);
      } catch (e) {
        if (e?.name === "AbortError" || e?.code === "ERR_CANCELED") return;
        const errorMsg = e.response?.data?.message || "Error loading data!";
        setError(errorMsg);
        setWarehouses([]);
        setTotalPages(0);
        setTotalElements(0);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, filterTerm],
  );

  useEffect(() => {
    fetchWarehouses();
    return () => abortRef.current?.abort?.();
  }, [fetchWarehouses]);

  const handleSearch = () => {
    setCurrentPage(0);
    setFilterTerm(searchTerm.trim());
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilterTerm("");
    setCurrentPage(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const openDetail = (id) => {
    setDetailId(id);
    setDetailOpen(true);
  };
  const closeDetail = () => {
    setDetailOpen(false);
    setDetailId(null);
  };

  const openUpdate = (item) => {
    setUpdateData(item);
    setUpdateOpen(true);
  };
  const closeUpdate = () => {
    setUpdateOpen(false);
    setUpdateData(null);
  };

  const handleUpdateSuccess = () => {
    toast.success("Cập nhật thành công!");
    fetchWarehouses(filterTerm);
  };

  const openImageModal = (imageUrl, title) => {
    setImageModal({ isOpen: true, imageUrl, title });
  };
  const closeImageModal = () => {
    setImageModal({ isOpen: false, imageUrl: "", title: "" });
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  const canPrev = currentPage > 0;
  const canNext = currentPage < totalPages - 1;

  const showingFrom = totalElements ? currentPage * pageSize + 1 : 0;
  const showingTo = Math.min((currentPage + 1) * pageSize, totalElements);

  // (nếu backend không có totalElements, fallback theo length)
  const totalDisplay = totalElements || warehouses.length;

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header (đồng bộ) */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Warehouse size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Warehouse Management
              </h1>
            </div>

            <button
              onClick={() => fetchWarehouses(filterTerm)}
              disabled={loading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              type="button"
            >
              <RefreshCw size={16} />
              Tải lại
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 mb-6">
            <X className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Filters (đồng bộ) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by shipment code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-300 rounded-lg outline-none focus:ring-0 focus:border-blue-500 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      type="button"
                      title="Xóa"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                type="button"
              >
                <Search size={18} />
                Search
              </button>
            </div>

            {/* Page size buttons (đồng bộ) */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Show:
              </span>
              <div className="flex gap-2 flex-wrap">
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

        {/* Loading */}
        {loading && <TableSkeleton rows={8} />}

        {/* Empty */}
        {!loading && !error && warehouses.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Warehouse className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600 font-medium">
              {filterTerm
                ? `Không tìm thấy "${filterTerm}"`
                : "Không có dữ liệu"}
            </p>
            {filterTerm && (
              <button
                onClick={handleClearSearch}
                className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all"
                type="button"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && warehouses.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      No.
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Image
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Destination
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Shipment Code
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Order Code
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Customer Code
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Weight
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Net Weight
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Dim
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-semibold whitespace-nowrap">
                      Created
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {warehouses.map((item, idx) => {
                    const no = currentPage * pageSize + idx + 1;
                    const weight = toNum(item?.weight);
                    const netWeight = toNum(item?.netWeight);
                    const dim = toNum(item?.dim);

                    return (
                      <tr
                        key={item.warehouseId ?? `${item.trackingCode}-${idx}`}
                        className={`border-b border-gray-200 ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-4 text-gray-900 font-medium">
                          {no}
                        </td>

                        <td className="px-4 py-4">
                          {item.image ? (
                            <button
                              onClick={() =>
                                openImageModal(item.image, item.trackingCode)
                              }
                              className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-blue-500 transition-all group"
                              type="button"
                            >
                              <img
                                src={item.image}
                                alt={item.trackingCode}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/64x64?text=No+Image";
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          ) : (
                            <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                              <ImageIcon size={20} className="text-gray-400" />
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4 text-gray-900 font-medium whitespace-nowrap">
                          {item.destination || "-"}
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-semibold text-blue-700 whitespace-nowrap">
                            {item.trackingCode || "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                          {item.orderCode || "-"}
                        </td>

                        <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                          {item.customerCode || "-"}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">
                            {weight > 0 ? `${formatKg(weight)} kg` : "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">
                            {netWeight > 0 ? `${formatKg(netWeight)} kg` : "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">
                            {dim > 0 ? `${formatKg(dim)} kg` : "-"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                          {formatDate(item.createdAt)}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openDetail(item.warehouseId)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                              type="button"
                            >
                              <Eye size={14} />
                              View
                            </button>

                            <button
                              onClick={() => openUpdate(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                              type="button"
                            >
                              <Edit size={14} />
                              Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer (đồng bộ màn kia) */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                <div className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
                        {totalDisplay}
                      </span>{" "}
                      mục
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(0)}
                        disabled={!canPrev}
                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Trang đầu"
                        type="button"
                      >
                        <ChevronsLeft size={18} className="text-gray-700" />
                      </button>

                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(0, p - 1))
                        }
                        disabled={!canPrev}
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
                          {currentPage + 1} / {totalPages}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                        }
                        disabled={!canNext}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        type="button"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          Sau
                        </span>
                        <ChevronRight size={18} className="text-gray-700" />
                      </button>

                      <button
                        onClick={() => setCurrentPage(totalPages - 1)}
                        disabled={!canNext}
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
        )}
      </div>

      {/* Detail Modal */}
      <DetailWarehouse
        open={detailOpen}
        warehouseId={detailId}
        onClose={closeDetail}
      />

      {/* Update Modal */}
      <UpdateWarehouse
        isOpen={updateOpen}
        onClose={closeUpdate}
        warehouseData={updateData}
        onSuccess={handleUpdateSuccess}
      />

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
        imageUrl={imageModal.imageUrl}
        title={imageModal.title}
      />
    </div>
  );
};

export default WarehouseList;
