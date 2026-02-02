import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiBox,
  FiSearch,
  FiFilter,
  FiPackage,
  FiDollarSign,
  FiGrid,
  FiList,
  FiArrowLeft,
} from "react-icons/fi";
import {
  getAllProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
} from "../../Services/Manager/managerProductTypeService";
import ConfirmDialog from "../../common/ConfirmDialog";

const ManagerProductType = () => {
  const navigate = useNavigate();
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFee, setFilterFee] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [formData, setFormData] = useState({
    productTypeName: "",
    fee: false,
  });

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const fetchProductTypes = async () => {
    try {
      setLoading(true);
      const data = await getAllProductTypes();
      setProductTypes(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Có lỗi khi tải dữ liệu!");
      setProductTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading(
      editingId ? "Đang cập nhật..." : "Đang tạo mới...",
    );

    try {
      if (editingId) {
        const updatedData = { productTypeId: editingId, ...formData };
        setProductTypes((prev) =>
          prev.map((item) =>
            item.productTypeId === editingId ? { ...item, ...formData } : item,
          ),
        );
        await updateProductType(editingId, updatedData);
        toast.success("Cập nhật thành công!", { id: loadingToast });
      } else {
        const newItem = await createProductType(formData);
        setProductTypes((prev) => [...prev, newItem]);
        toast.success("Tạo mới thành công!", { id: loadingToast });
      }
      closeDialog();
    } catch (error) {
      console.error("Error submitting form:", error);
      let errorMessage = "Có lỗi xảy ra!";
      if (error?.response?.data) {
        errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          error.response.data.detail ||
          JSON.stringify(error.response.data);
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage, { id: loadingToast, duration: 5000 });
      if (editingId) fetchProductTypes();
    }
  };

  const closeDialog = () => {
    setFormData({ productTypeName: "", fee: false });
    setShowDialog(false);
    setEditingId(null);
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setFormData({ productTypeName: "", fee: false });
    setShowDialog(true);
  };

  const handleEdit = (item) => {
    setFormData({
      productTypeName: item.productTypeName,
      fee: item.fee,
    });
    setEditingId(item.productTypeId);
    setShowDialog(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      setProductTypes((prev) =>
        prev.filter((item) => item.productTypeId !== deleteId),
      );
      await deleteProductType(deleteId);
      toast.success("Xóa thành công!");
    } catch (error) {
      console.error("Error deleting:", error);
      let errorMessage = "Có lỗi xảy ra khi xóa!";
      if (error?.response?.data) {
        errorMessage =
          error.response.data.error ||
          error.response.data.message ||
          error.response.data.detail ||
          "Có lỗi xảy ra khi xóa!";
      }
      toast.error(errorMessage, { duration: 5000 });
      fetchProductTypes();
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const filteredProductTypes = productTypes.filter((item) => {
    const matchesSearch = item.productTypeName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFee =
      filterFee === "all" ||
      (filterFee === "free" && !item.fee) ||
      (filterFee === "paid" && item.fee);
    return matchesSearch && matchesFee;
  });

  const stats = {
    total: productTypes.length,
    free: productTypes.filter((item) => !item.fee).length,
    paid: productTypes.filter((item) => item.fee).length,
  };

  // Skeletons
  const TableSkeletonRows = () =>
    [...Array(6)].map((_, i) => (
      <tr key={i} className="animate-pulse">
        <td className="px-4 py-3">
          <div className="h-4 w-56 bg-slate-200 rounded" />
        </td>
        <td className="px-4 py-3 text-center">
          <div className="h-5 w-16 bg-slate-200 rounded mx-auto" />
        </td>
        <td className="px-4 py-3">
          <div className="h-8 w-28 bg-slate-200 rounded mx-auto" />
        </td>
      </tr>
    ));

  const GridSkeletonCards = () =>
    [...Array(8)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 animate-pulse"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 w-28 bg-slate-200 rounded" />
          <div className="h-5 w-14 bg-slate-200 rounded" />
        </div>
        <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-1/2 bg-slate-200 rounded mb-3" />
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <div className="h-8 w-full bg-slate-200 rounded" />
          <div className="h-8 w-full bg-slate-200 rounded" />
        </div>
      </div>
    ));

  const renderTableContent = () => {
    if (loading) return <TableSkeletonRows />;

    if (filteredProductTypes.length === 0) {
      return (
        <tr>
          <td colSpan="3" className="py-16">
            <div className="flex flex-col items-center gap-3">
              <FiBox className="w-16 h-16 text-slate-300" />
              <h3 className="text-slate-500 font-medium text-lg">
                {searchTerm || filterFee !== "all"
                  ? "Không tìm thấy"
                  : "Chưa có dữ liệu"}
              </h3>
              <p className="text-sm text-slate-400">
                {searchTerm || filterFee !== "all"
                  ? "Thử thay đổi bộ lọc"
                  : "Nhấn nút thêm để bắt đầu"}
              </p>
              {!searchTerm && filterFee === "all" && (
                <button
                  onClick={openCreateDialog}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-md hover:shadow-lg mt-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Thêm ngay
                </button>
              )}
            </div>
          </td>
        </tr>
      );
    }

    return filteredProductTypes.map((item) => (
      <tr
        key={item.productTypeId}
        className="hover:bg-blue-50/50 transition-colors"
      >
        <td className="px-4 py-3 font-semibold text-blue-700">
          {item.productTypeName}
        </td>

        <td className="px-4 py-3 text-center">
          {item.fee ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
              <FiDollarSign className="w-3 h-3" />
              Có phí
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
              <FiCheck className="w-3 h-3" />
              Miễn phí
            </span>
          )}
        </td>

        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(item)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg border border-amber-200 transition-all shadow-sm hover:shadow-md"
              title="Sửa"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
              Sửa
            </button>
            <button
              onClick={() => handleDelete(item.productTypeId)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg border border-red-200 transition-all shadow-sm hover:shadow-md"
              title="Xóa"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              Xóa
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  const renderGridView = () => {
    if (loading) return <GridSkeletonCards />;

    if (filteredProductTypes.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center gap-3 py-16">
          <FiBox className="w-16 h-16 text-slate-300" />
          <h3 className="text-slate-500 font-medium text-lg">
            {searchTerm || filterFee !== "all"
              ? "Không tìm thấy"
              : "Chưa có dữ liệu"}
          </h3>
          <p className="text-sm text-slate-400">
            {searchTerm || filterFee !== "all"
              ? "Thử thay đổi bộ lọc"
              : "Nhấn nút thêm để bắt đầu"}
          </p>
        </div>
      );
    }

    return filteredProductTypes.map((item) => (
      <div
        key={item.productTypeId}
        className="bg-white rounded-lg border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md transition-all overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiPackage className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            {item.fee ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                <FiDollarSign className="w-3 h-3" />
                Có phí
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                <FiCheck className="w-3 h-3" />
                Miễn phí
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-3 line-clamp-2">
            {item.productTypeName}
          </h3>

          <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
            <button
              onClick={() => handleEdit(item)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg border border-amber-200 transition-all shadow-sm hover:shadow-md"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
              Sửa
            </button>
            <button
              onClick={() => handleDelete(item.productTypeId)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg border border-red-200 transition-all shadow-sm hover:shadow-md"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              Xóa
            </button>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{ style: { fontSize: 12 } }}
      />

      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="mx-auto space-y-6">
          {/* ✅ Header với nút Back - VERSION 1 */}
          <div className="mb-6 md:mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-700 rounded-xl shadow-lg p-4 md:p-6">
              <div className="flex flex-col gap-4">
                {/* ✅ Back Button Row */}
                <div className="flex items-center">
                  <button
                    onClick={() => navigate("/manager/settings")}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200 shadow-sm hover:shadow-md border border-white/20"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Quay lại Cấu hình</span>
                  </button>
                </div>

                {/* ✅ Title Row */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Left side - Title */}
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-1.5 h-10 md:h-12 bg-white/90 rounded-full shrink-0 shadow-sm" />
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md">
                      <FiBox className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                        Quản Lý Loại Sản Phẩm
                      </h1>
                    </div>
                  </div>

                  {/* Right side - Actions */}
                  <button
                    onClick={openCreateDialog}
                    className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg border border-white/20"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span className="text-sm">Thêm loại sản phẩm</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Tổng
              </p>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">
                {stats.total}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Miễn phí
              </p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">
                {stats.free}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Có phí
              </p>
              <p className="text-2xl md:text-3xl font-bold text-amber-600">
                {stats.paid}
              </p>
            </div>
          </div>

          {/* Search & Filter Card */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên loại sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  <select
                    value={filterFee}
                    onChange={(e) => setFilterFee(e.target.value)}
                    className="pl-9 pr-8 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer appearance-none"
                  >
                    <option value="all">Tất cả</option>
                    <option value="free">Miễn phí</option>
                    <option value="paid">Có phí</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === "table"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Xem dạng bảng"
                  >
                    <FiList className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === "grid"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Xem dạng lưới"
                  >
                    <FiGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {(searchTerm || filterFee !== "all") && (
              <div className="flex items-center flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200">
                <span className="text-xs font-semibold text-slate-600">
                  Bộ lọc:
                </span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                    "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="hover:bg-blue-200 rounded p-0.5 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filterFee !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                    {filterFee === "free" ? "Miễn phí" : "Có phí"}
                    <button
                      onClick={() => setFilterFee("all")}
                      className="hover:bg-purple-200 rounded p-0.5 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Content - Table or Grid */}
          {viewMode === "table" ? (
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden relative">
              <div className="px-4 md:px-6 py-4 bg-slate-50 border-b border-slate-200">
                {loading ? (
                  <div className="h-4 w-56 bg-slate-200 rounded animate-pulse" />
                ) : (
                  <div className="text-sm md:text-base font-medium text-slate-700">
                    Hiển thị{" "}
                    <span className="text-lg font-bold text-blue-600">
                      {filteredProductTypes.length}
                    </span>{" "}
                    /{" "}
                    <span className="font-semibold text-slate-900">
                      {stats.total}
                    </span>{" "}
                    loại
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <tr>
                      <Th>Tên loại</Th>
                      <Th className="text-center">Phí</Th>
                      <Th className="text-center">Thao tác</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {renderTableContent()}
                  </tbody>
                </table>
              </div>

              {deleteLoading && (
                <div className="absolute inset-x-0 bottom-0 bg-white/90 flex items-center justify-center py-4 rounded-b-xl border-t border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
                    <span className="text-red-600 text-sm font-medium">
                      Đang xóa...
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {renderGridView()}
            </div>
          )}
        </div>

        {/* Modal */}
        {showDialog && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={closeDialog}
          >
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiBox className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900">
                    {editingId
                      ? "Cập nhật loại sản phẩm"
                      : "Thêm loại sản phẩm mới"}
                  </h3>
                </div>
                <button
                  onClick={closeDialog}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Đóng"
                >
                  <FiX className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên loại sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiPackage className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                    <input
                      type="text"
                      name="productTypeName"
                      value={formData.productTypeName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: Điện tử, Thời trang..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Trạng thái phí <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        !formData.fee
                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="feeOption"
                        checked={!formData.fee}
                        onChange={() =>
                          setFormData((prev) => ({ ...prev, fee: false }))
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
                          !formData.fee
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        <FiCheck
                          className={`w-6 h-6 ${
                            !formData.fee ? "text-white" : "text-transparent"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          !formData.fee ? "text-emerald-700" : "text-slate-600"
                        }`}
                      >
                        Miễn phí
                      </span>
                    </label>

                    <label
                      className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.fee
                          ? "border-amber-500 bg-amber-50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="feeOption"
                        checked={formData.fee}
                        onChange={() =>
                          setFormData((prev) => ({ ...prev, fee: true }))
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
                          formData.fee
                            ? "border-amber-500 bg-amber-500"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        <FiDollarSign
                          className={`w-6 h-6 ${
                            formData.fee ? "text-white" : "text-transparent"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          formData.fee ? "text-amber-700" : "text-slate-600"
                        }`}
                      >
                        Có phí
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-5 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-sm"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-md hover:shadow-lg"
                  >
                    <FiCheck className="w-4 h-4" />
                    {editingId ? "Cập nhật" : "Lưu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setDeleteId(null);
          }}
          onConfirm={confirmDelete}
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa loại sản phẩm này không?"
          confirmText="Xóa"
          cancelText="Hủy"
          loading={deleteLoading}
          type="danger"
        />
      </div>
    </>
  );
};

// Table Header Component
const Th = ({ children, className = "" }) => (
  <th
    className={`px-4 py-3 text-left font-bold text-sm uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

export default ManagerProductType;
